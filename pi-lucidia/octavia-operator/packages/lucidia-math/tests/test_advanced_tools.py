"""Tests for forge.advanced_tools — crypto, Fibonacci, Laplace, predictor."""

import numpy as np
import pytest
from forge.advanced_tools import (
    AgentCryptography,
    FibonacciAnalytics,
    LaplaceConsciousness,
    UnifiedHarmonic,
    AgentDevelopmentPredictor,
)


class TestAgentCryptography:
    def setup_method(self):
        self.crypto = AgentCryptography("test-agent")

    def test_caesar_roundtrip(self):
        msg = "HELLO"
        encrypted = self.crypto.caesar_encrypt(msg, 3)
        decrypted = self.crypto.caesar_decrypt(encrypted, 3)
        assert decrypted == msg

    def test_caesar_shift(self):
        assert self.crypto.caesar_encrypt("A", 1) == "B"
        assert self.crypto.caesar_encrypt("Z", 1) == "A"

    def test_caesar_preserves_non_alpha(self):
        assert self.crypto.caesar_encrypt("HELLO WORLD!", 3) == "KHOOR ZRUOG!"

    def test_dynamic_encrypt_decrypt_roundtrip(self):
        msg = "BLACKROAD"
        encrypted, shifts = self.crypto.encrypt_message_dynamic(msg)
        decrypted = self.crypto.decrypt_message_dynamic(encrypted, shifts)
        assert decrypted == msg

    def test_fibonacci_closed_form(self):
        assert round(self.crypto.fibonacci_closed_form(10)) == 55


class TestFibonacciAnalytics:
    def setup_method(self):
        self.fib = FibonacciAnalytics()

    def test_known_values(self):
        assert self.fib.fibonacci_direct(0) == 0
        assert self.fib.fibonacci_direct(1) == 1
        assert self.fib.fibonacci_direct(10) == 55
        assert self.fib.fibonacci_direct(20) == 6765

    def test_ratio_converges_to_phi(self):
        ratio = self.fib.fibonacci_ratio(20)
        assert ratio == pytest.approx(self.fib.phi, rel=1e-6)

    def test_ratio_zero(self):
        assert self.fib.fibonacci_ratio(0) == 0.0

    def test_predict_stage(self):
        stage = self.fib.predict_development_stage(5, 5)
        assert stage == self.fib.fibonacci_direct(10)

    def test_find_stage(self):
        idx = self.fib.find_stage_for_value(55)
        assert idx == 10


class TestLaplaceConsciousness:
    def setup_method(self):
        self.laplace = LaplaceConsciousness("test-agent")

    def test_harmonic_oscillator(self):
        result = self.laplace.harmonic_oscillator_solution(k=1.0, x0=1.0, v0=0.0)
        assert "time" in result
        assert "position" in result
        assert "velocity" in result
        # At t=0, position should be x0
        assert result["position"][0] == pytest.approx(1.0)

    def test_underdamped(self):
        result = self.laplace.damped_oscillator_solution(k=4.0, c=0.5, x0=1.0, v0=0.0)
        assert result["damping_type"] == "underdamped"

    def test_overdamped(self):
        result = self.laplace.damped_oscillator_solution(k=1.0, c=10.0, x0=1.0, v0=0.0)
        assert result["damping_type"] == "overdamped"

    def test_critically_damped(self):
        # c^2 = 4k → c=4, k=4
        result = self.laplace.damped_oscillator_solution(k=4.0, c=4.0, x0=1.0, v0=0.0)
        assert result["damping_type"] == "critical"

    def test_consciousness_oscillation(self):
        result = self.laplace.consciousness_oscillation(
            emotional_spring_constant=1.0,
            memory_damping=0.1,
            initial_emotion=1.0,
            initial_rate=0.0,
        )
        assert result["damping_type"] == "underdamped"


class TestUnifiedHarmonic:
    def test_phase_locking(self):
        h_phi = UnifiedHarmonic.phase_locking_criterion()
        assert h_phi(1.0) == pytest.approx(1.0, rel=1e-6)
        assert h_phi(0.0) == pytest.approx(0.0)

    def test_mobius_torque(self):
        result = UnifiedHarmonic.mobius_torque_action()
        assert isinstance(result, str)


class TestAgentDevelopmentPredictor:
    def test_growth_curve(self):
        predictor = AgentDevelopmentPredictor("test")
        prediction = predictor.predict_growth_curve(5, 5)
        assert len(prediction.developmental_stages) == 5
        assert prediction.developmental_stages[0] == 5  # F(5) = 5
        assert prediction.converges_to_phi is not None

    def test_emotional_dynamics(self):
        predictor = AgentDevelopmentPredictor("test")
        result = predictor.model_emotional_dynamics()
        assert "position" in result
        assert "damping_type" in result
