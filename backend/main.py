"""
MyHiringKit — FastAPI entry point.

Serves the JSON API under /api and the built React UI at /.

Local run:
    cd frontend && npm install && npm run build
    uvicorn backend.main:app --reload --port 8000
Then open http://localhost:8000
"""

from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

from fastapi import FastAPI, HTTPException  # noqa: E402  (after load_dotenv)
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402

from backend.api.routes import router  # noqa: E402
from backend.config import allowed_origins  # noqa: E402

app = FastAPI(
    title="MyHiringKit",
    description="Multi-agent recruiter workflow powered by Google ADK + Gemini Flash",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,  # no cookies or auth headers are used
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(router, prefix="/api")

# ── Frontend ──────────────────────────────────────────────────────────────────
# The UI is a Vite build produced in <repo>/public. This replaces the old
# hand-written backend/static/index.html, which had drifted badly out of sync
# with the React app that Vercel actually deploys.
FRONTEND_DIR = Path(__file__).parent.parent / "public"

if (FRONTEND_DIR / "index.html").is_file():
    # Registered after the /api router, so API routes still win.
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:

    @app.get("/")
    async def frontend_not_built():
        raise HTTPException(
            status_code=503,
            detail="Frontend not built. Run: cd frontend && npm install && npm run build",
        )
