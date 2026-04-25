# 🔗 OPERATOR PR EVENT HANDLERS

> **BlackRoad Operating System — Phase Q**
> **Purpose**: GitHub webhook integration with Operator Engine
> **Owner**: Operator Alexa (Cadillac)
> **Last Updated**: 2025-11-18

---

## Overview

This document describes how **GitHub PR events** flow into the **BlackRoad Operator Engine** and **Prism Console**, enabling real-time monitoring, automation, and analytics for the merge queue system.

---

## Architecture

### Event Flow

```
┌──────────────────────────────────────────────────────────────┐
│                       GitHub Event                           │
│  (PR opened, closed, merged, labeled, review_requested, etc.)│
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS POST (webhook)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              FastAPI Webhook Endpoint                        │
│       POST /api/webhooks/github                              │
│       - Validates signature (HMAC-SHA256)                    │
│       - Parses event type (X-GitHub-Event header)            │
│       - Extracts payload                                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              GitHub Event Handler Service                    │
│       backend/app/services/github_events.py                  │
│       - Routes to event-specific handler                     │
│       - Processes PR metadata                                │
│       - Logs to database                                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│       - github_events table (audit log)                      │
│       - pull_requests table (PR metadata)                    │
│       - merge_queue table (queue state)                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  Operator Engine                             │
│       - Emits OS-level event (os:github:pr:*)                │
│       - Triggers automation rules                            │
│       - Updates Operator dashboard                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   Prism Console                              │
│       - Receives event via WebSocket                         │
│       - Updates merge queue dashboard                        │
│       - Shows notifications                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Webhook Configuration

### GitHub Setup

**Location**: Repository Settings → Webhooks → Add webhook

**Configuration**:
- **Payload URL**: `https://blackroad.app/api/webhooks/github`
- **Content type**: `application/json`
- **Secret**: (set in GitHub, store in env as `GITHUB_WEBHOOK_SECRET`)
- **Events**: Select individual events:
  - Pull requests
  - Pull request reviews
  - Pull request review comments
  - Statuses
  - Check runs
  - Check suites

**Security**:
- GitHub signs payloads with HMAC-SHA256
- FastAPI validates signature before processing
- Rejects unsigned or invalid webhooks

---

## Event Handler Implementation

### FastAPI Webhook Endpoint

**File**: `backend/app/routers/webhooks.py` (or create new)

```python
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import hmac
import hashlib
from ..database import get_db
from ..services import github_events
from ..config import settings

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/github")
async def github_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Receive GitHub webhook events"""

    # Verify signature
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    body = await request.body()
    expected_signature = "sha256=" + hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse event
    event_type = request.headers.get("X-GitHub-Event")
    payload = await request.json()

    # Route to handler
    await github_events.handle_event(
        event_type=event_type,
        payload=payload,
        db=db
    )

    return {"status": "received"}
```

### Event Handler Service

**File**: `backend/app/services/github_events.py`

