#   filename:  openapi.yaml
#   generated with fastapi-codegen and extended with gateway logic
from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Annotated, Optional, Union

import httpx

from fastapi import APIRouter, Depends, Request, status

from app.clients.catalog_client import CatalogClient
from app.clients.operator_client import OperatorClient
from app.clients.pack_index_client import PackIndexClient
from app.config import Settings, get_settings
from app.generated.models import (
    AgentListResponse,
    ErrorResponse,
    HealthResponse,
    PackInstallRequest,
    PackInstallResponse,
    PackListResponse,
)
from app.middleware.auth import api_key_auth
from app.rate_limiting import limiter

router = APIRouter()
_start_time = time.monotonic()
TransportDep = Annotated[httpx.BaseTransport | None, Depends(lambda: None)]


def get_catalog_client(
    settings: Settings = Depends(get_settings),
    transport: TransportDep = None,
) -> CatalogClient:
    return CatalogClient(
        base_url=str(settings.operator_url) if settings.operator_url else None,
        default_timeout=settings.request_timeout_seconds,
        transport=transport,
    )


def get_pack_index_client(
    settings: Settings = Depends(get_settings),
    transport: TransportDep = None,
) -> PackIndexClient:
    return PackIndexClient(
        index_url=str(settings.pack_index_url) if settings.pack_index_url else None,
        default_timeout=settings.request_timeout_seconds,
        transport=transport,
    )


def get_operator_client(
    settings: Settings = Depends(get_settings),
    transport: TransportDep = None,
) -> OperatorClient:
    return OperatorClient(
        base_url=str(settings.operator_url) if settings.operator_url else None,
        default_timeout=settings.request_timeout_seconds,
        transport=transport,
    )


def _error(code: str, message: str) -> ErrorResponse:
    return ErrorResponse(ok=False, error={"code": code, "message": message})


@router.get(
    "/v1/agents",
    response_model=AgentListResponse,
    responses={"401": {"model": ErrorResponse}, "502": {"model": ErrorResponse}},
    tags=["Agents"],
)
@limiter.limit("100/minute")
async def list_agents(
    request: Request,
    settings: Settings = Depends(get_settings),
    _: str = Depends(api_key_auth),
    catalog_client: CatalogClient = Depends(get_catalog_client),
) -> Union[AgentListResponse, ErrorResponse]:
    catalog = await catalog_client.list_agents()
    return AgentListResponse(ok=True, agents=catalog.get("agents", []), source=str(settings.operator_url))


@router.get(
    "/v1/health",
    response_model=HealthResponse,
    responses={"503": {"model": ErrorResponse}},
    tags=["Health"],
)
async def get_health(settings: Settings = Depends(get_settings)) -> Union[HealthResponse, ErrorResponse]:
    uptime = max(time.monotonic() - _start_time, 0.0)
    return HealthResponse(ok=True, uptime=uptime, version=settings.api_version)


@router.get(
    "/v1/packs",
    response_model=PackListResponse,
    responses={"401": {"model": ErrorResponse}, "502": {"model": ErrorResponse}},
    tags=["Packs"],
)
@limiter.limit("100/minute")
async def list_packs(
    request: Request,
    settings: Settings = Depends(get_settings),
    _: str = Depends(api_key_auth),
    pack_index_client: PackIndexClient = Depends(get_pack_index_client),
) -> Union[PackListResponse, ErrorResponse]:
    packs = await pack_index_client.list_packs()
    return PackListResponse(ok=True, packs=packs, retrievedAt=datetime.now(timezone.utc))


@router.post(
    "/v1/packs/{id}/install",
    response_model=None,
    responses={
        status.HTTP_202_ACCEPTED: {"model": PackInstallResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_502_BAD_GATEWAY: {"model": ErrorResponse},
    },
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Packs"],
)
@limiter.limit("100/minute")
async def install_pack(
    request: Request,
    id: str,
    body: Optional[PackInstallRequest] = None,
    settings: Settings = Depends(get_settings),
    _: str = Depends(api_key_auth),
    operator_client: OperatorClient = Depends(get_operator_client),
) -> Optional[Union[PackInstallResponse, ErrorResponse]]:
    if not id:
        return _error("INVALID_PACK", "Pack id is required")

    install_payload = body.model_dump(exclude_none=True) if body else None
    result = await operator_client.enqueue_install(id, install_payload)
    return PackInstallResponse(ok=True, **result)
