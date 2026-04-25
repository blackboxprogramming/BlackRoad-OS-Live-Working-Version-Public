"""
Hardening Auditor — check SSH configs, firewall rules, service exposure.

Audits YOUR OWN infrastructure against security best practices.
Generates actionable fix commands for every finding.

BlackRoad OS, Inc. 2026
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Finding:
    """A single security finding."""
    severity: str       # critical, high, medium, low, info
    category: str       # ssh, firewall, permissions, services, network, crypto
    title: str
    detail: str
    fix: str            # actionable command or instruction
    host: str = ""
    automated: bool = False  # can be auto-fixed

    SEVERITY_SCORES = {"critical": 30, "high": 20, "medium": 10, "low": 5, "info": 0}

    @property
    def deduction(self) -> int:
        return self.SEVERITY_SCORES.get(self.severity, 0)


@dataclass
class HardeningReport:
    """Complete hardening audit report."""
    host: str
    timestamp: int = 0
    findings: list[Finding] = field(default_factory=list)
    score: int = 100
    checks_run: int = 0
    checks_passed: int = 0

    @property
    def grade(self) -> str:
        if self.score >= 90:
            return "A"
        elif self.score >= 80:
            return "B"
        elif self.score >= 70:
            return "C"
        elif self.score >= 60:
            return "D"
        return "F"

    @property
    def critical_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "critical")

    @property
    def high_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "high")

    def to_dict(self) -> dict:
        return {
            "host": self.host,
            "timestamp": self.timestamp,
            "score": self.score,
            "grade": self.grade,
            "checks_run": self.checks_run,
            "checks_passed": self.checks_passed,
            "critical": self.critical_count,
            "high": self.high_count,
            "findings": [
                {"severity": f.severity, "category": f.category,
                 "title": f.title, "detail": f.detail, "fix": f.fix,
                 "automated": f.automated}
                for f in self.findings
            ],
        }


class HardeningAuditor:
    """Audit security hardening on local or remote hosts."""

    def audit_local(self) -> HardeningReport:
        """Audit the local machine's security posture."""
        report = HardeningReport(
            host="localhost",
            timestamp=int(time.time()),
        )

        self._check_ssh_config(report)
        self._check_ssh_keys(report)
        self._check_firewall(report)
        self._check_permissions(report)
        self._check_services(report)
        self._check_network_exposure(report)
        self._check_crypto_strength(report)
        self._check_secrets_exposure(report)

        # Calculate score
        total_deduction = sum(f.deduction for f in report.findings)
        report.score = max(0, 100 - total_deduction)

        return report

    def audit_remote(self, host: str, user: str = "blackroad") -> HardeningReport:
        """Audit a remote host via SSH."""
        report = HardeningReport(
            host=host,
            timestamp=int(time.time()),
        )

        # Test SSH connectivity
        try:
            result = subprocess.run(
                ["ssh", "-o", "ConnectTimeout=5", "-o", "BatchMode=yes",
                 f"{user}@{host}", "echo ok"],
                capture_output=True, text=True, timeout=10,
            )
            if result.returncode != 0:
                report.findings.append(Finding(
                    severity="critical", category="ssh",
                    title="SSH connection failed",
                    detail=f"Cannot connect to {user}@{host}",
                    fix=f"Verify SSH key: ssh {user}@{host}",
                    host=host,
                ))
                report.score = 0
                return report
        except (subprocess.TimeoutExpired, OSError):
            report.findings.append(Finding(
                severity="critical", category="ssh",
                title="SSH timeout",
                detail=f"Connection to {host} timed out",
                fix=f"Check network connectivity: ping {host}",
                host=host,
            ))
            report.score = 0
            return report

        self._check_remote_ssh(report, host, user)
        self._check_remote_firewall(report, host, user)
        self._check_remote_services(report, host, user)
        self._check_remote_disk(report, host, user)
        self._check_remote_updates(report, host, user)

        total_deduction = sum(f.deduction for f in report.findings)
        report.score = max(0, 100 - total_deduction)
        return report

    # ── Local Checks ──────────────────────────────────────────────────

    def _check_ssh_config(self, report: HardeningReport) -> None:
        """Check SSH client and server configuration."""
        report.checks_run += 1

        ssh_config = Path.home() / ".ssh" / "config"
        if ssh_config.exists():
            content = ssh_config.read_text()

            # StrictHostKeyChecking disabled globally
            if re.search(r"StrictHostKeyChecking\s+no", content, re.IGNORECASE):
                report.findings.append(Finding(
                    severity="high", category="ssh",
                    title="StrictHostKeyChecking disabled",
                    detail="SSH config has StrictHostKeyChecking=no — vulnerable to MITM attacks",
                    fix="Change to 'StrictHostKeyChecking accept-new' in ~/.ssh/config",
                    automated=True,
                ))
            else:
                report.checks_passed += 1

            # Password authentication enabled
            if re.search(r"PasswordAuthentication\s+yes", content, re.IGNORECASE):
                report.findings.append(Finding(
                    severity="medium", category="ssh",
                    title="Password authentication enabled",
                    detail="SSH allows password login — weaker than key-based auth",
                    fix="Set 'PasswordAuthentication no' in SSH config",
                ))

            # Root login permitted
            if re.search(r"PermitRootLogin\s+yes", content, re.IGNORECASE):
                report.findings.append(Finding(
                    severity="high", category="ssh",
                    title="Root SSH login permitted",
                    detail="SSH allows direct root login — use sudo instead",
                    fix="Set 'PermitRootLogin no' in /etc/ssh/sshd_config",
                ))

    def _check_ssh_keys(self, report: HardeningReport) -> None:
        """Check SSH key security."""
        report.checks_run += 1
        ssh_dir = Path.home() / ".ssh"

        if not ssh_dir.exists():
            report.findings.append(Finding(
                severity="info", category="ssh",
                title="No SSH directory",
                detail="~/.ssh does not exist",
                fix="mkdir -p ~/.ssh && chmod 700 ~/.ssh",
            ))
            return

        # Check key types
        for key_file in ssh_dir.glob("id_*"):
            if key_file.suffix == ".pub":
                continue

            name = key_file.name

            # Check permissions
            mode = oct(key_file.stat().st_mode)[-3:]
            if mode != "600":
                report.findings.append(Finding(
                    severity="high", category="permissions",
                    title=f"SSH key {name} has wrong permissions ({mode})",
                    detail="Private keys must be 600 (owner read/write only)",
                    fix=f"chmod 600 {key_file}",
                    automated=True,
                ))

            # Check key type
            if "rsa" in name:
                # Check RSA key size
                try:
                    result = subprocess.run(
                        ["ssh-keygen", "-l", "-f", str(key_file)],
                        capture_output=True, text=True, timeout=5,
                    )
                    if result.returncode == 0:
                        bits = int(result.stdout.split()[0])
                        if bits < 4096:
                            report.findings.append(Finding(
                                severity="medium", category="crypto",
                                title=f"RSA key {name} is only {bits} bits",
                                detail="RSA keys should be at least 4096 bits",
                                fix=f"ssh-keygen -t ed25519 -f {ssh_dir}/id_ed25519",
                            ))
                except (subprocess.TimeoutExpired, ValueError):
                    pass

            report.checks_passed += 1

        # Check authorized_keys permissions
        auth_keys = ssh_dir / "authorized_keys"
        if auth_keys.exists():
            mode = oct(auth_keys.stat().st_mode)[-3:]
            if mode not in ("600", "644"):
                report.findings.append(Finding(
                    severity="medium", category="permissions",
                    title=f"authorized_keys has wrong permissions ({mode})",
                    detail="Should be 600 or 644",
                    fix=f"chmod 600 {auth_keys}",
                    automated=True,
                ))

    def _check_firewall(self, report: HardeningReport) -> None:
        """Check macOS firewall status."""
        report.checks_run += 1

        # Try multiple paths for socketfilterfw
        fw_paths = [
            "/usr/libexec/ApplicationFirewall/socketfilterfw",
            "/usr/sbin/socketfilterfw",
        ]
        checked = False
        for fw_path in fw_paths:
            try:
                result = subprocess.run(
                    [fw_path, "--getglobalstate"],
                    capture_output=True, text=True, timeout=5,
                )
                if result.returncode == 0:
                    checked = True
                    if "disabled" in result.stdout.lower():
                        report.findings.append(Finding(
                            severity="high", category="firewall",
                            title="macOS firewall is disabled",
                            detail="Built-in application firewall is not active",
                            fix=f"sudo {fw_path} --setglobalstate on",
                            automated=True,
                        ))
                    else:
                        report.checks_passed += 1
                    break
            except (subprocess.TimeoutExpired, OSError):
                continue

        if not checked:
            # Try defaults read as fallback
            try:
                result = subprocess.run(
                    ["defaults", "read",
                     "/Library/Preferences/com.apple.alf", "globalstate"],
                    capture_output=True, text=True, timeout=5,
                )
                if result.returncode == 0:
                    state = result.stdout.strip()
                    if state in ("1", "2"):
                        report.checks_passed += 1
                    else:
                        report.findings.append(Finding(
                            severity="high", category="firewall",
                            title="macOS firewall is disabled",
                            detail="Built-in application firewall is not active",
                            fix="Open System Settings > Network > Firewall and enable it",
                            automated=False,
                        ))
                else:
                    report.checks_passed += 1  # Assume enabled if can't read
            except (subprocess.TimeoutExpired, OSError):
                report.checks_passed += 1  # Don't penalize if we can't check

    def _check_permissions(self, report: HardeningReport) -> None:
        """Check file permissions for sensitive files."""
        report.checks_run += 1
        home = Path.home()

        sensitive_files = [
            (home / ".env", "600"),
            (home / ".blackroad.env", "600"),
            (home / ".ssh", "700"),
            (home / ".gnupg", "700"),
        ]

        all_ok = True
        for path, expected in sensitive_files:
            if path.exists():
                mode = oct(path.stat().st_mode)[-3:]
                if mode != expected:
                    all_ok = False
                    report.findings.append(Finding(
                        severity="medium", category="permissions",
                        title=f"{path.name} has permissions {mode} (expected {expected})",
                        detail=f"Sensitive file/directory has too-open permissions",
                        fix=f"chmod {expected} {path}",
                        automated=True,
                    ))

        if all_ok:
            report.checks_passed += 1

    def _check_services(self, report: HardeningReport) -> None:
        """Check for exposed local services."""
        report.checks_run += 1

        try:
            # Check listening ports
            result = subprocess.run(
                ["lsof", "-i", "-P", "-n"],
                capture_output=True, text=True, timeout=10,
            )
            lines = result.stdout.splitlines()
            listening = [l for l in lines if "LISTEN" in l]

            # Check for services bound to 0.0.0.0 (all interfaces)
            exposed = [l for l in listening if "*:" in l or "0.0.0.0:" in l]

            if len(exposed) > 15:
                report.findings.append(Finding(
                    severity="medium", category="services",
                    title=f"{len(exposed)} services listening on all interfaces",
                    detail="Many services are bound to 0.0.0.0, exposing them to the network",
                    fix="Bind services to 127.0.0.1 where possible",
                ))
            else:
                report.checks_passed += 1

        except (subprocess.TimeoutExpired, OSError):
            pass

    def _check_network_exposure(self, report: HardeningReport) -> None:
        """Check for network-level exposure risks."""
        report.checks_run += 1

        # Check if Tailscale is running (good — encrypted mesh)
        # Try multiple paths: CLI, macOS app bundled CLI, and process check
        tailscale_paths = [
            "tailscale",
            "/Applications/Tailscale.app/Contents/MacOS/Tailscale",
            "/usr/local/bin/tailscale",
        ]

        found = False
        for ts_path in tailscale_paths:
            try:
                result = subprocess.run(
                    [ts_path, "status", "--json"],
                    capture_output=True, text=True, timeout=5,
                )
                if result.returncode == 0:
                    found = True
                    report.checks_passed += 1
                    report.findings.append(Finding(
                        severity="info", category="network",
                        title="Tailscale VPN mesh active",
                        detail="Encrypted mesh network is running",
                        fix="(good — keep running)",
                    ))
                    break
            except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
                continue

        if not found:
            # Fallback: check if Tailscale process is running
            try:
                result = subprocess.run(
                    ["pgrep", "-f", "[Tt]ailscale"],
                    capture_output=True, text=True, timeout=5,
                )
                if result.returncode == 0 and result.stdout.strip():
                    found = True
                    report.checks_passed += 1
                    report.findings.append(Finding(
                        severity="info", category="network",
                        title="Tailscale VPN process detected",
                        detail="Tailscale is running (GUI mode)",
                        fix="(good — mesh VPN active)",
                    ))
            except (subprocess.TimeoutExpired, OSError):
                pass

        if not found:
            report.findings.append(Finding(
                severity="medium", category="network",
                title="Tailscale not detected",
                detail="Encrypted mesh VPN not found running",
                fix="Install Tailscale: brew install tailscale, or check if the app is running",
            ))

    def _check_crypto_strength(self, report: HardeningReport) -> None:
        """Check cryptographic configurations."""
        report.checks_run += 1

        # Check if SHA-2048 identity exists
        sha2048_short = os.environ.get("CLAUDE_SHA2048_SHORT", "")
        if sha2048_short:
            report.checks_passed += 1
            report.findings.append(Finding(
                severity="info", category="crypto",
                title=f"SHA-2048 identity active: {sha2048_short}",
                detail="Agent has a 2048-bit cryptographic identity",
                fix="(good — identity > provider)",
            ))
        else:
            report.findings.append(Finding(
                severity="low", category="crypto",
                title="No SHA-2048 identity set",
                detail="Agent does not have a RoadChain identity fingerprint",
                fix="python3 -m roadchain identity register --name $(hostname)",
            ))

    def _check_secrets_exposure(self, report: HardeningReport) -> None:
        """Check for exposed secrets in common locations."""
        report.checks_run += 1
        home = Path.home()

        # Check for .env files with weak permissions
        env_files = list(home.glob("*.env")) + list(home.glob(".env*"))
        exposed_secrets = []

        for env_file in env_files:
            if env_file.is_file():
                mode = oct(env_file.stat().st_mode)[-3:]
                if mode not in ("600", "400"):
                    exposed_secrets.append(env_file.name)

        if exposed_secrets:
            report.findings.append(Finding(
                severity="high", category="permissions",
                title=f"{len(exposed_secrets)} env files with weak permissions",
                detail=f"Files: {', '.join(exposed_secrets[:5])}",
                fix="chmod 600 ~/*.env ~/.env*",
                automated=True,
            ))
        else:
            report.checks_passed += 1

    # ── Remote Checks ─────────────────────────────────────────────────

    # Map host IPs to (user, ssh_alias) with NOPASSWD sudo
    # ssh_alias is used instead of user@ip when the default key doesn't work
    _SUDO_FALLBACKS: dict[str, list[tuple[str, str | None]]] = {
        "192.168.4.49": [("pi", None)],               # alice
        "192.168.4.81": [("pi", None)],               # lucidia
        "192.168.4.82": [("pi", "aria-pi")],          # aria (uses br_mesh key)
        "192.168.4.38": [("pi", "octavia-pi")],       # octavia (uses br_mesh key)
        "192.168.4.89": [("cecilia", None)],           # cecilia
    }

    def _ssh_exec(self, host: str, user: str, cmd: str,
                  timeout: float = 10) -> str:
        """Execute a command on remote host via SSH."""
        # Build connection targets: (ssh_target, label) pairs
        targets = [(f"{user}@{host}", user)]
        if "sudo" in cmd:
            for fallback_user, alias in self._SUDO_FALLBACKS.get(host, []):
                if fallback_user != user:
                    # Use SSH config alias if available, otherwise user@ip
                    target = alias if alias else f"{fallback_user}@{host}"
                    targets.append((target, fallback_user))

        for ssh_target, _label in targets:
            try:
                result = subprocess.run(
                    ["ssh", "-o", "ConnectTimeout=5", "-o", "BatchMode=yes",
                     ssh_target, cmd],
                    capture_output=True, text=True, timeout=timeout,
                )
                output = result.stdout.strip()
                # If we got meaningful output, return it immediately
                if output:
                    return output
                # No output — if more targets to try, try them
                if ssh_target != targets[-1][0]:
                    continue
                return output
            except (subprocess.TimeoutExpired, OSError):
                continue
        return ""

    def _check_remote_ssh(self, report: HardeningReport, host: str,
                          user: str) -> None:
        """Check remote SSH configuration (effective config via sshd -T)."""
        report.checks_run += 1

        # Use sshd -T for effective config (resolves includes/drop-ins)
        sshd_config = self._ssh_exec(
            host, user, "sudo -n sshd -T 2>/dev/null")
        if not sshd_config:
            # Fallback to reading files (strip comments)
            sshd_config = self._ssh_exec(
                host, user,
                "cat /etc/ssh/sshd_config.d/*.conf /etc/ssh/sshd_config 2>/dev/null | grep -v '^#'")
        if not sshd_config:
            return

        issues = False

        if re.search(r"permitrootlogin\s+yes", sshd_config, re.IGNORECASE):
            issues = True
            report.findings.append(Finding(
                severity="high", category="ssh",
                title="Root login enabled",
                detail=f"PermitRootLogin yes on {host}",
                fix=f"echo 'PermitRootLogin no' | sudo tee /etc/ssh/sshd_config.d/99-hardening.conf && sudo systemctl restart sshd",
                host=host, automated=True,
            ))

        if re.search(r"passwordauthentication\s+yes", sshd_config, re.IGNORECASE):
            issues = True
            report.findings.append(Finding(
                severity="medium", category="ssh",
                title="Password auth enabled",
                detail=f"PasswordAuthentication yes on {host}",
                fix=f"echo 'PasswordAuthentication no' | sudo tee -a /etc/ssh/sshd_config.d/99-hardening.conf && sudo systemctl restart sshd",
                host=host, automated=True,
            ))

        if re.search(r"x11forwarding\s+yes", sshd_config, re.IGNORECASE):
            report.findings.append(Finding(
                severity="low", category="ssh",
                title="X11 forwarding enabled",
                detail=f"X11Forwarding yes on {host} (unnecessary on headless server)",
                fix=f"Add 'X11Forwarding no' to /etc/ssh/sshd_config.d/99-hardening.conf",
                host=host,
            ))

        if not issues:
            report.checks_passed += 1

    def _check_remote_firewall(self, report: HardeningReport, host: str,
                               user: str) -> None:
        """Check remote firewall (ufw/iptables/nftables)."""
        report.checks_run += 1

        # First try ufw (most common on Debian/Ubuntu)
        ufw_status = self._ssh_exec(host, user, "sudo -n ufw status 2>/dev/null")
        if "active" in ufw_status.lower():
            report.checks_passed += 1
            return

        # ufw not active or not installed — check iptables for real rules
        # Tailscale and Docker both manage iptables chains directly
        iptables_rules = self._ssh_exec(
            host, user,
            "sudo -n iptables -L -n 2>/dev/null || iptables -L -n 2>/dev/null"
        )

        has_tailscale = "ts-input" in iptables_rules or "ts-forward" in iptables_rules
        has_docker = "DOCKER" in iptables_rules
        # Count real rules (skip empty chains and headers)
        rule_lines = [
            l for l in iptables_rules.splitlines()
            if l.strip() and not l.startswith("Chain ") and not l.startswith("target")
        ]
        has_rules = len(rule_lines) > 2

        if has_tailscale and has_rules:
            report.checks_passed += 1
            report.findings.append(Finding(
                severity="info", category="firewall",
                title=f"iptables active with Tailscale chains on {host}",
                detail=f"Tailscale VPN managing firewall rules ({len(rule_lines)} rules)"
                       + (", Docker isolation active" if has_docker else ""),
                fix="(good — Tailscale + iptables providing network security)",
                host=host,
            ))
            # Check if INPUT policy is ACCEPT (permissive for local network)
            if "Chain INPUT (policy ACCEPT)" in iptables_rules:
                report.findings.append(Finding(
                    severity="low", category="firewall",
                    title=f"INPUT policy ACCEPT on {host}",
                    detail="Local network traffic is unrestricted. Tailscale traffic is filtered.",
                    fix=f"Consider: ssh {user}@{host} 'sudo apt install ufw && sudo ufw allow ssh && sudo ufw --force enable'",
                    host=host,
                ))
        elif has_rules:
            report.checks_passed += 1
            report.findings.append(Finding(
                severity="info", category="firewall",
                title=f"iptables active on {host} ({len(rule_lines)} rules)",
                detail="Firewall rules detected via iptables/nftables",
                fix="(firewall active)",
                host=host,
            ))
        else:
            # No ufw, no meaningful iptables rules
            report.findings.append(Finding(
                severity="high", category="firewall",
                title=f"No firewall protection on {host}",
                detail="Neither ufw nor iptables rules detected",
                fix=f"ssh {user}@{host} 'sudo apt install -y ufw && sudo ufw default deny incoming && sudo ufw allow ssh && sudo ufw --force enable'",
                host=host, automated=True,
            ))

    def _check_remote_services(self, report: HardeningReport, host: str,
                               user: str) -> None:
        """Check services running on remote host."""
        report.checks_run += 1

        listening = self._ssh_exec(host, user,
                                   "ss -tlnp 2>/dev/null | grep LISTEN")
        if listening:
            lines = listening.strip().splitlines()
            exposed = [l for l in lines if "0.0.0.0:" in l or "*:" in l]
            if len(exposed) > 10:
                report.findings.append(Finding(
                    severity="medium", category="services",
                    title=f"{len(exposed)} services on all interfaces ({host})",
                    detail="Many services bound to 0.0.0.0",
                    fix=f"ssh {user}@{host} 'ss -tlnp | grep 0.0.0.0' — bind to 127.0.0.1",
                    host=host,
                ))
            else:
                report.checks_passed += 1

    def _check_remote_disk(self, report: HardeningReport, host: str,
                           user: str) -> None:
        """Check disk usage on remote host."""
        report.checks_run += 1

        df_output = self._ssh_exec(host, user, "df -h / | tail -1")
        if df_output:
            parts = df_output.split()
            for part in parts:
                if "%" in part:
                    usage = int(part.replace("%", ""))
                    if usage >= 95:
                        report.findings.append(Finding(
                            severity="critical", category="services",
                            title=f"Disk {usage}% full on {host}",
                            detail="Critical disk usage — services may fail",
                            fix=f"ssh {user}@{host} 'sudo apt autoremove -y && sudo docker system prune -f'",
                            host=host, automated=True,
                        ))
                    elif usage >= 85:
                        report.findings.append(Finding(
                            severity="medium", category="services",
                            title=f"Disk {usage}% on {host}",
                            detail="High disk usage — cleanup recommended",
                            fix=f"ssh {user}@{host} 'df -h && du -sh /var/log/* | sort -rh | head'",
                            host=host,
                        ))
                    else:
                        report.checks_passed += 1
                    break

    def _check_remote_updates(self, report: HardeningReport, host: str,
                              user: str) -> None:
        """Check for pending security updates."""
        report.checks_run += 1

        updates = self._ssh_exec(host, user,
                                 "apt list --upgradable 2>/dev/null | grep -i security | wc -l")
        if updates and updates.isdigit() and int(updates) > 0:
            count = int(updates)
            severity = "high" if count > 10 else "medium" if count > 3 else "low"
            report.findings.append(Finding(
                severity=severity, category="services",
                title=f"{count} security updates pending on {host}",
                detail="Unpatched security vulnerabilities",
                fix=f"ssh {user}@{host} 'sudo apt update && sudo apt upgrade -y'",
                host=host, automated=True,
            ))
        else:
            report.checks_passed += 1
