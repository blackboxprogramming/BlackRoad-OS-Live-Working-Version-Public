"""Core OS data models"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
import uuid


class WindowState(str, Enum):
    """Window state"""

    NORMAL = "normal"
    MINIMIZED = "minimized"
    MAXIMIZED = "maximized"
    CLOSED = "closed"


@dataclass
class UserSession:
    """
    Represents a user session in BlackRoad OS

    Attributes:
        id: Unique session identifier
        user_id: User ID (from auth system)
        display_name: Display name for the session
        created_at: Session creation timestamp
        last_activity: Last activity timestamp
        metadata: Additional session metadata
    """

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    display_name: str = "Guest"
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_activity: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "display_name": self.display_name,
            "created_at": self.created_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "metadata": self.metadata,
        }


@dataclass
class Window:
    """
    Represents a window in the OS

    Attributes:
        id: Unique window identifier
        app_id: Application identifier
        title: Window title
        state: Window state (normal, minimized, maximized)
        position: Window position (x, y)
        size: Window size (width, height)
        z_index: Z-index for layering
        created_at: Window creation timestamp
        metadata: Additional window metadata
    """

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    app_id: str = ""
    title: str = "Untitled"
    state: WindowState = WindowState.NORMAL
    position: tuple[int, int] = (100, 100)
    size: tuple[int, int] = (800, 600)
    z_index: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "app_id": self.app_id,
            "title": self.title,
            "state": self.state.value,
            "position": {"x": self.position[0], "y": self.position[1]},
            "size": {"width": self.size[0], "height": self.size[1]},
            "z_index": self.z_index,
            "created_at": self.created_at.isoformat(),
            "metadata": self.metadata,
        }


@dataclass
class OSState:
    """
    Represents the current state of the operating system

    Attributes:
        session: Current user session
        windows: List of open windows
        active_window_id: ID of the currently active window
        desktop_items: Desktop icons/shortcuts
        taskbar_items: Taskbar items
        system_tray_items: System tray items
        theme: Current theme name
        metadata: Additional OS state metadata
    """

    session: UserSession = field(default_factory=UserSession)
    windows: List[Window] = field(default_factory=list)
    active_window_id: Optional[str] = None
    desktop_items: List[Dict[str, Any]] = field(default_factory=list)
    taskbar_items: List[Dict[str, Any]] = field(default_factory=list)
    system_tray_items: List[Dict[str, Any]] = field(default_factory=list)
    theme: str = "classic"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "session": self.session.to_dict(),
            "windows": [w.to_dict() for w in self.windows],
            "active_window_id": self.active_window_id,
            "desktop_items": self.desktop_items,
            "taskbar_items": self.taskbar_items,
            "system_tray_items": self.system_tray_items,
            "theme": self.theme,
            "metadata": self.metadata,
        }
