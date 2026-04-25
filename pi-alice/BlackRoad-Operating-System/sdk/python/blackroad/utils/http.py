"""HTTP client utilities with retry logic and error handling."""

import asyncio
import time
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from urllib.parse import urljoin

import httpx

from ..exceptions import (
    NetworkError,
    TimeoutError as SDKTimeoutError,
    error_from_response,
)


class HTTPClient:
    """Synchronous HTTP client with retry logic and error handling."""

    def __init__(
        self,
        base_url: str,
        timeout: float = 30.0,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        """
        Initialize the HTTP client.

        Args:
            base_url: Base URL for all requests
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries
            retry_delay: Delay between retries in seconds
            headers: Default headers for all requests
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.headers = headers or {}
        self.headers.setdefault("User-Agent", "BlackRoad-Python-SDK/0.1.0")

        self._client = httpx.Client(timeout=timeout)
        self._request_interceptors: List[Callable] = []
        self._response_interceptors: List[Callable] = []

    def add_header(self, key: str, value: str) -> None:
        """
        Add a header to all requests.

        Args:
            key: Header name
            value: Header value
        """
        self.headers[key] = value

    def remove_header(self, key: str) -> None:
        """
        Remove a header from all requests.

        Args:
            key: Header name
        """
        self.headers.pop(key, None)

    def add_request_interceptor(self, interceptor: Callable) -> None:
        """
        Add a request interceptor.

        Args:
            interceptor: Function that takes (method, url, **kwargs) and returns them
        """
        self._request_interceptors.append(interceptor)

    def add_response_interceptor(self, interceptor: Callable) -> None:
        """
        Add a response interceptor.

        Args:
            interceptor: Function that takes response and returns it
        """
        self._response_interceptors.append(interceptor)

    def _build_url(self, path: str) -> str:
        """Build full URL from path."""
        if path.startswith("http://") or path.startswith("https://"):
            return path
        return urljoin(self.base_url + "/", path.lstrip("/"))

    def _merge_headers(self, headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Merge default headers with request-specific headers."""
        merged = self.headers.copy()
        if headers:
            merged.update(headers)
        return merged

    def _should_retry(self, attempt: int, response: Optional[httpx.Response] = None) -> bool:
        """Determine if request should be retried."""
        if attempt >= self.max_retries:
            return False

        if response is None:
            return True

        # Retry on 5xx errors and 429 (rate limit)
        return response.status_code >= 500 or response.status_code == 429

    def _handle_response(self, response: httpx.Response) -> Any:
        """Handle HTTP response and raise appropriate exceptions."""
        # Run response interceptors
        for interceptor in self._response_interceptors:
            response = interceptor(response)

        if response.status_code < 400:
            try:
                return response.json()
            except Exception:
                return response.text

        # Handle errors
        try:
            response_data = response.json()
        except Exception:
            response_data = {"detail": response.text}

        raise error_from_response(response.status_code, response_data)

    def request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        **kwargs: Any,
    ) -> Any:
        """
        Make an HTTP request with retry logic.

        Args:
            method: HTTP method
            path: Request path
            params: Query parameters
            json: JSON body
            data: Form data
            headers: Request headers
            **kwargs: Additional arguments for httpx

        Returns:
            Response data

        Raises:
            Various exceptions based on response
        """
        url = self._build_url(path)
        merged_headers = self._merge_headers(headers)

        # Run request interceptors
        for interceptor in self._request_interceptors:
            method, url, kwargs = interceptor(
                method, url, params=params, json=json, data=data, headers=merged_headers, **kwargs
            )

        last_exception = None

        for attempt in range(self.max_retries + 1):
            try:
                response = self._client.request(
                    method=method,
                    url=url,
                    params=params,
                    json=json,
                    data=data,
                    headers=merged_headers,
                    **kwargs,
                )

                if not self._should_retry(attempt, response):
                    return self._handle_response(response)

                last_exception = error_from_response(
                    response.status_code,
                    response.json() if response.content else None,
                )

            except httpx.TimeoutException as e:
                last_exception = SDKTimeoutError(f"Request timed out: {str(e)}")
            except httpx.NetworkError as e:
                last_exception = NetworkError(f"Network error: {str(e)}")
            except Exception as e:
                if not isinstance(e, (NetworkError, SDKTimeoutError)):
                    raise
                last_exception = e

            if attempt < self.max_retries:
                time.sleep(self.retry_delay * (2**attempt))  # Exponential backoff

        if last_exception:
            raise last_exception
        raise NetworkError("Request failed after maximum retries")

    def get(self, path: str, **kwargs: Any) -> Any:
        """Make a GET request."""
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs: Any) -> Any:
        """Make a POST request."""
        return self.request("POST", path, **kwargs)

    def put(self, path: str, **kwargs: Any) -> Any:
        """Make a PUT request."""
        return self.request("PUT", path, **kwargs)

    def patch(self, path: str, **kwargs: Any) -> Any:
        """Make a PATCH request."""
        return self.request("PATCH", path, **kwargs)

    def delete(self, path: str, **kwargs: Any) -> Any:
        """Make a DELETE request."""
        return self.request("DELETE", path, **kwargs)

    def close(self) -> None:
        """Close the HTTP client."""
        self._client.close()

    def __enter__(self) -> "HTTPClient":
        """Context manager entry."""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Context manager exit."""
        self.close()


class AsyncHTTPClient:
    """Asynchronous HTTP client with retry logic and error handling."""

    def __init__(
        self,
        base_url: str,
        timeout: float = 30.0,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        """
        Initialize the async HTTP client.

        Args:
            base_url: Base URL for all requests
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries
            retry_delay: Delay between retries in seconds
            headers: Default headers for all requests
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.headers = headers or {}
        self.headers.setdefault("User-Agent", "BlackRoad-Python-SDK/0.1.0")

        self._client = httpx.AsyncClient(timeout=timeout)
        self._request_interceptors: List[Callable] = []
        self._response_interceptors: List[Callable] = []

    def add_header(self, key: str, value: str) -> None:
        """Add a header to all requests."""
        self.headers[key] = value

    def remove_header(self, key: str) -> None:
        """Remove a header from all requests."""
        self.headers.pop(key, None)

    def add_request_interceptor(self, interceptor: Callable) -> None:
        """Add a request interceptor."""
        self._request_interceptors.append(interceptor)

    def add_response_interceptor(self, interceptor: Callable) -> None:
        """Add a response interceptor."""
        self._response_interceptors.append(interceptor)

    def _build_url(self, path: str) -> str:
        """Build full URL from path."""
        if path.startswith("http://") or path.startswith("https://"):
            return path
        return urljoin(self.base_url + "/", path.lstrip("/"))

    def _merge_headers(self, headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Merge default headers with request-specific headers."""
        merged = self.headers.copy()
        if headers:
            merged.update(headers)
        return merged

    def _should_retry(self, attempt: int, response: Optional[httpx.Response] = None) -> bool:
        """Determine if request should be retried."""
        if attempt >= self.max_retries:
            return False

        if response is None:
            return True

        return response.status_code >= 500 or response.status_code == 429

    async def _handle_response(self, response: httpx.Response) -> Any:
        """Handle HTTP response and raise appropriate exceptions."""
        # Run response interceptors
        for interceptor in self._response_interceptors:
            if asyncio.iscoroutinefunction(interceptor):
                response = await interceptor(response)
            else:
                response = interceptor(response)

        if response.status_code < 400:
            try:
                return response.json()
            except Exception:
                return response.text

        try:
            response_data = response.json()
        except Exception:
            response_data = {"detail": response.text}

        raise error_from_response(response.status_code, response_data)

    async def request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        **kwargs: Any,
    ) -> Any:
        """
        Make an async HTTP request with retry logic.

        Args:
            method: HTTP method
            path: Request path
            params: Query parameters
            json: JSON body
            data: Form data
            headers: Request headers
            **kwargs: Additional arguments for httpx

        Returns:
            Response data
        """
        url = self._build_url(path)
        merged_headers = self._merge_headers(headers)

        # Run request interceptors
        for interceptor in self._request_interceptors:
            if asyncio.iscoroutinefunction(interceptor):
                method, url, kwargs = await interceptor(
                    method, url, params=params, json=json, data=data, headers=merged_headers, **kwargs
                )
            else:
                method, url, kwargs = interceptor(
                    method, url, params=params, json=json, data=data, headers=merged_headers, **kwargs
                )

        last_exception = None

        for attempt in range(self.max_retries + 1):
            try:
                response = await self._client.request(
                    method=method,
                    url=url,
                    params=params,
                    json=json,
                    data=data,
                    headers=merged_headers,
                    **kwargs,
                )

                if not self._should_retry(attempt, response):
                    return await self._handle_response(response)

                last_exception = error_from_response(
                    response.status_code,
                    response.json() if response.content else None,
                )

            except httpx.TimeoutException as e:
                last_exception = SDKTimeoutError(f"Request timed out: {str(e)}")
            except httpx.NetworkError as e:
                last_exception = NetworkError(f"Network error: {str(e)}")
            except Exception as e:
                if not isinstance(e, (NetworkError, SDKTimeoutError)):
                    raise
                last_exception = e

            if attempt < self.max_retries:
                await asyncio.sleep(self.retry_delay * (2**attempt))

        if last_exception:
            raise last_exception
        raise NetworkError("Request failed after maximum retries")

    async def get(self, path: str, **kwargs: Any) -> Any:
        """Make an async GET request."""
        return await self.request("GET", path, **kwargs)

    async def post(self, path: str, **kwargs: Any) -> Any:
        """Make an async POST request."""
        return await self.request("POST", path, **kwargs)

    async def put(self, path: str, **kwargs: Any) -> Any:
        """Make an async PUT request."""
        return await self.request("PUT", path, **kwargs)

    async def patch(self, path: str, **kwargs: Any) -> Any:
        """Make an async PATCH request."""
        return await self.request("PATCH", path, **kwargs)

    async def delete(self, path: str, **kwargs: Any) -> Any:
        """Make an async DELETE request."""
        return await self.request("DELETE", path, **kwargs)

    async def close(self) -> None:
        """Close the async HTTP client."""
        await self._client.aclose()

    async def __aenter__(self) -> "AsyncHTTPClient":
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Async context manager exit."""
        await self.close()
