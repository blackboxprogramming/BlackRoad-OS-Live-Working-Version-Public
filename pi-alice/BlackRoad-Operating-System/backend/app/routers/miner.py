"""Mining statistics and control router - RoadCoin Miner integration."""
import asyncio
import hashlib
import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel

from app.database import get_db
from app.models.blockchain import Block, Wallet
from app.models.user import User
from app.routers.auth import get_current_user
from app.utils import utc_now

router = APIRouter(prefix="/api/miner", tags=["miner"])


# In-memory miner state (for simulation)
class MinerState:
    """Global miner state."""

    def __init__(self):
        self.is_mining = False
        self.hashrate_mhs = 0.0
        self.shares_submitted = 0
        self.shares_accepted = 0
        self.pool_url = "pool.roadcoin.network:3333"
        self.worker_id = "RoadMiner-1"
        self.started_at: Optional[datetime] = None
        self.temperature_celsius = 65.0
        self.power_watts = 120.0


miner_state = MinerState()


# Schemas
class MinerStatus(BaseModel):
    """Current miner status."""

    is_mining: bool
    hashrate_mhs: float
    shares_submitted: int
    shares_accepted: int
    shares_rejected: int
    pool_url: str
    worker_id: str
    uptime_seconds: int
    temperature_celsius: float
    power_watts: float
    efficiency_mhs_per_watt: float


class MinerStats(BaseModel):
    """Miner statistics."""

    blocks_mined: int
    roadcoins_earned: float
    current_hashrate_mhs: float
    average_hashrate_mhs: float
    total_shares: int
    accepted_shares: int
    rejected_shares: int
    last_block_time: Optional[datetime]
    mining_since: Optional[datetime]


class MinerControl(BaseModel):
    """Miner control commands."""

    action: str  # start, stop, restart
    pool_url: Optional[str] = None
    worker_id: Optional[str] = None


class RecentBlock(BaseModel):
    """Recent mined block info."""

    block_index: int
    block_hash: str
    reward: float
    timestamp: datetime
    difficulty: int

    class Config:
        from_attributes = True


# Routes

@router.get("/status", response_model=MinerStatus)
async def get_miner_status(
    current_user: User = Depends(get_current_user),
):
    """Get current miner status and performance metrics."""
    uptime_seconds = 0
    if miner_state.started_at:
        uptime_seconds = int((utc_now() - miner_state.started_at).total_seconds())

    # Simulate some variance in hashrate
    current_hashrate = miner_state.hashrate_mhs
    if miner_state.is_mining:
        current_hashrate = miner_state.hashrate_mhs + random.uniform(-2.0, 2.0)

    # Calculate efficiency
    efficiency = 0.0
    if miner_state.power_watts > 0:
        efficiency = current_hashrate / miner_state.power_watts

    rejected_shares = miner_state.shares_submitted - miner_state.shares_accepted

    return MinerStatus(
        is_mining=miner_state.is_mining,
        hashrate_mhs=round(current_hashrate, 2),
        shares_submitted=miner_state.shares_submitted,
        shares_accepted=miner_state.shares_accepted,
        shares_rejected=rejected_shares,
        pool_url=miner_state.pool_url,
        worker_id=miner_state.worker_id,
        uptime_seconds=uptime_seconds,
        temperature_celsius=miner_state.temperature_celsius,
        power_watts=miner_state.power_watts,
        efficiency_mhs_per_watt=round(efficiency, 4),
    )


