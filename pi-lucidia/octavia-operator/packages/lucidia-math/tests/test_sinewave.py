"""Tests for forge.sinewave — SineWave algebra."""

import pytest
from forge.sinewave import SineWave, IDENTITY


class TestSineWave:
    def test_add(self):
        result = SineWave(1, 2) + SineWave(3, 2)
        assert result.amplitude == pytest.approx(4.0)
        assert result.frequency == pytest.approx(2.0)

    def test_mul(self):
        result = SineWave(2, 3) * SineWave(4, 5)
        assert result.amplitude == pytest.approx(8.0)
        assert result.frequency == pytest.approx(8.0)

    def test_inverse(self):
        inv = SineWave(3, 2).inverse()
        assert inv.amplitude == pytest.approx(-3.0)
        assert inv.frequency == pytest.approx(-2.0)

    def test_identity(self):
        assert IDENTITY.amplitude == 0.0
        assert IDENTITY.frequency == 0.0

    def test_add_identity(self):
        w = SineWave(5, 3)
        result = w + IDENTITY
        assert result.amplitude == pytest.approx(5.0)

    def test_add_returns_not_implemented(self):
        assert SineWave(1, 1).__add__(5) is NotImplemented

    def test_mul_returns_not_implemented(self):
        assert SineWave(1, 1).__mul__(5) is NotImplemented
