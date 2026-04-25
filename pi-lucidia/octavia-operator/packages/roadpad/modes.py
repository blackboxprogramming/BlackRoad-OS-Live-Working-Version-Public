"""
RoadPad Modal System - Vim-style modes.

Modes:
- NORMAL: Navigation, commands
- INSERT: Text entry
- COMMAND: : commands
- VISUAL: Selection
- SEARCH: / and ? search
"""

from dataclasses import dataclass, field
from typing import Dict, List, Callable, Any
from enum import Enum


class Mode(Enum):
    NORMAL = "NORMAL"
    INSERT = "INSERT"
    COMMAND = "COMMAND"
    VISUAL = "VISUAL"
    VISUAL_LINE = "V-LINE"
    SEARCH = "SEARCH"
    REPLACE = "REPLACE"


@dataclass
class ModeState:
    """State for current mode."""
    mode: Mode = Mode.NORMAL
    command_buffer: str = ""
    search_buffer: str = ""
    search_direction: int = 1  # 1 forward, -1 backward
    visual_start: tuple = (0, 0)  # (row, col)
    repeat_count: int = 0
    last_command: str = ""
    pending_operator: str = ""  # d, c, y, etc.


class ModalHandler:
    """Handles modal key processing."""

    def __init__(self):
        self.state = ModeState()
        self.mode_handlers: Dict[Mode, Callable] = {}
        self.normal_commands: Dict[str, Callable] = {}
        self.operators: Dict[str, Callable] = {}
        self.motions: Dict[str, Callable] = {}

        self._init_default_bindings()

    def _init_default_bindings(self):
        """Initialize default vim-like bindings."""
        # Normal mode commands
        self.normal_commands = {
            "i": lambda ctx: self.enter_insert(ctx),
            "I": lambda ctx: self.enter_insert_bol(ctx),
            "a": lambda ctx: self.enter_insert_after(ctx),
            "A": lambda ctx: self.enter_insert_eol(ctx),
            "o": lambda ctx: self.open_line_below(ctx),
            "O": lambda ctx: self.open_line_above(ctx),
            "v": lambda ctx: self.enter_visual(ctx),
            "V": lambda ctx: self.enter_visual_line(ctx),
            ":": lambda ctx: self.enter_command(ctx),
            "/": lambda ctx: self.enter_search_forward(ctx),
            "?": lambda ctx: self.enter_search_backward(ctx),
            "n": lambda ctx: self.search_next(ctx),
            "N": lambda ctx: self.search_prev(ctx),
            "u": lambda ctx: self.undo(ctx),
            "\x12": lambda ctx: self.redo(ctx),  # Ctrl+R
            ".": lambda ctx: self.repeat_last(ctx),
            "x": lambda ctx: self.delete_char(ctx),
            "X": lambda ctx: self.delete_char_before(ctx),
            "r": lambda ctx: self.replace_char(ctx),
            "~": lambda ctx: self.toggle_case(ctx),
            "J": lambda ctx: self.join_lines(ctx),
            ">>": lambda ctx: self.indent(ctx),
            "<<": lambda ctx: self.dedent(ctx),
            "gg": lambda ctx: self.goto_top(ctx),
            "G": lambda ctx: self.goto_bottom(ctx),
            "ZZ": lambda ctx: self.save_quit(ctx),
            "ZQ": lambda ctx: self.quit_no_save(ctx),
        }

        # Operators (work with motions)
        self.operators = {
            "d": "delete",
            "c": "change",
            "y": "yank",
            ">": "indent",
            "<": "dedent",
            "=": "format",
        }

        # Motions
        self.motions = {
            "h": "left",
            "j": "down",
            "k": "up",
            "l": "right",
            "w": "word_forward",
            "W": "WORD_forward",
            "b": "word_backward",
            "B": "WORD_backward",
            "e": "word_end",
            "E": "WORD_end",
            "0": "line_start",
            "^": "line_first_char",
            "$": "line_end",
            "f": "find_char",
            "F": "find_char_backward",
            "t": "till_char",
            "T": "till_char_backward",
            ";": "repeat_find",
            ",": "repeat_find_reverse",
            "{": "paragraph_up",
            "}": "paragraph_down",
            "(": "sentence_up",
            ")": "sentence_down",
            "%": "matching_bracket",
        }

    @property
    def mode(self) -> Mode:
        return self.state.mode

    @property
    def mode_name(self) -> str:
        return self.state.mode.value

    def enter_mode(self, mode: Mode) -> None:
        """Enter a mode."""
        self.state.mode = mode
        if mode == Mode.COMMAND:
            self.state.command_buffer = ""
        elif mode == Mode.SEARCH:
            self.state.search_buffer = ""
        elif mode in (Mode.VISUAL, Mode.VISUAL_LINE):
            pass  # visual_start set by caller

    def exit_mode(self) -> None:
        """Return to normal mode."""
        self.state.mode = Mode.NORMAL
        self.state.command_buffer = ""
        self.state.pending_operator = ""
        self.state.repeat_count = 0

    def handle_key(self, key: int, char: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle key in current mode. Returns actions to take."""
        result = {"handled": False, "action": None, "args": {}}

        if self.state.mode == Mode.NORMAL:
            result = self._handle_normal(key, char, context)
        elif self.state.mode == Mode.INSERT:
            result = self._handle_insert(key, char, context)
        elif self.state.mode == Mode.COMMAND:
            result = self._handle_command(key, char, context)
        elif self.state.mode == Mode.VISUAL:
            result = self._handle_visual(key, char, context)
        elif self.state.mode == Mode.SEARCH:
            result = self._handle_search(key, char, context)

        return result

    def _handle_normal(self, key: int, char: str, context: Dict) -> Dict:
        """Handle normal mode keys."""
        result = {"handled": False, "action": None, "args": {}}

        # ESC clears pending
        if key == 27:
            self.state.pending_operator = ""
            self.state.repeat_count = 0
            result["handled"] = True
            return result

        # Digits for repeat count (except 0 at start)
        if char.isdigit() and (char != "0" or self.state.repeat_count > 0):
            self.state.repeat_count = self.state.repeat_count * 10 + int(char)
            result["handled"] = True
            return result

        # Check operators
        if char in self.operators and not self.state.pending_operator:
            self.state.pending_operator = char
            result["handled"] = True
            return result

        # Double operator = line operation (dd, yy, etc)
        if char == self.state.pending_operator:
            result["action"] = f"{self.operators[char]}_line"
            result["args"]["count"] = max(1, self.state.repeat_count)
            self.state.pending_operator = ""
            self.state.repeat_count = 0
            result["handled"] = True
            return result

        # Check motions
        if char in self.motions:
            if self.state.pending_operator:
                result["action"] = f"{self.operators[self.state.pending_operator]}_{self.motions[char]}"
            else:
                result["action"] = f"move_{self.motions[char]}"
            result["args"]["count"] = max(1, self.state.repeat_count)
            self.state.pending_operator = ""
            self.state.repeat_count = 0
            result["handled"] = True
            return result

        # Check commands
        cmd = char
        if cmd in self.normal_commands:
            handler = self.normal_commands[cmd]
            handler(context)
            result["handled"] = True
            self.state.last_command = cmd

        return result

    def _handle_insert(self, key: int, char: str, context: Dict) -> Dict:
        """Handle insert mode keys."""
        result = {"handled": False, "action": None, "args": {}}

        # ESC exits insert
        if key == 27:
            self.exit_mode()
            result["action"] = "cursor_left"  # Vim behavior
            result["handled"] = True
            return result

        # Ctrl+C also exits
        if key == 3:
            self.exit_mode()
            result["handled"] = True
            return result

        # Pass through for insertion
        result["action"] = "insert"
        result["args"]["key"] = key
        result["args"]["char"] = char
        result["handled"] = True
        return result

    def _handle_command(self, key: int, char: str, context: Dict) -> Dict:
        """Handle command mode keys."""
        result = {"handled": False, "action": None, "args": {}}

        # ESC cancels
        if key == 27:
            self.exit_mode()
            result["handled"] = True
            return result

        # Enter executes
        if key == 10 or key == 13:
            result["action"] = "execute_command"
            result["args"]["command"] = self.state.command_buffer
            self.exit_mode()
            result["handled"] = True
            return result

        # Backspace
        if key == 127 or key == 8:
            if self.state.command_buffer:
                self.state.command_buffer = self.state.command_buffer[:-1]
            else:
                self.exit_mode()
            result["handled"] = True
            return result

        # Add to buffer
        if char and char.isprintable():
            self.state.command_buffer += char
            result["handled"] = True

        return result

    def _handle_visual(self, key: int, char: str, context: Dict) -> Dict:
        """Handle visual mode keys."""
        result = {"handled": False, "action": None, "args": {}}

        # ESC exits
        if key == 27:
            self.exit_mode()
            result["handled"] = True
            return result

        # Operators on selection
        if char in self.operators:
            result["action"] = f"{self.operators[char]}_selection"
            self.exit_mode()
            result["handled"] = True
            return result

        # Motions extend selection
        if char in self.motions:
            result["action"] = f"extend_{self.motions[char]}"
            result["handled"] = True
            return result

        return result

    def _handle_search(self, key: int, char: str, context: Dict) -> Dict:
        """Handle search mode keys."""
        result = {"handled": False, "action": None, "args": {}}

        # ESC cancels
        if key == 27:
            self.exit_mode()
            result["handled"] = True
            return result

        # Enter searches
        if key == 10 or key == 13:
            result["action"] = "search"
            result["args"]["pattern"] = self.state.search_buffer
            result["args"]["direction"] = self.state.search_direction
            self.exit_mode()
            result["handled"] = True
            return result

        # Backspace
        if key == 127 or key == 8:
            if self.state.search_buffer:
                self.state.search_buffer = self.state.search_buffer[:-1]
            else:
                self.exit_mode()
            result["handled"] = True
            return result

        # Add to buffer
        if char and char.isprintable():
            self.state.search_buffer += char
            result["handled"] = True

        return result

    # Mode entry helpers
    def enter_insert(self, ctx): self.enter_mode(Mode.INSERT)
    def enter_insert_bol(self, ctx): self.enter_mode(Mode.INSERT)
    def enter_insert_after(self, ctx): self.enter_mode(Mode.INSERT)
    def enter_insert_eol(self, ctx): self.enter_mode(Mode.INSERT)
    def open_line_below(self, ctx): self.enter_mode(Mode.INSERT)
    def open_line_above(self, ctx): self.enter_mode(Mode.INSERT)
    def enter_visual(self, ctx): self.enter_mode(Mode.VISUAL)
    def enter_visual_line(self, ctx): self.enter_mode(Mode.VISUAL_LINE)
    def enter_command(self, ctx): self.enter_mode(Mode.COMMAND)
    def enter_search_forward(self, ctx):
        self.state.search_direction = 1
        self.enter_mode(Mode.SEARCH)
    def enter_search_backward(self, ctx):
        self.state.search_direction = -1
        self.enter_mode(Mode.SEARCH)

    # Placeholder actions
    def search_next(self, ctx): pass
    def search_prev(self, ctx): pass
    def undo(self, ctx): pass
    def redo(self, ctx): pass
    def repeat_last(self, ctx): pass
    def delete_char(self, ctx): pass
    def delete_char_before(self, ctx): pass
    def replace_char(self, ctx): pass
    def toggle_case(self, ctx): pass
    def join_lines(self, ctx): pass
    def indent(self, ctx): pass
    def dedent(self, ctx): pass
    def goto_top(self, ctx): pass
    def goto_bottom(self, ctx): pass
    def save_quit(self, ctx): pass
    def quit_no_save(self, ctx): pass

    def get_status_line(self) -> str:
        """Get mode indicator for status line."""
        indicators = {
            Mode.NORMAL: "",
            Mode.INSERT: "-- INSERT --",
            Mode.COMMAND: f":{self.state.command_buffer}",
            Mode.VISUAL: "-- VISUAL --",
            Mode.VISUAL_LINE: "-- VISUAL LINE --",
            Mode.SEARCH: f"{'/' if self.state.search_direction == 1 else '?'}{self.state.search_buffer}",
            Mode.REPLACE: "-- REPLACE --",
        }
        prefix = ""
        if self.state.repeat_count > 0:
            prefix = str(self.state.repeat_count)
        if self.state.pending_operator:
            prefix += self.state.pending_operator
        return prefix + indicators.get(self.state.mode, "")


# Global handler
_handler: ModalHandler | None = None

def get_modal_handler() -> ModalHandler:
    """Get global modal handler."""
    global _handler
    if _handler is None:
        _handler = ModalHandler()
    return _handler
