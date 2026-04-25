"""
GitHub Event Handler Service

Processes GitHub webhook events and integrates with Operator Engine.
Part of Phase Q - Merge Queue & Automation Strategy.

Related docs: OPERATOR_PR_EVENT_HANDLERS.md, MERGE_QUEUE_PLAN.md
"""

from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, insert, update  # Removed unused imports
import logging

logger = logging.getLogger(__name__)


async def handle_event(
    event_type: str,
    payload: Dict[str, Any],
    db: AsyncSession
):
    """Route event to appropriate handler"""

    handlers = {
        "pull_request": handle_pull_request,
        "pull_request_review": handle_pr_review,
        "pull_request_review_comment": handle_pr_review_comment,
        "status": handle_status,
        "check_run": handle_check_run,
        "check_suite": handle_check_suite,
    }

    handler = handlers.get(event_type)
    if not handler:
        logger.warning(f"No handler for event type: {event_type}")
        return

    # Log event to database
    await log_event(event_type, payload, db)

    # Process event
    await handler(payload, db)


async def log_event(
    event_type: str,
    payload: Dict[str, Any],
    db: AsyncSession
):
    """Log event to database for audit trail"""

    # TODO: Create github_events table with Alembic migration
    # For now, just log to console
    logger.info(
        f"GitHub Event: {event_type} | "
        f"Action: {payload.get('action')} | "
        f"PR: #{payload.get('pull_request', {}).get('number')}"
    )


async def handle_pull_request(payload: Dict[str, Any], db: AsyncSession):
    """Handle pull_request events"""

    action = payload["action"]
    pr_data = payload["pull_request"]
    pr_number = pr_data["number"]

    logger.info(f"PR #{pr_number} {action}: {pr_data['title']}")

    if action == "opened":
        await on_pr_opened(pr_data, db)
    elif action == "closed":
        await on_pr_closed(pr_data, db)
    elif action == "reopened":
        await on_pr_reopened(pr_data, db)
    elif action == "synchronize":
        await on_pr_synchronized(pr_data, db)
    elif action == "labeled":
        await on_pr_labeled(pr_data, payload.get("label", {}), db)
    elif action == "unlabeled":
        await on_pr_unlabeled(pr_data, payload.get("label", {}), db)

    # Emit OS event for Prism Console
    await emit_os_event(f"github:pr:{action}", {"pr_number": pr_number})


async def on_pr_opened(pr_data: Dict[str, Any], db: AsyncSession):
    """PR opened event"""

    pr_number = pr_data["number"]
    title = pr_data["title"]
    author = pr_data["user"]["login"]

    logger.info(f"New PR #{pr_number} by {author}: {title}")

    # TODO: Store in pull_requests table
    # For now, emit event
    await notify_prism("pr_opened", {
        "pr_number": pr_number,
        "title": title,
        "author": author,
        "url": pr_data["html_url"]
    })


async def on_pr_closed(pr_data: Dict[str, Any], db: AsyncSession):
    """PR closed event (merged or closed without merge)"""

    pr_number = pr_data["number"]
    merged = pr_data.get("merged", False)

    logger.info(f"PR #{pr_number} {'merged' if merged else 'closed'}")

    await notify_prism("pr_closed", {
        "pr_number": pr_number,
        "merged": merged
    })


async def on_pr_reopened(pr_data: Dict[str, Any], db: AsyncSession):
    """PR reopened event"""

    pr_number = pr_data["number"]
    logger.info(f"PR #{pr_number} reopened")

    await notify_prism("pr_reopened", {
        "pr_number": pr_number
    })


async def on_pr_synchronized(pr_data: Dict[str, Any], db: AsyncSession):
    """PR synchronized event (new commits pushed)"""

    pr_number = pr_data["number"]
    logger.info(f"PR #{pr_number} synchronized (new commits)")

    await notify_prism("pr_updated", {
        "pr_number": pr_number,
        "message": "New commits pushed, CI re-running"
    })