```python
"""
GitHub Event Handler Service

Processes GitHub webhook events and integrates with Operator Engine.
"""

from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update
from datetime import datetime
import logging

from ..models.github_events import GitHubEvent
from ..models.pull_requests import PullRequest
from ..models.merge_queue import MergeQueueEntry

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

    # Log event
    await log_event(event_type, payload, db)

    # Process event
    await handler(payload, db)


async def log_event(
    event_type: str,
    payload: Dict[str, Any],
    db: AsyncSession
):
    """Log event to database for audit trail"""

    event = GitHubEvent(
        event_type=event_type,
        action=payload.get("action"),
        repository=payload.get("repository", {}).get("full_name"),
        sender=payload.get("sender", {}).get("login"),
        pr_number=payload.get("pull_request", {}).get("number"),
        payload=payload,
        received_at=datetime.utcnow()
    )

    db.add(event)
    await db.commit()


async def handle_pull_request(payload: Dict[str, Any], db: AsyncSession):
    """Handle pull_request events"""

    action = payload["action"]
    pr_data = payload["pull_request"]

    pr_number = pr_data["number"]

    if action == "opened":
        await on_pr_opened(pr_data, db)
    elif action == "closed":
        await on_pr_closed(pr_data, db)
    elif action == "reopened":
        await on_pr_reopened(pr_data, db)
    elif action == "synchronize":
        await on_pr_synchronized(pr_data, db)
    elif action == "labeled":
        await on_pr_labeled(pr_data, payload["label"], db)
    elif action == "unlabeled":
        await on_pr_unlabeled(pr_data, payload["label"], db)

    # Emit OS event
    emit_os_event(f"github:pr:{action}", {"pr_number": pr_number})


async def on_pr_opened(pr_data: Dict[str, Any], db: AsyncSession):
    """PR opened event"""

    logger.info(f"PR #{pr_data['number']} opened: {pr_data['title']}")

    # Create PR record
    pr = PullRequest(
        number=pr_data["number"],
        title=pr_data["title"],
        author=pr_data["user"]["login"],
        head_branch=pr_data["head"]["ref"],
        base_branch=pr_data["base"]["ref"],
        state="open",
        labels=[label["name"] for label in pr_data.get("labels", [])],
        created_at=datetime.fromisoformat(
            pr_data["created_at"].replace("Z", "+00:00")
        ),
        url=pr_data["html_url"]
    )

    db.add(pr)
    await db.commit()

    # Notify Prism Console
    await notify_prism("pr_opened", {
        "pr_number": pr.number,
        "title": pr.title,
        "author": pr.author
    })


async def on_pr_closed(pr_data: Dict[str, Any], db: AsyncSession):
    """PR closed event (merged or closed without merge)"""

    pr_number = pr_data["number"]
    merged = pr_data.get("merged", False)

    logger.info(f"PR #{pr_number} {'merged' if merged else 'closed'}")

    # Update PR record
    result = await db.execute(
        update(PullRequest)
        .where(PullRequest.number == pr_number)
        .values(
            state="merged" if merged else "closed",
            merged_at=datetime.utcnow() if merged else None,
            closed_at=datetime.utcnow()
        )
    )
    await db.commit()

    # Remove from merge queue if present
    await db.execute(
        update(MergeQueueEntry)
        .where(MergeQueueEntry.pr_number == pr_number)
        .values(status="completed" if merged else "cancelled")
    )
    await db.commit()

    # Notify Prism Console
    await notify_prism("pr_closed", {
        "pr_number": pr_number,
        "merged": merged
    })


async def on_pr_synchronized(pr_data: Dict[str, Any], db: AsyncSession):
    """PR synchronized event (new commits pushed)"""

    pr_number = pr_data["number"]

    logger.info(f"PR #{pr_number} synchronized (new commits)")

    # Update PR record
    await db.execute(
        update(PullRequest)
        .where(PullRequest.number == pr_number)
        .values(
            head_sha=pr_data["head"]["sha"],
            updated_at=datetime.utcnow()
        )
    )
    await db.commit()

    # Notify Prism Console (CI will re-run)
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
    label_name = label["name"]

    logger.info(f"PR #{pr_number} labeled: {label_name}")

    # Update PR labels
    result = await db.execute(
        select(PullRequest).where(PullRequest.number == pr_number)
    )
    pr = result.scalar_one_or_none()

    if pr:
        labels = pr.labels or []
        if label_name not in labels:
            labels.append(label_name)

        await db.execute(
            update(PullRequest)
            .where(PullRequest.number == pr_number)
            .values(labels=labels)
        )
        await db.commit()

    # Check if auto-merge label
    if label_name in ["auto-merge", "claude-auto", "merge-ready"]:
        await notify_prism("pr_auto_merge_enabled", {
            "pr_number": pr_number,
            "label": label_name
        })


async def handle_pr_review(payload: Dict[str, Any], db: AsyncSession):
    """Handle pull_request_review events"""

    action = payload["action"]
    pr_number = payload["pull_request"]["number"]
    review = payload["review"]

    if action == "submitted":
        state = review["state"]  # approved, changes_requested, commented

        logger.info(f"PR #{pr_number} review submitted: {state}")

        if state == "approved":
            # Update PR record
            await db.execute(
                update(PullRequest)
                .where(PullRequest.number == pr_number)
                .values(
                    approved=True,
                    approved_at=datetime.utcnow(),
                    approved_by=review["user"]["login"]
                )
            )
            await db.commit()

            # Check if can enter merge queue
            await check_merge_queue_eligibility(pr_number, db)

            # Notify Prism
            await notify_prism("pr_approved", {
                "pr_number": pr_number,
                "reviewer": review["user"]["login"]
            })


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

            # Update check status
            await update_check_status(pr_number, name, conclusion, db)

            # Notify Prism
            await notify_prism("pr_check_completed", {
                "pr_number": pr_number,
                "check_name": name,
                "result": conclusion
            })

            # If all checks pass, check merge queue eligibility
            if conclusion == "success":
                await check_merge_queue_eligibility(pr_number, db)


async def check_merge_queue_eligibility(pr_number: int, db: AsyncSession):
    """Check if PR can enter merge queue"""

    result = await db.execute(
        select(PullRequest).where(PullRequest.number == pr_number)
    )
    pr = result.scalar_one_or_none()

    if not pr:
        return

    # Check criteria
    has_auto_merge_label = any(
        label in (pr.labels or [])
        for label in ["auto-merge", "claude-auto", "merge-ready"]
    )

    is_approved = pr.approved
    all_checks_pass = pr.checks_status == "success"
    no_conflicts = not pr.has_conflicts

    can_enter_queue = (
        has_auto_merge_label and
        is_approved and
        all_checks_pass and
        no_conflicts
    )

    if can_enter_queue:
        # Add to merge queue
        queue_entry = MergeQueueEntry(
            pr_number=pr_number,
            status="queued",
            entered_at=datetime.utcnow()
        )
        db.add(queue_entry)
        await db.commit()

        logger.info(f"PR #{pr_number} entered merge queue")

        await notify_prism("pr_entered_queue", {
            "pr_number": pr_number,
            "position": await get_queue_position(pr_number, db)
        })


async def update_check_status(
    pr_number: int,
    check_name: str,
    conclusion: str,
    db: AsyncSession
):
    """Update PR check status"""

    result = await db.execute(
        select(PullRequest).where(PullRequest.number == pr_number)
    )
    pr = result.scalar_one_or_none()

    if not pr:
        return

    checks = pr.checks or {}
    checks[check_name] = conclusion

    # Determine overall status
    if all(status == "success" for status in checks.values()):
        overall_status = "success"
    elif any(status == "failure" for status in checks.values()):
        overall_status = "failure"
    else:
        overall_status = "pending"

    await db.execute(
        update(PullRequest)
        .where(PullRequest.number == pr_number)
        .values(
            checks=checks,
            checks_status=overall_status
        )
    )
    await db.commit()


async def get_queue_position(pr_number: int, db: AsyncSession) -> int:
    """Get PR position in merge queue"""

    result = await db.execute(
        select(MergeQueueEntry)
        .where(MergeQueueEntry.status == "queued")
        .order_by(MergeQueueEntry.entered_at)
    )
    queue = result.scalars().all()

    for i, entry in enumerate(queue):
        if entry.pr_number == pr_number:
            return i + 1

    return -1


def emit_os_event(event_name: str, data: Dict[str, Any]):
    """Emit event to Operator Engine (OS-level event bus)"""

    # This would integrate with the BlackRoad OS event system
    # For now, just log
    logger.info(f"OS Event: {event_name} - {data}")

    # TODO: Integrate with window.OS.emit() equivalent on backend
    # Could use Redis pub/sub, WebSocket broadcast, or event queue


async def notify_prism(event_type: str, data: Dict[str, Any]):
    """Send notification to Prism Console"""

    # This would send WebSocket message to Prism Console
    # For now, just log
    logger.info(f"Prism Notification: {event_type} - {data}")

    # TODO: Implement WebSocket broadcast
    # from ..websocket import broadcast
    # await broadcast({
    #     "type": f"github:{event_type}",
    #     "data": data
    # })
```

