from __future__ import annotations

from typing import Any, Dict, List

import httpx

from app.errors import UpstreamError


class CatalogClient:
    """Thin proxy to the operator agent catalog."""

    def __init__(self, base_url: str | None, default_timeout: float, transport: httpx.BaseTransport | None = None) -> None:
        self.base_url = base_url.rstrip("/") if base_url else None
        self.default_timeout = default_timeout
        self.transport = transport

    async def list_agents(self) -> Dict[str, Any]:
        if not self.base_url:
            raise UpstreamError(
                source="operator",
                message="operator upstream not configured",
                status_code=502,
            )

        url = f"{self.base_url}/agents"
        try:
            async with httpx.AsyncClient(timeout=self.default_timeout, transport=self.transport) as client:
                response = await client.get(url)
            response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise UpstreamError(
                source="operator",
                message="operator upstream timeout",
                status_code=504,
                details={"url": url},
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise UpstreamError(
                source="operator",
                message="operator upstream returned error",
                status_code=exc.response.status_code,
                details={"body": exc.response.text},
            ) from exc
        except httpx.HTTPError as exc:
            raise UpstreamError(
                source="operator",
                message="operator upstream unavailable",
                details={"url": url},
            ) from exc

        try:
            payload = response.json()
        except ValueError as exc:
            raise UpstreamError(
                source="operator",
                message="operator upstream returned invalid JSON",
                status_code=502,
            ) from exc
        agents: List[Dict[str, Any]]
        if isinstance(payload, dict) and "agents" in payload:
            agents = payload.get("agents") or []
        elif isinstance(payload, list):
            agents = payload
        else:
            agents = []
        return {"agents": agents, "source": self.base_url}
