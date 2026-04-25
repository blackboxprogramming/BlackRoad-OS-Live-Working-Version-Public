# BlackRoad OS Performance Guide

> Optimize BlackRoad OS for maximum throughput and minimal latency

---

## Table of Contents

- [Overview](#overview)
- [Performance Targets](#performance-targets)
- [Profiling](#profiling)
- [Agent Optimization](#agent-optimization)
- [Memory Optimization](#memory-optimization)
- [API Optimization](#api-optimization)
- [Database Optimization](#database-optimization)
- [Network Optimization](#network-optimization)
- [Caching Strategies](#caching-strategies)
- [Resource Management](#resource-management)
- [Benchmarking](#benchmarking)

---

## Overview

Performance is critical for BlackRoad OS to handle **30,000 concurrent agents** efficiently. This guide covers optimization strategies across all system components.

### Performance Philosophy

1. **Measure First** - Profile before optimizing
2. **Optimize Bottlenecks** - Focus on the slowest parts
3. **Trade-offs** - Balance speed, memory, and cost
4. **Monitor Continuously** - Performance degrades over time

### Key Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| API Latency (P50) | <50ms | <200ms |
| API Latency (P99) | <200ms | <1s |
| Agent Response | <500ms | <2s |
| Memory Search | <100ms | <500ms |
| Task Throughput | >1000/min | >100/min |
| Error Rate | <0.1% | <1% |

---

## Performance Targets

### By Component

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE TARGETS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Component          P50        P95        P99        Max        │
│  ---------          ---        ---        ---        ---        │
│  API Gateway        10ms       50ms       100ms      500ms      │
│  Agent Router       20ms       100ms      200ms      1s         │
│  Memory (Working)   5ms        20ms       50ms       100ms      │
│  Memory (Semantic)  50ms       150ms      300ms      1s         │
│  Task Queue         10ms       50ms       100ms      500ms      │
│  LLM Inference      500ms      2s         5s         30s        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### By Scale

| Agents | Tasks/min | Memory Ops/s | API Requests/s |
|--------|-----------|--------------|----------------|
| 100 | 500 | 1,000 | 100 |
| 1,000 | 2,000 | 5,000 | 500 |
| 10,000 | 10,000 | 20,000 | 2,000 |
| 30,000 | 30,000 | 50,000 | 5,000 |

---

## Profiling

### Python Profiling

```python
# CPU Profiling with cProfile
import cProfile
import pstats
from pstats import SortKey

def profile_function(func):
    """Decorator to profile a function."""
    def wrapper(*args, **kwargs):
        profiler = cProfile.Profile()
        profiler.enable()
        result = func(*args, **kwargs)
        profiler.disable()

        stats = pstats.Stats(profiler)
        stats.sort_stats(SortKey.CUMULATIVE)
        stats.print_stats(20)

        return result
    return wrapper

@profile_function
def expensive_operation():
    # Your code here
    pass
```

```python
# Memory Profiling with memory_profiler
from memory_profiler import profile

@profile
def memory_intensive_function():
    data = []
    for i in range(1000000):
        data.append(i * 2)
    return data
```

```python
# Line-by-line profiling
from line_profiler import LineProfiler

def profile_lines(func):
    profiler = LineProfiler()
    profiler.add_function(func)
    profiler.enable_by_count()
    result = func()
    profiler.print_stats()
    return result
```

### Async Profiling

```python
# Profiling async code
import asyncio
import time

class AsyncProfiler:
    def __init__(self):
        self.timings = {}

    async def profile(self, name: str, coro):
        start = time.perf_counter()
        result = await coro
        duration = time.perf_counter() - start

        if name not in self.timings:
            self.timings[name] = []
        self.timings[name].append(duration)

        return result

    def report(self):
        for name, times in self.timings.items():
            avg = sum(times) / len(times)
            p95 = sorted(times)[int(len(times) * 0.95)]
            print(f"{name}: avg={avg:.3f}s, p95={p95:.3f}s")

# Usage
profiler = AsyncProfiler()
result = await profiler.profile("agent_task", agent.execute(task))
```

### Request Tracing

```python
# Trace requests through the system
import uuid
from contextvars import ContextVar

trace_id: ContextVar[str] = ContextVar('trace_id')

class RequestTracer:
    def __init__(self):
        self.spans = {}

    def start_span(self, name: str) -> str:
        span_id = str(uuid.uuid4())[:8]
        self.spans[span_id] = {
            "name": name,
            "trace_id": trace_id.get(),
            "start": time.perf_counter(),
            "children": []
        }
        return span_id

    def end_span(self, span_id: str):
        span = self.spans[span_id]
        span["duration"] = time.perf_counter() - span["start"]
        return span
```

### CLI Profiling

```bash
# Profile a command
time ./wake.sh llama3.2 ALICE

# Detailed timing
./status.sh --timing

# Memory usage
/usr/bin/time -v ./boot.sh

# System-wide profiling
htop
```

---

## Agent Optimization

### Efficient Agent Initialization

```python
# Bad: Create new agent for each request
async def handle_request(request):
    agent = Agent(config)  # Expensive!
    await agent.wake()
    result = await agent.process(request)
    await agent.shutdown()
    return result

# Good: Use agent pool
class AgentPool:
    def __init__(self, size: int = 10):
        self.pool = asyncio.Queue(maxsize=size)
        self.size = size

    async def initialize(self):
        for _ in range(self.size):
            agent = Agent(config)
            await agent.wake()
            await self.pool.put(agent)

    async def acquire(self) -> Agent:
        return await self.pool.get()

    async def release(self, agent: Agent):
        await self.pool.put(agent)

# Usage
pool = AgentPool(size=20)
await pool.initialize()

agent = await pool.acquire()
try:
    result = await agent.process(request)
finally:
    await pool.release(agent)
```

### Batch Processing

```python
# Bad: Process one at a time
for task in tasks:
    result = await agent.process(task)
    results.append(result)

# Good: Batch processing
async def process_batch(agent, tasks, batch_size=10):
    results = []
    for i in range(0, len(tasks), batch_size):
        batch = tasks[i:i + batch_size]
        batch_results = await asyncio.gather(
            *[agent.process(task) for task in batch]
        )
        results.extend(batch_results)
    return results
```

### Lazy Loading

```python
class Agent:
    def __init__(self, config):
        self.config = config
        self._model = None
        self._memory = None

    @property
    def model(self):
        """Lazy load model only when needed."""
        if self._model is None:
            self._model = self._load_model()
        return self._model

    @property
    def memory(self):
        """Lazy load memory connection."""
        if self._memory is None:
            self._memory = Memory()
        return self._memory
```

### Context Window Management

```python
# Manage context to avoid token overflow
class ContextManager:
    def __init__(self, max_tokens: int = 4096):
        self.max_tokens = max_tokens
        self.messages = []

    def add_message(self, message: dict):
        self.messages.append(message)
        self._trim_if_needed()

    def _trim_if_needed(self):
        """Remove old messages if context too large."""
        total_tokens = self._count_tokens()
        while total_tokens > self.max_tokens and len(self.messages) > 1:
            # Keep system message, remove oldest user/assistant
            if self.messages[0].get("role") == "system":
                self.messages.pop(1)
            else:
                self.messages.pop(0)
            total_tokens = self._count_tokens()

    def _count_tokens(self) -> int:
        # Approximate: 4 chars per token
        return sum(len(m.get("content", "")) // 4 for m in self.messages)
```

---

## Memory Optimization

### Connection Pooling

```python
# Redis connection pool
import redis.asyncio as redis

class RedisPool:
    _pool = None

    @classmethod
    async def get_pool(cls):
        if cls._pool is None:
            cls._pool = redis.ConnectionPool(
                host='localhost',
                port=6379,
                max_connections=100,
                decode_responses=True
            )
        return cls._pool

    @classmethod
    async def get_connection(cls):
        pool = await cls.get_pool()
        return redis.Redis(connection_pool=pool)
```

### Efficient Serialization

```python
# Use msgpack instead of JSON for speed
import msgpack

class FastSerializer:
    @staticmethod
    def serialize(data) -> bytes:
        return msgpack.packb(data, use_bin_type=True)

    @staticmethod
    def deserialize(data: bytes):
        return msgpack.unpackb(data, raw=False)

# Benchmark: msgpack is 2-10x faster than JSON
```

### Memory-Efficient Data Structures

```python
# Use __slots__ to reduce memory
class Memory:
    __slots__ = ['key', 'value', 'timestamp', 'tier']

    def __init__(self, key, value, timestamp, tier):
        self.key = key
        self.value = value
        self.timestamp = timestamp
        self.tier = tier

# Use generators for large datasets
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield process_line(line)

# Use numpy for numerical data
import numpy as np
embeddings = np.array(vectors, dtype=np.float32)  # Half the memory of float64
```

### Caching Embeddings

```python
from functools import lru_cache
import hashlib

class EmbeddingCache:
    def __init__(self, max_size: int = 10000):
        self.cache = {}
        self.max_size = max_size

    def get_embedding(self, text: str) -> list:
        key = hashlib.md5(text.encode()).hexdigest()

        if key in self.cache:
            return self.cache[key]

        embedding = self._compute_embedding(text)

        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest = next(iter(self.cache))
            del self.cache[oldest]

        self.cache[key] = embedding
        return embedding
```

---

## API Optimization

### Request Batching

```python
# Batch multiple requests
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class BatchRequest(BaseModel):
    requests: List[dict]

@app.post("/v1/batch")
async def batch_endpoint(batch: BatchRequest):
    # Process all requests concurrently
    results = await asyncio.gather(
        *[process_request(req) for req in batch.requests]
    )
    return {"results": results}
```

### Response Compression

```python
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Async All The Way

```python
# Bad: Blocking in async context
@app.get("/data")
async def get_data():
    data = requests.get(url)  # Blocks!
    return data.json()

# Good: Use async HTTP client
import aiohttp

@app.get("/data")
async def get_data():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()
```

### Rate Limiting

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import time

class RateLimiter:
    def __init__(self, requests_per_minute: int = 100):
        self.rpm = requests_per_minute
        self.requests = {}

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        minute = int(now / 60)

        key = f"{client_id}:{minute}"
        self.requests[key] = self.requests.get(key, 0) + 1

        # Cleanup old entries
        self._cleanup(minute)

        return self.requests[key] <= self.rpm

limiter = RateLimiter(requests_per_minute=100)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_id = request.client.host

    if not limiter.is_allowed(client_id):
        return JSONResponse(
            status_code=429,
            content={"error": "Rate limit exceeded"}
        )

    return await call_next(request)
```

---

## Database Optimization

### Query Optimization

```python
# Bad: N+1 queries
users = await db.query("SELECT * FROM users")
for user in users:
    tasks = await db.query(
        "SELECT * FROM tasks WHERE user_id = $1",
        [user['id']]
    )

# Good: Single query with JOIN
users_with_tasks = await db.query("""
    SELECT u.*, json_agg(t.*) as tasks
    FROM users u
    LEFT JOIN tasks t ON t.user_id = u.id
    GROUP BY u.id
""")
```

### Indexing Strategy

```sql
-- Essential indexes for BlackRoad
CREATE INDEX idx_tasks_agent ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created ON tasks(created_at);
CREATE INDEX idx_tasks_agent_status ON tasks(agent_id, status);

-- Partial indexes for common queries
CREATE INDEX idx_tasks_pending ON tasks(agent_id)
    WHERE status = 'pending';

-- Expression indexes
CREATE INDEX idx_tasks_date ON tasks(DATE(created_at));

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM tasks
    WHERE agent_id = 'agent_alice_001' AND status = 'pending';
```

### Connection Pooling

```python
# asyncpg with connection pool
import asyncpg

class Database:
    _pool = None

    @classmethod
    async def get_pool(cls):
        if cls._pool is None:
            cls._pool = await asyncpg.create_pool(
                dsn="postgresql://...",
                min_size=10,
                max_size=50,
                command_timeout=60
            )
        return cls._pool

    @classmethod
    async def query(cls, sql, *args):
        pool = await cls.get_pool()
        async with pool.acquire() as conn:
            return await conn.fetch(sql, *args)
```

### Prepared Statements

```python
# Prepare frequently used queries
async def setup_prepared_statements(conn):
    await conn.execute("""
        PREPARE get_agent_tasks AS
        SELECT * FROM tasks WHERE agent_id = $1 AND status = $2
    """)

# Use prepared statement
tasks = await conn.fetch("EXECUTE get_agent_tasks($1, $2)", agent_id, status)
```

---

## Network Optimization

### Keep-Alive Connections

```python
# Reuse HTTP connections
import aiohttp

# Create session once, reuse for all requests
connector = aiohttp.TCPConnector(
    limit=100,
    keepalive_timeout=30,
    enable_cleanup_closed=True
)
session = aiohttp.ClientSession(connector=connector)
```

### Connection Multiplexing

```python
# HTTP/2 multiplexing
import httpx

async with httpx.AsyncClient(http2=True) as client:
    # Multiple requests over single connection
    responses = await asyncio.gather(
        client.get("https://api.example.com/1"),
        client.get("https://api.example.com/2"),
        client.get("https://api.example.com/3"),
    )
```

### DNS Caching

```python
# Cache DNS lookups
import aiodns
import socket

class DNSCache:
    def __init__(self):
        self.cache = {}
        self.resolver = aiodns.DNSResolver()

    async def resolve(self, hostname: str) -> str:
        if hostname in self.cache:
            return self.cache[hostname]

        result = await self.resolver.query(hostname, 'A')
        ip = result[0].host
        self.cache[hostname] = ip
        return ip
```

---

## Caching Strategies

### Multi-Level Cache

```python
class MultiLevelCache:
    """L1: Memory, L2: Redis, L3: Database"""

    def __init__(self):
        self.l1 = {}  # In-memory
        self.l2 = redis.Redis()  # Redis
        self.l3 = Database()  # PostgreSQL

    async def get(self, key: str):
        # Try L1
        if key in self.l1:
            return self.l1[key]

        # Try L2
        value = await self.l2.get(key)
        if value:
            self.l1[key] = value
            return value

        # Try L3
        value = await self.l3.get(key)
        if value:
            await self.l2.set(key, value, ex=3600)
            self.l1[key] = value
            return value

        return None

    async def set(self, key: str, value, ttl: int = 3600):
        self.l1[key] = value
        await self.l2.set(key, value, ex=ttl)
        await self.l3.set(key, value)
```

### Cache Invalidation

```python
class CacheInvalidator:
    def __init__(self, cache):
        self.cache = cache
        self.patterns = {}

    def register_pattern(self, entity: str, pattern: str):
        """Register cache key pattern for entity."""
        self.patterns[entity] = pattern

    async def invalidate(self, entity: str, entity_id: str):
        """Invalidate all cache keys for entity."""
        pattern = self.patterns.get(entity, f"{entity}:*")
        keys = await self.cache.keys(pattern.replace("*", entity_id))
        if keys:
            await self.cache.delete(*keys)

# Usage
invalidator = CacheInvalidator(redis)
invalidator.register_pattern("user", "user:{id}:*")

# When user is updated
await invalidator.invalidate("user", user_id)
```

### Precomputation

```python
# Precompute expensive values
class PrecomputedStats:
    def __init__(self):
        self.stats = {}
        self.last_computed = None

    async def get_stats(self):
        now = datetime.now()

        # Recompute every 5 minutes
        if self.last_computed is None or \
           (now - self.last_computed).seconds > 300:
            self.stats = await self._compute_stats()
            self.last_computed = now

        return self.stats

    async def _compute_stats(self):
        return {
            "active_agents": await count_active_agents(),
            "pending_tasks": await count_pending_tasks(),
            "memory_usage": await get_memory_usage()
        }
```

---

## Resource Management

### Memory Limits

```python
import resource
import sys

def set_memory_limit(max_gb: int):
    """Limit process memory usage."""
    max_bytes = max_gb * 1024 * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_AS, (max_bytes, max_bytes))

def get_memory_usage():
    """Get current memory usage in MB."""
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024
```

### Graceful Degradation

```python
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failures = 0
        self.last_failure = None
        self.state = "closed"

    async def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure > self.reset_timeout:
                self.state = "half-open"
            else:
                raise CircuitBreakerOpen()

        try:
            result = await func(*args, **kwargs)
            if self.state == "half-open":
                self.state = "closed"
                self.failures = 0
            return result
        except Exception as e:
            self.failures += 1
            self.last_failure = time.time()
            if self.failures >= self.failure_threshold:
                self.state = "open"
            raise
```

### Worker Pool Management

```python
from concurrent.futures import ProcessPoolExecutor
import asyncio

class WorkerPool:
    def __init__(self, max_workers: int = 4):
        self.executor = ProcessPoolExecutor(max_workers=max_workers)

    async def run_cpu_bound(self, func, *args):
        """Run CPU-bound task in process pool."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, func, *args)

    def shutdown(self):
        self.executor.shutdown(wait=True)
```

---

## Benchmarking

### Load Testing

```python
# locustfile.py
from locust import HttpUser, task, between

class BlackRoadUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(10)
    def list_agents(self):
        self.client.get("/v1/agents")

    @task(5)
    def create_task(self):
        self.client.post("/v1/tasks", json={
            "title": "Benchmark task",
            "agent_id": "agent_alice_001"
        })

    @task(3)
    def search_memory(self):
        self.client.post("/v1/memory/search", json={
            "query": "test query",
            "limit": 10
        })
```

```bash
# Run load test
locust -f locustfile.py --host=http://localhost:8000 \
    --users 1000 --spawn-rate 50 --run-time 5m
```

### Micro-Benchmarks

```python
import timeit

def benchmark(func, iterations=1000):
    """Benchmark a function."""
    total = timeit.timeit(func, number=iterations)
    avg = total / iterations * 1000  # ms
    print(f"{func.__name__}: {avg:.3f}ms avg ({iterations} iterations)")

# Usage
benchmark(lambda: serialize(data))
benchmark(lambda: deserialize(serialized))
```

### Performance Dashboard

```bash
# Quick performance check
./perf.sh

# Output:
# BLACKROAD PERFORMANCE
# =====================
#
# API Latency:
#   P50: 45ms
#   P95: 120ms
#   P99: 250ms
#
# Throughput:
#   Requests/s: 1,234
#   Tasks/min: 2,500
#
# Resources:
#   CPU: 42%
#   Memory: 6.2GB / 16GB
#   Connections: 234 / 500
#
# Bottlenecks:
#   ⚠ Memory search P99 > 500ms
#   ✓ API latency within targets
```

---

## Quick Reference

### Performance Checklist

```markdown
## Before Deployment
- [ ] All queries have indexes
- [ ] Connection pools configured
- [ ] Caching enabled
- [ ] Rate limiting configured
- [ ] Memory limits set
- [ ] Load tested at 2x expected traffic

## Monitoring
- [ ] Latency alerts configured
- [ ] Error rate alerts configured
- [ ] Resource usage alerts configured
- [ ] Dashboards set up

## Optimization
- [ ] Profiled hot paths
- [ ] Batching where possible
- [ ] Async everywhere
- [ ] Compression enabled
```

### Common Optimizations

| Problem | Solution |
|---------|----------|
| Slow queries | Add indexes, optimize SQL |
| High memory | Use streaming, generators |
| Connection exhaustion | Connection pooling |
| Slow API | Caching, batching |
| CPU bound | Worker processes |
| Network latency | Keep-alive, HTTP/2 |

---

*Last updated: 2026-02-05*
