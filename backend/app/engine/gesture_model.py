"""
Gesture model engine — placeholder implementation.

Replace the body of `predict()` with your actual lightweight model
inference. The interface stays the same, so the rest of the backend
is unaffected.

Integration example (your model):
    from your_model_package import GestureClassifier
    self._model = GestureClassifier.load("weights.bin")
    label, score = self._model(landmarks)
"""

import random
import time
from pathlib import Path

import torch
import logging

from enum import Enum
from app.engine.base import BaseModelEngine
from app.engine.gesture_torch import GestureModel

import numpy as np

logger = logging.getLogger("flicker.gesture")

# Labels your model can output — edit to match your actual classes
class Gestures(Enum):
    NO_GESTURE = 0
    ONE_FINGER_POINT = 1
    TWO_FINGER_POINT = 2
    ONE_FINGER_CLICK = 3
    TWO_FINGER_CLICK = 4
    THROW_UP = 5
    THROW_DOWN = 6
    THROW_LEFT = 7
    THROW_RIGHT = 8
    OPEN_TWICE = 9
    ONE_FINGER_DOUBLE_CLICK = 10
    TWO_FINGER_DOUBLE_CLICK = 11
    ZOOM_IN = 12
    ZOOM_OUT = 13

PROJECT_ROOT = Path(__file__).resolve().parents[2]
GESTURE_TIMEOUT = 0.5

class GestureModelEngine(BaseModelEngine):
    """
    Template for the local Python gesture model.
    """

    def __init__(self) -> None:
        self._loaded = False
        self._model = None  # Your model instance goes here
        self._buffer = np.zeros((60, 64), dtype=np.float32)  # Inference buffer of 60 frames
        self._last_update_time = time.time()
        self._prediction = None

    @property
    def loaded(self) -> bool:
        return self._loaded

    def load(self) -> None:
        """
        Load your model here.

        Example:
            from your_model import GestureClassifier
            self._model = GestureClassifier.load("path/to/weights")
        """
        # Logic to load the existing flicker model

        D, C, H1 = 64, 14, 128
        num_layers = 2
        device = torch.device("cpu")

        model = GestureModel(D, H1, num_layers, C).to(device)
        weights_path = PROJECT_ROOT / "app" / "engine" / "gesture_model.pth"
        model.load_state_dict(torch.load(weights_path, map_location=device, weights_only=True))
        model.eval()
        self._model = model
        self._loaded = True
        logging.info("Successfully loaded the gesture model.")

    def unload(self) -> None:
        self._model = None
        self._loaded = False
        logging.info("Successfully unloaded the gesture model.")

    def predict(self, landmarks: list[list[float]]) -> tuple[str, float]:
        """
        Run inference on hand landmarks.

        Args:
            landmarks: List of [x, y, z] landmark coordinates
                       (e.g., 21 MediaPipe hand landmarks).

        Returns:
            (gesture_label, confidence) tuple.

        TODO: Replace with your actual model inference:
            result = self._model.predict(landmarks)
            return result.label, result.confidence
        """
        label, confidence = "none", 0.0
        if not self._loaded or not landmarks:
            return label, confidence

        # 1. Pre-processing to roll into the buffer queue
        landmark_data = self.normalize(landmarks)
        self._buffer = np.roll(self._buffer, -1, axis=0)
        self._buffer[-1] = landmark_data
        # 2. Run the torch model inference on the entire queue
        # Check if update time has passed
        if self._prediction is not None and time.time() - self._last_update_time > GESTURE_TIMEOUT:
            return self._prediction, random.uniform(0.9, 1.0)   # Fake confidence for skipped gestures
        self._last_update_time = time.time()
        data = self._buffer[::3]
        data = data[np.newaxis, :]

        device = torch.device("cpu")
        input_tensor = torch.from_numpy(data).float().to(device)
        with torch.no_grad():
            prediction = self._model(input_tensor).cpu().numpy()
        if prediction is not None:
            label_int, confidence = self.softmax(prediction)
            label = Gestures(label_int).name
            self._prediction = label
        return label, confidence

    def normalize(self, landmarks: list[list[float]]):
        """
        Helper function to normalize all data points within a single frame
        :param X: Input 2D list data of size 3x21.
        :return: np array of shape (64,)
        """
        data = np.array(landmarks)

        x_pts = data[:, 0]
        y_pts = data[:, 1]
        z_pts = data[:, 2]
        hand = np.array([1.0])

        # Wrist is index 0 of each block, MCP is index 9
        w_x, w_y, w_z = x_pts[0], y_pts[0], z_pts[0]
        m_x, m_y, m_z = x_pts[9], y_pts[9], z_pts[9]

        x_pts -= w_x
        y_pts -= w_y
        z_pts -= w_z

        # Scale (Euclidean)
        dist = np.sqrt((m_x - w_x) ** 2 + (m_y - w_y) ** 2 + (m_z - w_z) ** 2)
        dist = np.where(dist == 0, 1e-6, dist)

        x_pts /= dist
        y_pts /= dist
        z_pts /= dist

        return np.concatenate([x_pts, y_pts, z_pts, hand], axis=-1)

    def softmax(self, x):
        predicted_class = np.argmax(x, axis=1)[0]
        x_shifted = x[0] - np.max(x[0])
        e_x = np.exp(x_shifted)
        probabilities = e_x / e_x.sum()
        conf = probabilities[predicted_class]
        return int(predicted_class), float(conf)
