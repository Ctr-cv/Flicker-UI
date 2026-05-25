"""
Neural engine service.

Manages the lifecycle of all modality engines and exposes inference
methods. Designed to be extensible — register new engines to
integrate additional modalities without touching the rest of the backend.
"""
import time

from app.engine.base import BaseModelEngine
from app.engine.gesture_model import GestureModelEngine


class NeuralService:
    """Singleton service that owns all active model engines."""

    def __init__(self) -> None:
        self._engines: dict[str, BaseModelEngine] = {}
        self._latency: dict[str, float] = {}
        self._fidelity: dict[str, float] = {}

    # ── Multi-modality API ──────────────────────────────────

    def register_engine(self, modality: str, engine: BaseModelEngine) -> None:
        """Register a new modality engine. Does not load weights."""
        self._engines[modality] = engine

    def load_engine(self, modality: str) -> None:
        """Load a registered engine's model weights."""
        engine = self._engines.get(modality)
        if engine is not None:
            engine.load()

    def unload_engine(self, modality: str) -> None:
        """Unload a modality engine and release its resources."""
        engine = self._engines.get(modality)
        if engine is not None:
            engine.unload()

    def is_loaded(self, modality: str) -> bool:
        """Check whether a modality engine is registered and loaded."""
        engine = self._engines.get(modality)
        return engine is not None and engine.loaded

    def get_latency(self, modality: str) -> float:
        """Get the last inference latency in ms for a modality."""
        return self._latency.get(modality, 0.0)

    def get_fidelity(self, modality: str) -> float:
        """Get the last inference confidence for a modality."""
        return self._fidelity.get(modality, 0.0)

    @property
    def all_modalities(self) -> list[str]:
        """List all registered modality names."""
        return list(self._engines.keys())

    def infer(self, data: list[list[float]], modality: str = "gesture") -> tuple[str, float]:
        """
        Run inference on the specified modality engine.

        Args:
            data: Model-specific input (e.g. hand landmarks, lip landmarks).
            modality: Which engine to use (default: "gesture").

        Returns:
            (label, confidence) tuple.
        """
        engine = self._engines.get(modality)
        if engine is None:
            return ("none", 0.0)
        prev = time.time()
        label, confidence = engine.predict(data)
        self._latency[modality] = (time.time() - prev) * 1000
        self._fidelity[modality] = confidence
        return label, confidence

    # ── Backward-compat shortcuts (delegate to "gesture") ────

    @property
    def model_loaded(self) -> bool:
        """Backward compat: check whether the gesture engine is loaded."""
        return self.is_loaded("gesture")

    @property
    def last_latency(self) -> float:
        """Backward compat: gesture engine's last inference latency in ms."""
        return self._latency.get("gesture", 0.0)

    @property
    def last_fidelity(self) -> float:
        """Backward compat: gesture engine's last inference confidence."""
        return self._fidelity.get("gesture", 0.0)

    def load_model(self) -> None:
        """Backward compat: register and load the gesture engine."""
        if "gesture" not in self._engines:
            self._engines["gesture"] = GestureModelEngine()
        self.load_engine("gesture")

    def unload_model(self) -> None:
        """Backward compat: unload the gesture engine."""
        self.unload_engine("gesture")


neural_service = NeuralService()
