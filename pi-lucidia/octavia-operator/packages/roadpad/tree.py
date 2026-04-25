"""
RoadPad File Tree - Sidebar file explorer.

Features:
- Directory tree view
- Expand/collapse
- File icons
- Git status
"""

import os
from dataclasses import dataclass, field
from typing import List, Dict, Set


@dataclass
class TreeNode:
    """A node in the file tree."""
    name: str
    path: str
    is_dir: bool
    depth: int = 0
    expanded: bool = False
    children: List["TreeNode"] = field(default_factory=list)
    git_status: str = ""  # M, A, D, ?, etc.

    @property
    def icon(self) -> str:
        if self.is_dir:
            return "▼" if self.expanded else "▶"
        ext = os.path.splitext(self.name)[1].lower()
        icons = {
            ".py": "◇", ".js": "◇", ".ts": "◇", ".go": "◇", ".rs": "◇",
            ".md": "◆", ".txt": "◆", ".road": "◆",
            ".json": "○", ".yaml": "○", ".toml": "○",
            ".sh": "▪", ".bash": "▪",
            ".git": "●",
        }
        return icons.get(ext, "·")

    @property
    def display_name(self) -> str:
        suffix = "/" if self.is_dir else ""
        status = f" [{self.git_status}]" if self.git_status else ""
        return f"{self.name}{suffix}{status}"


