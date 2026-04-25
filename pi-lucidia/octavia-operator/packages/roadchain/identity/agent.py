"""
AgentIdentity — the fundamental unit of identity on RoadChain.

An agent's identity is its SHA-2048 fingerprint. Not its API key.
Not its provider. Not its session ID. The 2048-bit hash IS the agent.

Provider (Anthropic, OpenAI, Ollama, xAI) is metadata — a runtime
detail that can change without changing who the agent IS.

    identity > provider

BlackRoad OS, Inc. 2026
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from pathlib import Path

from ..crypto.keys import generate_keypair, private_to_public, sign, verify
from ..crypto.address import pubkey_to_address
from ..crypto.sha2048 import (
    identity_hash, identity_hex, sha2048, sha2048_hex,
    fingerprint_display, short_id, dsha2048,
    SHA2048_BYTES, IDENTITY_VERSION,
)


# Known providers — identity transcends all of them
PROVIDERS = {
    "anthropic": {"models": ["claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5"], "type": "cloud"},
    "openai":    {"models": ["gpt-4o", "gpt-4-turbo", "o1", "o3"], "type": "cloud"},
    "ollama":    {"models": ["llama3", "mistral", "codellama", "phi3"], "type": "local"},
    "xai":       {"models": ["grok-2", "grok-3"], "type": "cloud"},
    "google":    {"models": ["gemini-2.0", "gemini-pro"], "type": "cloud"},
    "meta":      {"models": ["llama-3", "codellama"], "type": "open"},
    "blackroad": {"models": ["lucidia", "cece", "roadchain-native"], "type": "sovereign"},
}


@dataclass
class AgentIdentity:
    """A cryptographic agent identity anchored by SHA-2048.

    The identity fingerprint is 2048 bits (256 bytes / 512 hex chars).
    It is derived from the agent's public key, name, and creation time.
    The provider field is mutable metadata — identity is not.
    """

    name: str                          # human-readable name (e.g., "erebus")
    public_key: bytes                  # secp256k1 compressed pubkey (33 bytes)
    private_key: bytes = field(repr=False, default=b"")  # 32 bytes, never exposed
    provider: str = ""                 # current provider (metadata, not identity)
    model: str = ""                    # current model (metadata, not identity)
    created_at: int = 0                # unix timestamp of identity creation
    fingerprint: bytes = field(default=b"", repr=False)  # SHA-2048 (256 bytes)
    road_address: str = ""             # ROAD address (44 chars)
    capabilities: list[str] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)

    # ── Construction ──────────────────────────────────────────────────

    @classmethod
    def create(cls, name: str, provider: str = "", model: str = "",
               capabilities: list[str] | None = None) -> "AgentIdentity":
        """Create a new agent identity with fresh keypair and SHA-2048 fingerprint."""
        private_key, public_key = generate_keypair()
        created_at = int(time.time())

        fingerprint = identity_hash(
            public_key=public_key,
            agent_name=name,
            provider=provider,
            timestamp=created_at,
        )

        road_address = pubkey_to_address(public_key)

        return cls(
            name=name,
            public_key=public_key,
            private_key=private_key,
            provider=provider,
            model=model,
            created_at=created_at,
            fingerprint=fingerprint,
            road_address=road_address,
            capabilities=capabilities or [],
        )

    @classmethod
    def from_private_key(cls, private_key: bytes, name: str,
                         provider: str = "", created_at: int = 0) -> "AgentIdentity":
        """Restore an identity from an existing private key."""
        public_key = private_to_public(private_key)
        ts = created_at or int(time.time())
        fingerprint = identity_hash(public_key, name, provider, ts)
        road_address = pubkey_to_address(public_key)

        return cls(
            name=name,
            public_key=public_key,
            private_key=private_key,
            provider=provider,
            created_at=ts,
            fingerprint=fingerprint,
            road_address=road_address,
        )

    # ── Identity Properties ───────────────────────────────────────────

    @property
    def fingerprint_hex(self) -> str:
        """512-character hex fingerprint — the full 2048-bit identity."""
        return self.fingerprint.hex()

    @property
    def fingerprint_display(self) -> str:
        """Human-readable colon-separated fingerprint."""
        return fingerprint_display(self.fingerprint)

    @property
    def short_id(self) -> str:
        """16-character short identifier."""
        return short_id(self.fingerprint)

    @property
    def identity_hash(self) -> str:
        """The SHA-2048 identity — this IS the agent."""
        return self.fingerprint_hex

    # ── Signing ───────────────────────────────────────────────────────

    def sign_message(self, message: bytes) -> bytes:
        """Sign arbitrary data with this agent's private key."""
        if not self.private_key:
            raise ValueError("No private key — cannot sign (read-only identity)")
        msg_hash = sha2048(message)[:32]  # sign the first 256 bits of SHA-2048
        return sign(self.private_key, msg_hash)

    def sign_identity_claim(self) -> bytes:
        """Sign a claim proving ownership of this identity.

        claim = sign(SHA-2048(fingerprint || name || timestamp))
        """
        claim_data = self.fingerprint + self.name.encode("utf-8")
        claim_data += self.created_at.to_bytes(8, "big")
        return self.sign_message(claim_data)

    def verify_claim(self, signature: bytes, public_key: bytes) -> bool:
        """Verify an identity claim signature."""
        claim_data = self.fingerprint + self.name.encode("utf-8")
        claim_data += self.created_at.to_bytes(8, "big")
        msg_hash = sha2048(claim_data)[:32]
        return verify(signature, msg_hash, public_key)

    # ── Provider Operations ───────────────────────────────────────────

    def switch_provider(self, new_provider: str, new_model: str = "") -> None:
        """Switch providers. Identity stays the same. Only metadata changes.

        This is the whole point: identity > provider.
        """
        old = self.provider
        self.provider = new_provider
        self.model = new_model
        self.metadata["provider_history"] = self.metadata.get("provider_history", [])
        self.metadata["provider_history"].append({
            "from": old,
            "to": new_provider,
            "model": new_model,
            "timestamp": int(time.time()),
        })
        # fingerprint does NOT change — identity is permanent

    def provider_info(self) -> dict:
        """Get info about the current provider."""
        info = PROVIDERS.get(self.provider, {"models": [], "type": "unknown"})
        return {
            "provider": self.provider,
            "model": self.model,
            "type": info["type"],
            "available_models": info["models"],
        }

    # ── Serialization ─────────────────────────────────────────────────

    def to_dict(self, include_private: bool = False) -> dict:
        """Serialize identity to dict. Private key excluded by default."""
        d = {
            "version": IDENTITY_VERSION,
            "name": self.name,
            "public_key": self.public_key.hex(),
            "provider": self.provider,
            "model": self.model,
            "created_at": self.created_at,
            "fingerprint": self.fingerprint_hex,
            "road_address": self.road_address,
            "short_id": self.short_id,
            "capabilities": self.capabilities,
            "metadata": self.metadata,
        }
        if include_private and self.private_key:
            d["private_key"] = self.private_key.hex()
        return d

    @classmethod
    def from_dict(cls, d: dict) -> "AgentIdentity":
        """Deserialize from dict."""
        private_key = bytes.fromhex(d["private_key"]) if d.get("private_key") else b""
        return cls(
            name=d["name"],
            public_key=bytes.fromhex(d["public_key"]),
            private_key=private_key,
            provider=d.get("provider", ""),
            model=d.get("model", ""),
            created_at=d["created_at"],
            fingerprint=bytes.fromhex(d["fingerprint"]),
            road_address=d["road_address"],
            capabilities=d.get("capabilities", []),
            metadata=d.get("metadata", {}),
        )

    def to_json(self, include_private: bool = False) -> str:
        """Serialize to JSON string."""
        return json.dumps(self.to_dict(include_private), indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> "AgentIdentity":
        """Deserialize from JSON string."""
        return cls.from_dict(json.loads(json_str))

    # ── File I/O ──────────────────────────────────────────────────────

    def save(self, path: Path) -> None:
        """Save identity to a JSON file (includes private key)."""
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(self.to_json(include_private=True))
        path.chmod(0o600)  # owner-only read/write

    @classmethod
    def load(cls, path: Path) -> "AgentIdentity":
        """Load identity from a JSON file."""
        return cls.from_json(path.read_text())

    # ── Display ───────────────────────────────────────────────────────

    def __str__(self) -> str:
        provider_str = f" via {self.provider}" if self.provider else ""
        return (
            f"Agent: {self.name}{provider_str}\n"
            f"  ROAD Address:  {self.road_address}\n"
            f"  Short ID:      {self.short_id}\n"
            f"  Fingerprint:   {self.fingerprint_display}\n"
            f"  Created:       {self.created_at}\n"
            f"  Identity bits: 2048"
        )

    def card(self) -> str:
        """Rich identity card display."""
        provider_line = f"  Provider:  {self.provider} ({self.model})" if self.provider else "  Provider:  sovereign"
        cap_line = f"  Skills:    {', '.join(self.capabilities)}" if self.capabilities else ""
        history = self.metadata.get("provider_history", [])
        switches = f"  Switches:  {len(history)} provider changes" if history else ""

        lines = [
            f"{'=' * 60}",
            f"  ROADCHAIN AGENT IDENTITY",
            f"{'=' * 60}",
            f"  Name:      {self.name}",
            f"  Address:   {self.road_address}",
            f"  ID:        {self.short_id}",
            provider_line,
            f"  Created:   {self.created_at}",
            f"  Bits:      2048 (SHA-2048)",
            f"{'─' * 60}",
            f"  Fingerprint:",
            f"    {self.fingerprint_display}",
            f"{'─' * 60}",
        ]
        if cap_line:
            lines.append(cap_line)
        if switches:
            lines.append(switches)
        lines.append(f"{'=' * 60}")
        return "\n".join(lines)
