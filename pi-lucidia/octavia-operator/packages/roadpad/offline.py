"""
Lucidia Offline Mode - Sovereign AI caching.

When backends are unavailable, Lucidia can still help using:
  1. Cached responses from previous conversations
  2. Fuzzy matching to find similar queries
  3. Local command execution for known patterns
"""

import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field


# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE CACHE
# ═══════════════════════════════════════════════════════════════════════════════

CACHE_DIR = Path.home() / ".lucidia" / "cache"


@dataclass
class CachedResponse:
    """A cached query-response pair."""
    query: str
    query_hash: str
    response: str
    backend: str
    created: str
    hits: int = 0
    category: str = "chat"


class ResponseCache:
    """
    Persistent cache for Lucidia responses.
    Enables offline operation with smart retrieval.
    """

    def __init__(self, max_entries: int = 1000):
        self.cache_dir = CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.cache_file = self.cache_dir / "responses.json"
        self.max_entries = max_entries
        self.entries: Dict[str, CachedResponse] = {}
        self._load()

    def _load(self):
        """Load cache from disk."""
        if self.cache_file.exists():
            try:
                with open(self.cache_file) as f:
                    data = json.load(f)
                    for key, entry in data.items():
                        self.entries[key] = CachedResponse(**entry)
            except:
                self.entries = {}

    def _save(self):
        """Save cache to disk."""
        data = {
            key: {
                "query": e.query,
                "query_hash": e.query_hash,
                "response": e.response,
                "backend": e.backend,
                "created": e.created,
                "hits": e.hits,
                "category": e.category
            }
            for key, e in self.entries.items()
        }
        with open(self.cache_file, "w") as f:
            json.dump(data, f, indent=2)

    def _hash(self, query: str) -> str:
        """Hash a query for lookup."""
        # Normalize: lowercase, strip whitespace, remove punctuation
        normalized = query.lower().strip()
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]

    def _normalize(self, query: str) -> str:
        """Normalize query for comparison."""
        return " ".join(query.lower().split())

    def cache(self, query: str, response: str, backend: str, category: str = "chat") -> None:
        """Cache a response."""
        query_hash = self._hash(query)

        self.entries[query_hash] = CachedResponse(
            query=query,
            query_hash=query_hash,
            response=response,
            backend=backend,
            created=datetime.now().isoformat(),
            hits=0,
            category=category
        )

        # Prune if over limit (remove oldest, least-hit entries)
        if len(self.entries) > self.max_entries:
            sorted_entries = sorted(
                self.entries.items(),
                key=lambda x: (x[1].hits, x[1].created)
            )
            for key, _ in sorted_entries[:len(self.entries) - self.max_entries]:
                del self.entries[key]

        self._save()

    def get(self, query: str) -> Optional[CachedResponse]:
        """Get exact match from cache."""
        query_hash = self._hash(query)
        if query_hash in self.entries:
            entry = self.entries[query_hash]
            entry.hits += 1
            self._save()
            return entry
        return None

    def search(self, query: str, threshold: float = 0.6) -> List[CachedResponse]:
        """
        Fuzzy search for similar queries.
        Returns matches sorted by similarity.
        """
        results = []
        query_words = set(self._normalize(query).split())

        for entry in self.entries.values():
            entry_words = set(self._normalize(entry.query).split())

            # Jaccard similarity
            if query_words and entry_words:
                intersection = len(query_words & entry_words)
                union = len(query_words | entry_words)
                similarity = intersection / union

                if similarity >= threshold:
                    results.append((similarity, entry))

        # Sort by similarity descending
        results.sort(key=lambda x: x[0], reverse=True)
        return [entry for _, entry in results[:5]]

    def get_stats(self) -> Dict:
        """Get cache statistics."""
        if not self.entries:
            return {"entries": 0, "total_hits": 0}

        return {
            "entries": len(self.entries),
            "total_hits": sum(e.hits for e in self.entries.values()),
            "categories": list(set(e.category for e in self.entries.values())),
            "backends": list(set(e.backend for e in self.entries.values())),
        }


