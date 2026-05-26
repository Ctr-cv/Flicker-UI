"""
Tests for Pydantic schemas — validates frame parsing, landmark shapes,
and error handling for both gesture and speech modalities.
"""

import pytest
from pydantic import ValidationError

from app.models.schemas import GestureFrame, SpeechFrame, GestureResult, SpeechResult


def _landmarks(count: int):
    """Generate valid landmark array of <count> points."""
    return [[float(i), float(i + 1), float(i + 2)] for i in range(count)]


class TestGestureFrame:
    def test_valid_frame(self):
        frame = GestureFrame.model_validate({"landmarks": _landmarks(21)})
        assert len(frame.landmarks) == 21

    def test_wrong_landmark_count(self):
        with pytest.raises(ValidationError, match="Expected exactly 21 landmarks"):
            GestureFrame.model_validate({"landmarks": _landmarks(20)})

    def test_wrong_coord_count(self):
        bad = [[1.0, 2.0] for _ in range(21)]
        with pytest.raises(ValidationError, match="exactly 3 coordinates"):
            GestureFrame.model_validate({"landmarks": bad})

    def test_non_finite_values(self):
        bad = _landmarks(21)
        bad[0][0] = float("inf")
        with pytest.raises(ValidationError, match="must be finite"):
            GestureFrame.model_validate({"landmarks": bad})

    def test_empty_landmarks(self):
        with pytest.raises(ValidationError):
            GestureFrame.model_validate({"landmarks": []})


class TestSpeechFrame:
    def test_valid_frame(self):
        frame = SpeechFrame.model_validate({"lip_landmarks": _landmarks(40)})
        assert len(frame.lip_landmarks) == 40

    def test_wrong_landmark_count(self):
        with pytest.raises(ValidationError, match="Expected exactly 40 lip landmarks"):
            SpeechFrame.model_validate({"lip_landmarks": _landmarks(21)})

    def test_wrong_coord_count(self):
        bad = [[1.0, 2.0] for _ in range(40)]
        with pytest.raises(ValidationError, match="exactly 3 coordinates"):
            SpeechFrame.model_validate({"lip_landmarks": bad})

    def test_non_finite_values(self):
        bad = _landmarks(40)
        bad[5][2] = float("nan")
        with pytest.raises(ValidationError, match="must be finite"):
            SpeechFrame.model_validate({"lip_landmarks": bad})


class TestGestureResult:
    def test_valid_result(self):
        r = GestureResult(label="open_palm", confidence=0.95, latency=2.5, timestamp=1234.0)
        data = r.model_dump()
        assert data["label"] == "open_palm"
        assert data["confidence"] == 0.95


class TestSpeechResult:
    def test_valid_result(self):
        r = SpeechResult(word="START", confidence=0.88, latency=3.1, timestamp=5678.0)
        data = r.model_dump()
        assert data["word"] == "START"
        assert data["confidence"] == 0.88
