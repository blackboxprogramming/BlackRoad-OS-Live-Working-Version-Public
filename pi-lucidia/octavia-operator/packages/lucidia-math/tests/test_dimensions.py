"""Tests for forge.dimensions — hyper_equation, HyperPoint."""

import pytest
from forge.dimensions import hyper_equation, HyperPoint


class TestHyperEquation:
    def test_basic(self):
        assert hyper_equation(2, 3, 4) == 24

    def test_zero(self):
        assert hyper_equation(0, 5, 10) == 0

    def test_negative(self):
        assert hyper_equation(-1, 2, 3) == -6


class TestHyperPoint:
    def test_project_3d(self):
        p = HyperPoint([1, 2, 3, 4])
        assert p.project(3) == [1, 2, 3]

    def test_project_2d(self):
        p = HyperPoint([1, 2, 3, 4])
        assert p.project(2) == [1, 2]

    def test_project_default(self):
        p = HyperPoint([1, 2, 3, 4])
        assert len(p.project()) == 3
