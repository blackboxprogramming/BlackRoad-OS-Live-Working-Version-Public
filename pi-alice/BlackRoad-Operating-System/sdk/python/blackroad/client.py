"""Main client for the BlackRoad SDK."""

import os
from typing import Any, Callable, Optional

from .agents import AgentsClient, AsyncAgentsClient
from .auth import AsyncAuthClient, AuthClient
from .blockchain import AsyncBlockchainClient, BlockchainClient
from .utils.http import AsyncHTTPClient, HTTPClient


class BlackRoadClient:
    """
    Synchronous BlackRoad client.

    Example:
        >>> from blackroad import BlackRoadClient
        >>> client = BlackRoadClient(base_url="http://localhost:8000")
        >>> token = client.auth.login(username="user", password="pass")
        >>> client.set_token(token.access_token)
        >>> wallet = client.blockchain.get_wallet()
        >>> print(f"Balance: {wallet.balance}")
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ) -> None:
        """
        Initialize the BlackRoad client.

        Args:
            base_url: Base URL of the BlackRoad API (defaults to BLACKROAD_BASE_URL env var)
            api_key: API key for authentication (defaults to BLACKROAD_API_KEY env var)
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries for failed requests
            retry_delay: Delay between retries in seconds

        Raises:
            ConfigurationError: If base_url is not provided and not in environment
        """
        from .exceptions import ConfigurationError

        self._base_url = base_url or os.getenv("BLACKROAD_BASE_URL")
        if not self._base_url:
            raise ConfigurationError(
                "base_url must be provided or set BLACKROAD_BASE_URL environment variable"
            )

        self._api_key = api_key or os.getenv("BLACKROAD_API_KEY")

        # Initialize HTTP client
        headers = {}
        if self._api_key:
            headers["X-API-Key"] = self._api_key

        self._http = HTTPClient(
            base_url=self._base_url,
            timeout=timeout,
            max_retries=max_retries,
            retry_delay=retry_delay,
            headers=headers,
        )

        # Initialize service clients
        self.auth = AuthClient(self._http)
        self.blockchain = BlockchainClient(self._http)
        self.agents = AgentsClient(self._http)

    def set_token(self, token: str) -> None:
        """
        Set the authentication token.

        Args:
            token: JWT access token

        Example:
            >>> token = client.auth.login(username="user", password="pass")
            >>> client.set_token(token.access_token)
        """
        self._http.add_header("Authorization", f"Bearer {token}")

    def clear_token(self) -> None:
        """
        Clear the authentication token.

        Example:
            >>> client.clear_token()
        """
        self._http.remove_header("Authorization")

    def add_header(self, key: str, value: str) -> None:
        """
        Add a custom header to all requests.

        Args:
            key: Header name
            value: Header value

        Example:
            >>> client.add_header("X-Custom-Header", "value")
        """
        self._http.add_header(key, value)

    def remove_header(self, key: str) -> None:
        """
        Remove a custom header.

        Args:
            key: Header name

        Example:
            >>> client.remove_header("X-Custom-Header")
        """
        self._http.remove_header(key)

    def add_request_interceptor(self, interceptor: Callable) -> None:
        """
        Add a request interceptor.

        Args:
            interceptor: Function that takes (method, url, **kwargs) and returns them

        Example:
            >>> def log_request(method, url, **kwargs):
            ...     print(f"{method} {url}")
            ...     return method, url, kwargs
            >>> client.add_request_interceptor(log_request)
        """
        self._http.add_request_interceptor(interceptor)

    def add_response_interceptor(self, interceptor: Callable) -> None:
        """
        Add a response interceptor.

        Args:
            interceptor: Function that takes response and returns it

        Example:
            >>> def log_response(response):
            ...     print(f"Status: {response.status_code}")
            ...     return response
            >>> client.add_response_interceptor(log_response)
        """
        self._http.add_response_interceptor(interceptor)

    def close(self) -> None:
        """
        Close the client and cleanup resources.

        Example:
            >>> client.close()
        """
        self._http.close()

    def __enter__(self) -> "BlackRoadClient":
        """Context manager entry."""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Context manager exit."""
        self.close()


class AsyncBlackRoadClient:
    """
    Asynchronous BlackRoad client.

    Example:
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

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ) -> None:
        """
        Initialize the async BlackRoad client.

        Args:
            base_url: Base URL of the BlackRoad API (defaults to BLACKROAD_BASE_URL env var)
            api_key: API key for authentication (defaults to BLACKROAD_API_KEY env var)
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries for failed requests
            retry_delay: Delay between retries in seconds

        Raises:
            ConfigurationError: If base_url is not provided and not in environment
        """
        from .exceptions import ConfigurationError

        self._base_url = base_url or os.getenv("BLACKROAD_BASE_URL")
        if not self._base_url:
            raise ConfigurationError(
                "base_url must be provided or set BLACKROAD_BASE_URL environment variable"
            )

        self._api_key = api_key or os.getenv("BLACKROAD_API_KEY")

        # Initialize HTTP client
        headers = {}
        if self._api_key:
            headers["X-API-Key"] = self._api_key

        self._http = AsyncHTTPClient(
            base_url=self._base_url,
            timeout=timeout,
            max_retries=max_retries,
            retry_delay=retry_delay,
            headers=headers,
        )

        # Initialize service clients
        self.auth = AsyncAuthClient(self._http)
        self.blockchain = AsyncBlockchainClient(self._http)
        self.agents = AsyncAgentsClient(self._http)

    def set_token(self, token: str) -> None:
        """
        Set the authentication token.

        Args:
            token: JWT access token

        Example:
            >>> token = await client.auth.login(username="user", password="pass")
            >>> client.set_token(token.access_token)
        """
        self._http.add_header("Authorization", f"Bearer {token}")

    def clear_token(self) -> None:
        """
        Clear the authentication token.

        Example:
            >>> client.clear_token()
        """
        self._http.remove_header("Authorization")

    def add_header(self, key: str, value: str) -> None:
        """
        Add a custom header to all requests.

        Args:
            key: Header name
            value: Header value

        Example:
            >>> client.add_header("X-Custom-Header", "value")
        """
        self._http.add_header(key, value)

    def remove_header(self, key: str) -> None:
        """
        Remove a custom header.

        Args:
            key: Header name

        Example:
            >>> client.remove_header("X-Custom-Header")
        """
        self._http.remove_header(key)

    def add_request_interceptor(self, interceptor: Callable) -> None:
        """
        Add a request interceptor.

        Args:
            interceptor: Async function that takes (method, url, **kwargs) and returns them

        Example:
            >>> async def log_request(method, url, **kwargs):
            ...     print(f"{method} {url}")
            ...     return method, url, kwargs
            >>> client.add_request_interceptor(log_request)
        """
        self._http.add_request_interceptor(interceptor)

    def add_response_interceptor(self, interceptor: Callable) -> None:
        """
        Add a response interceptor.

        Args:
            interceptor: Async function that takes response and returns it

        Example:
            >>> async def log_response(response):
            ...     print(f"Status: {response.status_code}")
            ...     return response
            >>> client.add_response_interceptor(log_response)
        """
        self._http.add_response_interceptor(interceptor)

    async def close(self) -> None:
        """
        Close the client and cleanup resources.

        Example:
            >>> await client.close()
        """
        await self._http.close()

    async def __aenter__(self) -> "AsyncBlackRoadClient":
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Async context manager exit."""
        await self.close()