async def on_pr_labeled(
    pr_data: Dict[str, Any],
    label: Dict[str, Any],
    db: AsyncSession
):
    """PR labeled event"""

    pr_number = pr_data["number"]
    label_name = label.get("name", "")

    logger.info(f"PR #{pr_number} labeled: {label_name}")

    # Check if auto-merge label
    if label_name in ["auto-merge", "claude-auto", "atlas-auto", "merge-ready"]:
        await notify_prism("pr_auto_merge_enabled", {
            "pr_number": pr_number,
            "label": label_name
        })


async def on_pr_unlabeled(
    pr_data: Dict[str, Any],
    label: Dict[str, Any],
    db: AsyncSession
):
    """PR unlabeled event"""

    pr_number = pr_data["number"]
    label_name = label.get("name", "")

    logger.info(f"PR #{pr_number} unlabeled: {label_name}")


async def handle_pr_review(payload: Dict[str, Any], db: AsyncSession):
    """Handle pull_request_review events"""

    action = payload["action"]
    pr_number = payload["pull_request"]["number"]
    review = payload["review"]

    if action == "submitted":
        state = review["state"]  # approved, changes_requested, commented

        logger.info(f"PR #{pr_number} review submitted: {state}")

        if state == "approved":
            await notify_prism("pr_approved", {
                "pr_number": pr_number,
                "reviewer": review["user"]["login"]
            })


async def handle_pr_review_comment(payload: Dict[str, Any], db: AsyncSession):
    """Handle pull_request_review_comment events"""

    action = payload["action"]
    pr_number = payload["pull_request"]["number"]

    logger.info(f"PR #{pr_number} review comment {action}")


async def handle_status(payload: Dict[str, Any], db: AsyncSession):
    """Handle status events"""

    state = payload["state"]  # pending, success, failure, error
    context = payload["context"]

    logger.info(f"Status update: {context} = {state}")


async def handle_check_run(payload: Dict[str, Any], db: AsyncSession):
    """Handle check_run events (CI check completed)"""

    action = payload["action"]
    check_run = payload["check_run"]

    if action == "completed":
        conclusion = check_run["conclusion"]  # success, failure, cancelled
        name = check_run["name"]

        # Find associated PRs
        for pr in check_run.get("pull_requests", []):
            pr_number = pr["number"]

            logger.info(f"PR #{pr_number} check '{name}': {conclusion}")

            await notify_prism("pr_check_completed", {
                "pr_number": pr_number,
                "check_name": name,
                "result": conclusion
            })


async def handle_check_suite(payload: Dict[str, Any], db: AsyncSession):
    """Handle check_suite events"""

    action = payload["action"]
    check_suite = payload["check_suite"]

    if action == "completed":
        conclusion = check_suite["conclusion"]

        for pr in check_suite.get("pull_requests", []):
            pr_number = pr["number"]

            logger.info(f"PR #{pr_number} all checks: {conclusion}")

            await notify_prism("pr_checks_completed", {
                "pr_number": pr_number,
                "result": conclusion
            })


async def emit_os_event(event_name: str, data: Dict[str, Any]):
    """Emit event to Operator Engine (OS-level event bus)"""

    # This would integrate with the BlackRoad OS event system
    # For now, just log
    logger.info(f"OS Event: {event_name} - {data}")

    # TODO: Integrate with Redis pub/sub or WebSocket broadcast
    # Could use:
    # - Redis pub/sub for backend-to-backend events
    # - WebSocket broadcast for backend-to-frontend events
    # - Event queue (RabbitMQ, etc.) for async processing


async def notify_prism(event_type: str, data: Dict[str, Any]):
    """Send notification to Prism Console via WebSocket"""

    # This would send WebSocket message to Prism Console
    # For now, just log
    logger.info(f"Prism Notification: {event_type} - {data}")

    # TODO: Implement WebSocket broadcast
    # Example:
    # from ..websocket import broadcast
    # await broadcast({
    #     "type": f"github:{event_type}",
    #     "data": data
    # })
