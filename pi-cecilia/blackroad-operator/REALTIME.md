# REALTIME.md - Real-Time Communication Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Sub-second agent communication with WebSockets, SSE, and streaming.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [WebSocket Server](#websocket-server)
4. [Server-Sent Events](#server-sent-events)
5. [Streaming Responses](#streaming-responses)
6. [Agent Subscriptions](#agent-subscriptions)
7. [Presence System](#presence-system)
8. [Channels & Rooms](#channels--rooms)
9. [Rate Limiting](#rate-limiting)
10. [Scaling](#scaling)

---

## Overview

### Why Real-Time?

BlackRoad OS real-time features enable:

| Feature | Latency | Use Case |
|---------|---------|----------|
| **WebSockets** | <10ms | Bidirectional agent chat |
| **SSE** | <50ms | Dashboard updates |
| **Streaming** | First token <100ms | LLM responses |
| **Presence** | <1s | Agent online status |

### Real-Time Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 BlackRoad Real-Time System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Client Layer                           │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │Dashboard│  │   CLI   │  │  Agent  │  │   API   │     │   │
│  │  │   SSE   │  │   WS    │  │   WS    │  │  REST   │     │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘     │   │
│  └───────┴────────────┴───────────┴────────────┴────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │                 Gateway Layer                             │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │              WebSocket Gateway                    │    │   │
│  │  │     Connection Manager | Auth | Rate Limit        │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │                 Pub/Sub Layer                             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │   Redis    │  │  Channels  │  │  Presence  │         │   │
│  │  │  Pub/Sub   │  │   Rooms    │  │   Store    │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │                 Agent Layer                               │   │
│  │  LUCIDIA  │  ALICE  │  OCTAVIA  │  PRISM  │  ECHO       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## WebSocket Server

### Server Implementation

```python
# blackroad/realtime/websocket.py
import asyncio
import json
from typing import Dict, Set, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dataclasses import dataclass, field
import redis.asyncio as redis

@dataclass
class Connection:
    """WebSocket connection metadata."""
    websocket: WebSocket
    client_id: str
    agent_id: Optional[str] = None
    subscriptions: Set[str] = field(default_factory=set)
    connected_at: str = ""
    last_ping: str = ""

class WebSocketManager:
    """Manage WebSocket connections."""

    def __init__(self):
        self.connections: Dict[str, Connection] = {}
        self.rooms: Dict[str, Set[str]] = {}  # room -> client_ids
        self.redis = None

    async def initialize(self, redis_url: str):
        """Initialize with Redis for multi-node support."""
        self.redis = await redis.from_url(redis_url)
        asyncio.create_task(self._subscribe_to_broadcasts())

    async def connect(
        self,
        websocket: WebSocket,
        client_id: str,
        agent_id: str = None
    ) -> Connection:
        """Accept new WebSocket connection."""
        await websocket.accept()

        conn = Connection(
            websocket=websocket,
            client_id=client_id,
            agent_id=agent_id,
            connected_at=datetime.utcnow().isoformat()
        )
        self.connections[client_id] = conn

        # Announce presence
        await self._publish_presence(client_id, "online")

        return conn

    async def disconnect(self, client_id: str):
        """Handle disconnection."""
        if client_id in self.connections:
            conn = self.connections[client_id]

            # Leave all rooms
            for room in list(conn.subscriptions):
                await self.leave_room(client_id, room)

            # Announce departure
            await self._publish_presence(client_id, "offline")

            del self.connections[client_id]

    async def send_to_client(self, client_id: str, message: dict):
        """Send message to specific client."""
        if client_id in self.connections:
            conn = self.connections[client_id]
            await conn.websocket.send_json(message)

    async def broadcast_to_room(self, room: str, message: dict, exclude: str = None):
        """Broadcast to all clients in a room."""
        if room in self.rooms:
            for client_id in self.rooms[room]:
                if client_id != exclude:
                    await self.send_to_client(client_id, message)

        # Also publish to Redis for other nodes
        await self.redis.publish(
            f"room:{room}",
            json.dumps({"message": message, "exclude": exclude})
        )

    async def join_room(self, client_id: str, room: str):
        """Add client to a room."""
        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(client_id)

        if client_id in self.connections:
            self.connections[client_id].subscriptions.add(room)

        await self.broadcast_to_room(room, {
            "type": "room.joined",
            "client_id": client_id,
            "room": room
        }, exclude=client_id)

    async def leave_room(self, client_id: str, room: str):
        """Remove client from a room."""
        if room in self.rooms:
            self.rooms[room].discard(client_id)

        if client_id in self.connections:
            self.connections[client_id].subscriptions.discard(room)

        await self.broadcast_to_room(room, {
            "type": "room.left",
            "client_id": client_id,
            "room": room
        })

    async def _subscribe_to_broadcasts(self):
        """Listen for broadcasts from other nodes."""
        pubsub = self.redis.pubsub()
        await pubsub.psubscribe("room:*")

        async for message in pubsub.listen():
            if message["type"] == "pmessage":
                room = message["channel"].decode().replace("room:", "")
                data = json.loads(message["data"])

                # Broadcast to local clients
                for client_id in self.rooms.get(room, []):
                    if client_id != data.get("exclude"):
                        await self.send_to_client(client_id, data["message"])


# FastAPI WebSocket endpoint
app = FastAPI()
manager = WebSocketManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication."""
    conn = await manager.connect(websocket, client_id)

    try:
        while True:
            data = await websocket.receive_json()
            await handle_message(conn, data)
    except WebSocketDisconnect:
        await manager.disconnect(client_id)

async def handle_message(conn: Connection, data: dict):
    """Handle incoming WebSocket message."""
    msg_type = data.get("type")

    if msg_type == "ping":
        await conn.websocket.send_json({"type": "pong"})

    elif msg_type == "subscribe":
        room = data.get("room")
        await manager.join_room(conn.client_id, room)

    elif msg_type == "unsubscribe":
        room = data.get("room")
        await manager.leave_room(conn.client_id, room)

    elif msg_type == "message":
        room = data.get("room")
        await manager.broadcast_to_room(room, {
            "type": "message",
            "from": conn.client_id,
            "content": data.get("content"),
            "timestamp": datetime.utcnow().isoformat()
        })

    elif msg_type == "agent.invoke":
        # Forward to agent
        await invoke_agent(conn, data)
```

### Client Implementation

```typescript
// client/websocket.ts
class BlackRoadWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private handlers: Map<string, Function[]> = new Map();

  constructor(
    private url: string,
    private clientId: string
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.url}/ws/${this.clientId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  subscribe(room: string): void {
    this.send({ type: 'subscribe', room });
  }

  unsubscribe(room: string): void {
    this.send({ type: 'unsubscribe', room });
  }

  sendMessage(room: string, content: any): void {
    this.send({ type: 'message', room, content });
  }

  on(event: string, handler: Function): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(data: any): void {
    const handlers = this.handlers.get(data.type) || [];
    handlers.forEach(h => h(data));
  }

  private startHeartbeat(): void {
    setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
    }
  }
}

// Usage
const ws = new BlackRoadWebSocket('wss://api.blackroad.io', 'client-123');
await ws.connect();

ws.subscribe('agents:LUCIDIA');
ws.on('message', (data) => {
  console.log('Received:', data);
});
```

---

## Server-Sent Events

### SSE Server

```python
# blackroad/realtime/sse.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import asyncio
import json
from typing import AsyncGenerator

app = FastAPI()

class SSEManager:
    """Manage Server-Sent Events connections."""

    def __init__(self):
        self.clients: Dict[str, asyncio.Queue] = {}

    def add_client(self, client_id: str) -> asyncio.Queue:
        """Register new SSE client."""
        queue = asyncio.Queue()
        self.clients[client_id] = queue
        return queue

    def remove_client(self, client_id: str):
        """Remove SSE client."""
        if client_id in self.clients:
            del self.clients[client_id]

    async def broadcast(self, event: str, data: dict):
        """Broadcast to all SSE clients."""
        message = self._format_sse(event, data)
        for queue in self.clients.values():
            await queue.put(message)

    async def send_to_client(self, client_id: str, event: str, data: dict):
        """Send to specific client."""
        if client_id in self.clients:
            message = self._format_sse(event, data)
            await self.clients[client_id].put(message)

    def _format_sse(self, event: str, data: dict) -> str:
        """Format as SSE message."""
        return f"event: {event}\ndata: {json.dumps(data)}\n\n"


sse_manager = SSEManager()


@app.get("/events/{client_id}")
async def sse_endpoint(request: Request, client_id: str):
    """SSE endpoint for real-time updates."""

    async def event_generator() -> AsyncGenerator[str, None]:
        queue = sse_manager.add_client(client_id)

        try:
            # Send initial connection event
            yield sse_manager._format_sse("connected", {"client_id": client_id})

            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break

                try:
                    # Wait for message with timeout for keepalive
                    message = await asyncio.wait_for(queue.get(), timeout=30)
                    yield message
                except asyncio.TimeoutError:
                    # Send keepalive
                    yield ": keepalive\n\n"

        finally:
            sse_manager.remove_client(client_id)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


# Broadcast events from anywhere
@app.post("/broadcast")
async def broadcast_event(event: str, data: dict):
    """Broadcast event to all SSE clients."""
    await sse_manager.broadcast(event, data)
    return {"status": "sent", "clients": len(sse_manager.clients)}
```

### SSE Client

```typescript
// client/sse.ts
class BlackRoadSSE {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, Function[]> = new Map();

  constructor(private url: string, private clientId: string) {}

  connect(): void {
    this.eventSource = new EventSource(`${this.url}/events/${this.clientId}`);

    this.eventSource.onopen = () => {
      console.log('SSE connected');
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // Auto-reconnects built into EventSource
    };

    // Listen for all events
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit('message', data);
    };
  }

  on(event: string, handler: Function): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);

    // Add EventSource listener for typed events
    this.eventSource?.addEventListener(event, (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      handler(data);
    });
  }

  private emit(event: string, data: any): void {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(h => h(data));
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}

// Usage
const sse = new BlackRoadSSE('https://api.blackroad.io', 'client-123');
sse.connect();

sse.on('agent.status', (data) => {
  console.log('Agent status:', data);
});

sse.on('task.progress', (data) => {
  updateProgressBar(data.progress);
});
```

---

## Streaming Responses

### LLM Streaming

```python
# blackroad/realtime/streaming.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
from typing import AsyncGenerator

app = FastAPI()

class StreamingLLM:
    """Stream LLM responses in real-time."""

    def __init__(self, ollama_client, anthropic_client):
        self.ollama = ollama_client
        self.anthropic = anthropic_client

    async def stream_ollama(
        self,
        model: str,
        prompt: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream from Ollama."""
        async for chunk in self.ollama.generate(
            model=model,
            prompt=prompt,
            stream=True,
            **kwargs
        ):
            yield chunk

    async def stream_anthropic(
        self,
        model: str,
        messages: list,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream from Anthropic."""
        async with self.anthropic.messages.stream(
            model=model,
            messages=messages,
            max_tokens=kwargs.get("max_tokens", 4096)
        ) as stream:
            async for text in stream.text_stream:
                yield text


streaming_llm = StreamingLLM(ollama_client, anthropic_client)


@app.post("/v1/chat/stream")
async def stream_chat(request: ChatRequest):
    """Stream chat response."""

    async def generate() -> AsyncGenerator[bytes, None]:
        try:
            async for chunk in streaming_llm.stream_ollama(
                model=request.model,
                prompt=request.prompt
            ):
                # SSE format
                data = {"content": chunk, "done": False}
                yield f"data: {json.dumps(data)}\n\n".encode()

            # Final message
            yield f"data: {json.dumps({'done': True})}\n\n".encode()

        except Exception as e:
            error = {"error": str(e), "done": True}
            yield f"data: {json.dumps(error)}\n\n".encode()

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )


@app.websocket("/v1/chat/ws")
async def websocket_chat(websocket: WebSocket):
    """WebSocket chat with streaming."""
    await websocket.accept()

    try:
        while True:
            # Receive request
            request = await websocket.receive_json()

            # Stream response
            async for chunk in streaming_llm.stream_ollama(
                model=request.get("model", "llama3.2:3b"),
                prompt=request.get("prompt")
            ):
                await websocket.send_json({
                    "type": "chunk",
                    "content": chunk
                })

            # Send completion
            await websocket.send_json({"type": "done"})

    except WebSocketDisconnect:
        pass
```

### Client Streaming

```typescript
// client/streaming.ts
async function* streamChat(
  url: string,
  prompt: string,
  model: string = 'llama3.2:3b'
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${url}/v1/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model })
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.done) return;
        if (data.content) yield data.content;
      }
    }
  }
}

// Usage with React
function ChatComponent() {
  const [response, setResponse] = useState('');

  async function handleSubmit(prompt: string) {
    setResponse('');

    for await (const chunk of streamChat(API_URL, prompt)) {
      setResponse(prev => prev + chunk);
    }
  }

  return (
    <div>
      <pre>{response}</pre>
    </div>
  );
}
```

---

## Agent Subscriptions

### Subscription System

```python
# blackroad/realtime/subscriptions.py
from dataclasses import dataclass
from typing import Set, Dict, Callable, Any
import asyncio
import fnmatch

@dataclass
class Subscription:
    """Real-time subscription."""
    id: str
    pattern: str  # e.g., "agent.LUCIDIA.*", "task.123.*"
    client_id: str
    callback: Callable

class SubscriptionManager:
    """Manage real-time subscriptions."""

    def __init__(self):
        self.subscriptions: Dict[str, Subscription] = {}
        self.pattern_cache: Dict[str, Set[str]] = {}  # pattern -> sub_ids

    def subscribe(
        self,
        pattern: str,
        client_id: str,
        callback: Callable
    ) -> str:
        """Create new subscription."""
        sub_id = f"sub_{uuid.uuid4().hex[:8]}"

        sub = Subscription(
            id=sub_id,
            pattern=pattern,
            client_id=client_id,
            callback=callback
        )
        self.subscriptions[sub_id] = sub

        # Update pattern cache
        if pattern not in self.pattern_cache:
            self.pattern_cache[pattern] = set()
        self.pattern_cache[pattern].add(sub_id)

        return sub_id

    def unsubscribe(self, sub_id: str):
        """Remove subscription."""
        if sub_id in self.subscriptions:
            sub = self.subscriptions[sub_id]
            self.pattern_cache[sub.pattern].discard(sub_id)
            del self.subscriptions[sub_id]

    async def publish(self, topic: str, data: Any):
        """Publish event to matching subscriptions."""
        matching_subs = self._find_matching(topic)

        tasks = [
            self._deliver(sub, topic, data)
            for sub in matching_subs
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

    def _find_matching(self, topic: str) -> list:
        """Find subscriptions matching topic."""
        matching = []
        for pattern, sub_ids in self.pattern_cache.items():
            if fnmatch.fnmatch(topic, pattern):
                for sub_id in sub_ids:
                    if sub_id in self.subscriptions:
                        matching.append(self.subscriptions[sub_id])
        return matching

    async def _deliver(self, sub: Subscription, topic: str, data: Any):
        """Deliver event to subscription."""
        try:
            if asyncio.iscoroutinefunction(sub.callback):
                await sub.callback(topic, data)
            else:
                sub.callback(topic, data)
        except Exception as e:
            logger.error(f"Subscription delivery failed: {e}")


# Usage
sub_manager = SubscriptionManager()

# Subscribe to all LUCIDIA events
sub_manager.subscribe(
    pattern="agent.LUCIDIA.*",
    client_id="dashboard-1",
    callback=lambda topic, data: ws_manager.send_to_client("dashboard-1", {
        "type": topic,
        "data": data
    })
)

# Subscribe to specific task
sub_manager.subscribe(
    pattern="task.abc123.*",
    client_id="user-1",
    callback=update_task_ui
)

# Publish events
await sub_manager.publish("agent.LUCIDIA.thinking", {"thought": "..."})
await sub_manager.publish("task.abc123.progress", {"progress": 50})
```

---

## Presence System

### Presence Tracking

```python
# blackroad/realtime/presence.py
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import asyncio
import redis.asyncio as redis

@dataclass
class PresenceInfo:
    """Presence information for an entity."""
    entity_id: str
    entity_type: str  # agent, user, service
    status: str  # online, away, busy, offline
    last_seen: datetime
    metadata: dict

class PresenceManager:
    """Track online presence of agents and users."""

    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
        self.presence_key = "presence"
        self.ttl = 60  # seconds

    async def update_presence(
        self,
        entity_id: str,
        entity_type: str,
        status: str = "online",
        metadata: dict = None
    ):
        """Update entity presence."""
        key = f"{self.presence_key}:{entity_type}:{entity_id}"
        data = {
            "entity_id": entity_id,
            "entity_type": entity_type,
            "status": status,
            "last_seen": datetime.utcnow().isoformat(),
            "metadata": json.dumps(metadata or {})
        }

        await self.redis.hset(key, mapping=data)
        await self.redis.expire(key, self.ttl)

        # Publish presence change
        await self.redis.publish(
            f"presence.{entity_type}.{entity_id}",
            json.dumps({"status": status, "metadata": metadata})
        )

    async def get_presence(
        self,
        entity_id: str,
        entity_type: str
    ) -> Optional[PresenceInfo]:
        """Get entity presence."""
        key = f"{self.presence_key}:{entity_type}:{entity_id}"
        data = await self.redis.hgetall(key)

        if not data:
            return None

        return PresenceInfo(
            entity_id=data[b"entity_id"].decode(),
            entity_type=data[b"entity_type"].decode(),
            status=data[b"status"].decode(),
            last_seen=datetime.fromisoformat(data[b"last_seen"].decode()),
            metadata=json.loads(data[b"metadata"].decode())
        )

    async def get_online_entities(
        self,
        entity_type: str
    ) -> List[PresenceInfo]:
        """Get all online entities of a type."""
        pattern = f"{self.presence_key}:{entity_type}:*"
        keys = await self.redis.keys(pattern)

        entities = []
        for key in keys:
            data = await self.redis.hgetall(key)
            if data and data.get(b"status", b"").decode() == "online":
                entities.append(PresenceInfo(
                    entity_id=data[b"entity_id"].decode(),
                    entity_type=data[b"entity_type"].decode(),
                    status=data[b"status"].decode(),
                    last_seen=datetime.fromisoformat(data[b"last_seen"].decode()),
                    metadata=json.loads(data[b"metadata"].decode())
                ))

        return entities

    async def set_offline(self, entity_id: str, entity_type: str):
        """Mark entity as offline."""
        await self.update_presence(entity_id, entity_type, "offline")

    async def heartbeat_loop(self, entity_id: str, entity_type: str):
        """Continuous heartbeat to maintain presence."""
        while True:
            await self.update_presence(entity_id, entity_type, "online")
            await asyncio.sleep(self.ttl // 2)


# Agent presence integration
class AgentWithPresence:
    """Agent with presence tracking."""

    def __init__(self, agent_id: str, presence_manager: PresenceManager):
        self.agent_id = agent_id
        self.presence = presence_manager
        self._heartbeat_task = None

    async def start(self):
        """Start agent with presence."""
        await self.presence.update_presence(
            self.agent_id, "agent", "online",
            metadata={"type": "LUCIDIA", "capabilities": ["reasoning", "code"]}
        )
        self._heartbeat_task = asyncio.create_task(
            self.presence.heartbeat_loop(self.agent_id, "agent")
        )

    async def stop(self):
        """Stop agent and clear presence."""
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
        await self.presence.set_offline(self.agent_id, "agent")
```

---

## Channels & Rooms

### Channel System

```python
# blackroad/realtime/channels.py
from dataclasses import dataclass, field
from typing import Dict, Set, Optional, List
from enum import Enum

class ChannelType(Enum):
    PUBLIC = "public"      # Anyone can join
    PRIVATE = "private"    # Invite only
    PRESENCE = "presence"  # Tracks who's in the channel

@dataclass
class Channel:
    """Real-time channel."""
    id: str
    name: str
    type: ChannelType
    members: Set[str] = field(default_factory=set)
    metadata: dict = field(default_factory=dict)
    created_at: str = ""
    max_members: int = 1000

class ChannelManager:
    """Manage real-time channels."""

    def __init__(self, ws_manager: WebSocketManager, presence: PresenceManager):
        self.ws = ws_manager
        self.presence = presence
        self.channels: Dict[str, Channel] = {}

    def create_channel(
        self,
        name: str,
        channel_type: ChannelType = ChannelType.PUBLIC,
        metadata: dict = None
    ) -> Channel:
        """Create new channel."""
        channel_id = f"ch_{uuid.uuid4().hex[:8]}"

        channel = Channel(
            id=channel_id,
            name=name,
            type=channel_type,
            metadata=metadata or {},
            created_at=datetime.utcnow().isoformat()
        )
        self.channels[channel_id] = channel

        return channel

    async def join_channel(
        self,
        channel_id: str,
        client_id: str,
        auth_token: str = None
    ) -> bool:
        """Join a channel."""
        channel = self.channels.get(channel_id)
        if not channel:
            return False

        # Check authorization for private channels
        if channel.type == ChannelType.PRIVATE:
            if not self._verify_access(channel_id, client_id, auth_token):
                return False

        # Check capacity
        if len(channel.members) >= channel.max_members:
            return False

        channel.members.add(client_id)

        # Subscribe to WebSocket room
        await self.ws.join_room(client_id, f"channel:{channel_id}")

        # Announce join
        await self.ws.broadcast_to_room(f"channel:{channel_id}", {
            "type": "channel.member_joined",
            "channel_id": channel_id,
            "client_id": client_id,
            "member_count": len(channel.members)
        }, exclude=client_id)

        # Update presence for presence channels
        if channel.type == ChannelType.PRESENCE:
            await self._broadcast_presence_list(channel_id)

        return True

    async def leave_channel(self, channel_id: str, client_id: str):
        """Leave a channel."""
        channel = self.channels.get(channel_id)
        if not channel:
            return

        channel.members.discard(client_id)
        await self.ws.leave_room(client_id, f"channel:{channel_id}")

        await self.ws.broadcast_to_room(f"channel:{channel_id}", {
            "type": "channel.member_left",
            "channel_id": channel_id,
            "client_id": client_id,
            "member_count": len(channel.members)
        })

    async def send_to_channel(
        self,
        channel_id: str,
        sender_id: str,
        content: any,
        event_type: str = "message"
    ):
        """Send message to channel."""
        channel = self.channels.get(channel_id)
        if not channel or sender_id not in channel.members:
            return False

        await self.ws.broadcast_to_room(f"channel:{channel_id}", {
            "type": f"channel.{event_type}",
            "channel_id": channel_id,
            "sender_id": sender_id,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })

        return True

    async def _broadcast_presence_list(self, channel_id: str):
        """Broadcast presence list for presence channels."""
        channel = self.channels.get(channel_id)
        if not channel:
            return

        presence_list = []
        for member_id in channel.members:
            presence = await self.presence.get_presence(member_id, "user")
            if presence:
                presence_list.append({
                    "id": member_id,
                    "status": presence.status,
                    "metadata": presence.metadata
                })

        await self.ws.broadcast_to_room(f"channel:{channel_id}", {
            "type": "channel.presence_update",
            "channel_id": channel_id,
            "members": presence_list
        })


# Predefined channels
async def setup_default_channels(channel_manager: ChannelManager):
    """Create default system channels."""

    # Agent coordination channel
    channel_manager.create_channel(
        name="agents",
        channel_type=ChannelType.PRESENCE,
        metadata={"description": "Agent coordination and status"}
    )

    # Task updates channel
    channel_manager.create_channel(
        name="tasks",
        channel_type=ChannelType.PUBLIC,
        metadata={"description": "Task progress and updates"}
    )

    # System alerts channel
    channel_manager.create_channel(
        name="alerts",
        channel_type=ChannelType.PUBLIC,
        metadata={"description": "System alerts and notifications"}
    )
```

---

## Rate Limiting

### Rate Limiter

```python
# blackroad/realtime/ratelimit.py
from dataclasses import dataclass
from typing import Dict
import time
import asyncio
from collections import defaultdict

@dataclass
class RateLimitConfig:
    """Rate limit configuration."""
    messages_per_second: int = 10
    messages_per_minute: int = 100
    burst_limit: int = 20
    cooldown_seconds: int = 60

class TokenBucketLimiter:
    """Token bucket rate limiter."""

    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.buckets: Dict[str, dict] = defaultdict(lambda: {
            "tokens": config.burst_limit,
            "last_update": time.time()
        })

    def allow(self, client_id: str) -> bool:
        """Check if request is allowed."""
        bucket = self.buckets[client_id]
        now = time.time()

        # Refill tokens
        elapsed = now - bucket["last_update"]
        refill = elapsed * self.config.messages_per_second
        bucket["tokens"] = min(
            self.config.burst_limit,
            bucket["tokens"] + refill
        )
        bucket["last_update"] = now

        # Check if allowed
        if bucket["tokens"] >= 1:
            bucket["tokens"] -= 1
            return True

        return False

    def get_retry_after(self, client_id: str) -> float:
        """Get seconds until next allowed request."""
        bucket = self.buckets[client_id]
        if bucket["tokens"] >= 1:
            return 0

        needed = 1 - bucket["tokens"]
        return needed / self.config.messages_per_second


class SlidingWindowLimiter:
    """Sliding window rate limiter."""

    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.windows: Dict[str, list] = defaultdict(list)

    def allow(self, client_id: str) -> bool:
        """Check if request is allowed."""
        now = time.time()
        window = self.windows[client_id]

        # Remove old entries
        cutoff = now - 60  # 1 minute window
        self.windows[client_id] = [t for t in window if t > cutoff]
        window = self.windows[client_id]

        # Check limit
        if len(window) >= self.config.messages_per_minute:
            return False

        window.append(now)
        return True


# Middleware integration
class RateLimitMiddleware:
    """WebSocket rate limiting middleware."""

    def __init__(self, limiter: TokenBucketLimiter):
        self.limiter = limiter

    async def check(self, client_id: str) -> tuple[bool, dict]:
        """Check rate limit and return status."""
        if self.limiter.allow(client_id):
            return True, {}

        retry_after = self.limiter.get_retry_after(client_id)
        return False, {
            "error": "rate_limited",
            "retry_after": retry_after,
            "message": f"Too many requests. Retry in {retry_after:.1f}s"
        }


# Usage in WebSocket handler
rate_limiter = RateLimitMiddleware(TokenBucketLimiter(RateLimitConfig()))

async def handle_websocket_message(conn: Connection, data: dict):
    """Handle message with rate limiting."""
    allowed, error = await rate_limiter.check(conn.client_id)

    if not allowed:
        await conn.websocket.send_json({
            "type": "error",
            **error
        })
        return

    # Process message normally
    await process_message(conn, data)
```

---

## Scaling

### Horizontal Scaling

```yaml
# deployment/realtime-scaling.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackroad-websocket
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blackroad-websocket
  template:
    spec:
      containers:
        - name: websocket
          image: blackroad/websocket:latest
          ports:
            - containerPort: 8080
          env:
            - name: REDIS_URL
              value: redis://redis-cluster:6379
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi

---
apiVersion: v1
kind: Service
metadata:
  name: blackroad-websocket
spec:
  type: LoadBalancer
  sessionAffinity: ClientIP  # Sticky sessions
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
  ports:
    - port: 443
      targetPort: 8080
```

### Redis Cluster for Pub/Sub

```python
# blackroad/realtime/redis_cluster.py
import redis.asyncio as redis
from redis.asyncio.cluster import RedisCluster

class ClusteredPubSub:
    """Pub/Sub across Redis cluster."""

    def __init__(self, nodes: list):
        self.cluster = RedisCluster(
            startup_nodes=nodes,
            decode_responses=True
        )

    async def publish(self, channel: str, message: str):
        """Publish to cluster."""
        await self.cluster.publish(channel, message)

    async def subscribe(self, patterns: list):
        """Subscribe with pattern matching."""
        pubsub = self.cluster.pubsub()
        await pubsub.psubscribe(*patterns)

        async for message in pubsub.listen():
            if message["type"] == "pmessage":
                yield message
```

---

## Quick Reference

### WebSocket Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `ping` | Client→Server | Keepalive |
| `pong` | Server→Client | Keepalive response |
| `subscribe` | Client→Server | Join room |
| `unsubscribe` | Client→Server | Leave room |
| `message` | Bidirectional | Chat message |
| `agent.invoke` | Client→Server | Call agent |
| `agent.response` | Server→Client | Agent response |
| `error` | Server→Client | Error message |

### SSE Event Types

| Event | Description |
|-------|-------------|
| `connected` | Initial connection |
| `agent.status` | Agent status change |
| `task.progress` | Task progress update |
| `task.completed` | Task finished |
| `alert` | System alert |

---

## Related Documentation

- [WEBHOOKS.md](WEBHOOKS.md) - Event system
- [AGENTS.md](AGENTS.md) - Agent configuration
- [SCALING.md](SCALING.md) - Scaling guide
- [MONITORING.md](MONITORING.md) - Observability
- [API.md](API.md) - API reference

---

*Your AI. Your Hardware. Your Rules.*
