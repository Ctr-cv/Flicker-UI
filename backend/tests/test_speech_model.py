"""
Tests for SpeechModelEngine — normalize(), load/unload, and predict().
"""

import numpy as np
import pytest

from app.engine.speech_model import SpeechModelEngine, LIP_COUNT, LIP_DIMENSIONS, FEATURE_DIM, BUFFER_SIZE


class TestNormalize:
    def test_output_shape(self):
        engine = SpeechModelEngine()
        landmarks = np.random.randn(LIP_COUNT, LIP_DIMENSIONS).tolist()
        result = engine.normalize(landmarks)
        assert result.shape == (FEATURE_DIM,)
        assert result.dtype == np.float32

    def test_rejects_wrong_shape(self):
        engine = SpeechModelEngine()
        with pytest.raises(ValueError, match="Expected lip landmark shape"):
            engine.normalize(np.random.randn(10, 3).tolist())
        with pytest.raises(ValueError, match="Expected lip landmark shape"):
            engine.normalize(np.random.randn(40, 2).tolist())

    def test_rejects_non_finite(self):
        engine = SpeechModelEngine()
        bad = np.random.randn(LIP_COUNT, LIP_DIMENSIONS).tolist()
        bad[0][0] = float("nan")
        with pytest.raises(ValueError, match="non-finite values"):
            engine.normalize(bad)

    def test_rejects_non_numeric(self):
        engine = SpeechModelEngine()
        with pytest.raises(ValueError, match="numeric array"):
            engine.normalize([["a", "b", "c"]] * LIP_COUNT)

    def test_face_flag_present(self):
        engine = SpeechModelEngine()
        landmarks = np.zeros((LIP_COUNT, LIP_DIMENSIONS)).tolist()
        result = engine.normalize(landmarks)
        assert result[-1] == 1.0

    def test_centering(self):
        engine = SpeechModelEngine()
        landmarks = [[10.0, 20.0, 30.0]] * LIP_COUNT
        result = engine.normalize(landmarks)
        x_center = result[:LIP_COUNT].mean()
        y_center = result[LIP_COUNT : 2 * LIP_COUNT].mean()
        z_center = result[2 * LIP_COUNT : 3 * LIP_COUNT].mean()
        assert abs(x_center) < 1e-5
        assert abs(y_center) < 1e-5
        assert abs(z_center) < 1e-5


class TestLoadUnload:
    def test_load(self):
        engine = SpeechModelEngine()
        assert engine.loaded is False
        engine.load()
        assert engine.loaded is True
        assert engine._model is not None

    def test_unload(self):
        engine = SpeechModelEngine()
        engine.load()
        engine.unload()
        assert engine.loaded is False
        assert engine._model is None
        assert engine._buffered_frames == 0

    def test_prediction_before_load(self):
        engine = SpeechModelEngine()
        label, conf = engine.predict(np.random.randn(LIP_COUNT, LIP_DIMENSIONS).tolist())
        assert label == "SILENCE"
        assert conf == 0.0


class TestPredict:
    def test_requires_buffered_frames(self):
        engine = SpeechModelEngine()
        engine.load()
        landmarks = np.random.randn(LIP_COUNT, LIP_DIMENSIONS).tolist()
        for _ in range(BUFFER_SIZE - 1):
            label, _ = engine.predict(landmarks)
            assert label == "SILENCE"

    def test_produces_result_after_buffer_full(self):
        engine = SpeechModelEngine()
        engine.load()
        landmarks = np.random.randn(LIP_COUNT, LIP_DIMENSIONS).tolist()
        for _ in range(BUFFER_SIZE):
            label, conf = engine.predict(landmarks)
        assert isinstance(label, str)
        assert 0.0 <= conf <= 1.0

    def test_empty_landmarks(self):
        engine = SpeechModelEngine()
        engine.load()
        label, conf = engine.predict([])
        assert label == "SILENCE"
        assert conf == 0.0
