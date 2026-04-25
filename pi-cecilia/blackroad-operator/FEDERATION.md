# FEDERATION.md - Multi-Cluster Federation Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Unite distributed clusters into a unified AI mesh.

---

## Table of Contents

1. [Overview](#overview)
2. [Federation Architecture](#federation-architecture)
3. [Cluster Setup](#cluster-setup)
4. [Mesh Networking](#mesh-networking)
5. [Agent Distribution](#agent-distribution)
6. [Cross-Cluster Communication](#cross-cluster-communication)
7. [Data Replication](#data-replication)
8. [Failover & HA](#failover--ha)
9. [Security](#security)
10. [Monitoring](#monitoring)
11. [Operations](#operations)

---

## Overview

### Why Federation?

BlackRoad OS federation enables:

| Capability | Description |
|------------|-------------|
| **Global Scale** | 30K+ agents across continents |
| **Geo-locality** | Run agents near data/users |
| **Redundancy** | Survive regional failures |
| **Sovereignty** | Data stays in region |
| **Hybrid** | Mix cloud + edge + on-prem |

### Federation Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BlackRoad Federation Mesh                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     ┌─────────────────┐         ┌─────────────────┐                 │
│     │   US-WEST       │◀═══════▶│   US-EAST       │                 │
│     │   Cluster       │         │   Cluster       │                 │
│     │   5000 agents   │         │   5000 agents   │                 │
│     └────────┬────────┘         └────────┬────────┘                 │
│              │                           │                          │
│              │    ┌─────────────────┐    │                          │
│              └═══▶│   CONTROL PLANE │◀═══┘                          │
│                   │   (Global)      │                               │
│              ┌═══▶│                 │◀═══┐                          │
│              │    └─────────────────┘    │                          │
│              │                           │                          │
│     ┌────────┴────────┐         ┌────────┴────────┐                 │
│     │   EU-WEST       │◀═══════▶│   ASIA-PACIFIC  │                 │
│     │   Cluster       │         │   Cluster       │                 │
│     │   3000 agents   │         │   2000 agents   │                 │
│     └────────┬────────┘         └────────┬────────┘                 │
│              │                           │                          │
│              │                           │                          │
│     ┌────────▼────────┐         ┌────────▼────────┐                 │
│     │   EDGE-EU       │         │   EDGE-APAC     │                 │
│     │   Raspberry Pi  │         │   Raspberry Pi  │                 │
│     │   100 agents    │         │   100 agents    │                 │
│     └─────────────────┘         └─────────────────┘                 │
│                                                                      │
│     Total: 15,200 agents across 6 clusters                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Federation Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Federation Components                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Global Control Plane                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │ Registry │ │ Scheduler│ │ Gateway  │ │ Monitor  │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              │                               │                  │
│  ┌───────────▼───────────┐   ┌───────────────▼───────────┐     │
│  │    Cluster Agent      │   │      Cluster Agent        │     │
│  │  ┌─────────────────┐  │   │  ┌─────────────────┐      │     │
│  │  │ Cluster         │  │   │  │ Cluster         │      │     │
│  │  │ Controller      │  │   │  │ Controller      │      │     │
│  │  └─────────────────┘  │   │  └─────────────────┘      │     │
│  │  ┌─────────────────┐  │   │  ┌─────────────────┐      │     │
│  │  │ Agent Supervisor│  │   │  │ Agent Supervisor│      │     │
│  │  └─────────────────┘  │   │  └─────────────────┘      │     │
│  │  ┌─────────────────┐  │   │  ┌─────────────────┐      │     │
│  │  │ State Sync      │  │   │  │ State Sync      │      │     │
│  │  └─────────────────┘  │   │  └─────────────────┘      │     │
│  └───────────────────────┘   └───────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Hierarchy

```yaml
# Federation hierarchy
federation:
  name: blackroad-global
  control_plane:
    type: distributed
    nodes: 3
    regions:
      - us-west-2
      - eu-west-1
      - ap-southeast-1

  clusters:
    - name: us-west
      region: us-west-2
      role: primary
      capacity: 10000

    - name: us-east
      region: us-east-1
      role: primary
      capacity: 10000

    - name: eu-west
      region: eu-west-1
      role: primary
      capacity: 5000

    - name: asia-pacific
      region: ap-southeast-1
      role: primary
      capacity: 5000

    - name: edge-home
      region: local
      role: edge
      capacity: 100
      nodes:
        - lucidia (192.168.4.38)
        - blackroad-pi (192.168.4.64)
        - lucidia-alt (192.168.4.99)
```

---

## Cluster Setup

### Creating a New Cluster

```bash
#!/bin/bash
# scripts/create-cluster.sh

CLUSTER_NAME="$1"
REGION="$2"

echo "Creating cluster: $CLUSTER_NAME in $REGION"

# Generate cluster credentials
./blackroad federation create-cluster \
  --name "$CLUSTER_NAME" \
  --region "$REGION" \
  --capacity 5000

# Output:
# Cluster created: us-west
# Cluster ID: cluster_abc123
# Join Token: eyJhbGc...
# Control Plane: https://control.blackroad.io
```

### Joining Federation

```bash
# On the new cluster node
./blackroad federation join \
  --token "eyJhbGc..." \
  --control-plane "https://control.blackroad.io" \
  --cluster-name "us-west"

# Verify membership
./blackroad federation status

# Output:
# Federation: blackroad-global
# Cluster: us-west
# Status: Connected
# Agents: 0/5000
# Latency to control plane: 15ms
```

### Cluster Configuration

```yaml
# config/cluster.yaml
cluster:
  name: us-west
  id: cluster_abc123
  region: us-west-2

  # Networking
  network:
    pod_cidr: 10.100.0.0/16
    service_cidr: 10.101.0.0/16
    mesh_port: 7946

  # Resources
  resources:
    max_agents: 5000
    max_memory_gb: 256
    max_gpu: 8

  # Labels for scheduling
  labels:
    tier: production
    gpu: nvidia-a100
    compliance: soc2

  # Taints to restrict scheduling
  taints:
    - key: gpu-only
      value: "true"
      effect: NoSchedule

  # Control plane connection
  federation:
    control_plane: https://control.blackroad.io
    heartbeat_interval: 30s
    sync_interval: 5m
```

### Edge Cluster Setup

```bash
#!/bin/bash
# scripts/setup-edge-cluster.sh

# Setup on Raspberry Pi
PI_HOSTS="192.168.4.38 192.168.4.64 192.168.4.99"

for host in $PI_HOSTS; do
  echo "Setting up $host..."

  ssh pi@$host << 'EOF'
    # Install BlackRoad agent
    curl -fsSL https://get.blackroad.io | sh

    # Configure as edge node
    cat > /etc/blackroad/config.yaml << 'CONFIG'
cluster:
  name: edge-home
  type: edge

node:
  role: worker
  labels:
    type: raspberry-pi
    location: home

resources:
  max_agents: 50
  reserved_memory_mb: 512
CONFIG

    # Start service
    sudo systemctl enable blackroad
    sudo systemctl start blackroad
EOF
done

# Join edge cluster to federation
./blackroad federation join \
  --token "$EDGE_TOKEN" \
  --control-plane "https://control.blackroad.io" \
  --cluster-name "edge-home" \
  --cluster-type edge
```

---

## Mesh Networking

### Service Mesh

```yaml
# config/mesh.yaml
mesh:
  name: blackroad-mesh

  # WireGuard-based encrypted overlay
  encryption:
    type: wireguard
    key_rotation: 24h

  # Service discovery
  discovery:
    type: dns
    domain: mesh.blackroad.local

  # Load balancing
  load_balancing:
    algorithm: least_connections
    health_check_interval: 10s

  # Traffic policies
  policies:
    - name: agent-to-agent
      source: agent/*
      destination: agent/*
      allow: true
      encrypt: true

    - name: cross-cluster
      source: cluster/*
      destination: cluster/*
      allow: true
      encrypt: true
      max_latency_ms: 100
```

### Cross-Cluster DNS

```yaml
# config/dns.yaml
dns:
  # Global service discovery
  zones:
    - name: blackroad.mesh
      type: federation
      records:
        # Global services
        - name: control
          type: A
          ttl: 60
          endpoints:
            - cluster: us-west
              ip: 10.100.1.1
              priority: 1
            - cluster: us-east
              ip: 10.101.1.1
              priority: 2

        # Agent discovery
        - name: "*.agents"
          type: SRV
          ttl: 30
          # Dynamically resolved based on agent location

  # Cluster-local resolution
  local_zones:
    - name: us-west.blackroad.mesh
      type: cluster
      # Local cluster services
```

### Network Policies

```python
# blackroad/federation/network.py
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class TrafficPolicy(Enum):
    ALLOW = "allow"
    DENY = "deny"
    RATE_LIMIT = "rate_limit"

@dataclass
class NetworkPolicy:
    """Cross-cluster network policy."""

    name: str
    source_clusters: List[str]
    destination_clusters: List[str]
    source_agents: Optional[List[str]] = None
    destination_agents: Optional[List[str]] = None
    policy: TrafficPolicy = TrafficPolicy.ALLOW
    rate_limit_rps: Optional[int] = None
    encrypt: bool = True
    max_latency_ms: Optional[int] = None

class MeshNetworkManager:
    """Manage federation mesh networking."""

    def __init__(self, config: dict):
        self.config = config
        self.policies: List[NetworkPolicy] = []

    async def apply_policy(self, policy: NetworkPolicy):
        """Apply a network policy across the mesh."""
        for cluster in self.get_clusters():
            await self.push_policy_to_cluster(cluster, policy)

    async def get_route(
        self,
        source_cluster: str,
        destination_cluster: str
    ) -> dict:
        """Get optimal route between clusters."""
        # Consider latency, cost, and policies
        routes = await self.discover_routes(source_cluster, destination_cluster)
        return self.select_best_route(routes)

    async def establish_tunnel(
        self,
        source: str,
        destination: str
    ) -> "MeshTunnel":
        """Establish encrypted tunnel between clusters."""
        # WireGuard tunnel setup
        tunnel = await self.wireguard.create_tunnel(source, destination)
        return tunnel
```

---

## Agent Distribution

### Global Scheduler

```python
# blackroad/federation/scheduler.py
from dataclasses import dataclass
from typing import List, Dict, Optional
import heapq

@dataclass
class SchedulingConstraints:
    """Constraints for agent placement."""

    preferred_regions: List[str] = None
    required_labels: Dict[str, str] = None
    excluded_clusters: List[str] = None
    min_memory_gb: float = 0
    requires_gpu: bool = False
    data_locality: Optional[str] = None  # Keep agent near data
    max_latency_to_user_ms: Optional[int] = None

@dataclass
class ClusterScore:
    """Scoring for cluster selection."""

    cluster_id: str
    score: float
    reasons: List[str]

class GlobalScheduler:
    """Schedule agents across federation."""

    def __init__(self, registry, monitor):
        self.registry = registry
        self.monitor = monitor

    async def schedule_agent(
        self,
        agent_type: str,
        constraints: SchedulingConstraints
    ) -> str:
        """Find optimal cluster for agent."""

        clusters = await self.registry.get_clusters()
        scores = []

        for cluster in clusters:
            score = await self.score_cluster(cluster, agent_type, constraints)
            if score.score > 0:
                heapq.heappush(scores, (-score.score, score))

        if not scores:
            raise NoAvailableClusterError("No cluster meets constraints")

        best = heapq.heappop(scores)[1]
        return best.cluster_id

    async def score_cluster(
        self,
        cluster: dict,
        agent_type: str,
        constraints: SchedulingConstraints
    ) -> ClusterScore:
        """Score a cluster for agent placement."""

        score = 100.0
        reasons = []

        # Check hard constraints
        if constraints.required_labels:
            for key, value in constraints.required_labels.items():
                if cluster.get("labels", {}).get(key) != value:
                    return ClusterScore(cluster["id"], 0, ["Missing required label"])

        if constraints.excluded_clusters:
            if cluster["id"] in constraints.excluded_clusters:
                return ClusterScore(cluster["id"], 0, ["Cluster excluded"])

        # Check resources
        available = await self.monitor.get_cluster_resources(cluster["id"])

        if constraints.min_memory_gb:
            if available["memory_gb"] < constraints.min_memory_gb:
                return ClusterScore(cluster["id"], 0, ["Insufficient memory"])

        if constraints.requires_gpu:
            if available["gpu"] < 1:
                return ClusterScore(cluster["id"], 0, ["No GPU available"])

        # Soft scoring

        # Prefer clusters with more headroom
        utilization = available["agent_count"] / cluster["capacity"]
        score -= utilization * 30
        reasons.append(f"Utilization: {utilization:.1%}")

        # Prefer regions closer to data
        if constraints.data_locality:
            data_region = await self.get_data_region(constraints.data_locality)
            if cluster["region"] == data_region:
                score += 20
                reasons.append("Data locality match")

        # Prefer lower latency clusters
        if constraints.max_latency_to_user_ms:
            latency = await self.monitor.get_cluster_latency(cluster["id"])
            if latency > constraints.max_latency_to_user_ms:
                score -= 50
                reasons.append(f"High latency: {latency}ms")

        # Prefer regions in list
        if constraints.preferred_regions:
            if cluster["region"] in constraints.preferred_regions:
                score += 15
                reasons.append("Preferred region")

        return ClusterScore(cluster["id"], max(0, score), reasons)

    async def rebalance_agents(self):
        """Rebalance agents across clusters."""

        clusters = await self.registry.get_clusters()
        agents = await self.registry.get_all_agents()

        # Calculate optimal distribution
        total_agents = len(agents)
        total_capacity = sum(c["capacity"] for c in clusters)

        for cluster in clusters:
            target = int((cluster["capacity"] / total_capacity) * total_agents)
            current = await self.registry.get_agent_count(cluster["id"])

            if current > target * 1.2:  # 20% over
                # Migrate agents away
                excess = current - target
                await self.migrate_agents_from(cluster["id"], excess)
            elif current < target * 0.8:  # 20% under
                # Attract more agents
                await self.adjust_cluster_weight(cluster["id"], weight=1.2)
```

### Agent Migration

```python
# blackroad/federation/migration.py
from enum import Enum
from dataclasses import dataclass
from typing import Optional
import asyncio

class MigrationState(Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    CHECKPOINTING = "checkpointing"
    TRANSFERRING = "transferring"
    RESTORING = "restoring"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class MigrationJob:
    """Agent migration job."""

    id: str
    agent_id: str
    source_cluster: str
    destination_cluster: str
    state: MigrationState
    progress: float
    started_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None

class AgentMigrator:
    """Migrate agents between clusters."""

    def __init__(self, registry, mesh):
        self.registry = registry
        self.mesh = mesh

    async def migrate_agent(
        self,
        agent_id: str,
        destination_cluster: str,
        live: bool = True
    ) -> MigrationJob:
        """Migrate an agent to another cluster."""

        agent = await self.registry.get_agent(agent_id)
        source_cluster = agent["cluster_id"]

        job = MigrationJob(
            id=f"mig_{agent_id}_{destination_cluster}",
            agent_id=agent_id,
            source_cluster=source_cluster,
            destination_cluster=destination_cluster,
            state=MigrationState.PENDING,
            progress=0,
            started_at=datetime.utcnow().isoformat()
        )

        try:
            if live:
                await self._live_migrate(job)
            else:
                await self._cold_migrate(job)

            job.state = MigrationState.COMPLETED
            job.completed_at = datetime.utcnow().isoformat()

        except Exception as e:
            job.state = MigrationState.FAILED
            job.error = str(e)

        return job

    async def _live_migrate(self, job: MigrationJob):
        """Live migration with minimal downtime."""

        # Phase 1: Prepare destination
        job.state = MigrationState.PREPARING
        job.progress = 0.1
        await self._prepare_destination(job)

        # Phase 2: Checkpoint agent state
        job.state = MigrationState.CHECKPOINTING
        job.progress = 0.3
        checkpoint = await self._checkpoint_agent(job.agent_id)

        # Phase 3: Transfer state
        job.state = MigrationState.TRANSFERRING
        job.progress = 0.5
        await self._transfer_state(checkpoint, job.destination_cluster)

        # Phase 4: Brief pause and final sync
        await self._pause_agent(job.agent_id)
        final_delta = await self._get_delta(job.agent_id, checkpoint["timestamp"])
        await self._transfer_state(final_delta, job.destination_cluster)

        # Phase 5: Restore on destination
        job.state = MigrationState.RESTORING
        job.progress = 0.8
        await self._restore_agent(job)

        # Phase 6: Verify and cutover
        job.state = MigrationState.VERIFYING
        job.progress = 0.9
        await self._verify_and_cutover(job)

        # Cleanup source
        await self._cleanup_source(job)
        job.progress = 1.0
```

---

## Cross-Cluster Communication

### Message Routing

```python
# blackroad/federation/routing.py
from dataclasses import dataclass
from typing import Any, Dict
import aiohttp

@dataclass
class Message:
    """Cross-cluster message."""

    id: str
    source_cluster: str
    source_agent: str
    destination_cluster: str
    destination_agent: str
    payload: Dict[str, Any]
    timestamp: str
    ttl: int = 30  # seconds
    priority: int = 5  # 1-10

class CrossClusterRouter:
    """Route messages between clusters."""

    def __init__(self, mesh, registry):
        self.mesh = mesh
        self.registry = registry
        self.local_cluster = None

    async def send(self, message: Message) -> bool:
        """Send message to remote cluster."""

        if message.destination_cluster == self.local_cluster:
            # Local delivery
            return await self._deliver_local(message)

        # Get route to destination cluster
        route = await self.mesh.get_route(
            self.local_cluster,
            message.destination_cluster
        )

        # Send via mesh
        gateway = route["gateway"]
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{gateway}/api/v1/messages",
                json=message.__dict__,
                headers={"X-Cluster-Auth": self._get_auth_token()}
            ) as response:
                return response.status == 202

    async def receive(self, message: Message):
        """Receive message from remote cluster."""

        # Validate source
        if not await self._validate_source(message):
            raise UnauthorizedClusterError(message.source_cluster)

        # Check if destination is local
        if message.destination_cluster == self.local_cluster:
            await self._deliver_local(message)
        else:
            # Forward to next hop
            await self.send(message)

    async def _deliver_local(self, message: Message):
        """Deliver message to local agent."""
        agent = await self.registry.get_local_agent(message.destination_agent)
        if not agent:
            raise AgentNotFoundError(message.destination_agent)

        await agent.receive_message(message)


class AgentProxy:
    """Proxy for remote agents."""

    def __init__(self, agent_id: str, cluster_id: str, router: CrossClusterRouter):
        self.agent_id = agent_id
        self.cluster_id = cluster_id
        self.router = router

    async def invoke(self, method: str, **kwargs) -> Any:
        """Invoke method on remote agent."""

        message = Message(
            id=str(uuid.uuid4()),
            source_cluster=self.router.local_cluster,
            source_agent="proxy",
            destination_cluster=self.cluster_id,
            destination_agent=self.agent_id,
            payload={
                "type": "invoke",
                "method": method,
                "args": kwargs
            },
            timestamp=datetime.utcnow().isoformat()
        )

        # Send and wait for response
        response = await self.router.send_and_wait(message, timeout=30)
        return response["result"]
```

### Event Propagation

```python
# blackroad/federation/events.py
from typing import Set, Callable
from dataclasses import dataclass

@dataclass
class FederatedEvent:
    """Event that propagates across federation."""

    id: str
    type: str
    source_cluster: str
    data: dict
    scope: str  # local, regional, global
    timestamp: str

class FederatedEventBus:
    """Event bus with federation support."""

    def __init__(self, local_bus, router):
        self.local_bus = local_bus
        self.router = router
        self.global_subscriptions: Set[str] = set()

    async def publish(self, event: FederatedEvent):
        """Publish event, potentially across clusters."""

        # Always publish locally
        await self.local_bus.publish(event)

        if event.scope == "local":
            return

        # Get target clusters
        if event.scope == "regional":
            clusters = await self.router.registry.get_regional_clusters(
                event.source_cluster
            )
        else:  # global
            clusters = await self.router.registry.get_all_clusters()

        # Propagate to other clusters
        for cluster in clusters:
            if cluster["id"] != event.source_cluster:
                await self._propagate_to_cluster(event, cluster["id"])

    async def subscribe_global(self, event_pattern: str, handler: Callable):
        """Subscribe to events from any cluster."""
        self.global_subscriptions.add(event_pattern)
        await self.local_bus.subscribe(event_pattern, handler)

    async def receive_remote_event(self, event: FederatedEvent):
        """Receive event from remote cluster."""
        # Re-publish locally for subscribers
        await self.local_bus.publish(event)
```

---

## Data Replication

### Replication Strategy

```yaml
# config/replication.yaml
replication:
  # Memory layer replication
  memory:
    working:
      strategy: local_only
      # Working memory stays local

    episodic:
      strategy: async_replicate
      replicas: 2
      regions:
        - same_region: 1
        - any_region: 1
      max_lag_seconds: 60

    semantic:
      strategy: sync_replicate
      replicas: 3
      consistency: eventual
      conflict_resolution: last_write_wins

    archival:
      strategy: geo_replicate
      replicas: 3
      regions:
        - us-west
        - eu-west
        - asia-pacific
      consistency: strong

  # Agent state replication
  agent_state:
    strategy: leader_follower
    replicas: 2
    failover_timeout_ms: 5000
```

### Replication Engine

```python
# blackroad/federation/replication.py
from enum import Enum
from dataclasses import dataclass
from typing import List, Optional
import asyncio

class ReplicationStrategy(Enum):
    LOCAL_ONLY = "local_only"
    ASYNC_REPLICATE = "async_replicate"
    SYNC_REPLICATE = "sync_replicate"
    GEO_REPLICATE = "geo_replicate"

@dataclass
class ReplicationConfig:
    strategy: ReplicationStrategy
    replicas: int
    regions: List[str]
    consistency: str
    max_lag_seconds: int

class ReplicationEngine:
    """Handle data replication across clusters."""

    def __init__(self, config: dict, mesh):
        self.config = config
        self.mesh = mesh

    async def replicate(
        self,
        data_type: str,
        key: str,
        value: bytes,
        config: ReplicationConfig
    ):
        """Replicate data according to strategy."""

        if config.strategy == ReplicationStrategy.LOCAL_ONLY:
            return  # No replication

        elif config.strategy == ReplicationStrategy.ASYNC_REPLICATE:
            asyncio.create_task(
                self._async_replicate(data_type, key, value, config)
            )

        elif config.strategy == ReplicationStrategy.SYNC_REPLICATE:
            await self._sync_replicate(data_type, key, value, config)

        elif config.strategy == ReplicationStrategy.GEO_REPLICATE:
            await self._geo_replicate(data_type, key, value, config)

    async def _async_replicate(
        self,
        data_type: str,
        key: str,
        value: bytes,
        config: ReplicationConfig
    ):
        """Asynchronous replication."""
        target_clusters = await self._select_replica_clusters(config)

        tasks = [
            self._send_to_cluster(cluster, data_type, key, value)
            for cluster in target_clusters
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Log failures but don't block
        for cluster, result in zip(target_clusters, results):
            if isinstance(result, Exception):
                self.logger.warning(f"Async replication to {cluster} failed: {result}")

    async def _sync_replicate(
        self,
        data_type: str,
        key: str,
        value: bytes,
        config: ReplicationConfig
    ):
        """Synchronous replication with quorum."""
        target_clusters = await self._select_replica_clusters(config)

        tasks = [
            self._send_to_cluster(cluster, data_type, key, value)
            for cluster in target_clusters
        ]

        # Wait for quorum
        quorum = (config.replicas // 2) + 1
        done, pending = await asyncio.wait(
            tasks,
            return_when=asyncio.FIRST_COMPLETED
        )

        success_count = sum(1 for d in done if not d.exception())

        if success_count >= quorum:
            return

        # Wait for more if needed
        while success_count < quorum and pending:
            done_more, pending = await asyncio.wait(
                pending,
                return_when=asyncio.FIRST_COMPLETED
            )
            success_count += sum(1 for d in done_more if not d.exception())

        if success_count < quorum:
            raise ReplicationError(f"Failed to achieve quorum ({success_count}/{quorum})")
```

### Conflict Resolution

```python
# blackroad/federation/conflict.py
from dataclasses import dataclass
from typing import Any, List
from enum import Enum

class ConflictStrategy(Enum):
    LAST_WRITE_WINS = "last_write_wins"
    FIRST_WRITE_WINS = "first_write_wins"
    MERGE = "merge"
    CUSTOM = "custom"

@dataclass
class ConflictingWrite:
    cluster: str
    timestamp: str
    value: Any
    vector_clock: dict

class ConflictResolver:
    """Resolve replication conflicts."""

    def __init__(self, strategy: ConflictStrategy):
        self.strategy = strategy

    def resolve(self, writes: List[ConflictingWrite]) -> Any:
        """Resolve conflicting writes."""

        if self.strategy == ConflictStrategy.LAST_WRITE_WINS:
            return max(writes, key=lambda w: w.timestamp).value

        elif self.strategy == ConflictStrategy.FIRST_WRITE_WINS:
            return min(writes, key=lambda w: w.timestamp).value

        elif self.strategy == ConflictStrategy.MERGE:
            return self._merge_values([w.value for w in writes])

        else:
            raise ValueError(f"Unknown strategy: {self.strategy}")

    def _merge_values(self, values: List[Any]) -> Any:
        """Merge conflicting values."""
        if all(isinstance(v, dict) for v in values):
            # Deep merge dictionaries
            result = {}
            for v in values:
                self._deep_merge(result, v)
            return result
        elif all(isinstance(v, list) for v in values):
            # Union of lists
            return list(set().union(*values))
        else:
            # Fall back to last write
            return values[-1]
```

---

## Failover & HA

### Cluster Failover

```python
# blackroad/federation/failover.py
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum
import asyncio

class ClusterHealth(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    OFFLINE = "offline"

@dataclass
class FailoverPlan:
    failed_cluster: str
    target_clusters: List[str]
    agents_to_migrate: List[str]
    estimated_time_seconds: int

class FailoverManager:
    """Manage cluster failover."""

    def __init__(self, registry, scheduler, migrator):
        self.registry = registry
        self.scheduler = scheduler
        self.migrator = migrator
        self.failover_in_progress = {}

    async def monitor_clusters(self):
        """Continuously monitor cluster health."""
        while True:
            clusters = await self.registry.get_clusters()

            for cluster in clusters:
                health = await self.check_cluster_health(cluster["id"])

                if health == ClusterHealth.OFFLINE:
                    if cluster["id"] not in self.failover_in_progress:
                        await self.initiate_failover(cluster["id"])

                elif health == ClusterHealth.HEALTHY:
                    if cluster["id"] in self.failover_in_progress:
                        await self.complete_recovery(cluster["id"])

            await asyncio.sleep(10)

    async def check_cluster_health(self, cluster_id: str) -> ClusterHealth:
        """Check health of a cluster."""
        try:
            # Multiple health checks
            checks = await asyncio.gather(
                self._check_control_plane(cluster_id),
                self._check_agents(cluster_id),
                self._check_network(cluster_id),
                return_exceptions=True
            )

            failures = sum(1 for c in checks if isinstance(c, Exception) or not c)

            if failures == 0:
                return ClusterHealth.HEALTHY
            elif failures == 1:
                return ClusterHealth.DEGRADED
            elif failures == 2:
                return ClusterHealth.UNHEALTHY
            else:
                return ClusterHealth.OFFLINE

        except Exception:
            return ClusterHealth.OFFLINE

    async def initiate_failover(self, failed_cluster: str):
        """Initiate failover for a failed cluster."""

        self.logger.warning(f"Initiating failover for cluster: {failed_cluster}")

        # Get agents in failed cluster
        agents = await self.registry.get_agents_in_cluster(failed_cluster)

        # Create failover plan
        plan = await self.create_failover_plan(failed_cluster, agents)
        self.failover_in_progress[failed_cluster] = plan

        # Execute failover
        for agent_id in plan.agents_to_migrate:
            # Find best target cluster
            target = await self.scheduler.schedule_agent(
                agent_id,
                constraints=SchedulingConstraints(
                    excluded_clusters=[failed_cluster]
                )
            )

            # Restore agent from last checkpoint
            await self.restore_agent_from_checkpoint(agent_id, target)

        self.logger.info(f"Failover complete: {len(agents)} agents migrated")

    async def restore_agent_from_checkpoint(
        self,
        agent_id: str,
        target_cluster: str
    ):
        """Restore agent from replicated checkpoint."""

        # Get latest checkpoint from replicas
        checkpoint = await self.get_latest_checkpoint(agent_id)

        if not checkpoint:
            self.logger.error(f"No checkpoint found for agent {agent_id}")
            return

        # Spawn agent on target cluster
        await self.registry.spawn_agent(
            agent_id=agent_id,
            cluster_id=target_cluster,
            state=checkpoint["state"],
            config=checkpoint["config"]
        )
```

### Leader Election

```python
# blackroad/federation/election.py
import asyncio
import random
from typing import Optional

class LeaderElection:
    """Raft-based leader election for federation control plane."""

    def __init__(self, node_id: str, peers: List[str], etcd):
        self.node_id = node_id
        self.peers = peers
        self.etcd = etcd

        self.state = "follower"
        self.current_term = 0
        self.voted_for = None
        self.leader_id = None

        self.election_timeout = random.uniform(150, 300)  # ms
        self.heartbeat_interval = 50  # ms

    async def run(self):
        """Run election loop."""
        while True:
            if self.state == "follower":
                await self._run_follower()
            elif self.state == "candidate":
                await self._run_candidate()
            elif self.state == "leader":
                await self._run_leader()

    async def _run_follower(self):
        """Follower state: wait for heartbeat or timeout."""
        try:
            await asyncio.wait_for(
                self._wait_for_heartbeat(),
                timeout=self.election_timeout / 1000
            )
        except asyncio.TimeoutError:
            # No heartbeat received, become candidate
            self.state = "candidate"

    async def _run_candidate(self):
        """Candidate state: request votes."""
        self.current_term += 1
        self.voted_for = self.node_id

        votes = 1  # Vote for self

        # Request votes from peers
        tasks = [self._request_vote(peer) for peer in self.peers]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        votes += sum(1 for r in results if r is True)

        if votes > len(self.peers) // 2:
            # Won election
            self.state = "leader"
            self.leader_id = self.node_id
            await self._announce_leadership()
        else:
            # Lost election, back to follower
            self.state = "follower"

    async def _run_leader(self):
        """Leader state: send heartbeats."""
        await self._send_heartbeats()
        await asyncio.sleep(self.heartbeat_interval / 1000)
```

---

## Security

### Cross-Cluster Authentication

```python
# blackroad/federation/auth.py
import jwt
from cryptography.hazmat.primitives.asymmetric import ed25519
from datetime import datetime, timedelta

class ClusterAuthenticator:
    """Authenticate clusters in federation."""

    def __init__(self, private_key: bytes, trusted_keys: dict):
        self.private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_key)
        self.public_key = self.private_key.public_key()
        self.trusted_keys = trusted_keys  # cluster_id -> public_key

    def create_cluster_token(self, cluster_id: str, ttl_minutes: int = 60) -> str:
        """Create signed token for cluster authentication."""
        payload = {
            "sub": cluster_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=ttl_minutes),
            "iss": "blackroad-federation"
        }

        return jwt.encode(
            payload,
            self.private_key,
            algorithm="EdDSA"
        )

    def verify_cluster_token(self, token: str, expected_cluster: str) -> bool:
        """Verify cluster token."""
        try:
            # Get cluster's public key
            public_key = self.trusted_keys.get(expected_cluster)
            if not public_key:
                return False

            payload = jwt.decode(
                token,
                public_key,
                algorithms=["EdDSA"]
            )

            return payload["sub"] == expected_cluster

        except jwt.InvalidTokenError:
            return False
```

### mTLS Configuration

```yaml
# config/mtls.yaml
tls:
  # Federation CA
  ca:
    cert: /etc/blackroad/ca.crt
    key: /etc/blackroad/ca.key

  # Cluster certificates
  cluster:
    cert: /etc/blackroad/cluster.crt
    key: /etc/blackroad/cluster.key

  # Verify peers
  verify_peer: true
  verify_hostname: true

  # Certificate rotation
  rotation:
    enabled: true
    check_interval: 24h
    renew_before_expiry: 7d
```

---

## Monitoring

### Federation Metrics

```python
# blackroad/federation/metrics.py
from prometheus_client import Counter, Gauge, Histogram

# Cluster metrics
clusters_total = Gauge(
    "blackroad_federation_clusters_total",
    "Total number of clusters"
)

cluster_health = Gauge(
    "blackroad_federation_cluster_health",
    "Cluster health status (0=offline, 1=unhealthy, 2=degraded, 3=healthy)",
    ["cluster_id", "region"]
)

cluster_agents = Gauge(
    "blackroad_federation_cluster_agents",
    "Number of agents per cluster",
    ["cluster_id"]
)

# Cross-cluster metrics
cross_cluster_messages = Counter(
    "blackroad_federation_messages_total",
    "Cross-cluster messages",
    ["source_cluster", "destination_cluster", "status"]
)

cross_cluster_latency = Histogram(
    "blackroad_federation_latency_seconds",
    "Cross-cluster message latency",
    ["source_cluster", "destination_cluster"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
)

# Replication metrics
replication_lag = Gauge(
    "blackroad_federation_replication_lag_seconds",
    "Replication lag between clusters",
    ["source_cluster", "destination_cluster"]
)

# Migration metrics
migrations_total = Counter(
    "blackroad_federation_migrations_total",
    "Agent migrations",
    ["source_cluster", "destination_cluster", "status"]
)

migration_duration = Histogram(
    "blackroad_federation_migration_duration_seconds",
    "Migration duration",
    ["migration_type"]  # live, cold
)
```

### Federation Dashboard

```yaml
# dashboards/federation.yaml
dashboard:
  title: "BlackRoad Federation Overview"

  panels:
    - title: "Cluster Map"
      type: geomap
      query: |
        blackroad_federation_cluster_health{} * on(cluster_id)
        group_left(latitude, longitude) blackroad_cluster_location{}

    - title: "Agents by Cluster"
      type: piechart
      query: sum by (cluster_id) (blackroad_federation_cluster_agents{})

    - title: "Cross-Cluster Latency"
      type: heatmap
      query: |
        histogram_quantile(0.99,
          sum by (source_cluster, destination_cluster, le) (
            rate(blackroad_federation_latency_seconds_bucket{}[5m])
          )
        )

    - title: "Replication Lag"
      type: timeseries
      query: blackroad_federation_replication_lag_seconds{}
      thresholds:
        - value: 60
          color: yellow
        - value: 300
          color: red
```

---

## Operations

### CLI Commands

```bash
# Federation management
blackroad federation status
blackroad federation list-clusters
blackroad federation add-cluster <name> --region <region>
blackroad federation remove-cluster <name>

# Cluster operations
blackroad cluster drain <name>        # Stop scheduling, migrate agents
blackroad cluster cordon <name>       # Stop scheduling
blackroad cluster uncordon <name>     # Resume scheduling

# Agent operations
blackroad agent migrate <id> --to <cluster>
blackroad agent list --cluster <name>

# Replication
blackroad replication status
blackroad replication force-sync --cluster <name>

# Failover
blackroad failover simulate --cluster <name>
blackroad failover status
```

### Runbooks

```markdown
## Cluster Failure Runbook

### Symptoms
- Cluster health shows OFFLINE
- Agents in cluster unreachable
- Cross-cluster latency spikes

### Response Steps

1. **Verify failure**
   ```bash
   blackroad federation status
   blackroad cluster health <cluster-name>
   ```

2. **Check if automatic failover triggered**
   ```bash
   blackroad failover status
   ```

3. **If manual intervention needed**
   ```bash
   # Drain failed cluster
   blackroad cluster drain <cluster-name>

   # Force agent migration
   blackroad agent migrate --from <cluster> --all
   ```

4. **Verify agent recovery**
   ```bash
   blackroad agent list --status running
   ```

5. **Post-incident**
   - Review logs for root cause
   - Update monitoring thresholds if needed
   - Document in incident report
```

---

## Quick Reference

### Federation Topology

| Type | Description | Use Case |
|------|-------------|----------|
| **Primary** | Full-featured cluster | Production workloads |
| **Secondary** | Read replicas | Geographic distribution |
| **Edge** | Lightweight nodes | IoT, low-latency |

### Replication Strategies

| Strategy | Consistency | Latency | Use Case |
|----------|-------------|---------|----------|
| local_only | N/A | Lowest | Temporary data |
| async | Eventual | Low | Most data |
| sync | Strong | Medium | Critical data |
| geo | Strong | High | Compliance |

---

## Related Documentation

- [SCALING.md](SCALING.md) - Scaling guide
- [INFRASTRUCTURE.md](INFRASTRUCTURE.md) - Infrastructure setup
- [MONITORING.md](MONITORING.md) - Observability
- [SECURITY.md](SECURITY.md) - Security practices
- [AGENTS.md](AGENTS.md) - Agent configuration

---

*Your AI. Your Hardware. Your Rules.*
