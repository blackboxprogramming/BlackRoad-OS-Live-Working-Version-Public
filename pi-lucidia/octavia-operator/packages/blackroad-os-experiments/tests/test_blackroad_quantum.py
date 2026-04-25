"""Tests for BlackRoad Quantum Computing Framework."""

import math
import numpy as np
import pytest

from blackroad_quantum import (
    QuditSystem,
    Qutrit,
    TrinaryLogic,
    DistributedQudit,
    fibonacci_qudits,
    search_constant,
    test_high_dimensions as _test_high_dimensions,
    bell_test,
)


# ============================================================================
# QuditSystem tests
# ============================================================================


class TestQuditSystem:
    """Tests for the core QuditSystem class."""

    def test_init_dimensions(self):
        qs = QuditSystem(3, 5)
        assert qs.dim_A == 3
        assert qs.dim_B == 5
        assert qs.hilbert_dim == 15

    def test_init_square_dimensions(self):
        qs = QuditSystem(4, 4)
        assert qs.hilbert_dim == 16

    def test_entangled_state_normalized(self):
        qs = QuditSystem(3, 5, entangled=True)
        norm = np.linalg.norm(qs.state)
        assert abs(norm - 1.0) < 1e-10

    def test_non_entangled_state_normalized(self):
        qs = QuditSystem(3, 5, entangled=False)
        norm = np.linalg.norm(qs.state)
        assert abs(norm - 1.0) < 1e-10

    def test_state_length_matches_hilbert_dim(self):
        qs = QuditSystem(4, 7)
        assert len(qs.state) == 28

    def test_entropy_positive_for_entangled(self):
        qs = QuditSystem(3, 5, entangled=True)
        assert qs.entropy() > 0

    def test_entropy_returns_float(self):
        qs = QuditSystem(2, 3)
        assert isinstance(qs.entropy(), float)

    def test_max_entropy_formula(self):
        qs = QuditSystem(3, 5)
        expected = math.log2(min(3, 5))
        assert abs(qs.max_entropy() - expected) < 1e-10

    def test_max_entropy_symmetric(self):
        """max_entropy depends on min(dim_A, dim_B), so swapping should give same result."""
        qs1 = QuditSystem(3, 7)
        qs2 = QuditSystem(7, 3)
        assert abs(qs1.max_entropy() - qs2.max_entropy()) < 1e-10

    def test_entanglement_quality_range(self):
        qs = QuditSystem(3, 5, entangled=True)
        quality = qs.entanglement_quality()
        assert 0 <= quality <= 100

    def test_entanglement_quality_maximally_entangled_square(self):
        """For a square system (dim_A == dim_B), maximally entangled should be ~100%."""
        qs = QuditSystem(4, 4, entangled=True)
        quality = qs.entanglement_quality()
        assert quality > 99.0

    def test_geometric_ratio(self):
        qs = QuditSystem(3, 5)
        assert abs(qs.geometric_ratio() - 5.0 / 3.0) < 1e-10

    def test_geometric_ratio_integer_dims(self):
        qs = QuditSystem(2, 8)
        assert qs.geometric_ratio() == 4.0

    def test_measure_returns_dict(self):
        qs = QuditSystem(2, 2)
        result = qs.measure(shots=100)
        assert isinstance(result, dict)

    def test_measure_total_shots(self):
        shots = 500
        qs = QuditSystem(2, 3)
        result = qs.measure(shots=shots)
        total = sum(result.values())
        assert total == shots

    def test_measure_keys_are_ket_strings(self):
        qs = QuditSystem(2, 2)
        result = qs.measure(shots=100)
        for key in result.keys():
            assert key.startswith("|")

    def test_measure_default_shots(self):
        qs = QuditSystem(2, 2)
        result = qs.measure()
        total = sum(result.values())
        assert total == 1000


# ============================================================================
# Qutrit tests
# ============================================================================


class TestQutrit:
    """Tests for the Qutrit specialization."""

    def test_inherits_qudit_system(self):
        qt = Qutrit()
        assert isinstance(qt, QuditSystem)

    def test_dimensions_are_3x3(self):
        qt = Qutrit()
        assert qt.dim_A == 3
        assert qt.dim_B == 3
        assert qt.hilbert_dim == 9

    def test_superposition_default_normalized(self):
        qt = Qutrit()
        qt.superposition()
        norm = np.linalg.norm(qt.state)
        assert abs(norm - 1.0) < 1e-10

    def test_superposition_default_length(self):
        qt = Qutrit()
        qt.superposition()
        assert len(qt.state) == 3

    def test_superposition_equal_amplitudes(self):
        qt = Qutrit()
        qt.superposition()
        expected = 1.0 / math.sqrt(3)
        for amp in qt.state:
            assert abs(abs(amp) - expected) < 1e-10

    def test_superposition_custom_coefficients(self):
        qt = Qutrit()
        qt.superposition([1, 0, 0])
        assert abs(abs(qt.state[0]) - 1.0) < 1e-10
        assert abs(qt.state[1]) < 1e-10
        assert abs(qt.state[2]) < 1e-10


# ============================================================================
# TrinaryLogic tests
# ============================================================================


