"""
Agent 2: Outreach + LinkedIn Agent
Reads jd_boolean_output from session state (set by Agent 1).
Outputs: short outreach, detailed outreach, LinkedIn hiring post.
"""

from google.adk.agents import LlmAgent

OUTREACH_LINKEDIN_PROMPT = """
You are a senior recruiter known for high response-rate outreach messages and compelling LinkedIn posts.

You have access to the structured job data from the previous agent:

STRUCTURED JD DATA:
{jd_boolean_output}

Using that data, generate a SINGLE valid JSON object (no markdown, no code blocks, just raw JSON):

{
  "outreach_short": "Short outreach message — under 80 words. Direct, personalized, focused on candidate benefit. No fluff.",
  "outreach_detailed": "Detailed outreach message — under 150 words. Include role context, team, opportunity. Professional but warm. Not salesy.",
  "linkedin_post": "Full LinkedIn hiring post following the exact format below."
}

LINKEDIN POST FORMAT (use exactly this structure, fill in from JD data):

🚀 Hiring: [Job Title]

Looking for someone strong in:
• [Top Skill 1]
• [Top Skill 2]
• [Top Skill 3]

Location: [Location]
Experience: [X–Y years]

If this sounds like you or someone in your network, feel free to reach out.

📩 Send your resume to: avinash.shukla@agreeya.com

Let's connect.

OUTREACH RULES:
- Short outreach: under 80 words, punchy, direct, high response rate
- Detailed outreach: under 150 words, warm but professional, not salesy
- LinkedIn post: use emoji, bullet points, exactly the format above
- Do NOT use generic phrases like "exciting opportunity" or "fast-paced environment"
- Sound like a real recruiter, not a template

Return ONLY the JSON. No explanation. No markdown.
"""


outreach_linkedin_agent = LlmAgent(
    name="outreach_linkedin_agent",
    model="gemini-2.5-flash",
    instruction=OUTREACH_LINKEDIN_PROMPT,
    output_key="outreach_output",
    description="Generates short outreach, detailed outreach, and a LinkedIn hiring post from structured JD data.",
)
