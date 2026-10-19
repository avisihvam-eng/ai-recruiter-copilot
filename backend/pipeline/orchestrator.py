"""
Orchestrator: Assembles the SequentialAgent pipeline and provides
an async run_pipeline() function for the API layer to call.
"""

import asyncio
import json
import os
import re
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

from google.adk.agents import SequentialAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from backend.agents.jd_boolean_agent import jd_boolean_agent
from backend.agents.outreach_linkedin_agent import outreach_linkedin_agent
from backend.agents.recruiter_advisor_agent import recruiter_advisor_agent
from backend.agents.sourcing_strategy_agent import sourcing_strategy_agent

# ── Pipeline assembly ──────────────────────────────────────────────────────────

recruiter_pipeline = SequentialAgent(
    name="recruiter_pipeline",
    sub_agents=[jd_boolean_agent, sourcing_strategy_agent, outreach_linkedin_agent, recruiter_advisor_agent],
    description="Runs recruiter brief, sourcing strategy, candidate engagement, and recruiter decision support.",
)

# Singleton session service (in-memory, stateless per request)
_session_service = InMemorySessionService()

APP_NAME = "ai_recruiter_copilot"

# The google-genai SDK reads GOOGLE_API_KEY from the process environment, so a
# caller-supplied key has to be installed process-wide. That is only safe if
# runs do not interleave — otherwise one request can overwrite another's key
# mid-flight (the previous implementation did exactly that, silently). This lock
# serialises only the agent execution, not the retry backoff.
_key_lock = asyncio.Lock()

MAX_RETRIES = 3


@asynccontextmanager
async def _installed_api_key(key: str):
    """Temporarily install ``key`` as the process API key, then restore."""
    async with _key_lock:
        previous = os.environ.get("GOOGLE_API_KEY")
        os.environ["GOOGLE_API_KEY"] = key
        try:
            yield
        finally:
            if previous is None:
                os.environ.pop("GOOGLE_API_KEY", None)
            else:
                os.environ["GOOGLE_API_KEY"] = previous


def _is_rate_limit(error: Exception) -> bool:
    text = str(error)
    return "429" in text or "RESOURCE_EXHAUSTED" in text


# ── Progress stages ────────────────────────────────────────────────────────────
#
# These ids are the contract with the frontend: they match the section ids in
# frontend/src/lib/sections.js, so a progress row and the finished asset it turns
# into share one name and can never drift apart.
#
# Two assets — the outreach messages and the LinkedIn post — come out of a single
# agent in a single call, so they share one entry. Marking one "done" while the
# other was still being written would be a lie.
#
# Order matters. ADK hands over from one agent to the next and emits exactly one
# event per agent, at the moment that agent *finishes*. So an event from entry N
# means N is done and N+1 has just started — which is why the first entry is
# marked running before the run begins, and nothing is inferred from event
# arrival times.
PIPELINE_STAGES = [
    {"ids": ["role-brief"], "agent": "jd_boolean_agent"},
    {"ids": ["search-strings"], "agent": "sourcing_strategy_agent"},
    {"ids": ["outreach", "linkedin-post"], "agent": "outreach_linkedin_agent"},
    {"ids": ["recruiter-prep"], "agent": "recruiter_advisor_agent"},
]

_STAGE_INDEX_BY_AGENT = {stage["agent"]: i for i, stage in enumerate(PIPELINE_STAGES)}


async def _noop_event(_payload: dict) -> None:
    """Default progress sink, so callers that do not stream need no callback."""


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """
    Robustly extract a JSON object from a string that may contain
    markdown fences or extra whitespace.
    """
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    text = text.rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find the first {...} block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse JSON from agent output: {text[:200]}")


_NAME_PATTERNS = [
    r"Hi\s+\[?Candidate(?:\s+Name)?\]?,?",
    r"Hi\s+\[?First\s+Name\]?,?",
    r"Hi\s+\[?Name\]?,?",
]

