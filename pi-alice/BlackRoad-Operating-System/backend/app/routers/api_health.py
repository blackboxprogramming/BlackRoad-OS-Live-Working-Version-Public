"""
API Health Check Router

Comprehensive health check endpoint for all external API integrations.
Provides status monitoring for Railway, Vercel, Stripe, Twilio, Slack, Discord, Sentry, and more.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncio
import os
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/health", tags=["health"])


class APIHealthStatus(BaseModel):
    """Health status for a single API"""
    name: str
    status: str  # connected, not_configured, error
    message: str
    last_checked: str
    configuration: Dict[str, bool]
    error: Optional[str] = None


class SystemHealthStatus(BaseModel):
    """Overall system health status"""
    status: str  # healthy, degraded, unhealthy
    timestamp: str
    total_apis: int
    connected_apis: int
    not_configured_apis: int
    error_apis: int
    apis: Dict[str, APIHealthStatus]


async def check_api_status(name: str, check_func) -> Dict[str, Any]:
    """Check individual API status"""
    try:
        result = await check_func()
        return {
            "name": name,
            "status": "connected" if result.get("connected") else "not_configured",
            "message": result.get("message", ""),
            "last_checked": utc_now().isoformat(),
            "configuration": {
                k: v for k, v in result.items()
                if k.endswith("_configured") or k == "connected"
            },
            "error": None
        }
    except Exception as e:
        logger.error(f"Health check failed for {name}: {e}")
        return {
            "name": name,
            "status": "error",
            "message": f"Health check failed: {str(e)}",
            "last_checked": utc_now().isoformat(),
            "configuration": {},
            "error": str(e)
        }


@router.get("/all", response_model=SystemHealthStatus)
async def check_all_apis():
    """
    Comprehensive health check for all external APIs.

    Checks connectivity and configuration for:
    - GitHub API
    - Railway API
    - Vercel API
    - Stripe API
    - Twilio API (SMS & WhatsApp)
    - Slack API
    - Discord API
    - Sentry API
    - OpenAI API
    - Hugging Face API
    - DigitalOcean API
    - AWS S3
    """

    # Import API clients
    from .railway import get_railway_status
    from .vercel import get_vercel_status
    from .stripe import get_stripe_status
    from .twilio import get_twilio_status
    from .slack import get_slack_status
    from .discord import get_discord_status
    from .sentry import get_sentry_status

    # Define all API checks
    api_checks = {
        "railway": get_railway_status,
        "vercel": get_vercel_status,
        "stripe": get_stripe_status,
        "twilio": get_twilio_status,
        "slack": get_slack_status,
        "discord": get_discord_status,
        "sentry": get_sentry_status,
    }

    # Add checks for existing APIs
    api_checks.update({
        "github": lambda: check_github_status(),
        "openai": lambda: check_openai_status(),
        "huggingface": lambda: check_huggingface_status(),
        "digitalocean": lambda: check_digitalocean_status(),
        "aws": lambda: check_aws_status(),
    })

    # Run all checks concurrently
    tasks = [
        check_api_status(name, func)
        for name, func in api_checks.items()
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Process results
    apis = {}
    connected_count = 0
    not_configured_count = 0
    error_count = 0

    for result in results:
        if isinstance(result, Exception):
            error_count += 1
            continue

        apis[result["name"]] = result

        if result["status"] == "connected":
            connected_count += 1
        elif result["status"] == "not_configured":
            not_configured_count += 1
        else:
            error_count += 1

    # Determine overall system health
    total_apis = len(apis)
    if connected_count == total_apis:
        overall_status = "healthy"
    elif connected_count > 0:
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"

    return SystemHealthStatus(
        status=overall_status,
        timestamp=utc_now().isoformat(),
        total_apis=total_apis,
        connected_apis=connected_count,
        not_configured_apis=not_configured_count,
        error_apis=error_count,
        apis=apis
    )


@router.get("/summary")
async def get_health_summary():
    """Get a quick summary of API health"""
    health = await check_all_apis()

    return {
        "status": health.status,
        "timestamp": health.timestamp,
        "summary": {
            "total": health.total_apis,
            "connected": health.connected_apis,
            "not_configured": health.not_configured_apis,
            "errors": health.error_apis
        },
        "connected_apis": [
            name for name, api in health.apis.items()
            if api.status == "connected"
        ],
        "not_configured_apis": [
            name for name, api in health.apis.items()
            if api.status == "not_configured"
        ],
        "error_apis": [
            name for name, api in health.apis.items()
            if api.status == "error"
        ]
    }


@router.get("/{api_name}")
async def check_specific_api(api_name: str):
    """Check health of a specific API"""
    api_checks = {
        "railway": lambda: __import__("app.routers.railway", fromlist=["get_railway_status"]).get_railway_status(),
        "vercel": lambda: __import__("app.routers.vercel", fromlist=["get_vercel_status"]).get_vercel_status(),
        "stripe": lambda: __import__("app.routers.stripe", fromlist=["get_stripe_status"]).get_stripe_status(),
        "twilio": lambda: __import__("app.routers.twilio", fromlist=["get_twilio_status"]).get_twilio_status(),
        "slack": lambda: __import__("app.routers.slack", fromlist=["get_slack_status"]).get_slack_status(),
        "discord": lambda: __import__("app.routers.discord", fromlist=["get_discord_status"]).get_discord_status(),
        "sentry": lambda: __import__("app.routers.sentry", fromlist=["get_sentry_status"]).get_sentry_status(),
        "github": check_github_status,
        "openai": check_openai_status,
        "huggingface": check_huggingface_status,
        "digitalocean": check_digitalocean_status,
        "aws": check_aws_status,
    }

    if api_name.lower() not in api_checks:
        raise HTTPException(
            status_code=404,
            detail=f"API '{api_name}' not found. Available APIs: {', '.join(api_checks.keys())}"
        )

    check_func = api_checks[api_name.lower()]
    result = await check_api_status(api_name, check_func)

    return result


# Helper functions for existing APIs

async def check_github_status():
    """Check GitHub API status"""
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        return {
            "connected": False,
            "message": "GitHub token not configured",
            "token_configured": False
        }

    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {github_token}"},
                timeout=10.0
            )
            response.raise_for_status()
            return {
                "connected": True,
                "message": "GitHub API connected successfully",
                "token_configured": True
            }
    except Exception as e:
        return {
            "connected": False,
            "message": f"GitHub API connection failed: {str(e)}",
            "token_configured": True
        }


async def check_openai_status():
    """Check OpenAI API status"""
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        return {
            "connected": False,
            "message": "OpenAI API key not configured",
            "key_configured": False
        }

    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {openai_key}"},
                timeout=10.0
            )
            response.raise_for_status()
            return {
                "connected": True,
                "message": "OpenAI API connected successfully",
                "key_configured": True
            }
    except Exception as e:
        return {
            "connected": False,
            "message": f"OpenAI API connection failed: {str(e)}",
            "key_configured": True
        }


async def check_huggingface_status():
    """Check Hugging Face API status"""
    hf_token = os.getenv("HUGGINGFACE_TOKEN")
    if not hf_token:
        return {
            "connected": False,
            "message": "Hugging Face token not configured",
            "token_configured": False
        }

    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://huggingface.co/api/whoami-v2",
                headers={"Authorization": f"Bearer {hf_token}"},
                timeout=10.0
            )
            response.raise_for_status()
            return {
                "connected": True,
                "message": "Hugging Face API connected successfully",
                "token_configured": True
            }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Hugging Face API connection failed: {str(e)}",
            "token_configured": True
        }


async def check_digitalocean_status():
    """Check DigitalOcean API status"""
    do_token = os.getenv("DIGITAL_OCEAN_API_KEY") or os.getenv("DIGITALOCEAN_TOKEN")
    if not do_token:
        return {
            "connected": False,
            "message": "DigitalOcean token not configured",
            "token_configured": False
        }

    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.digitalocean.com/v2/account",
                headers={"Authorization": f"Bearer {do_token}"},
                timeout=10.0
            )
            response.raise_for_status()
            return {
                "connected": True,
                "message": "DigitalOcean API connected successfully",
                "token_configured": True
            }
    except Exception as e:
        return {
            "connected": False,
            "message": f"DigitalOcean API connection failed: {str(e)}",
            "token_configured": True
        }


async def check_aws_status():
    """Check AWS S3 status"""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")

    if not aws_key or not aws_secret:
        return {
            "connected": False,
            "message": "AWS credentials not configured",
            "key_configured": bool(aws_key),
            "secret_configured": bool(aws_secret)
        }

    try:
        import boto3
        from botocore.exceptions import ClientError

        s3 = boto3.client('s3')
        s3.list_buckets()

        return {
            "connected": True,
            "message": "AWS S3 connected successfully",
            "key_configured": True,
            "secret_configured": True
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"AWS S3 connection failed: {str(e)}",
            "key_configured": True,
            "secret_configured": True
        }
