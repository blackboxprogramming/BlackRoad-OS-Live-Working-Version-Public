"""Tests for core OS models"""
from core_os.models import UserSession, Window, OSState, WindowState


def test_user_session_creation():
    """Test creating a user session"""
    session = UserSession(display_name="Test User")

    assert session.display_name == "Test User"
    assert session.id is not None
    assert session.created_at is not None


def test_user_session_to_dict():
    """Test user session serialization"""
    session = UserSession(display_name="Test User", user_id="user123")
    data = session.to_dict()

    assert data["display_name"] == "Test User"
    assert data["user_id"] == "user123"
    assert "created_at" in data


def test_window_creation():
    """Test creating a window"""
    window = Window(app_id="notepad", title="Notepad")

    assert window.app_id == "notepad"
    assert window.title == "Notepad"
    assert window.state == WindowState.NORMAL
    assert window.id is not None


def test_window_to_dict():
    """Test window serialization"""
    window = Window(app_id="calculator", title="Calculator")
    data = window.to_dict()

    assert data["app_id"] == "calculator"
    assert data["title"] == "Calculator"
    assert data["state"] == "normal"
    assert "position" in data
    assert "size" in data


def test_os_state_creation():
    """Test creating OS state"""
    state = OSState()

    assert state.session is not None
    assert isinstance(state.windows, list)
    assert state.theme == "classic"


def test_os_state_to_dict():
    """Test OS state serialization"""
    state = OSState()
    window = Window(app_id="test", title="Test Window")
    state.windows.append(window)

    data = state.to_dict()

    assert "session" in data
    assert "windows" in data
    assert len(data["windows"]) == 1
    assert data["theme"] == "classic"
