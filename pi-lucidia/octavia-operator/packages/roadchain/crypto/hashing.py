"""Thin wrappers around bitcoin_pow hashing for convenience."""

from .bitcoin_pow import dsha256, merkle_root


def tx_hash(raw: bytes) -> bytes:
    """Hash a serialized transaction (double SHA-256)."""
    return dsha256(raw)


def block_hash(raw_header: bytes) -> bytes:
    """Hash a serialized 80-byte block header (double SHA-256)."""
    return dsha256(raw_header)


def hash_hex(data: bytes) -> str:
    """Double-SHA256 returning a hex string."""
    return dsha256(data).hex()
