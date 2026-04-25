"""
Lucidia - BlackRoad OS Native AI.

Lucidia is BlackRoad's sovereign AI interface. It routes to various
backends (Ollama, Copilot, external APIs) but the IDENTITY is Lucidia.

Architecture:
  Lucidia (this) = The mind, personality, router
  Backends       = Pluggable inference engines (local-first)

Priority order:
  1. Local Ollama (cecilia/lucidia Pi with Hailo-8)
  2. Local Ollama (any available node)
  3. GitHub Copilot (if authenticated)
  4. External API fallback

Lucidia is NOT a wrapper around Claude. Lucidia IS the AI.
"""

import os
import sys
import subprocess
import threading
import json
from datetime import datetime
from dataclasses import dataclass
from typing import Callable, List, Dict, Any, Tuple

# Security module (sovereign protection)
try:
    from security import SecurityContext, verify_backend_host
    SECURITY_ENABLED = True
except ImportError:
    SECURITY_ENABLED = False
    SecurityContext = None

# ═══════════════════════════════════════════════════════════════════════════════
# LUCIDIA BRANDING
# ═══════════════════════════════════════════════════════════════════════════════

LOGO_LARGE = """\
  ██╗     ██╗   ██╗ ██████╗██╗██████╗ ██╗ █████╗
  ██║     ██║   ██║██╔════╝██║██╔══██╗██║██╔══██╗
  ██║     ██║   ██║██║     ██║██║  ██║██║███████║
  ██║     ██║   ██║██║     ██║██║  ██║██║██╔══██║
  ███████╗╚██████╔╝╚██████╗██║██████╔╝██║██║  ██║
  ╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝"""

ROBOT_FACE = """\
   >─╮
    ▣═▣
    ● ●"""

ROBOT_FULL = """\
     ╭─╮ ╭─╮
     ╰─╯ ╰─╯
       ▒▔▔▒
     ╭─────╮
     │ ░░░ │
     ╰─┬─┬─╯
       │ │
      ╱ | ╲"""

ROBOT_MINI = """\
   >─╮
    ▣═▣
   - - -
    ● ●"""

LAYERS_BOOT = """\
  + Layer 3 (agents/system) loaded
  + Layer 4 (deploy/orchestration) loaded
  + Layer 5 (branches/environments) loaded
  + Layer 6 (Lucidia core/memory) loaded
  + Layer 7 (orchestration) loaded
  + Layer 8 (network/API) loaded"""

# Box drawing
def box(content: List[str], width: int = 80, title: str = "") -> List[str]:
    """Draw a box around content."""
    lines = []
    inner = width - 2

    # Top
    if title:
        pad = inner - len(title) - 2
        lines.append(f"╭─ {title} " + "─" * pad + "╮")
    else:
        lines.append("╭" + "─" * inner + "╮")

    # Content
    for line in content:
        if len(line) > inner:
            line = line[:inner-1] + "…"
        lines.append("│" + line + " " * (inner - len(line)) + "│")

    # Bottom
    lines.append("╰" + "─" * inner + "╯")

    return lines


def header_box(version: str = "0.1.0", model: str = "Lucidia", directory: str = "~") -> List[str]:
    """Create the main header box."""
    content = [
        f"         >_ Road Code (v{version})",
        "",
        f"         model:     {model}        /model to change",
        f"         directory: {directory}",
    ]
    return box(content, width=56)


def welcome_screen(last_login: str = None) -> str:
    """Generate full welcome screen."""
    if not last_login:
        last_login = datetime.now().strftime("%b %d %Y %H:%M")

    lines = [
        "",
        LOGO_LARGE,
        "",
        "  BlackRoad OS, Inc. | AI-Native",
        "",
    ]

    # Robot with info
    lines.extend([
        "╭" + "─" * 46 + "╮",
        "│                                              │",
        "│   >─╮    BlackRoad OS, Inc.                  │",
        "│    ▣═▣                                       │",
        f"│    ● ●   Last Login: {last_login:<20}   │",
        "│                                              │",
        "╰" + "─" * 46 + "╯",
        "",
    ])

    # Layer boot
    lines.append("  ✓ BlackRoad CLI v3 → br-help")
    lines.extend(LAYERS_BOOT.split("\n"))
    lines.append("")

    return "\n".join(lines)


