"""
Vercel Serverless Function entrypoint for the FastAPI backend.

This exposes the FastAPI `app` defined in `app/main.py` as an ASGI app.
Vercel's Python runtime detects the `app` variable and serves it.
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure the backend package root is on sys.path so `app.main` can be imported
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = CURRENT_DIR.parent  # /backend
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# Import the FastAPI app
from app.main import app  # noqa: E402  (import after sys.path adjustment)

# Vercel will use the module-level `app` ASGI callable
