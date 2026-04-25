"""Tests for forge.operators — paradox_merge, infinite_fold, collapse."""

import pytest
from forge.operators import paradox_merge, infinite_fold, collapse


class TestParadoxMerge:
    def test_basic(self):
        assert paradox_merge(3, 1) == (4, 2)

    def test_negative(self):
        assert paradox_merge(-2, 5) == (3, -7)

    def test_zero(self):
        assert paradox_merge(0, 0) == (0, 0)

    def test_floats(self):
        s, d = paradox_merge(1.5, 0.5)
        assert s == pytest.approx(2.0)
        assert d == pytest.approx(1.0)

    def test_non_commutative(self):
        assert paradox_merge(3, 1) != paradox_merge(1, 3)


class TestInfiniteFold:
    def test_sum(self):
        assert infinite_fold(lambda x, y: x + y, [1, 2, 3, 4]) == 10

    def test_product(self):
        assert infinite_fold(lambda x, y: x * y, [1, 2, 3, 4]) == 24

    def test_single_element(self):
        assert infinite_fold(lambda x, y: x + y, [42]) == 42

    def test_empty_raises(self):
        with pytest.raises(TypeError):
            infinite_fold(lambda x, y: x + y, [])


class TestCollapse:
    def test_list(self):
        assert collapse([1, 2, 3]) == 6  # (1+2)+3 via paradox_merge sum

    def test_empty(self):
        assert collapse([]) is None

    def test_scalar(self):
        assert collapse(42) == 42

    def test_string_passthrough(self):
        assert collapse("hello") == "hello"

    def test_single_item_list(self):
        assert collapse([7]) == 7
