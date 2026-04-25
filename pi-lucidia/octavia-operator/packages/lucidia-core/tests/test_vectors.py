"""Tests for core vector mathematics."""

import math
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from core.vectors import Vector3


class TestVector3Construction:
    def test_create(self):
        v = Vector3(1.0, 2.0, 3.0)
        assert v.x == 1.0
        assert v.y == 2.0
        assert v.z == 3.0

    def test_frozen(self):
        v = Vector3(1.0, 2.0, 3.0)
        with pytest.raises(AttributeError):
            v.x = 5.0

    def test_as_tuple(self):
        v = Vector3(1.0, 2.0, 3.0)
        assert v.as_tuple() == (1.0, 2.0, 3.0)


class TestVector3Arithmetic:
    def test_add(self):
        a = Vector3(1.0, 2.0, 3.0)
        b = Vector3(4.0, 5.0, 6.0)
        c = a + b
        assert c.as_tuple() == (5.0, 7.0, 9.0)

    def test_sub(self):
        a = Vector3(5.0, 7.0, 9.0)
        b = Vector3(1.0, 2.0, 3.0)
        c = a - b
        assert c.as_tuple() == (4.0, 5.0, 6.0)

    def test_mul_scalar(self):
        v = Vector3(1.0, 2.0, 3.0)
        result = v * 2.0
        assert result.as_tuple() == (2.0, 4.0, 6.0)

    def test_rmul_scalar(self):
        v = Vector3(1.0, 2.0, 3.0)
        result = 3.0 * v
        assert result.as_tuple() == (3.0, 6.0, 9.0)

    def test_dot_product(self):
        a = Vector3(1.0, 0.0, 0.0)
        b = Vector3(0.0, 1.0, 0.0)
        assert a.dot(b) == 0.0  # orthogonal

    def test_dot_product_parallel(self):
        a = Vector3(1.0, 2.0, 3.0)
        assert a.dot(a) == 14.0  # 1+4+9

    def test_norm(self):
        v = Vector3(3.0, 4.0, 0.0)
        assert v.norm() == 5.0

    def test_norm_unit(self):
        v = Vector3(1.0, 0.0, 0.0)
        assert v.norm() == 1.0

    def test_norm_zero(self):
        v = Vector3(0.0, 0.0, 0.0)
        assert v.norm() == 0.0

    def test_add_identity(self):
        v = Vector3(1.0, 2.0, 3.0)
        zero = Vector3(0.0, 0.0, 0.0)
        assert (v + zero).as_tuple() == v.as_tuple()

    def test_sub_self_is_zero(self):
        v = Vector3(1.0, 2.0, 3.0)
        result = v - v
        assert result.norm() == 0.0
