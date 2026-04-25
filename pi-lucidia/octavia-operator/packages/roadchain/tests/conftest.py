"""Shared fixtures for roadchain tests."""

import sys
import os
import pytest

# Ensure parent of roadchain package is on path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from roadchain.crypto.keys import generate_keypair
from roadchain.crypto.address import pubkey_to_address


@pytest.fixture
def keypair():
    """Generate a fresh secp256k1 keypair."""
    priv, pub = generate_keypair()
    return priv, pub


@pytest.fixture
def two_keypairs():
    """Generate two keypairs for sender/recipient tests."""
    priv1, pub1 = generate_keypair()
    priv2, pub2 = generate_keypair()
    addr1 = pubkey_to_address(pub1)
    addr2 = pubkey_to_address(pub2)
    return (priv1, pub1, addr1), (priv2, pub2, addr2)
