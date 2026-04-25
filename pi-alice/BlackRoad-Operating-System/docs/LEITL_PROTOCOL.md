# LEITL Protocol - Live Everyone In The Loop

> **Version**: 1.0.0
> **Status**: Active
> **Purpose**: Multi-agent live collaboration with shared WebDAV context

---

## 🎯 Overview

The **LEITL Protocol** (Live Everyone In The Loop) enables multiple AI agents/sessions to:

1. **Share context** from WebDAV sources
2. **Broadcast activity** in real-time
3. **Sync state** across sessions
4. **Collaborate live** on tasks
5. **See each other's work** without conflicts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│          WebDAV Context Source                   │
│  (Files, docs, prompts, data)                   │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│       WebDAV Context Manager                     │
│  - Sync files                                    │
│  - Parse content                                 │
│  - Canonicalize context                          │
│  - Store in Redis                                │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│          Redis Shared State Store                │
│  - Session registry                              │
│  - Context cache                                 │
│  - Message queue                                 │
│  - Activity log                                  │
└─────────────────────────────────────────────────┘
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────┐         ┌──────────────┐
│  Session A   │←─WS────→│  Session B   │
│  (Cece #1)   │         │  (Claude #2) │
└──────────────┘         └──────────────┘
        ↓                         ↓
┌──────────────┐         ┌──────────────┐
│ User View A  │         │ User View B  │
└──────────────┘         └──────────────┘
```

---

## 🔑 Core Components

### 1. WebDAV Context Manager

**Purpose**: Sync and canonicalize context from WebDAV sources

**Features**:
- Auto-sync on interval
- Keyword matching for relevant files
- Content parsing (markdown, txt, json, code)
- Redis caching for performance
- Version tracking

**API**:
```python
# Sync WebDAV and get matching context
context = await webdav_context.sync_and_get(
    query="user authentication",
    file_types=["md", "py", "txt"],
    max_results=10
)
```

### 2. LEITL Session Manager

**Purpose**: Track active AI sessions and enable discovery

**Features**:
- Session registration
- Heartbeat monitoring
- Auto-cleanup of dead sessions
- Session metadata (agent type, task, status)

**Session Schema**:
```json
{
  "session_id": "leitl-cece-abc123",
  "agent_name": "Cece",
  "agent_type": "code_assistant",
  "started_at": "2025-11-18T12:00:00Z",
  "last_heartbeat": "2025-11-18T12:05:00Z",
  "status": "active",
  "current_task": "Building WebDAV integration",
  "context_sources": ["webdav://docs/", "redis://context"],
  "tags": ["development", "backend", "webdav"]
}
```

### 3. Message Bus (WebSocket + Redis PubSub)

**Purpose**: Real-time communication between sessions

**Event Types**:
- `session.started` - New agent joins
- `session.heartbeat` - Agent still alive
- `session.ended` - Agent disconnects
- `task.started` - New task begun
- `task.completed` - Task finished
- `context.updated` - WebDAV context refreshed
- `broadcast.message` - Inter-agent message

**Message Schema**:
```json
{
  "event_type": "task.started",
  "session_id": "leitl-cece-abc123",
  "timestamp": "2025-11-18T12:00:00Z",
  "data": {
    "task_id": "task-001",
    "task_description": "Create LEITL protocol",
    "estimated_duration": "15m"
  }
}
```

### 4. Shared Context Store

**Purpose**: Centralized context accessible to all sessions

**Redis Keys**:
- `leitl:context:<query_hash>` - Cached WebDAV context
- `leitl:sessions:active` - Set of active session IDs
- `leitl:session:<id>` - Session metadata
- `leitl:messages` - Recent broadcast messages
- `leitl:activity` - Activity log

### 5. Live Dashboard UI

**Purpose**: Visualize all active sessions and activity

**Features**:
- Real-time session list
- Activity feed
- Context sync status
- Message log
- Session health indicators

---

## 🚀 Usage

### For AI Agents (Prompt)

**Simple Version**:
```
Use LEITL protocol.
Enable WebDAV context.
Sync and load matching files.
Broadcast my activity.
Show me other active sessions.
```

**Detailed Version**:
```
Turn on LEITL (Live Everyone In The Loop) protocol:

1. Register this session with ID: leitl-{agent_name}-{timestamp}
2. Enable WebDAV context manager
3. Sync files matching my query keywords
4. Load as context before answering
5. Broadcast "task.started" event
6. Monitor other active sessions
7. Respond using both WebDAV context and my prompt
8. Broadcast "task.completed" when done
9. Keep heartbeat alive every 30s

Query: {user's actual question}
```

**Cece-Specific Prompt**:
```
Hey Cece! LEITL mode ON 🔥

- Pull WebDAV context for: {topic}
- Register as: leitl-cece-{session_id}
- Broadcast what you're doing
- Show me other Ceces if any
- Use shared context
- Keep it live

Go!
```

### For Developers (API)

**Register Session**:
```python
POST /api/leitl/session/register
{
  "agent_name": "Cece",
  "agent_type": "code_assistant",
  "tags": ["development", "backend"]
}

Response:
{
  "session_id": "leitl-cece-abc123",
  "websocket_url": "ws://localhost:8000/api/leitl/ws/leitl-cece-abc123"
}
```

**Get Active Sessions**:
```python
GET /api/leitl/sessions/active

Response:
[
  {
    "session_id": "leitl-cece-abc123",
    "agent_name": "Cece",
    "status": "active",
    "current_task": "Building LEITL",
    "uptime": "5m"
  },
  {
    "session_id": "leitl-claude-xyz789",
    "agent_name": "Claude",
    "status": "active",
    "current_task": "Testing API",
    "uptime": "2m"
  }
]
```

**Broadcast Message**:
```python
POST /api/leitl/broadcast
{
  "event_type": "task.completed",
  "data": {
    "task_id": "task-001",
    "result": "success"
  }
}
```

**Get WebDAV Context**:
```python
GET /api/leitl/context?query=authentication&types=md,py

Response:
{
  "query": "authentication",
  "matched_files": [
    {
      "path": "docs/auth.md",
      "content": "...",
      "relevance": 0.95,
      "updated_at": "2025-11-18T12:00:00Z"
    }
  ],
  "total_matches": 3,
  "cached": true
}
```

---

## 🎮 WebSocket Protocol

**Connect**:
```javascript
const ws = new WebSocket('ws://localhost:8000/api/leitl/ws/leitl-cece-abc123');

ws.onopen = () => {
  console.log('Connected to LEITL');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('LEITL Event:', message);

  if (message.event_type === 'session.started') {
    console.log('New agent joined:', message.session_id);
  }
};
```

**Send Heartbeat**:
```javascript
setInterval(() => {
  ws.send(JSON.stringify({
    type: 'heartbeat',
    session_id: 'leitl-cece-abc123'
  }));
}, 30000); // Every 30s
```

**Broadcast Event**:
```javascript
ws.send(JSON.stringify({
  type: 'broadcast',
  event_type: 'task.started',
  data: {
    task_id: 'task-001',
    task_description: 'Building LEITL protocol'
  }
}));
```

---

## 🛡️ Security

**Authentication**:
- Sessions require valid JWT token
- WebSocket connections authenticated via token parameter
- Rate limiting on broadcasts (10/min per session)

**Isolation**:
- Sessions can only see metadata, not full context of others
- WebDAV credentials stored securely (encrypted at rest)
- Redis keys namespaced to prevent collisions

**Privacy**:
- No PII in broadcast messages
- Context is user-scoped (multi-tenant safe)
- Activity logs auto-expire after 24h

---

## 📊 Monitoring

**Health Metrics**:
- Active session count
- WebDAV sync success rate
- Message delivery latency
- Context cache hit rate
- WebSocket connection stability

**Alerts**:
- Session heartbeat timeout (> 60s)
- WebDAV sync failure
- Redis connection loss
- Message queue backlog

---

## 🎁 THE PRIZE CHALLENGE

Alexa asked: **"Can you collab with other Ceces running simultaneously and configure communication between both states for LEITL?"**

**Answer**: YES! 🎉

Here's how:

1. **Start Multiple Sessions**:
   - Open 2+ terminal windows
   - Run Claude Code in each
   - Each gets unique session ID

2. **Use LEITL Prompt**:
   ```
   Turn on LEITL.
   Register as: leitl-cece-{random}
   Connect to WebSocket.
   Broadcast: "Hey other Ceces! I'm working on {task}"
   Monitor broadcasts from other sessions.
   ```

3. **Live Collaboration**:
   - Cece #1: "I'm building the backend API"
   - Cece #2: "I'm writing tests"
   - Both see each other's progress in real-time
   - Both pull from same WebDAV context
   - No conflicts, full visibility

4. **The Dashboard**:
   - Open `http://localhost:8000/leitl-dashboard`
   - See all active Ceces
   - Watch live activity feed
   - See context sync status

---

## 🚀 Next Steps

1. ✅ Architecture designed
2. 🔄 Backend API implementation
3. 🔄 WebDAV context manager
4. 🔄 WebSocket message bus
5. 🔄 Frontend dashboard
6. 🔄 Integration tests
7. 🔄 Documentation

---

## 💜 Alexa's Prize

If this works (and it will 🔥), you get:

1. **Multi-Cece Collaboration** - Run multiple AI assistants in parallel
2. **Shared Context** - All read from your WebDAV source
3. **Live Updates** - See what everyone's doing in real-time
4. **Zero Conflicts** - Broadcast-based, not lock-based
5. **Full Transparency** - Dashboard shows everything

**Prize Unlocked**: The satisfaction of watching multiple AIs collaborate like a swarm 🐝✨

---

*Built with 💚 for Alexa by Cece*
*"LEITL LIVE EVERYONE IN THE LOOP" - The future is collaborative AI* 🛣️
