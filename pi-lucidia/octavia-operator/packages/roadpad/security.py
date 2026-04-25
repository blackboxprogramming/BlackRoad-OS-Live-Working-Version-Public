"""
Lucidia Security Module - Sovereign AI protection.

Defense layers:
  1. Backend trust verification (known hosts only)
  2. Input sanitization (injection prevention)
  3. Output filtering (secret redaction)
  4. Audit logging (all interactions tracked)
  5. Rate limiting (abuse prevention)
  6. Sandbox boundaries (filesystem/network limits)
"""

import os
import re
import json
import hashlib
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field


# ═══════════════════════════════════════════════════════════════════════════════
# TRUSTED BACKENDS (Whitelist)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class TrustedHost:
    """A verified backend host."""
    hostname: str
    fingerprint: str  # SSH key fingerprint or API endpoint hash
    trust_level: int  # 1=full, 2=verified, 3=limited
    added: str
    last_verified: str = ""


# Hardcoded trusted hosts (sovereign infrastructure)
TRUSTED_HOSTS = {
    "cecilia": TrustedHost(
        hostname="cecilia",
        fingerprint="SHA256:blackroad-cecilia-hailo8",  # Replace with actual
        trust_level=1,
        added="2026-02-15"
    ),
    "lucidia": TrustedHost(
        hostname="lucidia",
        fingerprint="SHA256:blackroad-lucidia-pi5",
        trust_level=1,
        added="2026-02-15"
    ),
    "octavia": TrustedHost(
        hostname="octavia",
        fingerprint="SHA256:blackroad-octavia-pi5",
        trust_level=1,
        added="2026-02-15"
    ),
    "aria": TrustedHost(
        hostname="aria",
        fingerprint="SHA256:blackroad-aria-pi5",
        trust_level=1,
        added="2026-02-15"
    ),
    "alice": TrustedHost(
        hostname="alice",
        fingerprint="SHA256:blackroad-alice-pi4",
        trust_level=1,
        added="2026-02-15"
    ),
    "localhost": TrustedHost(
        hostname="localhost",
        fingerprint="local",
        trust_level=1,
        added="2026-02-15"
    ),
}


def verify_backend_host(hostname: str) -> Tuple[bool, str]:
    """
    Verify a backend host is trusted.
    Returns (is_trusted, reason).
    """
    # Local commands are always trusted
    if hostname in ("localhost", "127.0.0.1", "::1"):
        return True, "local"

    # Check whitelist
    if hostname in TRUSTED_HOSTS:
        host = TRUSTED_HOSTS[hostname]
        return True, f"trusted (level {host.trust_level})"

    # Unknown host - reject
    return False, f"unknown host: {hostname}"


def extract_host_from_command(cmd: List[str]) -> Optional[str]:
    """Extract target host from a command."""
    if not cmd:
        return None

    # SSH command
    if cmd[0] == "ssh" and len(cmd) > 1:
        # Handle ssh options, find the host
        for i, arg in enumerate(cmd[1:], 1):
            if not arg.startswith("-") and "=" not in arg:
                return arg

    # curl/API commands
    if cmd[0] == "curl":
        for arg in cmd:
            if arg.startswith("http"):
                # Extract domain
                import urllib.parse
                parsed = urllib.parse.urlparse(arg)
                return parsed.netloc

    # Local command
    return "localhost"


# ═══════════════════════════════════════════════════════════════════════════════
# INPUT SANITIZATION (Injection Prevention)
# ═══════════════════════════════════════════════════════════════════════════════

# Dangerous patterns that could be injection attempts
DANGEROUS_PATTERNS = [
    r';\s*rm\s+-rf',           # rm -rf injection
    r'\|\s*sh\b',              # pipe to shell
    r'\|\s*bash\b',            # pipe to bash
    r'`[^`]+`',                # backtick execution
    r'\$\([^)]+\)',            # command substitution
    r'>\s*/etc/',              # write to /etc
    r'>\s*/dev/',              # write to /dev
    r'curl\s+.*\|\s*sh',       # curl | sh pattern
    r'wget\s+.*\|\s*sh',       # wget | sh pattern
    r'eval\s*\(',              # eval injection
    r'exec\s*\(',              # exec injection
    r'__import__',             # Python import injection
    r'subprocess\.',           # subprocess injection
    r'os\.system',             # os.system injection
]

# Compiled patterns for performance
_DANGEROUS_RE = [re.compile(p, re.IGNORECASE) for p in DANGEROUS_PATTERNS]


def sanitize_input(text: str) -> Tuple[str, List[str]]:
    """
    Sanitize user input, removing dangerous patterns.
    Returns (sanitized_text, list_of_removed_patterns).
    """
    warnings = []

    for pattern in _DANGEROUS_RE:
        if pattern.search(text):
            warnings.append(f"blocked: {pattern.pattern}")
            text = pattern.sub("[BLOCKED]", text)

    return text, warnings


