"""Blockchain service"""
import hashlib
import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.blockchain import Block, Transaction, Wallet
from app.models.user import User
from app.config import settings
from app.services.crypto import wallet_crypto, WalletKeyDecryptionError
from app.utils import utc_now
import secrets


class BlockchainService:
    """Blockchain service for RoadCoin"""

    @staticmethod
    def calculate_hash(index: int, timestamp: str, previous_hash: str,
                      transactions: List[dict], nonce: int) -> str:
        """Calculate block hash"""
        data = f"{index}{timestamp}{previous_hash}{json.dumps(transactions)}{nonce}"
        return hashlib.sha256(data.encode()).hexdigest()

    @staticmethod
    async def create_genesis_block(db: AsyncSession) -> Block:
        """Create the genesis block"""
        result = await db.execute(select(Block).where(Block.index == 0))
        existing = result.scalar_one_or_none()

        if existing:
            return existing

        timestamp = utc_now()
        genesis_hash = BlockchainService.calculate_hash(0, str(timestamp), "0", [], 0)

        genesis_block = Block(
            index=0,
            timestamp=timestamp,
            nonce=0,
            previous_hash="0",
            hash=genesis_hash,
            difficulty=settings.BLOCKCHAIN_DIFFICULTY,
            reward=0,
            transaction_count=0,
            is_valid=True
        )

        db.add(genesis_block)
        await db.commit()
        await db.refresh(genesis_block)

        return genesis_block

    @staticmethod
    async def get_latest_block(db: AsyncSession) -> Optional[Block]:
        """Get the latest block in the chain"""
        result = await db.execute(
            select(Block).order_by(desc(Block.index)).limit(1)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def mine_block(db: AsyncSession, user: User, transactions: List[Transaction]) -> Block:
        """Mine a new block"""
        latest_block = await BlockchainService.get_latest_block(db)

        if not latest_block:
            latest_block = await BlockchainService.create_genesis_block(db)

        new_index = latest_block.index + 1
        timestamp = utc_now()
        previous_hash = latest_block.hash
        difficulty = settings.BLOCKCHAIN_DIFFICULTY

        # Convert transactions to dict for hashing
        tx_data = [
            {
                "from": tx.from_address,
                "to": tx.to_address,
                "amount": tx.amount
            }
            for tx in transactions
        ]

        # Mining (proof of work)
        nonce = 0
        block_hash = ""
        target = "0" * difficulty

        while not block_hash.startswith(target):
            nonce += 1
            block_hash = BlockchainService.calculate_hash(
                new_index, str(timestamp), previous_hash, tx_data, nonce
            )

        # Create new block
        new_block = Block(
            index=new_index,
            timestamp=timestamp,
            nonce=nonce,
            previous_hash=previous_hash,
            hash=block_hash,
            miner_id=user.id,
            miner_address=user.wallet_address,
            difficulty=difficulty,
            reward=settings.MINING_REWARD,
            transaction_count=len(transactions),
            is_valid=True
        )

        db.add(new_block)

        # Update transaction confirmations
        for tx in transactions:
            tx.block_id = new_block.id
            tx.block_index = new_block.index
            tx.is_confirmed = True
            tx.confirmations = 1
            tx.confirmed_at = utc_now()

        # Reward miner
        user.balance += settings.MINING_REWARD

        await db.commit()
        await db.refresh(new_block)

        return new_block

    @staticmethod
    def generate_wallet_address() -> tuple[str, str, str]:
        """Generate a new wallet address, private key and public key"""
        private_key = secrets.token_hex(32)
        public_key = hashlib.sha256(private_key.encode()).hexdigest()
        address = "RD" + hashlib.sha256(public_key.encode()).hexdigest()[:38]
        return address, private_key, public_key

    @staticmethod
    async def create_transaction(
        db: AsyncSession,
        from_address: str,
        to_address: str,
        amount: float,
        encrypted_private_key: str
    ) -> Transaction:
        """Create a new transaction"""
        try:
            private_key = wallet_crypto.decrypt(encrypted_private_key)
        except WalletKeyDecryptionError as exc:
            raise WalletKeyDecryptionError(
                "Unable to decrypt wallet key for transaction"
            ) from exc

        # Generate transaction hash
        tx_data = f"{from_address}{to_address}{amount}{utc_now()}"
        transaction_hash = hashlib.sha256(tx_data.encode()).hexdigest()

        # Sign transaction (simplified)
        signature = hashlib.sha256(f"{transaction_hash}{private_key}".encode()).hexdigest()

        transaction = Transaction(
            transaction_hash=transaction_hash,
            from_address=from_address,
            to_address=to_address,
            amount=amount,
            signature=signature,
            is_confirmed=False,
            confirmations=0
        )

        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)

        return transaction
