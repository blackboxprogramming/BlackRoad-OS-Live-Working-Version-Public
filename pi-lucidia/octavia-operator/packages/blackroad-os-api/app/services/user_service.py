"""
User Service

Handles user management and authentication.
"""

from typing import Optional
from uuid import UUID
import asyncpg
import bcrypt

from app.schemas.user import UserCreate, UserUpdate, User


class UserService:
    """Service for managing users."""

    def __init__(self, db: asyncpg.Pool):
        self.db = db

    async def create(self, data: UserCreate) -> User:
        """Create a new user."""
        password_hash = None
        if data.password:
            password_hash = bcrypt.hashpw(
                data.password.encode(),
                bcrypt.gensalt(),
            ).decode()

        row = await self.db.fetchrow(
            """
            INSERT INTO users (email, name, password_hash, avatar_url, settings)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, name, avatar_url, settings, created_at, updated_at
            """,
            data.email,
            data.name,
            password_hash,
            data.avatar_url,
            data.settings or {},
        )
        return User(**dict(row))

    async def get(self, user_id: UUID) -> Optional[User]:
        """Get a user by ID."""
        row = await self.db.fetchrow(
            """
            SELECT id, email, name, avatar_url, settings, created_at, updated_at
            FROM users
            WHERE id = $1
            """,
            user_id,
        )
        return User(**dict(row)) if row else None

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        row = await self.db.fetchrow(
            """
            SELECT id, email, name, avatar_url, settings, created_at, updated_at
            FROM users
            WHERE email = $1
            """,
            email,
        )
        return User(**dict(row)) if row else None

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        row = await self.db.fetchrow(
            """
            SELECT id, email, name, password_hash, avatar_url, settings, created_at, updated_at
            FROM users
            WHERE email = $1
            """,
            email,
        )

        if not row:
            return None

        password_hash = row["password_hash"]
        if not password_hash:
            return None

        if not bcrypt.checkpw(password.encode(), password_hash.encode()):
            return None

        return User(
            id=row["id"],
            email=row["email"],
            name=row["name"],
            avatar_url=row["avatar_url"],
            settings=row["settings"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    async def update(self, user_id: UUID, data: UserUpdate) -> Optional[User]:
        """Update a user."""
        updates = []
        values = []
        idx = 1

        if data.name is not None:
            updates.append(f"name = ${idx}")
            values.append(data.name)
            idx += 1

        if data.avatar_url is not None:
            updates.append(f"avatar_url = ${idx}")
            values.append(data.avatar_url)
            idx += 1

        if data.settings is not None:
            updates.append(f"settings = ${idx}")
            values.append(data.settings)
            idx += 1

        if data.password is not None:
            password_hash = bcrypt.hashpw(
                data.password.encode(),
                bcrypt.gensalt(),
            ).decode()
            updates.append(f"password_hash = ${idx}")
            values.append(password_hash)
            idx += 1

        if not updates:
            return await self.get(user_id)

        updates.append(f"updated_at = now()")
        values.append(user_id)

        query = f"""
            UPDATE users
            SET {', '.join(updates)}
            WHERE id = ${idx}
            RETURNING id, email, name, avatar_url, settings, created_at, updated_at
        """

        row = await self.db.fetchrow(query, *values)
        return User(**dict(row)) if row else None

    async def delete(self, user_id: UUID) -> bool:
        """Delete a user."""
        result = await self.db.execute(
            "DELETE FROM users WHERE id = $1",
            user_id,
        )
        return result == "DELETE 1"
