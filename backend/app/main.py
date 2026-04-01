"""
Gestalt Engine — FastAPI entry point.

Provides:
  - REST endpoints for configuration and status  (/api/*)
  - WebSocket endpoint for real-time gesture streaming  (/ws/gesture)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from app.routes import health, status, model
from app.websocket.manager import ws_router
from app.services.neural import neural_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # ── Startup ───────────────────────────────────────────
    neural_service.load_model()
    yield
    # ── Shutdown ──────────────────────────────────────────
    neural_service.unload_model()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

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
