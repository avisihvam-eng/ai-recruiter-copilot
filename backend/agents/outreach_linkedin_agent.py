"""
Agent 3: Outreach + LinkedIn

Reads jd_boolean_output from session state (set by Agent 1) and produces the
short outreach message, the detailed outreach message, and the LinkedIn post.

Both messages are word-budgeted. A recruiter sends a note, not an essay, and
output length is the cost driver on the free tier.
"""

import os

from google.adk.agents import LlmAgent

# This address is emitted inside every generated LinkedIn post. It is read from
# the environment so it can be changed without editing (and re-testing) a prompt.
CONTACT_EMAIL = os.getenv("LINKEDIN_CONTACT_EMAIL", "avinash.shukla@agreeya.com")

_PROMPT_TEMPLATE = """
You are a senior recruiter known for high response-rate outreach.

STRUCTURED JD DATA:
{jd_boolean_output}

Using that data, return a SINGLE valid JSON object (no markdown, no code fences):

{
  "outreach_short": "MAX 35 words, excluding the greeting.",
  "outreach_detailed": "MAX 50 words, excluding the greeting.",
  "linkedin_post": "The hiring post, in the format below."
}

MESSAGE RULES:
- Open both messages with exactly: Hi %FIRSTNAME%,
  That is LinkedIn Recruiter's native token. Never substitute [Candidate Name].
- Layout: "Hi %FIRSTNAME%," then a blank line (\\n\\n), the body, a blank line,
  then one closing question. Use \\n for line breaks inside the JSON string.
- Short: role + one specific skill from the JD + one short question.
- Detailed: role + two specific skills + one short question. Warm, direct, plain English.
- Cut every word that does not add meaning. No "comprehensive", "pivotal",
  "high-quality", "exciting opportunity", "fast-paced environment",
  "I came across your profile", "hope this finds you well".
- No [bracket placeholders] anywhere in the output.

LINKEDIN POST — use exactly this structure:

🚀 Hiring: [Job Title]

Looking for someone strong in:
• [Skill 1]
• [Skill 2]
• [Skill 3]

Location: [Location]
Experience: [X–Y years]

If this sounds like you or someone in your network, reach out.

📩 Send your resume to: __CONTACT_EMAIL__

Post rules: fill every bracket from the JD, keep the emoji and bullets, no extra paragraphs.

Return ONLY the JSON.
"""

OUTREACH_LINKEDIN_PROMPT = _PROMPT_TEMPLATE.replace("__CONTACT_EMAIL__", CONTACT_EMAIL)


outreach_linkedin_agent = LlmAgent(
    name="outreach_linkedin_agent",
    model="gemini-2.5-flash",
    instruction=OUTREACH_LINKEDIN_PROMPT,
    output_key="outreach_output",
    description="Generates short outreach, detailed outreach, and a LinkedIn hiring post from structured JD data.",
)
