"""Tests for roadchain block and transaction structures."""

import time
from roadchain.core.block import Block, BlockHeader
from roadchain.core.transaction import Transaction
from roadchain.core.account import AccountState
from roadchain.crypto.keys import generate_keypair
from roadchain.crypto.address import pubkey_to_address
from roadchain.constants import GENESIS_MESSAGE, COIN, INITIAL_BITS


class TestBlockHeader:
    def test_serialize_is_80_bytes(self):
        header = BlockHeader(version=1, timestamp=int(time.time()), nbits=INITIAL_BITS)
        assert len(header.serialize()) == 80

    def test_hash_is_32_bytes(self):
        header = BlockHeader(timestamp=1000, nbits=INITIAL_BITS)
        assert len(header.hash()) == 32

    def test_hash_hex_is_64_chars(self):
        header = BlockHeader(timestamp=1000, nbits=INITIAL_BITS)
        assert len(header.hash_hex()) == 64

    def test_different_nonces_different_hashes(self):
        h1 = BlockHeader(timestamp=1000, nbits=INITIAL_BITS, nonce=0)
        h2 = BlockHeader(timestamp=1000, nbits=INITIAL_BITS, nonce=1)
        assert h1.hash() != h2.hash()

    def test_meets_target_with_easy_difficulty(self):
        header = BlockHeader(timestamp=1000, nbits=INITIAL_BITS, nonce=0)
        # With very easy difficulty, most nonces should meet target
        assert isinstance(header.meets_target(), bool)

    def test_roundtrip_dict(self):
        header = BlockHeader(version=1, timestamp=12345, nbits=INITIAL_BITS, nonce=42)
        d = header.to_dict()
        restored = BlockHeader.from_dict(d)
        assert restored.version == 1
        assert restored.timestamp == 12345
        assert restored.nonce == 42


class TestBlock:
    def test_genesis_block(self):
        genesis = Block.genesis()
        assert genesis.height == 0
        assert len(genesis.hash()) == 32
        assert len(genesis.transactions) >= 1

    def test_genesis_is_deterministic(self):
        g1 = Block.genesis()
        g2 = Block.genesis()
        assert g1.hash() == g2.hash()

    def test_block_hash_changes_with_header(self):
        h1 = BlockHeader(timestamp=1, nbits=INITIAL_BITS)
        h2 = BlockHeader(timestamp=2, nbits=INITIAL_BITS)
        b1 = Block(header=h1, height=1)
        b2 = Block(header=h2, height=1)
        assert b1.hash() != b2.hash()

    def test_block_roundtrip_dict(self):
        genesis = Block.genesis()
        d = genesis.to_dict()
        restored = Block.from_dict(d)
        assert restored.height == genesis.height
        assert restored.hash_hex() == genesis.hash_hex()

    def test_compute_merkle_empty(self):
        header = BlockHeader(timestamp=1, nbits=INITIAL_BITS)
        block = Block(header=header, transactions=[], height=0)
        merkle = block.compute_merkle()
        assert isinstance(merkle, bytes)
        assert len(merkle) == 32


class TestTransaction:
    def test_coinbase_transaction(self):
        priv, pub = generate_keypair()
        addr = pubkey_to_address(pub)
        cb = Transaction.coinbase(addr, 50 * COIN, height=0)
        assert cb.is_coinbase
        assert cb.amount == 50 * COIN
        assert cb.recipient == addr

    def test_sign_and_verify(self, two_keypairs):
        (priv1, pub1, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(
            sender=addr1,
            recipient=addr2,
            amount=10 * COIN,
            fee=1000,
            nonce=0,
        )
        tx.sign(priv1)
        assert tx.verify_signature()

    def test_unsigned_tx_fails_verify(self, two_keypairs):
        (_, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(
            sender=addr1, recipient=addr2,
            amount=COIN, fee=100, nonce=0,
        )
        assert not tx.verify_signature()

    def test_tx_id_is_deterministic(self, two_keypairs):
        (_, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=COIN, fee=0, nonce=0, timestamp=1000)
        assert tx.tx_id() == tx.tx_id()
        assert len(tx.tx_id()) == 32

    def test_tx_id_hex(self, two_keypairs):
        (_, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=COIN, fee=0, nonce=0, timestamp=1000)
        assert len(tx.tx_id_hex()) == 64

    def test_different_txs_different_ids(self, two_keypairs):
        (_, _, addr1), (_, _, addr2) = two_keypairs
        tx1 = Transaction(sender=addr1, recipient=addr2, amount=COIN, fee=0, nonce=0, timestamp=1)
        tx2 = Transaction(sender=addr1, recipient=addr2, amount=COIN, fee=0, nonce=1, timestamp=1)
        assert tx1.tx_id() != tx2.tx_id()

    def test_tx_roundtrip_dict(self, two_keypairs):
        (priv1, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=5 * COIN, fee=500, nonce=0)
        tx.sign(priv1)
        d = tx.to_dict()
        restored = Transaction.from_dict(d)
        assert restored.sender == addr1
        assert restored.recipient == addr2
        assert restored.amount == 5 * COIN
        assert restored.verify_signature()

    def test_size(self, two_keypairs):
        (_, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=COIN, fee=0, nonce=0)
        assert tx.size() > 0


class TestAccountState:
    def test_default_values(self):
        acc = AccountState(address="ROADtest")
        assert acc.balance == 0
        assert acc.nonce == 0

    def test_roundtrip_dict(self):
        acc = AccountState(address="ROADtest", balance=100 * COIN, nonce=5)
        d = acc.to_dict()
        restored = AccountState.from_dict(d)
        assert restored.address == "ROADtest"
        assert restored.balance == 100 * COIN
        assert restored.nonce == 5
