"""
Gesture recognition service.

Receives raw landmark arrays, runs them through the neural engine,
and returns classified gesture results.
"""

import time
from app.models.schemas import GestureResult
from app.services.neural import neural_service
from config import settings


class GestureService:
    """Stateless service that wraps model inference for gesture frames."""

    def predict(self, landmarks: list[list[float]]) -> GestureResult | None:
        """
        Run gesture inference on a single frame of landmarks.

        Returns None if confidence is below the configured threshold.
        """
        if not neural_service.model_loaded:
            return None

        start = time.perf_counter()
        label, confidence = neural_service.infer(landmarks)
        elapsed_ms = (time.perf_counter() - start) * 1000

        if confidence < settings.model_confidence_threshold:
            return None

        return GestureResult(
            label=label,
            confidence=confidence,
            latency=elapsed_ms,
            timestamp=time.time() * 1000,
        )


gesture_service = GestureService()
