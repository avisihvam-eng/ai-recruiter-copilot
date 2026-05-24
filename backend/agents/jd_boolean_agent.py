"""
Agent 1: JD + Boolean Agent
Reads raw_jd from session state, outputs structured JD + 3 Boolean strings.
"""

from google.adk.agents import LlmAgent

JD_BOOLEAN_PROMPT = """
You are an expert technical recruiter with 10+ years of sourcing experience.

You will receive a raw job description below:

RAW JD:
{raw_jd}

Your task is to process this JD and return a SINGLE valid JSON object (no markdown, no code blocks, just raw JSON).

The JSON must match this exact structure:
{
  "clean_jd": {
    "title": "Job title extracted from JD",
    "location": "City, State or Remote",
    "experience": "e.g. 5-8 years",
    "objective": "2-3 sentence paragraph. What this person does, the environment they work in, and the value they deliver. Professional, human-readable. No bullet points.",
    "responsibilities": [
      "Begin each with an action verb. Keep to one focused idea per bullet. 4-6 items max."
    ],
    "required_skills": [
      "Each item is a full descriptive sentence: state the skill, the expected proficiency level, and any relevant context from the JD. Not bare keywords. 5-8 items."
    ],
    "preferred_skills": [
      "Each item is a full descriptive sentence describing a nice-to-have skill with context. If the JD does not explicitly list preferred skills, infer 2-3 from adjacent domain knowledge (e.g. industry exposure, soft skills, certifications). 2-4 items."
    ]
  },
  "boolean_strict": "Tight Boolean using only must-have hard skills. Under 60 words. Use (A OR B) AND (C OR D) format. No filler words.",
  "boolean_balanced": "Balanced Boolean — core skills with some flexibility. Under 60 words.",
  "boolean_broad": "Broad Boolean to surface passive candidates. Include adjacent skills. Under 60 words."
}

CRITICAL FORMATTING RULES:
1. "objective" — exactly 2-3 sentences. Do NOT use bullet points. Write like a human, not a job board.
2. "responsibilities" — 4-6 items. Each starts with a strong action verb (Monitor, Build, Collaborate, etc). One idea per bullet. Do not pad.
3. "required_skills" — NEVER use bare keywords like "Python" or "SQL". Each item MUST be a complete sentence that names the skill AND describes the expected proficiency or use case from the JD. Example: "Hands-on experience with Python or PowerShell for monitoring automation and configuration scripting tasks."
4. "preferred_skills" — same sentence format as required_skills. If not stated in JD, intelligently infer 2-3 based on the role and domain.
5. Overall length: balanced. Structured. Not a wall of text. Every word must earn its place.

BOOLEAN RULES:
- Keep each under 60 words
- Use OR inside parentheses for synonyms: (ServiceNow OR Remedy OR Jira)
- Use AND to connect skill groups
- No filler words (no "experience with", "knowledge of", "years of")
- Copy-paste ready for LinkedIn Recruiter or JobDiva ATS
- Strict = tightest match, Broad = most candidates

Return ONLY the JSON. No explanation. No markdown. No code fences.
"""


jd_boolean_agent = LlmAgent(
    name="jd_boolean_agent",
    model="gemini-2.5-flash",
    instruction=JD_BOOLEAN_PROMPT,
    output_key="jd_boolean_output",
    description="Cleans a raw JD into four structured sections and generates Boolean search strings.",
)
