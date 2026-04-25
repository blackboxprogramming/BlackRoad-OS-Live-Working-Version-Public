#!/usr/bin/env python3
"""
BLACKROAD OS - Pure Curses Terminal Interface
=============================================
Zero dependencies. Works on any Unix terminal.
Requires: Python 3 (standard library only)

Run: python3 blackroad-curses.py
"""

import curses
import subprocess
import time
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

FLEET = {
    "cecilia":   {"role": "primary",   "status": True},
    "lucidia":   {"role": "inference", "status": True},
    "aria":      {"role": "harmony",   "status": True},
    "octavia":   {"role": "multi-arm", "status": True},
    "alice":     {"role": "gateway",   "status": False},
    "shellfish": {"role": "edge",      "status": True},
    "blackroad os":     {"role": "cloud",     "status": True},
}

TABS = ["chat", "github", "projects", "sales", "web", "ops", "council"]

# ============================================================================
# COLOR PAIRS (xterm-256)
# ============================================================================
# 1 = white on black (default text)
# 2 = gray on black (muted)
# 3 = orange on black (actions)
# 4 = pink on black (brand/agent)
# 5 = blue on black (system)
# 6 = green on black (online)
# 7 = white on dark gray (panel header)
# 8 = purple on black (logic)

def init_colors():
    """Initialize color pairs for xterm-256."""
    curses.start_color()
    curses.use_default_colors()

    # Define colors (xterm-256 values)
    BLACK = 0
    WHITE = 15
    GRAY = 240
    DARK_GRAY = 235
    ORANGE = 214
    PINK = 204
    BLUE = 33
    GREEN = 78
    PURPLE = 134

    curses.init_pair(1, WHITE, -1)       # white on default
    curses.init_pair(2, GRAY, -1)        # muted
    curses.init_pair(3, ORANGE, -1)      # actions
    curses.init_pair(4, PINK, -1)        # brand/agent
    curses.init_pair(5, BLUE, -1)        # system
    curses.init_pair(6, GREEN, -1)       # online
    curses.init_pair(7, WHITE, DARK_GRAY) # panel header
    curses.init_pair(8, PURPLE, -1)      # logic


