"""
Vercel serverless entry point.
Adds the repo root to sys.path so backend.* imports resolve correctly.
"""

import os
import sys

# Allow imports from the repo root
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.config import allowed_origins

app = FastAPI(title="MyHiringKit")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(router, prefix="/api")
