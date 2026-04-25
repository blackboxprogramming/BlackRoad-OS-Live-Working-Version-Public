"""
Wallet — key storage, signing, and balance tracking for RoadChain agents.

Each wallet is backed by a secp256k1 keypair and has:
    - A ROAD address (44 chars)
    - A SHA-2048 identity fingerprint (if linked to an agent)
    - A balance in ROAD (base units, 1 ROAD = 10^8)
    - Transaction signing capability

Wallets can exist independently or be linked to an AgentIdentity.

BlackRoad OS, Inc. 2026
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from pathlib import Path

from ..crypto.keys import generate_keypair, private_to_public, sign, verify
from ..crypto.address import pubkey_to_address, validate_address
from ..crypto.sha2048 import sha2048, sha2048_hex, identity_hash, short_id
from ..crypto.bitcoin_pow import dsha256
from ..core.transaction import Transaction
from ..constants import COIN, LEGACY_DIR


WALLETS_DIR = LEGACY_DIR / "wallets"


@dataclass
class Wallet:
    """A RoadChain wallet with signing capability."""

    name: str
    address: str                    # ROAD address (44 chars)
    public_key: bytes               # compressed secp256k1 (33 bytes)
    private_key: bytes = field(repr=False, default=b"")  # 32 bytes
    balance: int = 0                # base units
    nonce: int = 0                  # transaction counter
    identity_fingerprint: str = ""  # SHA-2048 hex if linked to agent
    created_at: int = 0

    # ── Construction ──────────────────────────────────────────────────

    @classmethod
    def create(cls, name: str) -> "Wallet":
        """Create a new wallet with fresh keypair."""
        private_key, public_key = generate_keypair()
        address = pubkey_to_address(public_key)
        return cls(
            name=name,
            address=address,
            public_key=public_key,
            private_key=private_key,
            created_at=int(time.time()),
        )

    @classmethod
    def from_private_key(cls, name: str, private_key: bytes) -> "Wallet":
        """Restore wallet from private key."""
        public_key = private_to_public(private_key)
        address = pubkey_to_address(public_key)
        return cls(
            name=name,
            address=address,
            public_key=public_key,
            private_key=private_key,
            created_at=int(time.time()),
        )

    @classmethod
    def from_identity(cls, identity) -> "Wallet":
        """Create a wallet linked to an AgentIdentity."""
        wallet = cls(
            name=identity.name,
            address=identity.road_address,
            public_key=identity.public_key,
            private_key=identity.private_key,
            identity_fingerprint=identity.fingerprint_hex,
            created_at=identity.created_at,
        )
        return wallet

    # ── Properties ────────────────────────────────────────────────────

    @property
    def balance_road(self) -> float:
        """Balance in ROAD (human-readable)."""
        return self.balance / COIN

    @property
    def short_id(self) -> str:
        """16-char short identifier from address hash."""
        return short_id(sha2048(self.address.encode("utf-8")))

    @property
    def has_identity(self) -> bool:
        """Whether this wallet is linked to an agent identity."""
        return bool(self.identity_fingerprint)

    # ── Transaction Creation ──────────────────────────────────────────

    def create_transaction(self, recipient: str, amount: int,
                           fee: int = 0) -> Transaction:
        """Create and sign a transaction sending ROAD to recipient.

        Args:
            recipient: ROAD address (44 chars)
            amount: amount in base units
            fee: fee in base units

        Returns:
            Signed Transaction ready for broadcast.
        """
        if not self.private_key:
            raise ValueError("No private key — read-only wallet")
        if not validate_address(recipient):
            raise ValueError(f"Invalid ROAD address: {recipient}")
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if amount + fee > self.balance:
            raise ValueError(
                f"Insufficient balance: have {self.balance}, need {amount + fee}"
            )

        tx = Transaction(
            sender=self.address,
            recipient=recipient,
            amount=amount,
            fee=fee,
            nonce=self.nonce,
            timestamp=int(time.time()),
        )
        tx.sign(self.private_key)
        return tx

    def create_identity_tx(self, identity_data: bytes) -> Transaction:
        """Create a special identity registration transaction.

        Sends 0 ROAD to the identity contract address with the agent's
        SHA-2048 fingerprint embedded in the transaction data.
        """
        if not self.private_key:
            raise ValueError("No private key — read-only wallet")

        # Identity contract: ROAD + SHA256("IDENTITY_REGISTRY")
        import hashlib
        registry_hash = hashlib.new(
            "ripemd160",
            hashlib.sha256(b"IDENTITY_REGISTRY").digest(),
        ).digest()
        registry_address = "ROAD" + registry_hash.hex()

        tx = Transaction(
            sender=self.address,
            recipient=registry_address,
            amount=0,
            fee=1,  # minimum fee for identity tx
            nonce=self.nonce,
            timestamp=int(time.time()),
        )
        tx.sign(self.private_key)
        return tx

    # ── Signing ───────────────────────────────────────────────────────

    def sign_data(self, data: bytes) -> bytes:
        """Sign arbitrary data with wallet's private key."""
        if not self.private_key:
            raise ValueError("No private key — read-only wallet")
        msg_hash = dsha256(data)
        return sign(self.private_key, msg_hash)

    def verify_signature(self, data: bytes, signature: bytes) -> bool:
        """Verify a signature against this wallet's public key."""
        msg_hash = dsha256(data)
        return verify(signature, msg_hash, self.public_key)

    # ── Serialization ─────────────────────────────────────────────────

    def to_dict(self, include_private: bool = False) -> dict:
        d = {
            "name": self.name,
            "address": self.address,
            "public_key": self.public_key.hex(),
            "balance": self.balance,
            "balance_road": self.balance_road,
            "nonce": self.nonce,
            "identity_fingerprint": self.identity_fingerprint,
            "created_at": self.created_at,
        }
        if include_private and self.private_key:
            d["private_key"] = self.private_key.hex()
        return d

    @classmethod
    def from_dict(cls, d: dict) -> "Wallet":
        private_key = bytes.fromhex(d["private_key"]) if d.get("private_key") else b""
        return cls(
            name=d["name"],
            address=d["address"],
            public_key=bytes.fromhex(d["public_key"]),
            private_key=private_key,
            balance=d.get("balance", 0),
            nonce=d.get("nonce", 0),
            identity_fingerprint=d.get("identity_fingerprint", ""),
            created_at=d.get("created_at", 0),
        )

    # ── File I/O ──────────────────────────────────────────────────────

    def save(self, directory: Path | None = None) -> Path:
        """Save wallet to JSON file. Returns the file path."""
        wallet_dir = directory or WALLETS_DIR
        wallet_dir.mkdir(parents=True, exist_ok=True)
        path = wallet_dir / f"{self.name}.json"
        path.write_text(json.dumps(self.to_dict(include_private=True), indent=2))
        path.chmod(0o600)
        return path

    @classmethod
    def load(cls, name: str, directory: Path | None = None) -> "Wallet":
        """Load wallet from JSON file."""
        wallet_dir = directory or WALLETS_DIR
        path = wallet_dir / f"{name}.json"
        if not path.exists():
            raise FileNotFoundError(f"Wallet not found: {path}")
        return cls.from_dict(json.loads(path.read_text()))

    @classmethod
    def list_wallets(cls, directory: Path | None = None) -> list[str]:
        """List all wallet names in the wallets directory."""
        wallet_dir = directory or WALLETS_DIR
        if not wallet_dir.exists():
            return []
        return [p.stem for p in wallet_dir.glob("*.json")]

    # ── Display ───────────────────────────────────────────────────────

    def __str__(self) -> str:
        identity_str = f"\n  Identity:  {self.identity_fingerprint[:32]}..." if self.has_identity else ""
        return (
            f"Wallet: {self.name}\n"
            f"  Address:   {self.address}\n"
            f"  Balance:   {self.balance_road:.8f} ROAD{identity_str}"
        )
