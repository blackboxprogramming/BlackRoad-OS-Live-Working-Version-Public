"""
Workflow Service

Handles workflow management and execution.
"""

from typing import Any, Optional
from uuid import UUID, uuid4
import asyncpg
import json


class WorkflowService:
    """Service for managing workflows."""

    def __init__(self, db: asyncpg.Pool, job_service=None):
        self.db = db
        self.job_service = job_service

    async def list(self, org_id: UUID) -> list[dict[str, Any]]:
        """List workflows for an organization."""
        rows = await self.db.fetch(
            """
            SELECT id, org_id, name, description, definition, status, created_at, updated_at
            FROM workflows
            WHERE org_id = $1
            ORDER BY name
            """,
            org_id,
        )
        return [dict(row) for row in rows]

    async def get(self, workflow_id: UUID, org_id: UUID) -> Optional[dict[str, Any]]:
        """Get a workflow by ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, org_id, name, description, definition, status, created_at, updated_at
            FROM workflows
            WHERE id = $1 AND org_id = $2
            """,
            workflow_id,
            org_id,
        )
        return dict(row) if row else None

    async def create(
        self,
        org_id: UUID,
        name: str,
        definition: dict[str, Any],
        description: Optional[str] = None,
    ) -> dict[str, Any]:
        """Create a new workflow."""
        row = await self.db.fetchrow(
            """
            INSERT INTO workflows (org_id, name, description, definition, status)
            VALUES ($1, $2, $3, $4, 'draft')
            RETURNING id, org_id, name, description, definition, status, created_at, updated_at
            """,
            org_id,
            name,
            description,
            json.dumps(definition),
        )
        return dict(row)

    async def update(
        self,
        workflow_id: UUID,
        org_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        definition: Optional[dict[str, Any]] = None,
        status: Optional[str] = None,
    ) -> Optional[dict[str, Any]]:
        """Update a workflow."""
        updates = []
        values: list[Any] = []
        idx = 1

        if name is not None:
            updates.append(f"name = ${idx}")
            values.append(name)
            idx += 1

        if description is not None:
            updates.append(f"description = ${idx}")
            values.append(description)
            idx += 1

        if definition is not None:
            updates.append(f"definition = ${idx}")
            values.append(json.dumps(definition))
            idx += 1

        if status is not None:
            updates.append(f"status = ${idx}")
            values.append(status)
            idx += 1

        if not updates:
            return await self.get(workflow_id, org_id)

        updates.append("updated_at = now()")
        values.extend([workflow_id, org_id])

        query = f"""
            UPDATE workflows
            SET {', '.join(updates)}
            WHERE id = ${idx} AND org_id = ${idx + 1}
            RETURNING id, org_id, name, description, definition, status, created_at, updated_at
        """

        row = await self.db.fetchrow(query, *values)
        return dict(row) if row else None

    async def delete(self, workflow_id: UUID, org_id: UUID) -> bool:
        """Delete a workflow."""
        result = await self.db.execute(
            "DELETE FROM workflows WHERE id = $1 AND org_id = $2",
            workflow_id,
            org_id,
        )
        return result == "DELETE 1"

    async def run(
        self,
        workflow_id: UUID,
        org_id: UUID,
        input: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Run a workflow.

        Creates a workflow run and starts executing the steps.
        """
        workflow = await self.get(workflow_id, org_id)
        if not workflow:
            raise ValueError("Workflow not found")

        if workflow["status"] != "active":
            raise ValueError("Workflow is not active")

        trace_id = f"wf_{uuid4().hex[:16]}"

        row = await self.db.fetchrow(
            """
            INSERT INTO workflow_runs (workflow_id, org_id, trace_id, status, input)
            VALUES ($1, $2, $3, 'running', $4)
            RETURNING id, workflow_id, org_id, trace_id, status, input, output, error, current_step, created_at, finished_at
            """,
            workflow_id,
            org_id,
            trace_id,
            json.dumps(input),
        )

        run = dict(row)

        # TODO: Start executing workflow steps asynchronously
        # This would involve:
        # 1. Parsing the workflow definition
        # 2. Creating jobs for each step
        # 3. Handling dependencies between steps
        # 4. Updating workflow run status

        return run

    async def get_run(self, run_id: UUID, org_id: UUID) -> Optional[dict[str, Any]]:
        """Get a workflow run by ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, workflow_id, org_id, trace_id, status, input, output, error, current_step, created_at, finished_at
            FROM workflow_runs
            WHERE id = $1 AND org_id = $2
            """,
            run_id,
            org_id,
        )
        return dict(row) if row else None

    async def list_runs(
        self,
        org_id: UUID,
        workflow_id: Optional[UUID] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """List workflow runs."""
        conditions = ["org_id = $1"]
        values: list[Any] = [org_id]
        idx = 2

        if workflow_id:
            conditions.append(f"workflow_id = ${idx}")
            values.append(workflow_id)
            idx += 1

        if status:
            conditions.append(f"status = ${idx}")
            values.append(status)
            idx += 1

        values.extend([limit, offset])

        query = f"""
            SELECT id, workflow_id, org_id, trace_id, status, input, output, error, current_step, created_at, finished_at
            FROM workflow_runs
            WHERE {' AND '.join(conditions)}
            ORDER BY created_at DESC
            LIMIT ${idx} OFFSET ${idx + 1}
        """

        rows = await self.db.fetch(query, *values)
        return [dict(row) for row in rows]

    async def cancel_run(self, run_id: UUID, org_id: UUID) -> Optional[dict[str, Any]]:
        """Cancel a workflow run."""
        row = await self.db.fetchrow(
            """
            UPDATE workflow_runs
            SET status = 'cancelled', finished_at = now()
            WHERE id = $1 AND org_id = $2 AND status = 'running'
            RETURNING id, workflow_id, org_id, trace_id, status, input, output, error, current_step, created_at, finished_at
            """,
            run_id,
            org_id,
        )
        return dict(row) if row else None