def prompt_box(model: str = "Lucidia", version: str = "0.1.0", cwd: str = "~") -> str:
    """Generate the prompt area."""
    lines = [
        "╭" + "─" * 94 + "╮",
        "│" + " " * 94 + "│",
        "│   BlackRoad OS, Inc. | AI-Native" + " " * 60 + "│",
        "│    ▣═▣  Lucidia by BlackRoad OS, Inc." + " " * 56 + "│",
        "│    ╰─     Describe a task to get started." + " " * 52 + "│",
    ]

    # Inner box
    inner = [
        f"│       ╭{'─' * 52}╮" + " " * 38 + "│",
        f"│       │         >_ Road Code (v{version})" + " " * (52 - 26 - len(version)) + "│" + " " * 38 + "│",
        "│       │" + " " * 52 + "│" + " " * 38 + "│",
        f"│       │         model:     {model}" + " " * (52 - 20 - len(model)) + "│" + " " * 38 + "│",
        f"│       │         directory: {cwd}" + " " * (52 - 22 - len(cwd)) + "│" + " " * 38 + "│",
        f"│       ╰{'─' * 52}╯" + " " * 38 + "│",
    ]
    lines.extend(inner)

    lines.extend([
        "│" + " " * 94 + "│",
        "│  Pick a model with /model. Copilot uses AI, so always check for mistakes." + " " * 19 + "│",
        "╰" + "─" * 94 + "╯",
    ])

    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# BACKEND DEFINITIONS (Pluggable inference engines)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class Backend:
    """A pluggable AI backend. Lucidia routes to these."""
    name: str
    id: str
    type: str  # ollama, copilot, api
    description: str
    command: List[str]
    priority: int = 10  # Lower = preferred (local-first)
    requires_network: bool = False

    def is_available(self) -> bool:
        """Check if this backend is currently available."""
        import shutil
        if not self.command:
            return False
        return shutil.which(self.command[0]) is not None


# Backends ordered by preference (local-first, sovereign-first)
BACKENDS = {
    # === LOCAL INFERENCE (Priority 1-3) ===
    "cecilia": Backend(
        name="Cecilia",
        id="cecilia",
        type="ollama",
        description="Hailo-8 edge AI (26 TOPS)",
        command=["ssh", "cecilia", "ollama", "run", "llama3.2"],
        priority=1,
        requires_network=False  # Local network
    ),
    "lucidia-node": Backend(
        name="Lucidia Node",
        id="lucidia-pi",
        type="ollama",
        description="Pi 5 local inference",
        command=["ssh", "lucidia", "ollama", "run", "llama3.2"],
        priority=2,
        requires_network=False
    ),
    "ollama": Backend(
        name="Ollama Local",
        id="ollama",
        type="ollama",
        description="Local LLM on this machine",
        command=["ollama", "run", "llama3.2"],
        priority=3,
        requires_network=False
    ),

    # === AUTHENTICATED SERVICES (Priority 5) ===
    "copilot": Backend(
        name="GitHub Copilot",
        id="copilot",
        type="copilot",
        description="GitHub AI (requires auth)",
        command=["gh", "copilot", "suggest", "-t", "shell"],
        priority=5,
        requires_network=True
    ),

    # === EXTERNAL APIs (Priority 10 - fallback only) ===
    "anthropic": Backend(
        name="Anthropic API",
        id="anthropic",
        type="api",
        description="External API fallback",
        command=["curl", "-X", "POST", "https://api.anthropic.com/v1/messages"],
        priority=10,
        requires_network=True
    ),
}

# Legacy alias for compatibility
MODELS = BACKENDS


def get_best_backend() -> Backend:
    """Get the best available backend (local-first)."""
    import subprocess

    # Sort by priority
    sorted_backends = sorted(BACKENDS.values(), key=lambda b: b.priority)

    for backend in sorted_backends:
        # Skip network-required backends if we prefer local
        if backend.type == "ollama":
            # Check if Ollama is reachable
            try:
                if "ssh" in backend.command:
                    # Remote Ollama - quick ping check
                    host = backend.command[1]
                    result = subprocess.run(
                        ["ssh", "-o", "ConnectTimeout=2", "-o", "BatchMode=yes", host, "echo", "ok"],
                        capture_output=True, timeout=3
                    )
                    if result.returncode == 0:
                        return backend
                else:
                    # Local Ollama
                    result = subprocess.run(["ollama", "list"], capture_output=True, timeout=2)
                    if result.returncode == 0:
                        return backend
            except:
                continue
        elif backend.type == "copilot":
            try:
                result = subprocess.run(["gh", "auth", "status"], capture_output=True, timeout=2)
                if result.returncode == 0:
                    return backend
            except:
                continue

    # Fallback to first available
    return sorted_backends[0] if sorted_backends else None