class BlackRoadOS:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.height, self.width = stdscr.getmaxyx()
        self.current_tab = 0
        self.command = ""
        self.output_lines = []
        self.cursor_pos = 0

        # Initialize
        curses.curs_set(1)
        stdscr.timeout(100)  # 100ms refresh
        init_colors()

        # Initial output
        self.add_output("system: blackroad os initialized", 5)
        self.add_output("system: fleet scan complete", 5)
        self.add_output("lucidia: hailo-8 ready, 26 TOPS", 4)
        self.add_output("cecilia: primary node online", 4)
        self.add_output("-" * 40, 2)

    def add_output(self, text, color=1):
        """Add line to output buffer."""
        self.output_lines.append((text, color))
        # Keep last 100 lines
        if len(self.output_lines) > 100:
            self.output_lines.pop(0)

    def draw_top_bar(self):
        """Draw top status bar."""
        bar = self.stdscr.subwin(1, self.width, 0, 0)
        bar.bkgd(' ', curses.color_pair(7))
        bar.clear()

        # Brand
        bar.addstr(0, 1, "BLACKROAD", curses.color_pair(4) | curses.A_BOLD)
        bar.addstr(" OS", curses.color_pair(2))

        # Status
        online = sum(1 for a in FLEET.values() if a["status"])
        status = f"  |  {online}/{len(FLEET)} nodes  |  {datetime.now().strftime('%H:%M')}"
        bar.addstr(0, 15, status, curses.color_pair(2))

        bar.refresh()

    def draw_left_panel(self):
        """Draw main output/command panel."""
        # Calculate dimensions
        left_width = int(self.width * 0.7)
        panel_height = self.height - 4  # top bar + bottom bar + input

        # Panel header
        self.stdscr.addstr(1, 0, " TERMINAL ", curses.color_pair(7))
        self.stdscr.addstr(1, 10, " " * (left_width - 11), curses.color_pair(2))

        # Output area
        output_height = panel_height - 2
        output_start = max(0, len(self.output_lines) - output_height)

        for i, (line, color) in enumerate(self.output_lines[output_start:]):
            y = 2 + i
            if y < self.height - 3:
                # Truncate line if too long
                display_line = line[:left_width - 2]
                self.stdscr.addstr(y, 1, display_line, curses.color_pair(color))

        # Separator
        sep_y = self.height - 3
        self.stdscr.addstr(sep_y, 0, "-" * left_width, curses.color_pair(2))

        # Input area
        input_y = self.height - 2
        self.stdscr.addstr(input_y, 1, "> ", curses.color_pair(1) | curses.A_BOLD)
        self.stdscr.addstr(input_y, 3, self.command[:left_width - 5], curses.color_pair(1))

        # Position cursor
        self.stdscr.move(input_y, 3 + len(self.command))

    def draw_right_panel(self):
        """Draw agents/tabs panel."""
        left_width = int(self.width * 0.7)
        right_width = self.width - left_width
        right_x = left_width

        # Vertical separator
        for y in range(1, self.height - 1):
            self.stdscr.addstr(y, left_width - 1, "|", curses.color_pair(2))

        # Panel header
        self.stdscr.addstr(1, right_x + 1, " FLEET ", curses.color_pair(7))

        # Agents list
        y = 3
        for name, info in FLEET.items():
            if y >= self.height - 6:
                break
            status_char = "*" if info["status"] else "o"
            status_color = 6 if info["status"] else 2
            name_color = 1 if info["status"] else 2

            self.stdscr.addstr(y, right_x + 1, status_char, curses.color_pair(status_color))
            self.stdscr.addstr(y, right_x + 3, f"{name:10}", curses.color_pair(name_color))
            self.stdscr.addstr(y, right_x + 14, info["role"][:right_width-16], curses.color_pair(2))
            y += 1

        # Tabs
        tabs_y = self.height - 5
        self.stdscr.addstr(tabs_y, right_x + 1, "-" * (right_width - 2), curses.color_pair(2))

        tab_y = tabs_y + 1
        for i, tab in enumerate(TABS):
            if tab_y >= self.height - 2:
                break
            prefix = f"{i+1}:"
            if i == self.current_tab:
                self.stdscr.addstr(tab_y, right_x + 1, prefix, curses.color_pair(3))
                self.stdscr.addstr(tab_y, right_x + 3, tab, curses.color_pair(1) | curses.A_BOLD)
            else:
                self.stdscr.addstr(tab_y, right_x + 1, prefix, curses.color_pair(2))
                self.stdscr.addstr(tab_y, right_x + 3, tab, curses.color_pair(2))
            tab_y += 1

    def draw_bottom_bar(self):
        """Draw key bindings bar."""
        y = self.height - 1
        self.stdscr.addstr(y, 0, " " * self.width, curses.color_pair(7))

        hints = [
            ("1-7", "tabs"),
            ("/", "cmd"),
            ("s", "status"),
            ("r", "refresh"),
            ("q", "quit"),
        ]

        x = 1
        for key, desc in hints:
            self.stdscr.addstr(y, x, key, curses.color_pair(3))
            self.stdscr.addstr(y, x + len(key), f":{desc} ", curses.color_pair(2))
            x += len(key) + len(desc) + 3

        # Mode indicator
        mode_text = "MODE: normal"
        self.stdscr.addstr(y, self.width - len(mode_text) - 2, "MODE:", curses.color_pair(8))
        self.stdscr.addstr(y, self.width - 8, "normal", curses.color_pair(1))

    def process_command(self):
        """Execute the current command."""
        cmd = self.command.strip()
        if not cmd:
            return

        self.add_output(f"> {cmd}", 1)

        if cmd == "status" or cmd == "s":
            online = sum(1 for a in FLEET.values() if a["status"])
            self.add_output(f"  nodes: {online}/{len(FLEET)} online", 5)
            self.add_output(f"  tab:   {TABS[self.current_tab]}", 5)

        elif cmd == "fleet":
            self.add_output("FLEET:", 5)
            for name, info in FLEET.items():
                status = "online" if info["status"] else "offline"
                self.add_output(f"  {name:10} {status:8} {info['role']}", 6 if info["status"] else 2)

        elif cmd == "help" or cmd == "?":
            self.add_output("COMMANDS:", 3)
            self.add_output("  status    system status", 2)
            self.add_output("  fleet     list nodes", 2)
            self.add_output("  clear     clear output", 2)
            self.add_output("  <cmd>     run shell", 2)

        elif cmd == "clear":
            self.output_lines.clear()

        elif cmd.startswith("ssh "):
            node = cmd[4:].strip()
            if node in FLEET:
                if FLEET[node]["status"]:
                    self.add_output(f"connecting to {node}...", 3)
                else:
                    self.add_output(f"{node} is offline", 2)
            else:
                self.add_output(f"unknown: {node}", 2)

        else:
            # Shell command
            try:
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=5)
                if result.stdout:
                    for line in result.stdout.strip().split('\n')[:10]:
                        self.add_output(f"  {line}", 1)
                if result.returncode != 0 and result.stderr:
                    self.add_output(f"  {result.stderr.strip()[:60]}", 2)
            except Exception as e:
                self.add_output(f"  error: {str(e)[:50]}", 2)

        self.command = ""

    def run(self):
        """Main event loop."""
        while True:
            # Update dimensions
            self.height, self.width = self.stdscr.getmaxyx()

            # Clear and redraw
            self.stdscr.clear()
            self.draw_top_bar()
            self.draw_left_panel()
            self.draw_right_panel()
            self.draw_bottom_bar()
            self.stdscr.refresh()

            # Handle input
            try:
                key = self.stdscr.getch()
            except:
                continue

            if key == -1:
                continue

            # Quit
            if key == ord('q') and not self.command:
                break

            # Tab switching (only when not typing)
            if not self.command:
                if ord('1') <= key <= ord('7'):
                    self.current_tab = key - ord('1')
                    continue
                elif key == ord('s'):
                    self.command = "status"
                    self.process_command()
                    continue
                elif key == ord('r'):
                    self.add_output("system: refreshing...", 5)
                    continue

            # Command input
            if key == ord('\n'):
                self.process_command()
            elif key == curses.KEY_BACKSPACE or key == 127:
                self.command = self.command[:-1]
            elif key == 27:  # Escape
                self.command = ""
            elif 32 <= key <= 126:  # Printable
                self.command += chr(key)


def main(stdscr):
    """Entry point for curses wrapper."""
    app = BlackRoadOS(stdscr)
    app.run()


if __name__ == "__main__":
    curses.wrapper(main)
