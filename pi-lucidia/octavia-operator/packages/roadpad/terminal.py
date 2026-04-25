"""
RoadPad Terminal - Integrated terminal emulator.

Features:
- PTY-based terminal
- Split integration
- Scrollback
- Copy/paste
"""

import os
import sys
import select
import fcntl
import termios
import struct
import subprocess
from dataclasses import dataclass, field
from typing import List, Callable
import threading


@dataclass
class TerminalBuffer:
    """Terminal screen buffer."""
    lines: List[str] = field(default_factory=list)
    scrollback: List[str] = field(default_factory=list)
    max_scrollback: int = 10000
    cursor_row: int = 0
    cursor_col: int = 0
    width: int = 80
    height: int = 24

    def write(self, text: str) -> None:
        """Write text to buffer."""
        for char in text:
            if char == '\n':
                self._newline()
            elif char == '\r':
                self.cursor_col = 0
            elif char == '\b':
                if self.cursor_col > 0:
                    self.cursor_col -= 1
            elif char == '\t':
                self.cursor_col = (self.cursor_col + 8) & ~7
            elif ord(char) >= 32 or char == '\x1b':
                self._put_char(char)

    def _put_char(self, char: str) -> None:
        """Put character at cursor."""
        while len(self.lines) <= self.cursor_row:
            self.lines.append("")

        line = self.lines[self.cursor_row]
        while len(line) <= self.cursor_col:
            line += " "

        self.lines[self.cursor_row] = line[:self.cursor_col] + char + line[self.cursor_col + 1:]
        self.cursor_col += 1

        if self.cursor_col >= self.width:
            self._newline()

    def _newline(self) -> None:
        """Move to new line."""
        self.cursor_row += 1
        self.cursor_col = 0

        if self.cursor_row >= self.height:
            # Scroll
            if self.lines:
                self.scrollback.append(self.lines.pop(0))
                while len(self.scrollback) > self.max_scrollback:
                    self.scrollback.pop(0)
            self.cursor_row = self.height - 1

    def clear(self) -> None:
        """Clear screen."""
        self.lines = []
        self.cursor_row = 0
        self.cursor_col = 0

    def get_visible(self) -> List[str]:
        """Get visible lines."""
        result = []
        for i in range(self.height):
            if i < len(self.lines):
                line = self.lines[i][:self.width]
                result.append(line + " " * (self.width - len(line)))
            else:
                result.append(" " * self.width)
        return result


class Terminal:
    """PTY-based terminal."""

    def __init__(self, shell: str = "/bin/bash"):
        self.shell = shell
        self.master_fd: int = -1
        self.slave_fd: int = -1
        self.pid: int = -1
        self.running: bool = False

        self.buffer = TerminalBuffer()
        self.on_output: Callable[[str], None] | None = None

        self._reader_thread: threading.Thread | None = None

    def start(self, width: int = 80, height: int = 24) -> bool:
        """Start terminal."""
        self.buffer.width = width
        self.buffer.height = height

        try:
            # Create PTY
            self.master_fd, self.slave_fd = os.openpty()

            # Set window size
            winsize = struct.pack('HHHH', height, width, 0, 0)
            fcntl.ioctl(self.slave_fd, termios.TIOCSWINSZ, winsize)

            # Fork
            pid = os.fork()
            if pid == 0:
                # Child
                os.setsid()
                os.dup2(self.slave_fd, 0)
                os.dup2(self.slave_fd, 1)
                os.dup2(self.slave_fd, 2)
                os.close(self.master_fd)
                os.close(self.slave_fd)
                os.execvp(self.shell, [self.shell])
            else:
                # Parent
                self.pid = pid
                os.close(self.slave_fd)
                self.running = True

                # Start reader
                self._reader_thread = threading.Thread(target=self._read_loop, daemon=True)
                self._reader_thread.start()

                return True
        except Exception as e:
            return False

        return False

    def stop(self) -> None:
        """Stop terminal."""
        self.running = False
        if self.pid > 0:
            try:
                os.kill(self.pid, 9)
                os.waitpid(self.pid, 0)
            except:
                pass
        if self.master_fd >= 0:
            os.close(self.master_fd)
            self.master_fd = -1

    def write(self, data: str) -> None:
        """Write to terminal."""
        if self.master_fd >= 0:
            os.write(self.master_fd, data.encode())

    def send_key(self, key: int, char: str = "") -> None:
        """Send key to terminal."""
        if char:
            self.write(char)
        elif key == 10 or key == 13:
            self.write("\r")
        elif key == 127:
            self.write("\x7f")
        elif key == 27:
            self.write("\x1b")

    def resize(self, width: int, height: int) -> None:
        """Resize terminal."""
        self.buffer.width = width
        self.buffer.height = height

        if self.master_fd >= 0:
            winsize = struct.pack('HHHH', height, width, 0, 0)
            try:
                fcntl.ioctl(self.master_fd, termios.TIOCSWINSZ, winsize)
            except:
                pass

    def _read_loop(self) -> None:
        """Read output from terminal."""
        while self.running and self.master_fd >= 0:
            try:
                r, _, _ = select.select([self.master_fd], [], [], 0.1)
                if r:
                    data = os.read(self.master_fd, 4096)
                    if data:
                        text = data.decode('utf-8', errors='replace')
                        self.buffer.write(text)
                        if self.on_output:
                            self.on_output(text)
                    else:
                        self.running = False
                        break
            except:
                break

    def get_lines(self) -> List[str]:
        """Get visible lines."""
        return self.buffer.get_visible()


class TerminalManager:
    """Manages multiple terminals."""

    def __init__(self):
        self.terminals: List[Terminal] = []
        self.active_index: int = -1

    def create(self, shell: str = "/bin/bash", width: int = 80, height: int = 24) -> Terminal:
        """Create new terminal."""
        term = Terminal(shell)
        if term.start(width, height):
            self.terminals.append(term)
            self.active_index = len(self.terminals) - 1
            return term
        return None

    def close(self, index: int | None = None) -> None:
        """Close terminal."""
        idx = index if index is not None else self.active_index
        if 0 <= idx < len(self.terminals):
            self.terminals[idx].stop()
            self.terminals.pop(idx)
            if self.active_index >= len(self.terminals):
                self.active_index = len(self.terminals) - 1

    def close_all(self) -> None:
        """Close all terminals."""
        for term in self.terminals:
            term.stop()
        self.terminals.clear()
        self.active_index = -1

    @property
    def active(self) -> Terminal | None:
        """Get active terminal."""
        if 0 <= self.active_index < len(self.terminals):
            return self.terminals[self.active_index]
        return None

    def next_terminal(self) -> None:
        """Switch to next terminal."""
        if self.terminals:
            self.active_index = (self.active_index + 1) % len(self.terminals)

    def prev_terminal(self) -> None:
        """Switch to previous terminal."""
        if self.terminals:
            self.active_index = (self.active_index - 1) % len(self.terminals)


# Global manager
_manager: TerminalManager | None = None

def get_terminal_manager() -> TerminalManager:
    """Get global terminal manager."""
    global _manager
    if _manager is None:
        _manager = TerminalManager()
    return _manager
