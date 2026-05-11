"""
FastAPI routes for AI Recruiter Copilot.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.pipeline.orchestrator import run_pipeline

router = APIRouter()


class GenerateRequest(BaseModel):
    raw_jd: str
    api_key: str | None = None


class GenerateResponse(BaseModel):
    clean_jd: dict
    booleans: dict
    outreach: dict
    linkedin_post: str


@router.get("/health")
async def health():
    return {"status": "ok", "service": "AI Recruiter Copilot"}


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    if not req.raw_jd or len(req.raw_jd.strip()) < 50:
        raise HTTPException(status_code=400, detail="JD too short. Please paste the full job description.")

    try:
        result = await run_pipeline(raw_jd=req.raw_jd.strip(), api_key=req.api_key)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
