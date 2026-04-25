"""
Organization Service

Handles organization (tenant) management.
"""

from typing import Optional
from uuid import UUID
import asyncpg

from app.schemas.org import OrgCreate, OrgUpdate, Org


class OrgService:
    """Service for managing organizations."""

    def __init__(self, db: asyncpg.Pool):
        self.db = db

    async def create(self, data: OrgCreate, user_id: UUID) -> Org:
        """
        Create a new organization.

        Also adds the creating user as the owner.
        """
        async with self.db.acquire() as conn:
            async with conn.transaction():
                # Create the org
                row = await conn.fetchrow(
                    """
                    INSERT INTO orgs (name, slug, settings)
                    VALUES ($1, $2, $3)
                    RETURNING id, name, slug, settings, created_at, updated_at
                    """,
                    data.name,
                    data.slug,
                    data.settings or {},
                )

                org = Org(**dict(row))

                # Add user as owner
                await conn.execute(
                    """
                    INSERT INTO org_users (org_id, user_id, role)
                    VALUES ($1, $2, 'owner')
                    """,
                    org.id,
                    user_id,
                )

                return org

    async def get(self, org_id: UUID) -> Optional[Org]:
        """Get an organization by ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, name, slug, settings, created_at, updated_at
            FROM orgs
            WHERE id = $1
            """,
            org_id,
        )
        return Org(**dict(row)) if row else None

    async def get_by_slug(self, slug: str) -> Optional[Org]:
        """Get an organization by slug."""
        row = await self.db.fetchrow(
            """
            SELECT id, name, slug, settings, created_at, updated_at
            FROM orgs
            WHERE slug = $1
            """,
            slug,
        )
        return Org(**dict(row)) if row else None

    async def list_for_user(self, user_id: UUID) -> list[Org]:
        """List all organizations a user belongs to."""
        rows = await self.db.fetch(
            """
            SELECT o.id, o.name, o.slug, o.settings, o.created_at, o.updated_at
            FROM orgs o
            JOIN org_users ou ON ou.org_id = o.id
            WHERE ou.user_id = $1
            ORDER BY o.name
            """,
            user_id,
        )
        return [Org(**dict(row)) for row in rows]

    async def update(self, org_id: UUID, data: OrgUpdate) -> Optional[Org]:
        """Update an organization."""
        updates = []
        values = []
        idx = 1

        if data.name is not None:
            updates.append(f"name = ${idx}")
            values.append(data.name)
            idx += 1

        if data.settings is not None:
            updates.append(f"settings = ${idx}")
            values.append(data.settings)
            idx += 1

        if not updates:
            return await self.get(org_id)

        updates.append(f"updated_at = now()")
        values.append(org_id)

        query = f"""
            UPDATE orgs
            SET {', '.join(updates)}
            WHERE id = ${idx}
            RETURNING id, name, slug, settings, created_at, updated_at
        """

        row = await self.db.fetchrow(query, *values)
        return Org(**dict(row)) if row else None

    async def delete(self, org_id: UUID) -> bool:
        """Delete an organization."""
        result = await self.db.execute(
            "DELETE FROM orgs WHERE id = $1",
            org_id,
        )
        return result == "DELETE 1"

    async def add_member(
        self,
        org_id: UUID,
        user_id: UUID,
        role: str = "member",
    ) -> bool:
        """Add a member to an organization."""
        try:
            await self.db.execute(
                """
                INSERT INTO org_users (org_id, user_id, role)
                VALUES ($1, $2, $3)
                ON CONFLICT (org_id, user_id) DO UPDATE SET role = $3
                """,
                org_id,
                user_id,
                role,
            )
            return True
        except Exception:
            return False

    async def remove_member(self, org_id: UUID, user_id: UUID) -> bool:
        """Remove a member from an organization."""
        result = await self.db.execute(
            """
            DELETE FROM org_users
            WHERE org_id = $1 AND user_id = $2
            """,
            org_id,
            user_id,
        )
        return result == "DELETE 1"
