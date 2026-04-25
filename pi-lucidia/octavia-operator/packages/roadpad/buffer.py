"""
RoadPad Buffer - Plain text source of truth.
No formatting, no rich text. Just lines of text.
"""

class Buffer:
    def __init__(self, lines: list[str] | None = None):
        self.lines: list[str] = lines if lines else [""]
        self.cursor_row: int = 0
        self.cursor_col: int = 0
        self.modified: bool = False
        self.filepath: str | None = None

    def insert_char(self, char: str) -> None:
        """Insert character at cursor position."""
        line = self.lines[self.cursor_row]
        self.lines[self.cursor_row] = line[:self.cursor_col] + char + line[self.cursor_col:]
        self.cursor_col += 1
        self.modified = True

    def delete_char(self) -> None:
        """Delete character before cursor (backspace)."""
        if self.cursor_col > 0:
            line = self.lines[self.cursor_row]
            self.lines[self.cursor_row] = line[:self.cursor_col - 1] + line[self.cursor_col:]
            self.cursor_col -= 1
            self.modified = True
        elif self.cursor_row > 0:
            # Join with previous line
            prev_len = len(self.lines[self.cursor_row - 1])
            self.lines[self.cursor_row - 1] += self.lines[self.cursor_row]
            del self.lines[self.cursor_row]
            self.cursor_row -= 1
            self.cursor_col = prev_len
            self.modified = True

    def insert_newline(self) -> None:
        """Insert newline at cursor, splitting current line."""
        line = self.lines[self.cursor_row]
        self.lines[self.cursor_row] = line[:self.cursor_col]
        self.lines.insert(self.cursor_row + 1, line[self.cursor_col:])
        self.cursor_row += 1
        self.cursor_col = 0
        self.modified = True

    def move_up(self) -> None:
        if self.cursor_row > 0:
            self.cursor_row -= 1
            self.cursor_col = min(self.cursor_col, len(self.lines[self.cursor_row]))

    def move_down(self) -> None:
        if self.cursor_row < len(self.lines) - 1:
            self.cursor_row += 1
            self.cursor_col = min(self.cursor_col, len(self.lines[self.cursor_row]))

    def move_left(self) -> None:
        if self.cursor_col > 0:
            self.cursor_col -= 1
        elif self.cursor_row > 0:
            self.cursor_row -= 1
            self.cursor_col = len(self.lines[self.cursor_row])

    def move_right(self) -> None:
        if self.cursor_col < len(self.lines[self.cursor_row]):
            self.cursor_col += 1
        elif self.cursor_row < len(self.lines) - 1:
            self.cursor_row += 1
            self.cursor_col = 0

    def move_home(self) -> None:
        self.cursor_col = 0

    def move_end(self) -> None:
        self.cursor_col = len(self.lines[self.cursor_row])

    def get_text(self) -> str:
        """Return full buffer as string."""
        return "\n".join(self.lines)

    def set_text(self, text: str) -> None:
        """Replace buffer contents."""
        self.lines = text.split("\n") if text else [""]
        self.cursor_row = 0
        self.cursor_col = 0
        self.modified = False

    def load_file(self, filepath: str) -> bool:
        """Load file into buffer."""
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                self.set_text(f.read())
            self.filepath = filepath
            return True
        except (IOError, OSError):
            return False

    def save_file(self, filepath: str | None = None) -> bool:
        """Save buffer to file."""
        path = filepath or self.filepath
        if not path:
            return False
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(self.get_text())
            self.filepath = path
            self.modified = False
            return True
        except (IOError, OSError):
            return False

    @property
    def line_count(self) -> int:
        return len(self.lines)

    @property
    def current_line(self) -> str:
        return self.lines[self.cursor_row]
