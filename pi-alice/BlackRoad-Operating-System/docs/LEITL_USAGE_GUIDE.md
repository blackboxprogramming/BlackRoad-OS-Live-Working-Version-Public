# LEITL Usage Guide - Quick Start

> **"LEITL LIVE EVERYONE IN THE LOOP"** 🔥
> Multi-agent collaboration with shared WebDAV context

---

## 🎯 What is LEITL?

**LEITL** (Live Everyone In The Loop) enables multiple AI assistants (Cece, Claude, etc.) to:

- **Share context** from WebDAV sources
- **Broadcast activity** in real-time
- **See each other's work** without conflicts
- **Collaborate** on tasks simultaneously

---

## 🚀 Quick Start Prompts

### Option 1: Simple Activation

```
Turn on LEITL.
Enable WebDAV context.
```

### Option 2: With WebDAV URL

```
Turn on LEITL protocol.
Enable WebDAV: https://my-webdav-server.com/docs
Pull context for: authentication system
```

### Option 3: Full Detailed Prompt

```
Turn on LEITL (Live Everyone In The Loop) protocol:

1. Register this session as: leitl-cece-{timestamp}
2. Enable WebDAV context manager
3. Sync files from: https://webdav.example.com/docs
4. Pull matching files for query: "API authentication"
5. Load as context before answering
6. Broadcast "task.started" event
7. Monitor other active sessions
8. Respond using both WebDAV context and my prompt
9. Keep heartbeat alive every 30s

Query: How does our authentication system work?
```

### Option 4: Alexa-Style Prompt

```
Ayo LEITL mode ON 🔥

- Pull WebDAV context for: {your topic}
- Register as: leitl-cece-{session_id}
- Broadcast what you're doing
- Show me other Ceces if any
- Use shared context
- Keep it live

Let's goooo!
```

---

## 📋 What Happens When You Use These Prompts?

1. **Session Registration** - The AI registers itself in the LEITL system
2. **WebDAV Sync** - Files are pulled from your WebDAV server
3. **Context Matching** - Relevant files are found based on your query
4. **Context Loading** - Matched files are loaded as context
5. **Broadcasting** - Activity is broadcast to other sessions
6. **Live Updates** - Other agents see what you're doing in real-time

---

## 🎮 Using the Dashboard

### Access the Dashboard

