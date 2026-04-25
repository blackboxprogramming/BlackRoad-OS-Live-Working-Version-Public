"""Tests for system endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_version_endpoint(client: AsyncClient):
    """Test /api/system/version endpoint"""
    response = await client.get("/api/system/version")
    assert response.status_code == 200

    data = response.json()
    assert "version" in data
    assert "build_time" in data
    assert "env" in data
    assert "git_sha" in data
    assert "app_name" in data
    assert data["app_name"] == "BlackRoad Operating System"


@pytest.mark.asyncio
async def test_public_config_endpoint(client: AsyncClient):
    """Test /api/system/config/public endpoint"""
    response = await client.get("/api/system/config/public")
    assert response.status_code == 200

    data = response.json()
    assert "environment" in data
    assert "app_name" in data
    assert "version" in data
    assert "features" in data
    assert "limits" in data
    assert "external_services" in data

    # Verify features structure
    features = data["features"]
    assert "blockchain_enabled" in features
    assert "ai_agents_enabled" in features
    assert "video_streaming_enabled" in features

    # Verify limits structure
    limits = data["limits"]
    assert "max_upload_size_mb" in limits
    assert "session_timeout_minutes" in limits


@pytest.mark.asyncio
async def test_os_state_endpoint(client: AsyncClient):
    """Test /api/system/os/state endpoint (stub)"""
    response = await client.get("/api/system/os/state")
    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"
    assert "active_windows" in data
    assert "running_apps" in data
    assert "system_resources" in data
    assert isinstance(data["active_windows"], list)
    assert isinstance(data["running_apps"], list)
