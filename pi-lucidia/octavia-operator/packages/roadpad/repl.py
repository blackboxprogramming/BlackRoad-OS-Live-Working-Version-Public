"""
RoadPad REPL Mode - Interactive code execution.

Features:
- Python REPL
- Shell REPL
- Output capture
- History
"""

import os
import sys
import subprocess
import traceback
from dataclasses import dataclass, field
from typing import List, Dict, Any, Callable
from io import StringIO
from datetime import datetime


@dataclass
class ReplOutput:
    """Output from REPL execution."""
    input: str
    output: str
    error: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    success: bool = True


class PythonRepl:
    """Python REPL."""

    def __init__(self):
        self.locals: Dict[str, Any] = {}
        self.history: List[ReplOutput] = []
        self.max_history = 100

        # Pre-import useful modules
        self._init_environment()

    def _init_environment(self) -> None:
        """Initialize REPL environment."""
        self.locals["__name__"] = "__repl__"
        exec("import os, sys, json, re, math, datetime", self.locals)

    def execute(self, code: str) -> ReplOutput:
        """Execute Python code."""
        stdout_capture = StringIO()
        stderr_capture = StringIO()

        old_stdout = sys.stdout
        old_stderr = sys.stderr

        result = ReplOutput(input=code, output="", error="")

        try:
            sys.stdout = stdout_capture
            sys.stderr = stderr_capture

            # Try eval first (expression)
            try:
                value = eval(code, self.locals)
                if value is not None:
                    print(repr(value))
            except SyntaxError:
                # Fall back to exec (statement)
                exec(code, self.locals)

            result.output = stdout_capture.getvalue()
            result.error = stderr_capture.getvalue()
            result.success = not result.error

        except Exception as e:
            result.error = traceback.format_exc()
            result.success = False

        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

        self.history.append(result)
        if len(self.history) > self.max_history:
            self.history.pop(0)

        return result

    def reset(self) -> None:
        """Reset REPL state."""
        self.locals.clear()
        self._init_environment()


class ShellRepl:
    """Shell REPL."""

    def __init__(self, shell: str = "/bin/bash"):
        self.shell = shell
        self.cwd = os.getcwd()
        self.env = os.environ.copy()
        self.history: List[ReplOutput] = []
        self.max_history = 100

    def execute(self, command: str) -> ReplOutput:
        """Execute shell command."""
        result = ReplOutput(input=command, output="", error="")

        # Handle cd specially
        if command.strip().startswith("cd "):
            path = command.strip()[3:].strip()
            path = os.path.expanduser(path)
            path = os.path.expandvars(path)
            if not os.path.isabs(path):
                path = os.path.join(self.cwd, path)
            path = os.path.normpath(path)

            if os.path.isdir(path):
                self.cwd = path
                result.output = path
                result.success = True
            else:
                result.error = f"cd: no such directory: {path}"
                result.success = False

            self.history.append(result)
            return result

        try:
            proc = subprocess.run(
                command,
                shell=True,
                executable=self.shell,
                cwd=self.cwd,
                env=self.env,
                capture_output=True,
                text=True,
                timeout=30
            )
            result.output = proc.stdout
            result.error = proc.stderr
            result.success = proc.returncode == 0

        except subprocess.TimeoutExpired:
            result.error = "Command timed out (30s)"
            result.success = False
        except Exception as e:
            result.error = str(e)
            result.success = False

        self.history.append(result)
        if len(self.history) > self.max_history:
            self.history.pop(0)

        return result


@dataclass
class ReplMode:
    """REPL mode state."""
    name: str  # 'python', 'shell', 'lua', etc.
    prompt: str
    repl: Any
    active: bool = False


class ReplManager:
    """Manages REPL modes."""

    def __init__(self):
        self.repls: Dict[str, ReplMode] = {}
        self.current_mode: str = "python"

        # Initialize built-in REPLs
        self.repls["python"] = ReplMode(
            name="python",
            prompt=">>> ",
            repl=PythonRepl()
        )
        self.repls["shell"] = ReplMode(
            name="shell",
            prompt="$ ",
            repl=ShellRepl()
        )

    def set_mode(self, mode: str) -> bool:
        """Set current REPL mode."""
        if mode in self.repls:
            self.current_mode = mode
            return True
        return False

    def execute(self, code: str) -> ReplOutput:
        """Execute in current REPL."""
        mode = self.repls.get(self.current_mode)
        if mode:
            return mode.repl.execute(code)
        return ReplOutput(input=code, output="", error="Unknown REPL mode")

    def get_prompt(self) -> str:
        """Get current prompt."""
        mode = self.repls.get(self.current_mode)
        if mode:
            if self.current_mode == "shell":
                cwd = mode.repl.cwd
                home = os.path.expanduser("~")
                if cwd.startswith(home):
                    cwd = "~" + cwd[len(home):]
                return f"{cwd} $ "
            return mode.prompt
        return "> "

    def get_history(self) -> List[ReplOutput]:
        """Get current REPL history."""
        mode = self.repls.get(self.current_mode)
        if mode:
            return mode.repl.history
        return []

    def reset(self) -> None:
        """Reset current REPL."""
        mode = self.repls.get(self.current_mode)
        if mode and hasattr(mode.repl, "reset"):
            mode.repl.reset()

    def format_output(self, result: ReplOutput) -> List[str]:
        """Format REPL output for display."""
        lines = []

        # Input
        prompt = self.get_prompt()
        lines.append(f"{prompt}{result.input}")

        # Output
        if result.output:
            for line in result.output.rstrip().split("\n"):
                lines.append(line)

        # Error
        if result.error:
            for line in result.error.rstrip().split("\n"):
                lines.append(f"! {line}")

        return lines

    def format_history(self, n: int = 10) -> str:
        """Format recent history for display."""
        history = self.get_history()[-n:]
        lines = [f"REPL History ({self.current_mode})", "=" * 40, ""]

        for result in history:
            lines.extend(self.format_output(result))
            lines.append("")

        return "\n".join(lines)

    def list_modes(self) -> List[str]:
        """List available REPL modes."""
        return list(self.repls.keys())


# Global manager
_manager: ReplManager | None = None

def get_repl_manager() -> ReplManager:
    """Get global REPL manager."""
    global _manager
    if _manager is None:
        _manager = ReplManager()
    return _manager
