"""
Speech recognition service.

Receives raw lip landmark arrays from the frontend, runs them through
the neural engine's speech modality, and returns classified word results.
"""
import time
from app.models.schemas import SpeechResult
from app.services.neural import neural_service
from config import settings

SPEECH_MODALITY = "speech"


class SpeechService:
    """Stateless service that wraps model inference for speech frames."""

    def predict(self, lip_landmarks: list[list[float]]) -> SpeechResult | None:
        """
        Run silent-speech inference on a single frame of lip landmarks.

        Returns None if the speech engine is not loaded or confidence
        is below the configured threshold.
        """
        if not neural_service.is_loaded(SPEECH_MODALITY):
            return None
        start = time.perf_counter()
        word, confidence = neural_service.infer(lip_landmarks, SPEECH_MODALITY)
        elapsed_ms = (time.perf_counter() - start) * 1000
        if confidence < settings.speech_confidence_threshold:
            return None

        return SpeechResult(
            word=word,
            confidence=confidence,
            latency=elapsed_ms,
            timestamp=time.time() * 1000,
        )


speech_service = SpeechService()
