"""
RoadPad Marks - Bookmarks and position markers.

Features:
- Named marks (a-z)
- Jump between marks
- File marks (cross-file)
- Persistence
"""

import os
import json
from dataclasses import dataclass, field
from typing import Dict, List, Tuple
from datetime import datetime


@dataclass
class Mark:
    """A position marker."""
    name: str
    row: int
    col: int
    filepath: str = ""
    created: str = field(default_factory=lambda: datetime.now().isoformat())
    description: str = ""

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "row": self.row,
            "col": self.col,
            "filepath": self.filepath,
            "created": self.created,
            "description": self.description
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Mark":
        return cls(
            name=d["name"],
            row=d["row"],
            col=d["col"],
            filepath=d.get("filepath", ""),
            created=d.get("created", ""),
            description=d.get("description", "")
        )

    @property
    def is_global(self) -> bool:
        """Global marks are uppercase."""
        return self.name.isupper()


class MarkManager:
    """Manages marks/bookmarks."""

    def __init__(self, marks_dir: str | None = None):
        self.marks_dir = marks_dir or os.path.expanduser("~/.roadpad/marks")
        os.makedirs(self.marks_dir, exist_ok=True)

        # Local marks (a-z) - per buffer
        self.local_marks: Dict[str, Mark] = {}

        # Global marks (A-Z, 0-9) - across files
        self.global_marks: Dict[str, Mark] = {}

        # Jump list (for Ctrl+O/Ctrl+I navigation)
        self.jump_list: List[Tuple[str, int, int]] = []  # (filepath, row, col)
        self.jump_index: int = -1
        self.max_jumps: int = 100

        # Last position before jump
        self.last_position: Tuple[str, int, int] | None = None

        self._load_global_marks()

    def _load_global_marks(self) -> None:
        """Load global marks from disk."""
        marks_file = os.path.join(self.marks_dir, "global.json")
        if os.path.exists(marks_file):
            try:
                with open(marks_file, "r") as f:
                    data = json.load(f)
                for item in data:
                    mark = Mark.from_dict(item)
                    self.global_marks[mark.name] = mark
            except:
                pass

    def _save_global_marks(self) -> None:
        """Save global marks to disk."""
        marks_file = os.path.join(self.marks_dir, "global.json")
        data = [m.to_dict() for m in self.global_marks.values()]
        with open(marks_file, "w") as f:
            json.dump(data, f, indent=2)

    def set_mark(self, name: str, row: int, col: int, filepath: str = "") -> Mark:
        """Set a mark at position."""
        mark = Mark(name=name, row=row, col=col, filepath=filepath)

        if mark.is_global:
            self.global_marks[name] = mark
            self._save_global_marks()
        else:
            self.local_marks[name] = mark

        return mark

    def get_mark(self, name: str) -> Mark | None:
        """Get a mark by name."""
        if name.isupper() or name.isdigit():
            return self.global_marks.get(name)
        return self.local_marks.get(name)

    def delete_mark(self, name: str) -> bool:
        """Delete a mark."""
        if name.isupper() or name.isdigit():
            if name in self.global_marks:
                del self.global_marks[name]
                self._save_global_marks()
                return True
        else:
            if name in self.local_marks:
                del self.local_marks[name]
                return True
        return False

    def clear_local_marks(self) -> None:
        """Clear all local marks."""
        self.local_marks.clear()

    def list_marks(self) -> List[Mark]:
        """List all marks."""
        marks = list(self.local_marks.values()) + list(self.global_marks.values())
        return sorted(marks, key=lambda m: m.name)

    def add_jump(self, filepath: str, row: int, col: int) -> None:
        """Add position to jump list."""
        # Don't add if same as last
        if self.jump_list and self.jump_index >= 0:
            last = self.jump_list[self.jump_index]
            if last == (filepath, row, col):
                return

        # Truncate forward history if we jumped back
        if self.jump_index < len(self.jump_list) - 1:
            self.jump_list = self.jump_list[:self.jump_index + 1]

        self.jump_list.append((filepath, row, col))
        self.jump_index = len(self.jump_list) - 1

        # Trim to max
        if len(self.jump_list) > self.max_jumps:
            self.jump_list.pop(0)
            self.jump_index -= 1

    def jump_back(self) -> Tuple[str, int, int] | None:
        """Jump to previous position."""
        if self.jump_index > 0:
            self.jump_index -= 1
            return self.jump_list[self.jump_index]
        return None

    def jump_forward(self) -> Tuple[str, int, int] | None:
        """Jump to next position."""
        if self.jump_index < len(self.jump_list) - 1:
            self.jump_index += 1
            return self.jump_list[self.jump_index]
        return None

    def save_position(self, filepath: str, row: int, col: int) -> None:
        """Save current position before a jump."""
        self.last_position = (filepath, row, col)

    def swap_position(self, filepath: str, row: int, col: int) -> Tuple[str, int, int] | None:
        """Swap with last position (like `` in vim)."""
        if self.last_position:
            old = self.last_position
            self.last_position = (filepath, row, col)
            return old
        return None

    def format_list(self) -> str:
        """Format marks for display."""
        lines = ["Marks", "=" * 40, ""]

        marks = self.list_marks()
        if not marks:
            lines.append("No marks set")
            lines.append("")
            lines.append("m<a-z> - set local mark")
            lines.append("m<A-Z> - set global mark")
            lines.append("'<mark> - jump to mark")
            return "\n".join(lines)

        # Local marks
        local = [m for m in marks if not m.is_global]
        if local:
            lines.append("[Local Marks]")
            for m in local:
                lines.append(f"  '{m.name}  line {m.row + 1}, col {m.col + 1}")
            lines.append("")

        # Global marks
        glob = [m for m in marks if m.is_global]
        if glob:
            lines.append("[Global Marks]")
            for m in glob:
                filepath = os.path.basename(m.filepath) if m.filepath else "(current)"
                lines.append(f"  '{m.name}  {filepath}:{m.row + 1}")
            lines.append("")

        # Jump list
        if self.jump_list:
            lines.append(f"[Jump List] ({self.jump_index + 1}/{len(self.jump_list)})")
            lines.append("  Ctrl+O - back, Ctrl+I - forward")

        return "\n".join(lines)


# Global manager
_manager: MarkManager | None = None

def get_mark_manager() -> MarkManager:
    """Get global mark manager."""
    global _manager
    if _manager is None:
        _manager = MarkManager()
    return _manager
