"""
FastAPI routes for AI Recruiter Copilot.

Reliability hardening for up to 5 concurrent users:
- asyncio.Semaphore caps concurrent pipeline runs (avoids Gemini rate-limit storms)
- asyncio.wait_for enforces a hard 150 s timeout per request
- Granular exception handling so one bad request never takes down the server
"""

import asyncio

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.pipeline.orchestrator import run_pipeline

router = APIRouter()

# Allow up to 5 simultaneous pipeline runs (one per user).
# If a 6th request arrives it waits rather than hammering Gemini.
_pipeline_semaphore = asyncio.Semaphore(5)
_PIPELINE_TIMEOUT = 150  # seconds


class GenerateRequest(BaseModel):
    raw_jd: str
    api_key: str | None = None


class GenerateResponse(BaseModel):
    clean_jd: dict
    booleans: dict
    outreach: dict
    linkedin_post: str
    recruiter_brief: dict


@router.get("/health")
async def health():
    return {"status": "ok", "service": "AI Recruiter Copilot"}


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    if not req.raw_jd or len(req.raw_jd.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="JD too short — paste the full job description so the agents have enough to work with.",
        )

    async with _pipeline_semaphore:
        try:
            result = await asyncio.wait_for(
                run_pipeline(raw_jd=req.raw_jd.strip(), api_key=req.api_key),
                timeout=_PIPELINE_TIMEOUT,
            )
            return result
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=504,
                detail="The pipeline timed out after 150 s. Try again — this is usually a transient Gemini hiccup.",
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            # Log the real error server-side but return a friendly message
            import traceback, logging
            logging.error("Pipeline error:\n%s", traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail=f"Something went wrong on our end: {type(e).__name__}. The team has been notified.",
            )
