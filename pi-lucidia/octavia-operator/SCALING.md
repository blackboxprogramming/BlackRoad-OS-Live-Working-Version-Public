# BlackRoad OS Scaling Guide

> Scale from 1,000 to 30,000 concurrent agents

---

## Table of Contents

- [Overview](#overview)
- [Scaling Phases](#scaling-phases)
- [Infrastructure Scaling](#infrastructure-scaling)
- [Agent Scaling](#agent-scaling)
- [Memory Scaling](#memory-scaling)
- [Database Scaling](#database-scaling)
- [API Scaling](#api-scaling)
- [GPU Scaling](#gpu-scaling)
- [Cost Management](#cost-management)
- [Monitoring at Scale](#monitoring-at-scale)

---

## Overview

BlackRoad OS is designed to scale from a single-node development setup to a **30,000 agent** production deployment. This guide covers the architecture decisions and operational procedures for each scaling phase.

### Scaling Targets

| Phase | Agents | Infra Cost | Timeline |
|-------|--------|------------|----------|
| Development | 10-100 | $0 | Now |
| Alpha | 100-1,000 | $500/mo | Q1 2026 |
| Beta | 1,000-5,000 | $2,000/mo | Q1 2026 |
| GA | 5,000-10,000 | $5,000/mo | Q2 2026 |
| Scale | 10,000-30,000 | $15,000/mo | Q3 2026 |

### Scaling Dimensions

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALING DIMENSIONS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Horizontal (More Instances)        Vertical (Bigger Instances) │
│  ├── API servers                    ├── Database server         │
│  ├── Agent workers                  ├── Redis instance          │
│  ├── GPU nodes                      ├── GPU memory              │
│  └── Edge nodes                     └── CPU cores               │
│                                                                 │
│  Data Sharding                      Caching Layers              │
│  ├── Memory by agent                ├── L1: In-memory           │
│  ├── Tasks by region                ├── L2: Redis               │
│  └── Users by hash                  └── L3: CDN edge            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scaling Phases

### Phase 1: Development (10-100 agents)

```
Single Node Architecture
========================

┌──────────────────────────────────────┐
│            Local Machine             │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │  Ollama  │  │  Redis   │        │
│  │ (LLM)    │  │ (Cache)  │        │
│  └──────────┘  └──────────┘        │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │   API    │  │ Agents   │        │
│  │ Server   │  │ (10-100) │        │
│  └──────────┘  └──────────┘        │
│                                      │
│  ┌──────────┐                       │
│  │ SQLite   │                       │
│  └──────────┘                       │
│                                      │
└──────────────────────────────────────┘

Requirements:
- 16GB RAM
- 8 CPU cores
- 100GB SSD
- GPU optional
```

**Setup:**
```bash
# Start all services locally
./boot.sh

# Wake agents (up to 100)
for i in {1..100}; do
  ./wake.sh llama3.2 WORKER_$i &
done
```

---

### Phase 2: Alpha (100-1,000 agents)

```
Small Cluster Architecture
==========================

┌─────────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE EDGE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Workers   │  │     KV      │  │   Tunnel    │            │
│  └──────┬──────┘  └─────────────┘  └──────┬──────┘            │
└─────────┼───────────────────────────────────┼───────────────────┘
          │                                   │
          ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│      RAILWAY        │           │   DIGITALOCEAN      │
│                     │           │                     │
│  ┌───────────────┐  │           │  ┌───────────────┐  │
│  │  API (x2)     │  │           │  │   PostgreSQL  │  │
│  └───────────────┘  │           │  └───────────────┘  │
│                     │           │                     │
│  ┌───────────────┐  │           │  ┌───────────────┐  │
│  │  Workers (x4) │  │           │  │     Redis     │  │
│  └───────────────┘  │           │  └───────────────┘  │
│                     │           │                     │
│  ┌───────────────┐  │           └─────────────────────┘
│  │  GPU (x1)     │  │
│  └───────────────┘  │
└─────────────────────┘

Requirements:
- 2x API servers (2 vCPU, 4GB each)
- 4x Worker nodes (4 vCPU, 8GB each)
- 1x GPU node (H100)
- 1x PostgreSQL (4 vCPU, 16GB, 100GB)
- 1x Redis (2GB)
```

**Deployment:**
```yaml
# railway.yaml
services:
  api:
    replicas: 2
    resources:
      cpu: 2
      memory: 4GB

  worker:
    replicas: 4
    resources:
      cpu: 4
      memory: 8GB

  gpu:
    replicas: 1
    gpu: H100
```

---

### Phase 3: Beta (1,000-5,000 agents)

```
Medium Cluster Architecture
===========================

                    ┌─────────────────────────────────┐
                    │         LOAD BALANCER           │
                    │        (Cloudflare)             │
                    └─────────────┬───────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        ┌───────────┐       ┌───────────┐       ┌───────────┐
        │  API x4   │       │  API x4   │       │  API x4   │
        │ (Region A)│       │ (Region B)│       │ (Region C)│
        └─────┬─────┘       └─────┬─────┘       └─────┬─────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              ┌─────┴─────┐               ┌─────┴─────┐
              │  Workers  │               │  Workers  │
              │  (x20)    │               │  (x20)    │
              └───────────┘               └───────────┘
                    │                           │
              ┌─────┴─────┐               ┌─────┴─────┐
              │  GPU x4   │               │  GPU x4   │
              └───────────┘               └───────────┘
                    │                           │
                    └───────────┬───────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ┌─────┴─────┐           ┌─────┴─────┐
              │ PostgreSQL│           │   Redis   │
              │ (Primary) │           │  Cluster  │
              │  + Replica│           │   (x3)    │
              └───────────┘           └───────────┘

Requirements:
- 12x API servers (4 vCPU, 8GB each)
- 40x Worker nodes (8 vCPU, 16GB each)
- 8x GPU nodes (H100)
- PostgreSQL primary + 2 replicas
- Redis cluster (3 nodes)
- Pinecone (dedicated index)
```

---

### Phase 4: GA (5,000-10,000 agents)

```
Large Cluster Architecture
==========================

                         ┌─────────────────────┐
                         │   GLOBAL LOAD       │
                         │   BALANCER          │
                         └──────────┬──────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    US-EAST      │      │    EU-WEST      │      │    AP-SOUTH     │
│                 │      │                 │      │                 │
│  API x8         │      │  API x8         │      │  API x8         │
│  Workers x30    │      │  Workers x30    │      │  Workers x30    │
│  GPU x6         │      │  GPU x6         │      │  GPU x6         │
│                 │      │                 │      │                 │
│  Redis x3       │      │  Redis x3       │      │  Redis x3       │
│  Postgres       │      │  Postgres       │      │  Postgres       │
│  (replica)      │      │  (replica)      │      │  (primary)      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │   GLOBAL SERVICES   │
                         │                     │
                         │  • Pinecone         │
                         │  • R2 Storage       │
                         │  • Monitoring       │
                         └─────────────────────┘
```

---

### Phase 5: Scale (10,000-30,000 agents)

```
Massive Scale Architecture
==========================

                              ┌─────────────────────┐
                              │    ANYCAST DNS      │
                              │    (Cloudflare)     │
                              └──────────┬──────────┘
                                         │
    ┌────────────────────────────────────┼────────────────────────────────────┐
    │                                    │                                    │
    ▼                                    ▼                                    ▼
┌─────────┐                        ┌─────────┐                        ┌─────────┐
│ US-EAST │                        │ EU-WEST │                        │ AP-SOUTH│
│         │                        │         │                        │         │
│ K8s     │                        │ K8s     │                        │ K8s     │
│ Cluster │                        │ Cluster │                        │ Cluster │
│         │                        │         │                        │         │
│ 50 nodes│                        │ 50 nodes│                        │ 50 nodes│
└────┬────┘                        └────┬────┘                        └────┬────┘
     │                                  │                                  │
     │           ┌──────────────────────┼──────────────────────┐          │
     │           │                      │                      │          │
     │           ▼                      ▼                      ▼          │
     │    ┌───────────┐          ┌───────────┐          ┌───────────┐    │
     │    │ GPU Farm  │          │ GPU Farm  │          │ GPU Farm  │    │
     │    │ 20x H100  │          │ 20x H100  │          │ 20x H100  │    │
     │    └───────────┘          └───────────┘          └───────────┘    │
     │                                  │                                  │
     └──────────────────────────────────┼──────────────────────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │  GLOBAL DATA      │
                              │                   │
                              │  CockroachDB      │
                              │  (geo-distributed)│
                              │                   │
                              │  Redis Enterprise │
                              │  (global cluster) │
                              │                   │
                              │  Pinecone         │
                              │  (sharded)        │
                              └───────────────────┘

Total Resources:
- 150 K8s nodes (8 vCPU, 32GB each)
- 60 H100 GPUs
- 3 CockroachDB clusters
- 9 Redis nodes
- 30,000 concurrent agents
```

---

## Infrastructure Scaling

### Kubernetes Configuration

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackroad-api
spec:
  replicas: 10
  selector:
    matchLabels:
      app: blackroad-api
  template:
    metadata:
      labels:
        app: blackroad-api
    spec:
      containers:
      - name: api
        image: blackroad/api:latest
        resources:
          requests:
            cpu: "2"
            memory: "4Gi"
          limits:
            cpu: "4"
            memory: "8Gi"
        ports:
        - containerPort: 8000
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: blackroad-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: blackroad-api
  minReplicas: 5
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Auto-Scaling Rules

```python
# scaling/autoscaler.py
class AutoScaler:
    def __init__(self, k8s_client):
        self.k8s = k8s_client
        self.rules = {
            "api": {
                "min": 5,
                "max": 50,
                "scale_up_threshold": 70,  # CPU %
                "scale_down_threshold": 30,
                "cooldown": 300  # seconds
            },
            "worker": {
                "min": 10,
                "max": 100,
                "scale_up_threshold": 80,
                "scale_down_threshold": 40,
                "cooldown": 600
            },
            "gpu": {
                "min": 2,
                "max": 20,
                "scale_up_threshold": 90,
                "scale_down_threshold": 50,
                "cooldown": 900
            }
        }

    async def evaluate(self):
        for service, rules in self.rules.items():
            metrics = await self.get_metrics(service)

            if metrics.cpu > rules["scale_up_threshold"]:
                await self.scale_up(service)
            elif metrics.cpu < rules["scale_down_threshold"]:
                await self.scale_down(service)
```

---

## Agent Scaling

### Agent Distribution

```python
# scaling/agent_distributor.py
class AgentDistributor:
    """Distribute agents across worker nodes."""

    def __init__(self, workers: List[str]):
        self.workers = workers
        self.agent_map = {}  # agent_id -> worker

    def assign_worker(self, agent_id: str) -> str:
        """Assign agent to least loaded worker."""
        loads = self.get_worker_loads()
        worker = min(loads, key=loads.get)
        self.agent_map[agent_id] = worker
        return worker

    def rebalance(self):
        """Rebalance agents across workers."""
        loads = self.get_worker_loads()
        avg_load = sum(loads.values()) / len(loads)

        # Move agents from overloaded to underloaded
        for worker, load in loads.items():
            if load > avg_load * 1.2:  # 20% over average
                agents_to_move = self.get_agents_on_worker(worker)
                target_workers = [w for w, l in loads.items() if l < avg_load]

                for agent in agents_to_move[:len(agents_to_move)//4]:
                    new_worker = random.choice(target_workers)
                    await self.migrate_agent(agent, new_worker)
```

### Agent Sharding

```python
# scaling/shard_manager.py
class ShardManager:
    """Manage agent sharding across regions."""

    def __init__(self, regions: List[str]):
        self.regions = regions
        self.shards = {r: [] for r in regions}

    def get_shard(self, agent_id: str) -> str:
        """Determine shard for agent using consistent hashing."""
        hash_val = hash(agent_id)
        index = hash_val % len(self.regions)
        return self.regions[index]

    def route_request(self, agent_id: str) -> str:
        """Route request to correct region."""
        shard = self.get_shard(agent_id)
        return f"https://{shard}.api.blackroad.io"
```

### Agent Pool Management

```python
# scaling/agent_pool.py
class ScalableAgentPool:
    """Pool that scales based on demand."""

    def __init__(self, min_agents: int = 10, max_agents: int = 1000):
        self.min_agents = min_agents
        self.max_agents = max_agents
        self.agents = {}
        self.pending_requests = asyncio.Queue()

    async def scale_to_demand(self):
        """Scale pool based on pending requests."""
        pending = self.pending_requests.qsize()
        current = len(self.agents)

        if pending > current * 2 and current < self.max_agents:
            # Scale up
            new_count = min(current * 2, self.max_agents)
            await self.add_agents(new_count - current)

        elif pending < current * 0.25 and current > self.min_agents:
            # Scale down
            new_count = max(current // 2, self.min_agents)
            await self.remove_agents(current - new_count)

    async def add_agents(self, count: int):
        """Add agents to pool."""
        for i in range(count):
            agent = await self.create_agent()
            self.agents[agent.id] = agent

    async def remove_agents(self, count: int):
        """Remove idle agents from pool."""
        idle = [a for a in self.agents.values() if a.status == "idle"]
        for agent in idle[:count]:
            await agent.shutdown()
            del self.agents[agent.id]
```

---

## Memory Scaling

### Memory Sharding

```python
# scaling/memory_shard.py
class ShardedMemory:
    """Memory system sharded by agent."""

    def __init__(self, shard_count: int = 16):
        self.shard_count = shard_count
        self.shards = [RedisConnection(f"redis-{i}") for i in range(shard_count)]

    def get_shard(self, key: str) -> int:
        """Get shard index for key."""
        return hash(key) % self.shard_count

    async def get(self, key: str):
        shard = self.get_shard(key)
        return await self.shards[shard].get(key)

    async def set(self, key: str, value, ttl: int = None):
        shard = self.get_shard(key)
        await self.shards[shard].set(key, value, ex=ttl)
```

### Vector Index Scaling

```python
# scaling/vector_scaling.py
class ScaledVectorIndex:
    """Pinecone index with multiple namespaces."""

    def __init__(self, index_name: str, namespace_count: int = 10):
        self.index = pinecone.Index(index_name)
        self.namespace_count = namespace_count

    def get_namespace(self, agent_id: str) -> str:
        """Get namespace for agent."""
        hash_val = hash(agent_id)
        return f"ns_{hash_val % self.namespace_count}"

    async def upsert(self, agent_id: str, vectors: list):
        namespace = self.get_namespace(agent_id)
        await self.index.upsert(vectors, namespace=namespace)

    async def query(self, agent_id: str, vector: list, top_k: int = 10):
        namespace = self.get_namespace(agent_id)
        return await self.index.query(vector, top_k=top_k, namespace=namespace)
```

---

## Database Scaling

### Read Replicas

```python
# scaling/database.py
class ScaledDatabase:
    """Database with read replicas."""

    def __init__(self, primary: str, replicas: List[str]):
        self.primary = asyncpg.create_pool(primary)
        self.replicas = [asyncpg.create_pool(r) for r in replicas]
        self.replica_index = 0

    async def write(self, query: str, *args):
        """Write to primary."""
        async with self.primary.acquire() as conn:
            return await conn.execute(query, *args)

    async def read(self, query: str, *args):
        """Read from replica (round-robin)."""
        replica = self.replicas[self.replica_index]
        self.replica_index = (self.replica_index + 1) % len(self.replicas)

        async with replica.acquire() as conn:
            return await conn.fetch(query, *args)
```

### Table Partitioning

```sql
-- Partition tasks by date
CREATE TABLE tasks (
    id UUID,
    agent_id VARCHAR(64),
    title TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE tasks_2026_01 PARTITION OF tasks
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE tasks_2026_02 PARTITION OF tasks
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Auto-create partitions
CREATE OR REPLACE FUNCTION create_partition_if_not_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Create partition for next month if needed
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS tasks_%s PARTITION OF tasks FOR VALUES FROM (%L) TO (%L)',
        to_char(NEW.created_at, 'YYYY_MM'),
        date_trunc('month', NEW.created_at),
        date_trunc('month', NEW.created_at) + INTERVAL '1 month'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## GPU Scaling

### GPU Pool Management

```python
# scaling/gpu_pool.py
class GPUPool:
    """Manage pool of GPU nodes."""

    def __init__(self):
        self.nodes = {}
        self.queue = asyncio.Queue()

    async def acquire_gpu(self, memory_required: int = 40) -> GPUNode:
        """Acquire GPU with sufficient memory."""
        while True:
            for node_id, node in self.nodes.items():
                if node.available_memory >= memory_required:
                    node.allocate(memory_required)
                    return node

            # Wait for GPU to become available
            await asyncio.sleep(1)

    def release_gpu(self, node: GPUNode, memory: int):
        """Release GPU memory."""
        node.deallocate(memory)

    async def scale_gpus(self, target_count: int):
        """Scale GPU nodes to target count."""
        current = len(self.nodes)

        if target_count > current:
            # Add GPU nodes
            for i in range(target_count - current):
                node = await self.provision_gpu_node()
                self.nodes[node.id] = node

        elif target_count < current:
            # Remove idle GPU nodes
            idle_nodes = [n for n in self.nodes.values() if n.is_idle()]
            for node in idle_nodes[:current - target_count]:
                await self.deprovision_gpu_node(node)
                del self.nodes[node.id]
```

### Model Sharding

```python
# scaling/model_shard.py
class ShardedModel:
    """Shard large models across GPUs."""

    def __init__(self, model_name: str, gpu_count: int):
        self.model_name = model_name
        self.gpu_count = gpu_count

    async def load(self):
        """Load model with tensor parallelism."""
        # vLLM with tensor parallelism
        self.engine = AsyncLLMEngine.from_engine_args(
            EngineArgs(
                model=self.model_name,
                tensor_parallel_size=self.gpu_count,
                gpu_memory_utilization=0.9
            )
        )

    async def generate(self, prompt: str, **kwargs):
        """Generate with sharded model."""
        return await self.engine.generate(prompt, **kwargs)
```

---

## Cost Management

### Cost Calculator

```python
# scaling/cost_calculator.py
class CostCalculator:
    """Calculate infrastructure costs."""

    PRICES = {
        "railway": {
            "cpu": 0.000463,      # per vCPU-hour
            "memory": 0.000231,   # per GB-hour
            "gpu_h100": 4.50      # per hour
        },
        "cloudflare": {
            "workers_requests": 0.50 / 1_000_000,  # per request
            "kv_reads": 0.50 / 1_000_000,
            "kv_writes": 5.00 / 1_000_000,
            "r2_storage": 0.015 / 1_000_000_000  # per GB-month
        }
    }

    def calculate_monthly(self, resources: dict) -> float:
        total = 0

        # Railway compute
        total += resources["cpu_hours"] * self.PRICES["railway"]["cpu"]
        total += resources["memory_gb_hours"] * self.PRICES["railway"]["memory"]
        total += resources["gpu_hours"] * self.PRICES["railway"]["gpu_h100"]

        # Cloudflare
        total += resources["worker_requests"] * self.PRICES["cloudflare"]["workers_requests"]
        total += resources["kv_reads"] * self.PRICES["cloudflare"]["kv_reads"]
        total += resources["r2_storage_gb"] * self.PRICES["cloudflare"]["r2_storage"]

        return total
```

### Cost by Scale

| Scale | CPU | Memory | GPU | Storage | Network | Total |
|-------|-----|--------|-----|---------|---------|-------|
| 1K agents | $200 | $100 | $500 | $50 | $50 | $900/mo |
| 5K agents | $800 | $400 | $2,000 | $200 | $200 | $3,600/mo |
| 10K agents | $1,500 | $800 | $4,000 | $500 | $500 | $7,300/mo |
| 30K agents | $4,000 | $2,000 | $10,000 | $1,500 | $1,500 | $19,000/mo |

---

## Monitoring at Scale

### Metrics at Scale

```yaml
# prometheus/rules/scaling.yaml
groups:
  - name: scaling_alerts
    rules:
      - alert: AgentCountLow
        expr: blackroad_agents_active < blackroad_agents_target * 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Agent count below target"

      - alert: TaskQueueBacklog
        expr: blackroad_task_queue_length > 10000
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Task queue backlog critical"

      - alert: GPUUtilizationLow
        expr: avg(blackroad_gpu_utilization) < 0.3
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "GPU utilization low - consider scaling down"
```

### Scaling Dashboard

```bash
./scale.sh status

# Output:
# BLACKROAD SCALING STATUS
# ========================
#
# Current Scale:
#   Agents: 12,456 / 30,000 (42%)
#   API Pods: 15 / 50
#   Worker Pods: 45 / 100
#   GPU Nodes: 8 / 20
#
# Load Metrics:
#   CPU: 65% avg
#   Memory: 72% avg
#   GPU: 85% avg
#   Queue Depth: 234 tasks
#
# Scaling Events (last hour):
#   10:15 - Scaled API from 12 to 15 pods
#   10:30 - Scaled workers from 40 to 45 pods
#
# Estimated Monthly Cost: $8,234
```

---

*Last updated: 2026-02-05*
