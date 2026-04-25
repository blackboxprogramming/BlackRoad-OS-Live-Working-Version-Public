#!/usr/bin/env python3
"""
RoadPad - Terminal-native plain-text editor for BlackRoad OS.

No AI branding, no thinking indicators, no token counters.
Just text editing with Copilot integration and a clean Lucidia interface.
"""

import curses
import sys
import os
import argparse

from buffer import Buffer
from renderer import Renderer
from bridge import CopilotBridge
from edit_manager import EditManager
from persistence import PersistenceManager
from config_manager import ConfigManager

# Supported file extensions
SUPPORTED_EXTENSIONS = {".txt", ".md", ".road"}


class RoadPad:
    def __init__(self, stdscr, filepath: str | None = None, config: ConfigManager = None):
        self.stdscr = stdscr
        self.buffer = Buffer()
        self.renderer = Renderer(stdscr)
        self.bridge = CopilotBridge()
        self.edit_manager = EditManager()
        self.persistence = PersistenceManager()
        self.config = config or ConfigManager()
        self.input_text = ""
        
        # Load config values
        self.accept_mode = self.config.get('accept_mode', 0)
        self.copilot_enabled = self.config.get('copilot_enabled', True)
        
        self.mode = "prompt"  # Start in prompt mode
        self.scroll_offset = 0
        self.running = True
        self.message = ""
        
        # Command history for prompt mode
        self.prompt_history = []
        self.history_index = -1
        
        # Multi-line prompt buffer
        self.multiline_buffer = []
        
        # Review mode for manual accept
        self.review_mode = False
        self.current_edit = None
        
        # Load persisted state
        self.load_state()

        # Check Copilot availability
        if not self.bridge.is_available():
            self.message = "Warning: GitHub Copilot CLI not available"
            self.copilot_enabled = False

        # Load file if provided
        if filepath:
            ext = os.path.splitext(filepath)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS and ext:
                self.message = f"Warning: {ext} not in {SUPPORTED_EXTENSIONS}"
            self.buffer.load_file(filepath)
            self.mode = "editor"  # Switch to editor if opening file

        # Enable keypad and mouse
        stdscr.keypad(True)
        stdscr.nodelay(False)
        curses.raw()
    
    def load_state(self) -> None:
        """Load persistent state on startup."""
        # Load command history
        self.prompt_history = self.persistence.load_history()
        
        # Show info message if history loaded
        if self.prompt_history:
            self.message = f"Loaded {len(self.prompt_history)} commands from history"
    
    def save_state(self) -> None:
        """Save persistent state on exit."""
        # Save command history
        if self.prompt_history:
            self.persistence.save_history(self.prompt_history)
        
        # Save current file to recent files
        if self.buffer.filepath:
            self.persistence.add_recent_file(self.buffer.filepath)
        
        # Save pending edits if in on-save mode
        if self.accept_mode == 1 and self.edit_manager.get_pending_count() > 0:
            edits_data = [
                {
                    "query": edit.query,
                    "response": edit.response,
                    "timestamp": edit.timestamp
                }
                for edit in self.edit_manager.pending_edits
            ]
            self.persistence.save_edit_queue(edits_data)

    def handle_input(self, key: int) -> None:
        """Process keyboard input in editor mode."""
        # Review mode shortcuts (manual accept mode)
        if self.review_mode:
            self.handle_review_mode(key)
            return
        
        # Ctrl+Q or Ctrl+C to quit
        if key in (17, 3):  # Ctrl+Q, Ctrl+C
            self.save_state()  # Save before quitting
            self.running = False
            return
        
        # Ctrl+R to show recent files
        if key == 18:  # Ctrl+R
            self.show_recent_files()
            return

        # Ctrl+P to toggle prompt mode
        if key == 16:  # Ctrl+P
            self.mode = "prompt" if self.mode == "editor" else "editor"
            self.input_text = ""
            self.multiline_buffer = []
            return

        # Ctrl+S to save
        if key == 19:  # Ctrl+S
            # In "on save" mode, apply pending edits first
            if self.accept_mode == 1:  # on save mode
                count = self.apply_pending_edits()
                if count > 0:
                    self.message = f"Applied {count} pending edits"
            
            if self.buffer.filepath:
                if self.buffer.save_file():
                    self.message = f"Saved: {self.buffer.filepath}"
                else:
                    self.message = "Save failed"
            else:
                self.message = "No filename (use :w filename)"
            return

        # Ctrl+O to open
        if key == 15:  # Ctrl+O
            self.mode = "command"
            self.input_text = ":e "
            return

        # Shift+Tab to cycle accept mode
        if key == curses.KEY_BTAB or key == 353:
            self.accept_mode = (self.accept_mode + 1) % 3
            return

        # Arrow keys
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

        # Home/End
        if key == curses.KEY_HOME:
            self.buffer.move_home()
            return
        if key == curses.KEY_END:
            self.buffer.move_end()
            return

        # Backspace
        if key in (curses.KEY_BACKSPACE, 127, 8):
            self.buffer.delete_char()
            return

        # Delete
        if key == curses.KEY_DC:
            self.buffer.move_right()
            self.buffer.delete_char()
            return

        # Enter
        if key in (curses.KEY_ENTER, 10, 13):
            self.buffer.insert_newline()
            self.adjust_scroll()
            return

        # Tab
        if key == 9:
            for _ in range(4):
                self.buffer.insert_char(" ")
            return

        # Printable characters (only in editor mode)
        if 32 <= key <= 126:
            if self.mode == "editor":
                self.buffer.insert_char(chr(key))
            return

        # Handle multi-byte UTF-8 (simplified)
        if key > 127:
            try:
                if self.mode == "editor":
                    self.buffer.insert_char(chr(key))
            except (ValueError, OverflowError):
                pass

    def handle_prompt(self, key: int) -> None:
        """Process prompt mode input (for Copilot queries)."""
        if key == 27:  # Escape
            self.mode = "editor"
            self.input_text = ""
            self.multiline_buffer = []
            self.history_index = -1
            return

        # Ctrl+Enter for multi-line input (simpler than Shift+Enter detection)
        if key == 10 and len(self.multiline_buffer) > 0:  # Enter with existing multiline
            # This is continuation, add line
            pass
        
        # Regular Enter - send prompt
        if key in (curses.KEY_ENTER, 10, 13):
            # Check if Ctrl is held for multi-line
            # For simplicity, use a marker: if line ends with \, continue
            if self.input_text.strip().endswith('\\'):
                # Multi-line mode - strip backslash and continue
                self.multiline_buffer.append(self.input_text.strip()[:-1])
                self.input_text = ""
                self.message = f"Multi-line ({len(self.multiline_buffer)} lines, end with line without \\)"
                return
            
            # Combine multiline buffer if exists
            if self.multiline_buffer:
                full_prompt = '\n'.join(self.multiline_buffer + [self.input_text.strip()])
                self.multiline_buffer = []
            else:
                full_prompt = self.input_text.strip()
            
            if full_prompt:
                # Add to history
                self.prompt_history.append(full_prompt)
                self.history_index = -1
                
                # Send to Copilot
                self.send_to_copilot(full_prompt)
            
            self.input_text = ""
            return

        # Up arrow - previous history
        if key == curses.KEY_UP:
            if self.prompt_history and not self.multiline_buffer:
                if self.history_index == -1:
                    self.history_index = len(self.prompt_history) - 1
                elif self.history_index > 0:
                    self.history_index -= 1
                
                self.input_text = self.prompt_history[self.history_index]
            return

        # Down arrow - next history
        if key == curses.KEY_DOWN:
            if self.prompt_history and not self.multiline_buffer:
                if self.history_index >= 0:
                    self.history_index += 1
                    if self.history_index >= len(self.prompt_history):
                        self.history_index = -1
                        self.input_text = ""
                    else:
                        self.input_text = self.prompt_history[self.history_index]
            return

        # Backspace
        if key in (curses.KEY_BACKSPACE, 127, 8):
            if len(self.input_text) > 0:
                self.input_text = self.input_text[:-1]
            return

        # Printable characters
        if 32 <= key <= 126:
            self.input_text += chr(key)

    def handle_command(self, key: int) -> None:
        """Process command mode input."""
        if key == 27:  # Escape
            self.mode = "editor"
            self.input_text = ""
            return

        if key in (curses.KEY_ENTER, 10, 13):
            self.execute_command(self.input_text)
            self.mode = "editor"
            self.input_text = ""
            return

        if key in (curses.KEY_BACKSPACE, 127, 8):
            if len(self.input_text) > 1:
                self.input_text = self.input_text[:-1]
            return

        if 32 <= key <= 126:
            self.input_text += chr(key)
    
    def send_to_copilot(self, prompt: str) -> None:
        """Send prompt to Copilot and append response to buffer."""
        if not self.copilot_enabled:
            self.message = "Copilot not available"
            return
        
        # Show loading indicator
        self.message = "Thinking..."
        self.renderer.show_message(self.message)
        
        # Get response from Copilot
        response = self.bridge.send_prompt(prompt)
        
        if not response:
            self.message = "No response from Copilot"
            return
        
        # Handle based on accept mode
        if self.accept_mode == 0:  # Manual mode
            # Add edit to pending queue and show preview
            edit = self.edit_manager.add_edit(prompt, response)
            self.show_edit_preview(edit)
            
        elif self.accept_mode == 1:  # On-save mode
            # Queue the edit for later
            self.edit_manager.add_edit(prompt, response)
            count = self.edit_manager.get_pending_count()
            self.message = f"Edit queued ({count} pending, Ctrl+S to apply)"
            
        elif self.accept_mode == 2:  # Always mode
            # Apply immediately
            self.append_response_to_buffer(prompt, response)
            self.message = "Response applied (always mode)"
    
    def append_response_to_buffer(self, prompt: str, response: str) -> None:
        """Append a Copilot response to the buffer with formatting."""
        separator = "─" * 80
        
        # Add query header
        query_lines = prompt.split('\n')
        self.buffer.lines.append("")
        self.buffer.lines.append(separator)
        self.buffer.lines.append("[Query]")
        for line in query_lines:
            self.buffer.lines.append(f"  {line}")
        self.buffer.lines.append("")
        
        # Add response
        self.buffer.lines.append("[Response]")
        for line in response.split('\n'):
            self.buffer.lines.append(f"  {line}")
        self.buffer.lines.append("")
        self.buffer.lines.append(separator)
        self.buffer.lines.append("")
        
        # Move cursor to end
        self.buffer.cursor_row = len(self.buffer.lines) - 1
        self.buffer.cursor_col = 0
        self.adjust_scroll()
    
    def show_edit_preview(self, edit) -> None:
        """Show diff preview for manual mode."""
        self.review_mode = True
        self.current_edit = edit
        
        # Show preview in buffer
        preview = self.edit_manager.get_diff_preview(edit)
        for line in preview.split('\n'):
            self.buffer.lines.append(line)
        
        # Move cursor to end
        self.buffer.cursor_row = len(self.buffer.lines) - 1
        self.buffer.cursor_col = 0
        self.adjust_scroll()
        
        self.message = "Review mode: Ctrl+Y=accept, Ctrl+N=reject"
    
    def handle_review_mode(self, key: int) -> None:
        """Handle key input in review mode."""
        if key == 25:  # Ctrl+Y - Accept
            if self.current_edit:
                self.edit_manager.accept_edit(self.current_edit)
                self.append_response_to_buffer(
                    self.current_edit.query,
                    self.current_edit.response
                )
                self.message = "Edit accepted"
            self.review_mode = False
            self.current_edit = None
            return
        
        if key == 14:  # Ctrl+N - Reject
            if self.current_edit:
                self.edit_manager.reject_edit(self.current_edit)
                self.message = "Edit rejected"
            self.review_mode = False
            self.current_edit = None
            return
        
        if key == 1:  # Ctrl+A - Accept all
            count = self.edit_manager.accept_all()
            self.message = f"Accepted {count} edits"
            self.review_mode = False
            self.current_edit = None
            return
        
        if key == 18:  # Ctrl+R - Reject all
            count = self.edit_manager.reject_all()
            self.message = f"Rejected {count} edits"
            self.review_mode = False
            self.current_edit = None
            return
        
        # Escape also exits review
        if key == 27:
            self.review_mode = False
            self.current_edit = None
            self.message = "Review cancelled"
            return
    
    def apply_pending_edits(self) -> int:
        """Apply all pending edits in on-save mode. Returns count applied."""
        # Accept all pending
        count = self.edit_manager.accept_all()
        
        # Apply to buffer
        self.edit_manager.apply_edits_to_buffer(
            self.buffer,
            self.edit_manager.applied_edits
        )
        
        # Move cursor to end
        self.buffer.cursor_row = len(self.buffer.lines) - 1
        self.buffer.cursor_col = 0
        self.adjust_scroll()
        
        # Clear applied edits
        self.edit_manager.applied_edits.clear()
        
        return count

    def execute_command(self, cmd: str) -> None:
        """Execute a command string."""
        cmd = cmd.strip()

        if cmd.startswith(":q"):
            if "!" in cmd or not self.buffer.modified:
                self.save_state()  # Save before quitting
                self.running = False
            else:
                self.message = "Unsaved changes (use :q! to force)"
            return

        if cmd.startswith(":w"):
            parts = cmd.split(maxsplit=1)
            filepath = parts[1] if len(parts) > 1 else self.buffer.filepath
            if filepath:
                if self.buffer.save_file(filepath):
                    self.persistence.add_recent_file(filepath)  # Add to recent
                    self.message = f"Saved: {filepath}"
                else:
                    self.message = "Save failed"
            else:
                self.message = "No filename"
            return

        if cmd.startswith(":e"):
            parts = cmd.split(maxsplit=1)
            if len(parts) > 1:
                if self.buffer.load_file(parts[1]):
                    self.persistence.add_recent_file(parts[1])  # Add to recent
                    self.message = f"Loaded: {parts[1]}"
                    self.scroll_offset = 0
                else:
                    self.message = f"Cannot open: {parts[1]}"
            return
        
        if cmd.startswith(":recent"):
            # Show recent files
            self.show_recent_files()
            return

        if cmd.startswith(":wq"):
            if self.buffer.filepath:
                self.buffer.save_file()
                self.persistence.add_recent_file(self.buffer.filepath)
            self.save_state()  # Save before quitting
            self.running = False
            return

        self.message = f"Unknown command: {cmd}"
    
    def show_recent_files(self) -> None:
        """Show recent files list in buffer."""
        recent = self.persistence.load_recent_files()
        
        if not recent:
            self.message = "No recent files"
            return
        
        # Append to buffer
        self.buffer.lines.append("")
        self.buffer.lines.append("=" * 80)
        self.buffer.lines.append("[Recent Files]")
        self.buffer.lines.append("")
        
        for i, filepath in enumerate(recent, 1):
            # Show if file still exists
            exists = "✓" if os.path.exists(filepath) else "✗"
            self.buffer.lines.append(f"  {i}. {exists} {filepath}")
        
        self.buffer.lines.append("")
        self.buffer.lines.append("Use :e <path> to open")
        self.buffer.lines.append("=" * 80)
        self.buffer.lines.append("")
        
        # Move cursor to end
        self.buffer.cursor_row = len(self.buffer.lines) - 1
        self.buffer.cursor_col = 0
        self.adjust_scroll()
        
        self.message = f"Showing {len(recent)} recent files"

    def adjust_scroll(self) -> None:
        """Keep cursor visible by adjusting scroll offset."""
        visible_lines = self.renderer.height - self.renderer.editor_offset - 2

        if self.buffer.cursor_row < self.scroll_offset:
            self.scroll_offset = self.buffer.cursor_row
        elif self.buffer.cursor_row >= self.scroll_offset + visible_lines:
            self.scroll_offset = self.buffer.cursor_row - visible_lines + 1

    def run(self) -> None:
        """Main editor loop."""
        while self.running:
            # Show multiline indicator in prompt mode
            display_text = self.input_text
            if self.mode == "prompt" and self.multiline_buffer:
                display_text = f"[Line {len(self.multiline_buffer) + 1}] {self.input_text}"
            
            # Render current state with edit status
            display_input = display_text if self.mode in ("command", "prompt") else ""
            
            # Get status text with pending count
            status_text = self.edit_manager.get_status_text(self.accept_mode)
            
            self.renderer.render(
                self.buffer,
                display_input,
                self.accept_mode,
                self.scroll_offset,
                self.mode,
                status_text
            )

            # Show any pending message
            if self.message:
                self.renderer.show_message(self.message)
                self.message = ""

            # Wait for input
            try:
                key = self.stdscr.getch()
            except KeyboardInterrupt:
                self.running = False
                continue

            if key == -1:
                continue

            # Handle based on mode
            if self.mode == "command":
                self.handle_command(key)
            elif self.mode == "prompt":
                self.handle_prompt(key)
            else:
                # Check for command prefix
                if key == ord(":"):
                    self.mode = "command"
                    self.input_text = ":"
                else:
                    self.handle_input(key)


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='RoadPad - Terminal-native editor with Copilot integration',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  roadpad                    Start with Copilot prompt
  roadpad file.txt           Open file in editor mode
  roadpad --no-copilot       Disable Copilot integration
  roadpad --accept-mode=always  Start in always mode