# ═══════════════════════════════════════════════════════════════════════════════
# BACKEND RUNNER (Generic inference engine)
# ═══════════════════════════════════════════════════════════════════════════════

class BackendRunner:
    """Runs any AI backend as subprocess. Lucidia routes here."""

    def __init__(self, backend: str = None, security: 'SecurityContext' = None):
        if backend and backend in BACKENDS:
            self.backend = BACKENDS[backend]
        else:
            # Auto-select best available backend
            self.backend = get_best_backend()
            if not self.backend:
                self.backend = BACKENDS.get("ollama")

        self.process: subprocess.Popen = None
        self.running = False
        self.output_buffer: List[str] = []
        self.on_output: Callable[[str], None] = None
        self.cwd = os.getcwd()

        # Security context
        self.security = security
        if SECURITY_ENABLED and not self.security:
            self.security = SecurityContext()

    def start(self) -> bool:
        """Start backend subprocess with security verification."""
        try:
            cmd = self.backend.command.copy()

            # Security: Verify backend is trusted
            if self.security:
                allowed, reason = self.security.check_backend(cmd)
                if not allowed:
                    print(f"  ✗ Security blocked: {reason}")
                    return False
                self.security.audit.log("backend_start", self.backend.name)

            self.process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=self.cwd
            )
            self.running = True

            # Start reader thread
            self._reader = threading.Thread(target=self._read_output, daemon=True)
            self._reader.start()

            return True
        except Exception as e:
            print(f"  ✗ Backend failed: {e}")
            if self.security:
                self.security.audit.log_security("backend_error", {"error": str(e)})
            return False

    def _read_output(self):
        """Read output from backend with security filtering."""
        while self.running and self.process:
            try:
                line = self.process.stdout.readline()
                if line:
                    output = line.rstrip()

                    # Security: Filter output for secrets
                    if self.security:
                        output, warnings = self.security.filter_output(output)
                        for w in warnings:
                            print(f"  ⚠ {w}")

                    self.output_buffer.append(output)
                    if self.on_output:
                        self.on_output(output)
                elif self.process.poll() is not None:
                    self.running = False
                    break
            except:
                break

    def send(self, text: str) -> Tuple[bool, str]:
        """Send input to backend with security checks."""
        if not self.process or not self.process.stdin:
            return False, "backend not running"

        # Security: Check and sanitize input
        if self.security:
            allowed, sanitized, warning = self.security.check_input(text)
            if not allowed:
                return False, warning
            if warning:
                print(f"  ⚠ {warning}")
            text = sanitized
            self.security.audit.log_input(self.backend.name, text)

        try:
            self.process.stdin.write(text + "\n")
            self.process.stdin.flush()
            return True, ""
        except Exception as e:
            return False, str(e)

    def stop(self) -> None:
        """Stop backend subprocess."""
        if self.security:
            self.security.audit.log("backend_stop", self.backend.name if self.backend else "unknown")
        self.running = False
        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=2)
            except:
                self.process.kill()

    def get_output(self) -> List[str]:
        """Get and clear output buffer."""
        output = self.output_buffer.copy()
        self.output_buffer.clear()
        return output

    def get_security_status(self) -> Dict:
        """Get security status for this backend."""
        if self.security:
            return self.security.get_status()
        return {"security": "disabled"}


# Legacy alias
ClaudeWrapper = BackendRunner


# ═══════════════════════════════════════════════════════════════════════════════
# LUCIDIA SHELL (The sovereign AI interface)
# ═══════════════════════════════════════════════════════════════════════════════

