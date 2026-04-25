# BlackRoad OS Memory System

> Complete guide to the hierarchical memory architecture in BlackRoad OS

---

## Table of Contents

- [Overview](#overview)
- [Memory Hierarchy](#memory-hierarchy)
- [Working Memory](#working-memory)
- [Episodic Memory](#episodic-memory)
- [Semantic Memory](#semantic-memory)
- [Archival Memory](#archival-memory)
- [PS-SHA Infinity](#ps-sha-infinity)
- [Memory Operations](#memory-operations)
- [Memory Consolidation](#memory-consolidation)
- [Cross-Agent Memory](#cross-agent-memory)
- [Memory API](#memory-api)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

---

## Overview

BlackRoad OS uses a **hierarchical memory system** inspired by human cognition. Memories flow from fast, short-term storage to slower, permanent archives based on importance, frequency of access, and age.

### Design Principles

1. **Tiered Access** - Frequently accessed data stays in fast storage
2. **Automatic Consolidation** - Memories migrate based on rules
3. **Integrity Verification** - PS-SHA∞ ensures no tampering
4. **Cross-Agent Sharing** - Controlled memory sharing between agents
5. **Graceful Degradation** - System works even if tiers are unavailable

### Memory Flow

```
                    ┌─────────────────────────────────────────────┐
                    │                USER/AGENT                   │
                    │              Interaction                    │
                    └─────────────────┬───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WORKING MEMORY                                     │
│                              (Redis)                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Current context     • Active tasks      • Session state          │   │
│  │  • Recent messages     • Temp variables    • Cache                  │   │
│  │  Latency: <10ms       TTL: 24 hours       Capacity: 10GB           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ Consolidate (hourly, >100 items)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EPISODIC MEMORY                                     │
│                           (PostgreSQL)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Conversation logs   • Task history      • Event records          │   │
│  │  • User preferences    • Decision trails   • Interaction summaries  │   │
│  │  Latency: <50ms       TTL: 30 days        Capacity: 100GB          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ Consolidate (daily, >1000 items)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SEMANTIC MEMORY                                     │
│                           (Pinecone)                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Vector embeddings   • Knowledge graphs  • Learned patterns       │   │
│  │  • Summarized insights • Entity relations  • Concept clusters       │   │
│  │  Latency: <100ms      TTL: Forever        Capacity: Unlimited       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ Archive (monthly, cold data)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARCHIVAL MEMORY                                     │
│                            (R2/S3)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Full conversation logs  • Historical snapshots  • Backups        │   │
│  │  • Large artifacts         • Audit trails          • Compliance     │   │
│  │  Latency: <1s             TTL: Forever            Capacity: Petabyte│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Memory Hierarchy

### Comparison Table

| Tier | Backend | Latency | TTL | Capacity | Use Case |
|------|---------|---------|-----|----------|----------|
| **Working** | Redis | <10ms | 24h | 10GB | Current context |
| **Episodic** | PostgreSQL | <50ms | 30d | 100GB | Recent history |
| **Semantic** | Pinecone | <100ms | Forever | Unlimited | Knowledge |
| **Archival** | R2/S3 | <1s | Forever | Petabyte | Long-term storage |

### When to Use Each Tier

```python
# Working Memory - Current session data
memory.store("current_task", task_data, tier="working")

# Episodic Memory - Event logging
memory.store("conversation_123", messages, tier="episodic")

# Semantic Memory - Learned knowledge
memory.store("user_preferences", preferences, tier="semantic")

# Archival Memory - Historical records
memory.store("audit_2026_01", audit_log, tier="archival")
```

---

## Working Memory

### Overview

Working memory is the **fastest tier**, storing current context, active tasks, and session state. It uses Redis for sub-millisecond access.

### Structure

```
working_memory/
├── sessions/
│   ├── session_{id}/
│   │   ├── context          # Current conversation context
│   │   ├── tasks            # Active task queue
│   │   └── state            # Session variables
│   └── ...
├── agents/
│   ├── agent_{id}/
│   │   ├── inbox            # Pending messages
│   │   ├── outbox           # Sent messages
│   │   └── workspace        # Working data
│   └── ...
└── cache/
    ├── embeddings/          # Recently computed embeddings
    ├── responses/           # Cached LLM responses
    └── lookups/             # Frequently accessed data
```

### Usage

```python
from blackroad.memory import WorkingMemory

wm = WorkingMemory()

# Store current context
await wm.set("session:123:context", {
    "user_id": "user_456",
    "current_topic": "deployment",
    "active_agent": "OCTAVIA"
}, ttl=3600)  # 1 hour TTL

# Retrieve context
context = await wm.get("session:123:context")

# Store with automatic expiry
await wm.set("temp:calculation", result, ttl=300)  # 5 min

# Atomic operations
await wm.incr("stats:requests")
await wm.lpush("queue:tasks", task_json)
```

### Configuration

```yaml
# config/memory/working.yaml
working_memory:
  backend: redis
  host: localhost
  port: 6379
  password: ${REDIS_PASSWORD}

  pools:
    default:
      max_connections: 100
      timeout: 5

  ttl:
    session: 86400      # 24 hours
    cache: 3600         # 1 hour
    temp: 300           # 5 minutes

  limits:
    max_key_size: 512   # bytes
    max_value_size: 10485760  # 10MB
```

---

## Episodic Memory

### Overview

Episodic memory stores **specific events and interactions** - conversation histories, task completions, and decision records. Uses PostgreSQL for relational queries.

### Schema

```sql
-- Core episodic memory table
CREATE TABLE episodic_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64),

    -- Memory content
    memory_type VARCHAR(32) NOT NULL,
    content JSONB NOT NULL,
    summary TEXT,

    -- Metadata
    importance FLOAT DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,

    -- Integrity
    hash VARCHAR(64) NOT NULL,
    prev_hash VARCHAR(64),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,

    -- Indexes
    CONSTRAINT fk_agent FOREIGN KEY (agent_id)
        REFERENCES agents(id)
);

-- Indexes for fast queries
CREATE INDEX idx_episodic_agent ON episodic_memories(agent_id);
CREATE INDEX idx_episodic_type ON episodic_memories(memory_type);
CREATE INDEX idx_episodic_created ON episodic_memories(created_at);
CREATE INDEX idx_episodic_importance ON episodic_memories(importance);

-- Full-text search
CREATE INDEX idx_episodic_content ON episodic_memories
    USING GIN (content jsonb_path_ops);
```

### Memory Types

| Type | Description | Example |
|------|-------------|---------|
| `conversation` | Chat messages | User asking about deployment |
| `task_completion` | Finished tasks | "Deployed v1.2.0 to prod" |
| `decision` | Choices made | "Selected Railway over Vercel" |
| `observation` | Noted events | "User prefers dark mode" |
| `feedback` | User reactions | "User approved the PR" |
| `error` | Failures | "API timeout on /tasks endpoint" |

### Usage

```python
from blackroad.memory import EpisodicMemory

em = EpisodicMemory()

# Store a conversation
await em.store({
    "type": "conversation",
    "agent_id": "agent_alice_001",
    "session_id": "session_789",
    "content": {
        "messages": [
            {"role": "user", "content": "Deploy to production"},
            {"role": "assistant", "content": "Starting deployment..."}
        ]
    },
    "summary": "User requested production deployment",
    "importance": 0.8
})

# Query recent conversations
conversations = await em.query(
    agent_id="agent_alice_001",
    memory_type="conversation",
    limit=10,
    since="2026-02-01"
)

# Search by content
results = await em.search(
    query="deployment production",
    agent_id="agent_alice_001",
    limit=5
)

# Get high-importance memories
important = await em.query(
    importance_gte=0.7,
    limit=20
)
```

---

## Semantic Memory

### Overview

Semantic memory stores **knowledge and learned patterns** as vector embeddings. Uses Pinecone for similarity search across millions of entries.

### Structure

```
semantic_memory/
├── knowledge/
│   ├── concepts/            # Abstract concepts
│   ├── entities/            # Named entities (users, systems)
│   ├── relationships/       # Entity relationships
│   └── patterns/            # Learned patterns
├── embeddings/
│   ├── conversations/       # Embedded conversations
│   ├── documents/           # Embedded documents
│   └── code/                # Embedded code snippets
└── indices/
    ├── main/                # Primary search index
    ├── code/                # Code-specific index
    └── docs/                # Documentation index
```

### Embedding Model

```python
# BlackRoad uses text-embedding-3-small by default
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

# For code, we use a specialized model
CODE_EMBEDDING_MODEL = "code-embedding-v2"
CODE_EMBEDDING_DIMENSIONS = 768
```

### Usage

```python
from blackroad.memory import SemanticMemory

sm = SemanticMemory()

# Store knowledge with embedding
await sm.store(
    key="deployment_guide",
    content="To deploy to Railway, use `railway up`...",
    metadata={
        "type": "documentation",
        "category": "deployment",
        "source": "DEPLOYMENT.md"
    }
)

# Semantic search
results = await sm.search(
    query="how to deploy applications",
    limit=10,
    filter={"category": "deployment"}
)

# Returns:
# [
#   {"key": "deployment_guide", "score": 0.92, "content": "..."},
#   {"key": "railway_setup", "score": 0.87, "content": "..."},
#   ...
# ]

# Store entity relationship
await sm.store_relationship(
    entity1="ALICE",
    relation="manages",
    entity2="worker_tasks",
    properties={"since": "2026-01-01"}
)

# Query relationships
relations = await sm.get_relationships(
    entity="ALICE",
    relation_type="manages"
)
```

### Index Configuration

```python
# Pinecone index configuration
index_config = {
    "name": "blackroad-semantic",
    "dimension": 1536,
    "metric": "cosine",
    "pods": 1,
    "replicas": 1,
    "pod_type": "p1.x1",

    "metadata_config": {
        "indexed": ["type", "category", "agent_id", "created_at"]
    }
}
```

---

## Archival Memory

### Overview

Archival memory provides **permanent, cold storage** for historical data, full logs, and compliance records. Uses Cloudflare R2 or S3.

### Structure

```
archival/
├── conversations/
│   ├── 2026/
│   │   ├── 01/
│   │   │   ├── day_01.jsonl.gz
│   │   │   ├── day_02.jsonl.gz
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── tasks/
│   ├── completed/
│   └── failed/
├── snapshots/
│   ├── agents/
│   └── memory/
├── audit/
│   ├── access_logs/
│   └── changes/
└── backups/
    ├── daily/
    ├── weekly/
    └── monthly/
```

### Usage

```python
from blackroad.memory import ArchivalMemory

am = ArchivalMemory()

# Archive old conversations
await am.archive(
    source="episodic",
    query={"created_at_lt": "2025-12-01"},
    destination="conversations/2025/"
)

# Retrieve archived data
data = await am.retrieve(
    path="conversations/2025/12/day_15.jsonl.gz",
    decompress=True
)

# Create snapshot
await am.snapshot(
    name="pre_migration_backup",
    include=["episodic", "semantic"]
)

# List archives
archives = await am.list("conversations/2026/02/")
```

### Retention Policies

```yaml
# config/memory/archival.yaml
archival:
  backend: r2
  bucket: blackroad-archive

  retention:
    conversations:
      min_age: 90d      # Archive after 90 days
      keep_forever: true

    tasks:
      completed:
        min_age: 30d
        keep_for: 365d  # Delete after 1 year
      failed:
        keep_forever: true

    audit:
      keep_forever: true
      compliance: SOC2

  compression:
    enabled: true
    algorithm: gzip
    level: 9

  encryption:
    enabled: true
    algorithm: AES-256-GCM
```

---

## PS-SHA Infinity

### Overview

**Persistent Secure Hash Algorithm Infinity** (PS-SHA∞) is BlackRoad's hash chain system for memory integrity. Every memory entry includes the hash of the previous entry, creating a tamper-evident chain.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        PS-SHA∞ Chain                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Memory 1   │    │  Memory 2   │    │  Memory 3   │        │
│  │             │    │             │    │             │        │
│  │ content: A  │───▶│ content: B  │───▶│ content: C  │───▶ ...│
│  │ prev: null  │    │ prev: h(1)  │    │ prev: h(2)  │        │
│  │ hash: h(1)  │    │ hash: h(2)  │    │ hash: h(3)  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
│  h(n) = SHA256(content + timestamp + prev_hash)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

```python
import hashlib
from datetime import datetime

class PSSHAInfinity:
    def __init__(self):
        self.chain = []

    def compute_hash(self, content: str, timestamp: str, prev_hash: str) -> str:
        """Compute PS-SHA∞ hash."""
        data = f"{content}|{timestamp}|{prev_hash}"
        return hashlib.sha256(data.encode()).hexdigest()

    def add_memory(self, content: str) -> dict:
        """Add memory to chain with hash."""
        timestamp = datetime.utcnow().isoformat()
        prev_hash = self.chain[-1]["hash"] if self.chain else "GENESIS"

        hash_value = self.compute_hash(content, timestamp, prev_hash)

        memory = {
            "content": content,
            "timestamp": timestamp,
            "prev_hash": prev_hash,
            "hash": hash_value
        }

        self.chain.append(memory)
        return memory

    def verify_chain(self) -> bool:
        """Verify entire chain integrity."""
        for i, memory in enumerate(self.chain):
            expected_prev = self.chain[i-1]["hash"] if i > 0 else "GENESIS"

            if memory["prev_hash"] != expected_prev:
                return False

            computed = self.compute_hash(
                memory["content"],
                memory["timestamp"],
                memory["prev_hash"]
            )

            if memory["hash"] != computed:
                return False

        return True
```

### Verification

```bash
# Verify memory chain via CLI
./mem.sh verify

# Output:
# PS-SHA∞ Chain Verification
# ├── Total memories: 15,847
# ├── Chain start: 2025-06-01T00:00:00Z
# ├── Chain end: 2026-02-05T12:00:00Z
# ├── Genesis hash: a1b2c3...
# └── Status: VERIFIED ✓
```

---

## Memory Operations

### Store

```python
# Basic store
await memory.store(key, value)

# Store with options
await memory.store(
    key="user_preference",
    value={"theme": "dark", "language": "en"},
    tier="semantic",
    ttl=None,  # Forever
    importance=0.8,
    tags=["user", "settings"]
)
```

### Retrieve

```python
# Get by key
value = await memory.get(key)

# Get with fallback
value = await memory.get(key, default=None)

# Get multiple
values = await memory.mget([key1, key2, key3])

# Get by pattern
values = await memory.scan("user:*:preferences")
```

### Search

```python
# Semantic search
results = await memory.search(
    query="deployment configuration",
    limit=10,
    tier="semantic"
)

# Full-text search in episodic
results = await memory.search(
    query="railway deploy",
    tier="episodic",
    filter={"agent_id": "agent_octavia_001"}
)

# Hybrid search (keyword + semantic)
results = await memory.hybrid_search(
    query="docker container",
    alpha=0.7  # 70% semantic, 30% keyword
)
```

### Delete

```python
# Delete by key
await memory.delete(key)

# Delete by pattern
await memory.delete_pattern("temp:*")

# Delete expired
await memory.cleanup_expired()

# Soft delete (mark as deleted)
await memory.soft_delete(key)
```

### Update

```python
# Update value
await memory.update(key, new_value)

# Partial update
await memory.patch(key, {"theme": "light"})

# Increment
await memory.incr(key, amount=1)

# Append to list
await memory.append(key, new_item)
```

---

## Memory Consolidation

### Consolidation Process

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONSOLIDATION PIPELINE                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SELECTION                                                    │
│     ├── Find memories older than threshold                       │
│     ├── Filter by access frequency                               │
│     └── Exclude recently accessed                                │
│                                                                  │
│  2. SUMMARIZATION                                                │
│     ├── Group related memories                                   │
│     ├── Generate summaries via LLM                               │
│     └── Extract key entities and relations                       │
│                                                                  │
│  3. EMBEDDING                                                    │
│     ├── Compute embeddings for summaries                         │
│     └── Index in vector store                                    │
│                                                                  │
│  4. MIGRATION                                                    │
│     ├── Store in target tier                                     │
│     ├── Update hash chain                                        │
│     └── Mark source as migrated                                  │
│                                                                  │
│  5. CLEANUP                                                      │
│     ├── Archive original if needed                               │
│     └── Delete from source tier                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Consolidation Rules

```yaml
# config/memory/consolidation.yaml
consolidation:
  schedules:
    working_to_episodic:
      trigger: hourly
      conditions:
        - memory_count > 100
        - oldest_memory > 1h
      summarize: false

    episodic_to_semantic:
      trigger: daily
      conditions:
        - memory_count > 1000
        - oldest_memory > 7d
      summarize: true
      summarizer:
        model: llama3.2
        max_tokens: 500

    semantic_to_archival:
      trigger: monthly
      conditions:
        - access_count < 5
        - last_accessed > 90d
      compress: true
```

### Manual Consolidation

```bash
# Consolidate working → episodic
./mem.sh consolidate working episodic

# Consolidate with options
./mem.sh consolidate episodic semantic \
  --older-than 7d \
  --summarize \
  --dry-run

# Force consolidation
./mem.sh consolidate --force --all
```

### Consolidation API

```python
from blackroad.memory import Consolidator

consolidator = Consolidator()

# Run consolidation
result = await consolidator.run(
    source_tier="episodic",
    target_tier="semantic",
    conditions={
        "older_than_days": 7,
        "access_count_lt": 10
    },
    summarize=True
)

print(f"Consolidated {result.count} memories")
print(f"Created {result.summaries} summaries")
print(f"Freed {result.freed_bytes} bytes")
```

---

## Cross-Agent Memory

### Permission Levels

| Level | Description | Access |
|-------|-------------|--------|
| `private` | Only owner agent | Read/Write |
| `team` | Specified agents | Read |
| `organization` | All org agents | Read |
| `public` | Any agent | Read |

### Sharing Memory

```python
# Share memory with specific agents
await memory.share(
    key="deployment_knowledge",
    agents=["agent_alice_001", "agent_octavia_001"],
    permission="read"
)

# Share with all agents
await memory.share(
    key="system_announcement",
    permission="public"
)

# Revoke access
await memory.revoke(
    key="deployment_knowledge",
    agents=["agent_alice_001"]
)
```

### Accessing Shared Memory

```python
# Agent ALICE accessing OCTAVIA's shared memory
shared = await memory.get_shared(
    key="infrastructure_status",
    owner="agent_octavia_001"
)

# Search across shared memories
results = await memory.search_shared(
    query="deployment status",
    include_public=True
)
```

### Memory Namespaces

```python
# Agents have isolated namespaces by default
await memory.store("config", data)  # Stored as agent_alice_001:config

# Access other namespace (if permitted)
await memory.store(
    "shared:team:config",
    data,
    namespace="team"
)

# Global namespace (admin only)
await memory.store(
    "global:announcement",
    data,
    namespace="global"
)
```

---

## Memory API

### REST Endpoints

```
POST   /v1/memory                  # Store memory
GET    /v1/memory/{key}            # Retrieve memory
PUT    /v1/memory/{key}            # Update memory
DELETE /v1/memory/{key}            # Delete memory
POST   /v1/memory/search           # Search memories
POST   /v1/memory/consolidate      # Trigger consolidation
GET    /v1/memory/stats            # Memory statistics
POST   /v1/memory/verify           # Verify chain integrity
```

### Store Memory

```bash
curl -X POST "https://api.blackroad.io/v1/memory" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user_preferences",
    "value": {"theme": "dark"},
    "tier": "semantic",
    "importance": 0.8,
    "tags": ["user", "settings"]
  }'
```

### Search Memory

```bash
curl -X POST "https://api.blackroad.io/v1/memory/search" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "deployment guide",
    "limit": 10,
    "tier": "semantic",
    "filter": {
      "tags": ["documentation"]
    }
  }'
```

### Response Format

```json
{
  "success": true,
  "data": {
    "key": "deployment_guide",
    "value": "...",
    "tier": "semantic",
    "metadata": {
      "created_at": "2026-02-05T12:00:00Z",
      "importance": 0.9,
      "access_count": 47,
      "hash": "a1b2c3d4..."
    }
  }
}
```

---

## Configuration

### Full Configuration Example

```yaml
# config/memory.yaml
memory:
  # Default tier for new memories
  default_tier: working

  # Working Memory (Redis)
  working:
    backend: redis
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD}
    db: 0
    ttl_default: 86400
    max_memory: 10gb
    eviction_policy: allkeys-lru

  # Episodic Memory (PostgreSQL)
  episodic:
    backend: postgresql
    host: ${POSTGRES_HOST:localhost}
    port: ${POSTGRES_PORT:5432}
    database: blackroad_memory
    user: ${POSTGRES_USER}
    password: ${POSTGRES_PASSWORD}
    pool_size: 20
    ttl_default: 2592000  # 30 days

  # Semantic Memory (Pinecone)
  semantic:
    backend: pinecone
    api_key: ${PINECONE_API_KEY}
    environment: ${PINECONE_ENV}
    index: blackroad-semantic
    dimension: 1536
    metric: cosine

  # Archival Memory (R2)
  archival:
    backend: r2
    account_id: ${CF_ACCOUNT_ID}
    access_key: ${R2_ACCESS_KEY}
    secret_key: ${R2_SECRET_KEY}
    bucket: blackroad-archive
    region: auto

  # PS-SHA∞ Settings
  integrity:
    enabled: true
    algorithm: sha256
    verify_on_read: true
    verify_on_consolidation: true

  # Consolidation Settings
  consolidation:
    enabled: true
    schedule:
      working_to_episodic: "0 * * * *"   # Every hour
      episodic_to_semantic: "0 0 * * *"  # Daily
      semantic_to_archival: "0 0 1 * *"  # Monthly

  # Embedding Settings
  embeddings:
    model: text-embedding-3-small
    batch_size: 100
    cache_ttl: 3600
```

---

## Best Practices

### 1. Choose the Right Tier

```python
# Working: Temporary, session-specific
await memory.store("session:temp", data, tier="working")

# Episodic: Events, logs, history
await memory.store("event:login", data, tier="episodic")

# Semantic: Knowledge, patterns
await memory.store("knowledge:deploy", data, tier="semantic")

# Archival: Historical, compliance
await memory.store("audit:2026", data, tier="archival")
```

### 2. Use Appropriate TTLs

```python
# Short-lived cache
await memory.store("cache:result", data, ttl=300)  # 5 min

# Session data
await memory.store("session:data", data, ttl=86400)  # 24 hours

# Important knowledge - no TTL
await memory.store("knowledge:key", data, ttl=None)
```

### 3. Set Importance Scores

```python
# Critical information
await memory.store("api_key", data, importance=1.0)

# Normal interactions
await memory.store("chat:msg", data, importance=0.5)

# Low priority
await memory.store("debug:log", data, importance=0.1)
```

### 4. Use Tags for Organization

```python
await memory.store("doc:deploy", content, tags=[
    "documentation",
    "deployment",
    "railway",
    "production"
])

# Search by tag
results = await memory.search(tags=["deployment"])
```

### 5. Monitor Memory Health

```bash
# Check memory stats
./mem.sh stats

# Output:
# Memory Statistics
# ├── Working: 2.3GB / 10GB (23%)
# ├── Episodic: 45GB / 100GB (45%)
# ├── Semantic: 1.2M vectors
# ├── Archival: 234GB
# └── Chain integrity: VERIFIED
```

### 6. Handle Failures Gracefully

```python
try:
    value = await memory.get(key)
except MemoryConnectionError:
    # Fallback to cache or default
    value = cache.get(key) or default_value
except MemoryNotFoundError:
    value = None
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Slow searches | Index not optimized | Run `./mem.sh optimize` |
| Memory full | No cleanup | Run `./mem.sh consolidate` |
| Chain invalid | Corruption | Run `./mem.sh repair` |
| High latency | Network issues | Check connections |

### Diagnostic Commands

```bash
# Full memory health check
./mem.sh health

# Verify chain integrity
./mem.sh verify

# Check tier status
./mem.sh status

# View memory logs
./mem.sh logs --tail 100
```

---

*Last updated: 2026-02-05*
