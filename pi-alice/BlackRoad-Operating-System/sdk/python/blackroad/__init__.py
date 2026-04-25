"""
BlackRoad Python SDK
====================

Official Python SDK for the BlackRoad Operating System.

Basic usage:
    >>> from blackroad import BlackRoadClient
    >>> client = BlackRoadClient(base_url="http://localhost:8000")
    >>> token = client.auth.login(username="user", password="pass")
    >>> client.set_token(token.access_token)
    >>> wallet = client.blockchain.get_wallet()
    >>> print(f"Balance: {wallet.balance}")

Async usage:
    >>> import asyncio
    >>> from blackroad import AsyncBlackRoadClient
    >>>
    >>> async def main():
    ...     async with AsyncBlackRoadClient(base_url="http://localhost:8000") as client:
    ...         token = await client.auth.login(username="user", password="pass")
    ...         client.set_token(token.access_token)
    ...         wallet = await client.blockchain.get_wallet()
    ...         print(f"Balance: {wallet.balance}")
    >>>
    >>> asyncio.run(main())
"""

__version__ = "0.1.0"
__author__ = "BlackRoad Team"
__email__ = "support@blackroad.dev"

# Main clients
from .client import AsyncBlackRoadClient, BlackRoadClient

# Exceptions
from .exceptions import (
    AgentError,
    AuthenticationError,
    AuthorizationError,
    BlackRoadError,
    BlockchainError,
    ConfigurationError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    ServerError,
    TimeoutError,
    ValidationError,
)

# Models
from .models import (
    AgentInfo,
    AgentMetadata,
    AgentResult,
    AgentStatus,
    Block,
    BlockchainStats,
    Token,
    Transaction,
    User,
    UserCreate,
    Wallet,
)

__all__ = [
    # Version
    "__version__",
    "__author__",
    "__email__",
    # Clients
    "BlackRoadClient",
    "AsyncBlackRoadClient",
    # Exceptions
    "BlackRoadError",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "ValidationError",
    "RateLimitError",
    "ServerError",
    "NetworkError",
    "TimeoutError",
    "BlockchainError",
    "AgentError",
    "ConfigurationError",
    # Models
    "User",
    "UserCreate",
    "Token",
    "Wallet",
    "Transaction",
    "Block",
    "BlockchainStats",
    "AgentInfo",
    "AgentResult",
    "AgentStatus",
    "AgentMetadata",
]