@router.get("/stats", response_model=MinerStats)
async def get_miner_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get overall mining statistics."""
    # Get user's wallet
    wallet_result = await db.execute(
        select(Wallet).filter(Wallet.user_id == current_user.id)
    )
    wallet = wallet_result.scalar_one_or_none()

    if not wallet:
        return MinerStats(
            blocks_mined=0,
            roadcoins_earned=0.0,
            current_hashrate_mhs=miner_state.hashrate_mhs if miner_state.is_mining else 0.0,
            average_hashrate_mhs=0.0,
            total_shares=miner_state.shares_submitted,
            accepted_shares=miner_state.shares_accepted,
            rejected_shares=miner_state.shares_submitted - miner_state.shares_accepted,
            last_block_time=None,
            mining_since=miner_state.started_at,
        )

    miner_filter = Block.miner_address == wallet.address

    # Count blocks mined by this user
    blocks_count_result = await db.execute(
        select(func.count(Block.id)).filter(miner_filter)
    )
    blocks_mined = blocks_count_result.scalar() or 0

    # Sum rewards earned
    rewards_result = await db.execute(
        select(func.sum(Block.reward)).filter(miner_filter)
    )
    roadcoins_earned = rewards_result.scalar() or 0.0

    # Get last block mined
    last_block_result = await db.execute(
        select(Block)
        .filter(miner_filter)
        .order_by(desc(Block.timestamp))
        .limit(1)
    )
    last_block = last_block_result.scalar_one_or_none()

    # Calculate average hashrate (simulated based on blocks mined)
    average_hashrate = 0.0
    if blocks_mined > 0:
        # Rough estimate: difficulty 4 = ~40 MH/s average
        average_hashrate = 40.0 + (blocks_mined * 0.5)

    return MinerStats(
        blocks_mined=blocks_mined,
        roadcoins_earned=float(roadcoins_earned),
        current_hashrate_mhs=miner_state.hashrate_mhs if miner_state.is_mining else 0.0,
        average_hashrate_mhs=round(average_hashrate, 2),
        total_shares=miner_state.shares_submitted,
        accepted_shares=miner_state.shares_accepted,
        rejected_shares=miner_state.shares_submitted - miner_state.shares_accepted,
        last_block_time=last_block.timestamp if last_block else None,
        mining_since=miner_state.started_at,
    )


@router.get("/blocks", response_model=List[RecentBlock])
async def get_recent_blocks(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recently mined blocks by this user."""
    # Get user's wallet
    wallet_result = await db.execute(
        select(Wallet).filter(Wallet.user_id == current_user.id)
    )
    wallet = wallet_result.scalar_one_or_none()

    if not wallet:
        return []

    # Get recent blocks
    blocks_result = await db.execute(
        select(Block)
        .filter(Block.miner_address == wallet.address)
        .order_by(desc(Block.timestamp))
        .limit(limit)
    )
    blocks = blocks_result.scalars().all()

    return [
        RecentBlock(
            block_index=block.index,
            block_hash=block.hash,
            reward=block.reward,
            timestamp=block.timestamp,
            difficulty=block.difficulty,
        )
        for block in blocks
    ]


@router.post("/control")
async def control_miner(
    control: MinerControl,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """Control miner operations (start/stop/restart)."""
    if control.action == "start":
        if miner_state.is_mining:
            raise HTTPException(status_code=400, detail="Miner is already running")

        miner_state.is_mining = True
        miner_state.started_at = utc_now()
        miner_state.hashrate_mhs = random.uniform(38.0, 45.0)  # Simulate hashrate

        if control.pool_url:
            miner_state.pool_url = control.pool_url
        if control.worker_id:
            miner_state.worker_id = control.worker_id

        # Start background mining simulation
        background_tasks.add_task(simulate_mining)

        return {"message": "Miner started successfully", "status": "running"}

    elif control.action == "stop":
        if not miner_state.is_mining:
            raise HTTPException(status_code=400, detail="Miner is not running")

        miner_state.is_mining = False
        miner_state.hashrate_mhs = 0.0

        return {"message": "Miner stopped successfully", "status": "stopped"}

    elif control.action == "restart":
        miner_state.is_mining = False
        await asyncio.sleep(1)
        miner_state.is_mining = True
        miner_state.started_at = utc_now()
        miner_state.hashrate_mhs = random.uniform(38.0, 45.0)

        background_tasks.add_task(simulate_mining)

        return {"message": "Miner restarted successfully", "status": "running"}

    else:
        raise HTTPException(status_code=400, detail=f"Invalid action: {control.action}")


async def simulate_mining():
    """Background task to simulate mining activity."""
    while miner_state.is_mining:
        # Simulate share submission every 10-30 seconds
        await asyncio.sleep(random.uniform(10, 30))

        if not miner_state.is_mining:
            break

        miner_state.shares_submitted += 1

        # 95% acceptance rate
        if random.random() < 0.95:
            miner_state.shares_accepted += 1

        # Vary hashrate slightly
        miner_state.hashrate_mhs = random.uniform(38.0, 45.0)

        # Vary temperature
        miner_state.temperature_celsius = random.uniform(60.0, 75.0)


@router.get("/pool/info")
async def get_pool_info(
    current_user: User = Depends(get_current_user),
):
    """Get mining pool information."""
    return {
        "pool_url": miner_state.pool_url,
        "pool_name": "RoadCoin Mining Pool",
        "pool_hashrate": "2.4 GH/s",
        "connected_miners": 142,
        "pool_fee": "1%",
        "min_payout": 10.0,
        "payment_interval_hours": 24,
        "last_block_found": (utc_now() - timedelta(minutes=random.randint(5, 120))).isoformat(),
    }
