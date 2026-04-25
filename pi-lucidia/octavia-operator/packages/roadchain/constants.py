"""Chain-wide constants for RoadChain L1."""

# ── Supply ──────────────────────────────────────────────────────────
MAX_SUPPLY          = 21_000_000 * 10**8       # 21 M ROAD in base units
COIN                = 10**8                     # 1 ROAD = 10^8 units
INITIAL_REWARD      = 50 * COIN                # 50 ROAD per block
HALVING_INTERVAL    = 210_000                   # blocks between halvings

# ── Timing ──────────────────────────────────────────────────────────
TARGET_BLOCK_TIME   = 27                        # seconds
RETARGET_INTERVAL   = 2016                      # blocks between difficulty adjustments
RETARGET_TIMESPAN   = RETARGET_INTERVAL * TARGET_BLOCK_TIME  # 54,432 seconds

# ── Difficulty ──────────────────────────────────────────────────────
INITIAL_BITS        = 0x1f00ffff                # very easy starting difficulty
MAX_TARGET          = (0x00ffff * 2**(8*(0x1f - 3)))  # from INITIAL_BITS
MIN_DIFFICULTY      = 1

# ── Network ─────────────────────────────────────────────────────────
PROTOCOL_VERSION    = 1
NETWORK_MAGIC       = b"ROAD"
DEFAULT_PORT        = 27270
DEFAULT_RPC_PORT    = 27271
MAX_PEERS           = 32
USER_AGENT          = "/RoadChain:0.1.0/"

# ── Transaction ─────────────────────────────────────────────────────
MAX_TX_SIZE         = 100_000                   # bytes
MIN_FEE_PER_BYTE   = 1                         # base units per byte
COINBASE_MATURITY   = 100                       # blocks before coinbase spendable

# ── Genesis ─────────────────────────────────────────────────────────
GENESIS_MESSAGE     = "RoadChain Genesis -- BlackRoad OS, Inc. 2026"
GENESIS_TIMESTAMP   = 1771396528                # matches legacy block 0

# ── Paths ───────────────────────────────────────────────────────────
import pathlib
DATA_DIR            = pathlib.Path.home() / ".roadchain-l1"
LEGACY_DIR          = pathlib.Path.home() / ".roadchain"
