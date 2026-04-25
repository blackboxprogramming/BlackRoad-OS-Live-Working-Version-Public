"""
RoadChain Security — offensive self-testing for defensive hardening.

Scan your own network, audit your own configs, harden your own fleet.
Every device gets a SHA-2048 identity. Every scan gets logged on-chain.

"Attacking yourself makes you harder to attack."

BlackRoad OS, Inc. 2026
"""

from .scanner import NetworkScanner, ScanResult
from .hardening import HardeningAuditor, HardeningReport
from .device_identity import DeviceIdentity, DeviceRegistry

__all__ = [
    "NetworkScanner", "ScanResult",
    "HardeningAuditor", "HardeningReport",
    "DeviceIdentity", "DeviceRegistry",
]
