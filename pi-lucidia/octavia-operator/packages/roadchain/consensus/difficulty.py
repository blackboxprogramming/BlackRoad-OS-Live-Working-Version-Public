"""Difficulty retarget logic -- every 2016 blocks, target 27s per block."""

from ..constants import RETARGET_INTERVAL, RETARGET_TIMESPAN, INITIAL_BITS
from ..crypto.bitcoin_pow import retarget, nbits_to_target, target_to_nbits


def get_next_nbits(height: int, prev_nbits: int,
                   first_timestamp: int, last_timestamp: int) -> int:
    """Determine nBits for the next block.

    Args:
        height: height of the block being produced.
        prev_nbits: nBits of the previous block.
        first_timestamp: timestamp of the first block in the retarget window.
        last_timestamp: timestamp of the last block in the retarget window.

    Returns:
        nBits for the new block.
    """
    # Only retarget at interval boundaries
    if height % RETARGET_INTERVAL != 0:
        return prev_nbits

    actual_timespan = last_timestamp - first_timestamp
    if actual_timespan < 1:
        actual_timespan = 1

    return retarget(prev_nbits, actual_timespan, RETARGET_TIMESPAN)


def get_block_reward(height: int) -> int:
    """Block reward in base units, halving every HALVING_INTERVAL blocks."""
    from ..constants import INITIAL_REWARD, HALVING_INTERVAL
    halvings = height // HALVING_INTERVAL
    if halvings >= 64:
        return 0
    return INITIAL_REWARD >> halvings
