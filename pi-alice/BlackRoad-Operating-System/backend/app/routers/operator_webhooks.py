"""
Operator Webhooks Router

Handles GitHub webhook events for the Operator Engine.
"""

from fastapi import APIRouter, Request, Header
from typing import Optional
import sys
import os

# Add operator_engine to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from operator_engine.github_webhooks import get_webhook_handler
from operator_engine.pr_actions import get_queue

router = APIRouter(prefix="/api/operator", tags=["Operator"])


@router.post("/webhooks/github")
async def github_webhook(
    request: Request,
    x_github_event: str = Header(...),
    x_hub_signature_256: Optional[str] = Header(None),
):
    """
    Receive GitHub webhook events.

    This endpoint receives events from GitHub and queues appropriate actions.
    """
    handler = get_webhook_handler()
    return await handler.handle_webhook(request, x_github_event, x_hub_signature_256)


@router.get("/queue/stats")
async def get_queue_stats():
    """Get queue statistics"""
    queue = get_queue()
    return await queue.get_queue_stats()


@router.get("/queue/pr/{owner}/{repo}/{pr_number}")
async def get_pr_actions(owner: str, repo: str, pr_number: int):
    """Get all actions for a specific PR"""
    queue = get_queue()
    actions = await queue.get_pr_actions(owner, repo, pr_number)
    return {
        "pr": f"{owner}/{repo}#{pr_number}",
        "actions": [action.to_dict() for action in actions],
    }


@router.get("/queue/action/{action_id}")
async def get_action_status(action_id: str):
    """Get the status of a specific action"""
    queue = get_queue()
    action = await queue.get_status(action_id)
    if action:
        return action.to_dict()
    return {"error": "Action not found"}


@router.post("/queue/action/{action_id}/cancel")
async def cancel_action(action_id: str):
    """Cancel a queued action"""
    queue = get_queue()
    cancelled = await queue.cancel_action(action_id)
    return {"cancelled": cancelled}


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    queue = get_queue()
    stats = await queue.get_queue_stats()
    return {
        "status": "healthy",
        "queue_running": stats["running"],
        **stats,
    }
