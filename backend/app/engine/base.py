"""
Abstract model engine interface.

Every modality model (gesture, audio, etc.) should implement this
interface so the neural service can manage them uniformly.
"""

from abc import ABC, abstractmethod


class BaseModelEngine(ABC):
    """Contract for pluggable inference engines."""

    @property
    @abstractmethod
    def loaded(self) -> bool:
        """Whether the model weights are in memory and ready."""
        ...

    @abstractmethod
    def load(self) -> None:
        """Load model weights / initialize runtime."""
        ...

    @abstractmethod
    def unload(self) -> None:
        """Release resources."""
        ...

    @abstractmethod
    def predict(self, data: list[list[float]]) -> tuple[str, float]:
        """
        Run inference on input data.

        Args:
            data: Model-specific input (e.g., hand landmarks).

        Returns:
            (label, confidence) tuple.
        """
        ...
