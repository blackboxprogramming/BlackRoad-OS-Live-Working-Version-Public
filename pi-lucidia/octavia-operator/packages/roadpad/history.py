"""
RoadPad History - Undo/redo and edit history.

Features:
- Unlimited undo/redo
- Edit grouping
- History persistence
- Change diff
"""

from dataclasses import dataclass, field
from typing import List, Tuple, Any
from copy import deepcopy
import time


@dataclass
class Edit:
    """A single edit operation."""
    type: str  # 'insert', 'delete', 'replace', 'newline', 'join'
    row: int
    col: int
    text: str = ""
    old_text: str = ""
    timestamp: float = field(default_factory=time.time)

    def inverse(self) -> "Edit":
        """Create inverse edit for undo."""
        if self.type == "insert":
            return Edit("delete", self.row, self.col, old_text=self.text)
        elif self.type == "delete":
            return Edit("insert", self.row, self.col, text=self.old_text)
        elif self.type == "replace":
            return Edit("replace", self.row, self.col, text=self.old_text, old_text=self.text)
        elif self.type == "newline":
            return Edit("join", self.row, self.col)
        elif self.type == "join":
            return Edit("newline", self.row, self.col)
        return self


@dataclass
class EditGroup:
    """A group of related edits (for atomic undo)."""
    edits: List[Edit] = field(default_factory=list)
    description: str = ""
    timestamp: float = field(default_factory=time.time)

    def add(self, edit: Edit) -> None:
        self.edits.append(edit)

    def inverse(self) -> "EditGroup":
        """Create inverse group for undo."""
        return EditGroup(
            edits=[e.inverse() for e in reversed(self.edits)],
            description=f"Undo: {self.description}"
        )


class UndoStack:
    """Undo/redo stack with edit grouping."""

    def __init__(self, max_size: int = 1000):
        self.undo_stack: List[EditGroup] = []
        self.redo_stack: List[EditGroup] = []
        self.max_size = max_size
        self.current_group: EditGroup | None = None
        self.group_timeout = 1.0  # Seconds before auto-closing group

    def begin_group(self, description: str = "") -> None:
        """Begin a new edit group."""
        self._close_group()
        self.current_group = EditGroup(description=description)

    def end_group(self) -> None:
        """End current edit group."""
        self._close_group()

    def _close_group(self) -> None:
        """Close and push current group if exists."""
        if self.current_group and self.current_group.edits:
            self.undo_stack.append(self.current_group)
            self._trim_stack()
            self.redo_stack.clear()  # New edits clear redo
        self.current_group = None

    def _trim_stack(self) -> None:
        """Trim stack to max size."""
        while len(self.undo_stack) > self.max_size:
            self.undo_stack.pop(0)

    def record(self, edit: Edit) -> None:
        """Record an edit."""
        # Auto-group by time
        now = time.time()
        if self.current_group:
            if now - self.current_group.timestamp > self.group_timeout:
                self._close_group()

        if not self.current_group:
            self.current_group = EditGroup()

        self.current_group.add(edit)
        self.redo_stack.clear()

    def can_undo(self) -> bool:
        """Check if undo is possible."""
        return bool(self.undo_stack) or (self.current_group and self.current_group.edits)

    def can_redo(self) -> bool:
        """Check if redo is possible."""
        return bool(self.redo_stack)

    def undo(self) -> EditGroup | None:
        """Pop and return the edit group to undo."""
        self._close_group()
        if not self.undo_stack:
            return None
        group = self.undo_stack.pop()
        self.redo_stack.append(group)
        return group.inverse()

    def redo(self) -> EditGroup | None:
        """Pop and return the edit group to redo."""
        if not self.redo_stack:
            return None
        group = self.redo_stack.pop()
        self.undo_stack.append(group)
        return group

    def clear(self) -> None:
        """Clear all history."""
        self.undo_stack.clear()
        self.redo_stack.clear()
        self.current_group = None

    def status(self) -> str:
        """Get status string."""
        return f"Undo: {len(self.undo_stack)} | Redo: {len(self.redo_stack)}"


class BufferHistory:
    """Full buffer state history (for large undos)."""

    def __init__(self, max_snapshots: int = 50):
        self.snapshots: List[Tuple[List[str], int, int]] = []  # (lines, row, col)
        self.max_snapshots = max_snapshots
        self.snapshot_interval = 10  # Edits between snapshots
        self.edit_count = 0

    def snapshot(self, lines: List[str], cursor_row: int, cursor_col: int) -> None:
        """Save a snapshot."""
        self.snapshots.append((deepcopy(lines), cursor_row, cursor_col))
        while len(self.snapshots) > self.max_snapshots:
            self.snapshots.pop(0)

    def maybe_snapshot(self, lines: List[str], cursor_row: int, cursor_col: int) -> None:
        """Snapshot if interval reached."""
        self.edit_count += 1
        if self.edit_count >= self.snapshot_interval:
            self.snapshot(lines, cursor_row, cursor_col)
            self.edit_count = 0

    def restore(self, index: int = -1) -> Tuple[List[str], int, int] | None:
        """Restore a snapshot."""
        if not self.snapshots:
            return None
        if index < 0:
            index = len(self.snapshots) + index
        if 0 <= index < len(self.snapshots):
            return deepcopy(self.snapshots[index])
        return None

    def clear(self) -> None:
        """Clear snapshots."""
        self.snapshots.clear()
        self.edit_count = 0


# Global instances
_undo_stack: UndoStack | None = None
_buffer_history: BufferHistory | None = None

def get_undo_stack() -> UndoStack:
    global _undo_stack
    if _undo_stack is None:
        _undo_stack = UndoStack()
    return _undo_stack

def get_buffer_history() -> BufferHistory:
    global _buffer_history
    if _buffer_history is None:
        _buffer_history = BufferHistory()
    return _buffer_history
