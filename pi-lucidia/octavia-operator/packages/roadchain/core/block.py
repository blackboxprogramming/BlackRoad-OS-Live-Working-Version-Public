"""Block and BlockHeader with Merkle root and nBits difficulty."""

from __future__ import annotations

import struct
import time
from dataclasses import dataclass, field

from ..crypto.bitcoin_pow import (
    dsha256, merkle_root, serialize_header, hash_header,
    check_pow, nbits_to_target,
)
from .transaction import Transaction


@dataclass
class BlockHeader:
    """80-byte block header (Bitcoin-compatible layout)."""

    version: int = 1
    prev_hash: bytes = field(default_factory=lambda: b"\x00" * 32)
    merkle: bytes = field(default_factory=lambda: b"\x00" * 32)
    timestamp: int = 0
    nbits: int = 0
    nonce: int = 0

    def serialize(self) -> bytes:
        return serialize_header(
            self.version, self.prev_hash, self.merkle,
            self.timestamp, self.nbits, self.nonce,
        )

    def hash(self) -> bytes:
        return hash_header(
            self.version, self.prev_hash, self.merkle,
            self.timestamp, self.nbits, self.nonce,
        )

    def hash_hex(self) -> str:
        return self.hash().hex()

    def meets_target(self) -> bool:
        return check_pow(self.hash(), self.nbits)

    def to_dict(self) -> dict:
        return {
            "version": self.version,
            "prev_hash": self.prev_hash.hex(),
            "merkle": self.merkle.hex(),
            "timestamp": self.timestamp,
            "nbits": self.nbits,
            "nonce": self.nonce,
            "hash": self.hash_hex(),
        }

    @classmethod
    def from_dict(cls, d: dict) -> "BlockHeader":
        return cls(
            version=d["version"],
            prev_hash=bytes.fromhex(d["prev_hash"]),
            merkle=bytes.fromhex(d["merkle"]),
            timestamp=d["timestamp"],
            nbits=d["nbits"],
            nonce=d["nonce"],
        )


@dataclass
class Block:
    """A full block: header + transaction list."""

    header: BlockHeader
    transactions: list[Transaction] = field(default_factory=list)
    height: int = 0

    def compute_merkle(self) -> bytes:
        tx_hashes = [tx.tx_id() for tx in self.transactions]
        return merkle_root(tx_hashes)

    def hash(self) -> bytes:
        return self.header.hash()

    def hash_hex(self) -> str:
        return self.header.hash_hex()

    def to_dict(self) -> dict:
        return {
            "height": self.height,
            "header": self.header.to_dict(),
            "transactions": [tx.to_dict() for tx in self.transactions],
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Block":
        header = BlockHeader.from_dict(d["header"])
        txs = [Transaction.from_dict(t) for t in d["transactions"]]
        return cls(header=header, transactions=txs, height=d["height"])

    @classmethod
    def genesis(cls) -> "Block":
        """Create the genesis block.

        The genesis coinbase has amount=0 and a special "burn" address
        derived from the genesis message.  No ROAD is created here --
        the migration block (height 1) credits legacy balances.
        """
        from ..constants import GENESIS_MESSAGE, GENESIS_TIMESTAMP, INITIAL_BITS
        import hashlib

        # Deterministic burn address from genesis message
        msg_bytes = GENESIS_MESSAGE.encode("utf-8")
        sha = hashlib.sha256(msg_bytes).digest()
        ripe = hashlib.new("ripemd160", sha).digest()
        burn_address = "ROAD" + ripe.hex()

        coinbase = Transaction(
            sender="",
            recipient=burn_address,
            amount=0,
            fee=0,
            nonce=0,
            timestamp=GENESIS_TIMESTAMP,
        )

        header = BlockHeader(
            version=1,
            prev_hash=b"\x00" * 32,
            merkle=merkle_root([coinbase.tx_id()]),
            timestamp=GENESIS_TIMESTAMP,
            nbits=INITIAL_BITS,
            nonce=0,
        )

        # Mine the genesis block (very easy difficulty)
        while not header.meets_target():
            header.nonce += 1

        return cls(header=header, transactions=[coinbase], height=0)
