"""Blockchain and cryptocurrency models"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Wallet(Base):
    """Cryptocurrency wallet model"""

    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    address = Column(String(255), unique=True, nullable=False, index=True)
    private_key = Column(String(500), nullable=False)  # Encrypted
    public_key = Column(String(500), nullable=False)

    balance = Column(Float, default=0.0)

    # Metadata
    label = Column(String(100))
    is_primary = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Transaction(Base):
    """Blockchain transaction model"""

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    # Transaction details
    transaction_hash = Column(String(255), unique=True, nullable=False, index=True)
    from_address = Column(String(255), nullable=False, index=True)
    to_address = Column(String(255), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    fee = Column(Float, default=0.0)

    # Block information
    block_id = Column(Integer, ForeignKey("blocks.id", ondelete="SET NULL"))
    block_index = Column(Integer)

    # Status
    is_confirmed = Column(Boolean, default=False)
    confirmations = Column(Integer, default=0)

    # Metadata
    signature = Column(Text, nullable=False)
    message = Column(Text)  # Optional transaction message

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True))

    def __repr__(self):
        return f"<Transaction {self.transaction_hash}>"


class Block(Base):
    """Blockchain block model"""

    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)

    # Block data
    index = Column(Integer, unique=True, nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    nonce = Column(Integer, nullable=False)
    previous_hash = Column(String(255), nullable=False)
    hash = Column(String(255), unique=True, nullable=False, index=True)
    merkle_root = Column(String(255))

    # Mining
    miner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    miner_address = Column(String(255))
    difficulty = Column(Integer, nullable=False)
    reward = Column(Float, default=0.0)

    # Block metadata
    transaction_count = Column(Integer, default=0)
    size = Column(Integer)  # in bytes

    # Validation
    is_valid = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Block {self.index}>"
