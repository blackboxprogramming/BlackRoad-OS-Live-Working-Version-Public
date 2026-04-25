"""
Network Scanner — port scanning, service detection, vulnerability checks.

Scans YOUR OWN infrastructure to find weaknesses before someone else does.
All results are SHA-2048 signed and logged.

BlackRoad OS, Inc. 2026
"""

from __future__ import annotations

import json
import socket
import sqlite3
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path

from ..crypto.sha2048 import sha2048_hex, short_id
from ..constants import DATA_DIR


SCAN_DB = DATA_DIR / "security-scans.db"

# Common ports to check when nmap isn't available
COMMON_PORTS = [
    (22, "ssh"), (80, "http"), (443, "https"), (3000, "webapp"),
    (4222, "nats"), (5000, "upnp/dev"), (5432, "postgres"),
    (6379, "redis"), (8080, "http-alt"), (8443, "https-alt"),
    (8888, "jupyter"), (9090, "prometheus"), (9100, "node-exporter"),
    (27017, "mongodb"), (27270, "roadchain"), (27271, "roadchain-rpc"),
    (51820, "wireguard"), (41641, "tailscale"),
]

# Known BlackRoad fleet
FLEET = {
    "alexandria": {"local": "192.168.4.28", "tailscale": "100.91.90.68", "type": "mac"},
    "alice": {"local": "192.168.4.49", "tailscale": "100.77.210.18", "type": "pi"},
    "lucidia": {"local": "192.168.4.81", "tailscale": "100.83.149.86", "type": "pi"},
    "aria": {"local": "192.168.4.82", "tailscale": "100.109.14.17", "type": "pi"},
    "cecilia": {"local": "192.168.4.89", "tailscale": "100.72.180.98", "type": "pi"},
    "octavia": {"local": "192.168.4.38", "tailscale": "100.66.235.47", "type": "pi"},
    "shellfish": {"local": "174.138.44.45", "tailscale": "100.94.33.37", "type": "cloud"},
    "gematria": {"local": "159.65.43.12", "tailscale": "100.108.132.8", "type": "cloud"},
}


@dataclass
class PortResult:
    """Result of scanning a single port."""
    port: int
    state: str          # open, closed, filtered
    service: str = ""
    banner: str = ""
    version: str = ""


@dataclass
class ScanResult:
    """Complete scan result for a host."""
    host: str
    hostname: str = ""
    ip: str = ""
    fingerprint: str = ""      # SHA-2048 of scan result
    short_id: str = ""
    alive: bool = False
    ports: list[PortResult] = field(default_factory=list)
    os_guess: str = ""
    scan_time: float = 0.0
    timestamp: int = 0
    vulnerabilities: list[dict] = field(default_factory=list)
    score: int = 100           # security score (100 = perfect, 0 = compromised)
    notes: list[str] = field(default_factory=list)

    @property
    def open_ports(self) -> list[PortResult]:
        return [p for p in self.ports if p.state == "open"]

    def to_dict(self) -> dict:
        return {
            "host": self.host,
            "hostname": self.hostname,
            "ip": self.ip,
            "fingerprint": self.fingerprint,
            "short_id": self.short_id,
            "alive": self.alive,
            "ports": [{"port": p.port, "state": p.state, "service": p.service,
                       "banner": p.banner, "version": p.version} for p in self.ports],
            "os_guess": self.os_guess,
            "scan_time": self.scan_time,
            "timestamp": self.timestamp,
            "vulnerabilities": self.vulnerabilities,
            "score": self.score,
            "notes": self.notes,
        }


