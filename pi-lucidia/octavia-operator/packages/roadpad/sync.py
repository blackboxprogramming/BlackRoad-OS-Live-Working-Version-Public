"""
RoadPad Network Sync - Synchronize across Pi fleet.

Features:
- Buffer sync (collaborative editing)
- Settings sync
- Clipboard sync
- Session handoff
"""

import os
import json
import socket
import threading
import subprocess
from dataclasses import dataclass, field
from typing import Dict, List, Callable, Any
from datetime import datetime
import hashlib


@dataclass
class SyncPeer:
    """A peer in the sync network."""
    hostname: str
    ip: str = ""
    port: int = 7777
    last_seen: str = ""
    status: str = "unknown"  # online, offline, syncing
    version: str = ""

    @property
    def address(self) -> str:
        return f"{self.ip or self.hostname}:{self.port}"


@dataclass
class SyncMessage:
    """A sync message."""
    type: str  # 'buffer', 'clipboard', 'settings', 'ping', 'session'
    source: str
    timestamp: str
    payload: Dict[str, Any] = field(default_factory=dict)
    checksum: str = ""

    def to_json(self) -> str:
        return json.dumps({
            "type": self.type,
            "source": self.source,
            "timestamp": self.timestamp,
            "payload": self.payload,
            "checksum": self.checksum
        })

    @classmethod
    def from_json(cls, data: str) -> "SyncMessage":
        d = json.loads(data)
        return cls(**d)

    def compute_checksum(self) -> str:
        content = json.dumps(self.payload, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()[:8]


class PeerDiscovery:
    """Discovers peers on the network."""

    # Known Pi fleet
    KNOWN_PEERS = [
        SyncPeer("cecilia", "192.168.4.89"),
        SyncPeer("lucidia", "192.168.4.81"),
        SyncPeer("octavia", "192.168.4.38"),
        SyncPeer("alice", "192.168.4.49"),
        SyncPeer("aria", "192.168.4.82"),
    ]

    def __init__(self):
        self.peers: Dict[str, SyncPeer] = {}
        self.local_hostname = socket.gethostname()

    def discover(self, timeout: float = 1.0) -> List[SyncPeer]:
        """Discover online peers."""
        online = []

        for peer in self.KNOWN_PEERS:
            if peer.hostname == self.local_hostname:
                continue

            # Try SSH ping
            try:
                result = subprocess.run(
                    ["ssh", "-o", "ConnectTimeout=1", "-o", "BatchMode=yes",
                     peer.hostname, "echo ok"],
                    capture_output=True,
                    timeout=timeout + 1
                )
                if result.returncode == 0:
                    peer.status = "online"
                    peer.last_seen = datetime.now().isoformat()
                    online.append(peer)
                    self.peers[peer.hostname] = peer
                else:
                    peer.status = "offline"
            except:
                peer.status = "offline"

        return online

    def get_peer(self, hostname: str) -> SyncPeer | None:
        """Get peer by hostname."""
        return self.peers.get(hostname)


class BufferSync:
    """Syncs buffer content between peers."""

    def __init__(self, sync_dir: str | None = None):
        self.sync_dir = sync_dir or os.path.expanduser("~/.roadpad/sync")
        os.makedirs(self.sync_dir, exist_ok=True)
        self.local_hostname = socket.gethostname()

    def push_buffer(self, peer: SyncPeer, filepath: str, content: str) -> bool:
        """Push buffer to peer."""
        try:
            # Create temp file
            temp_file = os.path.join(self.sync_dir, "buffer_sync.tmp")
            with open(temp_file, "w") as f:
                f.write(content)

            # SCP to peer
            remote_path = f"~/.roadpad/sync/incoming/{os.path.basename(filepath)}"
            result = subprocess.run(
                ["scp", "-q", temp_file, f"{peer.hostname}:{remote_path}"],
                capture_output=True,
                timeout=10
            )
            return result.returncode == 0
        except:
            return False

    def pull_buffer(self, peer: SyncPeer, filepath: str) -> str | None:
        """Pull buffer from peer."""
        try:
            temp_file = os.path.join(self.sync_dir, "buffer_pull.tmp")
            remote_path = filepath

            result = subprocess.run(
                ["scp", "-q", f"{peer.hostname}:{remote_path}", temp_file],
                capture_output=True,
                timeout=10
            )
            if result.returncode == 0:
                with open(temp_file, "r") as f:
                    return f.read()
        except:
            pass
        return None


class ClipboardSync:
    """Syncs clipboard between peers."""

    def __init__(self, sync_dir: str | None = None):
        self.sync_dir = sync_dir or os.path.expanduser("~/.roadpad/sync")
        os.makedirs(self.sync_dir, exist_ok=True)
        self.clipboard_file = os.path.join(self.sync_dir, "clipboard.txt")

    def set_clipboard(self, content: str) -> None:
        """Set local clipboard."""
        with open(self.clipboard_file, "w") as f:
            f.write(content)

    def get_clipboard(self) -> str:
        """Get local clipboard."""
        if os.path.exists(self.clipboard_file):
            with open(self.clipboard_file, "r") as f:
                return f.read()
        return ""

    def push_to_peer(self, peer: SyncPeer) -> bool:
        """Push clipboard to peer."""
        try:
            remote_path = "~/.roadpad/sync/clipboard.txt"
            result = subprocess.run(
                ["scp", "-q", self.clipboard_file, f"{peer.hostname}:{remote_path}"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False

    def pull_from_peer(self, peer: SyncPeer) -> str | None:
        """Pull clipboard from peer."""
        try:
            temp_file = os.path.join(self.sync_dir, "clipboard_pull.tmp")
            remote_path = "~/.roadpad/sync/clipboard.txt"

            result = subprocess.run(
                ["scp", "-q", f"{peer.hostname}:{remote_path}", temp_file],
                capture_output=True,
                timeout=5
            )
            if result.returncode == 0:
                with open(temp_file, "r") as f:
                    return f.read()
        except:
            pass
        return None


class SessionSync:
    """Syncs session/handoff between peers."""

    def __init__(self, sync_dir: str | None = None):
        self.sync_dir = sync_dir or os.path.expanduser("~/.roadpad/sync")
        os.makedirs(self.sync_dir, exist_ok=True)

    def export_session(self, session_data: Dict) -> str:
        """Export session to file."""
        filepath = os.path.join(self.sync_dir, "session_export.json")
        with open(filepath, "w") as f:
            json.dump(session_data, f, indent=2)
        return filepath

    def handoff_to_peer(self, peer: SyncPeer, session_data: Dict) -> bool:
        """Hand off session to peer."""
        try:
            export_file = self.export_session(session_data)
            remote_path = "~/.roadpad/sync/incoming_session.json"

            result = subprocess.run(
                ["scp", "-q", export_file, f"{peer.hostname}:{remote_path}"],
                capture_output=True,
                timeout=10
            )
            return result.returncode == 0
        except:
            return False

    def receive_handoff(self) -> Dict | None:
        """Check for incoming session handoff."""
        incoming = os.path.join(self.sync_dir, "incoming_session.json")
        if os.path.exists(incoming):
            try:
                with open(incoming, "r") as f:
                    data = json.load(f)
                # Move to processed
                processed = os.path.join(self.sync_dir, "last_session.json")
                os.rename(incoming, processed)
                return data
            except:
                pass
        return None


class SyncManager:
    """Manages all sync operations."""

    def __init__(self):
        self.discovery = PeerDiscovery()
        self.buffer_sync = BufferSync()
        self.clipboard_sync = ClipboardSync()
        self.session_sync = SessionSync()
        self.local_hostname = socket.gethostname()

        # Callbacks
        self.on_buffer_received: Callable[[str, str], None] | None = None
        self.on_clipboard_received: Callable[[str], None] | None = None
        self.on_session_received: Callable[[Dict], None] | None = None

    def discover_peers(self) -> List[SyncPeer]:
        """Discover online peers."""
        return self.discovery.discover()

    def push_buffer(self, filepath: str, content: str, peer: str | None = None) -> Dict[str, bool]:
        """Push buffer to peers."""
        results = {}

        if peer:
            p = self.discovery.get_peer(peer)
            if p:
                results[peer] = self.buffer_sync.push_buffer(p, filepath, content)
        else:
            # Push to all online peers
            for p in self.discovery.peers.values():
                if p.status == "online":
                    results[p.hostname] = self.buffer_sync.push_buffer(p, filepath, content)

        return results

    def push_clipboard(self, content: str, peer: str | None = None) -> Dict[str, bool]:
        """Push clipboard to peers."""
        self.clipboard_sync.set_clipboard(content)
        results = {}

        if peer:
            p = self.discovery.get_peer(peer)
            if p:
                results[peer] = self.clipboard_sync.push_to_peer(p)
        else:
            for p in self.discovery.peers.values():
                if p.status == "online":
                    results[p.hostname] = self.clipboard_sync.push_to_peer(p)

        return results

    def handoff_session(self, session_data: Dict, peer: str) -> bool:
        """Hand off session to specific peer."""
        p = self.discovery.get_peer(peer)
        if p:
            return self.session_sync.handoff_to_peer(p, session_data)
        return False

    def check_incoming(self) -> Dict[str, Any]:
        """Check for incoming sync data."""
        incoming = {}

        # Check session handoff
        session = self.session_sync.receive_handoff()
        if session:
            incoming["session"] = session
            if self.on_session_received:
                self.on_session_received(session)

        return incoming

    def format_status(self) -> str:
        """Format sync status for display."""
        lines = ["Network Sync", "=" * 40, ""]

        # Local info
        lines.append(f"Local: {self.local_hostname}")
        lines.append("")

        # Peers
        lines.append("[Peers]")
        peers = list(self.discovery.peers.values())
        if not peers:
            lines.append("  No peers discovered")
            lines.append("  Run :sync discover to find peers")
        else:
            for p in peers:
                status_icon = {"online": "+", "offline": "-", "syncing": "~"}.get(p.status, "?")
                lines.append(f"  {status_icon} {p.hostname} ({p.ip}) [{p.status}]")

        lines.append("")
        lines.append("[Commands]")
        lines.append("  :sync discover  - Find peers")
        lines.append("  :sync push      - Push buffer to peers")
        lines.append("  :sync clip      - Share clipboard")
        lines.append("  :sync handoff   - Hand session to peer")

        return "\n".join(lines)


# Global manager
_manager: SyncManager | None = None

def get_sync_manager() -> SyncManager:
    """Get global sync manager."""
    global _manager
    if _manager is None:
        _manager = SyncManager()
    return _manager
