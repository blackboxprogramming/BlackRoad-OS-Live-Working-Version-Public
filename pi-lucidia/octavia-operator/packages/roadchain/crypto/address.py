"""ROAD address derivation from public keys.

Format: "ROAD" + hex(RIPEMD160(SHA256(compressed_pubkey)))
Total length: 4 + 40 = 44 characters.
"""

import hashlib


def pubkey_to_address(public_key: bytes) -> str:
    """Derive a ROAD address from a compressed public key (33 bytes).

    ROAD + RIPEMD160(SHA256(pubkey)) as 40 hex characters.
    """
    sha = hashlib.sha256(public_key).digest()
    ripe = hashlib.new("ripemd160", sha).digest()
    return "ROAD" + ripe.hex()


def validate_address(address: str) -> bool:
    """Check that an address has the correct format."""
    if not address.startswith("ROAD"):
        return False
    hex_part = address[4:]
    if len(hex_part) != 40:
        return False
    try:
        bytes.fromhex(hex_part)
        return True
    except ValueError:
        return False
