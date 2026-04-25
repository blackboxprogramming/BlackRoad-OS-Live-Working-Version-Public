"""
Bitcoin-style proof-of-work primitives.

Double-SHA256 hashing, Merkle roots, compact difficulty encoding (nBits),
and 80-byte header serialization -- the same algorithms Bitcoin uses.
"""

import struct
import hashlib


def dsha256(data: bytes) -> bytes:
    """Double SHA-256: SHA256(SHA256(data))."""
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()


def merkle_root(hashes: list[bytes]) -> bytes:
    """Compute the Merkle root of a list of 32-byte hashes.

    If the list has odd length, the last hash is duplicated (Bitcoin rule).
    An empty list returns 32 zero bytes.
    """
    if not hashes:
        return b"\x00" * 32
    level = list(hashes)
    while len(level) > 1:
        if len(level) % 2 == 1:
            level.append(level[-1])
        next_level = []
        for i in range(0, len(level), 2):
            next_level.append(dsha256(level[i] + level[i + 1]))
        level = next_level
    return level[0]


def nbits_to_target(nbits: int) -> int:
    """Decode compact nBits to a 256-bit target integer.

    Format: 0xEEMMMMMMM where EE = exponent byte, MMMMMM = mantissa (3 bytes).
    target = mantissa * 2^(8*(exponent - 3))
    """
    exponent = (nbits >> 24) & 0xFF
    mantissa = nbits & 0x00FFFFFF
    if exponent <= 3:
        target = mantissa >> (8 * (3 - exponent))
    else:
        target = mantissa << (8 * (exponent - 3))
    return target


def target_to_nbits(target: int) -> int:
    """Encode a 256-bit target integer to compact nBits.

    Inverse of nbits_to_target.
    """
    if target == 0:
        return 0
    # Find byte length
    raw = target.to_bytes((target.bit_length() + 7) // 8, "big")
    size = len(raw)
    if size <= 3:
        mantissa = target << (8 * (3 - size))
    else:
        mantissa = target >> (8 * (size - 3))
    # If the high bit of the mantissa is set, shift up to avoid it being
    # interpreted as negative (Bitcoin convention).
    if mantissa & 0x00800000:
        mantissa >>= 8
        size += 1
    return (size << 24) | (mantissa & 0x00FFFFFF)


def serialize_header(version: int, prev_hash: bytes, merkle: bytes,
                     timestamp: int, nbits: int, nonce: int) -> bytes:
    """Serialize a block header into 80 bytes (Bitcoin layout).

    Fields (little-endian):
        version     4 bytes
        prev_hash  32 bytes
        merkle     32 bytes
        timestamp   4 bytes
        nbits       4 bytes
        nonce       4 bytes
    """
    return struct.pack("<I", version) + \
           prev_hash[::-1] + \
           merkle[::-1] + \
           struct.pack("<III", timestamp, nbits, nonce)


def hash_header(version: int, prev_hash: bytes, merkle: bytes,
                timestamp: int, nbits: int, nonce: int) -> bytes:
    """Hash a block header with double-SHA256, return 32 bytes."""
    return dsha256(serialize_header(version, prev_hash, merkle,
                                    timestamp, nbits, nonce))


def check_pow(header_hash: bytes, nbits: int) -> bool:
    """Return True if the header hash meets the target difficulty.

    The hash (interpreted as a little-endian integer) must be <= target.
    """
    target = nbits_to_target(nbits)
    value = int.from_bytes(header_hash, "little")
    return value <= target


def difficulty_from_nbits(nbits: int) -> float:
    """Human-readable difficulty relative to the easiest target."""
    from ..constants import MAX_TARGET
    target = nbits_to_target(nbits)
    if target == 0:
        return float("inf")
    return MAX_TARGET / target


def retarget(old_nbits: int, actual_timespan: int,
             expected_timespan: int) -> int:
    """Calculate new nBits after a difficulty retarget window.

    Clamps the adjustment to [1/4, 4x] of the previous difficulty
    (same rule as Bitcoin).
    """
    # Clamp
    if actual_timespan < expected_timespan // 4:
        actual_timespan = expected_timespan // 4
    if actual_timespan > expected_timespan * 4:
        actual_timespan = expected_timespan * 4

    old_target = nbits_to_target(old_nbits)
    new_target = old_target * actual_timespan // expected_timespan

    from ..constants import MAX_TARGET
    if new_target > MAX_TARGET:
        new_target = MAX_TARGET

    return target_to_nbits(new_target)
