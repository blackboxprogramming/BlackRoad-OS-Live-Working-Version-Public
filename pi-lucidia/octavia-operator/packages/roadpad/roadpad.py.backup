#!/usr/bin/env python3
"""
RoadPad - Terminal-native plain-text editor for BlackRoad OS.

Plain text buffer only, deterministic render, no assistant overlays.
Copilot integration via gh CLI subprocess.
"""

import curses
import os
import sys

from buffer import Buffer
from renderer import Renderer
from bridge import get_bridge

SUPPORTED_EXTENSIONS = {'.txt', '.md', '.road'}


class RoadPad:
    def __init__(self, stdscr, filepath: str | None = None):
        self.stdscr = stdscr
        self.buffer = Buffer()
        self.renderer = Renderer(stdscr)
        self.bridge = get_bridge()
        self.input_text = ''
        self.accept_mode = 0
        self.scroll_offset = 0
        self.running = True
        self.message = ''
        self.mode = 'prompt'  # 'prompt' or 'editor'
        self.waiting = False  # Waiting for Copilot response

        if filepath:
            ext = os.path.splitext(filepath)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS and ext:
                self.message = f'Warning: {ext} not in {SUPPORTED_EXTENSIONS}'
            self.buffer.load_file(filepath)
            self.mode = 'editor'  # Start in editor mode when opening file

        stdscr.keypad(True)
        stdscr.nodelay(False)
        curses.raw()

    def append_to_buffer(self, text: str) -> None:
        """Append text to buffer (used for Copilot responses)."""
        # Move to end of buffer
        self.buffer.cursor_row = self.buffer.line_count - 1
        self.buffer.cursor_col = len(self.buffer.lines[self.buffer.cursor_row])

        # Add blank line if buffer not empty
        if self.buffer.get_text().strip():
            self.buffer.insert_newline()

        # Insert response text
        for char in text:
            if char == '\n':
                self.buffer.insert_newline()
            else:
                self.buffer.insert_char(char)

        self.buffer.insert_newline()
        self.adjust_scroll()

    def submit_prompt(self) -> None:
        """Send input line to Copilot."""
        if not self.input_text.strip():
            return

        prompt = self.input_text.strip()
        self.input_text = ''

        # Show query in buffer
        self.append_to_buffer(f"> {prompt}")

        # Set waiting state
        self.waiting = True
        self.message = "Thinking..."
        self.stdscr.nodelay(True)  # Non-blocking for updates

        def on_response(text: str):
            self.append_to_buffer(text)

        def on_done():
            self.waiting = False
            self.stdscr.nodelay(False)

        self.bridge.send_prompt(prompt, on_response, on_done)

    def submit_to_buffer(self) -> None:
        """Commit active input line into the plain-text editor buffer."""
        if self.input_text:
            for char in self.input_text:
                self.buffer.insert_char(char)
            self.input_text = ''
        self.buffer.insert_newline()

    def handle_input(self, key: int) -> None:
        """Process keyboard input."""
        # Quit
        if key in (17, 3):  # Ctrl+Q, Ctrl+C
            self.running = False
            return

        # Save
        if key == 19:  # Ctrl+S
            if self.buffer.filepath:
                if self.buffer.save_file():
                    self.message = f'Saved: {self.buffer.filepath}'
                else:
                    self.message = 'Save failed'
            else:
                self.message = 'No filename (use :w filename)'
            return

        # Toggle mode (Ctrl+P)
        if key == 16:
            self.mode = 'editor' if self.mode == 'prompt' else 'prompt'
            self.message = f'{self.mode} mode'
            return

        # Shift+Tab - cycle accept mode
        if key == curses.KEY_BTAB or key == 353:
            self.accept_mode = (self.accept_mode + 1) % 3
            return

        # Arrow keys (work in both modes)
        if key == curses.KEY_UP:
            self.buffer.move_up()
            self.adjust_scroll()
            return

        if key == curses.KEY_DOWN:
            self.buffer.move_down()
            self.adjust_scroll()
            return

        if key == curses.KEY_LEFT:
            self.buffer.move_left()
            return

        if key == curses.KEY_RIGHT:
            self.buffer.move_right()
            return

        if key == curses.KEY_HOME:
            self.buffer.move_home()
            return

        if key == curses.KEY_END:
            self.buffer.move_end()
            return

        # Backspace
        if key in (curses.KEY_BACKSPACE, 127, 8):
            if self.input_text:
                self.input_text = self.input_text[:-1]
            elif self.mode == 'editor':
                self.buffer.delete_char()
            return

        # Tab
        if key == 9:
            if self.mode == 'prompt':
                self.input_text += '    '
            else:
                for _ in range(4):
                    self.buffer.insert_char(' ')
            return

        # Escape - clear input
        if key == 27:
            self.input_text = ''
            return

        # Enter
        if key in (curses.KEY_ENTER, 10, 13):
            if self.mode == 'prompt' and self.input_text.strip():
                self.submit_prompt()
            elif self.mode == 'editor':
                if self.input_text:
                    self.submit_to_buffer()
                else:
                    self.buffer.insert_newline()
            self.adjust_scroll()
            return

        # Command mode (vim-style)
        if key == ord(':') and not self.input_text:
            self.input_text = ':'
            return

        # Execute command on Enter if starts with :
        if self.input_text.startswith(':') and key in (curses.KEY_ENTER, 10, 13):
            self.execute_command(self.input_text)
            self.input_text = ''
            return

        # Printable characters
        if 32 <= key <= 126:
            if self.mode == 'editor' and not self.input_text:
                self.buffer.insert_char(chr(key))
            else:
                self.input_text += chr(key)
            return

        # UTF-8 characters
        if key > 127:
            try:
                char = chr(key)
                if self.mode == 'editor' and not self.input_text:
                    self.buffer.insert_char(char)
                else:
                    self.input_text += char
            except (ValueError, OverflowError):
                pass

    def execute_command(self, cmd: str) -> None:
        """Execute vim-style command."""
        cmd = cmd.strip()

        if cmd == ':q' or cmd == ':q!':
            if cmd == ':q!' or not self.buffer.modified:
                self.running = False
            else:
                self.message = 'Unsaved changes (use :q!)'
            return

        if cmd.startswith(':w'):
            parts = cmd.split(maxsplit=1)
            filepath = parts[1] if len(parts) > 1 else self.buffer.filepath
            if filepath:
                if self.buffer.save_file(filepath):
                    self.message = f'Saved: {filepath}'
                else:
                    self.message = 'Save failed'
            else:
                self.message = 'No filename'
            return

        if cmd.startswith(':e '):
            filepath = cmd[3:].strip()
            if self.buffer.load_file(filepath):
                self.message = f'Loaded: {filepath}'
                self.scroll_offset = 0
                self.mode = 'editor'
            else:
                self.message = f'Cannot open: {filepath}'
            return

        if cmd == ':wq':
            if self.buffer.filepath:
                self.buffer.save_file()
            self.running = False
            return

        self.message = f'Unknown: {cmd}'

    def adjust_scroll(self) -> None:
        """Keep cursor visible by adjusting scroll offset."""
        visible_lines = max(1, self.renderer.height - self.renderer.editor_offset - 1)

        if self.buffer.cursor_row < self.scroll_offset:
            self.scroll_offset = self.buffer.cursor_row
        elif self.buffer.cursor_row >= self.scroll_offset + visible_lines:
            self.scroll_offset = self.buffer.cursor_row - visible_lines + 1

    def run(self) -> None:
        """Main editor loop."""
        while self.running:
            # Render current state
            display_mode = f'{self.mode}' + (' ...' if self.waiting else '')
            self.renderer.render(
                self.buffer,
                self.input_text,
                self.accept_mode,
                self.scroll_offset,
                display_mode
            )

            if self.message:
                self.renderer.show_message(self.message)
                self.message = ''

            try:
                key = self.stdscr.getch()
            except KeyboardInterrupt:
                self.running = False
                continue

            if key == -1:
                # No input (non-blocking mode during wait)
                if self.waiting:
                    curses.napms(50)  # Small delay
                continue

            self.handle_input(key)


def main(stdscr, filepath: str | None = None) -> None:
    editor = RoadPad(stdscr, filepath)
    editor.run()


if __name__ == '__main__':
    filepath = sys.argv[1] if len(sys.argv) > 1 else None
    curses.wrapper(lambda s: main(s, filepath))
