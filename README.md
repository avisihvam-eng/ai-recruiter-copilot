# AI Recruiter Copilot

A four-agent recruiter workflow powered by **Google ADK** + **Gemini 2.5 Flash**.

Paste a raw job description → get a recruiter brief, Boolean search strings, candidate outreach, a LinkedIn hiring post, and intake prep questions in one run.

---

## Architecture

```
User pastes JD → FastAPI → ADK SequentialAgent → one JSON response

  Agent 1 · jd_boolean_agent          → jd_boolean_output
    Builds a separate recruiter brief. The submitted JD is never rewritten.

  Agent 2 · sourcing_strategy_agent   → sourcing_strategy_output
    Builds Strict / Balanced / Broad Boolean searches.

  Agent 3 · outreach_linkedin_agent   → outreach_output
    Writes short outreach, detailed outreach, and a LinkedIn post.

  Agent 4 · recruiter_advisor_agent   → recruiter_advisor_output
    Produces a strongest-fit profile, screening questions, and intake watch-outs.
```

Agents are chained through ADK session state: each reads the previous agent's output key.

> **Naming wart:** `jd_boolean_agent` produces the role brief, not Boolean strings. Agent 2 builds the Booleans. The name is kept as-is because the `jd_boolean_output` key is referenced by three other prompts.

## Stack

| Layer | Tech |
|---|---|
| Backend | Python, Google ADK, FastAPI, Gemini 2.5 Flash |
| Frontend | React 19 + Vite + Tailwind (plain CSS component layer) |
| Deploy | Vercel (serverless Python + static build) |

## Repository layout

```
api/index.py            Vercel serverless entry point
backend/
  config.py             CORS / environment helpers
  main.py               FastAPI app — serves /api and the built UI
  agents/               the four ADK agents
  pipeline/             pipeline assembly + response shaping
  api/routes.py         /api/health and /api/generate
frontend/src/
  lib/                  api client, markdown export, scroll spy, Outlook HTML
  data/sample.js        demo-mode fixtures
  components/           UI
public/                 Vite build output (committed — this is what Vercel serves)
```

---

## Setup

### 1. Backend

```bash
pip install -r backend/requirements.txt
echo "GOOGLE_API_KEY=your_key_here" > backend/.env
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend

Two ways to run the UI:

**Dev server (hot reload)** — run the API and the UI side by side:

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The dev server calls the API at `http://localhost:8000/api` directly. Don't forget to start uvicorn first.

**Single server (production-like)** — build the UI, then let FastAPI serve it:

```bash
cd frontend && npm run build     # outputs to ../public
uvicorn backend.main:app --port 8000
# open http://localhost:8000
```

### 3. Demo mode

The UI ships with a **"Load sample JD"** button and a canned example result, so the whole interface can be explored without a Gemini key. Sample output is always labelled as such in the UI and never mixed with real generations.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_API_KEY` | yes | Gemini API key. Read from `backend/.env` locally, or the Vercel project env. |
| `ALLOWED_ORIGINS` | no | Comma-separated CORS allow-list. Defaults to local dev origins. Production needs none (same origin). |
| `LINKEDIN_CONTACT_EMAIL` | no | Contact address embedded in generated LinkedIn posts. |

## API

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/health` | Liveness probe. Used by the UI's connection indicator. |
| `POST` | `/api/generate` | Body `{ "raw_jd": "..." }`. Rejects JDs under 50 characters. |

`/api/generate` returns:

```json
{
  "clean_jd":        { "title": "...", "objective": "...", "responsibilities": [], "required_skills": [], "preferred_skills": [] },
  "booleans":        { "strict": "...", "balanced": "...", "broad": "..." },
  "outreach":        { "short": "...", "detailed": "..." },
  "linkedin_post":   "...",
  "recruiter_brief": { "ideal_candidate": "...", "screening_questions": [], "watchouts": [] }
}
```

## Get a Gemini API Key

→ [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free tier is rate limited to a few requests per minute)
