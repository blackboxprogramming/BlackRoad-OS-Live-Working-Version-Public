"""Tests for lab.amundson_equations — Amundson I/II/III formulations."""

import math
import numpy as np
import pytest
from lab.amundson_equations import (
    coherence,
    decoherence_energy,
    phase_derivative,
    AmundsonCoherenceModel,
    amundson_energy_balance,
    amundson_learning_update,
)


class TestCoherence:
    def test_aligned_phases(self):
        assert coherence(0.0, 0.0) == pytest.approx(1.0)

    def test_opposite_phases(self):
        assert coherence(0.0, math.pi) == pytest.approx(-1.0)

    def test_orthogonal_phases(self):
        assert coherence(0.0, math.pi / 2) == pytest.approx(0.0, abs=1e-10)

    def test_symmetric(self):
        assert coherence(0.5, 1.0) == pytest.approx(coherence(1.0, 0.5))


class TestDecoherenceEnergy:
    def test_aligned_zero_energy(self):
        e = decoherence_energy(phi_x=0, phi_y=0, r_x=1, r_y=1, lambda_=1, k_b_t=1)
        assert e == pytest.approx(0.0)

    def test_opposite_max_energy(self):
        e = decoherence_energy(phi_x=0, phi_y=math.pi, r_x=1, r_y=1, lambda_=1, k_b_t=1)
        assert e == pytest.approx(2.0)

    def test_scales_with_temperature(self):
        e1 = decoherence_energy(phi_x=0, phi_y=1, r_x=1, r_y=1, lambda_=1, k_b_t=1)
        e2 = decoherence_energy(phi_x=0, phi_y=1, r_x=1, r_y=1, lambda_=1, k_b_t=2)
        assert e2 == pytest.approx(2 * e1)


class TestPhaseDerivative:
    def test_aligned_maximum(self):
        # When aligned, C=1 and E=0, so dphi/dt = omega_0 + lambda
        d = phase_derivative(
            omega_0=1, lambda_=0.5, eta=0.1,
            phi_x=0, phi_y=0, r_x=1, r_y=1, k_b_t=1,
        )
        assert d == pytest.approx(1.5)

    def test_zero_coupling(self):
        d = phase_derivative(
            omega_0=2, lambda_=0, eta=0,
            phi_x=0, phi_y=1, r_x=1, r_y=1, k_b_t=1,
        )
        assert d == pytest.approx(2.0)


class TestAmundsonCoherenceModel:
    def test_dphi_dt(self):
        model = AmundsonCoherenceModel(omega_0=1, lambda_=0.5, eta=0.1, k_b_t=1)
        d = model.dphi_dt(phi_x=0, phi_y=0, r_x=1, r_y=1)
        assert d == pytest.approx(1.5)

    def test_evolve(self):
        model = AmundsonCoherenceModel(omega_0=1, lambda_=0.5, eta=0.1, k_b_t=1)
        updates = []

        class MockSystem:
            def update_phase(self, d_phi_dt):
                updates.append(d_phi_dt)

        d = model.evolve(MockSystem(), phi_x=0, phi_y=0, r_x=1, r_y=1)
        assert len(updates) == 1
        assert updates[0] == pytest.approx(d)


class TestAmundsonEnergyBalance:
    def test_positive_balance(self):
        assert amundson_energy_balance(energy=10, dissipation=3) == pytest.approx(7)

    def test_clamp_at_zero(self):
        assert amundson_energy_balance(energy=3, dissipation=10) == pytest.approx(0)

    def test_negative_energy_raises(self):
        with pytest.raises(ValueError, match="energy"):
            amundson_energy_balance(energy=-1, dissipation=0)

    def test_negative_dissipation_raises(self):
        with pytest.raises(ValueError, match="dissipation"):
            amundson_energy_balance(energy=1, dissipation=-1)


class TestAmundsonLearningUpdate:
    def test_deterministic_gradient_descent(self):
        w = np.array([1.0, 2.0])
        g = np.array([0.1, 0.2])
        metric = np.eye(2)
        result = amundson_learning_update(
            weights=w, gradient=g, metric=metric,
            learning_rate=0.5, k_b_t=0.0,
        )
        expected = w - 0.5 * g
        np.testing.assert_allclose(result, expected)

    def test_with_noise(self):
        w = np.array([1.0, 2.0])
        g = np.array([0.0, 0.0])
        metric = np.eye(2)
        noise = np.array([1.0, 0.0])
        result = amundson_learning_update(
            weights=w, gradient=g, metric=metric,
            learning_rate=1.0, k_b_t=0.5, noise=noise,
        )
        # With zero gradient, result = w + scale * G^{-1/2} * noise
        assert not np.allclose(result, w)

    def test_shape_mismatch_raises(self):
        with pytest.raises(ValueError, match="shape"):
            amundson_learning_update(
                weights=np.array([1.0]),
                gradient=np.array([1.0, 2.0]),
                metric=np.eye(1),
                learning_rate=0.1, k_b_t=0,
            )

    def test_non_symmetric_metric_raises(self):
        with pytest.raises(ValueError, match="symmetric"):
            amundson_learning_update(
                weights=np.array([1.0, 2.0]),
                gradient=np.array([0.1, 0.2]),
                metric=np.array([[1.0, 0.5], [0.0, 1.0]]),
                learning_rate=0.1, k_b_t=0,
            )
