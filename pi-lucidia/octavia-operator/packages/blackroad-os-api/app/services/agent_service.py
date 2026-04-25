"""
Agent Service

Handles agent management, including creation from templates and status updates.
"""

from typing import Any, Optional
from uuid import UUID
import asyncpg

from app.schemas.agent import Agent, AgentCreate, AgentUpdate

# Import from blackroad_core when available
import hashlib
import json
import os
from datetime import datetime, timezone


def generate_ps_sha_id(
    manifest: dict[str, Any],
    creator_id: str,
    parent_ps_sha: Optional[str] = None,
) -> str:
    """Generate PS-SHA-infinity ID for an agent."""
    payload = {
        "manifest": manifest,
        "creator_id": creator_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "salt": os.urandom(16).hex(),
        "parent": parent_ps_sha,
    }
    serialized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


class AgentService:
    """Service for managing agents."""

    def __init__(self, db: asyncpg.Pool):
        self.db = db

    async def list(
        self,
        org_id: UUID,
        status: Optional[str] = None,
        pack_key: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Agent]:
        """List agents for an organization."""
        conditions = ["a.org_id = $1"]
        values: list[Any] = [org_id]
        idx = 2

        if status:
            conditions.append(f"a.status = ${idx}")
            values.append(status)
            idx += 1

        if pack_key:
            conditions.append(f"p.key = ${idx}")
            values.append(pack_key)
            idx += 1

        values.extend([limit, offset])

        query = f"""
            SELECT a.id, a.ps_sha_id, a.org_id, a.agent_template_id, a.name,
                   a.description, a.runtime_type, a.status, a.effective_manifest,
                   a.config, a.parent_ps_sha_id, a.error_message, a.last_run_at,
                   a.created_at, a.updated_at
            FROM agents a
            LEFT JOIN agent_templates t ON t.id = a.agent_template_id
            LEFT JOIN packs p ON p.id = t.pack_id
            WHERE {' AND '.join(conditions)}
            ORDER BY a.name
            LIMIT ${idx} OFFSET ${idx + 1}
        """

        rows = await self.db.fetch(query, *values)
        return [Agent(**dict(row)) for row in rows]

    async def get(self, agent_id: UUID, org_id: UUID) -> Optional[Agent]:
        """Get an agent by ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, ps_sha_id, org_id, agent_template_id, name, description,
                   runtime_type, status, effective_manifest, config, parent_ps_sha_id,
                   error_message, last_run_at, created_at, updated_at
            FROM agents
            WHERE id = $1 AND org_id = $2
            """,
            agent_id,
            org_id,
        )
        return Agent(**dict(row)) if row else None

    async def get_by_ps_sha(self, ps_sha_id: str) -> Optional[Agent]:
        """Get an agent by PS-SHA ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, ps_sha_id, org_id, agent_template_id, name, description,
                   runtime_type, status, effective_manifest, config, parent_ps_sha_id,
                   error_message, last_run_at, created_at, updated_at
            FROM agents
            WHERE ps_sha_id = $1
            """,
            ps_sha_id,
        )
        return Agent(**dict(row)) if row else None

    async def create(self, org_id: UUID, data: AgentCreate, creator_id: str) -> Agent:
        """Create a new agent."""
        ps_sha_id = generate_ps_sha_id(
            manifest=data.effective_manifest,
            creator_id=creator_id,
            parent_ps_sha=data.parent_ps_sha_id,
        )

        row = await self.db.fetchrow(
            """
            INSERT INTO agents (
                ps_sha_id, org_id, agent_template_id, name, description,
                runtime_type, status, effective_manifest, config, parent_ps_sha_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, ps_sha_id, org_id, agent_template_id, name, description,
                      runtime_type, status, effective_manifest, config, parent_ps_sha_id,
                      error_message, last_run_at, created_at, updated_at
            """,
            ps_sha_id,
            org_id,
            data.agent_template_id,
            data.name,
            data.description,
            data.runtime_type,
            "active",
            json.dumps(data.effective_manifest),
            json.dumps(data.config or {}),
            data.parent_ps_sha_id,
        )

        return Agent(**dict(row))

    async def create_from_template(
        self,
        org_id: UUID,
        template_id: UUID,
        template_key: str,
        name: str,
        runtime_type: str,
        manifest: dict,
        conn: Optional[asyncpg.Connection] = None,
    ) -> Agent:
        """Create an agent from a template (used during pack installation)."""
        executor = conn or self.db

        ps_sha_id = generate_ps_sha_id(
            manifest=manifest,
            creator_id=str(org_id),
        )

        row = await executor.fetchrow(
            """
            INSERT INTO agents (
                ps_sha_id, org_id, agent_template_id, name, runtime_type,
                status, effective_manifest
            )
            VALUES ($1, $2, $3, $4, $5, 'active', $6)
            RETURNING id, ps_sha_id, org_id, agent_template_id, name, description,
                      runtime_type, status, effective_manifest, config, parent_ps_sha_id,
                      error_message, last_run_at, created_at, updated_at
            """,
            ps_sha_id,
            org_id,
            template_id,
            name,
            runtime_type,
            json.dumps(manifest),
        )

        return Agent(**dict(row))

    async def update(
        self,
        agent_id: UUID,
        org_id: UUID,
        data: AgentUpdate,
    ) -> Optional[Agent]:
        """Update an agent."""
        updates = []
        values: list[Any] = []
        idx = 1

        if data.name is not None:
            updates.append(f"name = ${idx}")
            values.append(data.name)
            idx += 1

        if data.description is not None:
            updates.append(f"description = ${idx}")
            values.append(data.description)
            idx += 1

        if data.status is not None:
            updates.append(f"status = ${idx}")
            values.append(data.status)
            idx += 1

        if data.config is not None:
            updates.append(f"config = ${idx}")
            values.append(json.dumps(data.config))
            idx += 1

        if data.error_message is not None:
            updates.append(f"error_message = ${idx}")
            values.append(data.error_message)
            idx += 1

        if not updates:
            return await self.get(agent_id, org_id)

        updates.append("updated_at = now()")
        values.extend([agent_id, org_id])

        query = f"""
            UPDATE agents
            SET {', '.join(updates)}
            WHERE id = ${idx} AND org_id = ${idx + 1}
            RETURNING id, ps_sha_id, org_id, agent_template_id, name, description,
                      runtime_type, status, effective_manifest, config, parent_ps_sha_id,
                      error_message, last_run_at, created_at, updated_at
        """

        row = await self.db.fetchrow(query, *values)
        return Agent(**dict(row)) if row else None

    async def pause(self, agent_id: UUID, org_id: UUID) -> Optional[Agent]:
        """Pause an agent."""
        return await self.update(
            agent_id,
            org_id,
            AgentUpdate(status="paused"),
        )

    async def resume(self, agent_id: UUID, org_id: UUID) -> Optional[Agent]:
        """Resume a paused agent."""
        return await self.update(
            agent_id,
            org_id,
            AgentUpdate(status="active", error_message=None),
        )

    async def mark_error(
        self,
        agent_id: UUID,
        org_id: UUID,
        error_message: str,
    ) -> Optional[Agent]:
        """Mark an agent as having an error."""
        return await self.update(
            agent_id,
            org_id,
            AgentUpdate(status="error", error_message=error_message),
        )

    async def archive(self, agent_id: UUID, org_id: UUID) -> Optional[Agent]:
        """Archive an agent."""
        return await self.update(
            agent_id,
            org_id,
            AgentUpdate(status="archived"),
        )

    async def delete(self, agent_id: UUID, org_id: UUID) -> bool:
        """Delete an agent (prefer archive instead)."""
        result = await self.db.execute(
            "DELETE FROM agents WHERE id = $1 AND org_id = $2",
            agent_id,
            org_id,
        )
        return result == "DELETE 1"

    async def count(self, org_id: Optional[UUID] = None, status: Optional[str] = None) -> int:
        """Count agents, optionally filtered."""
        conditions = []
        values: list[Any] = []
        idx = 1

        if org_id:
            conditions.append(f"org_id = ${idx}")
            values.append(org_id)
            idx += 1

        if status:
            conditions.append(f"status = ${idx}")
            values.append(status)
            idx += 1

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        query = f"SELECT COUNT(*) FROM agents {where}"

        result = await self.db.fetchval(query, *values)
        return result or 0
