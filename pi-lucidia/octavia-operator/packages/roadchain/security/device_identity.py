"""
Device Identity — SHA-2048 fingerprints for hardware devices.

Every device in the fleet gets a permanent cryptographic identity.
The device IS its hash. Moving it, renaming it, changing its IP — the identity stays.

identity > provider — and identity > location.

BlackRoad OS, Inc. 2026
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path

from ..crypto.sha2048 import sha2048_hex, short_id, fingerprint_display
from ..constants import DATA_DIR


DEVICE_DB = DATA_DIR / "device-identity.db"


@dataclass
class DeviceIdentity:
    """A device's cryptographic identity."""
    name: str
    fingerprint: str         # SHA-2048 hex (512 chars)
    short_id: str            # first 16 hex chars
    device_type: str         # mac, pi, cloud, esp32, unknown
    local_ip: str = ""
    tailscale_ip: str = ""
    mac_address: str = ""
    hostname: str = ""
    hardware: str = ""       # "Pi 5 8GB", "M1 Mac", etc.
    ssh_key_fingerprint: str = ""
    os_version: str = ""
    registered_at: int = 0
    last_seen: int = 0
    status: str = "active"   # active, offline, decommissioned
    security_score: int = 100
    metadata: dict = field(default_factory=dict)

    def card(self) -> str:
        """Display device identity card."""
        lines = [
            f"DEVICE: {self.name}",
            f"  Type:       {self.device_type}",
            f"  Hardware:   {self.hardware or 'unknown'}",
            f"  Local IP:   {self.local_ip or 'n/a'}",
            f"  Tailscale:  {self.tailscale_ip or 'n/a'}",
            f"  MAC:        {self.mac_address or 'n/a'}",
            f"  OS:         {self.os_version or 'n/a'}",
            f"  Score:      {self.security_score}/100",
            f"  SHA-2048:   {self.short_id}",
            f"  Status:     {self.status}",
        ]
        return "\n".join(lines)


