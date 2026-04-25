"""
RoadPad Health Monitor - Track tunnel and circuit health.

Monitors:
- Tunnel availability
- Response times
- Error rates
- Pi fleet status
"""

import subprocess
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List


@dataclass
class TunnelHealth:
    """Health status for a tunnel."""
    name: str
    available: bool = False
    last_check: str = ""
    response_time_ms: int = -1
    error_count: int = 0
    success_count: int = 0

    @property
    def success_rate(self) -> float:
        total = self.error_count + self.success_count
        return (self.success_count / total * 100) if total > 0 else 0.0

    @property
    def status_icon(self) -> str:
        if not self.available:
            return "✗"
        if self.success_rate >= 90:
            return "●"
        if self.success_rate >= 50:
            return "◐"
        return "○"


@dataclass
class FleetStatus:
    """Status of the Pi fleet."""
    hosts: Dict[str, bool] = field(default_factory=dict)
    last_scan: str = ""

    def online_count(self) -> int:
        return sum(1 for v in self.hosts.values() if v)

    def total_count(self) -> int:
        return len(self.hosts)


class HealthMonitor:
    """Monitors health of all tunnels and fleet."""

    def __init__(self):
        self.tunnel_health: Dict[str, TunnelHealth] = {}
        self.fleet_status = FleetStatus()
        self._running = False
        self._thread: threading.Thread | None = None

        # Initialize known tunnels
        self._init_tunnels()

    def _init_tunnels(self):
        """Initialize tunnel health tracking."""
        tunnels = [
            "echo", "copilot", "claude",
            "ollama@localhost",
            "ollama@cecilia", "ollama@lucidia",
            "ollama@octavia", "ollama@aria"
        ]
        for name in tunnels:
            self.tunnel_health[name] = TunnelHealth(name=name)

        # Initialize fleet
        hosts = ["cecilia", "lucidia", "octavia", "alice", "aria"]
        for host in hosts:
            self.fleet_status.hosts[host] = False

    def check_tunnel(self, name: str) -> TunnelHealth:
        """Check a single tunnel's health."""
        health = self.tunnel_health.get(name, TunnelHealth(name=name))

        start = time.time()
        try:
            from tunnels import get_registry
            registry = get_registry()
            tunnel = registry.get(name)

            if tunnel:
                health.available = tunnel.is_available()
                health.response_time_ms = int((time.time() - start) * 1000)
            else:
                health.available = False
                health.response_time_ms = -1

        except Exception:
            health.available = False
            health.response_time_ms = -1

        health.last_check = datetime.now().isoformat()
        self.tunnel_health[name] = health
        return health

    def check_host(self, host: str) -> bool:
        """Check if a host is reachable via SSH."""
        try:
            result = subprocess.run(
                ["ssh", "-o", "ConnectTimeout=2", "-o", "BatchMode=yes",
                 host, "echo", "ok"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False

    def scan_fleet(self) -> FleetStatus:
        """Scan all fleet hosts."""
        for host in self.fleet_status.hosts:
            self.fleet_status.hosts[host] = self.check_host(host)
        self.fleet_status.last_scan = datetime.now().isoformat()
        return self.fleet_status

    def check_all(self) -> None:
        """Check all tunnels."""
        for name in self.tunnel_health:
            self.check_tunnel(name)

    def record_success(self, tunnel_name: str) -> None:
        """Record a successful request."""
        if tunnel_name in self.tunnel_health:
            self.tunnel_health[tunnel_name].success_count += 1

    def record_error(self, tunnel_name: str) -> None:
        """Record a failed request."""
        if tunnel_name in self.tunnel_health:
            self.tunnel_health[tunnel_name].error_count += 1

    def get_summary(self) -> str:
        """Get health summary string."""
        lines = []

        # Fleet status
        online = self.fleet_status.online_count()
        total = self.fleet_status.total_count()
        lines.append(f"Fleet: {online}/{total} online")

        # Tunnel summary
        available = sum(1 for t in self.tunnel_health.values() if t.available)
        lines.append(f"Tunnels: {available}/{len(self.tunnel_health)} ready")

        return " | ".join(lines)

    def get_status_line(self) -> str:
        """Get compact status for status bar."""
        icons = []
        for name in ["copilot", "ollama@localhost", "ollama@cecilia", "ollama@lucidia"]:
            health = self.tunnel_health.get(name)
            if health:
                icons.append(health.status_icon)
            else:
                icons.append("?")
        return "".join(icons)

    def format_full_status(self) -> str:
        """Format full health status."""
        lines = [
            "RoadPad Health Status",
            "=" * 40,
            "",
            "[FLEET]"
        ]

        for host, online in self.fleet_status.hosts.items():
            icon = "✓" if online else "✗"
            lines.append(f"  {icon} {host}")

        lines.extend(["", "[TUNNELS]"])

        for name, health in sorted(self.tunnel_health.items()):
            icon = health.status_icon
            rate = f"{health.success_rate:.0f}%" if health.success_count > 0 else "-"
            ms = f"{health.response_time_ms}ms" if health.response_time_ms >= 0 else "-"
            lines.append(f"  {icon} {name:20} {rate:>5} {ms:>6}")

        return "\n".join(lines)

    def start_background_monitor(self, interval: int = 60) -> None:
        """Start background health monitoring."""
        if self._running:
            return

        self._running = True

        def monitor_loop():
            while self._running:
                self.check_all()
                time.sleep(interval)

        self._thread = threading.Thread(target=monitor_loop, daemon=True)
        self._thread.start()

    def stop_background_monitor(self) -> None:
        """Stop background monitoring."""
        self._running = False


# Global monitor
_monitor: HealthMonitor | None = None

def get_health_monitor() -> HealthMonitor:
    """Get the global health monitor."""
    global _monitor
    if _monitor is None:
        _monitor = HealthMonitor()
    return _monitor