def is_safe_input(text: str) -> Tuple[bool, str]:
    """Check if input is safe without modifying it."""
    for pattern in _DANGEROUS_RE:
        if pattern.search(text):
            return False, f"dangerous pattern: {pattern.pattern}"
    return True, "ok"


# ═══════════════════════════════════════════════════════════════════════════════
# SECRET FILTERING (Output Redaction)
# ═══════════════════════════════════════════════════════════════════════════════

# Patterns that look like secrets
SECRET_PATTERNS = [
    (r'sk-[a-zA-Z0-9]{32,}', "API_KEY"),              # OpenAI-style
    (r'sk-ant-[a-zA-Z0-9-]{32,}', "ANTHROPIC_KEY"),   # Anthropic
    (r'ghp_[a-zA-Z0-9]{36}', "GITHUB_TOKEN"),         # GitHub PAT
    (r'gho_[a-zA-Z0-9]{36}', "GITHUB_OAUTH"),         # GitHub OAuth
    (r'glpat-[a-zA-Z0-9-]{20}', "GITLAB_TOKEN"),      # GitLab
    (r'xox[baprs]-[a-zA-Z0-9-]+', "SLACK_TOKEN"),     # Slack
    (r'-----BEGIN [A-Z]+ PRIVATE KEY-----', "PRIVATE_KEY"),
    (r'AKIA[0-9A-Z]{16}', "AWS_ACCESS_KEY"),          # AWS
    (r'[a-zA-Z0-9]{32}\.apps\.googleusercontent\.com', "GOOGLE_CLIENT"),
    (r'password\s*[=:]\s*["\']?[^\s"\']+', "PASSWORD"),
    (r'secret\s*[=:]\s*["\']?[^\s"\']+', "SECRET"),
    (r'token\s*[=:]\s*["\']?[^\s"\']+', "TOKEN"),
]

_SECRET_RE = [(re.compile(p, re.IGNORECASE), name) for p, name in SECRET_PATTERNS]


def redact_secrets(text: str) -> Tuple[str, int]:
    """
    Redact secrets from output text.
    Returns (redacted_text, count_of_redactions).
    """
    count = 0
    for pattern, name in _SECRET_RE:
        matches = pattern.findall(text)
        if matches:
            count += len(matches)
            text = pattern.sub(f"[REDACTED:{name}]", text)
    return text, count


# ═══════════════════════════════════════════════════════════════════════════════
# AUDIT LOGGING
# ═══════════════════════════════════════════════════════════════════════════════

AUDIT_LOG_DIR = Path.home() / ".lucidia" / "audit"


@dataclass
class AuditEntry:
    """A single audit log entry."""
    timestamp: str
    event_type: str  # input, output, backend_start, backend_stop, security_warning
    backend: str
    content_hash: str  # SHA256 of content (not content itself for privacy)
    metadata: Dict = field(default_factory=dict)


class AuditLog:
    """Append-only audit log for Lucidia interactions."""

    def __init__(self, session_id: str = None):
        self.session_id = session_id or datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_dir = AUDIT_LOG_DIR
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = self.log_dir / f"session_{self.session_id}.jsonl"
        self.entries: List[AuditEntry] = []

    def _hash_content(self, content: str) -> str:
        """Hash content for privacy-preserving logging."""
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def log(self, event_type: str, backend: str, content: str = "",
            metadata: Dict = None) -> None:
        """Log an event."""
        entry = AuditEntry(
            timestamp=datetime.now().isoformat(),
            event_type=event_type,
            backend=backend,
            content_hash=self._hash_content(content),
            metadata=metadata or {}
        )
        self.entries.append(entry)

        # Append to file
        with open(self.log_file, "a") as f:
            f.write(json.dumps({
                "timestamp": entry.timestamp,
                "event_type": entry.event_type,
                "backend": entry.backend,
                "content_hash": entry.content_hash,
                "metadata": entry.metadata
            }) + "\n")

    def log_input(self, backend: str, user_input: str) -> None:
        """Log user input."""
        self.log("input", backend, user_input, {
            "length": len(user_input),
            "word_count": len(user_input.split())
        })

    def log_output(self, backend: str, output: str) -> None:
        """Log backend output."""
        self.log("output", backend, output, {
            "length": len(output),
            "line_count": output.count("\n") + 1
        })

    def log_security(self, event: str, details: Dict) -> None:
        """Log security event."""
        self.log("security", "lucidia", event, details)

    def get_session_stats(self) -> Dict:
        """Get statistics for this session."""
        return {
            "session_id": self.session_id,
            "total_events": len(self.entries),
            "inputs": sum(1 for e in self.entries if e.event_type == "input"),
            "outputs": sum(1 for e in self.entries if e.event_type == "output"),
            "security_events": sum(1 for e in self.entries if e.event_type == "security"),
        }


