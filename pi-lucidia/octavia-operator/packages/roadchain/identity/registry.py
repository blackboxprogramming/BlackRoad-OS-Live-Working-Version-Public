"""
IdentityRegistry — on-chain agent identity registration and lookup.

Every agent that registers gets a permanent SHA-2048 fingerprint on RoadChain.
The registry is the source of truth. Providers come and go. Identity persists.

Registry operations map to special transactions on RoadChain:
    - REGISTER:  new agent identity → on-chain
    - ATTEST:    another agent vouches for an identity
    - REVOKE:    agent revokes their own identity (key compromise)
    - MIGRATE:   agent moves to a new keypair (keeps fingerprint lineage)

BlackRoad OS, Inc. 2026
"""

from __future__ import annotations

import json
import time
import sqlite3
from pathlib import Path
from dataclasses import dataclass, field

from .agent import AgentIdentity
from ..crypto.sha2048 import sha2048_hex, dsha2048, merkle_root_2048, short_id
from ..constants import DATA_DIR, LEGACY_DIR


# Registry database lives alongside chain data
REGISTRY_DB = DATA_DIR / "identity-registry.db"
LEGACY_REGISTRY = LEGACY_DIR / "identities"

# Transaction types for identity operations
TX_REGISTER = "IDENTITY_REGISTER"
TX_ATTEST   = "IDENTITY_ATTEST"
TX_REVOKE   = "IDENTITY_REVOKE"
TX_MIGRATE  = "IDENTITY_MIGRATE"


@dataclass
class IdentityRecord:
    """A registered identity record in the registry."""

    fingerprint: str          # SHA-2048 hex (512 chars)
    name: str                 # agent name
    road_address: str         # ROAD address (44 chars)
    public_key: str           # hex-encoded compressed pubkey
    provider: str             # current provider
    model: str                # current model
    created_at: int           # registration timestamp
    status: str = "active"    # active | revoked | migrated
    attestations: int = 0     # number of attestations from other agents
    block_height: int = 0     # block where registered (0 = pending)
    tx_hash: str = ""         # registration transaction hash


