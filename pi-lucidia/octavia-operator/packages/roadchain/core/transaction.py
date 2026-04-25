"""Signed transactions with nonce, integer amounts, and fees."""

from __future__ import annotations

import struct
from dataclasses import dataclass, field

from ..crypto.bitcoin_pow import dsha256
from ..crypto.keys import sign as ec_sign, verify as ec_verify
from ..crypto.address import pubkey_to_address


@dataclass
class Transaction:
    """A signed value-transfer transaction.

    Amounts and fees are in base units (1 ROAD = 10^8 units).
    """

    sender: str          # ROAD address (44 chars) or "" for coinbase
    recipient: str       # ROAD address
    amount: int          # base units
    fee: int             # base units
    nonce: int           # sender's account nonce at time of signing
    public_key: bytes = field(default=b"", repr=False)  # compressed 33-byte pubkey
    signature: bytes = field(default=b"", repr=False)    # DER-encoded ECDSA sig
    timestamp: int = 0   # unix seconds

    @property
    def is_coinbase(self) -> bool:
        return self.sender == ""

    def serialize_unsigned(self) -> bytes:
        """Canonical byte representation for signing / hashing (no sig)."""
        parts = [
            self.sender.encode("ascii"),
            self.recipient.encode("ascii"),
            struct.pack(">Q", self.amount),
            struct.pack(">Q", self.fee),
            struct.pack(">Q", self.nonce),
            struct.pack(">I", self.timestamp),
        ]
        return b"".join(parts)

    def tx_id(self) -> bytes:
        """32-byte transaction hash (double SHA-256 of unsigned payload)."""
        return dsha256(self.serialize_unsigned())

    def tx_id_hex(self) -> str:
        return self.tx_id().hex()

    def sign(self, private_key: bytes) -> None:
        """Sign this transaction in place."""
        from ..crypto.keys import private_to_public
        self.public_key = private_to_public(private_key)
        msg_hash = self.tx_id()
        self.signature = ec_sign(private_key, msg_hash)

    def verify_signature(self) -> bool:
        """Verify that the signature matches the sender address."""
        if self.is_coinbase:
            return True
        if not self.public_key or not self.signature:
            return False
        # Public key must map to sender address
        if pubkey_to_address(self.public_key) != self.sender:
            return False
        return ec_verify(self.signature, self.tx_id(), self.public_key)

    def serialize(self) -> bytes:
        """Full serialization including signature, for storage/wire."""
        unsigned = self.serialize_unsigned()
        pk_len = len(self.public_key)
        sig_len = len(self.signature)
        return (
            struct.pack(">H", len(unsigned)) + unsigned +
            struct.pack(">B", pk_len) + self.public_key +
            struct.pack(">H", sig_len) + self.signature
        )

    @classmethod
    def deserialize(cls, data: bytes) -> tuple["Transaction", int]:
        """Deserialize from bytes, return (tx, bytes_consumed)."""
        offset = 0
        unsigned_len = struct.unpack(">H", data[offset:offset+2])[0]
        offset += 2
        raw = data[offset:offset+unsigned_len]
        offset += unsigned_len

        # Parse unsigned fields
        r = 0
        # sender: scan for "ROAD" prefix -- 44 bytes or 0 for coinbase
        # We encode as: sender_len(2) + sender + recipient(44) + amount(8) + fee(8) + nonce(8) + ts(4)
        # Actually, the unsigned format above is direct concatenation.
        # Let's use a length-prefixed approach for the full serialize.

        # Re-parse from raw unsigned bytes
        # sender is variable: 0 or 44 ascii chars, recipient is 44
        # We need a length prefix -- fix the serialize_unsigned to include lengths.
        # For now, use a simpler approach: include length prefixes in unsigned.

        # This is getting complex -- let's use a dict/JSON-based approach for
        # the wire format and keep the binary for hashing only.

        pk_len = data[offset]
        offset += 1
        public_key = data[offset:offset+pk_len]
        offset += pk_len
        sig_len = struct.unpack(">H", data[offset:offset+2])[0]
        offset += 2
        signature = data[offset:offset+sig_len]
        offset += sig_len

        # We can't fully reconstruct from raw unsigned without length prefixes.
        # Use the dict-based format for wire/storage instead.
        raise NotImplementedError("Use to_dict/from_dict for serialization")

    def to_dict(self) -> dict:
        """Serialize to a JSON-compatible dict."""
        return {
            "sender": self.sender,
            "recipient": self.recipient,
            "amount": self.amount,
            "fee": self.fee,
            "nonce": self.nonce,
            "timestamp": self.timestamp,
            "public_key": self.public_key.hex() if self.public_key else "",
            "signature": self.signature.hex() if self.signature else "",
            "tx_id": self.tx_id_hex(),
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Transaction":
        return cls(
            sender=d["sender"],
            recipient=d["recipient"],
            amount=d["amount"],
            fee=d["fee"],
            nonce=d["nonce"],
            timestamp=d.get("timestamp", 0),
            public_key=bytes.fromhex(d["public_key"]) if d.get("public_key") else b"",
            signature=bytes.fromhex(d["signature"]) if d.get("signature") else b"",
        )

    @classmethod
    def coinbase(cls, recipient: str, reward: int, height: int) -> "Transaction":
        """Create a coinbase transaction (block reward)."""
        return cls(
            sender="",
            recipient=recipient,
            amount=reward,
            fee=0,
            nonce=height,
            timestamp=0,
        )

    def size(self) -> int:
        """Approximate byte size for fee calculations."""
        return len(self.serialize_unsigned()) + len(self.public_key) + len(self.signature) + 5
