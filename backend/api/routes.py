"""
FastAPI routes for MyHiringKit.
"""

import asyncio
import json

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.api import ingest
from backend.pipeline.orchestrator import (
    REGENERATABLE_ASSETS,
    regenerate_asset,
    run_pipeline,
)

router = APIRouter()

MIN_JD_CHARS = 50
TOO_SHORT = "JD too short. Please paste the full job description."


class GenerateRequest(BaseModel):
    raw_jd: str
    api_key: str | None = None


class GenerateResponse(BaseModel):
    clean_jd: dict
    booleans: dict
    outreach: dict
    linkedin_post: str
    recruiter_brief: dict


class RegenerateRequest(BaseModel):
    asset: str
    raw_jd: str
    # The assets the target agent interpolates. The client already holds these,
    # so sending them back is far cheaper than re-running the agents upstream.
    clean_jd: dict | None = None
    booleans: dict | None = None
    api_key: str | None = None


class RegenerateResponse(BaseModel):
    asset: str
    clean_jd: dict | None = None
    booleans: dict | None = None
    outreach: dict | None = None
    linkedin_post: str | None = None
    recruiter_brief: dict | None = None


class IngestResponse(BaseModel):
    text: str
    source: str
    chars: int
    # Set when the extraction looks too thin to be a job description, so the UI
    # can warn before the user spends a model call on page furniture.
    warning: str | None = None


def _ingest_response(text: str, source: str) -> dict:
    cleaned = (text or "").strip()
    if not cleaned:
        raise HTTPException(
            status_code=400,
            detail="Nothing readable came back from that source. Paste the job description instead.",
        )

    warning = None
    if len(cleaned) < ingest.MIN_CHARS:
        warning = (
            f"Only {len(cleaned)} characters came back — shorter than a typical job description. "
            "Check it reads like a JD before building, or paste the text instead."
        )

    return {"text": cleaned, "source": source, "chars": len(cleaned), "warning": warning}


def _require_jd(raw_jd: str) -> str:
    value = (raw_jd or "").strip()
    if len(value) < MIN_JD_CHARS:
        raise HTTPException(status_code=400, detail=TOO_SHORT)
    return value


@router.get("/health")
async def health():
    return {"status": "ok", "service": "MyHiringKit"}


@router.post("/ingest/file", response_model=IngestResponse)
async def ingest_file(request: Request):
    """
    Read an uploaded PDF, Word document or text file.

    The body is the raw file and the name travels in X-Filename, which keeps
    multipart parsing (and its extra dependency) out of the picture.
    """
    filename = request.headers.get("x-filename", "")
    data = await request.body()

    try:
        text = await asyncio.to_thread(ingest.from_file, filename, data)
    except ingest.IngestError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return _ingest_response(text, filename or "upload")


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    raw_jd = _require_jd(req.raw_jd)

    try:
        return await run_pipeline(raw_jd=raw_jd, api_key=req.api_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


@router.post("/generate/stream")
async def generate_stream(req: GenerateRequest):
    """
    The same work as /generate, but reports progress as newline-delimited JSON.

    One JSON object per line:

        {"type": "stage",  "id": "role-brief", "state": "running" | "done"}
        {"type": "retry",  "attempt": 1}
        {"type": "result", "data": {...}}
        {"type": "error",  "message": "..."}

    NDJSON over a normal POST rather than an EventSource: the JD is far too long
    to put in a query string, and a plain fetch stream lets the client fall back
    to /generate if a host buffers or refuses to stream.
    """
    raw_jd = _require_jd(req.raw_jd)

    async def event_stream():
        queue: asyncio.Queue[str | None] = asyncio.Queue()

        async def report(payload: dict) -> None:
            await queue.put(json.dumps(payload) + "\n")

        async def work() -> None:
            try:
                result = await run_pipeline(raw_jd=raw_jd, api_key=req.api_key, on_event=report)
                await report({"type": "result", "data": result})
            except Exception as e:
                # The response has already started, so an exception can no longer
                # become an HTTP status — it has to travel as an event.
                await report({"type": "error", "message": str(e)})
            finally:
                await queue.put(None)

        task = asyncio.create_task(work())
        try:
            while True:
                item = await queue.get()
                if item is None:
                    break
                yield item
        finally:
            if not task.done():
                task.cancel()

    return StreamingResponse(
        event_stream(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@router.post("/regenerate", response_model=RegenerateResponse, response_model_exclude_none=True)
async def regenerate(req: RegenerateRequest):
    raw_jd = _require_jd(req.raw_jd)

    if req.asset not in REGENERATABLE_ASSETS:
        raise HTTPException(status_code=400, detail=f"Unknown asset '{req.asset}'.")

    try:
        patch = await regenerate_asset(
            asset=req.asset,
            raw_jd=raw_jd,
            clean_jd=req.clean_jd,
            booleans=req.booleans,
            api_key=req.api_key,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

    return {"asset": req.asset, **patch}
