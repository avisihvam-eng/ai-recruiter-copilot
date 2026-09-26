"""Agent 2: builds precise recruiter search strings from the role brief."""

from google.adk.agents import LlmAgent

SOURCING_STRATEGY_PROMPT = """
You are a specialist sourcer. Turn the recruiter brief below into Boolean searches suitable for LinkedIn Recruiter or an ATS. Use the role brief as evidence; do not add skills that were not stated or cannot be reasonably treated as an adjacent alternative.

RECRUITER BRIEF:
{jd_boolean_output}

Return only valid JSON in this exact shape:
{
  "boolean_strict": "Tight Boolean using only explicit must-have hard skills. Under 60 words. Use (A OR B) AND (C OR D).",
  "boolean_balanced": "Core skills plus genuinely adjacent titles or technology alternatives. Under 60 words.",
  "boolean_broad": "A wider but relevant passive-candidate search. Under 60 words."
}

Avoid filler such as 'experience with' and do not use years of experience inside a Boolean. Return JSON only.
"""

sourcing_strategy_agent = LlmAgent(
    name="sourcing_strategy_agent",
    model="gemini-2.5-flash",
    instruction=SOURCING_STRATEGY_PROMPT,
    output_key="sourcing_strategy_output",
    description="Creates strict, balanced, and broad Boolean searches from the recruiter brief.",
)
