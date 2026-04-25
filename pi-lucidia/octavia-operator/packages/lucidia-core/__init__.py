"""Lucidia engines and utilities."""

import os
import sys

# Ensure the repository root is on sys.path so absolute imports resolve correctly
# when this module is loaded as a top-level package (e.g. during testing).
_repo_root = os.path.dirname(os.path.abspath(__file__))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from core import Vector3  # noqa: E402
from harmony import HarmonyCoordinator, NodeProfile  # noqa: E402
from rpg import Character, Game  # noqa: E402

__all__ = ["Character", "Game", "HarmonyCoordinator", "NodeProfile", "Vector3"]
