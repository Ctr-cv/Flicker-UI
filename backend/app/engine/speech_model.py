"""
Speech model engine — LSTM + MLP for silent speech (visual lip-reading).

Extracts lip landmark sequences from MediaPipe Face Landmarker and
classifies them into word or command labels via a PyTorch model.

Architecture: LSTM (2-layer, 128-hidden) → LayerNorm → MLP (128→64→N_CLASSES)
Buffer: 60-frame rolling window, stride-3 downsampling → 20-frame sequences
Input:  121-dim features (40 lip points × 3 coords + face flag)
Output: 9 classes (SILENCE, YES, NO, START, STOP, NEXT, PREVIOUS, SELECT, HELP)

To train a custom model:
    1. Train a SpeechLSTM with your labelled dataset
    2. Save weights to speech_model.pth in this directory
    3. The engine auto-loads on backend startup
"""

import time
import logging
from enum import Enum
from pathlib import Path

import numpy as np
import torch

from app.engine.base import BaseModelEngine
from app.engine.speech_torch import SpeechModel

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

PROJECT_ROOT = Path(__file__).resolve().parents[2]
HIDDEN_SIZE = 128
NUM_LAYERS = 2
NUM_CLASSES = len(SpeechLabels)


class SpeechModelEngine(BaseModelEngine):
    """Silent-speech lip-reading engine backed by a PyTorch LSTM+MLP model."""

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
        Load the silent-speech LSTM+MLP model.
        If speech_model.pth does not exist, initialises with random weights.
        """
        device = torch.device("cpu")
        model = SpeechModel(FEATURE_DIM, HIDDEN_SIZE, NUM_LAYERS, NUM_CLASSES).to(device)
        weights_path = PROJECT_ROOT / "app" / "engine" / "speech_model.pth"
        if weights_path.exists():
            state = torch.load(weights_path, map_location=device, weights_only=True)
            model.load_state_dict(state)
            logger.info("Speech model weights loaded from %s", weights_path)
        else:
            logger.warning(
                "speech_model.pth not found at %s — using random weights. "
                "Predictions will be non-deterministic until training.",
                weights_path,
            )
        model.eval()
        self._model = model
        self._loaded = True
        logger.info("Speech model engine loaded.")

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
        """
        label, confidence = "SILENCE", 0.0
        if not self._loaded or not lip_landmarks:
            return label, confidence
        if self._model is None:
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

        data = self._buffer[::FRAME_STRIDE]
        data = data[np.newaxis, :]

        input_tensor = torch.from_numpy(data).float()
        with torch.no_grad():
            logits = self._model(input_tensor).numpy()
        label_int, confidence = self.softmax(logits)
        label = SpeechLabels(label_int).name
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
