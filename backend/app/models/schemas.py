"""Pydantic schemas shared across routes and services."""

from __future__ import annotations
from math import isfinite

from pydantic import BaseModel, field_validator


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

    @field_validator("landmarks")
    @classmethod
    def validate_landmarks(cls, landmarks: list[list[float]]) -> list[list[float]]:
        if len(landmarks) != 21:
            raise ValueError("Expected exactly 21 landmarks")

        for point in landmarks:
            if len(point) != 3:
                raise ValueError("Each landmark must contain exactly 3 coordinates")
            if not all(isfinite(value) for value in point):
                raise ValueError("Landmark coordinates must be finite numbers")

        return landmarks


class GestureResult(BaseModel):
    label: str
    confidence: float
    latency: float  # ms
    timestamp: float


# ── Speech ──────────────────────────────────────────────────


class SpeechFrame(BaseModel):
    lip_landmarks: list[list[float]]

    @field_validator("lip_landmarks")
    @classmethod
    def validate_lip_landmarks(cls, landmarks: list[list[float]]) -> list[list[float]]:
        if len(landmarks) != 40:
            raise ValueError("Expected exactly 40 lip landmarks")

        for point in landmarks:
            if len(point) != 3:
                raise ValueError("Each lip landmark must contain exactly 3 coordinates")
            if not all(isfinite(value) for value in point):
                raise ValueError("Lip landmark coordinates must be finite numbers")

        return landmarks


class SpeechResult(BaseModel):
    word: str
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
