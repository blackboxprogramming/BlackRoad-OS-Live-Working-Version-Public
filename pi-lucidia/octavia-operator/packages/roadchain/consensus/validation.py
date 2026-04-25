"""Block and transaction validation rules."""

from __future__ import annotations

from ..constants import (
    MAX_SUPPLY, COIN, COINBASE_MATURITY, MAX_TX_SIZE, MIN_FEE_PER_BYTE,
)
from ..core.block import Block, BlockHeader
from ..core.transaction import Transaction
from ..core.account import AccountState
from ..crypto.bitcoin_pow import check_pow, merkle_root
from ..crypto.address import validate_address
from .difficulty import get_block_reward, get_next_nbits


class ValidationError(Exception):
    pass


def validate_transaction(tx: Transaction, get_account: callable,
                         tip_height: int) -> None:
    """Validate a non-coinbase transaction against current state.

    Raises ValidationError on failure.
    """
    if tx.is_coinbase:
        raise ValidationError("Use validate_coinbase for coinbase txs")

    if not validate_address(tx.sender):
        raise ValidationError(f"Invalid sender address: {tx.sender}")
    if not validate_address(tx.recipient):
        raise ValidationError(f"Invalid recipient address: {tx.recipient}")
    if tx.amount <= 0:
        raise ValidationError(f"Amount must be positive: {tx.amount}")
    if tx.fee < 0:
        raise ValidationError(f"Fee cannot be negative: {tx.fee}")
    if tx.sender == tx.recipient:
        raise ValidationError("Sender and recipient must differ")

    # Signature
    if not tx.verify_signature():
        raise ValidationError("Invalid signature")

    # Account state
    account = get_account(tx.sender)
    if account is None:
        raise ValidationError(f"Unknown sender: {tx.sender}")
    if tx.nonce != account.nonce:
        raise ValidationError(
            f"Nonce mismatch: tx={tx.nonce} account={account.nonce}")
    if tx.amount + tx.fee > account.balance:
        raise ValidationError(
            f"Insufficient balance: need {tx.amount + tx.fee}, "
            f"have {account.balance}")


def validate_coinbase(tx: Transaction, height: int, total_fees: int) -> None:
    """Validate a coinbase transaction."""
    if not tx.is_coinbase:
        raise ValidationError("Not a coinbase transaction")
    if not validate_address(tx.recipient):
        raise ValidationError(f"Invalid coinbase recipient: {tx.recipient}")

    expected_reward = get_block_reward(height)
    max_amount = expected_reward + total_fees
    if tx.amount > max_amount:
        raise ValidationError(
            f"Coinbase amount {tx.amount} exceeds max {max_amount}")
    if tx.fee != 0:
        raise ValidationError("Coinbase fee must be 0")


def validate_block(block: Block, prev_block: Block | None,
                   get_account: callable) -> None:
    """Validate a full block including header and all transactions.

    Args:
        block: The block to validate.
        prev_block: The previous block (None for genesis).
        get_account: callable(address) -> AccountState or None.
    """
    h = block.header

    # ── Header checks ───────────────────────────────────────────────
    if prev_block is None:
        # Genesis block -- skip linkage checks
        if block.height != 0:
            raise ValidationError("Genesis block must have height 0")
    else:
        if block.height != prev_block.height + 1:
            raise ValidationError(
                f"Height mismatch: expected {prev_block.height + 1}, "
                f"got {block.height}")
        if h.prev_hash != prev_block.hash():
            raise ValidationError("prev_hash does not match previous block")
        if h.timestamp <= prev_block.header.timestamp:
            raise ValidationError("Timestamp must be after previous block")

    # PoW
    if not check_pow(h.hash(), h.nbits):
        raise ValidationError("Block does not meet PoW target")

    # ── Transaction checks ──────────────────────────────────────────
    if not block.transactions:
        raise ValidationError("Block must have at least one transaction")

    # First tx must be coinbase
    if not block.transactions[0].is_coinbase:
        raise ValidationError("First transaction must be coinbase")

    # No other coinbase
    for tx in block.transactions[1:]:
        if tx.is_coinbase:
            raise ValidationError("Only one coinbase allowed per block")

    # Merkle root
    expected_merkle = merkle_root([tx.tx_id() for tx in block.transactions])
    if h.merkle != expected_merkle:
        raise ValidationError("Merkle root mismatch")

    # Validate each non-coinbase tx
    total_fees = 0
    for tx in block.transactions[1:]:
        validate_transaction(tx, get_account, block.height)
        total_fees += tx.fee

    # Validate coinbase amount
    validate_coinbase(block.transactions[0], block.height, total_fees)
