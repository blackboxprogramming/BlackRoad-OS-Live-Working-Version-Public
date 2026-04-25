"""
RoadPad Search - Find and navigate in buffer.

Features:
- Forward/backward search
- Case sensitive/insensitive
- Regex support
- Highlight matches
- Jump between matches
"""

import re
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class Match:
    """A search match."""
    row: int
    col: int
    length: int
    text: str


class Search:
    """Search engine for buffer."""

    def __init__(self):
        self.pattern: str = ""
        self.matches: List[Match] = []
        self.current_index: int = -1
        self.case_sensitive: bool = False
        self.use_regex: bool = False

    def find_all(self, lines: List[str], pattern: str,
                 case_sensitive: bool = False, use_regex: bool = False) -> List[Match]:
        """Find all matches in buffer."""
        self.pattern = pattern
        self.case_sensitive = case_sensitive
        self.use_regex = use_regex
        self.matches = []
        self.current_index = -1

        if not pattern:
            return []

        flags = 0 if case_sensitive else re.IGNORECASE

        try:
            if use_regex:
                regex = re.compile(pattern, flags)
            else:
                regex = re.compile(re.escape(pattern), flags)

            for row, line in enumerate(lines):
                for match in regex.finditer(line):
                    self.matches.append(Match(
                        row=row,
                        col=match.start(),
                        length=match.end() - match.start(),
                        text=match.group()
                    ))
        except re.error:
            # Invalid regex, return empty
            pass

        if self.matches:
            self.current_index = 0

        return self.matches

    def next_match(self) -> Match | None:
        """Go to next match."""
        if not self.matches:
            return None
        self.current_index = (self.current_index + 1) % len(self.matches)
        return self.matches[self.current_index]

    def prev_match(self) -> Match | None:
        """Go to previous match."""
        if not self.matches:
            return None
        self.current_index = (self.current_index - 1) % len(self.matches)
        return self.matches[self.current_index]

    def current_match(self) -> Match | None:
        """Get current match."""
        if not self.matches or self.current_index < 0:
            return None
        return self.matches[self.current_index]

    def match_count(self) -> int:
        """Get total match count."""
        return len(self.matches)

    def status_text(self) -> str:
        """Get status text for display."""
        if not self.pattern:
            return ""
        if not self.matches:
            return f"No matches for '{self.pattern}'"
        return f"Match {self.current_index + 1}/{len(self.matches)}"

    def clear(self) -> None:
        """Clear search."""
        self.pattern = ""
        self.matches = []
        self.current_index = -1

    def is_match_at(self, row: int, col: int) -> Tuple[bool, int]:
        """Check if position is within a match. Returns (is_match, match_length)."""
        for match in self.matches:
            if match.row == row and match.col <= col < match.col + match.length:
                return True, match.length
        return False, 0

    def matches_on_row(self, row: int) -> List[Match]:
        """Get all matches on a specific row."""
        return [m for m in self.matches if m.row == row]


class ReplaceEngine:
    """Search and replace engine."""

    def __init__(self, search: Search):
        self.search = search
        self.replacement: str = ""

    def replace_current(self, lines: List[str]) -> List[str]:
        """Replace current match."""
        match = self.search.current_match()
        if not match:
            return lines

        line = lines[match.row]
        lines[match.row] = (
            line[:match.col] +
            self.replacement +
            line[match.col + match.length:]
        )

        # Re-search to update matches
        self.search.find_all(
            lines, self.search.pattern,
            self.search.case_sensitive, self.search.use_regex
        )

        return lines

    def replace_all(self, lines: List[str], replacement: str) -> Tuple[List[str], int]:
        """Replace all matches. Returns (new_lines, count)."""
        self.replacement = replacement
        count = 0

        flags = 0 if self.search.case_sensitive else re.IGNORECASE

        try:
            if self.search.use_regex:
                regex = re.compile(self.search.pattern, flags)
            else:
                regex = re.compile(re.escape(self.search.pattern), flags)

            new_lines = []
            for line in lines:
                new_line, n = regex.subn(replacement, line)
                new_lines.append(new_line)
                count += n

            self.search.clear()
            return new_lines, count

        except re.error:
            return lines, 0


# Global search instance
_search: Search | None = None

def get_search() -> Search:
    """Get global search instance."""
    global _search
    if _search is None:
        _search = Search()
    return _search
