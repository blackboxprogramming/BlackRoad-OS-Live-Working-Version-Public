"""
BlackRoad Core OS Runtime

The core operating system layer that manages state, windows, apps, and user sessions.
"""

__version__ = "0.1.0"
__author__ = "BlackRoad OS Team"

from core_os.models import UserSession, Window, OSState
from core_os.state import get_initial_state, open_window, close_window

__all__ = ["UserSession", "Window", "OSState", "get_initial_state", "open_window", "close_window"]
