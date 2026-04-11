"""
Neural engine service.

Manages the lifecycle of the gesture model and exposes an inference
method. Designed to be swappable — replace the engine adapter to
integrate a different model without touching the rest of the backend.
"""
import time

from app.engine.base import BaseModelEngine
from app.engine.gesture_model import GestureModelEngine


class NeuralService:
    """Singleton service that owns the active model engine."""

    def __init__(self) -> None:
        self._engine: BaseModelEngine | None = None
        self.last_latency: float = 0.0
        self.last_fidelity: float = 0.0

    @property
    def model_loaded(self) -> bool:
        return self._engine is not None and self._engine.loaded

    def load_model(self) -> None:
        """Instantiate and load the gesture model engine."""
        self._engine = GestureModelEngine()
        self._engine.load()

    def unload_model(self) -> None:
        """Release model resources."""
        if self._engine:
            self._engine.unload()
            self._engine = None

    def infer(self, landmarks: list[list[float]]) -> tuple[str, float]:
        """
        Run inference.

        Returns:
            (label, confidence) tuple.
        """
        if self._engine is None:
            return ("none", 0.0)
        prev = time.time()
        label, confidence = self._engine.predict(landmarks)
        self.last_latency = (time.time() - prev) * 1000
        self.last_fidelity = confidence
        return label, confidence


neural_service = NeuralService()
