"""
RoadPad File Browser - Navigate and open files.

Features:
- Directory listing
- File preview
- Quick open
- Recent files
- Bookmarks
"""

import os
from dataclasses import dataclass
from typing import List, Tuple
from datetime import datetime


@dataclass
class FileEntry:
    """A file or directory entry."""
    name: str
    path: str
    is_dir: bool
    size: int = 0
    modified: str = ""
    extension: str = ""

    @property
    def icon(self) -> str:
        if self.is_dir:
            return "▸"
        ext = self.extension.lower()
        if ext in (".py", ".js", ".ts", ".go", ".rs"):
            return "◇"
        if ext in (".md", ".txt", ".road"):
            return "◆"
        if ext in (".json", ".yaml", ".toml"):
            return "○"
        if ext in (".sh", ".bash", ".zsh"):
            return "▪"
        return "·"

    @property
    def display_size(self) -> str:
        if self.is_dir:
            return "<DIR>"
        if self.size < 1024:
            return f"{self.size}B"
        if self.size < 1024 * 1024:
            return f"{self.size // 1024}K"
        return f"{self.size // (1024 * 1024)}M"


class FileBrowser:
    """File browser for RoadPad."""

    def __init__(self, start_path: str | None = None):
        self.current_path = start_path or os.getcwd()
        self.entries: List[FileEntry] = []
        self.selected_index = 0
        self.scroll_offset = 0
        self.show_hidden = False
        self.filter_pattern = ""
        self.recent_files: List[str] = []
        self.bookmarks: List[str] = []
        self.max_recent = 20

        # Load directory
        self.refresh()

    def refresh(self) -> None:
        """Refresh directory listing."""
        self.entries = []

        try:
            items = os.listdir(self.current_path)
        except PermissionError:
            return

        # Parent directory
        if self.current_path != "/":
            self.entries.append(FileEntry(
                name="..",
                path=os.path.dirname(self.current_path),
                is_dir=True
            ))

        dirs = []
        files = []

        for name in items:
            if not self.show_hidden and name.startswith("."):
                continue

            if self.filter_pattern and self.filter_pattern.lower() not in name.lower():
                continue

            full_path = os.path.join(self.current_path, name)
            is_dir = os.path.isdir(full_path)

            try:
                stat = os.stat(full_path)
                size = stat.st_size if not is_dir else 0
                modified = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M")
            except:
                size = 0
                modified = ""

            entry = FileEntry(
                name=name,
                path=full_path,
                is_dir=is_dir,
                size=size,
                modified=modified,
                extension=os.path.splitext(name)[1] if not is_dir else ""
            )

            if is_dir:
                dirs.append(entry)
            else:
                files.append(entry)

        # Sort: directories first, then files, alphabetically
        dirs.sort(key=lambda e: e.name.lower())
        files.sort(key=lambda e: e.name.lower())
        self.entries.extend(dirs)
        self.entries.extend(files)

        # Reset selection if out of bounds
        if self.selected_index >= len(self.entries):
            self.selected_index = max(0, len(self.entries) - 1)

    def navigate_to(self, path: str) -> bool:
        """Navigate to a directory."""
        if not os.path.isdir(path):
            return False
        self.current_path = os.path.abspath(path)
        self.selected_index = 0
        self.scroll_offset = 0
        self.refresh()
        return True

    def select_up(self) -> None:
        """Move selection up."""
        if self.selected_index > 0:
            self.selected_index -= 1

    def select_down(self) -> None:
        """Move selection down."""
        if self.selected_index < len(self.entries) - 1:
            self.selected_index += 1

    def select_page_up(self, page_size: int = 10) -> None:
        """Move selection up by page."""
        self.selected_index = max(0, self.selected_index - page_size)

    def select_page_down(self, page_size: int = 10) -> None:
        """Move selection down by page."""
        self.selected_index = min(len(self.entries) - 1, self.selected_index + page_size)

    def selected_entry(self) -> FileEntry | None:
        """Get currently selected entry."""
        if 0 <= self.selected_index < len(self.entries):
            return self.entries[self.selected_index]
        return None

    def enter_selected(self) -> str | None:
        """Enter selected directory or return file path."""
        entry = self.selected_entry()
        if not entry:
            return None

        if entry.is_dir:
            self.navigate_to(entry.path)
            return None
        else:
            self.add_recent(entry.path)
            return entry.path

    def go_parent(self) -> None:
        """Go to parent directory."""
        parent = os.path.dirname(self.current_path)
        if parent != self.current_path:
            self.navigate_to(parent)

    def go_home(self) -> None:
        """Go to home directory."""
        self.navigate_to(os.path.expanduser("~"))

    def toggle_hidden(self) -> None:
        """Toggle showing hidden files."""
        self.show_hidden = not self.show_hidden
        self.refresh()

    def set_filter(self, pattern: str) -> None:
        """Set filter pattern."""
        self.filter_pattern = pattern
        self.refresh()

    def clear_filter(self) -> None:
        """Clear filter."""
        self.filter_pattern = ""
        self.refresh()

    def add_recent(self, path: str) -> None:
        """Add file to recent list."""
        if path in self.recent_files:
            self.recent_files.remove(path)
        self.recent_files.insert(0, path)
        self.recent_files = self.recent_files[:self.max_recent]

    def add_bookmark(self, path: str) -> None:
        """Add bookmark."""
        if path not in self.bookmarks:
            self.bookmarks.append(path)

    def remove_bookmark(self, path: str) -> None:
        """Remove bookmark."""
        if path in self.bookmarks:
            self.bookmarks.remove(path)

    def format_listing(self, height: int) -> List[str]:
        """Format directory listing for display."""
        lines = []
        lines.append(f"  {self.current_path}")
        lines.append("  " + "─" * 40)

        visible_start = self.scroll_offset
        visible_end = min(len(self.entries), visible_start + height - 4)

        for i in range(visible_start, visible_end):
            entry = self.entries[i]
            prefix = "▶" if i == self.selected_index else " "
            icon = entry.icon
            name = entry.name[:30]
            size = entry.display_size

            line = f"{prefix} {icon} {name:<30} {size:>8}"
            lines.append(line)

        # Scrollbar hint
        if len(self.entries) > height - 4:
            pct = int((self.selected_index / len(self.entries)) * 100)
            lines.append(f"  [{pct}%] {len(self.entries)} items")

        return lines


# Global browser
_browser: FileBrowser | None = None

def get_browser() -> FileBrowser:
    """Get global file browser."""
    global _browser
    if _browser is None:
        _browser = FileBrowser()
    return _browser
