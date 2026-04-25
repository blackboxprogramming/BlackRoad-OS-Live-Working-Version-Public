"""Import legacy ~/.roadchain/chain.json into the new L1 format.

Strategy:
  - Block 0: New genesis block (deterministic, always the same)
  - Block 1: Migration block that credits all legacy balances via coinbase
  - Legacy data directory is never modified
"""

from __future__ import annotations

import json
import time
from pathlib import Path

from ..constants import LEGACY_DIR, COIN, INITIAL_BITS, GENESIS_TIMESTAMP
from ..core.block import Block, BlockHeader
from ..core.transaction import Transaction
from ..crypto.bitcoin_pow import merkle_root
from .database import Database
from .chainstate import apply_block


def load_legacy_balances(legacy_dir: Path | None = None) -> dict[str, int]:
    """Parse legacy chain.json and compute final balances.

    Returns {address: balance_in_base_units}.
    """
    if legacy_dir is None:
        legacy_dir = LEGACY_DIR
    chain_file = legacy_dir / "chain.json"
    if not chain_file.exists():
        return {}

    data = json.loads(chain_file.read_text())
    chain = data.get("chain", [])

    # Sum up all transactions
    balances: dict[str, float] = {}
    for block in chain:
        for tx in block.get("transactions", []):
            sender = tx.get("sender", "")
            recipient = tx.get("recipient", "")
            amount = tx.get("amount", 0)

            if sender not in ("0", "ROADCHAIN", "BTC_RESERVE", "BRIDGE", ""):
                balances[sender] = balances.get(sender, 0) - amount
            if recipient:
                balances[recipient] = balances.get(recipient, 0) + amount

    # Convert to base units (int), drop zero/negative balances
    result = {}
    for addr, bal in balances.items():
        units = int(round(bal * COIN))
        if units > 0:
            result[addr] = units

    return result


def load_legacy_wallet_addresses(legacy_dir: Path | None = None) -> dict[str, str]:
    """Load legacy wallet name -> ROAD address mapping.

    Returns {name: legacy_address}.
    """
    if legacy_dir is None:
        legacy_dir = LEGACY_DIR
    wallets_dir = legacy_dir / "wallets"
    if not wallets_dir.exists():
        return {}

    mapping = {}
    for f in wallets_dir.glob("*.json"):
        if f.name == "bitcoin-bridge.json":
            continue
        try:
            w = json.loads(f.read_text())
            name = w.get("name", f.stem)
            addr = w.get("address", "")
            if addr:
                mapping[name] = addr
        except (json.JSONDecodeError, KeyError):
            pass
    return mapping


def create_migration_block(genesis: Block, balances: dict[str, int]) -> Block:
    """Create block 1: credits all legacy balances.

    This is a special block with a coinbase that distributes the total
    legacy supply, plus one "credit" transaction per legacy address.
    We encode credits as coinbase-like transactions (sender="") so they
    don't require signatures.
    """
    total = sum(balances.values())
    timestamp = GENESIS_TIMESTAMP + 27  # one block interval after genesis

    transactions = []

    # Coinbase: total legacy supply goes to migration
    coinbase = Transaction(
        sender="",
        recipient="",     # no single recipient for migration coinbase
        amount=0,          # individual credits below
        fee=0,
        nonce=1,           # height
        timestamp=timestamp,
    )
    # Set a burn address for the coinbase recipient
    import hashlib
    burn = "ROAD" + hashlib.new(
        "ripemd160", hashlib.sha256(b"migration").digest()
    ).digest().hex()
    coinbase.recipient = burn
    coinbase.amount = total
    transactions.append(coinbase)

    # Credit transactions for each legacy address (unsigned, sender="")
    for addr, amount in sorted(balances.items()):
        tx = Transaction(
            sender="",
            recipient=addr,
            amount=amount,
            fee=0,
            nonce=1,
            timestamp=timestamp,
        )
        transactions.append(tx)

    # Build the block header
    mk = merkle_root([tx.tx_id() for tx in transactions])
    header = BlockHeader(
        version=1,
        prev_hash=genesis.hash(),
        merkle=mk,
        timestamp=timestamp,
        nbits=INITIAL_BITS,
        nonce=0,
    )

    # Mine it
    while not header.meets_target():
        header.nonce += 1

    return Block(header=header, transactions=transactions, height=1)


def migrate(db: Database, legacy_dir: Path | None = None,
            verbose: bool = True) -> dict:
    """Run the full migration.

    1. Create genesis block
    2. Load legacy balances
    3. Create migration block (height 1)
    4. Apply both to the database

    Returns a summary dict.
    """
    if db.get_tip_height() >= 0:
        return {"error": "Database already has blocks. Use a fresh database."}

    # Step 1: Genesis
    if verbose:
        print("  Creating genesis block...")
    genesis = Block.genesis()
    apply_block(db, genesis)

    # Step 2: Legacy balances
    if verbose:
        print("  Loading legacy chain.json...")
    balances = load_legacy_balances(legacy_dir)
    wallet_map = load_legacy_wallet_addresses(legacy_dir)

    if not balances:
        if verbose:
            print("  No legacy balances found. Genesis-only chain.")
        return {
            "genesis_hash": genesis.hash_hex(),
            "tip_height": 0,
            "legacy_accounts": 0,
            "legacy_supply": 0,
        }

    # Step 3: Migration block
    if verbose:
        total_road = sum(balances.values()) / COIN
        print(f"  Found {len(balances)} legacy accounts, {total_road:.8f} ROAD total")
        print("  Mining migration block...")

    migration = create_migration_block(genesis, balances)
    apply_block(db, migration)

    if verbose:
        print(f"  Migration block hash: {migration.hash_hex()}")
        print()
        print("  Legacy balances migrated:")
        for addr, amount in sorted(balances.items(), key=lambda x: -x[1]):
            name = ""
            for wname, waddr in wallet_map.items():
                if waddr == addr:
                    name = f" ({wname})"
                    break
            print(f"    {addr}{name}: {amount / COIN:.8f} ROAD")

    return {
        "genesis_hash": genesis.hash_hex(),
        "migration_hash": migration.hash_hex(),
        "tip_height": 1,
        "legacy_accounts": len(balances),
        "legacy_supply": sum(balances.values()),
        "balances": {a: v / COIN for a, v in balances.items()},
    }
