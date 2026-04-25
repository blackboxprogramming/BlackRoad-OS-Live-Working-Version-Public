from __future__ import annotations

from typing import Any, Dict, Optional

import httpx

from app.errors import UpstreamError


class OperatorClient:
    def __init__(self, base_url: Optional[str], default_timeout: float, transport: httpx.BaseTransport | None = None) -> None:
        self.base_url = base_url.rstrip("/") if base_url else None
        self.default_timeout = default_timeout
        self.transport = transport

    async def enqueue_install(self, pack_id: str, payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.base_url:
            raise UpstreamError(
                source="operator",
                message="operator upstream not configured",
                status_code=502,
            )

        url = f"{self.base_url}/packs/{pack_id}/install"
        json_body = payload or None
        try:
            async with httpx.AsyncClient(timeout=self.default_timeout, transport=self.transport) as client:
                response = await client.post(url, json=json_body)
            response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise UpstreamError(
                source="operator", message="operator upstream timeout", status_code=504
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
                source="operator", message="operator upstream unavailable", details={"url": url}
            ) from exc

        body = {}
        if response.headers.get("content-type", "").startswith("application/json"):
            try:
                body = response.json()
            except ValueError as exc:
                raise UpstreamError(
                    source="operator", message="operator upstream returned invalid JSON", status_code=502
                ) from exc
        job_id = None
        if isinstance(body, dict):
            job_id = body.get("jobId") or body.get("id") or body.get("job_id")

        return {"jobId": job_id or "pending", "operatorUrl": self.base_url}
