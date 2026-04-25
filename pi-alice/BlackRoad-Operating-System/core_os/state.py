"""Core OS state management"""
from typing import Optional
from core_os.models import OSState, Window, UserSession, WindowState


# Global in-memory state (in production, this would be in Redis/DB)
_current_state: Optional[OSState] = None


def get_initial_state() -> OSState:
    """
    Get initial OS state

    Returns:
        Fresh OSState with default configuration
    """
    global _current_state

    if _current_state is None:
        _current_state = OSState(
            session=UserSession(display_name="BlackRoad User"),
            desktop_items=[
                {
                    "id": "my-computer",
                    "label": "My Computer",
                    "icon": "🖥️",
                    "app_id": "computer",
                },
                {
                    "id": "prism-console",
                    "label": "Prism Console",
                    "icon": "⚡",
                    "app_id": "prism",
                },
                {
                    "id": "lucidia",
                    "label": "Lucidia",
                    "icon": "🧠",
                    "app_id": "lucidia",
                },
            ],
            taskbar_items=[
                {"id": "start-menu", "label": "Start", "icon": "🪟"},
            ],
            system_tray_items=[
                {"id": "network", "icon": "🌐", "status": "connected"},
                {"id": "volume", "icon": "🔊", "status": "on"},
                {"id": "clock", "icon": "🕐", "status": "active"},
            ],
        )

    return _current_state


def get_current_state() -> OSState:
    """Get current OS state (or initialize if not exists)"""
    return get_initial_state()


def open_window(app_id: str, title: Optional[str] = None) -> OSState:
    """
    Open a new window for the specified app

    Args:
        app_id: Application identifier
        title: Window title (optional, defaults to app_id)

    Returns:
        Updated OS state
    """
    state = get_current_state()

    # Create new window
    window = Window(
        app_id=app_id,
        title=title or app_id.replace("-", " ").title(),
        z_index=len(state.windows),
    )

    # Add to windows list
    state.windows.append(window)
    state.active_window_id = window.id

    return state


def close_window(window_id: str) -> OSState:
    """
    Close a window

    Args:
        window_id: Window identifier

    Returns:
        Updated OS state
    """
    state = get_current_state()

    # Find and remove window
    state.windows = [w for w in state.windows if w.id != window_id]

    # Update active window if needed
    if state.active_window_id == window_id:
        state.active_window_id = state.windows[0].id if state.windows else None

    return state


def minimize_window(window_id: str) -> OSState:
    """
    Minimize a window

    Args:
        window_id: Window identifier

    Returns:
        Updated OS state
    """
    state = get_current_state()

    for window in state.windows:
        if window.id == window_id:
            window.state = WindowState.MINIMIZED
            break

    return state


def maximize_window(window_id: str) -> OSState:
    """
    Maximize a window

    Args:
        window_id: Window identifier

    Returns:
        Updated OS state
    """
    state = get_current_state()

    for window in state.windows:
        if window.id == window_id:
            window.state = WindowState.MAXIMIZED
            break

    return state


def set_active_window(window_id: str) -> OSState:
    """
    Set the active (focused) window

    Args:
        window_id: Window identifier

    Returns:
        Updated OS state
    """
    state = get_current_state()
    state.active_window_id = window_id
    return state


def reset_state() -> OSState:
    """Reset OS state to initial state"""
    global _current_state
    _current_state = None
    return get_initial_state()
