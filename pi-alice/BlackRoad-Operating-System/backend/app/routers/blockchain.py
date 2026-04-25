"""Blockchain and cryptocurrency routes"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.blockchain import Block, Transaction, Wallet
from app.auth import get_current_active_user
from app.services.blockchain import BlockchainService
from app.services.crypto import WalletKeyDecryptionError

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain"])


MIN_TRANSACTION_AMOUNT = 0.0001


class TransactionCreate(BaseModel):
    to_address: str
    amount: float = Field(gt=0, description="Amount to transfer; must be positive")
    message: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    transaction_hash: str
    from_address: str
    to_address: str
    amount: float
    fee: float
    is_confirmed: bool
    confirmations: int
    created_at: datetime

    class Config:
        from_attributes = True


class BlockResponse(BaseModel):
    id: int
    index: int
    timestamp: datetime
    hash: str
    previous_hash: str
    nonce: int
    miner_address: Optional[str]
    difficulty: int
    reward: float
    transaction_count: int

    class Config:
        from_attributes = True


class WalletResponse(BaseModel):
    address: str
    balance: float
    label: Optional[str]

    class Config:
        from_attributes = True


@router.get("/wallet", response_model=WalletResponse)
async def get_wallet(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's wallet"""
    return WalletResponse(
        address=current_user.wallet_address,
        balance=current_user.balance,
        label="Primary Wallet"
    )


@router.get("/balance")
async def get_balance(
    current_user: User = Depends(get_current_active_user)
):
    """Get wallet balance"""
    return {
        "address": current_user.wallet_address,
        "balance": current_user.balance
    }


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    tx_data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new transaction"""
    if tx_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction amount must be greater than zero"
        )

    if tx_data.amount < MIN_TRANSACTION_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transactions must be at least {MIN_TRANSACTION_AMOUNT} tokens"
        )

    # Check balance
    if current_user.balance < tx_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )

    # Find recipient
    result = await db.execute(
        select(User).where(User.wallet_address == tx_data.to_address)
    )
    recipient = result.scalar_one_or_none()

    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient wallet not found"
        )

    # Create transaction
    try:
        transaction = await BlockchainService.create_transaction(
            db=db,
            from_address=current_user.wallet_address,
            to_address=tx_data.to_address,
            amount=tx_data.amount,
            encrypted_private_key=current_user.wallet_private_key
        )
    except WalletKeyDecryptionError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Wallet key could not be decrypted"
        )

    # Update balances (simplified - in production would be done on block confirmation)
    if tx_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction amount must be greater than zero"
        )
    current_user.balance -= tx_data.amount
    recipient.balance += tx_data.amount

    await db.commit()
    await db.refresh(transaction)

    return transaction


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get user's transactions"""
    result = await db.execute(
        select(Transaction)
        .where(
            or_(
                Transaction.from_address == current_user.wallet_address,
                Transaction.to_address == current_user.wallet_address
            )
        )
        .order_by(desc(Transaction.created_at))
        .limit(limit)
        .offset(offset)
    )
    transactions = result.scalars().all()

    return transactions


@router.get("/transactions/{tx_hash}", response_model=TransactionResponse)
async def get_transaction(
    tx_hash: str,
    db: AsyncSession = Depends(get_db)
):
    """Get transaction by hash"""
    result = await db.execute(
        select(Transaction).where(Transaction.transaction_hash == tx_hash)
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return transaction


@router.get("/blocks", response_model=List[BlockResponse])
async def get_blocks(
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """Get blockchain blocks"""
    result = await db.execute(
        select(Block)
        .order_by(desc(Block.index))
        .limit(limit)
        .offset(offset)
    )
    blocks = result.scalars().all()

    return blocks


@router.get("/blocks/{block_id}", response_model=BlockResponse)
async def get_block(
    block_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get block by ID or index"""
    result = await db.execute(
        select(Block).where(
            or_(
                Block.id == block_id,
                Block.index == block_id
            )
        )
    )
    block = result.scalar_one_or_none()

    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Block not found"
        )

    return block


@router.post("/mine", response_model=BlockResponse)
async def mine_block(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Mine a new block"""
    # Get pending transactions
    result = await db.execute(
        select(Transaction)
        .where(Transaction.is_confirmed == False)
        .limit(10)
    )
    pending_transactions = list(result.scalars().all())

    # Mine block
    block = await BlockchainService.mine_block(
        db=db,
        user=current_user,
        transactions=pending_transactions
    )

    return block


@router.get("/stats")
async def get_blockchain_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get blockchain statistics"""
    # Get latest block
    latest_block = await BlockchainService.get_latest_block(db)

    # Get total transactions
    result = await db.execute(select(func.count(Transaction.id)))
    total_transactions = result.scalar() or 0

    # Get pending transactions
    result = await db.execute(
        select(func.count(Transaction.id))
        .where(Transaction.is_confirmed == False)
    )
    pending_transactions = result.scalar() or 0

    return {
        "latest_block_index": latest_block.index if latest_block else 0,
        "latest_block_hash": latest_block.hash if latest_block else None,
        "total_blocks": latest_block.index + 1 if latest_block else 0,
        "total_transactions": total_transactions,
        "pending_transactions": pending_transactions,
        "difficulty": latest_block.difficulty if latest_block else 4,
        "mining_reward": latest_block.reward if latest_block else 50.0
    }
