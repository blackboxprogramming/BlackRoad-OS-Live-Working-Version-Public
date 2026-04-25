"""
RoadPad Tunnels - Backend connections to AI services.

Tunnels are direct connections to AI backends:
- copilot: GitHub Copilot CLI
- ollama@<host>: Ollama on remote host
- claude: Claude API
- echo: Debug/test tunnel
"""

import subprocess
import json
import os
from typing import Protocol, Callable
from dataclasses import dataclass


class Tunnel(Protocol):
    """Protocol for all tunnel implementations."""
    name: str

    def send(self, prompt: str) -> str:
        """Send prompt and return response."""
        ...

    def is_available(self) -> bool:
        """Check if tunnel is ready."""
        ...


@dataclass
class TunnelResult:
    """Result from a tunnel."""
    tunnel: str
    prompt: str
    response: str
    success: bool
    error: str | None = None


class EchoTunnel:
    """Debug tunnel - echoes input back."""
    name = "echo"

    def send(self, prompt: str) -> str:
        return f"[echo] {prompt}"

    def is_available(self) -> bool:
        return True


class CopilotTunnel:
    """GitHub Copilot CLI tunnel."""
    name = "copilot"

    def __init__(self):
        self._available: bool | None = None

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            result = subprocess.run(
                ["gh", "auth", "status"],
                capture_output=True, text=True, timeout=5
            )
            self._available = result.returncode == 0
        except:
            self._available = False
        return self._available

    def send(self, prompt: str) -> str:
        if not self.is_available():
            return "[copilot unavailable]"

        try:
            proc = subprocess.Popen(
                ["gh", "copilot"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = proc.communicate(input=prompt, timeout=60)

            # Filter stats
            lines = []
            for line in stdout.strip().split("\n"):
                if any(s in line for s in [
                    "Total usage", "API time", "Total session",
                    "Breakdown by", "Est.", "claude-", "gpt-", "Premium"
                ]):
                    continue
                lines.append(line)

            return "\n".join(lines).strip() or "[no response]"
        except subprocess.TimeoutExpired:
            return "[timeout]"
        except Exception as e:
            return f"[error: {e}]"


class OllamaTunnel:
    """Ollama tunnel - connects to Ollama on local or remote host."""

    def __init__(self, host: str = "localhost", model: str = "llama3.2"):
        self.host = host
        self.model = model
        self.name = f"ollama@{host}"
        self._available: bool | None = None

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available

        try:
            if self.host == "localhost":
                result = subprocess.run(
                    ["ollama", "list"],
                    capture_output=True, timeout=5
                )
            else:
                result = subprocess.run(
                    ["ssh", "-o", "ConnectTimeout=3", self.host, "ollama", "list"],
                    capture_output=True, timeout=10
                )
            self._available = result.returncode == 0
        except:
            self._available = False
        return self._available

    def send(self, prompt: str) -> str:
        if not self.is_available():
            return f"[ollama@{self.host} unavailable]"

        try:
            if self.host == "localhost":
                cmd = ["ollama", "run", self.model, prompt]
            else:
                # Escape prompt for SSH
                escaped = prompt.replace("'", "'\"'\"'")
                cmd = ["ssh", self.host, f"ollama run {self.model} '{escaped}'"]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            return result.stdout.strip() or "[no response]"
        except subprocess.TimeoutExpired:
            return "[timeout]"
        except Exception as e:
            return f"[error: {e}]"


class ClaudeTunnel:
    """Claude API tunnel (requires ANTHROPIC_API_KEY)."""
    name = "claude"

    def __init__(self, model: str = "claude-sonnet-4-20250514"):
        self.model = model
        self._available: bool | None = None

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        self._available = bool(os.environ.get("ANTHROPIC_API_KEY"))
        return self._available

    def send(self, prompt: str) -> str:
        if not self.is_available():
            return "[claude: no API key]"

        try:
            import anthropic
            client = anthropic.Anthropic()
            message = client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except ImportError:
            return "[claude: pip install anthropic]"
        except Exception as e:
            return f"[claude error: {e}]"


class TunnelRegistry:
    """Registry of all available tunnels."""

    def __init__(self):
        self.tunnels: dict[str, Tunnel] = {}
        self._init_defaults()

    def _init_defaults(self):
        """Initialize default tunnels."""
        # Always available
        self.register(EchoTunnel())

        # Copilot
        self.register(CopilotTunnel())

        # Ollama - local and remote
        self.register(OllamaTunnel("localhost"))
        for host in ["cecilia", "lucidia", "octavia", "aria"]:
            self.register(OllamaTunnel(host))

        # Claude
        self.register(ClaudeTunnel())

    def register(self, tunnel: Tunnel) -> None:
        """Register a tunnel."""
        self.tunnels[tunnel.name] = tunnel

    def get(self, name: str) -> Tunnel | None:
        """Get tunnel by name."""
        return self.tunnels.get(name)

    def list_available(self) -> list[str]:
        """List available tunnels."""
        return [name for name, t in self.tunnels.items() if t.is_available()]

    def list_all(self) -> list[tuple[str, bool]]:
        """List all tunnels with availability."""
        return [(name, t.is_available()) for name, t in self.tunnels.items()]

    def send(self, tunnel_name: str, prompt: str) -> TunnelResult:
        """Send prompt through named tunnel."""
        tunnel = self.get(tunnel_name)
        if not tunnel:
            return TunnelResult(
                tunnel=tunnel_name,
                prompt=prompt,
                response="",
                success=False,
                error=f"Unknown tunnel: {tunnel_name}"
            )

        try:
            response = tunnel.send(prompt)
            return TunnelResult(
                tunnel=tunnel_name,
                prompt=prompt,
                response=response,
                success=True
            )
        except Exception as e:
            return TunnelResult(
                tunnel=tunnel_name,
                prompt=prompt,
                response="",
                success=False,
                error=str(e)
            )


# Global registry
_registry: TunnelRegistry | None = None

def get_registry() -> TunnelRegistry:
    """Get the global tunnel registry."""
    global _registry
    if _registry is None:
        _registry = TunnelRegistry()
    return _registry