---

## Database Schema

### github_events Table

```sql
CREATE TABLE github_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    action VARCHAR(50),
    repository VARCHAR(255),
    sender VARCHAR(100),
    pr_number INTEGER,
    payload JSONB,
    received_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_github_events_pr ON github_events(pr_number);
CREATE INDEX idx_github_events_type ON github_events(event_type);
CREATE INDEX idx_github_events_received ON github_events(received_at);
```

### pull_requests Table

```sql
CREATE TABLE pull_requests (
    id SERIAL PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(100) NOT NULL,
    head_branch VARCHAR(255) NOT NULL,
    base_branch VARCHAR(255) NOT NULL,
    head_sha VARCHAR(40),
    state VARCHAR(20) NOT NULL,  -- open, closed, merged
    labels TEXT[],
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    checks JSONB,
    checks_status VARCHAR(20),  -- pending, success, failure
    has_conflicts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    closed_at TIMESTAMP,
    merged_at TIMESTAMP,
    url VARCHAR(500)
);

CREATE INDEX idx_pull_requests_number ON pull_requests(number);
CREATE INDEX idx_pull_requests_state ON pull_requests(state);
CREATE INDEX idx_pull_requests_author ON pull_requests(author);
```

### merge_queue Table

```sql
CREATE TABLE merge_queue (
    id SERIAL PRIMARY KEY,
    pr_number INTEGER UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL,  -- queued, merging, completed, failed, cancelled
    entered_at TIMESTAMP NOT NULL,
    started_merging_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (pr_number) REFERENCES pull_requests(number)
);

CREATE INDEX idx_merge_queue_status ON merge_queue(status);
CREATE INDEX idx_merge_queue_entered ON merge_queue(entered_at);
```

