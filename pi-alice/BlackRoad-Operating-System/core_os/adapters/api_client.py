"""API client for communicating with backend"""
import os
from typing import Optional, Dict, Any
import httpx


class BackendAPIClient:
    """
    Client for communicating with the BlackRoad backend API

    This adapter allows the Core OS to interact with the backend
    for authentication, data persistence, and external integrations.
    """

    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize API client

        Args:
            base_url: Base URL for the API (defaults to env var or localhost)
        """
        self.base_url = base_url or os.getenv(
            "BLACKROAD_API_URL", "http://localhost:8000"
        )
        self.timeout = 30.0

    async def get_version(self) -> Dict[str, Any]:
        """Get backend API version"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/api/system/version")
            response.raise_for_status()
            return response.json()

    async def get_public_config(self) -> Dict[str, Any]:
        """Get public configuration from backend"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/api/system/config/public")
            response.raise_for_status()
            return response.json()

    async def health_check(self) -> bool:
        """Check if backend API is healthy"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False

    async def sync_os_state(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sync OS state with backend (stub for now)

        Args:
            state: OS state dictionary

        Returns:
            Response from backend
        """
        # TODO: Implement actual state sync endpoint
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/system/os/state", json=state
            )
            response.raise_for_status()
            return response.json()
