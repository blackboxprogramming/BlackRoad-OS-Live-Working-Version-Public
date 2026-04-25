"""System endpoints for core OS operations"""
import os
from datetime import UTC, datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/system", tags=["system"])
START_TIME = datetime.now(UTC)


@router.get("/version")
async def get_version():
    """
    Get system version and build information

    Returns version, build time, environment, and git information
    """
    # Try to get git SHA if available
    git_sha = os.environ.get("GIT_SHA", "development")

    return {
        "version": settings.APP_VERSION,
        "build_time": os.environ.get("BUILD_TIMESTAMP", START_TIME.isoformat()),
        "env": settings.ENVIRONMENT,
        "git_sha": git_sha[:8] if len(git_sha) > 8 else git_sha,
        "app_name": settings.APP_NAME,
    }


@router.get("/config/public")
async def get_public_config():
    """
    Get public configuration (non-sensitive settings only)

    Returns feature flags, environment info, and public settings
    """
    return {
        "environment": settings.ENVIRONMENT,
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "features": {
            "blockchain_enabled": True,
            "ai_agents_enabled": True,
            "video_streaming_enabled": True,
            "gaming_enabled": True,
            "social_enabled": True,
        },
        "limits": {
            "max_upload_size_mb": 100,
            "session_timeout_minutes": 60,
        },
        "external_services": {
            "github_integration": bool(os.environ.get("GITHUB_TOKEN")),
            "stripe_enabled": bool(os.environ.get("STRIPE_SECRET_KEY")),
            "openai_enabled": bool(os.environ.get("OPENAI_API_KEY")),
        },
    }


@router.get("/os/state")
async def get_os_state(db: AsyncSession = Depends(get_db)):
    """
    Get current OS state (stub for now)

    Returns the current state of the OS including:
    - Active windows
    - Running applications
    - System resources
    """
    # TODO: Integrate with core_os module when implemented
    uptime_seconds = int((datetime.now(UTC) - START_TIME).total_seconds())

    return {
        "status": "ok",
        "uptime_seconds": uptime_seconds,
        "active_windows": [],
        "running_apps": [],
        "system_resources": {
            "memory_usage_percent": 0,
            "cpu_usage_percent": 0,
        },
        "note": "This is a stub endpoint. Full OS state tracking coming in Phase 2.",
    }


@router.get("/prism/config")
async def prism_config(request: Request):
    """Return Prism Console service configuration for health/status checks."""

    def resolve_url(env_url: str, fallback: str) -> str:
        return env_url.rstrip("/") if env_url else fallback.rstrip("/")

    base_url = str(request.base_url).rstrip("/")

    services = [
        {
            "name": "core-api",
            "url": resolve_url(settings.PRISM_CORE_API_URL, base_url),
            "health_path": "/health",
            "version_path": "/version",
        },
        {
            "name": "public-api",
            "url": resolve_url(settings.PRISM_PUBLIC_API_URL, base_url),
            "health_path": "/health",
            "version_path": "/version",
        },
        {
            "name": "prism-console",
            "url": resolve_url(settings.PRISM_CONSOLE_URL, base_url),
            "health_path": "/prism/health",
            "version_path": "/version",
        },
    ]

    return {
        "environment": settings.ENVIRONMENT,
        "services": services,
    }
