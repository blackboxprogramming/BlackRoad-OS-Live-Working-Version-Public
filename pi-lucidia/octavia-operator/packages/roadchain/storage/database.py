"""SQLite storage backend for blocks, transactions, and account state.

Uses WAL mode for concurrent reads.  All data in ~/.roadchain-l1/chain.db.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from ..constants import DATA_DIR


SCHEMA = """
CREATE TABLE IF NOT EXISTS blocks (
    height      INTEGER PRIMARY KEY,
    hash        TEXT    NOT NULL UNIQUE,
    prev_hash   TEXT    NOT NULL,
    timestamp   INTEGER NOT NULL,
    nbits       INTEGER NOT NULL,
    nonce       INTEGER NOT NULL,
    version     INTEGER NOT NULL DEFAULT 1,
    merkle      TEXT    NOT NULL,
    tx_count    INTEGER NOT NULL DEFAULT 0,
    data        TEXT    NOT NULL  -- full JSON blob
);

CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(hash);

CREATE TABLE IF NOT EXISTS transactions (
    tx_id       TEXT    PRIMARY KEY,
    block_height INTEGER NOT NULL,
    tx_index    INTEGER NOT NULL,
    sender      TEXT    NOT NULL,
    recipient   TEXT    NOT NULL,
    amount      INTEGER NOT NULL,
    fee         INTEGER NOT NULL,
    nonce       INTEGER NOT NULL,
    timestamp   INTEGER NOT NULL,
    data        TEXT    NOT NULL,
    FOREIGN KEY (block_height) REFERENCES blocks(height)
);

CREATE INDEX IF NOT EXISTS idx_tx_sender ON transactions(sender);
CREATE INDEX IF NOT EXISTS idx_tx_recipient ON transactions(recipient);
CREATE INDEX IF NOT EXISTS idx_tx_block ON transactions(block_height);

CREATE TABLE IF NOT EXISTS accounts (
    address     TEXT    PRIMARY KEY,
    balance     INTEGER NOT NULL DEFAULT 0,
    nonce       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS peers (
    host        TEXT    NOT NULL,
    port        INTEGER NOT NULL,
    last_seen   INTEGER NOT NULL DEFAULT 0,
    failures    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (host, port)
);

CREATE TABLE IF NOT EXISTS meta (
    key         TEXT    PRIMARY KEY,
    value       TEXT    NOT NULL
);
"""


class Database:
    """SQLite database for the RoadChain L1 node."""

    def __init__(self, db_path: Path | None = None):
        if db_path is None:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            db_path = DATA_DIR / "chain.db"
        self.db_path = db_path
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA synchronous=NORMAL")
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self) -> None:
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    def close(self) -> None:
        self.conn.close()

    # ── Blocks ──────────────────────────────────────────────────────

    def put_block(self, block) -> None:
        """Store a block and its transactions.  Expects a core.block.Block."""
        d = block.to_dict()
        self.conn.execute(
            "INSERT OR REPLACE INTO blocks "
            "(height, hash, prev_hash, timestamp, nbits, nonce, version, merkle, tx_count, data) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                block.height,
                block.hash_hex(),
                block.header.prev_hash.hex(),
                block.header.timestamp,
                block.header.nbits,
                block.header.nonce,
                block.header.version,
                block.header.merkle.hex(),
                len(block.transactions),
                json.dumps(d),
            ),
        )
        for i, tx in enumerate(block.transactions):
            td = tx.to_dict()
            self.conn.execute(
                "INSERT OR REPLACE INTO transactions "
                "(tx_id, block_height, tx_index, sender, recipient, "
                "amount, fee, nonce, timestamp, data) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    tx.tx_id_hex(),
                    block.height,
                    i,
                    tx.sender,
                    tx.recipient,
                    tx.amount,
                    tx.fee,
                    tx.nonce,
                    tx.timestamp,
                    json.dumps(td),
                ),
            )
        self.conn.commit()

    def get_block_by_height(self, height: int) -> dict | None:
        row = self.conn.execute(
            "SELECT data FROM blocks WHERE height = ?", (height,)
        ).fetchone()
        return json.loads(row["data"]) if row else None

    def get_block_by_hash(self, hash_hex: str) -> dict | None:
        row = self.conn.execute(
            "SELECT data FROM blocks WHERE hash = ?", (hash_hex,)
        ).fetchone()
        return json.loads(row["data"]) if row else None

    def get_tip_height(self) -> int:
        row = self.conn.execute(
            "SELECT MAX(height) as h FROM blocks"
        ).fetchone()
        return row["h"] if row and row["h"] is not None else -1

    def get_tip(self) -> dict | None:
        h = self.get_tip_height()
        if h < 0:
            return None
        return self.get_block_by_height(h)

    # ── Transactions ────────────────────────────────────────────────

    def get_transaction(self, tx_id: str) -> dict | None:
        row = self.conn.execute(
            "SELECT data FROM transactions WHERE tx_id = ?", (tx_id,)
        ).fetchone()
        return json.loads(row["data"]) if row else None

    def get_address_transactions(self, address: str, limit: int = 50) -> list[dict]:
        rows = self.conn.execute(
            "SELECT data FROM transactions "
            "WHERE sender = ? OR recipient = ? "
            "ORDER BY block_height DESC, tx_index DESC LIMIT ?",
            (address, address, limit),
        ).fetchall()
        return [json.loads(r["data"]) for r in rows]

    # ── Accounts ────────────────────────────────────────────────────

    def get_account(self, address: str) -> dict | None:
        row = self.conn.execute(
            "SELECT address, balance, nonce FROM accounts WHERE address = ?",
            (address,),
        ).fetchone()
        return dict(row) if row else None

    def put_account(self, address: str, balance: int, nonce: int) -> None:
        self.conn.execute(
            "INSERT OR REPLACE INTO accounts (address, balance, nonce) "
            "VALUES (?, ?, ?)",
            (address, balance, nonce),
        )
        self.conn.commit()

    def get_all_accounts(self) -> list[dict]:
        rows = self.conn.execute(
            "SELECT address, balance, nonce FROM accounts ORDER BY balance DESC"
        ).fetchall()
        return [dict(r) for r in rows]

    # ── Peers ───────────────────────────────────────────────────────

    def add_peer(self, host: str, port: int) -> None:
        import time
        self.conn.execute(
            "INSERT OR REPLACE INTO peers (host, port, last_seen, failures) "
            "VALUES (?, ?, ?, 0)",
            (host, port, int(time.time())),
        )
        self.conn.commit()

    def get_peers(self, limit: int = 32) -> list[tuple[str, int]]:
        rows = self.conn.execute(
            "SELECT host, port FROM peers WHERE failures < 5 "
            "ORDER BY last_seen DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [(r["host"], r["port"]) for r in rows]

    # ── Meta ────────────────────────────────────────────────────────

    def get_meta(self, key: str) -> str | None:
        row = self.conn.execute(
            "SELECT value FROM meta WHERE key = ?", (key,)
        ).fetchone()
        return row["value"] if row else None

    def put_meta(self, key: str, value: str) -> None:
        self.conn.execute(
            "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)",
            (key, value),
        )
        self.conn.commit()
