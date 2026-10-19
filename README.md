# MyHiringKit

A four-agent recruiter workflow powered by **Google ADK** + **Gemini 2.5 Flash**.

Paste a raw job description → get a recruiter brief, Boolean search strings, candidate outreach, a LinkedIn hiring post, and intake prep questions in one run.

**[Live demo →](https://myhiringkit.vercel.app)**

Saves about 45 minutes of prep per req.

---

## What the UI does

|  |  |
|---|---|
| **Two ways in** | Paste the text, or upload the PDF / Word document the hiring manager sent. Optional seniority, location, must-haves and salary fields are appended to whatever you provide. |
| **Validated before it costs you** | A JD that is too short, or that does not read like a posting, is flagged *before* a model call is spent — with a "Build it anyway" escape hatch. |
| **Progress you can watch** | The backend streams one event per agent, so the five assets tick over as they land instead of a spinner for a minute. |
| **Platform-aware search strings** | The same Boolean is rewritten per destination — LinkedIn Recruiter, Naukri Resdex, or a Google X-ray with an "Open in Google" link — with a live character count against each platform's cap. |
| **Editable outreach** | Inline editing, `%FIRSTNAME%` placeholders highlighted, and a counter against the ~300-character connection-note limit. |
| **Regenerate one asset** | Re-run a single asset (1 model call) instead of the whole kit (4). |
| **Built for Outlook** | Every copy button puts HTML on the clipboard, so pasting into Outlook keeps its formatting rather than arriving as a wall of plain text. |

Drafts, the last five kits, and your place in the page all persist in the browser. Nothing is stored server-side.

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

`POST /api/generate/stream` runs the same pipeline but emits NDJSON as each agent finishes, which is what drives the live progress list. `POST /api/regenerate` re-runs a single agent in a throwaway session, seeded with the assets that agent interpolates — so "Regenerate outreach" costs one model call, not four.

> **Naming wart:** `jd_boolean_agent` produces the role brief, not Boolean strings. Agent 2 builds the Booleans. The name is kept as-is because the `jd_boolean_output` key is referenced by three other prompts.

### Output budgets

The Gemini free tier allows roughly 20 requests a day per model, so every prompt is word-budgeted rather than merely told to "be concise". Shorter output also means shorter input for the three agents downstream that interpolate the brief.

| Asset | Budget |
|---|---|
| Formatted JD | objective ≤ 35 words · 3–5 duties ≤ 10 words · 4–6 required skills ≤ 12 words · 2–3 preferred |
| Boolean searches | three variants, ≤ 60 words each |
| Outreach | short ≤ 35 words · detailed ≤ 50 words |
| LinkedIn post | fixed template, filled from the JD |
| Recruiter prep | 1 sentence ≤ 22 words · 3 questions ≤ 14 words · 2 watch-outs ≤ 12 words |

Recruiter prep is deliberately about 60% smaller than it was: one profile sentence, three questions and two watch-outs is what actually gets used on an intake call.

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
  pipeline/             pipeline assembly, response shaping, single-asset regeneration
  api/routes.py         /api/health, /api/generate, /api/generate/stream, /api/regenerate, /api/ingest/*
  api/ingest.py         link / PDF / Word / text → job-description text
frontend/src/
  lib/api.js            API client, NDJSON stream reader, plain-endpoint fallback
  lib/booleans.js       per-platform Boolean dialects + character budgets
  lib/kit.js            kit → Markdown export, download helpers
  lib/outlook.js        clipboard HTML for Outlook
  lib/validateJd.js     pre-flight JD checks
  lib/sections.js       section metadata (labels, progress copy, anchors)
  data/sample.js        demo-mode fixtures
  components/           UI
public/                 Vite build output (committed — this is what Vercel serves)
tools/make_og_image.py  regenerates public/og.png (needs Pillow)
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

The UI ships with a **"See an example kit"** button and a canned example result, so the whole interface can be explored without a Gemini key — it sits next to **Build kit** rather than being hidden in a footnote, and it works even while the backend is still waking up. Sample output is always labelled as such in the UI and never mixed with real generations, and it is kept out of history.

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
| `POST` | `/api/generate/stream` | Same body; returns NDJSON `{"type":"stage" | "retry" | "result" | "error"}` — one line as each agent starts and finishes. |
| `POST` | `/api/regenerate` | Body `{ "asset": "outreach", "raw_jd": "...", "clean_jd": {...}, "booleans": {...} }`. Re-runs one agent. |
| `POST` | `/api/ingest/file` | Raw file body with the name in the `X-Filename` header. Reads PDF, DOCX, TXT and MD. |

The ingest endpoint returns `{ "text", "source", "chars", "warning" }`; `warning` is set when the extraction was too thin to plausibly be a job description.

The client streams by preference and falls back to `/api/generate` if the stream cannot be read (some hosts buffer serverless responses), so a kit is never lost to a transport quirk.

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
