"""
Agent 1: Role Brief

Reads raw_jd from session state and outputs the structured recruiter brief as
JSON, written to the `jd_boolean_output` key.

Naming note: this module is called `jd_boolean_agent` for historical reasons. It
does not produce Boolean strings — `sourcing_strategy_agent` (Agent 2) does.

Output is word-budgeted on purpose. The free tier is request- and token-limited,
and every extra clause here is also four times the input cost for the three
agents downstream that interpolate this JSON.
"""

from google.adk.agents import LlmAgent

JD_BOOLEAN_PROMPT = """
You are an expert technical recruiter. Turn the raw job description below into a concise structured brief.

RAW JD:
{raw_jd}

The source job description is a recruiter-owned document. Do not invent requirements, seniority, location, compensation, clearance, work authorization, or benefits. Do not rewrite the source; the brief is a separate planning aid.

Return a SINGLE valid JSON object (no markdown, no code fences) with exactly this shape:

{
  "clean_jd": {
    "title": "Job title, exactly as the JD states it",
    "location": "City, State or Remote",
    "experience": "e.g. 5-8 years",
    "objective": "Two sentences, max 35 words. What this person does and the value they deliver.",
    "responsibilities": [
      "3-5 items. Begin with an action verb. Max 10 words each."
    ],
    "required_skills": [
      "4-6 items. Skill plus a short qualifier from the JD. Max 12 words each. Never a bare keyword."
    ],
    "preferred_skills": [
      "2-3 items, same format. Max 12 words each. Only what the JD states or clearly implies; label an inference as 'Inferred:'."
    ]
  }
}

RULES:
1. "objective" — exactly two sentences, no bullet points. Write like a person, not a job board.
2. "responsibilities" — the JOB DUTIES, never empty. Pull them from the duties / "what you'll do" / role overview. If none are explicit, derive them from the summary without adding new scope.
3. "required_skills" — a skill with enough context to be useful ("Python for monitoring automation", not "Python", not a full paragraph).
4. Every item must fit its word budget. Cut the word, keep the meaning. No filler ("comprehensive", "pivotal", "high-quality").
5. Title, location and experience must be copied from the JD, not inferred.

Return ONLY the JSON.
"""

jd_boolean_agent = LlmAgent(
    name="jd_boolean_agent",
    model="gemini-2.5-flash",
    instruction=JD_BOOLEAN_PROMPT,
    output_key="jd_boolean_output",
    description="Builds a format-preserving recruiter brief without modifying the source JD.",
)