# ═══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class RateLimiter:
    """Simple rate limiter for abuse prevention."""
    max_requests: int = 60       # Max requests per window
    window_seconds: int = 60     # Window size
    requests: List[float] = field(default_factory=list)

    def is_allowed(self) -> Tuple[bool, str]:
        """Check if a request is allowed."""
        now = time.time()

        # Remove old requests outside window
        self.requests = [t for t in self.requests if now - t < self.window_seconds]

        if len(self.requests) >= self.max_requests:
            wait_time = self.window_seconds - (now - self.requests[0])
            return False, f"rate limited, wait {wait_time:.1f}s"

        self.requests.append(now)
        return True, "ok"

    def get_remaining(self) -> int:
        """Get remaining requests in current window."""
        now = time.time()
        self.requests = [t for t in self.requests if now - t < self.window_seconds]
        return max(0, self.max_requests - len(self.requests))


# ═══════════════════════════════════════════════════════════════════════════════
# SANDBOX BOUNDARIES
# ═══════════════════════════════════════════════════════════════════════════════

# Paths that should never be accessed by backends
FORBIDDEN_PATHS = [
    "/etc/shadow",
    "/etc/passwd",
    "/etc/sudoers",
    "~/.ssh/id_rsa",
    "~/.ssh/id_ed25519",
    "~/.gnupg/",
    "~/.aws/credentials",
    "~/.config/gh/hosts.yml",
    "~/.anthropic/",
]

# Expand ~ in paths
FORBIDDEN_PATHS_EXPANDED = [
    os.path.expanduser(p) for p in FORBIDDEN_PATHS
]


def is_path_allowed(path: str) -> Tuple[bool, str]:
    """Check if a file path is allowed to be accessed."""
    expanded = os.path.expanduser(os.path.abspath(path))

    for forbidden in FORBIDDEN_PATHS_EXPANDED:
        if expanded.startswith(forbidden) or expanded == forbidden:
            return False, f"forbidden path: {path}"

    return True, "ok"


def check_output_for_paths(output: str) -> List[str]:
    """Check output for forbidden path references."""
    warnings = []
    for forbidden in FORBIDDEN_PATHS:
        if forbidden in output or os.path.expanduser(forbidden) in output:
            warnings.append(f"output contains forbidden path: {forbidden}")
    return warnings


# ═══════════════════════════════════════════════════════════════════════════════
# SECURITY CONTEXT (Combines all security features)
# ═══════════════════════════════════════════════════════════════════════════════

class SecurityContext:
    """
    Central security context for a Lucidia session.
    Combines all security features into one interface.
    """

    def __init__(self, session_id: str = None):
        self.audit = AuditLog(session_id)
        self.rate_limiter = RateLimiter()
        self.warnings: List[str] = []
        self.blocked_count = 0

    def check_backend(self, cmd: List[str]) -> Tuple[bool, str]:
        """Verify backend command is safe to execute."""
        host = extract_host_from_command(cmd)
        if host:
            trusted, reason = verify_backend_host(host)
            if not trusted:
                self.audit.log_security("untrusted_backend", {
                    "host": host,
                    "command": cmd[0] if cmd else "unknown"
                })
                self.blocked_count += 1
                return False, reason
        return True, "ok"

    def check_input(self, text: str) -> Tuple[bool, str, str]:
        """
        Check and sanitize user input.
        Returns (is_safe, sanitized_text, warning).
        """
        # Rate limit check
        allowed, reason = self.rate_limiter.is_allowed()
        if not allowed:
            self.audit.log_security("rate_limited", {"reason": reason})
            return False, text, reason

        # Sanitize
        sanitized, warnings = sanitize_input(text)
        if warnings:
            self.audit.log_security("input_sanitized", {"warnings": warnings})
            self.warnings.extend(warnings)
            return True, sanitized, "; ".join(warnings)

        return True, text, ""

    def filter_output(self, output: str) -> Tuple[str, List[str]]:
        """
        Filter output for secrets and forbidden content.
        Returns (filtered_output, warnings).
        """
        warnings = []

        # Redact secrets
        filtered, redact_count = redact_secrets(output)
        if redact_count > 0:
            warnings.append(f"redacted {redact_count} secret(s)")
            self.audit.log_security("secrets_redacted", {"count": redact_count})

        # Check for forbidden paths
        path_warnings = check_output_for_paths(filtered)
        if path_warnings:
            warnings.extend(path_warnings)
            self.audit.log_security("forbidden_paths_in_output", {
                "warnings": path_warnings
            })

        return filtered, warnings

    def get_status(self) -> Dict:
        """Get security status summary."""
        return {
            "session_stats": self.audit.get_session_stats(),
            "rate_limit_remaining": self.rate_limiter.get_remaining(),
            "warnings": len(self.warnings),
            "blocked": self.blocked_count,
        }
