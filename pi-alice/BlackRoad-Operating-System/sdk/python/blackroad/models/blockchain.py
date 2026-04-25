"""Blockchain models for the BlackRoad SDK."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Wallet(BaseModel):
    """Wallet model."""

    address: str
    balance: float = 0.0
    label: Optional[str] = None

    class Config:
        """Pydantic configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "address": "0x1234567890abcdef1234567890abcdef12345678",
                "balance": 100.0,
                "label": "Primary Wallet",
            }
        }


class Transaction(BaseModel):
    """Transaction model."""

    id: int
    transaction_hash: str
    from_address: str
    to_address: str
    amount: float
    fee: float = 0.0
    is_confirmed: bool = False
    confirmations: int = 0
    created_at: datetime

    class Config:
        """Pydantic configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "transaction_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
                "from_address": "0x1234567890abcdef",
                "to_address": "0xfedcba0987654321",
                "amount": 50.0,
                "fee": 0.001,
                "is_confirmed": True,
                "confirmations": 6,
                "created_at": "2024-01-01T00:00:00Z",
            }
        }


class Block(BaseModel):
    """Block model."""

    id: int
    index: int
    timestamp: datetime
    hash: str
    previous_hash: str
    nonce: int
    miner_address: Optional[str] = None
    difficulty: int
    reward: float = 0.0
    transaction_count: int = 0

    class Config:
        """Pydantic configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "index": 0,
                "timestamp": "2024-01-01T00:00:00Z",
                "hash": "0x0000abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
                "previous_hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "nonce": 12345,
                "miner_address": "0x1234567890abcdef",
                "difficulty": 4,
                "reward": 50.0,
                "transaction_count": 10,
            }
        }


class TransactionCreate(BaseModel):
    """Model for creating a transaction."""

    to_address: str = Field(..., description="Recipient wallet address")
    amount: float = Field(..., gt=0, description="Amount to transfer")
    message: Optional[str] = Field(None, description="Optional transaction message")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "to_address": "0xfedcba0987654321",
                "amount": 50.0,
                "message": "Payment for services",
            }
        }


class BlockchainStats(BaseModel):
    """Blockchain statistics model."""

    latest_block_index: int
    latest_block_hash: Optional[str]
    total_blocks: int
    total_transactions: int
    pending_transactions: int
    difficulty: int
    mining_reward: float

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "latest_block_index": 1000,
                "latest_block_hash": "0x0000abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
                "total_blocks": 1001,
                "total_transactions": 5000,
                "pending_transactions": 10,
                "difficulty": 4,
                "mining_reward": 50.0,
            }
        }
