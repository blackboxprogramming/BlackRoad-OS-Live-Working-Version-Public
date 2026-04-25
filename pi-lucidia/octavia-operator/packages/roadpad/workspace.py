"""
RoadPad Workspace - Project management.

Features:
- Project sessions
- Multi-root workspace
- Layout persistence
- Recent projects
"""

import os
import json
from dataclasses import dataclass, field
from typing import Dict, List, Any
from datetime import datetime


@dataclass
class WorkspaceBuffer:
    """A buffer in the workspace."""
    filepath: str
    cursor_row: int = 0
    cursor_col: int = 0
    scroll_row: int = 0
    active: bool = False


@dataclass
class WorkspaceLayout:
    """Layout of splits/panes."""
    type: str = "single"  # single, hsplit, vsplit
    children: List["WorkspaceLayout"] = field(default_factory=list)
    buffer_index: int = 0
    ratio: float = 0.5


@dataclass
class Workspace:
    """A workspace/project."""
    name: str
    root_paths: List[str] = field(default_factory=list)
    buffers: List[WorkspaceBuffer] = field(default_factory=list)
    layout: WorkspaceLayout | None = None
    created: str = field(default_factory=lambda: datetime.now().isoformat())
    last_opened: str = field(default_factory=lambda: datetime.now().isoformat())
    settings: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict:
        def layout_to_dict(l: WorkspaceLayout) -> Dict:
            return {
                "type": l.type,
                "children": [layout_to_dict(c) for c in l.children],
                "buffer_index": l.buffer_index,
                "ratio": l.ratio
            }

        return {
            "name": self.name,
            "root_paths": self.root_paths,
            "buffers": [
                {
                    "filepath": b.filepath,
                    "cursor_row": b.cursor_row,
                    "cursor_col": b.cursor_col,
                    "scroll_row": b.scroll_row,
                    "active": b.active
                }
                for b in self.buffers
            ],
            "layout": layout_to_dict(self.layout) if self.layout else None,
            "created": self.created,
            "last_opened": self.last_opened,
            "settings": self.settings
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "Workspace":
        def layout_from_dict(d: Dict) -> WorkspaceLayout:
            return WorkspaceLayout(
                type=d.get("type", "single"),
                children=[layout_from_dict(c) for c in d.get("children", [])],
                buffer_index=d.get("buffer_index", 0),
                ratio=d.get("ratio", 0.5)
            )

        ws = cls(
            name=data["name"],
            root_paths=data.get("root_paths", []),
            created=data.get("created", ""),
            last_opened=data.get("last_opened", ""),
            settings=data.get("settings", {})
        )

        for b in data.get("buffers", []):
            ws.buffers.append(WorkspaceBuffer(
                filepath=b["filepath"],
                cursor_row=b.get("cursor_row", 0),
                cursor_col=b.get("cursor_col", 0),
                scroll_row=b.get("scroll_row", 0),
                active=b.get("active", False)
            ))

        if data.get("layout"):
            ws.layout = layout_from_dict(data["layout"])

        return ws


class WorkspaceManager:
    """Manages workspaces/projects."""

    def __init__(self, workspaces_dir: str | None = None):
        self.workspaces_dir = workspaces_dir or os.path.expanduser("~/.roadpad/workspaces")
        os.makedirs(self.workspaces_dir, exist_ok=True)

        self.workspaces: Dict[str, Workspace] = {}
        self.current_workspace: Workspace | None = None
        self.recent: List[str] = []
        self.max_recent = 10

        self._load_all()

    def _load_all(self) -> None:
        """Load all workspaces."""
        # Load workspaces
        for filename in os.listdir(self.workspaces_dir):
            if filename.endswith(".json") and filename != "recent.json":
                filepath = os.path.join(self.workspaces_dir, filename)
                try:
                    with open(filepath, "r") as f:
                        data = json.load(f)
                    ws = Workspace.from_dict(data)
                    self.workspaces[ws.name] = ws
                except:
                    pass

        # Load recent
        recent_file = os.path.join(self.workspaces_dir, "recent.json")
        if os.path.exists(recent_file):
            try:
                with open(recent_file, "r") as f:
                    self.recent = json.load(f)
            except:
                pass

    def _save_workspace(self, ws: Workspace) -> None:
        """Save workspace to disk."""
        filepath = os.path.join(self.workspaces_dir, f"{ws.name}.json")
        with open(filepath, "w") as f:
            json.dump(ws.to_dict(), f, indent=2)

    def _save_recent(self) -> None:
        """Save recent list."""
        filepath = os.path.join(self.workspaces_dir, "recent.json")
        with open(filepath, "w") as f:
            json.dump(self.recent, f)

    def create(self, name: str, root_paths: List[str] | None = None) -> Workspace:
        """Create new workspace."""
        ws = Workspace(
            name=name,
            root_paths=root_paths or [os.getcwd()]
        )
        self.workspaces[name] = ws
        self._save_workspace(ws)
        return ws

    def open(self, name: str) -> Workspace | None:
        """Open workspace."""
        if name not in self.workspaces:
            return None

        ws = self.workspaces[name]
        ws.last_opened = datetime.now().isoformat()
        self.current_workspace = ws

        # Update recent
        if name in self.recent:
            self.recent.remove(name)
        self.recent.insert(0, name)
        self.recent = self.recent[:self.max_recent]

        self._save_workspace(ws)
        self._save_recent()

        return ws

    def save_current(self) -> None:
        """Save current workspace state."""
        if self.current_workspace:
            self._save_workspace(self.current_workspace)

    def close_current(self) -> None:
        """Close current workspace."""
        if self.current_workspace:
            self._save_workspace(self.current_workspace)
            self.current_workspace = None

    def delete(self, name: str) -> bool:
        """Delete workspace."""
        if name not in self.workspaces:
            return False

        del self.workspaces[name]
        filepath = os.path.join(self.workspaces_dir, f"{name}.json")
        if os.path.exists(filepath):
            os.remove(filepath)

        if name in self.recent:
            self.recent.remove(name)
            self._save_recent()

        if self.current_workspace and self.current_workspace.name == name:
            self.current_workspace = None

        return True

    def add_buffer(self, filepath: str, cursor_row: int = 0, cursor_col: int = 0) -> None:
        """Add buffer to current workspace."""
        if not self.current_workspace:
            return

        # Check if already exists
        for b in self.current_workspace.buffers:
            if b.filepath == filepath:
                b.cursor_row = cursor_row
                b.cursor_col = cursor_col
                return

        self.current_workspace.buffers.append(WorkspaceBuffer(
            filepath=filepath,
            cursor_row=cursor_row,
            cursor_col=cursor_col
        ))

    def remove_buffer(self, filepath: str) -> None:
        """Remove buffer from current workspace."""
        if not self.current_workspace:
            return

        self.current_workspace.buffers = [
            b for b in self.current_workspace.buffers
            if b.filepath != filepath
        ]

    def set_active_buffer(self, filepath: str) -> None:
        """Set active buffer."""
        if not self.current_workspace:
            return

        for b in self.current_workspace.buffers:
            b.active = (b.filepath == filepath)

    def get_active_buffer(self) -> WorkspaceBuffer | None:
        """Get active buffer."""
        if not self.current_workspace:
            return None

        for b in self.current_workspace.buffers:
            if b.active:
                return b
        return None

    def list_workspaces(self) -> List[Workspace]:
        """List all workspaces."""
        return sorted(
            self.workspaces.values(),
            key=lambda w: w.last_opened,
            reverse=True
        )

    def get_recent(self) -> List[Workspace]:
        """Get recent workspaces."""
        return [
            self.workspaces[name]
            for name in self.recent
            if name in self.workspaces
        ]

    def format_list(self) -> str:
        """Format workspace list for display."""
        lines = ["Workspaces", "=" * 40, ""]

        workspaces = self.list_workspaces()
        if not workspaces:
            lines.append("No workspaces")
            lines.append("")
            lines.append(":workspace new <name> - Create workspace")
            return "\n".join(lines)

        # Recent
        recent = self.get_recent()
        if recent:
            lines.append("[Recent]")
            for ws in recent[:5]:
                active = ">" if ws == self.current_workspace else " "
                roots = ", ".join(os.path.basename(r) for r in ws.root_paths[:2])
                lines.append(f"{active} {ws.name:15} {roots}")
            lines.append("")

        # All
        lines.append("[All Workspaces]")
        for ws in workspaces:
            active = ">" if ws == self.current_workspace else " "
            buf_count = len(ws.buffers)
            lines.append(f"{active} {ws.name:15} ({buf_count} buffers)")

        lines.append("")
        lines.append(":workspace open <name>")
        lines.append(":workspace save")

        return "\n".join(lines)


# Global manager
_manager: WorkspaceManager | None = None

def get_workspace_manager() -> WorkspaceManager:
    """Get global workspace manager."""
    global _manager
    if _manager is None:
        _manager = WorkspaceManager()
    return _manager
