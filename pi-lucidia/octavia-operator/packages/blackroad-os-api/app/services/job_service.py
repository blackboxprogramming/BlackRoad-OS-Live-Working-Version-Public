"""
Job Service

Handles job management, queuing, and status updates.
"""

from typing import Any, Optional
from uuid import UUID, uuid4
import asyncpg
import json

from app.schemas.job import Job, JobCreate


class JobService:
    """Service for managing jobs."""

    def __init__(self, db: asyncpg.Pool, redis=None):
        self.db = db
        self.redis = redis

    async def create(self, org_id: UUID, data: JobCreate) -> Job:
        """
        Create a new job and queue it for processing.

        This inserts the job into the database and pushes a message
        to the appropriate Redis stream for worker processing.
        """
        trace_id = f"tr_{uuid4().hex[:16]}"

        async with self.db.acquire() as conn:
            # Get the agent to determine which queue to use
            agent = await conn.fetchrow(
                """
                SELECT a.id, a.runtime_type, t.pack_id, p.key as pack_key
                FROM agents a
                LEFT JOIN agent_templates t ON t.id = a.agent_template_id
                LEFT JOIN packs p ON p.id = t.pack_id
                WHERE a.id = $1 AND a.org_id = $2 AND a.status = 'active'
                """,
                data.agent_id,
                org_id,
            )

            if not agent:
                raise ValueError("Agent not found or not active")

            # Create the job
            row = await conn.fetchrow(
                """
                INSERT INTO jobs (
                    org_id, agent_id, trace_id, status, priority, input, metadata, max_retries
                )
                VALUES ($1, $2, $3, 'queued', $4, $5, $6, $7)
                RETURNING id, org_id, agent_id, trace_id, status, priority, input, output,
                          error, metadata, retry_count, max_retries, created_at, started_at, finished_at
                """,
                org_id,
                data.agent_id,
                trace_id,
                data.priority or 0,
                json.dumps(data.input or {}),
                json.dumps(data.metadata or {}),
                data.max_retries or 3,
            )

            job = Job(**dict(row))

            # Log the job creation event
            await conn.execute(
                """
                INSERT INTO job_events (job_id, event_type, payload)
                VALUES ($1, 'queued', $2)
                """,
                job.id,
                json.dumps({"input": data.input}),
            )

            # Queue the job for processing
            if self.redis:
                pack_key = agent["pack_key"] or "default"
                queue_name = f"jobs.{pack_key}.default"
                await self._enqueue_job(queue_name, job)

            return job

    async def _enqueue_job(self, queue_name: str, job: Job):
        """Push a job to Redis stream for worker processing."""
        if not self.redis:
            return

        message = {
            "job_id": str(job.id),
            "org_id": str(job.org_id),
            "agent_id": str(job.agent_id),
            "trace_id": job.trace_id,
            "priority": str(job.priority),
        }

        await self.redis.xadd(queue_name, message)

    async def get(self, job_id: UUID, org_id: UUID) -> Optional[Job]:
        """Get a job by ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, org_id, agent_id, trace_id, status, priority, input, output,
                   error, metadata, retry_count, max_retries, created_at, started_at, finished_at
            FROM jobs
            WHERE id = $1 AND org_id = $2
            """,
            job_id,
            org_id,
        )
        return Job(**dict(row)) if row else None

    async def list(
        self,
        org_id: UUID,
        agent_id: Optional[UUID] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Job]:
        """List jobs for an organization."""
        conditions = ["org_id = $1"]
        values: list[Any] = [org_id]
        idx = 2

        if agent_id:
            conditions.append(f"agent_id = ${idx}")
            values.append(agent_id)
            idx += 1

        if status:
            conditions.append(f"status = ${idx}")
            values.append(status)
            idx += 1

        values.extend([limit, offset])

        query = f"""
            SELECT id, org_id, agent_id, trace_id, status, priority, input, output,
                   error, metadata, retry_count, max_retries, created_at, started_at, finished_at
            FROM jobs
            WHERE {' AND '.join(conditions)}
            ORDER BY created_at DESC
            LIMIT ${idx} OFFSET ${idx + 1}
        """

        rows = await self.db.fetch(query, *values)
        return [Job(**dict(row)) for row in rows]

    async def start(self, job_id: UUID) -> Optional[Job]:
        """Mark a job as started."""
        row = await self.db.fetchrow(
            """
            UPDATE jobs
            SET status = 'running', started_at = now()
            WHERE id = $1 AND status = 'queued'
            RETURNING id, org_id, agent_id, trace_id, status, priority, input, output,
                      error, metadata, retry_count, max_retries, created_at, started_at, finished_at
            """,
            job_id,
        )

        if row:
            await self.db.execute(
                """
                INSERT INTO job_events (job_id, event_type, payload)
                VALUES ($1, 'started', '{}')
                """,
                job_id,
            )

        return Job(**dict(row)) if row else None

    async def complete(
        self,
        job_id: UUID,
        output: dict[str, Any],
    ) -> Optional[Job]:
        """Mark a job as completed."""
        row = await self.db.fetchrow(
            """
            UPDATE jobs
            SET status = 'succeeded', output = $2, finished_at = now()
            WHERE id = $1 AND status = 'running'
            RETURNING id, org_id, agent_id, trace_id, status, priority, input, output,
                      error, metadata, retry_count, max_retries, created_at, started_at, finished_at
            """,
            job_id,
            json.dumps(output),
        )

        if row:
            await self.db.execute(
                """
                INSERT INTO job_events (job_id, event_type, payload)
                VALUES ($1, 'completed', $2)
                """,
                job_id,
                json.dumps({"output": output}),
            )

            # Update agent's last_run_at
            await self.db.execute(
                """
                UPDATE agents SET last_run_at = now()
                WHERE id = $1
                """,
                row["agent_id"],
            )

        return Job(**dict(row)) if row else None

    async def fail(
        self,
        job_id: UUID,
        error: str,
        should_retry: bool = True,
    ) -> Optional[Job]:
        """Mark a job as failed."""
        job = await self.db.fetchrow(
            """
            SELECT retry_count, max_retries FROM jobs WHERE id = $1
            """,
            job_id,
        )

        if not job:
            return None

        if should_retry and job["retry_count"] < job["max_retries"]:
            # Retry the job
            row = await self.db.fetchrow(
                """
                UPDATE jobs
                SET status = 'queued', error = $2, retry_count = retry_count + 1
                WHERE id = $1
                RETURNING id, org_id, agent_id, trace_id, status, priority, input, output,
                          error, metadata, retry_count, max_retries, created_at, started_at, finished_at
                """,
                job_id,
                error,
            )

            if row:
                await self.db.execute(
                    """
                    INSERT INTO job_events (job_id, event_type, payload)
                    VALUES ($1, 'retried', $2)
                    """,
                    job_id,
                    json.dumps({"error": error, "retry_count": row["retry_count"]}),
                )

                # Re-queue the job
                result = Job(**dict(row))
                if self.redis:
                    # Get pack key for queue name
                    agent = await self.db.fetchrow(
                        """
                        SELECT p.key as pack_key
                        FROM agents a
                        LEFT JOIN agent_templates t ON t.id = a.agent_template_id
                        LEFT JOIN packs p ON p.id = t.pack_id
                        WHERE a.id = $1
                        """,
                        row["agent_id"],
                    )
                    pack_key = agent["pack_key"] if agent else "default"
                    await self._enqueue_job(f"jobs.{pack_key}.default", result)

                return result
        else:
            # Permanently fail
            row = await self.db.fetchrow(
                """
                UPDATE jobs
                SET status = 'failed', error = $2, finished_at = now()
                WHERE id = $1
                RETURNING id, org_id, agent_id, trace_id, status, priority, input, output,
                          error, metadata, retry_count, max_retries, created_at, started_at, finished_at
                """,
                job_id,
                error,
            )

            if row:
                await self.db.execute(
                    """
                    INSERT INTO job_events (job_id, event_type, payload)
                    VALUES ($1, 'failed', $2)
                    """,
                    job_id,
                    json.dumps({"error": error}),
                )

            return Job(**dict(row)) if row else None

    async def cancel(self, job_id: UUID, org_id: UUID) -> Optional[Job]:
        """Cancel a job."""
        row = await self.db.fetchrow(
            """
            UPDATE jobs
            SET status = 'cancelled', finished_at = now()
            WHERE id = $1 AND org_id = $2 AND status IN ('queued', 'running')
            RETURNING id, org_id, agent_id, trace_id, status, priority, input, output,
                      error, metadata, retry_count, max_retries, created_at, started_at, finished_at
            """,
            job_id,
            org_id,
        )

        if row:
            await self.db.execute(
                """
                INSERT INTO job_events (job_id, event_type, payload)
                VALUES ($1, 'cancelled', '{}')
                """,
                job_id,
            )

        return Job(**dict(row)) if row else None

    async def get_events(self, job_id: UUID) -> list[dict[str, Any]]:
        """Get all events for a job."""
        rows = await self.db.fetch(
            """
            SELECT id, job_id, event_type, payload, created_at
            FROM job_events
            WHERE job_id = $1
            ORDER BY created_at
            """,
            job_id,
        )
        return [dict(row) for row in rows]
