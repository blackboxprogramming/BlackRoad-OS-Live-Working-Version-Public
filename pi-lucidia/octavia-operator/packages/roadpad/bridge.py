"""
RoadPad Bridge - GitHub Copilot CLI interface.
Subprocess communication, no API keys needed.
"""

import subprocess
import threading
import queue
import re
from typing import Callable


class CopilotBridge:
    """Bridge to gh copilot CLI."""

    def __init__(self):
        self.process: subprocess.Popen | None = None
        self.response_queue: queue.Queue = queue.Queue()
        self.is_running: bool = False
        self._available: bool | None = None

    def is_available(self) -> bool:
        """Check if gh copilot is installed and authenticated."""
        if self._available is not None:
            return self._available

        try:
            result = subprocess.run(
                ["gh", "auth", "status"],
                capture_output=True,
                text=True,
                timeout=5
            )
            self._available = result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self._available = False

        return self._available

    def send_prompt(self, prompt: str, on_response: Callable[[str], None] | None = None, on_done: Callable[[], None] | None = None) -> str | bool:
        """
        Send prompt to Copilot.

        If callbacks provided: async mode, returns bool.
        If no callbacks: sync mode, returns response string.
        """
        # Synchronous mode (no callbacks)
        if on_response is None and on_done is None:
            return self._send_sync(prompt)

        # Async mode (with callbacks)
        return self._send_async(prompt, on_response or (lambda x: None), on_done or (lambda: None))

    def _send_sync(self, prompt: str) -> str:
        """Synchronous send - blocks until response received."""
        if not self.is_available():
            return "[Copilot not available - run: gh auth login]"

        try:
            proc = subprocess.Popen(
                ["gh", "copilot"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            stdout, stderr = proc.communicate(input=prompt, timeout=60)

            # Filter out usage stats
            lines = stdout.strip().split("\n")
            response_lines = []
            for line in lines:
                if any(skip in line for skip in [
                    "Total usage", "API time", "Total session", "Total code",
                    "Breakdown by", "Est.", "claude-", "gpt-", "Premium request"
                ]):
                    continue
                response_lines.append(line)

            response = "\n".join(response_lines).strip()
            if response:
                return response
            elif stderr.strip():
                return f"[Error: {stderr.strip()}]"
            return "[No response]"

        except subprocess.TimeoutExpired:
            return "[Timeout - Copilot took too long]"
        except FileNotFoundError:
            return "[gh CLI not found]"
        except Exception as e:
            return f"[Error: {str(e)}]"

    def _send_async(self, prompt: str, on_response: Callable[[str], None], on_done: Callable[[], None]) -> bool:
        """Send prompt to Copilot asynchronously with callbacks."""
        if not self.is_available():
            on_response("[Copilot not available - run: gh auth login]")
            on_done()
            return False

        if self.is_running:
            on_response("[Request in progress...]")
            on_done()
            return False

        self.is_running = True

        def run_copilot():
            try:
                # Run gh copilot with prompt via stdin
                proc = subprocess.Popen(
                    ["gh", "copilot"],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )

                # Send prompt and close stdin
                stdout, stderr = proc.communicate(input=prompt, timeout=60)

                # Filter out usage stats (lines starting with "Total" or containing "Est.")
                lines = stdout.strip().split("\n")
                response_lines = []
                for line in lines:
                    # Skip usage/stats lines
                    if any(skip in line for skip in [
                        "Total usage",
                        "API time",
                        "Total session",
                        "Total code",
                        "Breakdown by",
                        "Est.",
                        "claude-",
                        "gpt-",
                        "Premium request"
                    ]):
                        continue
                    response_lines.append(line)

                # Send response
                response = "\n".join(response_lines).strip()
                if response:
                    on_response(response)
                elif stderr.strip():
                    on_response(f"[Error: {stderr.strip()}]")

            except subprocess.TimeoutExpired:
                on_response("[Timeout - Copilot took too long]")
                if proc:
                    proc.kill()
            except FileNotFoundError:
                on_response("[gh CLI not found - install from https://cli.github.com]")
            except Exception as e:
                on_response(f"[Error: {str(e)}]")
            finally:
                self.is_running = False
                on_done()

        # Run in background thread
        thread = threading.Thread(target=run_copilot, daemon=True)
        thread.start()
        return True

    def cancel(self) -> None:
        """Cancel any running request."""
        if self.process:
            try:
                self.process.kill()
            except Exception:
                pass
        self.is_running = False


class MockBridge:
    """Mock bridge for testing without Copilot."""

    def __init__(self):
        self.is_running = False

    def is_available(self) -> bool:
        return True

    def send_prompt(self, prompt: str, on_response: Callable[[str], None], on_done: Callable[[], None]) -> bool:
        self.is_running = True

        def mock_response():
            import time
            time.sleep(0.5)
            on_response(f"[Mock response to: {prompt}]")
            self.is_running = False
            on_done()

        thread = threading.Thread(target=mock_response, daemon=True)
        thread.start()
        return True

    def cancel(self) -> None:
        self.is_running = False


class CircuitBridge:
    """Bridge using tunnels/circuits system."""

    def __init__(self, default_circuit: str = "auto"):
        self.default_circuit = default_circuit
        self.current_circuit = default_circuit
        self.is_running = False

    def is_available(self) -> bool:
        return True  # Circuits handle availability internally

    def set_circuit(self, circuit: str) -> None:
        """Set the active circuit."""
        self.current_circuit = circuit

    def list_circuits(self) -> list[str]:
        """List available circuits."""
        try:
            from circuits import get_circuit_registry
            return get_circuit_registry().list_all()
        except ImportError:
            return ["copilot"]

    def send_prompt(self, prompt: str, on_response: Callable[[str], None] | None = None, on_done: Callable[[], None] | None = None) -> str | bool:
        """Send prompt through active circuit."""
        # Check for circuit switch command: @circuit_name
        if prompt.startswith("@"):
            parts = prompt.split(None, 1)
            circuit_name = parts[0][1:]  # Remove @
            if len(parts) > 1:
                prompt = parts[1]
                self.current_circuit = circuit_name
            else:
                # Just switching circuit
                self.current_circuit = circuit_name
                return f"[Switched to circuit: {circuit_name}]"

        try:
            from circuits import get_circuit_registry
            registry = get_circuit_registry()
            result = registry.execute(self.current_circuit, prompt)
            response = result.response if result.success else f"[{result.error}]"
        except ImportError:
            # Fallback to Copilot
            bridge = CopilotBridge()
            response = bridge.send_prompt(prompt)

        if on_response:
            on_response(response)
        if on_done:
            on_done()
            return True

        return response

    def cancel(self) -> None:
        self.is_running = False


def get_bridge(mode: str = "circuit"):
    """Get the appropriate bridge instance.

    Args:
        mode: "copilot", "circuit", or "mock"
    """
    if mode == "mock":
        return MockBridge()
    elif mode == "copilot":
        return CopilotBridge()
    else:
        return CircuitBridge()
