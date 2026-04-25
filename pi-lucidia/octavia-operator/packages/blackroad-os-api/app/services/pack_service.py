"""
Pack Service

Handles pack management and installation.
"""

from typing import Optional
from uuid import UUID
import asyncpg

from app.schemas.pack import Pack, PackInstallation
from app.services.agent_service import AgentService


class PackService:
    """Service for managing packs."""

    def __init__(self, db: asyncpg.Pool, agent_service: Optional[AgentService] = None):
        self.db = db
        self._agent_service = agent_service

    @property
    def agent_service(self) -> AgentService:
        if self._agent_service is None:
            self._agent_service = AgentService(self.db)
        return self._agent_service

    async def list_available(self) -> list[Pack]:
        """List all available packs."""
        rows = await self.db.fetch(
            """
            SELECT id, key, name, description, icon, version, manifest, created_at, updated_at
            FROM packs
            ORDER BY name
            """
        )
        return [Pack(**dict(row)) for row in rows]

    async def get(self, pack_id: UUID) -> Optional[Pack]:
        """Get a pack by ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, key, name, description, icon, version, manifest, created_at, updated_at
            FROM packs
            WHERE id = $1
            """,
            pack_id,
        )
        return Pack(**dict(row)) if row else None

    async def get_by_key(self, key: str) -> Optional[Pack]:
        """Get a pack by key."""
        row = await self.db.fetchrow(
            """
            SELECT id, key, name, description, icon, version, manifest, created_at, updated_at
            FROM packs
            WHERE key = $1
            """,
            key,
        )
        return Pack(**dict(row)) if row else None

    async def install(
        self,
        org_id: UUID,
        pack_key: str,
        settings: Optional[dict] = None,
    ) -> PackInstallation:
        """
        Install a pack for an organization.

        This creates agent instances from all templates in the pack.
        """
        pack = await self.get_by_key(pack_key)
        if not pack:
            raise ValueError(f"Pack not found: {pack_key}")

        async with self.db.acquire() as conn:
            async with conn.transaction():
                # Check if already installed
                existing = await conn.fetchrow(
                    """
                    SELECT id FROM pack_installations
                    WHERE org_id = $1 AND pack_id = $2
                    """,
                    org_id,
                    pack.id,
                )

                if existing:
                    raise ValueError(f"Pack {pack_key} is already installed")

                # Create installation record
                row = await conn.fetchrow(
                    """
                    INSERT INTO pack_installations (org_id, pack_id, installed_version, settings)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id, org_id, pack_id, installed_version, settings, installed_at
                    """,
                    org_id,
                    pack.id,
                    pack.version,
                    settings or {},
                )

                installation = PackInstallation(**dict(row))

                # Get all agent templates for this pack
                templates = await conn.fetch(
                    """
                    SELECT id, template_key, name, runtime_type, manifest
                    FROM agent_templates
                    WHERE pack_id = $1
                    """,
                    pack.id,
                )

                # Create agent instances for each template
                for template in templates:
                    await self.agent_service.create_from_template(
                        org_id=org_id,
                        template_id=template["id"],
                        template_key=template["template_key"],
                        name=template["name"],
                        runtime_type=template["runtime_type"],
                        manifest=template["manifest"],
                        conn=conn,
                    )

                return installation

    async def uninstall(self, org_id: UUID, pack_key: str) -> bool:
        """
        Uninstall a pack from an organization.

        This archives (not deletes) all agents from the pack.
        """
        pack = await self.get_by_key(pack_key)
        if not pack:
            return False

        async with self.db.acquire() as conn:
            async with conn.transaction():
                # Archive agents from this pack
                await conn.execute(
                    """
                    UPDATE agents
                    SET status = 'archived', updated_at = now()
                    WHERE org_id = $1
                    AND agent_template_id IN (
                        SELECT id FROM agent_templates WHERE pack_id = $2
                    )
                    """,
                    org_id,
                    pack.id,
                )

                # Remove installation
                result = await conn.execute(
                    """
                    DELETE FROM pack_installations
                    WHERE org_id = $1 AND pack_id = $2
                    """,
                    org_id,
                    pack.id,
                )

                return result == "DELETE 1"

    async def list_installed(self, org_id: UUID) -> list[Pack]:
        """List all packs installed for an organization."""
        rows = await self.db.fetch(
            """
            SELECT p.id, p.key, p.name, p.description, p.icon, p.version, p.manifest, p.created_at, p.updated_at
            FROM packs p
            JOIN pack_installations pi ON pi.pack_id = p.id
            WHERE pi.org_id = $1
            ORDER BY p.name
            """,
            org_id,
        )
        return [Pack(**dict(row)) for row in rows]

    async def get_installation(
        self,
        org_id: UUID,
        pack_key: str,
    ) -> Optional[PackInstallation]:
        """Get installation details for a pack."""
        row = await self.db.fetchrow(
            """
            SELECT pi.id, pi.org_id, pi.pack_id, pi.installed_version, pi.settings, pi.installed_at
            FROM pack_installations pi
            JOIN packs p ON p.id = pi.pack_id
            WHERE pi.org_id = $1 AND p.key = $2
            """,
            org_id,
            pack_key,
        )
        return PackInstallation(**dict(row)) if row else None
