"""Tests for roadchain consensus: mining and validation."""

import pytest
from roadchain.core.block import Block, BlockHeader
from roadchain.core.transaction import Transaction
from roadchain.core.account import AccountState
from roadchain.consensus.pow import mine_block
from roadchain.consensus.validation import validate_transaction, validate_coinbase, ValidationError
from roadchain.crypto.keys import generate_keypair
from roadchain.crypto.address import pubkey_to_address
from roadchain.constants import COIN, INITIAL_BITS, INITIAL_REWARD


class TestMining:
    def test_mine_genesis_successor(self):
        genesis = Block.genesis()
        priv, pub = generate_keypair()
        addr = pubkey_to_address(pub)
        coinbase = Transaction.coinbase(addr, INITIAL_REWARD, height=1)
        block = mine_block(
            prev_hash=genesis.hash(),
            transactions=[coinbase],
            height=1,
            nbits=INITIAL_BITS,
        )
        assert block is not None
        assert block.height == 1
        assert block.header.meets_target()

    def test_mine_with_stop_signal(self):
        genesis = Block.genesis()
        priv, pub = generate_keypair()
        addr = pubkey_to_address(pub)
        coinbase = Transaction.coinbase(addr, INITIAL_REWARD, height=1)
        # Stop immediately
        result = mine_block(
            prev_hash=genesis.hash(),
            transactions=[coinbase],
            height=1,
            nbits=INITIAL_BITS,
            stop=lambda: True,
        )
        assert result is None

    def test_mine_reports_hashrate(self):
        genesis = Block.genesis()
        priv, pub = generate_keypair()
        addr = pubkey_to_address(pub)
        coinbase = Transaction.coinbase(addr, INITIAL_REWARD, height=1)
        hashrates = []
        block = mine_block(
            prev_hash=genesis.hash(),
            transactions=[coinbase],
            height=1,
            nbits=INITIAL_BITS,
            on_nonce=lambda nonce, hr: hashrates.append(hr),
        )
        assert block is not None


class TestTransactionValidation:
    def test_valid_transaction(self, two_keypairs):
        (priv1, pub1, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=COIN, fee=1000, nonce=0)
        tx.sign(priv1)
        account = AccountState(address=addr1, balance=10 * COIN, nonce=0)
        # Should not raise
        validate_transaction(tx, lambda a: account if a == addr1 else None, tip_height=0)

    def test_insufficient_balance(self, two_keypairs):
        (priv1, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=100 * COIN, fee=1000, nonce=0)
        tx.sign(priv1)
        account = AccountState(address=addr1, balance=1 * COIN, nonce=0)
        with pytest.raises(ValidationError):
            validate_transaction(tx, lambda a: account if a == addr1 else None, tip_height=0)

    def test_wrong_nonce(self, two_keypairs):
        (priv1, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=COIN, fee=100, nonce=5)
        tx.sign(priv1)
        account = AccountState(address=addr1, balance=10 * COIN, nonce=0)
        with pytest.raises(ValidationError):
            validate_transaction(tx, lambda a: account if a == addr1 else None, tip_height=0)

    def test_zero_amount(self, two_keypairs):
        (priv1, _, addr1), (_, _, addr2) = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr2, amount=0, fee=100, nonce=0)
        tx.sign(priv1)
        account = AccountState(address=addr1, balance=10 * COIN, nonce=0)
        with pytest.raises(ValidationError):
            validate_transaction(tx, lambda a: account if a == addr1 else None, tip_height=0)

    def test_self_send_rejected(self, two_keypairs):
        (priv1, _, addr1), _ = two_keypairs
        tx = Transaction(sender=addr1, recipient=addr1, amount=COIN, fee=100, nonce=0)
        tx.sign(priv1)
        account = AccountState(address=addr1, balance=10 * COIN, nonce=0)
        with pytest.raises(ValidationError):
            validate_transaction(tx, lambda a: account if a == addr1 else None, tip_height=0)


class TestCoinbaseValidation:
    def test_valid_coinbase(self):
        priv, pub = generate_keypair()
        addr = pubkey_to_address(pub)
        cb = Transaction.coinbase(addr, INITIAL_REWARD, height=0)
        validate_coinbase(cb, height=0, total_fees=0)

    def test_overpaid_coinbase(self):
        priv, pub = generate_keypair()
        addr = pubkey_to_address(pub)
        cb = Transaction.coinbase(addr, INITIAL_REWARD + 1, height=0)
        with pytest.raises(ValidationError):
            validate_coinbase(cb, height=0, total_fees=0)
