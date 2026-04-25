"""
Lucidia Curses UI - Full-screen terminal interface.

Sovereign BlackRoad OS AI interface. Backends are pluggable.
"""

import curses
import os
import sys
import subprocess
import threading
import time
from datetime import datetime
from typing import List, Callable

# Import from lucidia.py
from lucidia import (
    LOGO_LARGE, ROBOT_FACE, ROBOT_MINI, LAYERS_BOOT,
    BACKENDS, BackendRunner, get_best_backend, box
)


class LucidiaUI:
    """Full-screen Lucidia interface - sovereign AI."""

    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.height = 0
        self.width = 0
        self.update_size()

        # State
        self.backend_name = None  # Auto-select
        self.input_buffer = ""
        self.output_lines: List[str] = []
        self.scroll_offset = 0
        self.running = True
        self.mode = "chat"  # chat, backend_select, help

        # Backend (pluggable inference engine)
        self.backend: BackendRunner = None

        # UI regions
        self.header_height = 10
        self.input_height = 3
        self.output_start = self.header_height
        self.output_height = self.height - self.header_height - self.input_height - 2

        # Setup curses
        curses.curs_set(1)
        curses.start_color()
        curses.use_default_colors()
        self.stdscr.keypad(True)
        self.stdscr.timeout(100)  # 100ms timeout for non-blocking

    def update_size(self):
        """Update terminal dimensions."""
        self.height, self.width = self.stdscr.getmaxyx()
        self.output_height = self.height - self.header_height - self.input_height - 2

    def draw_header(self):
        """Draw the Lucidia header."""
        # Logo
        logo_lines = LOGO_LARGE.split("\n")
        for i, line in enumerate(logo_lines):
            try:
                self.stdscr.addstr(i, 0, line[:self.width-1])
            except curses.error:
                pass

        # Robot face and info
        info_row = len(logo_lines) + 1
        backend_info = "auto-selecting..."
        if self.backend and self.backend.backend:
            backend_info = f"via {self.backend.backend.name}"
        try:
            self.stdscr.addstr(info_row, 2, "   >─╮")
            self.stdscr.addstr(info_row + 1, 2, f"    ▣═▣    Lucidia ({backend_info})")
            self.stdscr.addstr(info_row + 2, 2, f"    ● ●    {os.getcwd()}")
        except curses.error:
            pass

    def draw_output(self):
        """Draw the output area."""
        start_row = self.header_height

        # Separator
        try:
            self.stdscr.addstr(start_row, 0, "─" * (self.width - 1), curses.A_DIM)
        except curses.error:
            pass

        # Output lines
        visible_lines = self.output_lines[self.scroll_offset:self.scroll_offset + self.output_height]
        for i, line in enumerate(visible_lines):
            row = start_row + 1 + i
            try:
                display = line[:self.width - 2]
                self.stdscr.addstr(row, 1, display)
            except curses.error:
                pass

        # Scroll indicator
        if len(self.output_lines) > self.output_height:
            pct = int((self.scroll_offset / max(1, len(self.output_lines) - self.output_height)) * 100)
            try:
                self.stdscr.addstr(start_row, self.width - 8, f"[{pct:3d}%]", curses.A_DIM)
            except curses.error:
                pass

    def draw_input(self):
        """Draw the input area."""
        input_row = self.height - self.input_height

        # Separator
        try:
            self.stdscr.addstr(input_row, 0, "─" * (self.width - 1), curses.A_DIM)
        except curses.error:
            pass

        # Prompt
        try:
            self.stdscr.addstr(input_row + 1, 1, "›")
            self.stdscr.addstr(input_row + 1, 3, self.input_buffer[:self.width - 5])
        except curses.error:
            pass

        # Status bar
        backend_name = "auto"
        if self.backend and self.backend.backend:
            backend_name = self.backend.backend.name
        status = f" Lucidia | Backend: {backend_name} | /backend /help /quit "
        try:
            self.stdscr.addstr(self.height - 1, 0, status[:self.width-1], curses.A_REVERSE)
        except curses.error:
            pass

        # Move cursor to input
        try:
            self.stdscr.move(input_row + 1, 3 + len(self.input_buffer))
        except curses.error:
            pass

    def draw_backend_select(self):
        """Draw backend selection overlay."""
        # Box dimensions
        box_width = 65
        box_height = len(BACKENDS) + 7
        start_row = (self.height - box_height) // 2
        start_col = (self.width - box_width) // 2

        # Draw box
        try:
            self.stdscr.addstr(start_row, start_col, "╭" + "─" * (box_width - 2) + "╮")
            self.stdscr.addstr(start_row + 1, start_col, "│" + " Select Backend (● local  ○ remote)".center(box_width - 2) + "│")
            self.stdscr.addstr(start_row + 2, start_col, "├" + "─" * (box_width - 2) + "┤")

            for i, (key, backend) in enumerate(BACKENDS.items()):
                marker = "›" if key == self.backend_name else " "
                local = "●" if backend.priority <= 3 else "○"
                line = f"{marker} {i+1}. {local} {backend.name:18} {backend.description[:28]}"
                self.stdscr.addstr(start_row + 3 + i, start_col, "│ " + line.ljust(box_width - 4) + " │")

            self.stdscr.addstr(start_row + 3 + len(BACKENDS), start_col, "├" + "─" * (box_width - 2) + "┤")
            self.stdscr.addstr(start_row + 4 + len(BACKENDS), start_col, "│" + " Press 1-6, A=auto, ESC=cancel".center(box_width - 2) + "│")
            self.stdscr.addstr(start_row + 5 + len(BACKENDS), start_col, "╰" + "─" * (box_width - 2) + "╯")
        except curses.error:
            pass

    # Legacy alias
    draw_model_select = draw_backend_select

    def draw(self):
        """Draw the full UI."""
        self.stdscr.clear()
        self.draw_header()
        self.draw_output()
        self.draw_input()

        if self.mode in ("model_select", "backend_select"):
            self.draw_backend_select()

        self.stdscr.refresh()

    def add_output(self, text: str):
        """Add text to output."""
        for line in text.split("\n"):
            self.output_lines.append(line)

        # Auto-scroll to bottom
        if len(self.output_lines) > self.output_height:
            self.scroll_offset = len(self.output_lines) - self.output_height

    def handle_input(self, key: int):
        """Handle keyboard input."""
        if self.mode in ("model_select", "backend_select"):
            if key == 27:  # ESC
                self.mode = "chat"
            elif key == ord('a') or key == ord('A'):
                # Auto-select
                self.backend_name = None
                self.add_output("  ✓ Backend: auto-select")
                self.restart_backend()
                self.mode = "chat"
            elif ord('1') <= key <= ord('6'):
                idx = key - ord('1')
                backends = list(BACKENDS.keys())
                if idx < len(backends):
                    self.backend_name = backends[idx]
                    self.add_output(f"  ✓ Backend: {BACKENDS[self.backend_name].name}")
                    self.restart_backend()
                self.mode = "chat"
            return

        if key == 27:  # ESC
            return
        elif key == curses.KEY_RESIZE:
            self.update_size()
        elif key == curses.KEY_UP:
            if self.scroll_offset > 0:
                self.scroll_offset -= 1
        elif key == curses.KEY_DOWN:
            if self.scroll_offset < len(self.output_lines) - self.output_height:
                self.scroll_offset += 1
        elif key == curses.KEY_PPAGE:  # Page Up
            self.scroll_offset = max(0, self.scroll_offset - self.output_height)
        elif key == curses.KEY_NPAGE:  # Page Down
            self.scroll_offset = min(
                max(0, len(self.output_lines) - self.output_height),
                self.scroll_offset + self.output_height
            )
        elif key == 10 or key == 13:  # Enter
            self.submit_input()
        elif key == 127 or key == curses.KEY_BACKSPACE:
            self.input_buffer = self.input_buffer[:-1]
        elif key >= 32 and key < 127:
            self.input_buffer += chr(key)

    def submit_input(self):
        """Submit current input."""
        text = self.input_buffer.strip()
        self.input_buffer = ""

        if not text:
            return

        # Add user message to output
        self.add_output("")
        self.add_output(f"  › {text}")
        self.add_output("")

        # Handle commands
        if text in ("/model", "/backend"):
            self.mode = "backend_select"
            return
        elif text == "/quit" or text == "/q":
            self.running = False
            return
        elif text == "/help":
            self.add_output("  Lucidia Commands:")
            self.add_output("    /backend - Select inference backend")
            self.add_output("    /quit    - Exit Lucidia")
            self.add_output("    /help    - Show this help")
            self.add_output("    /layers  - Show loaded layers")
            return
        elif text == "/layers":
            for line in LAYERS_BOOT.split("\n"):
                self.add_output(line)
            return

        # Send to backend
        if self.backend:
            self.add_output("    ▣═▣ ···")
            self.backend.send(text)

    def restart_backend(self):
        """Restart with new backend."""
        if self.backend:
            self.backend.stop()
        self.backend = BackendRunner(self.backend_name)
        self.backend.on_output = lambda line: self.add_output(f"    {line}")
        self.backend.start()

    def poll_output(self):
        """Poll for new output from backend."""
        if self.backend:
            output = self.backend.get_output()
            for line in output:
                # Filter UI noise from various backends
                if not any(x in line for x in ["╭", "╰", "│", "thinking"]):
                    self.add_output(f"    {line}")

    def run(self):
        """Main loop."""
        # Show boot sequence
        self.add_output("  ✓ BlackRoad OS v3")
        for line in LAYERS_BOOT.split("\n"):
            self.add_output(line)
        self.add_output("")

        # Start backend (auto-selects best available)
        self.add_output("  ◐ Detecting backends...")
        self.restart_backend()

        if self.backend and self.backend.backend:
            locality = "local" if self.backend.backend.priority <= 3 else "remote"
            self.add_output(f"  ✓ Using {self.backend.backend.name} ({locality})")
        self.add_output("")
        self.add_output("  ✓ Lucidia ready")
        self.add_output("")

        while self.running:
            self.draw()

            # Get input (non-blocking due to timeout)
            try:
                key = self.stdscr.getch()
                if key != -1:
                    self.handle_input(key)
            except:
                pass

            # Poll for backend output
            self.poll_output()

        # Cleanup
        if self.backend:
            self.backend.stop()


def main(stdscr):
    """Main entry point."""
    ui = LucidiaUI(stdscr)
    ui.run()


def run():
    """Run with curses wrapper."""
    curses.wrapper(main)


if __name__ == "__main__":
    run()
