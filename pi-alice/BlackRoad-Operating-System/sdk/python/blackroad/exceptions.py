"""Custom exceptions for the BlackRoad SDK."""

from typing import Any, Dict, Optional


class BlackRoadError(Exception):
    """Base exception for all BlackRoad SDK errors."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        response: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Initialize the exception.

        Args:
            message: Error message
            status_code: HTTP status code if applicable
            response: Response data if applicable
        """
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.response = response

    def __str__(self) -> str:
        """Return string representation of the error."""
        if self.status_code:
            return f"[{self.status_code}] {self.message}"
        return self.message


class AuthenticationError(BlackRoadError):
    """Raised when authentication fails."""

    pass


class AuthorizationError(BlackRoadError):
    """Raised when user is not authorized to perform an action."""

    pass


class NotFoundError(BlackRoadError):
    """Raised when a resource is not found."""

    pass


class ValidationError(BlackRoadError):
    """Raised when request validation fails."""

    pass


class RateLimitError(BlackRoadError):
    """Raised when rate limit is exceeded."""

    def __init__(
        self,
        message: str,
        retry_after: Optional[int] = None,
        status_code: Optional[int] = None,
        response: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Initialize the rate limit exception.

        Args:
            message: Error message
            retry_after: Number of seconds to wait before retrying
            status_code: HTTP status code
            response: Response data
        """
        super().__init__(message, status_code, response)
        self.retry_after = retry_after


class ServerError(BlackRoadError):
    """Raised when the server returns a 5xx error."""

    pass


class NetworkError(BlackRoadError):
    """Raised when a network error occurs."""

    pass


class TimeoutError(BlackRoadError):
    """Raised when a request times out."""

    pass


class BlockchainError(BlackRoadError):
    """Raised when a blockchain operation fails."""

    pass


class AgentError(BlackRoadError):
    """Raised when an agent operation fails."""

    pass


class ConfigurationError(BlackRoadError):
    """Raised when there's a configuration error."""

    pass


def error_from_response(status_code: int, response_data: Optional[Dict[str, Any]] = None) -> BlackRoadError:
    """
    Create an appropriate exception from an HTTP response.

    Args:
        status_code: HTTP status code
        response_data: Response data

    Returns:
        Appropriate exception instance
    """
    message = "An error occurred"

    if response_data:
        # Try to extract message from different response formats
        if isinstance(response_data, dict):
            message = (
                response_data.get("detail")
                or response_data.get("message")
                or response_data.get("error")
                or str(response_data)
            )
        else:
            message = str(response_data)

    # Map status codes to exceptions
    if status_code == 401:
        return AuthenticationError(message, status_code, response_data)
    elif status_code == 403:
        return AuthorizationError(message, status_code, response_data)
    elif status_code == 404:
        return NotFoundError(message, status_code, response_data)
    elif status_code == 422:
        return ValidationError(message, status_code, response_data)
    elif status_code == 429:
        retry_after = None
        if response_data and isinstance(response_data, dict):
            retry_after = response_data.get("retry_after")
        return RateLimitError(message, retry_after, status_code, response_data)
    elif 400 <= status_code < 500:
        return ValidationError(message, status_code, response_data)
    elif 500 <= status_code < 600:
        return ServerError(message, status_code, response_data)
    else:
        return BlackRoadError(message, status_code, response_data)
