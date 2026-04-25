"""
RoadPad Renderer - Deterministic terminal output.
No dynamic content, no AI references, diff-safe rendering.
Black and white only.
"""

import curses

# Lucidia branding
LOGO_MINI = """\
   >─╮
    ▣═▣    Lucidia · BlackRoad OS
    ● ●    ~"""

HEADER = """\
  ██╗     ██╗   ██╗ ██████╗██╗██████╗ ██╗ █████╗
  ██║     ██║   ██║██╔════╝██║██╔══██╗██║██╔══██╗
  ██║     ██║   ██║██║     ██║██║  ██║██║███████║
  ██║     ██║   ██║██║     ██║██║  ██║██║██╔══██║
  ███████╗╚██████╔╝╚██████╗██║██████╔╝██║██║  ██║
  ╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝"""

ROBOT_PROMPT = """\
   >─╮
    ▣═▣
    ● ●"""

HEADER_LINES = HEADER.split("\n")
HEADER_HEIGHT = len(HEADER_LINES) + 4  # +4 for robot and spacing

# Accept modes
ACCEPT_MODES = ["on", "review", "off"]


class Renderer:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.width = 0
        self.height = 0
        self.accept_mode_idx = 0
        self.editor_offset = HEADER_HEIGHT + 5

        # No colors - black and white only
        curses.start_color()
        curses.use_default_colors()
        curses.curs_set(1)

    def update_size(self) -> tuple[int, int]:
        """Update and return terminal dimensions."""
        self.height, self.width = self.stdscr.getmaxyx()
        return self.height, self.width

    def draw_header(self) -> None:
        """Draw Lucidia header with logo and robot."""
        # Draw main logo
        for i, line in enumerate(HEADER_LINES):
            try:
                self.stdscr.addstr(i, 0, line)
            except curses.error:
                pass

        # Draw robot prompt below logo
        robot_start = len(HEADER_LINES) + 1
        robot_lines = ROBOT_PROMPT.split("\n")
        for i, line in enumerate(robot_lines):
            try:
                self.stdscr.addstr(robot_start + i, 0, line)
            except curses.error:
                pass

    def draw_separator(self, row: int, length: int = None) -> None:
        """Draw horizontal separator line."""
        if length is None:
            length = min(200, self.width - 1)
        sep = "─" * length
        try:
            self.stdscr.addstr(row, 0, sep, curses.A_DIM)
        except curses.error:
            pass

    def draw_input_line(self, text: str, placeholder: str = "describe a task to get started") -> None:
        """Draw the active input line with > prompt."""
        row = HEADER_HEIGHT
        self.draw_separator(row)

        input_row = row + 1
        display_text = text if text else placeholder
        prompt = f">  {display_text}"

        try:
            self.stdscr.addstr(input_row, 0, prompt[:self.width - 1])
        except curses.error:
            pass

        self.draw_separator(input_row + 1)

    def draw_status_bar(self, accept_mode: int, mode: str = "editor", status_text: str = "") -> None:
        """Draw bottom status bar."""
        row = HEADER_HEIGHT + 3
        self.accept_mode_idx = accept_mode

        # Use custom status_text if provided, otherwise default
        if status_text:
            left = f"  ⏵⏵ accept edits {status_text} (shift+tab to cycle)"
        else:
            left = f"  ⏵⏵ accept edits {ACCEPT_MODES[accept_mode]} (shift+tab to cycle)"
        right = f"{mode} mode"

        try:
            self.stdscr.addstr(row, 0, left, curses.A_DIM)
            self.stdscr.addstr(row, self.width - len(right) - 1, right, curses.A_DIM)
        except curses.error:
            pass

    def draw_buffer(self, buffer, scroll_offset: int = 0) -> None:
        """Draw buffer contents in editor area."""
        start_row = self.editor_offset
        visible_lines = self.height - start_row

        for i in range(visible_lines):
            line_idx = scroll_offset + i
            row = start_row + i

            try:
                self.stdscr.move(row, 0)
                self.stdscr.clrtoeol()

                if line_idx < buffer.line_count:
                    line = buffer.lines[line_idx]
                    display = line[:self.width - 1]
                    self.stdscr.addstr(row, 0, display)
            except curses.error:
                pass

    def draw_cursor(self, input_text: str) -> None:
        """Position cursor on the active input line."""
        input_row = HEADER_HEIGHT + 1
        screen_col = min(3 + len(input_text), self.width - 1)
        if 0 <= input_row < self.height - 1:
            try:
                self.stdscr.move(input_row, screen_col)
            except curses.error:
                pass

    def render(self, buffer, input_text: str, accept_mode: int, scroll_offset: int = 0, mode: str = "editor", status_text: str = "") -> None:
        """Full render pass - deterministic output."""
        self.stdscr.erase()
        self.update_size()

        self.draw_header()
        self.draw_input_line(input_text)
        self.draw_buffer(buffer, scroll_offset)
        self.draw_status_bar(accept_mode, mode, status_text)
        self.draw_cursor(input_text)

        self.stdscr.refresh()

    def show_message(self, msg: str, row: int | None = None) -> None:
        """Show temporary message."""
        if row is None:
            row = self.height - 2
        try:
            self.stdscr.addstr(row, 0, msg[:self.width - 1])
            self.stdscr.refresh()
        except curses.error:
            pass
