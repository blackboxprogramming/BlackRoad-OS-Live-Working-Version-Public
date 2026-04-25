"""Apply and revert blocks to the account state in the database."""

from __future__ import annotations

from ..core.block import Block
from ..core.account import AccountState
from .database import Database


def get_account(db: Database, address: str) -> AccountState | None:
    """Load an account from the database, or None if it doesn't exist."""
    row = db.get_account(address)
    if row is None:
        return None
    return AccountState(
        address=row["address"],
        balance=row["balance"],
        nonce=row["nonce"],
    )


def get_or_create_account(db: Database, address: str) -> AccountState:
    """Load an account, creating it with zero balance if needed."""
    acct = get_account(db, address)
    if acct is None:
        acct = AccountState(address=address, balance=0, nonce=0)
    return acct


def apply_block(db: Database, block: Block) -> None:
    """Apply a block to the account state and store it.

    This is the core state transition function:
    1. For each non-coinbase tx: debit sender, credit recipient.
    2. Credit coinbase recipient with the coinbase amount.
    3. Store the block in the database.
    """
    # Process transactions in order
    for tx in block.transactions:
        if tx.is_coinbase:
            # Credit miner
            if tx.recipient and tx.amount > 0:
                acct = get_or_create_account(db, tx.recipient)
                acct.balance += tx.amount
                db.put_account(acct.address, acct.balance, acct.nonce)
        else:
            # Debit sender
            sender = get_or_create_account(db, tx.sender)
            sender.balance -= (tx.amount + tx.fee)
            sender.nonce += 1
            db.put_account(sender.address, sender.balance, sender.nonce)

            # Credit recipient
            recipient = get_or_create_account(db, tx.recipient)
            recipient.balance += tx.amount
            db.put_account(recipient.address, recipient.balance, recipient.nonce)

    # Store the block
    db.put_block(block)


def revert_block(db: Database, block: Block) -> None:
    """Revert a block from the account state (for chain reorganizations).

    Reverses apply_block in reverse transaction order.
    """
    for tx in reversed(block.transactions):
        if tx.is_coinbase:
            if tx.recipient and tx.amount > 0:
                acct = get_or_create_account(db, tx.recipient)
                acct.balance -= tx.amount
                db.put_account(acct.address, acct.balance, acct.nonce)
        else:
            # Reverse credit to recipient
            recipient = get_or_create_account(db, tx.recipient)
            recipient.balance -= tx.amount
            db.put_account(recipient.address, recipient.balance, recipient.nonce)

            # Reverse debit from sender
            sender = get_or_create_account(db, tx.sender)
            sender.balance += (tx.amount + tx.fee)
            sender.nonce -= 1
            db.put_account(sender.address, sender.balance, sender.nonce)
