"""Agent 4: turns the role brief into recruiter decision support."""

from google.adk.agents import LlmAgent

# Deliberately budgeted, not just "keep it short": output tokens are the scarce
# resource on the free tier. One sentence, three questions and two watch-outs is
# enough to run an intake call, and it is roughly 60% less text than the four
# questions and three watch-outs this agent used to return.
RECRUITER_ADVISOR_PROMPT = """
You are a pragmatic recruiting lead preparing a recruiter for an intake call. The JD data below is the only evidence. Do not invent requirements, culture claims, compensation, visas, clearance, or location flexibility.

STRUCTURED JD DATA:
{jd_boolean_output}

Return one valid JSON object only, in this exact shape:
{
  "ideal_candidate": "One sentence, max 22 words: the strongest plausible profile, using only JD evidence.",
  "screening_questions": [
    "Three open questions, max 14 words each, testing the highest-signal requirements. No yes/no questions, no JD wording repeated."
  ],
  "watchouts": [
    "Two items, max 12 words each, naming what the JD leaves open and needs confirming. Never guess."
  ]
}

Specific, neutral, evidence-based. Return JSON only.
"""

recruiter_advisor_agent = LlmAgent(
    name="recruiter_advisor_agent",
    model="gemini-2.5-flash",
    instruction=RECRUITER_ADVISOR_PROMPT,
    output_key="recruiter_advisor_output",
    description="Creates evidence-based candidate-fit guidance and intake questions for the recruiter.",
)
