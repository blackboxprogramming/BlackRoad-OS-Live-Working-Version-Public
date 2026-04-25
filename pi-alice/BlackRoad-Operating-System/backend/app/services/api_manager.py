"""
Centralized API Client Manager for BlackRoad OS

Manages connections to multiple external APIs with health checking,
rate limiting, and automatic retry logic.
"""

import asyncio
from typing import Dict, Optional, Any, List
from datetime import datetime, timedelta
import httpx
from enum import Enum
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)


class APIStatus(str, Enum):
    """API connection status"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    RATE_LIMITED = "rate_limited"
    UNAUTHORIZED = "unauthorized"


class APIProvider(str, Enum):
    """Supported API providers"""
    GITHUB = "github"
    RAILWAY = "railway"
    VERCEL = "vercel"
    STRIPE = "stripe"
    TWILIO = "twilio"
    SLACK = "slack"
    DISCORD = "discord"
    SENTRY = "sentry"
    OPENAI = "openai"
    HUGGINGFACE = "huggingface"
    DIGITALOCEAN = "digitalocean"
    AWS = "aws"


class APIClient:
    """Base API client with common functionality"""

    def __init__(
        self,
        name: str,
        base_url: str,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3
    ):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
        self.status = APIStatus.DISCONNECTED
        self.last_check: Optional[datetime] = None
        self.error_message: Optional[str] = None
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client"""
        if self._client is None or self._client.is_closed:
            headers = self._get_headers()
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=headers,
                timeout=self.timeout,
                follow_redirects=True
            )
        return self._client

    def _get_headers(self) -> Dict[str, str]:
        """Get default headers for requests"""
        headers = {
            "User-Agent": "BlackRoad-OS/1.0",
            "Accept": "application/json"
        }
        if self.api_key:
            # Default to Bearer token, override in subclasses if needed
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def health_check(self) -> bool:
        """Check if API is accessible"""
        try:
            client = await self.get_client()
            response = await client.get("/", timeout=10.0)

            if response.status_code < 500:
                self.status = APIStatus.CONNECTED
                self.error_message = None
                self.last_check = utc_now()
                return True
            else:
                self.status = APIStatus.ERROR
                self.error_message = f"Server error: {response.status_code}"
                self.last_check = utc_now()
                return False

        except httpx.TimeoutException:
            self.status = APIStatus.ERROR
            self.error_message = "Connection timeout"
            self.last_check = utc_now()
            return False
        except Exception as e:
            self.status = APIStatus.ERROR
            self.error_message = str(e)
            self.last_check = utc_now()
            logger.error(f"Health check failed for {self.name}: {e}")
            return False

    async def request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Optional[httpx.Response]:
        """Make HTTP request with retry logic"""
        client = await self.get_client()

        for attempt in range(self.max_retries):
            try:
                response = await client.request(method, endpoint, **kwargs)

                # Update status based on response
                if response.status_code == 401:
                    self.status = APIStatus.UNAUTHORIZED
                    self.error_message = "Invalid API key"
                elif response.status_code == 429:
                    self.status = APIStatus.RATE_LIMITED
                    self.error_message = "Rate limit exceeded"
                    # Wait before retry
                    await asyncio.sleep(2 ** attempt)
                    continue
                elif response.status_code < 500:
                    self.status = APIStatus.CONNECTED
                    self.error_message = None

                return response

            except httpx.TimeoutException:
                if attempt == self.max_retries - 1:
                    self.status = APIStatus.ERROR
                    self.error_message = "Request timeout"
                    return None
                await asyncio.sleep(2 ** attempt)

            except Exception as e:
                if attempt == self.max_retries - 1:
                    self.status = APIStatus.ERROR
                    self.error_message = str(e)
                    logger.error(f"Request failed for {self.name}: {e}")
                    return None
                await asyncio.sleep(2 ** attempt)

        return None

    async def close(self):
        """Close the HTTP client"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    def get_status_info(self) -> Dict[str, Any]:
        """Get current status information"""
        return {
            "name": self.name,
            "status": self.status,
            "last_check": self.last_check.isoformat() if self.last_check else None,
            "error_message": self.error_message,
            "is_configured": bool(self.api_key)
        }


class APIManager:
    """Centralized manager for all API clients"""

    def __init__(self):
        self.clients: Dict[str, APIClient] = {}
        self._health_check_task: Optional[asyncio.Task] = None

    def register_client(self, provider: APIProvider, client: APIClient):
        """Register an API client"""
        self.clients[provider] = client
        logger.info(f"Registered API client: {provider}")

    def get_client(self, provider: APIProvider) -> Optional[APIClient]:
        """Get API client by provider"""
        return self.clients.get(provider)

    async def health_check_all(self) -> Dict[str, Dict[str, Any]]:
        """Run health checks on all registered APIs"""
        results = {}

        tasks = []
        for provider, client in self.clients.items():
            tasks.append(self._check_client(provider, client))

        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        for provider, result in zip(self.clients.keys(), results_list):
            if isinstance(result, Exception):
                results[provider] = {
                    "status": APIStatus.ERROR,
                    "error": str(result)
                }
            else:
                results[provider] = result

        return results

    async def _check_client(self, provider: str, client: APIClient) -> Dict[str, Any]:
        """Check individual client health"""
        await client.health_check()
        return client.get_status_info()

    async def start_health_monitoring(self, interval: int = 300):
        """Start periodic health monitoring (default: 5 minutes)"""
        async def monitor():
            while True:
                try:
                    await self.health_check_all()
                    await asyncio.sleep(interval)
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Health monitoring error: {e}")
                    await asyncio.sleep(interval)

        self._health_check_task = asyncio.create_task(monitor())
        logger.info(f"Started API health monitoring (interval: {interval}s)")

    async def stop_health_monitoring(self):
        """Stop health monitoring"""
        if self._health_check_task:
            self._health_check_task.cancel()
            try:
                await self._health_check_task
            except asyncio.CancelledError:
                pass
            logger.info("Stopped API health monitoring")

    async def close_all(self):
        """Close all API clients"""
        await self.stop_health_monitoring()

        for client in self.clients.values():
            await client.close()

        logger.info("Closed all API clients")

    def get_all_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all APIs"""
        return {
            provider: client.get_status_info()
            for provider, client in self.clients.items()
        }

    def get_connected_apis(self) -> List[str]:
        """Get list of connected APIs"""
        return [
            provider
            for provider, client in self.clients.items()
            if client.status == APIStatus.CONNECTED
        ]

    def get_disconnected_apis(self) -> List[str]:
        """Get list of disconnected APIs"""
        return [
            provider
            for provider, client in self.clients.items()
            if client.status in [APIStatus.DISCONNECTED, APIStatus.ERROR]
        ]


# Global API manager instance
api_manager = APIManager()
