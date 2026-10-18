"""Shared backend configuration helpers."""

import os

# Local development only. In production the UI is served from the same origin as
# the API, so CORS is not needed at all.
DEFAULT_DEV_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]


def allowed_origins() -> list[str]:
    """
    CORS origins for the API.

    Override with a comma-separated ALLOWED_ORIGINS environment variable.

    Deliberately never pairs a wildcard with ``allow_credentials``: browsers
    reject that combination outright, so the previous ``["*"]`` +
    ``allow_credentials=True`` setup was both over-permissive and non-functional.
    """
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    return list(DEFAULT_DEV_ORIGINS)
