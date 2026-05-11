# AI Recruiter Copilot

A minimal 2-agent recruiter workflow powered by **Google ADK** + **Gemini 2.5 Flash**.

Paste a raw job description → get a clean JD, Boolean search strings, outreach copy, and a LinkedIn hiring post in one run.

---

## Architecture

```
User pastes JD → FastAPI → ADK SequentialAgent

  Agent 1 · jd_boolean_agent
    Cleans JD → extracts skills/certs/tools → Strict / Balanced / Broad Booleans

  Agent 2 · outreach_linkedin_agent
    Reads Agent 1 output → Short outreach · Detailed outreach · LinkedIn post
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

Open **http://localhost:8000** — paste a JD, click **Run Agents**.

## Get a Gemini API Key

→ [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free)