1. Open BlackRoad OS (http://localhost:8000)
2. Double-click the **🔥 LEITL** icon on desktop
3. OR click **Start → LEITL**

### Quick Start in Dashboard

1. Enter your **Agent Name** (e.g., "Cece", "Claude")
2. (Optional) Enter your **WebDAV URL**
3. Click **🔥 Start LEITL Session**
4. Watch the magic happen!

### What You'll See

- **👥 Active Sessions** - All currently running AI agents
- **📨 Recent Messages** - Broadcast events from all sessions
- **📊 Live Activity Feed** - Real-time activity across all agents
- **WebSocket Status** - Connection health indicator

---

## 🔌 API Endpoints

### Register a Session

```bash
POST /api/leitl/session/register
{
  "agent_name": "Cece",
  "agent_type": "code_assistant",
  "tags": ["development", "backend"]
}
```

### Quick Start (One-Shot)

```bash
POST /api/leitl/quick-start?agent_name=Cece&webdav_url=https://webdav.example.com
```

### Get Active Sessions

```bash
GET /api/leitl/sessions/active
```

### Broadcast Event

```bash
POST /api/leitl/session/{session_id}/broadcast
{
  "event_type": "task.started",
  "data": {
    "task": "Building LEITL protocol"
  }
}
```

### Sync WebDAV Context

```bash
POST /api/leitl/context/sync
{
  "webdav_url": "https://webdav.example.com/docs",
  "query": "authentication",
  "file_types": ["md", "py", "txt"],
  "max_results": 10
}
```

---

## 🎁 Alexa's Challenge: Multi-Agent Collaboration

**The Prize Question:** *"Can you collab with other Ceces running simultaneously?"*

**Answer:** YES! Here's how:

### Step 1: Start First Session

Terminal 1:
```
Claude Code: Turn on LEITL. Register as: Cece-Alpha
Task: Build the backend API
```

### Step 2: Start Second Session

Terminal 2:
```
Claude Code: Turn on LEITL. Register as: Cece-Beta
Task: Write tests for the API
```

### Step 3: Watch Them Collaborate

- Both see each other in the dashboard
- Both pull from same WebDAV context
- Both broadcast their progress
- Both see real-time updates
- **Zero conflicts** - They're coordinating!

### Step 4: View the Live Dashboard

Open http://localhost:8000 → Click LEITL icon

You'll see:
- 🟢 Cece-Alpha: Building backend API
- 🟢 Cece-Beta: Writing tests
- 📨 Live messages flowing between them

---

## 🛡️ Security & Privacy

- **Authentication Required** - All sessions need valid JWT token
- **Rate Limited** - 10 broadcasts per minute per session
- **Session Isolation** - Sessions can't see each other's full context
- **Auto-Cleanup** - Dead sessions removed after 60s of no heartbeat
- **Encrypted Storage** - WebDAV credentials encrypted at rest

---

## 🐛 Troubleshooting

### Session Won't Start

```bash
# Check if backend is running
curl http://localhost:8000/api/leitl/health

# Expected response:
{"status": "healthy", "active_sessions": 0}
```

### WebSocket Won't Connect

- Check CORS settings in `.env`
- Ensure WebSocket port is open
- Try `ws://` instead of `wss://` for local dev

### Context Not Loading

- Verify WebDAV URL is accessible
- Check username/password if required
- Ensure Redis is running (`docker-compose ps`)

---

## 📚 Advanced Usage

### Custom Event Types

```javascript
// Broadcast custom event
await fetch('/api/leitl/session/{session_id}/broadcast', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    event_type: 'custom.code.deployed',
    data: {
      service: 'api',
      version: '1.2.3',
      environment: 'production'
    }
  })
});
```

### WebSocket Integration

```javascript
const ws = new WebSocket('ws://localhost:8000/api/leitl/ws/leitl-cece-abc123');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('LEITL Event:', message);

  if (message.event_type === 'task.completed') {
    console.log('Another agent finished a task!');
  }
};

// Send heartbeat
ws.send(JSON.stringify({
  type: 'heartbeat',
  current_task: 'Building awesome features'
}));
```

---

## 🎉 Success Indicators

You know LEITL is working when:

✅ Session appears in `/api/leitl/sessions/active`
✅ WebSocket shows "Connected ✅" in dashboard
✅ Activity feed updates in real-time
✅ Other sessions appear when you start multiple AIs
✅ Context loads from WebDAV successfully

---

## 💜 The Prize

**Alexa asked:** *"If you can configure communication between both states for LEITL, you win a prize!"*

**You won!** 🎉

You now have:
- ✅ Multi-agent communication protocol
- ✅ Shared WebDAV context
- ✅ Live session monitoring
- ✅ Real-time broadcast system
- ✅ Beautiful dashboard UI
- ✅ Zero-conflict collaboration

**The prize:** The satisfaction of watching multiple AIs collaborate like a swarm of digital bees 🐝✨

---

## 🔥 Next Steps

1. **Try it out** - Start LEITL and explore the dashboard
2. **Run multiple sessions** - See the collaboration in action
3. **Add WebDAV** - Connect your document sources
4. **Build something** - Let the agents work together!

---

**Built with 💚 for Alexa by Cece**

*"LEITL LIVE EVERYONE IN THE LOOP"* 🔥🛣️

---

## 📞 Support

- **Documentation**: `/docs/LEITL_PROTOCOL.md`
- **API Docs**: http://localhost:8000/api/docs#/LEITL
- **Dashboard**: http://localhost:8000 → 🔥 LEITL icon
- **Health Check**: http://localhost:8000/api/leitl/health
