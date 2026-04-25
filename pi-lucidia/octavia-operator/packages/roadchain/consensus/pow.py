"""Proof-of-work mining: find a nonce that satisfies the target."""

from __future__ import annotations

import time
from typing import Callable

from ..core.block import Block, BlockHeader
from ..core.transaction import Transaction
from ..crypto.bitcoin_pow import check_pow, merkle_root, hash_header


def mine_block(
    prev_hash: bytes,
    transactions: list[Transaction],
    height: int,
    nbits: int,
    version: int = 1,
    on_nonce: Callable[[int, float], None] | None = None,
    stop: Callable[[], bool] | None = None,
) -> Block | None:
    """Mine a new block by searching for a valid nonce.

    Args:
        prev_hash: 32-byte hash of the previous block.
        transactions: list of transactions (coinbase must be first).
        height: block height.
        nbits: compact difficulty target.
        version: block version.
        on_nonce: callback(nonce, hashrate) called periodically.
        stop: callable returning True to abort mining.

    Returns:
        A valid Block, or None if stopped.
    """
    mk = merkle_root([tx.tx_id() for tx in transactions])
    timestamp = int(time.time())

    header = BlockHeader(
        version=version,
        prev_hash=prev_hash,
        merkle=mk,
        timestamp=timestamp,
        nbits=nbits,
        nonce=0,
    )

    start = time.monotonic()
    nonce = 0
    report_interval = 50_000

    while True:
        if stop and stop():
            return None

        header.nonce = nonce
        header.timestamp = int(time.time())
        h = header.hash()

        if check_pow(h, nbits):
            return Block(header=header, transactions=transactions, height=height)

        nonce += 1

        if on_nonce and nonce % report_interval == 0:
            elapsed = time.monotonic() - start
            rate = nonce / elapsed if elapsed > 0 else 0
            on_nonce(nonce, rate)

        # Wrap nonce at 2^32, bump timestamp
        if nonce >= 0xFFFFFFFF:
            nonce = 0
            header.timestamp = int(time.time())