---

## Prism Console Integration

### WebSocket Events

**Prism Console** subscribes to GitHub events via WebSocket:

```javascript
// blackroad-os/js/apps/prism-merge-dashboard.js

const ws = new WebSocket('wss://blackroad.app/ws/prism');

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
        case 'github:pr_opened':
            onPROpened(message.data);
            break;
        case 'github:pr_approved':
            onPRApproved(message.data);
            break;
        case 'github:pr_entered_queue':
            onPREnteredQueue(message.data);
            break;
        case 'github:pr_check_completed':
            onCheckCompleted(message.data);
            break;
    }
};

function onPROpened(data) {
    console.log(`PR #${data.pr_number} opened: ${data.title}`);
    // Update dashboard UI
}

function onPREnteredQueue(data) {
    console.log(`PR #${data.pr_number} entered queue at position ${data.position}`);
    // Update queue visualization
}
```

---

## Operator Engine Integration

### OS-Level Events

**Operator Engine** can react to GitHub events:

```python
# Example: backend/app/services/operator_engine.py

from typing import Callable, Dict, Any

class OperatorEngine:
    """BlackRoad Operator Engine"""

    def __init__(self):
        self.event_handlers: Dict[str, list[Callable]] = {}

    def on(self, event_name: str, handler: Callable):
        """Register event handler"""
        if event_name not in self.event_handlers:
            self.event_handlers[event_name] = []
        self.event_handlers[event_name].append(handler)

    def emit(self, event_name: str, data: Dict[str, Any]):
        """Emit event to all registered handlers"""
        handlers = self.event_handlers.get(event_name, [])
        for handler in handlers:
            handler(data)

# Global operator instance
operator = OperatorEngine()

# Register GitHub event handlers
operator.on('github:pr:opened', lambda data: print(f"PR opened: {data}"))
operator.on('github:pr:merged', lambda data: print(f"PR merged: {data}"))
```

---

## Automation Rules

### Auto-Labeling on PR Open

```python
async def on_pr_opened(pr_data: Dict[str, Any], db: AsyncSession):
    """Auto-label PR based on files changed"""

    # Get changed files
    files_changed = await get_pr_files(pr_data["number"])

    # Determine labels
    labels = []

    if all(f.startswith("docs/") or f.endswith(".md") for f in files_changed):
        labels.append("docs-only")

    if all(f.startswith("backend/tests/") for f in files_changed):
        labels.append("tests-only")

    if pr_data["head"]["ref"].startswith("claude/"):
        labels.append("claude-auto")

    # Apply labels
    if labels:
        await apply_labels(pr_data["number"], labels)
```

---

## Summary

**Operator PR Event Handlers** provide:

- ✅ **Real-time event processing** from GitHub webhooks
- ✅ **Database audit trail** of all PR events
- ✅ **Operator Engine integration** for OS-level automation
- ✅ **Prism Console updates** via WebSocket
- ✅ **Merge queue management** based on PR state
- ✅ **Auto-labeling and routing** for incoming PRs

**Implementation Files**:
- `backend/app/routers/webhooks.py` - Webhook endpoint
- `backend/app/services/github_events.py` - Event handlers
- `backend/app/models/github_events.py` - Database models
- `blackroad-os/js/apps/prism-merge-dashboard.js` - UI dashboard

---

**Last Updated**: 2025-11-18
**Owner**: Operator Alexa (Cadillac)
**Related Docs**: `MERGE_QUEUE_PLAN.md`, `GITHUB_AUTOMATION_RULES.md`