class NetworkScanner:
    """Scan your own network infrastructure for vulnerabilities."""

    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or SCAN_DB
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self.db_path))
        self._conn.row_factory = sqlite3.Row
        self._init_db()
        self._nmap_available = self._check_nmap()

    def _init_db(self) -> None:
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT NOT NULL,
                short_id TEXT NOT NULL,
                host TEXT NOT NULL,
                hostname TEXT DEFAULT '',
                ip TEXT DEFAULT '',
                alive INTEGER DEFAULT 0,
                open_ports TEXT DEFAULT '[]',
                os_guess TEXT DEFAULT '',
                vulnerabilities TEXT DEFAULT '[]',
                score INTEGER DEFAULT 100,
                notes TEXT DEFAULT '[]',
                scan_time REAL DEFAULT 0,
                created_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_scans_host ON scans(host);
            CREATE INDEX IF NOT EXISTS idx_scans_score ON scans(score);
            CREATE INDEX IF NOT EXISTS idx_scans_time ON scans(created_at);

            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                severity TEXT NOT NULL,
                host TEXT NOT NULL,
                message TEXT NOT NULL,
                scan_fingerprint TEXT NOT NULL,
                acknowledged INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL
            );
        """)
        self._conn.commit()

    def _check_nmap(self) -> bool:
        try:
            subprocess.run(["nmap", "--version"], capture_output=True, timeout=5)
            return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False

    def ping(self, host: str, timeout: float = 2.0) -> bool:
        """Check if host is alive."""
        try:
            result = subprocess.run(
                ["ping", "-c", "1", "-W", str(int(timeout * 1000)), host],
                capture_output=True, timeout=timeout + 1,
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, OSError):
            return False

    def scan_port(self, host: str, port: int, timeout: float = 2.0) -> PortResult:
        """Scan a single port using socket connect."""
        service = ""
        for p, s in COMMON_PORTS:
            if p == port:
                service = s
                break

        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))

            if result == 0:
                # Try to grab banner
                banner = ""
                try:
                    sock.send(b"\r\n")
                    banner = sock.recv(1024).decode("utf-8", errors="replace").strip()
                except (socket.timeout, OSError):
                    pass
                sock.close()
                return PortResult(port=port, state="open", service=service, banner=banner[:200])
            else:
                sock.close()
                return PortResult(port=port, state="closed", service=service)
        except socket.timeout:
            return PortResult(port=port, state="filtered", service=service)
        except OSError:
            return PortResult(port=port, state="closed", service=service)

    def scan_host(self, host: str, ports: list[int] | None = None,
                  use_nmap: bool = True) -> ScanResult:
        """Full scan of a single host."""
        start = time.time()
        result = ScanResult(
            host=host,
            ip=host,
            timestamp=int(time.time()),
        )

        # Resolve hostname
        try:
            hostname = socket.gethostbyaddr(host)[0]
            result.hostname = hostname
        except (socket.herror, socket.gaierror):
            result.hostname = host

        # Check if alive
        result.alive = self.ping(host)
        if not result.alive:
            result.scan_time = time.time() - start
            result.notes.append("Host unreachable")
            result.score = 0
            self._finalize_scan(result)
            return result

        # Port scan
        if use_nmap and self._nmap_available:
            result = self._nmap_scan(host, result, ports)
        else:
            scan_ports = ports or [p for p, _ in COMMON_PORTS]
            for port in scan_ports:
                pr = self.scan_port(host, port, timeout=1.5)
                if pr.state == "open":
                    result.ports.append(pr)

        # Security assessment
        self._assess_security(result)

        result.scan_time = time.time() - start
        self._finalize_scan(result)
        return result

    def _nmap_scan(self, host: str, result: ScanResult,
                   ports: list[int] | None = None) -> ScanResult:
        """Use nmap for more thorough scanning."""
        port_arg = ",".join(str(p) for p in ports) if ports else ",".join(str(p) for p, _ in COMMON_PORTS)

        try:
            proc = subprocess.run(
                ["nmap", "-sV", "-sC", "--open", "-p", port_arg, "-T4",
                 "--host-timeout", "30s", host],
                capture_output=True, text=True, timeout=60,
            )

            for line in proc.stdout.splitlines():
                line = line.strip()

                # Parse port lines: "22/tcp open  ssh  OpenSSH 8.9p1"
                if "/tcp" in line and "open" in line:
                    parts = line.split()
                    port_num = int(parts[0].split("/")[0])
                    state = parts[1] if len(parts) > 1 else "open"
                    service = parts[2] if len(parts) > 2 else ""
                    version = " ".join(parts[3:]) if len(parts) > 3 else ""
                    result.ports.append(PortResult(
                        port=port_num, state=state, service=service, version=version,
                    ))

                # OS detection
                if "OS details:" in line:
                    result.os_guess = line.split("OS details:")[1].strip()
                elif "Running:" in line:
                    result.os_guess = line.split("Running:")[1].strip()

                # Vulnerability scripts
                if "VULNERABLE" in line.upper() or "CVE-" in line:
                    result.vulnerabilities.append({
                        "type": "nmap-script",
                        "detail": line,
                    })

        except (subprocess.TimeoutExpired, OSError) as e:
            result.notes.append(f"nmap scan error: {e}")
            # Fallback to socket scanning
            for port, _ in COMMON_PORTS:
                pr = self.scan_port(host, port, timeout=1.5)
                if pr.state == "open":
                    result.ports.append(pr)

        return result

    def _assess_security(self, result: ScanResult) -> None:
        """Assess security posture based on scan results."""
        score = 100

        open_ports = result.open_ports
        if not open_ports:
            result.notes.append("No open ports detected (stealth or filtered)")
            return

        # Check for dangerous services
        for port_result in open_ports:
            p = port_result.port

            # Telnet (unencrypted remote access)
            if p == 23:
                score -= 30
                result.vulnerabilities.append({
                    "severity": "critical",
                    "port": p,
                    "issue": "Telnet service detected — unencrypted remote access",
                    "fix": "Disable telnet, use SSH instead",
                })

            # FTP (unencrypted file transfer)
            if p == 21:
                score -= 20
                result.vulnerabilities.append({
                    "severity": "high",
                    "port": p,
                    "issue": "FTP service detected — unencrypted file transfer",
                    "fix": "Use SFTP or SCP instead",
                })

            # MySQL/PostgreSQL exposed
            if p in (3306, 5432):
                score -= 15
                result.vulnerabilities.append({
                    "severity": "high",
                    "port": p,
                    "issue": f"Database port {p} exposed to network",
                    "fix": "Bind to localhost only or use SSH tunnel",
                })

            # Redis exposed (often no auth)
            if p == 6379:
                score -= 25
                result.vulnerabilities.append({
                    "severity": "critical",
                    "port": p,
                    "issue": "Redis exposed to network — often no authentication",
                    "fix": "Bind to localhost, enable AUTH, use firewall",
                })

            # MongoDB exposed
            if p == 27017:
                score -= 20
                result.vulnerabilities.append({
                    "severity": "high",
                    "port": p,
                    "issue": "MongoDB exposed to network",
                    "fix": "Bind to localhost, enable authentication",
                })

            # SSH on default port (minor — but notable)
            if p == 22:
                result.notes.append("SSH on default port 22 (consider moving to non-standard)")

            # Development ports exposed
            if p in (3000, 8080, 8888, 9090):
                score -= 5
                result.notes.append(f"Development/admin port {p} ({port_result.service}) exposed")

            # UPnP
            if p == 5000 and "upnp" in port_result.service.lower():
                score -= 10
                result.vulnerabilities.append({
                    "severity": "medium",
                    "port": p,
                    "issue": "UPnP service detected — potential attack vector",
                    "fix": "Disable UPnP if not needed",
                })

            # Check for old SSH versions in banner
            if port_result.banner and "SSH" in port_result.banner:
                if "OpenSSH_7" in port_result.banner or "OpenSSH_6" in port_result.banner:
                    score -= 15
                    result.vulnerabilities.append({
                        "severity": "high",
                        "port": p,
                        "issue": f"Outdated SSH version: {port_result.banner[:60]}",
                        "fix": "Update to OpenSSH 8.x or later",
                    })

        # Too many open ports
        if len(open_ports) > 10:
            score -= 10
            result.notes.append(f"High number of open ports ({len(open_ports)}) — reduce attack surface")

        # Nmap-detected vulnerabilities
        score -= len(result.vulnerabilities) * 5

        result.score = max(0, min(100, score))

    def _finalize_scan(self, result: ScanResult) -> None:
        """Compute SHA-2048 fingerprint and store scan."""
        scan_data = json.dumps(result.to_dict(), sort_keys=True).encode("utf-8")
        fp = sha2048_hex(scan_data)
        result.fingerprint = fp
        result.short_id = short_id(bytes.fromhex(fp))

        self._conn.execute(
            """INSERT INTO scans
               (fingerprint, short_id, host, hostname, ip, alive, open_ports,
                os_guess, vulnerabilities, score, notes, scan_time, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (fp, result.short_id, result.host, result.hostname, result.ip,
             int(result.alive),
             json.dumps([p.__dict__ for p in result.ports]),
             result.os_guess,
             json.dumps(result.vulnerabilities),
             result.score,
             json.dumps(result.notes),
             result.scan_time,
             result.timestamp),
        )

        # Generate alerts for critical/high vulns
        for vuln in result.vulnerabilities:
            severity = vuln.get("severity", "info")
            if severity in ("critical", "high"):
                self._conn.execute(
                    """INSERT INTO alerts (severity, host, message, scan_fingerprint, created_at)
                       VALUES (?, ?, ?, ?, ?)""",
                    (severity, result.host, vuln.get("issue", ""), fp, result.timestamp),
                )

        self._conn.commit()

    def scan_fleet(self, use_nmap: bool = True) -> list[ScanResult]:
        """Scan the entire BlackRoad fleet."""
        results = []
        for name, info in FLEET.items():
            ip = info["local"]
            result = self.scan_host(ip, use_nmap=use_nmap)
            result.hostname = name
            results.append(result)
        return results

    def scan_subnet(self, subnet: str = "192.168.4", start: int = 1,
                    end: int = 100) -> list[ScanResult]:
        """Discover and scan all hosts on a subnet."""
        results = []
        for i in range(start, end + 1):
            ip = f"{subnet}.{i}"
            alive = self.ping(ip, timeout=0.5)
            if alive:
                result = self.scan_host(ip, use_nmap=False)
                # Check if this is a known device
                for name, info in FLEET.items():
                    if info["local"] == ip:
                        result.hostname = name
                        break
                else:
                    result.notes.append("UNKNOWN DEVICE — not in fleet registry")
                results.append(result)
        return results

    def get_alerts(self, unacknowledged_only: bool = True) -> list[dict]:
        """Get security alerts."""
        if unacknowledged_only:
            rows = self._conn.execute(
                "SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY created_at DESC"
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM alerts ORDER BY created_at DESC"
            ).fetchall()
        return [dict(r) for r in rows]

    def get_scan_history(self, host: str = "", limit: int = 20) -> list[dict]:
        """Get scan history for a host or all hosts."""
        if host:
            rows = self._conn.execute(
                "SELECT * FROM scans WHERE host = ? ORDER BY created_at DESC LIMIT ?",
                (host, limit),
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM scans ORDER BY created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]

    def fleet_score(self) -> dict:
        """Get security scores for the entire fleet."""
        rows = self._conn.execute("""
            SELECT host, hostname, score, created_at
            FROM scans
            WHERE id IN (SELECT MAX(id) FROM scans GROUP BY host)
            ORDER BY score ASC
        """).fetchall()
        return {
            "devices": [dict(r) for r in rows],
            "average": sum(r["score"] for r in rows) / len(rows) if rows else 0,
            "weakest": dict(rows[0]) if rows else None,
            "total_scanned": len(rows),
        }

    def close(self):
        self._conn.close()