Environment Variables:
  ROADPAD_ACCEPT_MODE        Set default accept mode (manual/on-save/always)
  ROADPAD_NO_COPILOT         Disable Copilot if set
  ROADPAD_TAB_WIDTH          Set tab width (default: 4)
        """
    )
    
    parser.add_argument('filepath', nargs='?', help='File to open')
    parser.add_argument('--no-copilot', action='store_true', 
                       help='Disable Copilot integration')
    parser.add_argument('--accept-mode', choices=['manual', 'on-save', 'always'],
                       help='Set accept mode')
    parser.add_argument('--tab-width', type=int, metavar='N',
                       help='Set tab width')
    parser.add_argument('--version', action='version', version='RoadPad v0.1.0')
    
    return parser.parse_args()


def main(stdscr, filepath: str | None = None, config: ConfigManager = None) -> None:
    """Entry point for curses wrapper."""
    editor = RoadPad(stdscr, filepath, config)
    editor.run()


if __name__ == "__main__":
    args = parse_args()
    
    # Load config
    config = ConfigManager()
    
    # Apply environment variables
    config.apply_env_overrides()
    
    # Apply CLI arguments
    cli_args = vars(args)
    config.apply_cli_args(cli_args)
    
    # Get filepath
    filepath = args.filepath
    
    # Launch editor
    curses.wrapper(lambda s: main(s, filepath, config))
