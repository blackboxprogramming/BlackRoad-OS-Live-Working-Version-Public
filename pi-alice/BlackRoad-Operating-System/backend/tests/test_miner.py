"""Miner integration tests"""
from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blockchain import Block


async def _create_block(
    db_session: AsyncSession,
    *,
    index: int,
    timestamp: datetime,
    miner_id: int,
    miner_address: str,
    reward: float,
) -> None:
    """Helper to insert a block for tests."""
    block = Block(
        index=index,
        timestamp=timestamp,
        nonce=index,
        previous_hash=f"prev-{index}",
        hash=f"hash-{index}-{miner_address}",
        miner_id=miner_id,
        miner_address=miner_address,
        difficulty=4,
        reward=reward,
        transaction_count=0,
        is_valid=True,
    )
    db_session.add(block)


@pytest.mark.asyncio
async def test_miner_stats_respects_wallet(
    client: AsyncClient,
    auth_headers,
    db_session: AsyncSession,
    test_user,
):
    """Ensure /api/miner/stats reports only the authenticated user's blocks."""
    wallet_address = test_user["wallet_address"]
    user_id = test_user["id"]
    now = datetime.now(timezone.utc)

    await _create_block(
        db_session,
        index=1,
        timestamp=now - timedelta(minutes=5),
        miner_id=user_id,
        miner_address=wallet_address,
        reward=40.0,
    )
    await _create_block(
        db_session,
        index=2,
        timestamp=now - timedelta(minutes=1),
        miner_id=user_id,
        miner_address=wallet_address,
        reward=60.0,
    )
    await _create_block(
        db_session,
        index=3,
        timestamp=now - timedelta(minutes=2),
        miner_id=user_id + 100,
        miner_address="RDOTHER000000000000000000000000000000",  # Different miner
        reward=75.0,
    )
    await db_session.commit()

    response = await client.get("/api/miner/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["blocks_mined"] == 2
    assert pytest.approx(data["roadcoins_earned"], rel=1e-3) == 100.0
    assert data["last_block_time"] is not None


@pytest.mark.asyncio
async def test_miner_blocks_endpoint_returns_only_user_blocks(
    client: AsyncClient,
    auth_headers,
    db_session: AsyncSession,
    test_user,
):
    """Ensure /api/miner/blocks only returns the authenticated user's blocks."""
    wallet_address = test_user["wallet_address"]
    user_id = test_user["id"]
    now = datetime.now(timezone.utc)

    await _create_block(
        db_session,
        index=5,
        timestamp=now - timedelta(minutes=10),
        miner_id=user_id,
        miner_address=wallet_address,
        reward=25.0,
    )
    await _create_block(
        db_session,
        index=6,
        timestamp=now - timedelta(minutes=3),
        miner_id=user_id,
        miner_address=wallet_address,
        reward=30.0,
    )
    await _create_block(
        db_session,
        index=7,
        timestamp=now - timedelta(minutes=1),
        miner_id=user_id + 200,
        miner_address="RDANOTHER0000000000000000000000000000",
        reward=55.0,
    )
    await db_session.commit()

    response = await client.get("/api/miner/blocks", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2
    returned_indexes = {block["block_index"] for block in data}
    assert returned_indexes == {5, 6}
    # Ensure results are sorted by timestamp desc (latest first)
    assert data[0]["block_index"] == 6
