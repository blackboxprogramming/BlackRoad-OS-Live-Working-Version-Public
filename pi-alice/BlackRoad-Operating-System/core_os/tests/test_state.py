"""Tests for OS state management"""
from core_os.state import (
    get_initial_state,
    get_current_state,
    open_window,
    close_window,
    minimize_window,
    maximize_window,
    set_active_window,
    reset_state,
)
from core_os.models import WindowState


def test_get_initial_state():
    """Test getting initial OS state"""
    reset_state()  # Reset to clean state
    state = get_initial_state()

    assert state is not None
    assert state.session is not None
    assert len(state.desktop_items) > 0
    assert len(state.taskbar_items) > 0


def test_open_window():
    """Test opening a new window"""
    reset_state()
    initial_count = len(get_current_state().windows)

    state = open_window("notepad", "Notepad")

    assert len(state.windows) == initial_count + 1
    assert state.windows[-1].app_id == "notepad"
    assert state.windows[-1].title == "Notepad"
    assert state.active_window_id == state.windows[-1].id


def test_close_window():
    """Test closing a window"""
    reset_state()

    # Open a window first
    state = open_window("test-app")
    window_id = state.windows[0].id
    initial_count = len(state.windows)

    # Close it
    state = close_window(window_id)

    assert len(state.windows) == initial_count - 1


def test_minimize_window():
    """Test minimizing a window"""
    reset_state()

    # Open and minimize
    state = open_window("test-app")
    window_id = state.windows[0].id

    state = minimize_window(window_id)

    assert state.windows[0].state == WindowState.MINIMIZED


def test_maximize_window():
    """Test maximizing a window"""
    reset_state()

    # Open and maximize
    state = open_window("test-app")
    window_id = state.windows[0].id

    state = maximize_window(window_id)

    assert state.windows[0].state == WindowState.MAXIMIZED


def test_set_active_window():
    """Test setting active window"""
    reset_state()

    # Open two windows
    open_window("app1")
    open_window("app2")

    state = get_current_state()
    first_window_id = state.windows[0].id

    # Set first window as active
    state = set_active_window(first_window_id)

    assert state.active_window_id == first_window_id