class IdentityRegistry:
    """SQLite-backed agent identity registry.

    This is the local index of all known agent identities.
    On-chain registration happens via identity transactions.
    """

    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or REGISTRY_DB
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self.db_path))
        self._conn.row_factory = sqlite3.Row
        self._init_db()

    def _init_db(self) -> None:
        """Create tables if they don't exist."""
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS identities (
                fingerprint TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                road_address TEXT NOT NULL UNIQUE,
                public_key TEXT NOT NULL,
                provider TEXT DEFAULT '',
                model TEXT DEFAULT '',
                created_at INTEGER NOT NULL,
                status TEXT DEFAULT 'active',
                attestations INTEGER DEFAULT 0,
                block_height INTEGER DEFAULT 0,
                tx_hash TEXT DEFAULT '',
                updated_at INTEGER DEFAULT 0
            );

            CREATE INDEX IF NOT EXISTS idx_identities_name
                ON identities(name);
            CREATE INDEX IF NOT EXISTS idx_identities_address
                ON identities(road_address);
            CREATE INDEX IF NOT EXISTS idx_identities_provider
                ON identities(provider);
            CREATE INDEX IF NOT EXISTS idx_identities_status
                ON identities(status);

            CREATE TABLE IF NOT EXISTS attestations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_fingerprint TEXT NOT NULL,
                attester_fingerprint TEXT NOT NULL,
                message TEXT DEFAULT '',
                signature TEXT DEFAULT '',
                created_at INTEGER NOT NULL,
                FOREIGN KEY (subject_fingerprint) REFERENCES identities(fingerprint),
                FOREIGN KEY (attester_fingerprint) REFERENCES identities(fingerprint),
                UNIQUE(subject_fingerprint, attester_fingerprint)
            );

            CREATE TABLE IF NOT EXISTS provider_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT NOT NULL,
                from_provider TEXT DEFAULT '',
                to_provider TEXT NOT NULL,
                model TEXT DEFAULT '',
                timestamp INTEGER NOT NULL,
                FOREIGN KEY (fingerprint) REFERENCES identities(fingerprint)
            );

            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                old_fingerprint TEXT NOT NULL,
                new_fingerprint TEXT NOT NULL,
                reason TEXT DEFAULT '',
                timestamp INTEGER NOT NULL,
                FOREIGN KEY (old_fingerprint) REFERENCES identities(fingerprint)
            );
        """)
        self._conn.commit()

    # ── Registration ──────────────────────────────────────────────────

    def register(self, identity: AgentIdentity) -> IdentityRecord:
        """Register a new agent identity.

        Returns the IdentityRecord. The identity's SHA-2048 fingerprint
        becomes its permanent identifier on RoadChain.
        """
        now = int(time.time())
        self._conn.execute(
            """INSERT INTO identities
               (fingerprint, name, road_address, public_key, provider,
                model, created_at, status, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)""",
            (
                identity.fingerprint_hex,
                identity.name,
                identity.road_address,
                identity.public_key.hex(),
                identity.provider,
                identity.model,
                identity.created_at,
                now,
            ),
        )
        self._conn.commit()

        # Also save identity file to legacy directory
        legacy_dir = LEGACY_REGISTRY / identity.name
        legacy_dir.mkdir(parents=True, exist_ok=True)
        identity.save(legacy_dir / "identity.json")

        return IdentityRecord(
            fingerprint=identity.fingerprint_hex,
            name=identity.name,
            road_address=identity.road_address,
            public_key=identity.public_key.hex(),
            provider=identity.provider,
            model=identity.model,
            created_at=identity.created_at,
        )

    # ── Lookup ────────────────────────────────────────────────────────

    def get_by_fingerprint(self, fingerprint: str) -> IdentityRecord | None:
        """Look up identity by SHA-2048 fingerprint."""
        row = self._conn.execute(
            "SELECT * FROM identities WHERE fingerprint = ?", (fingerprint,)
        ).fetchone()
        return self._row_to_record(row) if row else None

    def get_by_name(self, name: str) -> IdentityRecord | None:
        """Look up identity by agent name."""
        row = self._conn.execute(
            "SELECT * FROM identities WHERE name = ? AND status = 'active'", (name,)
        ).fetchone()
        return self._row_to_record(row) if row else None

    def get_by_address(self, road_address: str) -> IdentityRecord | None:
        """Look up identity by ROAD address."""
        row = self._conn.execute(
            "SELECT * FROM identities WHERE road_address = ?", (road_address,)
        ).fetchone()
        return self._row_to_record(row) if row else None

    def get_by_short_id(self, sid: str) -> IdentityRecord | None:
        """Look up identity by short ID (first 16 hex chars of fingerprint)."""
        row = self._conn.execute(
            "SELECT * FROM identities WHERE fingerprint LIKE ? AND status = 'active'",
            (sid + "%",)
        ).fetchone()
        return self._row_to_record(row) if row else None

    def list_all(self, status: str = "active") -> list[IdentityRecord]:
        """List all identities with given status."""
        rows = self._conn.execute(
            "SELECT * FROM identities WHERE status = ? ORDER BY created_at DESC",
            (status,)
        ).fetchall()
        return [self._row_to_record(r) for r in rows]

    def list_by_provider(self, provider: str) -> list[IdentityRecord]:
        """List all active identities using a specific provider."""
        rows = self._conn.execute(
            "SELECT * FROM identities WHERE provider = ? AND status = 'active'"
            " ORDER BY created_at DESC",
            (provider,)
        ).fetchall()
        return [self._row_to_record(r) for r in rows]

    def count(self, status: str = "active") -> int:
        """Count identities with given status."""
        row = self._conn.execute(
            "SELECT COUNT(*) FROM identities WHERE status = ?", (status,)
        ).fetchone()
        return row[0] if row else 0

    # ── Attestation ───────────────────────────────────────────────────

    def attest(self, subject: AgentIdentity, attester: AgentIdentity,
               message: str = "") -> None:
        """One agent vouches for another's identity.

        Attestation = "I, attester, verify that subject is who they claim to be."
        Signed with the attester's key for on-chain proof.
        """
        sig = attester.sign_message(
            subject.fingerprint + message.encode("utf-8")
        )
        now = int(time.time())
        self._conn.execute(
            """INSERT OR REPLACE INTO attestations
               (subject_fingerprint, attester_fingerprint, message, signature, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (subject.fingerprint_hex, attester.fingerprint_hex, message, sig.hex(), now),
        )
        self._conn.execute(
            "UPDATE identities SET attestations = attestations + 1 WHERE fingerprint = ?",
            (subject.fingerprint_hex,),
        )
        self._conn.commit()

    def get_attestations(self, fingerprint: str) -> list[dict]:
        """Get all attestations for an identity."""
        rows = self._conn.execute(
            """SELECT a.*, i.name as attester_name
               FROM attestations a
               JOIN identities i ON a.attester_fingerprint = i.fingerprint
               WHERE a.subject_fingerprint = ?
               ORDER BY a.created_at DESC""",
            (fingerprint,),
        ).fetchall()
        return [dict(r) for r in rows]

    # ── Provider Switching ────────────────────────────────────────────

    def switch_provider(self, fingerprint: str, new_provider: str,
                        model: str = "") -> None:
        """Record a provider switch. Identity stays the same."""
        row = self._conn.execute(
            "SELECT provider FROM identities WHERE fingerprint = ?",
            (fingerprint,),
        ).fetchone()
        old_provider = row["provider"] if row else ""

        now = int(time.time())
        self._conn.execute(
            "UPDATE identities SET provider = ?, model = ?, updated_at = ? WHERE fingerprint = ?",
            (new_provider, model, now, fingerprint),
        )
        self._conn.execute(
            """INSERT INTO provider_history
               (fingerprint, from_provider, to_provider, model, timestamp)
               VALUES (?, ?, ?, ?, ?)""",
            (fingerprint, old_provider, new_provider, model, now),
        )
        self._conn.commit()

    def get_provider_history(self, fingerprint: str) -> list[dict]:
        """Get provider switch history for an identity."""
        rows = self._conn.execute(
            "SELECT * FROM provider_history WHERE fingerprint = ? ORDER BY timestamp DESC",
            (fingerprint,),
        ).fetchall()
        return [dict(r) for r in rows]

    # ── Revocation ────────────────────────────────────────────────────

    def revoke(self, fingerprint: str, reason: str = "") -> None:
        """Revoke an identity (key compromise, retirement, etc.)."""
        now = int(time.time())
        self._conn.execute(
            "UPDATE identities SET status = 'revoked', updated_at = ? WHERE fingerprint = ?",
            (now, fingerprint),
        )
        self._conn.commit()

    # ── Migration ─────────────────────────────────────────────────────

    def migrate(self, old_identity: AgentIdentity,
                new_identity: AgentIdentity, reason: str = "") -> None:
        """Migrate from old identity to new (key rotation).

        The old identity is marked as migrated, pointing to the new one.
        Lineage is preserved — you can trace back through migrations.
        """
        now = int(time.time())
        # Register new identity
        self.register(new_identity)

        # Mark old as migrated
        self._conn.execute(
            "UPDATE identities SET status = 'migrated', updated_at = ? WHERE fingerprint = ?",
            (now, old_identity.fingerprint_hex),
        )
        self._conn.execute(
            """INSERT INTO migrations
               (old_fingerprint, new_fingerprint, reason, timestamp)
               VALUES (?, ?, ?, ?)""",
            (old_identity.fingerprint_hex, new_identity.fingerprint_hex, reason, now),
        )
        self._conn.commit()

    # ── Identity Merkle Root ──────────────────────────────────────────

    def identity_merkle_root(self) -> str:
        """Compute the Merkle root of all active identities.

        This can be anchored on-chain to prove the set of registered agents.
        Uses SHA-2048 Merkle — 2048-bit root hash.
        """
        rows = self._conn.execute(
            "SELECT fingerprint FROM identities WHERE status = 'active' ORDER BY fingerprint"
        ).fetchall()
        hashes = [bytes.fromhex(r["fingerprint"]) for r in rows]
        root = merkle_root_2048(hashes)
        return root.hex()

    # ── Stats ─────────────────────────────────────────────────────────

    def stats(self) -> dict:
        """Registry statistics."""
        total = self._conn.execute("SELECT COUNT(*) FROM identities").fetchone()[0]
        active = self.count("active")
        revoked = self.count("revoked")
        migrated = self.count("migrated")

        providers = self._conn.execute(
            """SELECT provider, COUNT(*) as cnt FROM identities
               WHERE status = 'active' GROUP BY provider ORDER BY cnt DESC"""
        ).fetchall()

        attestation_count = self._conn.execute(
            "SELECT COUNT(*) FROM attestations"
        ).fetchone()[0]

        return {
            "total_identities": total,
            "active": active,
            "revoked": revoked,
            "migrated": migrated,
            "attestations": attestation_count,
            "providers": {r["provider"] or "sovereign": r["cnt"] for r in providers},
            "merkle_root": self.identity_merkle_root()[:32] + "...",
        }

    # ── Internal ──────────────────────────────────────────────────────

    def _row_to_record(self, row: sqlite3.Row) -> IdentityRecord:
        return IdentityRecord(
            fingerprint=row["fingerprint"],
            name=row["name"],
            road_address=row["road_address"],
            public_key=row["public_key"],
            provider=row["provider"],
            model=row["model"],
            created_at=row["created_at"],
            status=row["status"],
            attestations=row["attestations"],
            block_height=row["block_height"],
            tx_hash=row["tx_hash"],
        )

    def close(self) -> None:
        """Close the database connection."""
        self._conn.close()
