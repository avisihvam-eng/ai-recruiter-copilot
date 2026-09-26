# AI Recruiter Copilot

A four-agent recruiter workflow powered by **Google ADK** + **Gemini 2.5 Flash**.

Paste a raw job description → get a clean JD, Boolean search strings, outreach copy, and a LinkedIn hiring post in one run.

---

## Architecture

```
User pastes JD → FastAPI → ADK SequentialAgent

  Agent 1 · role_brief_agent
    Creates a separate recruiter brief while preserving the submitted JD unchanged

  Agent 2 · sourcing_strategy_agent
    Builds Strict / Balanced / Broad Boolean searches

  Agent 3 · outreach_linkedin_agent
    Writes short outreach · detailed outreach · LinkedIn post

  Agent 4 · recruiter_advisor_agent
    Produces screening questions and intake watch-outs
```

## Stack

- **Backend** — Python, Google ADK, FastAPI, Gemini 2.5 Flash
- **Frontend** — Single-file HTML, Playfair Display + IBM Plex Mono editorial UI

## Setup

```bash
# 1. Install backend deps
pip install -r backend/requirements.txt

# 2. Add your Gemini API key
echo "GOOGLE_API_KEY=your_key_here" > backend/.env

# 3. Start
uvicorn backend.main:app --port 8000
```

Open **http://localhost:8000** — paste a JD, then click **Build my recruiting plan**.

## Get a Gemini API Key

→ [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free)
