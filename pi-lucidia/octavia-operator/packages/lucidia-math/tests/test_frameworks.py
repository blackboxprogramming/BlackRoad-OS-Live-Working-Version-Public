"""Tests for lab.frameworks — backend selection."""

import pytest
from lab.frameworks import available_backends, backend_names, select_backend, MathBackend


class TestFrameworks:
    def test_numpy_always_available(self):
        backends = available_backends()
        names = [b.name for b in backends]
        assert "numpy" in names

    def test_backend_names_returns_list(self):
        names = backend_names()
        assert isinstance(names, list)
        assert "numpy" in names

    def test_select_default(self):
        backend = select_backend()
        assert isinstance(backend, MathBackend)
        assert backend.array_module is not None

    def test_select_numpy(self):
        backend = select_backend("numpy")
        assert backend.name == "numpy"
        assert backend.supports_autodiff is False

    def test_select_unknown_raises(self):
        with pytest.raises(ValueError, match="Unknown"):
            select_backend("nonexistent_backend")
