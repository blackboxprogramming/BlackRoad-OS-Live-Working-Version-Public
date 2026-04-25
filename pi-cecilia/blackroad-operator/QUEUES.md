# QUEUES.md - Job Processing & Message Queues

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Distributed task processing for 30K concurrent agents.

---

## Table of Contents

1. [Overview](#overview)
2. [Queue Architecture](#queue-architecture)
3. [Task Queues](#task-queues)
4. [Priority Queues](#priority-queues)
5. [Delayed Jobs](#delayed-jobs)
6. [Workers](#workers)
7. [Dead Letter Queues](#dead-letter-queues)
8. [Rate Limiting](#rate-limiting)
9. [Monitoring](#monitoring)
10. [Scaling](#scaling)

---

## Overview

### Why Message Queues?

BlackRoad OS queues enable:

| Feature | Benefit |
|---------|---------|
| **Decoupling** | Agents work independently |
| **Reliability** | Jobs survive crashes |
| **Scalability** | Add workers dynamically |
| **Priority** | Critical tasks first |
| **Scheduling** | Delayed execution |

### Queue Types

```
┌─────────────────────────────────────────────────────────────────┐
│                   BlackRoad Queue System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Task Queues                            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ Critical│ │  High   │ │ Normal  │ │   Low   │        │   │
│  │  │ (P0)    │ │  (P1)   │ │  (P2)   │ │  (P3)   │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Specialized Queues                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │  Agent  │ │ Webhook │ │  Email  │ │ Cleanup │        │   │
│  │  │  Tasks  │ │Delivery │ │  Queue  │ │  Jobs   │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Dead Letter Queues                      │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Failed jobs after max retries → manual review     │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Queue Architecture

### Redis-Based Queues

```python
# blackroad/queues/core.py
import redis.asyncio as redis
import json
import uuid
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import Optional, Any, Callable
from enum import Enum

class JobStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    DEAD = "dead"

@dataclass
class Job:
    """Queue job definition."""
    id: str
    queue: str
    name: str
    payload: dict
    priority: int = 5
    status: JobStatus = JobStatus.PENDING
    attempts: int = 0
    max_attempts: int = 3
    timeout: int = 300  # seconds
    created_at: str = ""
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None
    result: Optional[Any] = None

    def to_dict(self) -> dict:
        d = asdict(self)
        d["status"] = self.status.value
        return d

    @classmethod
    def from_dict(cls, data: dict) -> "Job":
        data["status"] = JobStatus(data["status"])
        return cls(**data)


class Queue:
    """Redis-based job queue."""

    def __init__(self, name: str, redis_client: redis.Redis):
        self.name = name
        self.redis = redis_client
        self.prefix = f"queue:{name}"

    async def enqueue(
        self,
        job_name: str,
        payload: dict,
        priority: int = 5,
        delay: int = 0,
        **options
    ) -> Job:
        """Add job to queue."""
        job = Job(
            id=str(uuid.uuid4()),
            queue=self.name,
            name=job_name,
            payload=payload,
            priority=priority,
            created_at=datetime.utcnow().isoformat(),
            **options
        )

        # Store job data
        await self.redis.hset(
            f"{self.prefix}:jobs",
            job.id,
            json.dumps(job.to_dict())
        )

        if delay > 0:
            # Add to delayed queue
            execute_at = datetime.utcnow() + timedelta(seconds=delay)
            await self.redis.zadd(
                f"{self.prefix}:delayed",
                {job.id: execute_at.timestamp()}
            )
        else:
            # Add to priority queue (lower score = higher priority)
            await self.redis.zadd(
                f"{self.prefix}:pending",
                {job.id: priority}
            )

        return job

    async def dequeue(self, timeout: int = 0) -> Optional[Job]:
        """Get next job from queue."""
        # Check for delayed jobs ready to run
        await self._promote_delayed_jobs()

        # Get highest priority job (lowest score)
        result = await self.redis.bzpopmin(
            f"{self.prefix}:pending",
            timeout=timeout
        )

        if not result:
            return None

        _, job_id, _ = result
        job_data = await self.redis.hget(f"{self.prefix}:jobs", job_id)

        if not job_data:
            return None

        job = Job.from_dict(json.loads(job_data))
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow().isoformat()
        job.attempts += 1

        # Update job data
        await self.redis.hset(
            f"{self.prefix}:jobs",
            job.id,
            json.dumps(job.to_dict())
        )

        # Add to running set with timeout
        await self.redis.zadd(
            f"{self.prefix}:running",
            {job.id: datetime.utcnow().timestamp() + job.timeout}
        )

        return job

    async def complete(self, job: Job, result: Any = None):
        """Mark job as completed."""
        job.status = JobStatus.COMPLETED
        job.completed_at = datetime.utcnow().isoformat()
        job.result = result

        # Update job data
        await self.redis.hset(
            f"{self.prefix}:jobs",
            job.id,
            json.dumps(job.to_dict())
        )

        # Remove from running
        await self.redis.zrem(f"{self.prefix}:running", job.id)

        # Add to completed (with TTL for cleanup)
        await self.redis.zadd(
            f"{self.prefix}:completed",
            {job.id: datetime.utcnow().timestamp()}
        )

    async def fail(self, job: Job, error: str):
        """Mark job as failed, possibly retry."""
        job.error = error

        if job.attempts < job.max_attempts:
            # Retry with exponential backoff
            job.status = JobStatus.RETRYING
            delay = min(2 ** job.attempts * 10, 3600)  # Max 1 hour

            await self.redis.hset(
                f"{self.prefix}:jobs",
                job.id,
                json.dumps(job.to_dict())
            )

            # Re-queue with delay
            execute_at = datetime.utcnow() + timedelta(seconds=delay)
            await self.redis.zadd(
                f"{self.prefix}:delayed",
                {job.id: execute_at.timestamp()}
            )
        else:
            # Move to dead letter queue
            job.status = JobStatus.DEAD
            await self.redis.hset(
                f"{self.prefix}:jobs",
                job.id,
                json.dumps(job.to_dict())
            )
            await self.redis.zadd(
                f"{self.prefix}:dead",
                {job.id: datetime.utcnow().timestamp()}
            )

        # Remove from running
        await self.redis.zrem(f"{self.prefix}:running", job.id)

    async def _promote_delayed_jobs(self):
        """Move ready delayed jobs to pending queue."""
        now = datetime.utcnow().timestamp()

        # Get delayed jobs ready to run
        ready = await self.redis.zrangebyscore(
            f"{self.prefix}:delayed",
            "-inf",
            now
        )

        for job_id in ready:
            # Get job priority
            job_data = await self.redis.hget(f"{self.prefix}:jobs", job_id)
            if job_data:
                job = Job.from_dict(json.loads(job_data))
                await self.redis.zadd(
                    f"{self.prefix}:pending",
                    {job_id: job.priority}
                )

            await self.redis.zrem(f"{self.prefix}:delayed", job_id)
```

---

## Task Queues

### Agent Task Queue

```python
# blackroad/queues/agent_tasks.py
from dataclasses import dataclass
from typing import Optional, List
from enum import Enum

class TaskType(Enum):
    INFERENCE = "inference"
    CODE_ANALYSIS = "code_analysis"
    MEMORY_OPERATION = "memory_operation"
    TOOL_EXECUTION = "tool_execution"
    COORDINATION = "coordination"

@dataclass
class AgentTask:
    """Task for agent execution."""
    id: str
    type: TaskType
    agent_type: str  # LUCIDIA, ALICE, etc.
    prompt: str
    context: dict
    tools: List[str]
    timeout: int = 300
    priority: int = 5

class AgentTaskQueue:
    """Queue specifically for agent tasks."""

    def __init__(self, queue_manager):
        self.queues = {
            "LUCIDIA": queue_manager.get_queue("agent:lucidia"),
            "ALICE": queue_manager.get_queue("agent:alice"),
            "OCTAVIA": queue_manager.get_queue("agent:octavia"),
            "PRISM": queue_manager.get_queue("agent:prism"),
            "ECHO": queue_manager.get_queue("agent:echo"),
            "CIPHER": queue_manager.get_queue("agent:cipher"),
        }
        self.default_queue = queue_manager.get_queue("agent:default")

    async def submit_task(
        self,
        task: AgentTask,
        agent_id: Optional[str] = None
    ) -> str:
        """Submit task to appropriate agent queue."""

        queue = self.queues.get(task.agent_type, self.default_queue)

        job = await queue.enqueue(
            job_name=f"agent_task:{task.type.value}",
            payload={
                "task_id": task.id,
                "type": task.type.value,
                "agent_type": task.agent_type,
                "prompt": task.prompt,
                "context": task.context,
                "tools": task.tools,
                "target_agent": agent_id,
            },
            priority=task.priority,
            timeout=task.timeout
        )

        return job.id

    async def get_queue_stats(self) -> dict:
        """Get stats for all agent queues."""
        stats = {}
        for agent_type, queue in self.queues.items():
            stats[agent_type] = {
                "pending": await queue.redis.zcard(f"{queue.prefix}:pending"),
                "running": await queue.redis.zcard(f"{queue.prefix}:running"),
                "delayed": await queue.redis.zcard(f"{queue.prefix}:delayed"),
            }
        return stats
```

### Batch Processing Queue

```python
# blackroad/queues/batch.py
from typing import List, Callable
import asyncio

class BatchQueue:
    """Queue with batch processing support."""

    def __init__(self, queue: Queue, batch_size: int = 100):
        self.queue = queue
        self.batch_size = batch_size

    async def enqueue_batch(
        self,
        jobs: List[dict],
        job_name: str
    ) -> List[str]:
        """Enqueue multiple jobs efficiently."""
        job_ids = []

        # Use pipeline for efficiency
        async with self.queue.redis.pipeline() as pipe:
            for job_data in jobs:
                job = Job(
                    id=str(uuid.uuid4()),
                    queue=self.queue.name,
                    name=job_name,
                    payload=job_data,
                    created_at=datetime.utcnow().isoformat()
                )

                pipe.hset(
                    f"{self.queue.prefix}:jobs",
                    job.id,
                    json.dumps(job.to_dict())
                )
                pipe.zadd(
                    f"{self.queue.prefix}:pending",
                    {job.id: job.priority}
                )
                job_ids.append(job.id)

            await pipe.execute()

        return job_ids

    async def process_batch(
        self,
        processor: Callable[[List[Job]], List[Any]]
    ):
        """Process jobs in batches."""
        batch = []

        while True:
            job = await self.queue.dequeue(timeout=1)

            if job:
                batch.append(job)

            if len(batch) >= self.batch_size or (batch and not job):
                # Process batch
                try:
                    results = await processor(batch)
                    for job, result in zip(batch, results):
                        await self.queue.complete(job, result)
                except Exception as e:
                    for job in batch:
                        await self.queue.fail(job, str(e))

                batch = []
```

---

## Priority Queues

### Priority System

```python
# blackroad/queues/priority.py
from enum import IntEnum
from typing import Optional

class Priority(IntEnum):
    """Job priority levels."""
    CRITICAL = 0    # System-critical, immediate
    HIGH = 1        # User-facing, urgent
    NORMAL = 5      # Standard tasks
    LOW = 8         # Background tasks
    BULK = 10       # Batch processing

class PriorityQueue:
    """Multi-priority queue with fair scheduling."""

    def __init__(self, redis_client):
        self.redis = redis_client
        self.priority_weights = {
            Priority.CRITICAL: 10,
            Priority.HIGH: 5,
            Priority.NORMAL: 2,
            Priority.LOW: 1,
            Priority.BULK: 0.5,
        }

    async def enqueue(
        self,
        job_name: str,
        payload: dict,
        priority: Priority = Priority.NORMAL
    ) -> Job:
        """Enqueue with priority."""
        queue_name = f"priority:{priority.name.lower()}"
        queue = Queue(queue_name, self.redis)
        return await queue.enqueue(job_name, payload, priority=priority.value)

    async def dequeue_fair(self, timeout: int = 0) -> Optional[Job]:
        """Fair dequeue considering priority weights."""
        import random

        # Weight-based queue selection
        queues = []
        weights = []

        for priority in Priority:
            queue = Queue(f"priority:{priority.name.lower()}", self.redis)
            pending = await self.redis.zcard(f"{queue.prefix}:pending")
            if pending > 0:
                queues.append(queue)
                weights.append(self.priority_weights[priority])

        if not queues:
            # Block wait on all queues
            return await self._blocking_dequeue(timeout)

        # Weighted random selection
        total = sum(weights)
        r = random.uniform(0, total)
        cumulative = 0

        for queue, weight in zip(queues, weights):
            cumulative += weight
            if r <= cumulative:
                return await queue.dequeue(timeout=0)

        return await queues[0].dequeue(timeout=0)

    async def _blocking_dequeue(self, timeout: int) -> Optional[Job]:
        """Block on multiple priority queues."""
        keys = [f"queue:priority:{p.name.lower()}:pending" for p in Priority]

        result = await self.redis.bzpopmin(keys, timeout=timeout)
        if not result:
            return None

        queue_key, job_id, _ = result
        queue_name = queue_key.decode().split(":")[1]
        queue = Queue(queue_name, self.redis)

        job_data = await self.redis.hget(f"{queue.prefix}:jobs", job_id)
        if job_data:
            return Job.from_dict(json.loads(job_data))

        return None
```

### Priority Escalation

```python
# blackroad/queues/escalation.py
import asyncio
from datetime import datetime, timedelta

class PriorityEscalator:
    """Automatically escalate priority of aging jobs."""

    def __init__(self, redis_client, config: dict):
        self.redis = redis_client
        self.config = config
        self.escalation_rules = config.get("escalation_rules", {
            Priority.LOW: {"after_minutes": 30, "to": Priority.NORMAL},
            Priority.NORMAL: {"after_minutes": 15, "to": Priority.HIGH},
            Priority.HIGH: {"after_minutes": 5, "to": Priority.CRITICAL},
        })

    async def run_escalation_loop(self):
        """Continuously check and escalate jobs."""
        while True:
            await self.escalate_aging_jobs()
            await asyncio.sleep(60)  # Check every minute

    async def escalate_aging_jobs(self):
        """Escalate jobs that have been waiting too long."""
        for priority, rule in self.escalation_rules.items():
            queue = Queue(f"priority:{priority.name.lower()}", self.redis)
            cutoff = datetime.utcnow() - timedelta(minutes=rule["after_minutes"])

            # Get old jobs
            old_jobs = await self.redis.zrangebyscore(
                f"{queue.prefix}:pending",
                "-inf",
                cutoff.timestamp()
            )

            for job_id in old_jobs:
                await self._escalate_job(job_id, priority, rule["to"])

    async def _escalate_job(
        self,
        job_id: str,
        from_priority: Priority,
        to_priority: Priority
    ):
        """Move job to higher priority queue."""
        from_queue = Queue(f"priority:{from_priority.name.lower()}", self.redis)
        to_queue = Queue(f"priority:{to_priority.name.lower()}", self.redis)

        # Get job data
        job_data = await self.redis.hget(f"{from_queue.prefix}:jobs", job_id)
        if not job_data:
            return

        job = Job.from_dict(json.loads(job_data))
        job.priority = to_priority.value

        # Move to new queue
        await self.redis.zrem(f"{from_queue.prefix}:pending", job_id)
        await self.redis.zadd(
            f"{to_queue.prefix}:pending",
            {job_id: to_priority.value}
        )

        # Update job data
        await self.redis.hset(
            f"{to_queue.prefix}:jobs",
            job_id,
            json.dumps(job.to_dict())
        )

        logger.info(f"Escalated job {job_id} from {from_priority} to {to_priority}")
```

---

## Delayed Jobs

### Scheduler

```python
# blackroad/queues/scheduler.py
from datetime import datetime, timedelta
from typing import Optional
import croniter

class JobScheduler:
    """Schedule jobs for future execution."""

    def __init__(self, queue_manager):
        self.queue_manager = queue_manager
        self.schedules = {}  # job_id -> schedule_config

    async def schedule_once(
        self,
        queue_name: str,
        job_name: str,
        payload: dict,
        run_at: datetime,
        **options
    ) -> str:
        """Schedule job to run once at specific time."""
        queue = self.queue_manager.get_queue(queue_name)
        delay = (run_at - datetime.utcnow()).total_seconds()

        if delay < 0:
            delay = 0

        job = await queue.enqueue(
            job_name=job_name,
            payload=payload,
            delay=int(delay),
            **options
        )

        return job.id

    async def schedule_recurring(
        self,
        queue_name: str,
        job_name: str,
        payload: dict,
        cron: str,
        **options
    ) -> str:
        """Schedule recurring job with cron expression."""
        schedule_id = str(uuid.uuid4())

        self.schedules[schedule_id] = {
            "queue_name": queue_name,
            "job_name": job_name,
            "payload": payload,
            "cron": cron,
            "options": options,
            "enabled": True,
            "last_run": None,
            "next_run": self._get_next_cron_time(cron)
        }

        # Store in Redis for persistence
        await self.queue_manager.redis.hset(
            "schedules",
            schedule_id,
            json.dumps(self.schedules[schedule_id], default=str)
        )

        return schedule_id

    async def run_scheduler_loop(self):
        """Main scheduler loop."""
        while True:
            now = datetime.utcnow()

            for schedule_id, config in list(self.schedules.items()):
                if not config["enabled"]:
                    continue

                if config["next_run"] <= now:
                    # Enqueue the job
                    queue = self.queue_manager.get_queue(config["queue_name"])
                    await queue.enqueue(
                        job_name=config["job_name"],
                        payload=config["payload"],
                        **config["options"]
                    )

                    # Update schedule
                    config["last_run"] = now
                    config["next_run"] = self._get_next_cron_time(config["cron"])

                    await self.queue_manager.redis.hset(
                        "schedules",
                        schedule_id,
                        json.dumps(config, default=str)
                    )

            await asyncio.sleep(1)

    def _get_next_cron_time(self, cron_expr: str) -> datetime:
        """Get next run time for cron expression."""
        cron = croniter.croniter(cron_expr, datetime.utcnow())
        return cron.get_next(datetime)


# Usage examples
scheduler = JobScheduler(queue_manager)

# Schedule once
await scheduler.schedule_once(
    queue_name="cleanup",
    job_name="cleanup_old_memories",
    payload={"older_than_days": 90},
    run_at=datetime.utcnow() + timedelta(hours=2)
)

# Schedule recurring (every day at midnight)
await scheduler.schedule_recurring(
    queue_name="reports",
    job_name="generate_daily_report",
    payload={"type": "agent_activity"},
    cron="0 0 * * *"
)

# Schedule recurring (every 15 minutes)
await scheduler.schedule_recurring(
    queue_name="monitoring",
    job_name="health_check",
    payload={},
    cron="*/15 * * * *"
)
```

---

## Workers

### Worker Implementation

```python
# blackroad/queues/worker.py
import asyncio
import signal
from typing import Callable, Dict
from dataclasses import dataclass

@dataclass
class WorkerConfig:
    """Worker configuration."""
    name: str
    queues: list[str]
    concurrency: int = 10
    prefetch: int = 1
    timeout: int = 300
    max_jobs: int = 0  # 0 = unlimited

class Worker:
    """Queue worker that processes jobs."""

    def __init__(self, config: WorkerConfig, queue_manager):
        self.config = config
        self.queue_manager = queue_manager
        self.handlers: Dict[str, Callable] = {}
        self.running = False
        self.jobs_processed = 0
        self.current_jobs = set()

    def register_handler(self, job_name: str, handler: Callable):
        """Register handler for job type."""
        self.handlers[job_name] = handler

    async def start(self):
        """Start processing jobs."""
        self.running = True
        logger.info(f"Worker {self.config.name} starting with concurrency {self.config.concurrency}")

        # Setup signal handlers
        for sig in (signal.SIGTERM, signal.SIGINT):
            asyncio.get_event_loop().add_signal_handler(
                sig, lambda: asyncio.create_task(self.stop())
            )

        # Start worker tasks
        tasks = [
            asyncio.create_task(self._worker_loop(i))
            for i in range(self.config.concurrency)
        ]

        await asyncio.gather(*tasks)

    async def stop(self):
        """Gracefully stop worker."""
        logger.info(f"Worker {self.config.name} stopping...")
        self.running = False

        # Wait for current jobs to complete
        while self.current_jobs:
            await asyncio.sleep(0.1)

        logger.info(f"Worker {self.config.name} stopped. Processed {self.jobs_processed} jobs.")

    async def _worker_loop(self, worker_id: int):
        """Individual worker processing loop."""
        while self.running:
            if self.config.max_jobs and self.jobs_processed >= self.config.max_jobs:
                break

            job = await self._get_job()
            if not job:
                continue

            self.current_jobs.add(job.id)
            try:
                await self._process_job(job)
                self.jobs_processed += 1
            finally:
                self.current_jobs.discard(job.id)

    async def _get_job(self) -> Optional[Job]:
        """Get next job from configured queues."""
        for queue_name in self.config.queues:
            queue = self.queue_manager.get_queue(queue_name)
            job = await queue.dequeue(timeout=1)
            if job:
                return job
        return None

    async def _process_job(self, job: Job):
        """Process a single job."""
        handler = self.handlers.get(job.name)
        if not handler:
            logger.warning(f"No handler for job type: {job.name}")
            queue = self.queue_manager.get_queue(job.queue)
            await queue.fail(job, f"No handler for job type: {job.name}")
            return

        try:
            # Execute with timeout
            result = await asyncio.wait_for(
                handler(job.payload),
                timeout=job.timeout
            )

            queue = self.queue_manager.get_queue(job.queue)
            await queue.complete(job, result)
            logger.info(f"Job {job.id} completed successfully")

        except asyncio.TimeoutError:
            queue = self.queue_manager.get_queue(job.queue)
            await queue.fail(job, "Job timed out")
            logger.warning(f"Job {job.id} timed out")

        except Exception as e:
            queue = self.queue_manager.get_queue(job.queue)
            await queue.fail(job, str(e))
            logger.error(f"Job {job.id} failed: {e}")


# Worker setup example
async def main():
    worker = Worker(
        config=WorkerConfig(
            name="agent-worker-1",
            queues=["agent:lucidia", "agent:alice", "agent:default"],
            concurrency=10
        ),
        queue_manager=queue_manager
    )

    # Register handlers
    worker.register_handler("agent_task:inference", handle_inference)
    worker.register_handler("agent_task:code_analysis", handle_code_analysis)
    worker.register_handler("agent_task:memory_operation", handle_memory_op)

    await worker.start()


async def handle_inference(payload: dict) -> dict:
    """Handle inference task."""
    agent = get_agent(payload["agent_type"])
    result = await agent.run(
        prompt=payload["prompt"],
        context=payload["context"],
        tools=payload["tools"]
    )
    return result
```

### Worker Pool

```python
# blackroad/queues/pool.py
import asyncio
from typing import List

class WorkerPool:
    """Manage pool of workers."""

    def __init__(self, queue_manager):
        self.queue_manager = queue_manager
        self.workers: List[Worker] = []

    def add_worker(self, config: WorkerConfig) -> Worker:
        """Add worker to pool."""
        worker = Worker(config, self.queue_manager)
        self.workers.append(worker)
        return worker

    async def start_all(self):
        """Start all workers."""
        tasks = [worker.start() for worker in self.workers]
        await asyncio.gather(*tasks)

    async def stop_all(self):
        """Stop all workers gracefully."""
        await asyncio.gather(*[w.stop() for w in self.workers])

    async def scale_workers(self, queue_name: str, target: int):
        """Scale workers for a specific queue."""
        current = sum(
            1 for w in self.workers
            if queue_name in w.config.queues
        )

        if target > current:
            # Add workers
            for i in range(target - current):
                config = WorkerConfig(
                    name=f"worker-{queue_name}-{current + i}",
                    queues=[queue_name],
                    concurrency=5
                )
                worker = self.add_worker(config)
                asyncio.create_task(worker.start())

        elif target < current:
            # Remove workers
            to_remove = current - target
            for worker in self.workers[:]:
                if queue_name in worker.config.queues and to_remove > 0:
                    await worker.stop()
                    self.workers.remove(worker)
                    to_remove -= 1
```

---

## Dead Letter Queues

### DLQ Handler

```python
# blackroad/queues/dlq.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List

@dataclass
class DeadJob:
    """Job in dead letter queue."""
    job: Job
    failed_at: datetime
    failure_reason: str
    attempts_history: List[dict]

class DeadLetterQueue:
    """Handle permanently failed jobs."""

    def __init__(self, redis_client):
        self.redis = redis_client
        self.prefix = "dlq"

    async def get_dead_jobs(
        self,
        queue_name: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[DeadJob]:
        """List dead jobs."""
        pattern = f"queue:{queue_name or '*'}:dead"

        # Get all matching DLQ keys
        keys = await self.redis.keys(pattern)
        dead_jobs = []

        for key in keys:
            job_ids = await self.redis.zrange(
                key,
                offset,
                offset + limit - 1,
                withscores=True
            )

            queue_prefix = key.decode().replace(":dead", "")
            for job_id, score in job_ids:
                job_data = await self.redis.hget(
                    f"{queue_prefix}:jobs",
                    job_id
                )
                if job_data:
                    job = Job.from_dict(json.loads(job_data))
                    dead_jobs.append(DeadJob(
                        job=job,
                        failed_at=datetime.fromtimestamp(score),
                        failure_reason=job.error or "Unknown",
                        attempts_history=[]
                    ))

        return dead_jobs[:limit]

    async def retry_job(self, job_id: str, queue_name: str) -> bool:
        """Retry a dead job."""
        queue = Queue(queue_name, self.redis)

        # Get job data
        job_data = await self.redis.hget(f"{queue.prefix}:jobs", job_id)
        if not job_data:
            return False

        job = Job.from_dict(json.loads(job_data))

        # Reset job state
        job.status = JobStatus.PENDING
        job.attempts = 0
        job.error = None

        # Update and re-queue
        await self.redis.hset(
            f"{queue.prefix}:jobs",
            job_id,
            json.dumps(job.to_dict())
        )
        await self.redis.zrem(f"{queue.prefix}:dead", job_id)
        await self.redis.zadd(
            f"{queue.prefix}:pending",
            {job_id: job.priority}
        )

        return True

    async def delete_job(self, job_id: str, queue_name: str) -> bool:
        """Permanently delete a dead job."""
        queue = Queue(queue_name, self.redis)

        await self.redis.hdel(f"{queue.prefix}:jobs", job_id)
        await self.redis.zrem(f"{queue.prefix}:dead", job_id)

        return True

    async def retry_all(self, queue_name: str) -> int:
        """Retry all dead jobs in a queue."""
        queue = Queue(queue_name, self.redis)
        job_ids = await self.redis.zrange(f"{queue.prefix}:dead", 0, -1)

        count = 0
        for job_id in job_ids:
            if await self.retry_job(job_id.decode(), queue_name):
                count += 1

        return count

    async def purge(self, queue_name: str, older_than_days: int = 30) -> int:
        """Purge old dead jobs."""
        queue = Queue(queue_name, self.redis)
        cutoff = datetime.utcnow() - timedelta(days=older_than_days)

        job_ids = await self.redis.zrangebyscore(
            f"{queue.prefix}:dead",
            "-inf",
            cutoff.timestamp()
        )

        for job_id in job_ids:
            await self.delete_job(job_id.decode(), queue_name)

        return len(job_ids)
```

---

## Rate Limiting

### Queue Rate Limiter

```python
# blackroad/queues/ratelimit.py
from datetime import datetime
import asyncio

class QueueRateLimiter:
    """Rate limit job processing."""

    def __init__(self, redis_client):
        self.redis = redis_client

    async def acquire(
        self,
        key: str,
        limit: int,
        window_seconds: int = 60
    ) -> bool:
        """Try to acquire rate limit slot."""
        now = datetime.utcnow().timestamp()
        window_start = now - window_seconds

        async with self.redis.pipeline() as pipe:
            # Remove old entries
            pipe.zremrangebyscore(f"ratelimit:{key}", "-inf", window_start)
            # Count current entries
            pipe.zcard(f"ratelimit:{key}")
            # Add new entry if allowed
            results = await pipe.execute()

        current_count = results[1]

        if current_count < limit:
            await self.redis.zadd(f"ratelimit:{key}", {str(now): now})
            await self.redis.expire(f"ratelimit:{key}", window_seconds)
            return True

        return False

    async def wait_for_slot(
        self,
        key: str,
        limit: int,
        window_seconds: int = 60
    ):
        """Wait until rate limit slot is available."""
        while not await self.acquire(key, limit, window_seconds):
            await asyncio.sleep(0.1)


class RateLimitedQueue:
    """Queue with built-in rate limiting."""

    def __init__(self, queue: Queue, rate_limiter: QueueRateLimiter):
        self.queue = queue
        self.rate_limiter = rate_limiter
        self.default_limit = 100  # jobs per minute

    async def dequeue_with_limit(
        self,
        limit_key: str = None,
        limit: int = None
    ) -> Optional[Job]:
        """Dequeue with rate limiting."""
        key = limit_key or self.queue.name
        rate = limit or self.default_limit

        # Wait for rate limit slot
        await self.rate_limiter.wait_for_slot(key, rate)

        return await self.queue.dequeue(timeout=0)
```

---

## Monitoring

### Queue Metrics

```python
# blackroad/queues/metrics.py
from prometheus_client import Counter, Gauge, Histogram

# Job metrics
jobs_enqueued = Counter(
    "blackroad_jobs_enqueued_total",
    "Total jobs enqueued",
    ["queue", "job_name", "priority"]
)

jobs_completed = Counter(
    "blackroad_jobs_completed_total",
    "Total jobs completed",
    ["queue", "job_name", "status"]
)

jobs_failed = Counter(
    "blackroad_jobs_failed_total",
    "Total jobs failed",
    ["queue", "job_name", "error_type"]
)

job_duration = Histogram(
    "blackroad_job_duration_seconds",
    "Job processing duration",
    ["queue", "job_name"],
    buckets=[0.1, 0.5, 1, 5, 10, 30, 60, 300, 600]
)

# Queue metrics
queue_depth = Gauge(
    "blackroad_queue_depth",
    "Number of jobs in queue",
    ["queue", "state"]  # pending, running, delayed, dead
)

queue_latency = Histogram(
    "blackroad_queue_latency_seconds",
    "Time job spent waiting in queue",
    ["queue", "priority"],
    buckets=[0.1, 0.5, 1, 5, 10, 30, 60, 300]
)

# Worker metrics
workers_active = Gauge(
    "blackroad_workers_active",
    "Number of active workers",
    ["queue"]
)

worker_jobs_processing = Gauge(
    "blackroad_worker_jobs_processing",
    "Jobs currently being processed",
    ["worker_name"]
)
```

### Queue Dashboard

```yaml
# dashboards/queues.yaml
dashboard:
  title: "BlackRoad Queue System"

  panels:
    - title: "Queue Depth by State"
      type: graph
      queries:
        - blackroad_queue_depth{state="pending"}
        - blackroad_queue_depth{state="running"}
        - blackroad_queue_depth{state="delayed"}

    - title: "Job Processing Rate"
      type: graph
      query: rate(blackroad_jobs_completed_total[5m])

    - title: "Job Duration (p99)"
      type: graph
      query: histogram_quantile(0.99, rate(blackroad_job_duration_seconds_bucket[5m]))

    - title: "Failed Jobs"
      type: counter
      query: sum(increase(blackroad_jobs_failed_total[1h]))

    - title: "Dead Letter Queue Size"
      type: stat
      query: sum(blackroad_queue_depth{state="dead"})
```

---

## Scaling

### Horizontal Scaling

```yaml
# k8s/workers.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackroad-worker
spec:
  replicas: 5
  selector:
    matchLabels:
      app: blackroad-worker
  template:
    spec:
      containers:
        - name: worker
          image: blackroad/worker:latest
          env:
            - name: REDIS_URL
              value: redis://redis:6379
            - name: WORKER_CONCURRENCY
              value: "10"
            - name: QUEUES
              value: "agent:lucidia,agent:alice,agent:default"
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: blackroad-worker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: blackroad-worker
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: External
      external:
        metric:
          name: blackroad_queue_depth
          selector:
            matchLabels:
              state: pending
        target:
          type: AverageValue
          averageValue: 100
```

---

## Quick Reference

### CLI Commands

```bash
# Queue management
blackroad queue list                    # List all queues
blackroad queue stats <name>            # Queue statistics
blackroad queue purge <name>            # Clear queue

# Job management
blackroad job info <id>                 # Job details
blackroad job retry <id>                # Retry failed job
blackroad job cancel <id>               # Cancel pending job

# DLQ management
blackroad dlq list                      # List dead jobs
blackroad dlq retry <queue>             # Retry all dead
blackroad dlq purge <queue> --days=30   # Purge old dead jobs

# Worker management
blackroad worker start                  # Start worker
blackroad worker status                 # Worker status
blackroad worker scale <queue> <n>      # Scale workers
```

### Priority Levels

| Level | Value | Use Case |
|-------|-------|----------|
| CRITICAL | 0 | System emergencies |
| HIGH | 1 | User requests |
| NORMAL | 5 | Standard tasks |
| LOW | 8 | Background jobs |
| BULK | 10 | Batch processing |

---

## Related Documentation

- [SCALING.md](SCALING.md) - Scaling guide
- [MONITORING.md](MONITORING.md) - Observability
- [AGENTS.md](AGENTS.md) - Agent configuration
- [WORKFLOWS.md](WORKFLOWS.md) - Workflow automation
- [PERFORMANCE.md](PERFORMANCE.md) - Optimization

---

*Your AI. Your Hardware. Your Rules.*
