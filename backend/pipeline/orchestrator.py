"""
Orchestrator: Assembles the SequentialAgent pipeline and provides
an async run_pipeline() function for the API layer to call.
"""

import json
import os
import re
from dotenv import load_dotenv
from pathlib import Path
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


# ── Public API ─────────────────────────────────────────────────────────────────

async def run_pipeline(raw_jd: str, api_key: str | None = None) -> dict:
    """
    Run the recruiter pipeline for a given raw JD.

    Args:
        raw_jd:  The raw job description text pasted by the user.
        api_key: Optional Gemini API key. Falls back to GOOGLE_API_KEY env var.

    Returns:
        dict with keys: clean_jd, booleans, outreach, linkedin_post
    """
    # Set API key for this request if provided
    effective_key = api_key or os.getenv("GOOGLE_API_KEY", "")
    if not effective_key:
        raise ValueError("No Gemini API key provided. Set GOOGLE_API_KEY or pass api_key in request.")

    os.environ["GOOGLE_API_KEY"] = effective_key

    # Create a unique session per request
    import uuid
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

    # Run the pipeline (async generator — drain it)
    async for _event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=user_message,
    ):
        pass  # We only need the final session state

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

    clean_jd = jd_data.get("clean_jd", {})
    # Normalize: accept both "duties" and "responsibilities" from the LLM
    if "duties" in clean_jd and "responsibilities" not in clean_jd:
        clean_jd["responsibilities"] = clean_jd.pop("duties")

    short_outreach = outreach_data.get("outreach_short", "")
    detailed_outreach = outreach_data.get("outreach_detailed", "")

    # Clean up any candidate name placeholder variations to %FIRSTNAME%
    name_patterns = [
        r"Hi\s+\[?Candidate(?:\s+Name)?\]?,?",
        r"Hi\s+\[?First\s+Name\]?,?",
        r"Hi\s+\[?Name\]?,?",
    ]
    for pattern in name_patterns:
        short_outreach = re.sub(pattern, "Hi %FIRSTNAME%,", short_outreach, flags=re.IGNORECASE)
        detailed_outreach = re.sub(pattern, "Hi %FIRSTNAME%,", detailed_outreach, flags=re.IGNORECASE)

    # Standard string replacement for other curly/bracket types
    for key in ["[Candidate Name]", "[Candidate's Name]", "{{firstName}}", "{{first_name}}", "{{ firstName }}", "%first_name%"]:
        short_outreach = short_outreach.replace(key, "%FIRSTNAME%")
        detailed_outreach = detailed_outreach.replace(key, "%FIRSTNAME%")

    return {
        "clean_jd": clean_jd,
        "booleans": {
            "strict": sourcing_data.get("boolean_strict", ""),
            "balanced": sourcing_data.get("boolean_balanced", ""),
            "broad": sourcing_data.get("boolean_broad", ""),
        },
        "outreach": {
            "short": short_outreach,
            "detailed": detailed_outreach,
        },
        "linkedin_post": outreach_data.get("linkedin_post", ""),
        "recruiter_brief": advisor_data,
    }
