"""
Audio processing service — extension point.

Stub for future audio modality integration (e.g., voice commands,
sound-based gesture cues, sonification of hand motion).
"""


class AudioService:
    """Placeholder for audio I/O integration."""

    def __init__(self) -> None:
        self.active = False

    def process_audio_frame(self, frame: bytes) -> dict | None:
        """
        Process a raw audio frame for gesture-related audio cues.

        Args:
            frame: Raw PCM audio bytes.

        Returns:
            Classification result dict, or None.
        """
        # TODO: Implement audio processing pipeline
        return None


audio_service = AudioService()
