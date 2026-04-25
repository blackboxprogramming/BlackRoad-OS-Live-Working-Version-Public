"""
RoadPad Fuzzy Finder - Quick file/command search.

Features:
- Fuzzy matching
- File finder (Ctrl+P)
- Command palette (Ctrl+Shift+P)
- Buffer switcher
- Recent files
"""

import os
from dataclasses import dataclass, field
from typing import List, Callable, Any
import re


@dataclass
class FuzzyMatch:
    """A fuzzy match result."""
    item: Any
    score: int
    matches: List[int] = field(default_factory=list)  # Matched character positions
    display: str = ""


def fuzzy_match(pattern: str, text: str) -> FuzzyMatch | None:
    """Fuzzy match pattern against text. Returns match with score or None."""
    if not pattern:
        return FuzzyMatch(item=text, score=0, display=text)

    pattern_lower = pattern.lower()
    text_lower = text.lower()

    # Find all matching positions
    pattern_idx = 0
    matches = []
    score = 0

    for i, char in enumerate(text_lower):
        if pattern_idx < len(pattern_lower) and char == pattern_lower[pattern_idx]:
            matches.append(i)
            pattern_idx += 1

            # Scoring
            if i == 0:
                score += 10  # Start of string
            elif text[i - 1] in "/_-. ":
                score += 8  # Start of word
            elif text[i].isupper() and (i == 0 or text[i-1].islower()):
                score += 6  # CamelCase boundary
            else:
                score += 1

            # Consecutive bonus
            if len(matches) > 1 and matches[-1] == matches[-2] + 1:
                score += 3

    # Must match all characters
    if pattern_idx < len(pattern_lower):
        return None

    # Penalty for length
    score -= len(text) // 10

    return FuzzyMatch(item=text, score=score, matches=matches, display=text)


def fuzzy_sort(pattern: str, items: List[str]) -> List[FuzzyMatch]:
    """Sort items by fuzzy match score."""
    matches = []
    for item in items:
        match = fuzzy_match(pattern, item)
        if match:
            matches.append(match)

    return sorted(matches, key=lambda m: -m.score)


@dataclass
class FinderItem:
    """An item in the finder."""
    text: str
    kind: str = ""  # 'file', 'command', 'buffer', 'recent'
    data: Any = None
    icon: str = ""


class FuzzyFinder:
    """Fuzzy finder popup."""

    def __init__(self):
        self.items: List[FinderItem] = []
        self.filtered: List[FuzzyMatch] = []
        self.query: str = ""
        self.selected_index: int = 0
        self.visible: bool = False
        self.title: str = "Find"
        self.max_results: int = 20

        self.on_select: Callable[[FinderItem], None] | None = None
        self.on_cancel: Callable[[], None] | None = None

    def open(self, items: List[FinderItem], title: str = "Find") -> None:
        """Open finder with items."""
        self.items = items
        self.title = title
        self.query = ""
        self.selected_index = 0
        self.visible = True
        self._filter()

    def close(self) -> None:
        """Close finder."""
        self.visible = False
        self.query = ""
        if self.on_cancel:
            self.on_cancel()

    def _filter(self) -> None:
        """Filter items by query."""
        if not self.query:
            self.filtered = [
                FuzzyMatch(item=item, score=0, display=item.text)
                for item in self.items[:self.max_results]
            ]
        else:
            matches = []
            for item in self.items:
                match = fuzzy_match(self.query, item.text)
                if match:
                    match.item = item
                    matches.append(match)

            matches.sort(key=lambda m: -m.score)
            self.filtered = matches[:self.max_results]

        if self.selected_index >= len(self.filtered):
            self.selected_index = max(0, len(self.filtered) - 1)

    def type_char(self, char: str) -> None:
        """Add character to query."""
        self.query += char
        self._filter()

    def backspace(self) -> None:
        """Remove last character."""
        if self.query:
            self.query = self.query[:-1]
            self._filter()

    def clear_query(self) -> None:
        """Clear query."""
        self.query = ""
        self._filter()

    def select_up(self) -> None:
        """Move selection up."""
        if self.selected_index > 0:
            self.selected_index -= 1

    def select_down(self) -> None:
        """Move selection down."""
        if self.selected_index < len(self.filtered) - 1:
            self.selected_index += 1

    def confirm(self) -> FinderItem | None:
        """Confirm selection."""
        if not self.filtered:
            return None

        match = self.filtered[self.selected_index]
        item = match.item
        self.visible = False

        if self.on_select:
            self.on_select(item)

        return item

    def selected_item(self) -> FinderItem | None:
        """Get selected item."""
        if 0 <= self.selected_index < len(self.filtered):
            return self.filtered[self.selected_index].item
        return None

    def format_popup(self, height: int = 15, width: int = 60) -> List[str]:
        """Format finder popup for display."""
        lines = []

        # Header
        lines.append(f"╭{'─' * (width - 2)}╮")
        title_line = f"│ {self.title}"
        title_line += " " * (width - len(title_line) - 1) + "│"
        lines.append(title_line)

        # Search input
        query_display = self.query or ""
        input_line = f"│ > {query_display}"
        input_line += " " * (width - len(input_line) - 1) + "│"
        lines.append(input_line)

        lines.append(f"├{'─' * (width - 2)}┤")

        # Results
        result_height = height - 5
        for i, match in enumerate(self.filtered[:result_height]):
            item = match.item
            prefix = ">" if i == self.selected_index else " "
            icon = item.icon or "·"

            # Highlight matched characters
            display = item.text
            if len(display) > width - 6:
                display = "…" + display[-(width - 7):]

            line = f"│{prefix}{icon} {display}"
            line += " " * (width - len(line) - 1) + "│"
            lines.append(line)

        # Pad remaining space
        for _ in range(result_height - len(self.filtered[:result_height])):
            lines.append(f"│{' ' * (width - 2)}│")

        # Footer
        count = len(self.filtered)
        total = len(self.items)
        footer = f" {count}/{total} "
        lines.append(f"╰{'─' * ((width - len(footer) - 2) // 2)}{footer}{'─' * ((width - len(footer) - 1) // 2)}╯")

        return lines


