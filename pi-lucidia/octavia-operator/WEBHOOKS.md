# WEBHOOKS.md - Event System Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Event-driven architecture for real-time agent orchestration.

---

## Table of Contents

1. [Overview](#overview)
2. [Event Architecture](#event-architecture)
3. [Webhook Configuration](#webhook-configuration)
4. [Event Types](#event-types)
5. [Webhook Endpoints](#webhook-endpoints)
6. [Security](#security)
7. [Delivery & Retries](#delivery--retries)
8. [Integration Examples](#integration-examples)
9. [Event Bus](#event-bus)
10. [Monitoring](#monitoring)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Events?

BlackRoad OS uses an event-driven architecture to enable:

| Capability | Description |
|------------|-------------|
| **Real-time** | Instant notifications on state changes |
| **Decoupled** | Services don't need direct connections |
| **Scalable** | Handle millions of events per second |
| **Auditable** | Complete history of system activity |
| **Extensible** | Integrate any external service |

### Event Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     BlackRoad Event System                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐          │
│  │ LUCIDIA │   │  ALICE  │   │ OCTAVIA │   │  PRISM  │          │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘          │
│       │             │             │             │                 │
│       └─────────────┴──────┬──────┴─────────────┘                 │
│                            │                                      │
│                    ┌───────▼───────┐                              │
│                    │  Event Bus    │                              │
│                    │   (Redis)     │                              │
│                    └───────┬───────┘                              │
│                            │                                      │
│       ┌────────────────────┼────────────────────┐                │
│       │                    │                    │                │
│  ┌────▼────┐         ┌─────▼─────┐        ┌────▼────┐           │
│  │ Webhook │         │  Queue    │        │ Stream  │           │
│  │ Delivery│         │ Processor │        │ (SSE)   │           │
│  └────┬────┘         └─────┬─────┘        └────┬────┘           │
│       │                    │                   │                 │
│       ▼                    ▼                   ▼                 │
│  ┌─────────┐        ┌───────────┐       ┌──────────┐            │
│  │External │        │  Workers  │       │Dashboard │            │
│  │Services │        │           │       │          │            │
│  └─────────┘        └───────────┘       └──────────┘            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Event Architecture

### Event Structure

```python
# blackroad/events/models.py
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Optional
import uuid

@dataclass
class Event:
    """Core event structure."""

    # Unique event identifier
    id: str = None

    # Event type (e.g., "agent.task.completed")
    type: str = ""

    # Event source (e.g., "agent:LUCIDIA")
    source: str = ""

    # Event payload
    data: Dict[str, Any] = None

    # Metadata
    timestamp: datetime = None
    version: str = "1.0"
    correlation_id: Optional[str] = None

    def __post_init__(self):
        self.id = self.id or str(uuid.uuid4())
        self.timestamp = self.timestamp or datetime.utcnow()
        self.data = self.data or {}

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "type": self.type,
            "source": self.source,
            "data": self.data,
            "timestamp": self.timestamp.isoformat(),
            "version": self.version,
            "correlation_id": self.correlation_id,
        }
```

### Event Categories

```yaml
# Event type hierarchy
events:
  # Agent lifecycle
  agent:
    spawned: "Agent created and initialized"
    started: "Agent began processing"
    stopped: "Agent gracefully stopped"
    failed: "Agent encountered fatal error"
    heartbeat: "Agent health ping"

  # Task management
  task:
    created: "New task queued"
    assigned: "Task assigned to agent"
    started: "Task execution began"
    progress: "Task progress update"
    completed: "Task finished successfully"
    failed: "Task failed with error"
    cancelled: "Task manually cancelled"
    timeout: "Task exceeded time limit"

  # Memory operations
  memory:
    stored: "New memory created"
    retrieved: "Memory accessed"
    updated: "Memory modified"
    archived: "Memory moved to cold storage"
    deleted: "Memory permanently removed"

  # System events
  system:
    startup: "BlackRoad OS starting"
    shutdown: "BlackRoad OS stopping"
    config_changed: "Configuration updated"
    health_check: "System health report"
    alert: "System alert triggered"

  # Security events
  security:
    auth_success: "Successful authentication"
    auth_failure: "Failed authentication"
    permission_denied: "Access denied"
    anomaly_detected: "Suspicious activity"
```

---

## Webhook Configuration

### Registering Webhooks

```yaml
# config/webhooks.yaml
webhooks:
  - id: slack-notifications
    url: https://hooks.slack.com/services/XXX/YYY/ZZZ
    events:
      - agent.failed
      - task.failed
      - system.alert
    enabled: true
    secret: ${WEBHOOK_SECRET_SLACK}

  - id: monitoring-system
    url: https://monitoring.blackroad.io/webhooks/events
    events:
      - "*"  # All events
    enabled: true
    secret: ${WEBHOOK_SECRET_MONITORING}
    headers:
      X-Source: blackroad-os

  - id: github-integration
    url: https://api.github.com/repos/owner/repo/dispatches
    events:
      - task.completed
      - code.reviewed
    enabled: true
    secret: ${WEBHOOK_SECRET_GITHUB}
    headers:
      Authorization: token ${GITHUB_TOKEN}
      Accept: application/vnd.github.v3+json

  - id: discord-alerts
    url: https://discord.com/api/webhooks/XXX/YYY
    events:
      - agent.spawned
      - agent.failed
      - task.completed
    enabled: true
    transform: discord  # Use Discord message format
```

### Webhook Management API

```bash
# List webhooks
curl -X GET https://api.blackroad.io/v1/webhooks \
  -H "Authorization: Bearer $TOKEN"

# Create webhook
curl -X POST https://api.blackroad.io/v1/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook",
    "events": ["task.completed", "agent.failed"],
    "secret": "whsec_xxxxx"
  }'

# Update webhook
curl -X PATCH https://api.blackroad.io/v1/webhooks/wh_123 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled": false}'

# Delete webhook
curl -X DELETE https://api.blackroad.io/v1/webhooks/wh_123 \
  -H "Authorization: Bearer $TOKEN"

# Test webhook
curl -X POST https://api.blackroad.io/v1/webhooks/wh_123/test \
  -H "Authorization: Bearer $TOKEN"
```

---

## Event Types

### Agent Events

```python
# agent.spawned
{
    "id": "evt_abc123",
    "type": "agent.spawned",
    "source": "orchestrator",
    "data": {
        "agent_id": "agent_xyz789",
        "agent_type": "LUCIDIA",
        "config": {
            "model": "mistral:7b",
            "max_memory": "4GB"
        }
    },
    "timestamp": "2024-01-15T10:30:00Z"
}

# agent.failed
{
    "id": "evt_def456",
    "type": "agent.failed",
    "source": "agent:ALICE",
    "data": {
        "agent_id": "agent_abc123",
        "error": "OutOfMemoryError",
        "message": "Exceeded memory limit",
        "stack_trace": "...",
        "last_task": "task_xyz"
    },
    "timestamp": "2024-01-15T10:35:00Z"
}
```

### Task Events

```python
# task.created
{
    "id": "evt_task001",
    "type": "task.created",
    "source": "api",
    "data": {
        "task_id": "task_xyz789",
        "title": "Analyze codebase",
        "priority": "high",
        "requester": "user_123",
        "estimated_duration": 300
    },
    "timestamp": "2024-01-15T11:00:00Z"
}

# task.progress
{
    "id": "evt_task002",
    "type": "task.progress",
    "source": "agent:LUCIDIA",
    "data": {
        "task_id": "task_xyz789",
        "progress": 45,
        "message": "Analyzing 45/100 files",
        "current_step": "code_analysis",
        "steps_completed": 2,
        "total_steps": 5
    },
    "timestamp": "2024-01-15T11:05:00Z"
}

# task.completed
{
    "id": "evt_task003",
    "type": "task.completed",
    "source": "agent:LUCIDIA",
    "data": {
        "task_id": "task_xyz789",
        "result": {
            "files_analyzed": 100,
            "issues_found": 12,
            "suggestions": 5
        },
        "duration_ms": 287000,
        "tokens_used": 15000
    },
    "timestamp": "2024-01-15T11:10:00Z"
}
```

### Memory Events

```python
# memory.stored
{
    "id": "evt_mem001",
    "type": "memory.stored",
    "source": "agent:ECHO",
    "data": {
        "memory_id": "mem_abc123",
        "layer": "episodic",
        "content_type": "conversation",
        "size_bytes": 4096,
        "hash": "sha256:abc123..."
    },
    "timestamp": "2024-01-15T12:00:00Z"
}

# memory.archived
{
    "id": "evt_mem002",
    "type": "memory.archived",
    "source": "memory-manager",
    "data": {
        "memory_ids": ["mem_001", "mem_002", "mem_003"],
        "from_layer": "episodic",
        "to_layer": "archival",
        "reason": "age_policy",
        "total_size_bytes": 1048576
    },
    "timestamp": "2024-01-15T12:30:00Z"
}
```

### System Events

```python
# system.alert
{
    "id": "evt_sys001",
    "type": "system.alert",
    "source": "monitoring",
    "data": {
        "severity": "warning",
        "title": "High CPU Usage",
        "message": "CPU usage exceeded 90% for 5 minutes",
        "metrics": {
            "cpu_percent": 92.5,
            "memory_percent": 75.2,
            "duration_seconds": 300
        },
        "affected_agents": ["LUCIDIA", "ALICE"]
    },
    "timestamp": "2024-01-15T13:00:00Z"
}
```

---

## Webhook Endpoints

### Creating a Webhook Receiver

```python
# blackroad/webhooks/receiver.py
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib
import json

app = FastAPI()

WEBHOOK_SECRET = "whsec_your_secret_here"

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify webhook signature."""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

@app.post("/webhooks/blackroad")
async def receive_webhook(request: Request):
    """Receive BlackRoad webhook events."""

    # Get signature header
    signature = request.headers.get("X-BlackRoad-Signature")
    if not signature:
        raise HTTPException(401, "Missing signature")

    # Read body
    body = await request.body()

    # Verify signature
    if not verify_signature(body, signature, WEBHOOK_SECRET):
        raise HTTPException(401, "Invalid signature")

    # Parse event
    event = json.loads(body)

    # Process based on event type
    event_type = event["type"]

    if event_type == "task.completed":
        await handle_task_completed(event)
    elif event_type == "agent.failed":
        await handle_agent_failed(event)
    elif event_type == "system.alert":
        await handle_system_alert(event)
    else:
        print(f"Unhandled event type: {event_type}")

    return {"received": True}

async def handle_task_completed(event: dict):
    """Handle task completion."""
    task_id = event["data"]["task_id"]
    result = event["data"]["result"]
    print(f"Task {task_id} completed: {result}")

async def handle_agent_failed(event: dict):
    """Handle agent failure."""
    agent_id = event["data"]["agent_id"]
    error = event["data"]["error"]
    # Send alert, restart agent, etc.
    print(f"Agent {agent_id} failed: {error}")

async def handle_system_alert(event: dict):
    """Handle system alert."""
    severity = event["data"]["severity"]
    title = event["data"]["title"]
    # Escalate if critical
    print(f"[{severity.upper()}] {title}")
```

### Node.js Receiver

```javascript
// webhooks/receiver.js
const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Raw body for signature verification
app.use('/webhooks', express.raw({ type: 'application/json' }));

function verifySignature(payload, signature) {
    const expected = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
    );
}

app.post('/webhooks/blackroad', (req, res) => {
    const signature = req.headers['x-blackroad-signature'];

    if (!signature || !verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body);
    console.log(`Received event: ${event.type}`);

    // Process event asynchronously
    processEvent(event).catch(console.error);

    // Respond immediately
    res.json({ received: true });
});

async function processEvent(event) {
    switch (event.type) {
        case 'task.completed':
            await notifySlack(`Task ${event.data.task_id} completed!`);
            break;
        case 'agent.failed':
            await createPagerDutyIncident(event);
            break;
        default:
            console.log(`Unhandled: ${event.type}`);
    }
}

app.listen(3000, () => console.log('Webhook receiver running on :3000'));
```

---

## Security

### Signature Verification

```python
# blackroad/webhooks/security.py
import hmac
import hashlib
import time
from typing import Optional

def sign_payload(
    payload: bytes,
    secret: str,
    timestamp: Optional[int] = None
) -> tuple[str, int]:
    """Sign a webhook payload."""
    timestamp = timestamp or int(time.time())
    message = f"{timestamp}.{payload.decode()}"
    signature = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"t={timestamp},v1={signature}", timestamp

def verify_payload(
    payload: bytes,
    header: str,
    secret: str,
    tolerance: int = 300  # 5 minutes
) -> bool:
    """Verify webhook signature with timestamp tolerance."""

    # Parse header
    parts = dict(p.split("=") for p in header.split(","))
    timestamp = int(parts.get("t", 0))
    signature = parts.get("v1", "")

    # Check timestamp freshness
    if abs(time.time() - timestamp) > tolerance:
        return False

    # Verify signature
    message = f"{timestamp}.{payload.decode()}"
    expected = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)
```

### IP Allowlisting

```yaml
# config/security.yaml
webhooks:
  security:
    # Only accept webhooks from these IPs
    allowed_ips:
      - 10.0.0.0/8
      - 192.168.0.0/16
      - 203.0.113.0/24  # BlackRoad edge servers

    # Require HTTPS
    require_https: true

    # Maximum payload size
    max_payload_bytes: 1048576  # 1MB

    # Rate limiting
    rate_limit:
      requests_per_minute: 1000
      burst: 100
```

### Secret Rotation

```python
# blackroad/webhooks/rotation.py
import secrets
from datetime import datetime, timedelta

class SecretRotator:
    """Manage webhook secret rotation."""

    def __init__(self, db):
        self.db = db

    def generate_secret(self) -> str:
        """Generate a new webhook secret."""
        return f"whsec_{secrets.token_urlsafe(32)}"

    async def rotate_secret(self, webhook_id: str) -> dict:
        """Rotate webhook secret with grace period."""

        # Generate new secret
        new_secret = self.generate_secret()

        # Get current secret
        webhook = await self.db.get_webhook(webhook_id)
        old_secret = webhook["secret"]

        # Update with both secrets active
        await self.db.update_webhook(webhook_id, {
            "secret": new_secret,
            "previous_secret": old_secret,
            "secret_rotated_at": datetime.utcnow(),
            "previous_secret_expires": datetime.utcnow() + timedelta(hours=24)
        })

        return {
            "new_secret": new_secret,
            "old_secret_valid_until": datetime.utcnow() + timedelta(hours=24)
        }
```

---

## Delivery & Retries

### Retry Configuration

```yaml
# config/delivery.yaml
delivery:
  # Initial retry delay
  initial_delay_ms: 1000

  # Maximum retries
  max_retries: 5

  # Backoff multiplier
  backoff_multiplier: 2

  # Maximum delay between retries
  max_delay_ms: 60000

  # Retry schedule (seconds): 1, 2, 4, 8, 16
  # After 5 failures, webhook marked as failed

  # Timeout for each delivery attempt
  timeout_ms: 30000

  # Success status codes
  success_codes: [200, 201, 202, 204]
```

### Delivery Engine

```python
# blackroad/webhooks/delivery.py
import asyncio
import httpx
from dataclasses import dataclass
from typing import List
import json

@dataclass
class DeliveryAttempt:
    timestamp: str
    status_code: int
    response_body: str
    duration_ms: int
    success: bool

class WebhookDelivery:
    """Reliable webhook delivery with retries."""

    def __init__(self, config: dict):
        self.config = config
        self.client = httpx.AsyncClient(timeout=config["timeout_ms"] / 1000)

    async def deliver(
        self,
        url: str,
        payload: dict,
        secret: str,
        headers: dict = None
    ) -> List[DeliveryAttempt]:
        """Deliver webhook with exponential backoff retries."""

        attempts = []
        delay = self.config["initial_delay_ms"] / 1000

        for attempt in range(self.config["max_retries"] + 1):
            result = await self._attempt_delivery(url, payload, secret, headers)
            attempts.append(result)

            if result.success:
                return attempts

            if attempt < self.config["max_retries"]:
                await asyncio.sleep(delay)
                delay = min(
                    delay * self.config["backoff_multiplier"],
                    self.config["max_delay_ms"] / 1000
                )

        return attempts

    async def _attempt_delivery(
        self,
        url: str,
        payload: dict,
        secret: str,
        headers: dict
    ) -> DeliveryAttempt:
        """Single delivery attempt."""
        import time

        body = json.dumps(payload)
        signature, timestamp = sign_payload(body.encode(), secret)

        request_headers = {
            "Content-Type": "application/json",
            "X-BlackRoad-Signature": signature,
            "X-BlackRoad-Timestamp": str(timestamp),
            "User-Agent": "BlackRoad-Webhook/1.0",
            **(headers or {})
        }

        start = time.time()
        try:
            response = await self.client.post(
                url,
                content=body,
                headers=request_headers
            )
            duration = int((time.time() - start) * 1000)

            return DeliveryAttempt(
                timestamp=datetime.utcnow().isoformat(),
                status_code=response.status_code,
                response_body=response.text[:1000],
                duration_ms=duration,
                success=response.status_code in self.config["success_codes"]
            )
        except Exception as e:
            duration = int((time.time() - start) * 1000)
            return DeliveryAttempt(
                timestamp=datetime.utcnow().isoformat(),
                status_code=0,
                response_body=str(e),
                duration_ms=duration,
                success=False
            )
```

### Dead Letter Queue

```python
# blackroad/webhooks/dlq.py
from datetime import datetime
import json

class DeadLetterQueue:
    """Store failed webhook deliveries for later processing."""

    def __init__(self, redis):
        self.redis = redis
        self.key = "webhooks:dlq"

    async def push(self, webhook_id: str, event: dict, attempts: list):
        """Add failed delivery to DLQ."""
        entry = {
            "webhook_id": webhook_id,
            "event": event,
            "attempts": [a.__dict__ for a in attempts],
            "failed_at": datetime.utcnow().isoformat(),
            "retry_count": 0
        }
        await self.redis.lpush(self.key, json.dumps(entry))

    async def pop(self) -> dict | None:
        """Get next item from DLQ."""
        data = await self.redis.rpop(self.key)
        return json.loads(data) if data else None

    async def reprocess(self, delivery_engine):
        """Attempt to reprocess failed deliveries."""
        while item := await self.pop():
            webhook = await self.get_webhook(item["webhook_id"])
            if webhook and webhook["enabled"]:
                success = await delivery_engine.deliver(
                    webhook["url"],
                    item["event"],
                    webhook["secret"]
                )
                if not success:
                    item["retry_count"] += 1
                    if item["retry_count"] < 3:
                        await self.push_back(item)
```

---

## Integration Examples

### Slack Integration

```python
# blackroad/integrations/slack.py
import httpx

class SlackWebhook:
    """Send events to Slack."""

    def __init__(self, webhook_url: str):
        self.url = webhook_url

    async def send_task_completed(self, event: dict):
        """Format task completion for Slack."""
        task = event["data"]
        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"Task Completed: {task['task_id']}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Duration:* {task['duration_ms']}ms"},
                        {"type": "mrkdwn", "text": f"*Tokens:* {task['tokens_used']}"},
                    ]
                },
                {
                    "type": "context",
                    "elements": [
                        {"type": "mrkdwn", "text": f"Event ID: `{event['id']}`"}
                    ]
                }
            ]
        }
        async with httpx.AsyncClient() as client:
            await client.post(self.url, json=payload)

    async def send_alert(self, event: dict):
        """Format alert for Slack."""
        alert = event["data"]
        color = {"critical": "#FF0000", "warning": "#FFA500", "info": "#0000FF"}
        payload = {
            "attachments": [{
                "color": color.get(alert["severity"], "#808080"),
                "title": f"[{alert['severity'].upper()}] {alert['title']}",
                "text": alert["message"],
                "footer": "BlackRoad OS",
                "ts": int(datetime.fromisoformat(event["timestamp"]).timestamp())
            }]
        }
        async with httpx.AsyncClient() as client:
            await client.post(self.url, json=payload)
```

### Discord Integration

```python
# blackroad/integrations/discord.py
import httpx

class DiscordWebhook:
    """Send events to Discord."""

    def __init__(self, webhook_url: str):
        self.url = webhook_url

    async def send_event(self, event: dict):
        """Format event as Discord embed."""
        embed = {
            "title": event["type"],
            "description": f"Event from {event['source']}",
            "color": self._get_color(event["type"]),
            "fields": [
                {"name": key, "value": str(value)[:1024], "inline": True}
                for key, value in event["data"].items()
            ][:25],
            "timestamp": event["timestamp"],
            "footer": {"text": f"Event ID: {event['id']}"}
        }

        async with httpx.AsyncClient() as client:
            await client.post(self.url, json={"embeds": [embed]})

    def _get_color(self, event_type: str) -> int:
        colors = {
            "agent.spawned": 0x00FF00,   # Green
            "agent.failed": 0xFF0000,     # Red
            "task.completed": 0x0000FF,   # Blue
            "system.alert": 0xFFA500,     # Orange
        }
        return colors.get(event_type, 0x808080)
```

### GitHub Actions Integration

```yaml
# .github/workflows/webhook-triggered.yml
name: BlackRoad Event Handler

on:
  repository_dispatch:
    types: [task.completed, code.reviewed]

jobs:
  handle-event:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Handle Task Completed
        if: github.event.action == 'task.completed'
        run: |
          echo "Task completed: ${{ github.event.client_payload.task_id }}"
          echo "Result: ${{ toJSON(github.event.client_payload.result) }}"

      - name: Handle Code Review
        if: github.event.action == 'code.reviewed'
        run: |
          echo "Review completed for PR #${{ github.event.client_payload.pr_number }}"
```

### PagerDuty Integration

```python
# blackroad/integrations/pagerduty.py
import httpx

class PagerDutyIntegration:
    """Send critical alerts to PagerDuty."""

    def __init__(self, routing_key: str):
        self.routing_key = routing_key
        self.url = "https://events.pagerduty.com/v2/enqueue"

    async def create_incident(self, event: dict):
        """Create PagerDuty incident from alert."""
        alert = event["data"]

        if alert["severity"] != "critical":
            return  # Only page for critical

        payload = {
            "routing_key": self.routing_key,
            "event_action": "trigger",
            "dedup_key": event["id"],
            "payload": {
                "summary": f"[BlackRoad] {alert['title']}",
                "severity": "critical",
                "source": event["source"],
                "custom_details": alert
            }
        }

        async with httpx.AsyncClient() as client:
            await client.post(self.url, json=payload)
```

---

## Event Bus

### Redis Pub/Sub Implementation

```python
# blackroad/events/bus.py
import redis.asyncio as redis
import json
from typing import Callable, List
import asyncio

class EventBus:
    """Central event bus using Redis Pub/Sub."""

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        self.subscribers: dict[str, List[Callable]] = {}

    async def publish(self, event: Event):
        """Publish event to the bus."""
        channel = f"events:{event.type}"
        await self.redis.publish(channel, json.dumps(event.to_dict()))

        # Also publish to wildcard channels
        parts = event.type.split(".")
        for i in range(len(parts)):
            pattern = ".".join(parts[:i+1]) + ".*"
            await self.redis.publish(f"events:{pattern}", json.dumps(event.to_dict()))

    async def subscribe(self, pattern: str, handler: Callable):
        """Subscribe to event pattern."""
        if pattern not in self.subscribers:
            self.subscribers[pattern] = []
        self.subscribers[pattern].append(handler)

    async def listen(self):
        """Start listening for events."""
        pubsub = self.redis.pubsub()

        # Subscribe to all registered patterns
        for pattern in self.subscribers:
            await pubsub.psubscribe(f"events:{pattern}")

        async for message in pubsub.listen():
            if message["type"] == "pmessage":
                event = json.loads(message["data"])
                pattern = message["pattern"].decode().replace("events:", "")

                for handler in self.subscribers.get(pattern, []):
                    asyncio.create_task(handler(event))

# Usage
bus = EventBus()

@bus.subscribe("task.*")
async def handle_task_events(event):
    print(f"Task event: {event['type']}")

@bus.subscribe("agent.failed")
async def handle_agent_failure(event):
    await notify_ops_team(event)
```

### Event Stream (SSE)

```python
# blackroad/events/stream.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

class EventStream:
    """Server-Sent Events for real-time updates."""

    def __init__(self, bus: EventBus):
        self.bus = bus
        self.clients: List[asyncio.Queue] = []

    def add_client(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self.clients.append(queue)
        return queue

    def remove_client(self, queue: asyncio.Queue):
        self.clients.remove(queue)

    async def broadcast(self, event: dict):
        for queue in self.clients:
            await queue.put(event)

stream = EventStream(bus)

@app.get("/events/stream")
async def event_stream(request: Request):
    """SSE endpoint for real-time events."""

    async def generate():
        queue = stream.add_client()
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30)
                    yield f"event: {event['type']}\n"
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield f": keepalive\n\n"
        finally:
            stream.remove_client(queue)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
```

---

## Monitoring

### Webhook Metrics

```python
# blackroad/webhooks/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Delivery metrics
webhook_deliveries = Counter(
    "blackroad_webhook_deliveries_total",
    "Total webhook deliveries",
    ["webhook_id", "event_type", "status"]
)

webhook_latency = Histogram(
    "blackroad_webhook_delivery_latency_seconds",
    "Webhook delivery latency",
    ["webhook_id"],
    buckets=[0.1, 0.5, 1, 2, 5, 10, 30]
)

webhook_retries = Counter(
    "blackroad_webhook_retries_total",
    "Total webhook retry attempts",
    ["webhook_id"]
)

dlq_size = Gauge(
    "blackroad_webhook_dlq_size",
    "Dead letter queue size"
)

# Event metrics
events_published = Counter(
    "blackroad_events_published_total",
    "Total events published",
    ["event_type", "source"]
)

events_processed = Counter(
    "blackroad_events_processed_total",
    "Total events processed",
    ["event_type", "handler"]
)
```

### Health Dashboard

```python
# blackroad/webhooks/health.py
from dataclasses import dataclass
from typing import List
from datetime import datetime, timedelta

@dataclass
class WebhookHealth:
    webhook_id: str
    url: str
    status: str  # healthy, degraded, unhealthy
    success_rate_24h: float
    avg_latency_ms: float
    last_success: datetime
    last_failure: datetime
    consecutive_failures: int

async def get_webhook_health(webhook_id: str, db, metrics) -> WebhookHealth:
    """Get health status for a webhook."""

    webhook = await db.get_webhook(webhook_id)
    stats = await metrics.get_webhook_stats(webhook_id, hours=24)

    success_rate = stats["successes"] / max(stats["total"], 1)

    if success_rate >= 0.99 and stats["consecutive_failures"] == 0:
        status = "healthy"
    elif success_rate >= 0.95:
        status = "degraded"
    else:
        status = "unhealthy"

    return WebhookHealth(
        webhook_id=webhook_id,
        url=webhook["url"],
        status=status,
        success_rate_24h=success_rate,
        avg_latency_ms=stats["avg_latency_ms"],
        last_success=stats["last_success"],
        last_failure=stats["last_failure"],
        consecutive_failures=stats["consecutive_failures"]
    )
```

---

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Events

```bash
# Check if webhook is enabled
curl -X GET https://api.blackroad.io/v1/webhooks/wh_123 \
  -H "Authorization: Bearer $TOKEN"

# Check recent delivery attempts
curl -X GET https://api.blackroad.io/v1/webhooks/wh_123/deliveries?limit=10 \
  -H "Authorization: Bearer $TOKEN"

# Test webhook endpoint
curl -X POST https://api.blackroad.io/v1/webhooks/wh_123/test \
  -H "Authorization: Bearer $TOKEN"
```

#### Signature Verification Failing

```python
# Debug signature verification
def debug_signature(payload: str, received_sig: str, secret: str):
    parts = dict(p.split("=") for p in received_sig.split(","))
    timestamp = parts.get("t")
    received_hash = parts.get("v1")

    message = f"{timestamp}.{payload}"
    expected_hash = hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    print(f"Timestamp: {timestamp}")
    print(f"Received:  {received_hash}")
    print(f"Expected:  {expected_hash}")
    print(f"Match:     {received_hash == expected_hash}")
```

#### High Latency

```bash
# Check delivery metrics
curl -X GET https://api.blackroad.io/v1/webhooks/wh_123/metrics \
  -H "Authorization: Bearer $TOKEN"

# Response
{
  "avg_latency_ms": 1500,
  "p99_latency_ms": 5000,
  "timeout_rate": 0.02,
  "recommendation": "Consider increasing timeout or optimizing endpoint"
}
```

### Debug Mode

```yaml
# config/webhooks.yaml
webhooks:
  debug:
    enabled: true
    log_payloads: true
    log_responses: true
    log_headers: true
```

---

## Quick Reference

### Event Format

```json
{
  "id": "evt_xxx",
  "type": "category.action",
  "source": "component",
  "data": {},
  "timestamp": "ISO8601",
  "version": "1.0",
  "correlation_id": "optional"
}
```

### Headers Sent

| Header | Description |
|--------|-------------|
| `X-BlackRoad-Signature` | HMAC-SHA256 signature |
| `X-BlackRoad-Timestamp` | Unix timestamp |
| `X-BlackRoad-Event-Type` | Event type |
| `X-BlackRoad-Event-ID` | Unique event ID |
| `Content-Type` | `application/json` |

### Status Codes

| Code | Meaning |
|------|---------|
| 2xx | Success, delivery confirmed |
| 4xx | Client error, no retry |
| 5xx | Server error, will retry |
| Timeout | Will retry with backoff |

---

## Related Documentation

- [WORKFLOWS.md](WORKFLOWS.md) - Workflow automation
- [INTEGRATIONS.md](INTEGRATIONS.md) - Third-party integrations
- [MONITORING.md](MONITORING.md) - Observability guide
- [API.md](API.md) - API reference
- [SECURITY.md](SECURITY.md) - Security practices

---

*Your AI. Your Hardware. Your Rules.*