class DeviceRegistry:
    """SQLite-backed device identity registry with SHA-2048 fingerprints."""

    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or DEVICE_DB
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self.db_path))
        self._conn.row_factory = sqlite3.Row
        self._init_db()

    def _init_db(self) -> None:
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS devices (
                fingerprint TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                short_id TEXT NOT NULL,
                device_type TEXT NOT NULL,
                local_ip TEXT DEFAULT '',
                tailscale_ip TEXT DEFAULT '',
                mac_address TEXT DEFAULT '',
                hostname TEXT DEFAULT '',
                hardware TEXT DEFAULT '',
                ssh_key_fingerprint TEXT DEFAULT '',
                os_version TEXT DEFAULT '',
                status TEXT DEFAULT 'active',
                security_score INTEGER DEFAULT 100,
                metadata TEXT DEFAULT '{}',
                registered_at INTEGER NOT NULL,
                last_seen INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_devices_name ON devices(name);
            CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(device_type);
            CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
            CREATE INDEX IF NOT EXISTS idx_devices_ip ON devices(local_ip);

            CREATE TABLE IF NOT EXISTS device_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_fingerprint TEXT NOT NULL,
                event_type TEXT NOT NULL,
                detail TEXT DEFAULT '',
                created_at INTEGER NOT NULL
            );
        """)
        self._conn.commit()

    def register(self, name: str, device_type: str,
                 local_ip: str = "", tailscale_ip: str = "",
                 mac_address: str = "", hardware: str = "",
                 hostname: str = "", metadata: dict | None = None) -> DeviceIdentity:
        """Register a device with a SHA-2048 identity fingerprint."""

        # Compute identity from immutable characteristics
        # MAC address is primary (hardware-bound), fallback to name + type
        identity_data = (
            name.encode("utf-8") + b"\x00" +
            device_type.encode("utf-8") + b"\x00" +
            mac_address.encode("utf-8") + b"\x00" +
            hardware.encode("utf-8") + b"\x00" +
            hostname.encode("utf-8")
        )

        fp = sha2048_hex(identity_data)
        sid = short_id(bytes.fromhex(fp))
        now = int(time.time())
        meta = metadata or {}

        self._conn.execute(
            """INSERT OR REPLACE INTO devices
               (fingerprint, name, short_id, device_type, local_ip,
                tailscale_ip, mac_address, hostname, hardware,
                status, metadata, registered_at, last_seen)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)""",
            (fp, name, sid, device_type, local_ip, tailscale_ip,
             mac_address, hostname, hardware,
             json.dumps(meta), now, now),
        )

        self._log_event(fp, "registered", f"Device {name} registered with SHA-2048 identity")
        self._conn.commit()

        return DeviceIdentity(
            name=name, fingerprint=fp, short_id=sid,
            device_type=device_type, local_ip=local_ip,
            tailscale_ip=tailscale_ip, mac_address=mac_address,
            hostname=hostname, hardware=hardware,
            registered_at=now, last_seen=now, metadata=meta,
        )

    def heartbeat(self, name: str) -> bool:
        """Update last_seen for a device."""
        now = int(time.time())
        cursor = self._conn.execute(
            "UPDATE devices SET last_seen = ? WHERE name = ?", (now, name)
        )
        self._conn.commit()
        return cursor.rowcount > 0

    def update_score(self, name: str, score: int) -> None:
        """Update security score for a device."""
        self._conn.execute(
            "UPDATE devices SET security_score = ? WHERE name = ?",
            (max(0, min(100, score)), name),
        )
        fp_row = self._conn.execute(
            "SELECT fingerprint FROM devices WHERE name = ?", (name,)
        ).fetchone()
        if fp_row:
            self._log_event(fp_row["fingerprint"], "score_update",
                            f"Security score updated to {score}")
        self._conn.commit()

    def mark_offline(self, name: str) -> None:
        """Mark device as offline."""
        self._conn.execute(
            "UPDATE devices SET status = 'offline' WHERE name = ?", (name,)
        )
        self._conn.commit()

    def get(self, name: str) -> DeviceIdentity | None:
        """Get device by name."""
        row = self._conn.execute(
            "SELECT * FROM devices WHERE name = ?", (name,)
        ).fetchone()
        return self._row_to_device(row) if row else None

    def get_by_ip(self, ip: str) -> DeviceIdentity | None:
        """Get device by IP address."""
        row = self._conn.execute(
            "SELECT * FROM devices WHERE local_ip = ? OR tailscale_ip = ?",
            (ip, ip),
        ).fetchone()
        return self._row_to_device(row) if row else None

    def list_all(self, status: str = "") -> list[DeviceIdentity]:
        """List all registered devices."""
        if status:
            rows = self._conn.execute(
                "SELECT * FROM devices WHERE status = ? ORDER BY name",
                (status,),
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM devices ORDER BY name"
            ).fetchall()
        return [self._row_to_device(r) for r in rows]

    def stats(self) -> dict:
        """Fleet statistics."""
        total = self._conn.execute("SELECT COUNT(*) FROM devices").fetchone()[0]
        active = self._conn.execute(
            "SELECT COUNT(*) FROM devices WHERE status = 'active'"
        ).fetchone()[0]
        offline = self._conn.execute(
            "SELECT COUNT(*) FROM devices WHERE status = 'offline'"
        ).fetchone()[0]

        types = self._conn.execute(
            "SELECT device_type, COUNT(*) as cnt FROM devices GROUP BY device_type"
        ).fetchall()

        scores = self._conn.execute(
            "SELECT name, security_score FROM devices WHERE status = 'active' ORDER BY security_score ASC"
        ).fetchall()

        avg_score = (
            sum(r["security_score"] for r in scores) / len(scores) if scores else 0
        )

        return {
            "total": total,
            "active": active,
            "offline": offline,
            "types": {r["device_type"]: r["cnt"] for r in types},
            "average_score": round(avg_score, 1),
            "weakest": dict(scores[0]) if scores else None,
            "strongest": dict(scores[-1]) if scores else None,
        }

    def detect_unknown(self, known_ips: set[str],
                       found_ips: set[str]) -> list[str]:
        """Find IPs that are on the network but not in the fleet."""
        return sorted(found_ips - known_ips)

    def _log_event(self, device_fp: str, event_type: str, detail: str) -> None:
        self._conn.execute(
            "INSERT INTO device_events (device_fingerprint, event_type, detail, created_at) VALUES (?, ?, ?, ?)",
            (device_fp, event_type, detail, int(time.time())),
        )

    def _row_to_device(self, row: sqlite3.Row) -> DeviceIdentity:
        return DeviceIdentity(
            name=row["name"],
            fingerprint=row["fingerprint"],
            short_id=row["short_id"],
            device_type=row["device_type"],
            local_ip=row["local_ip"],
            tailscale_ip=row["tailscale_ip"],
            mac_address=row["mac_address"],
            hostname=row["hostname"],
            hardware=row["hardware"],
            ssh_key_fingerprint=row["ssh_key_fingerprint"] if "ssh_key_fingerprint" in row.keys() else "",
            os_version=row["os_version"] if "os_version" in row.keys() else "",
            status=row["status"],
            security_score=row["security_score"],
            registered_at=row["registered_at"],
            last_seen=row["last_seen"],
            metadata=json.loads(row["metadata"]) if row["metadata"] else {},
        )

    def close(self):
        self._conn.close()
