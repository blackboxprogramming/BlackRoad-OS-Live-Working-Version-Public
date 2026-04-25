"""
GitHub Webhooks Router

Receives and processes GitHub webhook events for PR automation.
Part of Phase Q/Q2 - Merge Queue & Automation Strategy.

Related docs: OPERATOR_PR_EVENT_HANDLERS.md, MERGE_QUEUE_PLAN.md
"""

from fastapi import APIRouter, Request, HTTPException, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
import hmac
import hashlib
from typing import Optional
import logging

from ..database import get_db
from ..services import github_events
from ..config import settings

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

logger = logging.getLogger(__name__)


def verify_github_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify GitHub webhook signature"""
    if not signature or not signature.startswith("sha256="):
        return False

    expected_signature = "sha256=" + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_signature)


@router.post("/github")
async def github_webhook(
    request: Request,
    x_hub_signature_256: Optional[str] = Header(None),
    x_github_event: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Receive GitHub webhook events

    This endpoint receives webhook events from GitHub for:
    - Pull requests (opened, closed, merged, labeled, etc.)
    - Pull request reviews (submitted, approved, changes_requested)
    - Status checks (check_run, check_suite completed)

    Events are processed by the github_events service and logged to the database.

    **Security**: Webhooks are verified using HMAC-SHA256 signature.

    **Setup**: In GitHub repository settings → Webhooks:
    - Payload URL: https://your-domain.com/api/webhooks/github
    - Content type: application/json
    - Secret: Set GITHUB_WEBHOOK_SECRET environment variable
    - Events: Pull requests, Pull request reviews, Statuses, Check runs
    """

    # Read request body
    body = await request.body()

    # Verify signature if secret is configured
    webhook_secret = getattr(settings, 'GITHUB_WEBHOOK_SECRET', None)
    if webhook_secret and x_hub_signature_256:
        if not verify_github_signature(body, x_hub_signature_256, webhook_secret):
            logger.warning("Invalid GitHub webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
    elif webhook_secret and not x_hub_signature_256:
        logger.warning("Missing GitHub webhook signature")
        raise HTTPException(status_code=401, detail="Missing signature")

    # Verify event type header
    if not x_github_event:
        raise HTTPException(status_code=400, detail="Missing X-GitHub-Event header")

    # Parse JSON payload
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Log webhook received
    logger.info(
        f"GitHub webhook received: {x_github_event} | "
        f"Action: {payload.get('action')} | "
        f"PR: #{payload.get('pull_request', {}).get('number', 'N/A')}"
    )

    # Process event asynchronously
    try:
        await github_events.handle_event(
            event_type=x_github_event,
            payload=payload,
            db=db
        )
    except Exception as e:
        logger.error(f"Error processing GitHub event: {e}", exc_info=True)
        # Return 200 even on processing errors to avoid GitHub retries
        # Errors are logged for debugging
        return {"status": "received", "processing_error": str(e)}

    return {
        "status": "received",
        "event": x_github_event,
        "action": payload.get("action"),
        "pr_number": payload.get("pull_request", {}).get("number")
    }


@router.get("/github/ping")
async def github_webhook_ping():
    """
    Ping endpoint for testing GitHub webhook configuration

    Use this to verify your webhook is reachable before setting it up in GitHub.
    """
    return {
        "status": "ok",
        "message": "GitHub webhook endpoint is reachable",
        "configured": hasattr(settings, 'GITHUB_WEBHOOK_SECRET') and settings.GITHUB_WEBHOOK_SECRET is not None
    }


@router.get("/status")
async def webhooks_status():
    """
    Get webhook configuration status

    Returns information about which webhooks are configured and ready.
    """
    return {
        "github": {
            "endpoint": "/api/webhooks/github",
            "configured": hasattr(settings, 'GITHUB_WEBHOOK_SECRET') and settings.GITHUB_WEBHOOK_SECRET is not None,
            "events_supported": [
                "pull_request",
                "pull_request_review",
                "pull_request_review_comment",
                "status",
                "check_run",
                "check_suite"
            ]
        }
    }
