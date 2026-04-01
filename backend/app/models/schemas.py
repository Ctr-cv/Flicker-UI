"""Pydantic schemas shared across routes and services."""

from __future__ import annotations
from pydantic import BaseModel


# ── API Responses ──────────────────────────────────────────


class ApiResponse(BaseModel):
    success: bool
    data: dict | list | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    status: str = "ok"


# ── Modality ───────────────────────────────────────────────


class ModalityStatus(BaseModel):
    type: str  # "gesture" | "haptics" | "audio" | "neural"
    active: bool
    latency: float  # ms
    fidelity: float  # 0–1


class SystemStatus(BaseModel):
    modalities: list[ModalityStatus]
    uptime: float
    version: str
    model_loaded: bool


# ── Gesture ────────────────────────────────────────────────


class GestureFrame(BaseModel):
    landmarks: list[list[float]]


class GestureResult(BaseModel):
    label: str
    confidence: float
    latency: float  # ms
    timestamp: float


# ── WebSocket Messages ─────────────────────────────────────


class WSMessage(BaseModel):
    type: str
    payload: dict | list | None = None
    timestamp: float


# ── Config ─────────────────────────────────────────────────


class InferenceConfig(BaseModel):
    confidence_threshold: float | None = None
    batch_size: int | None = None
