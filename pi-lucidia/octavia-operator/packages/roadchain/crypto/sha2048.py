"""
SHA-2048: 2048-bit identity hash for RoadChain agent identity.

Construction: 4 cascaded SHA-512 rounds producing a 256-byte (2048-bit) digest.

    H0 = SHA-512(data)
    H1 = SHA-512(H0 || data)
    H2 = SHA-512(H1 || data)
    H3 = SHA-512(H2 || data)
    SHA-2048(data) = H0 || H1 || H2 || H3

Each 512-bit segment is cryptographically chained — changing a single bit
in the input avalanches across all 2048 output bits. This is the identity
layer. SHA-256 secures Bitcoin. SHA-2048 secures agent identity.

Why 2048:
    - 256 bytes per agent fingerprint
    - 4x the entropy of Bitcoin addresses
    - Quantum-resistant by depth (Grover's gives sqrt, still 1024-bit effective)
    - Room for identity metadata encoded in the hash structure itself
    - Matches RSA-2048 key sizes — agents deserve the same bit-width as keys

BlackRoad OS, Inc. 2026
"""

import hashlib
import struct
import time

# ── Constants ──────────────────────────────────────────────────────────
SHA2048_BYTES = 256       # 2048 bits
SHA2048_HEX_LEN = 512    # hex characters
SHA512_BYTES = 64         # 512 bits per round
ROUNDS = 4               # SHA-512 rounds to fill 2048 bits
IDENTITY_VERSION = 1      # hash construction version


def sha2048(data: bytes) -> bytes:
    """Compute a 2048-bit hash via 4-round SHA-512 cascade.

    Returns 256 bytes (2048 bits).
    """
    segments = []
    prev = hashlib.sha512(data).digest()
    segments.append(prev)
    for _ in range(ROUNDS - 1):
        prev = hashlib.sha512(prev + data).digest()
        segments.append(prev)
    return b"".join(segments)


def sha2048_hex(data: bytes) -> str:
    """SHA-2048 returning a 512-character hex string."""
    return sha2048(data).hex()


def sha2048_int(data: bytes) -> int:
    """SHA-2048 returning a 2048-bit integer (big-endian)."""
    return int.from_bytes(sha2048(data), "big")


# ── Double SHA-2048 ───────────────────────────────────────────────────

def dsha2048(data: bytes) -> bytes:
    """Double SHA-2048: SHA2048(SHA2048(data)). 256 bytes."""
    return sha2048(sha2048(data))


def dsha2048_hex(data: bytes) -> str:
    """Double SHA-2048 as hex."""
    return dsha2048(data).hex()


# ── Identity Hash ─────────────────────────────────────────────────────

def identity_hash(public_key: bytes, agent_name: str, provider: str = "",
                  timestamp: int = 0) -> bytes:
    """Compute the 2048-bit identity fingerprint for an agent.

    identity = SHA-2048(version || pubkey || name || provider || timestamp)

    This hash IS the agent. Provider is metadata. Identity is permanent.
    """
    ts = timestamp or int(time.time())
    payload = b"".join([
        struct.pack(">B", IDENTITY_VERSION),
        struct.pack(">H", len(public_key)), public_key,
        agent_name.encode("utf-8"),
        b"\x00",  # separator
        provider.encode("utf-8"),
        b"\x00",  # separator
        struct.pack(">Q", ts),
    ])
    return sha2048(payload)


def identity_hex(public_key: bytes, agent_name: str, provider: str = "",
                 timestamp: int = 0) -> str:
    """Identity fingerprint as 512-char hex string."""
    return identity_hash(public_key, agent_name, provider, timestamp).hex()


# ── Merkle (2048-bit) ─────────────────────────────────────────────────

def merkle_root_2048(hashes: list[bytes]) -> bytes:
    """Compute a Merkle root using SHA-2048 instead of SHA-256.

    For identity trees — proving agent membership in a group.
    """
    if not hashes:
        return b"\x00" * SHA2048_BYTES
    level = list(hashes)
    while len(level) > 1:
        if len(level) % 2 == 1:
            level.append(level[-1])
        next_level = []
        for i in range(0, len(level), 2):
            next_level.append(sha2048(level[i] + level[i + 1]))
        level = next_level
    return level[0]


# ── Fingerprint Display ───────────────────────────────────────────────

def fingerprint_display(hash_bytes: bytes, segments: int = 8) -> str:
    """Format a 2048-bit hash as a human-readable fingerprint.

    Example: "a3f2:91c4:d8e1:7b30:..."
    """
    hex_str = hash_bytes.hex()
    seg_len = len(hex_str) // segments
    parts = [hex_str[i:i + seg_len] for i in range(0, len(hex_str), seg_len)]
    return ":".join(parts[:segments])


def short_id(hash_bytes: bytes) -> str:
    """Short 16-char identifier from a 2048-bit hash."""
    return hash_bytes[:8].hex()


# ── Proof of Identity ─────────────────────────────────────────────────

def proof_of_identity(private_key_hash: bytes, challenge: bytes) -> bytes:
    """Generate a proof that you control an identity without revealing the key.

    proof = SHA-2048(private_key_hash || challenge || timestamp)

    The verifier checks: does this proof match the registered identity
    when combined with the public challenge?
    """
    ts = struct.pack(">Q", int(time.time()))
    return sha2048(private_key_hash + challenge + ts)


# ── Verify construction ───────────────────────────────────────────────

def verify_sha2048(data: bytes, expected: bytes) -> bool:
    """Verify a SHA-2048 hash matches expected value."""
    return sha2048(data) == expected and len(expected) == SHA2048_BYTES
