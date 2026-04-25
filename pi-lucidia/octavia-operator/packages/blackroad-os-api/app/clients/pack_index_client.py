from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from app.errors import UpstreamError

PACK_PREFIX = "blackroad-os-pack-"


class PackIndexClient:
    def __init__(self, index_url: Optional[str], default_timeout: float, transport: httpx.BaseTransport | None = None) -> None:
        self.index_url = index_url.rstrip("/") if index_url else None
        self.default_timeout = default_timeout
        self.transport = transport

    async def list_packs(self) -> List[Dict[str, Any]]:
        if not self.index_url:
            raise UpstreamError(
                source="packs",
                message="PACK_INDEX_URL not configured",
                status_code=502,
            )

        try:
            async with httpx.AsyncClient(timeout=self.default_timeout, transport=self.transport) as client:
                response = await client.get(str(self.index_url))
            response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise UpstreamError(
                source="packs", message="Pack index timeout", status_code=504
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise UpstreamError(
                source="packs",
                message="Pack index returned error",
                status_code=exc.response.status_code,
            ) from exc
        except httpx.HTTPError as exc:
            raise UpstreamError(source="packs", message="Pack index unavailable") from exc

        try:
            payload = response.json()
        except ValueError as exc:
            raise UpstreamError(
                source="packs", message="Pack index returned invalid JSON", status_code=502
            ) from exc
        items: List[Dict[str, Any]]
        if isinstance(payload, dict):
            items = payload.get("packs") or payload.get("packages") or payload.get("items") or []
        elif isinstance(payload, list):
            items = payload
        else:
            items = []

        packs: List[Dict[str, Any]] = []
        for item in items:
            if not isinstance(item, dict):
                continue
            name = item.get("name") or item.get("id")
            version = item.get("version") or item.get("tag") or "latest"
            description = item.get("description")
            source = item.get("source") or str(self.index_url)

            if not name or not name.startswith(PACK_PREFIX):
                continue

            packs.append(
                {
                    "id": name[len(PACK_PREFIX) :],
                    "name": name,
                    "version": version,
                    "description": description,
                    "source": source,
                }
            )

        return packs
