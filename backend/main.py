"""
AI Recruiter Copilot — FastAPI entry point.
Run with: uvicorn backend.main:app --reload --port 8000
"""

from dotenv import load_dotenv
load_dotenv()

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.api.routes import router

app = FastAPI(
    title="AI Recruiter Copilot",
    description="Multi-agent recruiter workflow powered by Google ADK + Gemini Flash",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Serve the editorial UI as the root
STATIC_DIR = Path(__file__).parent / "static"

@app.get("/", response_class=FileResponse)
async def serve_ui():
    return FileResponse(STATIC_DIR / "index.html", media_type="text/html")
