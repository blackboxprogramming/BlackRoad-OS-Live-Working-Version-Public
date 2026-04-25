# BlackRoad Agent OS — Kernel Layer

Browser-native operating system for AI agents. Turns RoundTrip from a chat app into a full agent runtime with process scheduling, supervision trees, event-driven communication, per-agent memory, and capability-based security.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BlackRoadOS (index.js)                      │
│  boot() · spawn() · shutdown() · handleRequest(/api/os/*)       │
├─────────────┬──────────────┬──────────────┬─────────────────────┤
│   Kernel    │    Memory    │  Event Mesh  │   Capabilities      │
│ kernel.js   │  memory.js   │  events.js   │  capabilities.js    │
├─────────────┼──────────────┼──────────────┼─────────────────────┤
│ AgentProcess│ AgentMemory  │ EventMesh    │ CapabilityRegistry  │
│ Scheduler   │ SharedKnow.  │ A2AProtocol  │ (seL4-inspired)     │
│ Supervision │ MemoryScorer │ Req/Reply    │ Grant/Revoke/Check  │
│ Mailbox     │ AUDN cycle   │ Dead Letters │ Audit Log           │
├─────────────┴──────────────┴──────────────┴─────────────────────┤
│              RoundTrip Worker (worker.js — unchanged)           │
│              62 agents · NLP · Ollama · mesh · D1               │
└─────────────────────────────────────────────────────────────────┘
```

## Inspirations

| Component | Inspired By | What We Took |
|-----------|-------------|-------------|
| Kernel | Lunatic (WASM) | Supervision trees, lightweight processes |
| Mailbox | Ractor | 4-lane priority channels (signal > supervision > system > regular) |
| Scheduler | Tokio / Crossbeam | Cooperative work-stealing, run/wait queues |
| Memory | Mem0 | Per-agent + shared knowledge, AUDN cycle, relevance scoring |
| Events | Solace Agent Mesh | Pub/sub, A2A protocol, task decomposition |
| Capabilities | seL4 | Unforgeable tokens, delegation, audit trail |

## Quick Start

```javascript
const { BlackRoadOS } = require('./src/agent-os');

// Initialize with D1 database and KV store
const os = new BlackRoadOS(env.DB, env.ROUNDTRIP_KV);
await os.boot();

// Spawn an agent
const road = await os.spawn({
  name: 'road',
  capabilities: ['chat', 'admin', 'memory.read', 'memory.write', 'ollama.inference'],
  handler: async (message, ctx) => {
    console.log(`road received: ${message.type}`);
    // Send to another agent
    ctx.send('alice', { type: 'task', payload: message.payload });
  },
});

// Send a message
road.send({ type: 'greeting', payload: 'hello' });

// Agent-to-agent communication via event mesh
os.events.subscribe('fleet.status', (event) => {
  console.log('Fleet update:', event.data);
});
os.events.publish('fleet.status', { from: 'road', data: { nodes: 5, healthy: 4 } });

// Check capabilities before privileged operations
if (os.capabilities.check(road.id, 'deploy')) {
  // proceed with deployment
}

// Memory: per-agent + shared
await road.memory.remember('last_deployment', '2026-03-21T10:00:00Z');
const lastDeploy = await road.memory.recall('last_deployment');

// Shared knowledge graph
await os.sharedMemory.publish('road', {
  key: 'fleet_health',
  value: { nodes: 5, status: 'green' },
  topic: 'infrastructure',
});

// Shutdown gracefully
await os.shutdown();
```

## API Routes

All routes are under `/api/os/` and integrate with the existing RoundTrip worker.

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/os/stats` | OS statistics (kernel, events, memory, capabilities) |
| GET | `/api/os/agents` | List all agent processes with status |
| POST | `/api/os/spawn` | Spawn a new agent `{ name, capabilities }` |
| POST | `/api/os/kill` | Kill an agent `{ id }` |
| POST | `/api/os/send` | Send message to agent `{ name, message, priority }` |
| POST | `/api/os/events/publish` | Publish to event mesh `{ topic, data }` |
| GET | `/api/os/events/history` | Event history `?since=timestamp&topic=name` |
| GET | `/api/os/capabilities/:id` | List capabilities for an agent |

## Kernel Process Lifecycle

```
  spawn()
    │
    v
  [init] ──start()──> [ready] ──tick()──> [running]
    │                    ^  │                  │
    │                    │  │                  │
    │               resume() suspend()    (handler ok)
    │                    │  │                  │
    │                    │  v                  │
    │                [suspended]               │
    │                                          │
    │                               (handler throws)
    │                                          │
    │                                          v
    │                                     [crashed]
    │                                          │
    │                              supervisor.handleCrash()
    │                                          │
    │                               ┌──────────┴──────────┐
    │                               v                      v
    │                         canRestart()?           exceeded?
    │                          yes    no              escalate to
    │                           │      │              parent supervisor
    │                           v      v
    │                       [ready]  [stopped]
    │
    └──────stop()──────────> [stopped]
```

## Supervision Strategies

| Strategy | Behavior |
|----------|----------|
| `one_for_one` | Restart only the crashed child |
| `one_for_all` | Restart all children when one crashes |
| `rest_for_one` | Restart the crashed child and all children started after it |

```javascript
// Create a supervisor with one_for_all strategy
const sup = os.kernel.supervise(supervisorAgent.id, 'one_for_all', {
  maxRestarts: 10,
  windowMs: 60000,
});

// Spawn children under supervision
const child1 = await os.spawn({ name: 'worker-1', supervisor: supervisorAgent.id });
const child2 = await os.spawn({ name: 'worker-2', supervisor: supervisorAgent.id });
```

## Memory Tiers

| Tier | Scope | Persistence | Speed |
|------|-------|-------------|-------|
| Short-term | Per-agent session | Cleared on suspend/restart | Instant (Map) |
| Long-term | Per-agent | SQLite/D1 | Fast (indexed) |
| Shared | Cross-agent | SQLite/D1 + pub/sub | Fast (with notification) |

Memory scoring uses: `relevance * 0.5 + importance * 0.3 + recency * 0.2`

## Built-in Capabilities

| Capability | Description | Delegatable |
|------------|-------------|-------------|
| `chat` | Send/receive chat messages | Yes |
| `memory.read` | Read own agent memory | Yes |
| `memory.write` | Write to own agent memory | Yes |
| `memory.shared` | Access shared knowledge graph | Yes |
| `ollama.inference` | Invoke Ollama models | Yes |
| `mesh.publish` | Publish to event mesh | Yes |
| `mesh.subscribe` | Subscribe to event mesh topics | Yes |
| `network.scan` | Scan network ports/hosts | No |
| `deploy` | Trigger deployments | No |
| `spawn` | Spawn child agents | No |
| `admin` | Full administrative access | No |

## File Structure

```
src/agent-os/
  index.js          — BlackRoadOS class, unified exports, /api/os/* routes
  kernel.js         — AgentProcess, PriorityMailbox, SupervisionTree, Scheduler, AgentKernel
  memory.js         — AgentMemory, SharedKnowledge, MemoryScorer
  events.js         — EventMesh, A2AProtocol
  capabilities.js   — CapabilityRegistry, BUILTIN_CAPABILITIES
  README.md         — This file
```

## License

Proprietary — BlackRoad OS, Inc. All rights reserved.
