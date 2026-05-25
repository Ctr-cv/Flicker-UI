"""
Speech model engine — placeholder implementation.

Silent speech (visual lip-reading) module. Extracts lip landmark
sequences from MediaPipe Face Landmarker and classifies them into
word or command labels.

Replace the body of `predict()` with your actual lip-reading model
inference. The buffer and temporal window are pre-configured for a
sequence model (LSTM / Transformer) consuming 60-frame windows with
stride-3 downsampling.

Integration example (your model):
    from your_model_package import LipReadingModel
    self._model = LipReadingModel.load("speech_weights.pt")
    word, score = self._model(lip_landmarks)
"""

import time
import logging
from enum import Enum

import numpy as np

from app.engine.base import BaseModelEngine

logger = logging.getLogger("flicker.speech")

# Labels your model can output — edit to match your actual classes
class SpeechLabels(Enum):
    SILENCE = 0
    YES = 1
    NO = 2
    START = 3
    STOP = 4
    NEXT = 5
    PREVIOUS = 6
    SELECT = 7
    HELP = 8

BUFFER_SIZE = 60
FRAME_STRIDE = 3
SPEECH_TIMEOUT = 0.5

# These constants are tuned to match the number of lip landmark points
# extracted from MediaPipe Face Landmarker on the frontend.
# Adjust LIP_COUNT when you change the frontend extraction logic.
LIP_COUNT = 40
LIP_DIMENSIONS = 3
FEATURE_DIM = LIP_COUNT * LIP_DIMENSIONS + 1  # 121-dimensional feature vector


class SpeechModelEngine(BaseModelEngine):
    """
    Template for the silent-speech / lip-reading model.
    """

    def __init__(self) -> None:
        self._loaded = False
        self._model = None
        self._buffer = np.zeros((BUFFER_SIZE, FEATURE_DIM), dtype=np.float32)
        self._buffered_frames = 0
        self._last_inference_time = 0.0
        self._prediction = None
        self._confidence = 0.0

    @property
    def loaded(self) -> bool:
        return self._loaded

    def load(self) -> None:
        """
        Load your lip-reading model here.

        Example:
            from your_model import LipReadingModel
            self._model = LipReadingModel.load("path/to/weights")
            self._model.eval()
        """
        self._loaded = True
        logger.info("Speech model engine loaded (placeholder — no model weights).")

    def unload(self) -> None:
        self._model = None
        self._loaded = False
        self._buffer.fill(0.0)
        self._buffered_frames = 0
        self._last_inference_time = 0.0
        self._prediction = None
        self._confidence = 0.0
        logger.info("Speech model engine unloaded.")

    def predict(self, lip_landmarks: list[list[float]]) -> tuple[str, float]:
        """
        Run inference on lip landmarks.

        Args:
            lip_landmarks: List of [x, y, z] lip landmark coordinates
                           extracted from MediaPipe Face Landmarker.

        Returns:
            (word_label, confidence) tuple.

        TODO: Replace with your actual model inference:
            result = self._model.predict(lip_landmarks)
            return result.word, result.confidence
        """
        label, confidence = "SILENCE", 0.0
        if not self._loaded or not lip_landmarks:
            return label, confidence

        landmark_data = self.normalize(lip_landmarks)
        self._buffer = np.roll(self._buffer, -1, axis=0)
        self._buffer[-1] = landmark_data
        self._buffered_frames = min(self._buffered_frames + 1, BUFFER_SIZE)

        if self._buffered_frames < BUFFER_SIZE:
            return label, confidence

        now = time.time()
        if self._prediction is not None and (now - self._last_inference_time) < SPEECH_TIMEOUT:
            return self._prediction, self._confidence

        # ── Placeholder inference ──────────────────────────────────
        # When you integrate your model, replace the block below:
        #
        #   data = self._buffer[::FRAME_STRIDE]
        #   data = data[np.newaxis, :]
        #   prediction = self._model(data)
        #   label_int, confidence = self.softmax(prediction)
        #   label = SpeechLabels(label_int).name
        #
        # For now, always returns SILENCE / 0.0 until the model is wired in.
        #
        self._prediction = label
        self._confidence = confidence
        self._last_inference_time = now
        return label, confidence

    def normalize(self, landmarks: list[list[float]]) -> np.ndarray:
        """
        Normalize lip landmark coordinates for a single frame.

        Centers on the mean lip position and scales by the maximum
        distance from center so the representation is position- and
        scale-invariant.

        :param landmarks: List of [x, y, z] lip landmark coordinates.
        :return: np array of shape (FEATURE_DIM,).
        """
        try:
            data = np.asarray(landmarks, dtype=np.float32)
        except (TypeError, ValueError) as exc:
            raise ValueError("Lip landmarks must be a numeric array") from exc

        expected_shape = (LIP_COUNT, LIP_DIMENSIONS)
        if data.shape != expected_shape:
            raise ValueError(
                f"Expected lip landmark shape {expected_shape}, got {tuple(data.shape)}"
            )

        if not np.isfinite(data).all():
            raise ValueError("Lip landmark array contains non-finite values")

        x_pts = data[:, 0]
        y_pts = data[:, 1]
        z_pts = data[:, 2]

        cx = x_pts.mean()
        cy = y_pts.mean()
        cz = z_pts.mean()

        x_pts -= cx
        y_pts -= cy
        z_pts -= cz

        dist = np.sqrt((x_pts - x_pts.mean()) ** 2 +
                       (y_pts - y_pts.mean()) ** 2 +
                       (z_pts - z_pts.mean()) ** 2).max()
        dist = max(dist, 1e-6)

        x_pts /= dist
        y_pts /= dist
        z_pts /= dist

        face_flag = np.array([1.0], dtype=np.float32)

        return np.concatenate([x_pts, y_pts, z_pts, face_flag], axis=-1).astype(np.float32, copy=False)

    def softmax(self, x: np.ndarray) -> tuple[int, float]:
        predicted_class = int(np.argmax(x, axis=1)[0])
        x_shifted = x[0] - np.max(x[0])
        e_x = np.exp(x_shifted)
        probabilities = e_x / e_x.sum()
        conf = float(probabilities[predicted_class])
        return predicted_class, conf
