"""Tests for VS Code integration endpoints"""
from datetime import datetime, timezone
from typing import Optional

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import File


async def _create_file(db: AsyncSession, user_id: int, name: str, file_type: Optional[str]) -> File:
    """Helper to create a file record for tests."""
    now = datetime.now(timezone.utc)
    file = File(
        user_id=user_id,
        name=name,
        original_name=name,
        path=f"/workspace/{name}",
        file_type=file_type,
        extension=name.split(".")[-1],
        size=128,
        storage_key=f"storage/{name}",
        storage_url=None,
        checksum="checksum",
        created_at=now,
        updated_at=now,
    )
    db.add(file)
    await db.commit()
    await db.refresh(file)
    return file


@pytest.mark.asyncio
async def test_list_code_files_handles_mime_types(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
    test_user: dict,
):
    """Ensure /files endpoint returns data even when file_type is missing."""
    await _create_file(db_session, test_user["id"], "script.py", "text/x-python")
    await _create_file(db_session, test_user["id"], "README", None)

    response = await client.get("/api/vscode/files", headers=auth_headers)
    assert response.status_code == 200

    payload = response.json()
    assert payload["total"] == 2
    mime_values = {file_info["mime_type"] for file_info in payload["files"]}
    assert "text/x-python" in mime_values
    assert None in mime_values


@pytest.mark.asyncio
async def test_get_file_content_returns_metadata(
    client: AsyncClient,
    auth_headers: dict,
    db_session: AsyncSession,
    test_user: dict,
):
    """Ensure the file content endpoint responds with metadata."""
    file = await _create_file(db_session, test_user["id"], "main.py", "text/x-python")

    response = await client.get(f"/api/vscode/files/{file.id}/content", headers=auth_headers)
    assert response.status_code == 200

    payload = response.json()
    assert payload["id"] == file.id
    assert payload["metadata"]["mime_type"] == "text/x-python"
    assert payload["metadata"]["size"] == 128
