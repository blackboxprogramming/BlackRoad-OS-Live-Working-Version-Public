"""Tests for forge.numbers — SurrealNumber, Infinitesimal, WaveNumber."""

import pytest
from forge.numbers import SurrealNumber, Infinitesimal, WaveNumber


class TestSurrealNumber:
    def test_add(self):
        result = SurrealNumber(1, 2) + SurrealNumber(3, 4)
        assert result == SurrealNumber(4, 6)

    def test_mul(self):
        result = SurrealNumber(2, 3) * SurrealNumber(4, 5)
        assert result == SurrealNumber(8, 15)

    def test_inverse(self):
        inv = SurrealNumber(2, 4).inverse()
        assert inv == SurrealNumber(0.5, 0.25)

    def test_add_non_surreal(self):
        assert SurrealNumber(1, 2).__add__(5) is NotImplemented

    def test_mul_non_surreal(self):
        assert SurrealNumber(1, 2).__mul__(5) is NotImplemented


class TestInfinitesimal:
    def test_add(self):
        result = Infinitesimal(1, 0.1) + Infinitesimal(2, 0.2)
        assert result.real == pytest.approx(3.0)
        assert result.eps == pytest.approx(0.3)

    def test_mul_drops_eps_squared(self):
        # (1 + ε)(2 + ε) = 2 + 3ε (dropping ε² term)
        result = Infinitesimal(1, 1) * Infinitesimal(2, 1)
        assert result.real == pytest.approx(2.0)
        assert result.eps == pytest.approx(3.0)

    def test_inverse(self):
        inv = Infinitesimal(2, 1).inverse()
        assert inv.real == pytest.approx(0.5)
        assert inv.eps == pytest.approx(-0.25)

    def test_add_non_infinitesimal(self):
        assert Infinitesimal(1, 0).__add__(5) is NotImplemented


class TestWaveNumber:
    def test_add_averages_frequency(self):
        result = WaveNumber(2, 1) + WaveNumber(3, 5)
        assert result.amplitude == pytest.approx(5.0)
        assert result.frequency == pytest.approx(3.0)

    def test_mul_adds_frequencies(self):
        result = WaveNumber(2, 3) * WaveNumber(4, 5)
        assert result.amplitude == pytest.approx(8.0)
        assert result.frequency == pytest.approx(8.0)

    def test_inverse(self):
        inv = WaveNumber(2, 3).inverse()
        assert inv.amplitude == pytest.approx(0.5)
        assert inv.frequency == pytest.approx(-3.0)