# ═══════════════════════════════════════════════════════════════════════════════
# LOCAL COMMAND PATTERNS
# ═══════════════════════════════════════════════════════════════════════════════

# Patterns that Lucidia can handle locally without backends
LOCAL_PATTERNS = {
    # File operations
    r"list files": "ls -la",
    r"show files": "ls -la",
    r"what files": "ls -la",
    r"current directory": "pwd",
    r"where am i": "pwd",

    # Git
    r"git status": "git status",
    r"git log": "git log --oneline -10",
    r"git branch": "git branch -a",
    r"show branches": "git branch -a",

    # System
    r"disk space": "df -h",
    r"memory usage": "free -h 2>/dev/null || vm_stat",
    r"uptime": "uptime",
    r"date": "date",
    r"time": "date",

    # Network
    r"ip address": "hostname -I 2>/dev/null || ipconfig getifaddr en0",
    r"network interfaces": "ifconfig 2>/dev/null || ip addr",
}


def match_local_pattern(query: str) -> Optional[str]:
    """
    Check if query matches a local command pattern.
    Returns the command to execute, or None.
    """
    import re
    query_lower = query.lower()

    for pattern, command in LOCAL_PATTERNS.items():
        if re.search(pattern, query_lower):
            return command
    return None


def execute_local(command: str) -> Tuple[bool, str]:
    """Execute a local command safely."""
    import subprocess

    # Safety check - only allow read-only commands
    dangerous = ["rm", "mv", "cp", "chmod", "chown", "sudo", ">", ">>", "|"]
    if any(d in command for d in dangerous):
        return False, "blocked: potentially destructive command"

    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        output = result.stdout or result.stderr
        return True, output.strip()
    except subprocess.TimeoutExpired:
        return False, "command timed out"
    except Exception as e:
        return False, str(e)


# ═══════════════════════════════════════════════════════════════════════════════
# OFFLINE MODE HANDLER
# ═══════════════════════════════════════════════════════════════════════════════

class OfflineHandler:
    """
    Handles queries when backends are unavailable.
    Combines cached responses with local command execution.
    """

    def __init__(self):
        self.cache = ResponseCache()
        self.offline_responses = 0
        self.local_commands = 0

    def can_handle(self, query: str) -> bool:
        """Check if we can handle this query offline."""
        # Check cache
        if self.cache.get(query):
            return True

        # Check local patterns
        if match_local_pattern(query):
            return True

        # Check fuzzy cache matches
        if self.cache.search(query, threshold=0.7):
            return True

        return False

    def handle(self, query: str) -> Tuple[bool, str, str]:
        """
        Handle a query offline.
        Returns (success, response, source).
        """
        # 1. Check exact cache match
        cached = self.cache.get(query)
        if cached:
            self.offline_responses += 1
            return True, cached.response, f"cache ({cached.backend})"

        # 2. Check local command pattern
        command = match_local_pattern(query)
        if command:
            success, output = execute_local(command)
            if success:
                self.local_commands += 1
                return True, f"```\n{output}\n```", "local command"

        # 3. Check fuzzy cache matches
        similar = self.cache.search(query, threshold=0.6)
        if similar:
            best = similar[0]
            self.offline_responses += 1
            response = f"(Similar to: \"{best.query[:50]}...\")\n\n{best.response}"
            return True, response, f"fuzzy cache ({best.backend})"

        return False, "No cached response available", "none"

    def cache_response(self, query: str, response: str, backend: str, category: str = "chat"):
        """Store a response for future offline use."""
        self.cache.cache(query, response, backend, category)

    def get_stats(self) -> Dict:
        """Get offline mode statistics."""
        return {
            "cache": self.cache.get_stats(),
            "offline_responses": self.offline_responses,
            "local_commands": self.local_commands,
        }