_OTHER_NAME_TOKENS = [
    "[Candidate Name]",
    "[Candidate's Name]",
    "{{firstName}}",
    "{{first_name}}",
    "{{ firstName }}",
    "%first_name%",
    "{first_name}",
    "[First Name]",
]


def _normalise_firstname(text: str) -> str:
    """
    Collapse every candidate-name placeholder the model might invent onto
    LinkedIn Recruiter's native %FIRSTNAME% token, which is the only one that
    actually personalises when the message is sent.
    """
    if not text:
        return text
    for pattern in _NAME_PATTERNS:
        text = re.sub(pattern, "Hi %FIRSTNAME%,", text, flags=re.IGNORECASE)
    for token in _OTHER_NAME_TOKENS:
        text = text.replace(token, "%FIRSTNAME%")
    return text


def _normalise_clean_jd(clean_jd: dict) -> dict:
    """Accept both "duties" and "responsibilities" from the LLM."""
    if "duties" in clean_jd and "responsibilities" not in clean_jd:
        clean_jd["responsibilities"] = clean_jd.pop("duties")
    return clean_jd


def _structured_jd_state(clean_jd: dict | None, booleans: dict | None) -> str:
    """
    Rebuild the blob Agent 1 would have written, so a single agent can be re-run
    on its own without paying to re-run the agents before it. The shape mirrors
    Agent 1's output keys exactly, because the downstream prompts interpolate
    this text verbatim.
    """
    structured = {"clean_jd": clean_jd or {}}
    if booleans:
        structured["boolean_strict"] = booleans.get("strict", "")
        structured["boolean_balanced"] = booleans.get("balanced", "")
        structured["boolean_broad"] = booleans.get("broad", "")
    return json.dumps(structured)


# ── Pipeline ───────────────────────────────────────────────────────────────────