class FileFinder(FuzzyFinder):
    """File finder (Ctrl+P)."""

    def __init__(self, root_path: str | None = None):
        super().__init__()
        self.root_path = root_path or os.getcwd()
        self.title = "Find File"
        self.ignore_dirs = {".git", "__pycache__", "node_modules", ".venv", "dist", "build"}
        self.max_files = 1000

    def scan(self) -> None:
        """Scan directory for files."""
        self.items = []
        count = 0

        for root, dirs, files in os.walk(self.root_path):
            # Filter ignored directories
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs and not d.startswith(".")]

            for filename in files:
                if filename.startswith("."):
                    continue

                filepath = os.path.join(root, filename)
                relpath = os.path.relpath(filepath, self.root_path)

                # Icon by extension
                ext = os.path.splitext(filename)[1].lower()
                icon = {"py": "◇", "js": "◇", "ts": "◇", "md": "◆", "json": "○", "sh": "▪"}.get(ext[1:] if ext else "", "·")

                self.items.append(FinderItem(
                    text=relpath,
                    kind="file",
                    data=filepath,
                    icon=icon
                ))

                count += 1
                if count >= self.max_files:
                    return

    def open_finder(self) -> None:
        """Open file finder."""
        self.scan()
        self.open(self.items, "Find File")


class CommandFinder(FuzzyFinder):
    """Command palette (Ctrl+Shift+P)."""

    def __init__(self):
        super().__init__()
        self.title = "Command Palette"
        self.commands: List[FinderItem] = []

    def register_command(self, name: str, handler: Callable, icon: str = ":") -> None:
        """Register a command."""
        self.commands.append(FinderItem(
            text=name,
            kind="command",
            data=handler,
            icon=icon
        ))

    def open_palette(self) -> None:
        """Open command palette."""
        self.open(self.commands, "Command Palette")


class BufferFinder(FuzzyFinder):
    """Buffer switcher (Ctrl+B)."""

    def __init__(self):
        super().__init__()
        self.title = "Switch Buffer"

    def open_buffers(self, buffers: List[str]) -> None:
        """Open with buffer list."""
        items = [
            FinderItem(text=b, kind="buffer", data=b, icon="◆")
            for b in buffers
        ]
        self.open(items, "Switch Buffer")


# Global finders
_file_finder: FileFinder | None = None
_command_finder: CommandFinder | None = None
_buffer_finder: BufferFinder | None = None

def get_file_finder() -> FileFinder:
    global _file_finder
    if _file_finder is None:
        _file_finder = FileFinder()
    return _file_finder

def get_command_finder() -> CommandFinder:
    global _command_finder
    if _command_finder is None:
        _command_finder = CommandFinder()
    return _command_finder

def get_buffer_finder() -> BufferFinder:
    global _buffer_finder
    if _buffer_finder is None:
        _buffer_finder = BufferFinder()
    return _buffer_finder