class LucidiaShell:
    """
    Lucidia - BlackRoad OS Native AI Shell.

    This is THE interface. Backends are pluggable inference engines.
    Lucidia has her own personality, routes intelligently, prefers local.
    """

    def __init__(self):
        self.backend = None
        self.backend_name = None  # Will auto-select
        self.running = False
        self.history: List[str] = []
        self.cwd = os.getcwd()

    def boot(self) -> None:
        """Display boot sequence."""
        print(welcome_screen())

    def select_backend(self) -> str:
        """Interactive backend selector."""
        print("\n  Select Backend")
        print("  " + "─" * 60)

        backends = list(BACKENDS.items())
        for i, (key, backend) in enumerate(backends):
            marker = "›" if key == self.backend_name else " "
            status = "●" if backend.priority <= 3 else "○"  # Local vs remote
            print(f"  {marker} {i+1}. {status} {backend.name:20} {backend.description}")

        print("\n  ● = Local (sovereign)  ○ = Remote")
        print("  Press number to select or Enter to auto-select")

        try:
            choice = input("  > ").strip()
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(backends):
                    self.backend_name = backends[idx][0]
                    print(f"\n  ✓ Selected: {BACKENDS[self.backend_name].name}")
        except:
            pass

        return self.backend_name

    # Legacy alias
    select_model = select_backend

    def show_prompt(self) -> None:
        """Show the prompt UI."""
        home = os.path.expanduser("~")
        cwd = self.cwd.replace(home, "~")

        # Show Lucidia as the identity, backend in parentheses
        backend_info = ""
        if self.backend and self.backend.backend:
            backend_info = f" ({self.backend.backend.name})"

        print(f"\n   >─╮    Lucidia{backend_info}")
        print(f"    ▣═▣   {cwd}")
        print(f"    ● ●")

    def handle_command(self, cmd: str) -> bool:
        """Handle slash commands. Returns True if handled."""
        if cmd in ("/model", "/backend"):
            self.select_backend()
            return True
        elif cmd == "/new":
            self.history.clear()
            print("\n  ✓ Started new session")
            return True
        elif cmd == "/help":
            print("\n  Lucidia Commands:")
            print("    /backend  - Select inference backend")
            print("    /new      - New session")
            print("    /quit     - Exit")
            print("    /layers   - Show loaded layers")
            print("    /status   - Show backend status")
            print("    /security - Show security status")
            return True
        elif cmd == "/layers":
            print(LAYERS_BOOT)
            return True
        elif cmd == "/status":
            if self.backend and self.backend.backend:
                b = self.backend.backend
                print(f"\n  Backend: {b.name}")
                print(f"  Type:    {b.type}")
                print(f"  Local:   {'Yes' if b.priority <= 3 else 'No'}")
            else:
                print("\n  No backend connected")
            return True
        elif cmd == "/security":
            if self.backend:
                status = self.backend.get_security_status()
                print("\n  Security Status:")
                if "session_stats" in status:
                    stats = status["session_stats"]
                    print(f"    Session:    {stats.get('session_id', 'unknown')}")
                    print(f"    Events:     {stats.get('total_events', 0)}")
                    print(f"    Inputs:     {stats.get('inputs', 0)}")
                    print(f"    Outputs:    {stats.get('outputs', 0)}")
                print(f"    Rate limit: {status.get('rate_limit_remaining', 'N/A')} remaining")
                print(f"    Warnings:   {status.get('warnings', 0)}")
                print(f"    Blocked:    {status.get('blocked', 0)}")
            else:
                print("\n  Security: disabled (no backend)")
            return True
        elif cmd in ("/quit", "/exit", "/q"):
            self.running = False
            return True
        return False

    def run(self) -> None:
        """Run the Lucidia shell."""
        self.boot()
        self.running = True

        # Auto-select best backend (local-first)
        print("\n  ◐ Detecting backends...")
        self.backend = BackendRunner(self.backend_name)

        if self.backend.backend:
            locality = "local" if self.backend.backend.priority <= 3 else "remote"
            print(f"  ✓ Using {self.backend.backend.name} ({locality})")
        else:
            print("  ⚠ No backend available - running in offline mode")

        # Security status
        if SECURITY_ENABLED:
            print("  ✓ Security: enabled (audit, sanitize, filter)")
        else:
            print("  ⚠ Security: module not loaded")

        if not self.backend.start():
            print("  ✗ Failed to start backend")
            print("  → Try: ollama serve (start local inference)")
            return

        print("\n  ✓ Lucidia ready")

        while self.running:
            self.show_prompt()

            try:
                user_input = input("\n  › ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n")
                break

            if not user_input:
                continue

            # Check for commands
            if user_input.startswith("/"):
                if self.handle_command(user_input):
                    continue

            # Send to backend (with security checks)
            self.history.append(user_input)
            success, error = self.backend.send(user_input)
            if not success:
                print(f"\n  ✗ Blocked: {error}")
                continue

            # Lucidia thinking indicator
            print("\n    ▣═▣ ···")

            # Wait for and display response
            import time
            time.sleep(0.5)

            while True:
                output = self.backend.get_output()
                if output:
                    for line in output:
                        # Filter UI noise from various backends
                        if not any(skip in line for skip in ["╭", "╰", "│", "thinking", ">"]):
                            print(f"    {line}")

                if not self.backend.running:
                    break

                time.sleep(0.1)
                if not self.backend.output_buffer:
                    break

        self.backend.stop()
        print("\n  ╰─ Goodbye from Lucidia\n")


# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    """Main entry point."""
    shell = LucidiaShell()
    shell.run()


if __name__ == "__main__":
    main()
