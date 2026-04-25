"""
RoadPad Split Panes - Multiple views.

Features:
- Horizontal/vertical splits
- Window navigation
- Resize
- Buffer per pane
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any
from enum import Enum


class SplitDirection(Enum):
    HORIZONTAL = "h"
    VERTICAL = "v"


@dataclass
class Pane:
    """A single pane/window."""
    id: int
    buffer_id: int = 0
    row: int = 0
    col: int = 0
    height: int = 24
    width: int = 80
    scroll_row: int = 0
    scroll_col: int = 0
    cursor_row: int = 0
    cursor_col: int = 0
    active: bool = False

    @property
    def bottom(self) -> int:
        return self.row + self.height

    @property
    def right(self) -> int:
        return self.col + self.width


@dataclass
class Split:
    """A split containing panes or more splits."""
    direction: SplitDirection
    children: List[Any] = field(default_factory=list)  # Pane or Split
    ratio: float = 0.5  # Split position (0.0 - 1.0)


class PaneManager:
    """Manages split panes."""

    def __init__(self, screen_height: int = 24, screen_width: int = 80):
        self.screen_height = screen_height
        self.screen_width = screen_width
        self.panes: Dict[int, Pane] = {}
        self.next_id = 1
        self.active_pane_id: int = 0
        self.root: Pane | Split | None = None

        # Create initial pane
        self._create_root_pane()

    def _create_root_pane(self) -> None:
        """Create the root pane."""
        pane = Pane(
            id=self.next_id,
            row=0,
            col=0,
            height=self.screen_height - 1,  # Leave room for status
            width=self.screen_width,
            active=True
        )
        self.panes[pane.id] = pane
        self.active_pane_id = pane.id
        self.root = pane
        self.next_id += 1

    def split_horizontal(self) -> Pane | None:
        """Split active pane horizontally (top/bottom)."""
        return self._split(SplitDirection.HORIZONTAL)

    def split_vertical(self) -> Pane | None:
        """Split active pane vertically (left/right)."""
        return self._split(SplitDirection.VERTICAL)

    def _split(self, direction: SplitDirection) -> Pane | None:
        """Split the active pane."""
        active = self.active_pane
        if not active:
            return None

        # Calculate new dimensions
        if direction == SplitDirection.HORIZONTAL:
            new_height = active.height // 2
            if new_height < 3:
                return None

            # Resize active pane
            active.height = new_height

            # Create new pane below
            new_pane = Pane(
                id=self.next_id,
                buffer_id=active.buffer_id,
                row=active.row + new_height,
                col=active.col,
                height=new_height,
                width=active.width
            )
        else:
            new_width = active.width // 2
            if new_width < 10:
                return None

            # Resize active pane
            active.width = new_width

            # Create new pane to the right
            new_pane = Pane(
                id=self.next_id,
                buffer_id=active.buffer_id,
                row=active.row,
                col=active.col + new_width,
                height=active.height,
                width=new_width
            )

        self.panes[new_pane.id] = new_pane
        self.next_id += 1

        # Update root structure
        if self.root == active:
            self.root = Split(direction=direction, children=[active, new_pane])
        else:
            self._replace_in_tree(self.root, active,
                                  Split(direction=direction, children=[active, new_pane]))

        return new_pane

    def _replace_in_tree(self, node: Any, target: Pane, replacement: Split) -> bool:
        """Replace a pane with a split in the tree."""
        if isinstance(node, Split):
            for i, child in enumerate(node.children):
                if child == target:
                    node.children[i] = replacement
                    return True
                if self._replace_in_tree(child, target, replacement):
                    return True
        return False

    def close_pane(self, pane_id: int | None = None) -> bool:
        """Close a pane."""
        pane_id = pane_id or self.active_pane_id
        if pane_id not in self.panes:
            return False

        # Can't close last pane
        if len(self.panes) == 1:
            return False

        pane = self.panes[pane_id]
        del self.panes[pane_id]

        # Find sibling and expand
        self._remove_from_tree(self.root, pane)

        # Switch to another pane
        if pane_id == self.active_pane_id:
            self.active_pane_id = next(iter(self.panes.keys()))
            self.panes[self.active_pane_id].active = True

        return True

    def _remove_from_tree(self, node: Any, target: Pane) -> Any:
        """Remove pane from tree and return replacement."""
        if isinstance(node, Split):
            new_children = []
            for child in node.children:
                if child == target:
                    continue
                result = self._remove_from_tree(child, target)
                if result:
                    new_children.append(result)

            if len(new_children) == 1:
                # Collapse split with single child
                return new_children[0]
            elif len(new_children) > 1:
                node.children = new_children
                return node
            return None
        return node

    @property
    def active_pane(self) -> Pane | None:
        """Get active pane."""
        return self.panes.get(self.active_pane_id)

    def focus_pane(self, pane_id: int) -> bool:
        """Focus a specific pane."""
        if pane_id not in self.panes:
            return False

        # Deactivate current
        if self.active_pane:
            self.active_pane.active = False

        # Activate new
        self.active_pane_id = pane_id
        self.panes[pane_id].active = True
        return True

    def focus_next(self) -> None:
        """Focus next pane."""
        ids = sorted(self.panes.keys())
        if not ids:
            return
        try:
            idx = ids.index(self.active_pane_id)
            next_idx = (idx + 1) % len(ids)
            self.focus_pane(ids[next_idx])
        except ValueError:
            self.focus_pane(ids[0])

    def focus_prev(self) -> None:
        """Focus previous pane."""
        ids = sorted(self.panes.keys())
        if not ids:
            return
        try:
            idx = ids.index(self.active_pane_id)
            prev_idx = (idx - 1) % len(ids)
            self.focus_pane(ids[prev_idx])
        except ValueError:
            self.focus_pane(ids[0])

    def focus_direction(self, direction: str) -> None:
        """Focus pane in direction (h/j/k/l)."""
        active = self.active_pane
        if not active:
            return

        best_pane = None
        best_dist = float("inf")

        for pane in self.panes.values():
            if pane.id == active.id:
                continue

            if direction == "h" and pane.right <= active.col:
                dist = active.col - pane.right
            elif direction == "l" and pane.col >= active.right:
                dist = pane.col - active.right
            elif direction == "k" and pane.bottom <= active.row:
                dist = active.row - pane.bottom
            elif direction == "j" and pane.row >= active.bottom:
                dist = pane.row - active.bottom
            else:
                continue

            if dist < best_dist:
                best_dist = dist
                best_pane = pane

        if best_pane:
            self.focus_pane(best_pane.id)

    def resize(self, direction: str, amount: int = 1) -> None:
        """Resize active pane."""
        active = self.active_pane
        if not active:
            return

        if direction == "h":
            active.width = max(10, active.width - amount)
        elif direction == "l":
            active.width = min(self.screen_width - active.col, active.width + amount)
        elif direction == "k":
            active.height = max(3, active.height - amount)
        elif direction == "j":
            active.height = min(self.screen_height - active.row - 1, active.height + amount)

    def equalize(self) -> None:
        """Make all panes equal size."""
        if not self.panes:
            return

        count = len(self.panes)
        if count == 1:
            return

        # Simple grid layout
        cols = 1
        while cols * cols < count:
            cols += 1
        rows = (count + cols - 1) // cols

        pane_width = self.screen_width // cols
        pane_height = (self.screen_height - 1) // rows

        pane_list = list(self.panes.values())
        for i, pane in enumerate(pane_list):
            grid_row = i // cols
            grid_col = i % cols
            pane.row = grid_row * pane_height
            pane.col = grid_col * pane_width
            pane.height = pane_height
            pane.width = pane_width

    def update_screen_size(self, height: int, width: int) -> None:
        """Update screen dimensions."""
        old_h, old_w = self.screen_height, self.screen_width
        self.screen_height = height
        self.screen_width = width

        # Scale panes
        h_ratio = height / old_h if old_h else 1
        w_ratio = width / old_w if old_w else 1

        for pane in self.panes.values():
            pane.row = int(pane.row * h_ratio)
            pane.col = int(pane.col * w_ratio)
            pane.height = max(3, int(pane.height * h_ratio))
            pane.width = max(10, int(pane.width * w_ratio))

    def get_layout(self) -> List[Dict]:
        """Get pane layout for rendering."""
        return [
            {
                "id": p.id,
                "row": p.row,
                "col": p.col,
                "height": p.height,
                "width": p.width,
                "active": p.active,
                "buffer_id": p.buffer_id,
            }
            for p in self.panes.values()
        ]

    def format_status(self) -> str:
        """Format pane status."""
        return f"[{len(self.panes)} panes]"


# Global manager
_manager: PaneManager | None = None

def get_pane_manager() -> PaneManager:
    """Get global pane manager."""
    global _manager
    if _manager is None:
        _manager = PaneManager()
    return _manager