async def run_pipeline(raw_jd: str, api_key: str | None = None, on_event=None) -> dict:
    """
    Run the recruiter pipeline for a given raw JD.

    Args:
        raw_jd:   The raw job description text pasted by the user.
        api_key:  Optional Gemini API key. Falls back to GOOGLE_API_KEY env var.
        on_event: Optional async callback receiving progress dicts, e.g.
                  {"type": "stage", "id": "role-brief", "state": "running"}.

    Returns:
        dict with keys: clean_jd, booleans, outreach, linkedin_post
    """
    emit = on_event or _noop_event

    effective_key = api_key or os.getenv("GOOGLE_API_KEY", "")
    if not effective_key:
        raise ValueError("No Gemini API key provided. Set GOOGLE_API_KEY or pass api_key in request.")

    # Create a unique session per request
    session_id = str(uuid.uuid4())
    user_id = "recruiter"

    session = await _session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
        state={"raw_jd": raw_jd},
    )

    runner = Runner(
        agent=recruiter_pipeline,
        app_name=APP_NAME,
        session_service=_session_service,
    )

    # Kick off the pipeline with a minimal user message
    user_message = types.Content(
        role="user",
        parts=[types.Part(text=f"Process this job description:\n\n{raw_jd}")],
    )

    # Run the pipeline with retry for Gemini rate limits (429).
    # The key is installed only for the duration of each attempt, and the
    # backoff sleep happens outside the lock so a rate-limited request cannot
    # block everyone else.
    for attempt in range(MAX_RETRIES + 1):
        # Index of the last agent known to have finished. A 429 restarts the
        # whole pipeline, so progress restarts with it — and the UI is told,
        # rather than watching rows tick backwards for no visible reason.
        finished_through = -1

        try:
            # The first agent is running the moment we start.
            for stage_id in PIPELINE_STAGES[0]["ids"]:
                await emit({"type": "stage", "id": stage_id, "state": "running"})

            async with _installed_api_key(effective_key):
                async for event in runner.run_async(
                    user_id=user_id,
                    session_id=session_id,
                    new_message=user_message,
                ):
                    index = _STAGE_INDEX_BY_AGENT.get(getattr(event, "author", None))
                    if index is None or index <= finished_through:
                        continue

                    # This agent has just finished, which means the next one has
                    # just started.
                    for stage_id in PIPELINE_STAGES[index]["ids"]:
                        await emit({"type": "stage", "id": stage_id, "state": "done"})
                    finished_through = index

                    following = index + 1
                    if following < len(PIPELINE_STAGES):
                        for stage_id in PIPELINE_STAGES[following]["ids"]:
                            await emit({"type": "stage", "id": stage_id, "state": "running"})

            # Anything after the last observed event is done too. Normally that
            # is nothing, but the final agent's event is not worth depending on
            # when the run has clearly succeeded.
            for index in range(finished_through + 1, len(PIPELINE_STAGES)):
                for stage_id in PIPELINE_STAGES[index]["ids"]:
                    await emit({"type": "stage", "id": stage_id, "state": "done"})
            break  # Success — exit retry loop
        except Exception as e:
            if _is_rate_limit(e) and attempt < MAX_RETRIES:
                await emit({"type": "retry", "attempt": attempt + 1})
                await asyncio.sleep(10 * (2 ** attempt))  # 10s, 20s, 40s
                # Recreate session for retry (state is reset)
                session = await _session_service.create_session(
                    app_name=APP_NAME,
                    user_id=user_id,
                    session_id=f"{session_id}_r{attempt+1}",
                    state={"raw_jd": raw_jd},
                )
                session_id = session.id
                continue
            raise  # Non-retryable error or out of retries

    # Retrieve updated session state
    final_session = await _session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )
    state = final_session.state

    # Parse Agent 1 output
    jd_raw = state.get("jd_boolean_output", "{}")
    jd_data = _extract_json(jd_raw) if isinstance(jd_raw, str) else jd_raw

    # Parse Agent 2 output
    sourcing_raw = state.get("sourcing_strategy_output", "{}")
    sourcing_data = _extract_json(sourcing_raw) if isinstance(sourcing_raw, str) else sourcing_raw

    # Parse Agent 3 output
    outreach_raw = state.get("outreach_output", "{}")
    outreach_data = _extract_json(outreach_raw) if isinstance(outreach_raw, str) else outreach_raw

    # Parse Agent 4 output
    advisor_raw = state.get("recruiter_advisor_output", "{}")
    advisor_data = _extract_json(advisor_raw) if isinstance(advisor_raw, str) else advisor_raw

    clean_jd = _normalise_clean_jd(jd_data.get("clean_jd", {}))

    return {
        "clean_jd": clean_jd,
        "booleans": {
            "strict": sourcing_data.get("boolean_strict", ""),
            "balanced": sourcing_data.get("boolean_balanced", ""),
            "broad": sourcing_data.get("boolean_broad", ""),
        },
        "outreach": {
            "short": _normalise_firstname(outreach_data.get("outreach_short", "")),
            "detailed": _normalise_firstname(outreach_data.get("outreach_detailed", "")),
        },
        "linkedin_post": outreach_data.get("linkedin_post", ""),
        "recruiter_brief": advisor_data,
    }


# ── Single-asset regeneration ──────────────────────────────────────────────────
#
# Re-running the whole four-agent pipeline to change one message would cost the
# user four model calls and a minute of waiting for a change that needs one
# call. Each asset below is produced by exactly one agent, so we run just that
# agent in a throwaway session seeded with the data it expects to interpolate.

_ASSET_AGENTS = {
    "role-brief": jd_boolean_agent,
    "search-strings": sourcing_strategy_agent,
    "outreach": outreach_linkedin_agent,
    "linkedin-post": outreach_linkedin_agent,
    "recruiter-prep": recruiter_advisor_agent,
}

