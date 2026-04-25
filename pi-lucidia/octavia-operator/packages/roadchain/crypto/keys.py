"""secp256k1 key generation, signing, and verification via coincurve."""

import os

from coincurve import PrivateKey, PublicKey


def generate_keypair() -> tuple[bytes, bytes]:
    """Generate a new secp256k1 keypair.

    Returns (private_key_32_bytes, compressed_public_key_33_bytes).
    """
    secret = os.urandom(32)
    sk = PrivateKey(secret)
    pk = sk.public_key.format(compressed=True)
    return secret, pk


def private_to_public(private_key: bytes) -> bytes:
    """Derive compressed public key (33 bytes) from private key (32 bytes)."""
    sk = PrivateKey(private_key)
    return sk.public_key.format(compressed=True)


def sign(private_key: bytes, message_hash: bytes) -> bytes:
    """Sign a 32-byte message hash, returning a DER-encoded signature."""
    sk = PrivateKey(private_key)
    return sk.sign(message_hash, hasher=None)


def verify(signature: bytes, message_hash: bytes, public_key: bytes) -> bool:
    """Verify a DER signature against a 32-byte hash and compressed pubkey."""
    try:
        pk = PublicKey(public_key)
        return pk.verify(signature, message_hash, hasher=None)
    except Exception:
        return False
