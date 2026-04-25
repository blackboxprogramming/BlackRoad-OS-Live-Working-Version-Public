"""Tests for roadchain cryptographic primitives."""

import hashlib
from roadchain.crypto.keys import generate_keypair, private_to_public, sign, verify
from roadchain.crypto.hashing import tx_hash, block_hash, hash_hex
from roadchain.crypto.address import pubkey_to_address


class TestKeyGeneration:
    def test_keypair_lengths(self, keypair):
        priv, pub = keypair
        assert len(priv) == 32
        assert len(pub) == 33  # compressed secp256k1

    def test_deterministic_public_key(self):
        priv, pub = generate_keypair()
        pub2 = private_to_public(priv)
        assert pub == pub2

    def test_unique_keypairs(self):
        pairs = [generate_keypair() for _ in range(5)]
        privkeys = [p[0] for p in pairs]
        assert len(set(privkeys)) == 5


class TestSignAndVerify:
    def test_sign_and_verify(self, keypair):
        priv, pub = keypair
        msg = hashlib.sha256(b"roadchain test").digest()
        sig = sign(priv, msg)
        assert verify(sig, msg, pub)

    def test_wrong_key_fails(self):
        priv1, pub1 = generate_keypair()
        _, pub2 = generate_keypair()
        msg = hashlib.sha256(b"test").digest()
        sig = sign(priv1, msg)
        assert not verify(sig, msg, pub2)

    def test_tampered_message_fails(self, keypair):
        priv, pub = keypair
        msg = hashlib.sha256(b"original").digest()
        sig = sign(priv, msg)
        tampered = hashlib.sha256(b"tampered").digest()
        assert not verify(sig, tampered, pub)

    def test_signature_is_bytes(self, keypair):
        priv, pub = keypair
        msg = hashlib.sha256(b"x").digest()
        sig = sign(priv, msg)
        assert isinstance(sig, bytes)
        assert len(sig) > 0


class TestHashing:
    def test_tx_hash_deterministic(self):
        data = b"transaction data"
        assert tx_hash(data) == tx_hash(data)

    def test_tx_hash_is_32_bytes(self):
        result = tx_hash(b"test")
        assert len(result) == 32

    def test_block_hash_is_32_bytes(self):
        result = block_hash(b"\x00" * 80)
        assert len(result) == 32

    def test_hash_hex_is_64_chars(self):
        result = hash_hex(b"test")
        assert len(result) == 64
        assert all(c in "0123456789abcdef" for c in result)

    def test_different_inputs_different_hashes(self):
        assert tx_hash(b"a") != tx_hash(b"b")


class TestAddress:
    def test_address_starts_with_road(self, keypair):
        _, pub = keypair
        addr = pubkey_to_address(pub)
        assert addr.startswith("ROAD")

    def test_address_length(self, keypair):
        _, pub = keypair
        addr = pubkey_to_address(pub)
        assert len(addr) == 44

    def test_same_key_same_address(self, keypair):
        _, pub = keypair
        assert pubkey_to_address(pub) == pubkey_to_address(pub)

    def test_different_keys_different_addresses(self, two_keypairs):
        (_, _, addr1), (_, _, addr2) = two_keypairs
        assert addr1 != addr2