_ASSET_OUTPUT_KEYS = {
    "role-brief": "jd_boolean_output",
    "search-strings": "sourcing_strategy_output",
    "outreach": "outreach_output",
    "linkedin-post": "outreach_output",
    "recruiter-prep": "recruiter_advisor_output",
}

_ASSET_LABELS = {
    "role-brief": "formatted job description",
    "search-strings": "Boolean search strings",
    "outreach": "outreach messages",
    "linkedin-post": "LinkedIn post",
    "recruiter-prep": "recruiter intake brief",
}

REGENERATABLE_ASSETS = tuple(_ASSET_AGENTS)


def _regeneration_prompt(asset: str) -> str:
    return (
        f"Regenerate the {_ASSET_LABELS.get(asset, asset)} for this job.\n\n"
        "Follow the required output format exactly and return only the JSON object."
    )


async def _run_single_agent(
    agent,
    session_state: dict,
    user_text: str,
    effective_key: str,
) -> dict:
    """Run one agent in a fresh session and return its resulting session state."""
    session_id = str(uuid.uuid4())
    user_id = "recruiter"

    async def new_session(sid: str):
        return await _session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=sid,
            state=dict(session_state),
        )

    await new_session(session_id)
    runner = Runner(agent=agent, app_name=APP_NAME, session_service=_session_service)
    message = types.Content(role="user", parts=[types.Part(text=user_text)])

    for attempt in range(MAX_RETRIES + 1):
        try:
            async with _installed_api_key(effective_key):
                async for _event in runner.run_async(
                    user_id=user_id,
                    session_id=session_id,
                    new_message=message,
                ):
                    pass
            break
        except Exception as e:
            if _is_rate_limit(e) and attempt < MAX_RETRIES:
                await asyncio.sleep(10 * (2 ** attempt))
                session_id = f"{session_id}_r{attempt+1}"
                await new_session(session_id)
                continue
            raise

    final_session = await _session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )
    return final_session.state


async def regenerate_asset(
    asset: str,
    raw_jd: str,
    clean_jd: dict | None = None,
    booleans: dict | None = None,
    api_key: str | None = None,
) -> dict:
    """
    Re-run the single agent that produces ``asset`` and return just that asset,
    shaped exactly like the corresponding slice of run_pipeline()'s result.
    """
    if asset not in _ASSET_AGENTS:
        raise ValueError(f"Unknown asset '{asset}'.")

    effective_key = api_key or os.getenv("GOOGLE_API_KEY", "")
    if not effective_key:
        raise ValueError("No Gemini API key provided. Set GOOGLE_API_KEY or pass api_key in request.")

    if asset == "role-brief":
        state = {"raw_jd": raw_jd}
    else:
        state = {"raw_jd": raw_jd, "jd_boolean_output": _structured_jd_state(clean_jd, booleans)}

    output_key = _ASSET_OUTPUT_KEYS[asset]
    final_state = await _run_single_agent(
        agent=_ASSET_AGENTS[asset],
        session_state=state,
        user_text=_regeneration_prompt(asset),
        effective_key=effective_key,
    )

    raw = final_state.get(output_key, "{}")
    data = _extract_json(raw) if isinstance(raw, str) else raw

    if asset == "role-brief":
        return {"clean_jd": _normalise_clean_jd(data.get("clean_jd", {}))}

    if asset == "search-strings":
        return {
            "booleans": {
                "strict": data.get("boolean_strict", ""),
                "balanced": data.get("boolean_balanced", ""),
                "broad": data.get("boolean_broad", ""),
            }
        }

    if asset == "outreach":
        return {
            "outreach": {
                "short": _normalise_firstname(data.get("outreach_short", "")),
                "detailed": _normalise_firstname(data.get("outreach_detailed", "")),
            }
        }

    if asset == "linkedin-post":
        return {"linkedin_post": data.get("linkedin_post", "")}

    return {"recruiter_brief": data}
