"""Telemetry and metrics collection for Pi Agent."""

from __future__ import annotations

import logging
import os
import platform
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional


logger = logging.getLogger(__name__)


@dataclass
class SystemMetrics:
    """System resource metrics."""
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_total_mb: float
    disk_percent: float
    disk_used_gb: float
    disk_total_gb: float
    temperature: Optional[float]
    load_average: tuple
    uptime_seconds: float
    network_bytes_sent: int
    network_bytes_recv: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "cpu_percent": self.cpu_percent,
            "memory_percent": self.memory_percent,
            "memory_used_mb": self.memory_used_mb,
            "memory_total_mb": self.memory_total_mb,
            "disk_percent": self.disk_percent,
            "disk_used_gb": self.disk_used_gb,
            "disk_total_gb": self.disk_total_gb,
            "temperature": self.temperature,
            "load_average": list(self.load_average),
            "uptime_seconds": self.uptime_seconds,
            "network_bytes_sent": self.network_bytes_sent,
            "network_bytes_recv": self.network_bytes_recv,
        }


class TelemetryCollector:
    """Collects system metrics and telemetry."""

    def __init__(self) -> None:
        self._boot_time: Optional[float] = None
        self._last_net_io: Optional[Dict[str, int]] = None
        self._psutil_available = False

        try:
            import psutil
            self._psutil = psutil
            self._psutil_available = True
            self._boot_time = psutil.boot_time()
        except ImportError:
            logger.warning("psutil not installed; limited telemetry available")
            self._psutil = None

    def collect_metrics(self) -> SystemMetrics:
        """Collect current system metrics."""
        if self._psutil_available:
            return self._collect_psutil_metrics()
        return self._collect_basic_metrics()

    def _collect_psutil_metrics(self) -> SystemMetrics:
        """Collect metrics using psutil."""
        psutil = self._psutil

        # CPU
        cpu_percent = psutil.cpu_percent(interval=0.1)

        # Memory
        mem = psutil.virtual_memory()
        memory_percent = mem.percent
        memory_used_mb = mem.used / (1024 * 1024)
        memory_total_mb = mem.total / (1024 * 1024)

        # Disk
        disk = psutil.disk_usage("/")
        disk_percent = disk.percent
        disk_used_gb = disk.used / (1024 * 1024 * 1024)
        disk_total_gb = disk.total / (1024 * 1024 * 1024)

        # Temperature
        temperature = self._get_temperature()

        # Load average
        load_average = os.getloadavg() if hasattr(os, "getloadavg") else (0.0, 0.0, 0.0)

        # Uptime
        uptime = time.time() - (self._boot_time or time.time())

        # Network I/O
        net_io = psutil.net_io_counters()
        bytes_sent = net_io.bytes_sent
        bytes_recv = net_io.bytes_recv

        return SystemMetrics(
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            memory_used_mb=round(memory_used_mb, 2),
            memory_total_mb=round(memory_total_mb, 2),
            disk_percent=disk_percent,
            disk_used_gb=round(disk_used_gb, 2),
            disk_total_gb=round(disk_total_gb, 2),
            temperature=temperature,
            load_average=load_average,
            uptime_seconds=round(uptime, 0),
            network_bytes_sent=bytes_sent,
            network_bytes_recv=bytes_recv,
        )

    def _collect_basic_metrics(self) -> SystemMetrics:
        """Collect basic metrics without psutil."""
        # Load average (Unix only)
        try:
            load = os.getloadavg()
        except (AttributeError, OSError):
            load = (0.0, 0.0, 0.0)

        # Uptime from /proc/uptime
        uptime = 0.0
        try:
            with open("/proc/uptime", "r") as f:
                uptime = float(f.read().split()[0])
        except (FileNotFoundError, ValueError):
            pass

        # Temperature
        temperature = self._get_temperature()

        return SystemMetrics(
            cpu_percent=load[0] * 100 / max(os.cpu_count() or 1, 1),
            memory_percent=0.0,
            memory_used_mb=0.0,
            memory_total_mb=0.0,
            disk_percent=0.0,
            disk_used_gb=0.0,
            disk_total_gb=0.0,
            temperature=temperature,
            load_average=load,
            uptime_seconds=uptime,
            network_bytes_sent=0,
            network_bytes_recv=0,
        )

    def _get_temperature(self) -> Optional[float]:
        """Get CPU temperature (Raspberry Pi specific)."""
        # Try Raspberry Pi thermal zone
        thermal_paths = [
            "/sys/class/thermal/thermal_zone0/temp",
            "/sys/devices/virtual/thermal/thermal_zone0/temp",
        ]

        for path in thermal_paths:
            try:
                with open(path, "r") as f:
                    temp = int(f.read().strip()) / 1000.0
                    return round(temp, 1)
            except (FileNotFoundError, ValueError):
                continue

        # Try psutil sensors
        if self._psutil_available:
            try:
                temps = self._psutil.sensors_temperatures()
                if temps:
                    for name, entries in temps.items():
                        if entries:
                            return round(entries[0].current, 1)
            except (AttributeError, Exception):
                pass

        return None

    def get_system_info(self) -> Dict[str, Any]:
        """Get static system information."""
        info = {
            "platform": platform.system(),
            "platform_release": platform.release(),
            "platform_version": platform.version(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "hostname": platform.node(),
            "python_version": platform.python_version(),
            "cpu_count": os.cpu_count(),
        }

        # Raspberry Pi specific info
        pi_info = self._get_pi_info()
        if pi_info:
            info.update(pi_info)

        return info

    def _get_pi_info(self) -> Optional[Dict[str, str]]:
        """Get Raspberry Pi specific information."""
        try:
            with open("/proc/cpuinfo", "r") as f:
                content = f.read()

            info = {}
            for line in content.split("\n"):
                if ":" in line:
                    key, value = line.split(":", 1)
                    key = key.strip().lower().replace(" ", "_")
                    value = value.strip()

                    if key in ("model", "revision", "serial", "hardware"):
                        info[f"pi_{key}"] = value

            return info if info else None
        except FileNotFoundError:
            return None
