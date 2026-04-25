"""Blockchain client for the BlackRoad SDK."""

from typing import TYPE_CHECKING, List, Optional

from .models.blockchain import Block, BlockchainStats, Transaction, TransactionCreate, Wallet

if TYPE_CHECKING:
    from .utils.http import AsyncHTTPClient, HTTPClient


class BlockchainClient:
    """Synchronous blockchain client."""

    def __init__(self, http_client: "HTTPClient") -> None:
        """
        Initialize the blockchain client.

        Args:
            http_client: HTTP client instance
        """
        self._client = http_client

    def get_wallet(self) -> Wallet:
        """
        Get user's wallet information.

        Returns:
            Wallet information

        Raises:
            AuthenticationError: If not authenticated
        """
        response = self._client.get("/api/blockchain/wallet")
        return Wallet(**response)

    def get_balance(self) -> dict:
        """
        Get wallet balance.

        Returns:
            Dictionary with address and balance

        Raises:
            AuthenticationError: If not authenticated
        """
        return self._client.get("/api/blockchain/balance")

    def create_transaction(
        self,
        to_address: str,
        amount: float,
        message: Optional[str] = None,
    ) -> Transaction:
        """
        Create a new transaction.

        Args:
            to_address: Recipient wallet address
            amount: Amount to transfer (must be positive)
            message: Optional transaction message

        Returns:
            Created transaction

        Raises:
            ValidationError: If validation fails
            BlockchainError: If transaction fails
            AuthenticationError: If not authenticated
        """
        tx_data = TransactionCreate(
            to_address=to_address,
            amount=amount,
            message=message,
        )

        response = self._client.post(
            "/api/blockchain/transactions",
            json=tx_data.model_dump(exclude_none=True),
        )

        return Transaction(**response)

    def get_transactions(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Transaction]:
        """
        Get user's transaction history.

        Args:
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip

        Returns:
            List of transactions

        Raises:
            AuthenticationError: If not authenticated
        """
        response = self._client.get(
            "/api/blockchain/transactions",
            params={"limit": limit, "offset": offset},
        )

        return [Transaction(**tx) for tx in response]

    def get_transaction(self, tx_hash: str) -> Transaction:
        """
        Get transaction by hash.

        Args:
            tx_hash: Transaction hash

        Returns:
            Transaction

        Raises:
            NotFoundError: If transaction not found
        """
        response = self._client.get(f"/api/blockchain/transactions/{tx_hash}")
        return Transaction(**response)

    def get_blocks(
        self,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Block]:
        """
        Get blockchain blocks.

        Args:
            limit: Maximum number of blocks to return
            offset: Number of blocks to skip

        Returns:
            List of blocks
        """
        response = self._client.get(
            "/api/blockchain/blocks",
            params={"limit": limit, "offset": offset},
        )

        return [Block(**block) for block in response]

    def get_block(self, block_id: int) -> Block:
        """
        Get block by ID or index.

        Args:
            block_id: Block ID or index

        Returns:
            Block

        Raises:
            NotFoundError: If block not found
        """
        response = self._client.get(f"/api/blockchain/blocks/{block_id}")
        return Block(**response)

    def mine_block(self) -> Block:
        """
        Mine a new block.

        Returns:
            Mined block

        Raises:
            AuthenticationError: If not authenticated
            BlockchainError: If mining fails
        """
        response = self._client.post("/api/blockchain/mine")
        return Block(**response)

    def get_stats(self) -> BlockchainStats:
        """
        Get blockchain statistics.

        Returns:
            Blockchain statistics
        """
        response = self._client.get("/api/blockchain/stats")
        return BlockchainStats(**response)


class AsyncBlockchainClient:
    """Asynchronous blockchain client."""

    def __init__(self, http_client: "AsyncHTTPClient") -> None:
        """
        Initialize the async blockchain client.

        Args:
            http_client: Async HTTP client instance
        """
        self._client = http_client

    async def get_wallet(self) -> Wallet:
        """
        Get user's wallet information.

        Returns:
            Wallet information

        Raises:
            AuthenticationError: If not authenticated
        """
        response = await self._client.get("/api/blockchain/wallet")
        return Wallet(**response)

    async def get_balance(self) -> dict:
        """
        Get wallet balance.

        Returns:
            Dictionary with address and balance

        Raises:
            AuthenticationError: If not authenticated
        """
        return await self._client.get("/api/blockchain/balance")

    async def create_transaction(
        self,
        to_address: str,
        amount: float,
        message: Optional[str] = None,
    ) -> Transaction:
        """
        Create a new transaction.

        Args:
            to_address: Recipient wallet address
            amount: Amount to transfer (must be positive)
            message: Optional transaction message

        Returns:
            Created transaction

        Raises:
            ValidationError: If validation fails
            BlockchainError: If transaction fails
            AuthenticationError: If not authenticated
        """
        tx_data = TransactionCreate(
            to_address=to_address,
            amount=amount,
            message=message,
        )

        response = await self._client.post(
            "/api/blockchain/transactions",
            json=tx_data.model_dump(exclude_none=True),
        )

        return Transaction(**response)

    async def get_transactions(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Transaction]:
        """
        Get user's transaction history.

        Args:
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip

        Returns:
            List of transactions

        Raises:
            AuthenticationError: If not authenticated
        """
        response = await self._client.get(
            "/api/blockchain/transactions",
            params={"limit": limit, "offset": offset},
        )

        return [Transaction(**tx) for tx in response]

    async def get_transaction(self, tx_hash: str) -> Transaction:
        """
        Get transaction by hash.

        Args:
            tx_hash: Transaction hash

        Returns:
            Transaction

        Raises:
            NotFoundError: If transaction not found
        """
        response = await self._client.get(f"/api/blockchain/transactions/{tx_hash}")
        return Transaction(**response)

    async def get_blocks(
        self,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Block]:
        """
        Get blockchain blocks.

        Args:
            limit: Maximum number of blocks to return
            offset: Number of blocks to skip

        Returns:
            List of blocks
        """
        response = await self._client.get(
            "/api/blockchain/blocks",
            params={"limit": limit, "offset": offset},
        )

        return [Block(**block) for block in response]

    async def get_block(self, block_id: int) -> Block:
        """
        Get block by ID or index.

        Args:
            block_id: Block ID or index

        Returns:
            Block

        Raises:
            NotFoundError: If block not found
        """
        response = await self._client.get(f"/api/blockchain/blocks/{block_id}")
        return Block(**response)

    async def mine_block(self) -> Block:
        """
        Mine a new block.

        Returns:
            Mined block

        Raises:
            AuthenticationError: If not authenticated
            BlockchainError: If mining fails
        """
        response = await self._client.post("/api/blockchain/mine")
        return Block(**response)

    async def get_stats(self) -> BlockchainStats:
        """
        Get blockchain statistics.

        Returns:
            Blockchain statistics
        """
        response = await self._client.get("/api/blockchain/stats")
        return BlockchainStats(**response)
