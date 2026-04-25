"""Authentication client for the BlackRoad SDK."""

from typing import TYPE_CHECKING, Optional

from .models.user import Token, User, UserCreate

if TYPE_CHECKING:
    from .utils.http import AsyncHTTPClient, HTTPClient


class AuthClient:
    """Synchronous authentication client."""

    def __init__(self, http_client: "HTTPClient") -> None:
        """
        Initialize the auth client.

        Args:
            http_client: HTTP client instance
        """
        self._client = http_client

    def register(
        self,
        username: str,
        email: str,
        password: str,
        full_name: Optional[str] = None,
    ) -> User:
        """
        Register a new user.

        Args:
            username: Username (3-50 characters)
            email: Email address
            password: Password (min 8 characters)
            full_name: Full name (optional)

        Returns:
            Created user

        Raises:
            ValidationError: If validation fails
            AuthenticationError: If user already exists
        """
        user_data = UserCreate(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
        )

        response = self._client.post(
            "/api/auth/register",
            json=user_data.model_dump(exclude_none=True),
        )

        return User(**response)

    def login(self, username: str, password: str) -> Token:
        """
        Login and get access token.

        Args:
            username: Username
            password: Password

        Returns:
            Authentication token

        Raises:
            AuthenticationError: If credentials are invalid
        """
        response = self._client.post(
            "/api/auth/login",
            data={
                "username": username,
                "password": password,
            },
        )

        return Token(**response)

    def me(self) -> User:
        """
        Get current user information.

        Returns:
            Current user

        Raises:
            AuthenticationError: If not authenticated
        """
        response = self._client.get("/api/auth/me")
        return User(**response)

    def logout(self) -> dict:
        """
        Logout current session.

        Returns:
            Logout confirmation
        """
        return self._client.post("/api/auth/logout")


class AsyncAuthClient:
    """Asynchronous authentication client."""

    def __init__(self, http_client: "AsyncHTTPClient") -> None:
        """
        Initialize the async auth client.

        Args:
            http_client: Async HTTP client instance
        """
        self._client = http_client

    async def register(
        self,
        username: str,
        email: str,
        password: str,
        full_name: Optional[str] = None,
    ) -> User:
        """
        Register a new user.

        Args:
            username: Username (3-50 characters)
            email: Email address
            password: Password (min 8 characters)
            full_name: Full name (optional)

        Returns:
            Created user

        Raises:
            ValidationError: If validation fails
            AuthenticationError: If user already exists
        """
        user_data = UserCreate(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
        )

        response = await self._client.post(
            "/api/auth/register",
            json=user_data.model_dump(exclude_none=True),
        )

        return User(**response)

    async def login(self, username: str, password: str) -> Token:
        """
        Login and get access token.

        Args:
            username: Username
            password: Password

        Returns:
            Authentication token

        Raises:
            AuthenticationError: If credentials are invalid
        """
        response = await self._client.post(
            "/api/auth/login",
            data={
                "username": username,
                "password": password,
            },
        )

        return Token(**response)

    async def me(self) -> User:
        """
        Get current user information.

        Returns:
            Current user

        Raises:
            AuthenticationError: If not authenticated
        """
        response = await self._client.get("/api/auth/me")
        return User(**response)

    async def logout(self) -> dict:
        """
        Logout current session.

        Returns:
            Logout confirmation
        """
        return await self._client.post("/api/auth/logout")