class TestTrinaryLogic:
    """Tests for trinary (base-3) logic operations."""

    def test_tnot_0(self):
        assert TrinaryLogic.tnot(0) == 2

    def test_tnot_1(self):
        assert TrinaryLogic.tnot(1) == 1

    def test_tnot_2(self):
        assert TrinaryLogic.tnot(2) == 0

    def test_tnot_involution(self):
        """Applying tnot twice returns original value."""
        for x in (0, 1, 2):
            assert TrinaryLogic.tnot(TrinaryLogic.tnot(x)) == x

    @pytest.mark.parametrize("x,y,expected", [
        (0, 0, 0), (0, 1, 0), (0, 2, 0),
        (1, 0, 0), (1, 1, 1), (1, 2, 1),
        (2, 0, 0), (2, 1, 1), (2, 2, 2),
    ])
    def test_tand_truth_table(self, x, y, expected):
        assert TrinaryLogic.tand(x, y) == expected

    @pytest.mark.parametrize("x,y,expected", [
        (0, 0, 0), (0, 1, 1), (0, 2, 2),
        (1, 0, 1), (1, 1, 1), (1, 2, 2),
        (2, 0, 2), (2, 1, 2), (2, 2, 2),
    ])
    def test_tor_truth_table(self, x, y, expected):
        assert TrinaryLogic.tor(x, y) == expected

    @pytest.mark.parametrize("x,y,expected", [
        (0, 0, 0), (0, 1, 1), (0, 2, 2),
        (1, 0, 1), (1, 1, 2), (1, 2, 0),
        (2, 0, 2), (2, 1, 0), (2, 2, 1),
    ])
    def test_txor_truth_table(self, x, y, expected):
        assert TrinaryLogic.txor(x, y) == expected

    @pytest.mark.parametrize("a,b,expected_sum,expected_carry", [
        (0, 0, 0, 0),
        (1, 0, 1, 0),
        (0, 2, 2, 0),
        (1, 1, 2, 0),
        (1, 2, 0, 1),
        (2, 2, 1, 1),
    ])
    def test_add(self, a, b, expected_sum, expected_carry):
        result = TrinaryLogic.add(a, b)
        assert result == (expected_sum, expected_carry)


# ============================================================================
# Function tests
# ============================================================================


class TestFibonacciQudits:
    """Tests for fibonacci_qudits function."""

    def test_returns_dict(self):
        result = fibonacci_qudits(5, 8)
        assert isinstance(result, dict)

    def test_expected_keys(self):
        result = fibonacci_qudits(5, 8)
        expected_keys = {'dimensions', 'ratio', 'phi_true', 'accuracy_percent', 'time_ms', 'hilbert_dim'}
        assert set(result.keys()) == expected_keys

    def test_34_55_ratio_close_to_phi(self):
        result = fibonacci_qudits(34, 55)
        phi = (1 + math.sqrt(5)) / 2
        assert abs(result['ratio'] - phi) < 0.01

    def test_34_55_accuracy_above_99(self):
        result = fibonacci_qudits(34, 55)
        assert result['accuracy_percent'] > 99.0

    def test_hilbert_dim(self):
        result = fibonacci_qudits(8, 13)
        assert result['hilbert_dim'] == 104


class TestSearchConstant:
    """Tests for search_constant function."""

    def test_returns_list(self):
        result = search_constant(math.pi, max_dim=50)
        assert isinstance(result, list)

    def test_finds_pi_matches(self):
        result = search_constant(math.pi, max_dim=50)
        assert len(result) > 0

    def test_results_sorted_by_accuracy(self):
        result = search_constant(math.pi, max_dim=50)
        if len(result) >= 2:
            for i in range(len(result) - 1):
                assert result[i]['accuracy_percent'] >= result[i + 1]['accuracy_percent']

    def test_all_results_above_95_percent(self):
        result = search_constant(math.e, max_dim=50)
        for r in result:
            assert r['accuracy_percent'] > 95.0


class TestBellTest:
    """Tests for bell_test function."""

    def test_returns_dict(self):
        result = bell_test()
        assert isinstance(result, dict)

    def test_expected_keys(self):
        result = bell_test()
        expected_keys = {'test', 'dimensions', 'entropy', 'max_entropy', 'entanglement_percent', 'state'}
        assert set(result.keys()) == expected_keys

    def test_entropy_near_one(self):
        result = bell_test()
        assert abs(result['entropy'] - 1.0) < 0.1

    def test_max_entropy_is_one(self):
        result = bell_test()
        assert abs(result['max_entropy'] - 1.0) < 1e-10


class TestHighDimensions:
    """Tests for test_high_dimensions function."""

    def test_returns_correct_length(self):
        dims = [(2, 3), (5, 7), (3, 4)]
        result = _test_high_dimensions(dims)
        assert len(result) == 3

    def test_result_keys(self):
        result = _test_high_dimensions([(2, 3)])
        assert 'entropy' in result[0]
        assert 'hilbert_dim' in result[0]
        assert 'dimensions' in result[0]


class TestDistributedQudit:
    """Tests for DistributedQudit (sequential fallback)."""

    def test_parallel_entropy_returns_list(self):
        dq = DistributedQudit()
        result = dq.parallel_entropy([(2, 3), (3, 4)])
        assert isinstance(result, list)
        assert len(result) == 2

    def test_parallel_entropy_has_entropy_key(self):
        dq = DistributedQudit()
        result = dq.parallel_entropy([(2, 3)])
        assert 'entropy' in result[0]
        assert 'hilbert_dim' in result[0]
