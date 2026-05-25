"""
Gestalt Engine — FastAPI entry point.

Provides:
  - REST endpoints for configuration and status  (/api/*)
  - WebSocket endpoints for real-time gesture and speech streaming  (/ws/gesture, /ws/speech)
"""

from contextlib import asynccontextmanager

import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from app.routes import health, status, model
from app.websocket.manager import ws_router
from app.services.neural import neural_service
from app.engine.speech_model import SpeechModelEngine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # ── Startup ───────────────────────────────────────────
    neural_service.load_model()
    neural_service.register_engine("speech", SpeechModelEngine())
    neural_service.load_engine("speech")
    yield
    # ── Shutdown ──────────────────────────────────────────
    neural_service.unload_engine("speech")
    neural_service.unload_model()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

logging.basicConfig(level=logging.INFO)

# ── CORS (allow Vite dev server) ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── REST routes ───────────────────────────────────────────
app.include_router(health.router, prefix="/api")
app.include_router(status.router, prefix="/api")
app.include_router(model.router, prefix="/api")

# ── WebSocket routes ──────────────────────────────────────
app.include_router(ws_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