class FileTree:
    """File tree sidebar."""

    def __init__(self, root_path: str | None = None):
        self.root_path = root_path or os.getcwd()
        self.root: TreeNode | None = None
        self.flat_list: List[TreeNode] = []
        self.selected_index: int = 0
        self.scroll_offset: int = 0
        self.width: int = 30
        self.visible: bool = False

        # Filtering
        self.show_hidden: bool = False
        self.show_ignored: bool = False

        # Ignore patterns
        self.ignore_patterns: Set[str] = {
            ".git", "__pycache__", "node_modules", ".venv",
            ".pytest_cache", ".mypy_cache", "dist", "build",
            ".DS_Store", "*.pyc", "*.pyo"
        }

        self.refresh()

    def refresh(self) -> None:
        """Refresh the tree."""
        self.root = self._build_node(self.root_path, 0)
        if self.root:
            self.root.expanded = True
        self._flatten()

    def _build_node(self, path: str, depth: int) -> TreeNode | None:
        """Build tree node for path."""
        name = os.path.basename(path) or path
        is_dir = os.path.isdir(path)

        # Check ignore
        if not self.show_hidden and name.startswith("."):
            return None
        if not self.show_ignored and self._should_ignore(name):
            return None

        node = TreeNode(name=name, path=path, is_dir=is_dir, depth=depth)

        if is_dir and depth < 10:  # Limit depth
            try:
                entries = sorted(os.listdir(path))
                dirs = []
                files = []

                for entry in entries:
                    child_path = os.path.join(path, entry)
                    child_node = self._build_node(child_path, depth + 1)
                    if child_node:
                        if child_node.is_dir:
                            dirs.append(child_node)
                        else:
                            files.append(child_node)

                node.children = dirs + files
            except PermissionError:
                pass

        return node

    def _should_ignore(self, name: str) -> bool:
        """Check if name should be ignored."""
        for pattern in self.ignore_patterns:
            if pattern.startswith("*"):
                if name.endswith(pattern[1:]):
                    return True
            elif name == pattern:
                return True
        return False

    def _flatten(self) -> None:
        """Flatten tree to list for display."""
        self.flat_list = []
        if self.root:
            self._flatten_node(self.root)

        if self.selected_index >= len(self.flat_list):
            self.selected_index = max(0, len(self.flat_list) - 1)

    def _flatten_node(self, node: TreeNode) -> None:
        """Recursively flatten node."""
        self.flat_list.append(node)
        if node.is_dir and node.expanded:
            for child in node.children:
                self._flatten_node(child)

    def toggle_expand(self) -> None:
        """Toggle expand/collapse of selected node."""
        if not self.flat_list:
            return

        node = self.flat_list[self.selected_index]
        if node.is_dir:
            node.expanded = not node.expanded
            self._flatten()

    def expand_all(self) -> None:
        """Expand all directories."""
        def expand(node: TreeNode):
            if node.is_dir:
                node.expanded = True
                for child in node.children:
                    expand(child)
        if self.root:
            expand(self.root)
        self._flatten()

    def collapse_all(self) -> None:
        """Collapse all directories."""
        def collapse(node: TreeNode):
            if node.is_dir:
                node.expanded = False
                for child in node.children:
                    collapse(child)
        if self.root:
            collapse(self.root)
            self.root.expanded = True
        self._flatten()

    def select_up(self) -> None:
        """Move selection up."""
        if self.selected_index > 0:
            self.selected_index -= 1

    def select_down(self) -> None:
        """Move selection down."""
        if self.selected_index < len(self.flat_list) - 1:
            self.selected_index += 1

    def select_parent(self) -> None:
        """Move to parent directory."""
        if not self.flat_list:
            return

        node = self.flat_list[self.selected_index]
        parent_path = os.path.dirname(node.path)

        for i, n in enumerate(self.flat_list):
            if n.path == parent_path:
                self.selected_index = i
                break

    def selected_node(self) -> TreeNode | None:
        """Get selected node."""
        if 0 <= self.selected_index < len(self.flat_list):
            return self.flat_list[self.selected_index]
        return None

    def selected_path(self) -> str | None:
        """Get selected file path (if file)."""
        node = self.selected_node()
        if node and not node.is_dir:
            return node.path
        return None

    def enter_selected(self) -> str | None:
        """Enter directory or return file path."""
        node = self.selected_node()
        if not node:
            return None

        if node.is_dir:
            node.expanded = not node.expanded
            self._flatten()
            return None
        return node.path

    def set_root(self, path: str) -> None:
        """Change root directory."""
        if os.path.isdir(path):
            self.root_path = path
            self.selected_index = 0
            self.refresh()

    def toggle_hidden(self) -> None:
        """Toggle showing hidden files."""
        self.show_hidden = not self.show_hidden
        self.refresh()

    def toggle(self) -> None:
        """Toggle visibility."""
        self.visible = not self.visible

    def show(self) -> None:
        """Show tree."""
        self.visible = True

    def hide(self) -> None:
        """Hide tree."""
        self.visible = False

    def update_git_status(self) -> None:
        """Update git status for files."""
        # Run git status
        import subprocess
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.root_path,
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode != 0:
                return

            status_map = {}
            for line in result.stdout.split("\n"):
                if len(line) >= 3:
                    status = line[:2].strip()
                    filepath = line[3:]
                    full_path = os.path.join(self.root_path, filepath)
                    status_map[full_path] = status

            # Apply to nodes
            def update_node(node: TreeNode):
                if node.path in status_map:
                    node.git_status = status_map[node.path]
                for child in node.children:
                    update_node(child)

            if self.root:
                update_node(self.root)

        except:
            pass

    def format_tree(self, height: int) -> List[str]:
        """Format tree for display."""
        lines = []

        # Header
        root_name = os.path.basename(self.root_path) or self.root_path
        lines.append(f" {root_name}")
        lines.append(" " + "─" * (self.width - 2))

        # Visible range
        visible_start = self.scroll_offset
        visible_end = min(len(self.flat_list), visible_start + height - 3)

        # Adjust scroll
        if self.selected_index < visible_start:
            self.scroll_offset = self.selected_index
            visible_start = self.scroll_offset
            visible_end = min(len(self.flat_list), visible_start + height - 3)
        elif self.selected_index >= visible_end:
            self.scroll_offset = self.selected_index - height + 4
            visible_start = self.scroll_offset
            visible_end = min(len(self.flat_list), visible_start + height - 3)

        for i in range(visible_start, visible_end):
            node = self.flat_list[i]
            prefix = ">" if i == self.selected_index else " "
            indent = "  " * node.depth
            icon = node.icon
            name = node.display_name

            # Truncate to width
            line = f"{prefix}{indent}{icon} {name}"
            if len(line) > self.width:
                line = line[:self.width - 1] + "…"

            lines.append(line)

        return lines


# Global tree
_tree: FileTree | None = None

def get_file_tree() -> FileTree:
    """Get global file tree."""
    global _tree
    if _tree is None:
        _tree = FileTree()
    return _tree
