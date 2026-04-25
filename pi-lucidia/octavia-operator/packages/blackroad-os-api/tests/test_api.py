import httpx
import pytest
import schemathesis
from schemathesis import checks
from httpx import ASGITransport, AsyncClient
from hypothesis import HealthCheck, settings as hypo_settings
from schemathesis.experimental import OPEN_API_3_1
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.config import Settings, get_settings
from app.generated.router import (
    get_catalog_client,
    get_operator_client,
    get_pack_index_client,
)
from app.main import app

OPEN_API_3_1.enable()


@pytest.fixture
def settings_override():
    get_settings.cache_clear()
    settings = Settings(
        env="test",
        operator_url="https://operator.example.com",
        pack_index_url="https://packs.example.com",
        api_keys=["secret"],
        app_version="1.0.0",
        commit="git-sha",
    )
    operator_transport = httpx.MockTransport(
        lambda request: httpx.Response(
            200,
            json=[{"id": "a1", "name": "Agent One", "status": "ready", "metadata": {}}]
            if request.url.path.endswith("/agents")
            else {"jobId": "job-1"} if request.url.path.endswith("install") else {},
        )
    )
    pack_transport = httpx.MockTransport(
        lambda request: httpx.Response(
            200,
            json={
                "packs": [
                    {"name": "blackroad-os-pack-alpha", "version": "1.0.0", "description": "Alpha"},
                    {"name": "other-pack", "version": "0.1.0"},
                ]
            },
        )
    )

    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[get_catalog_client] = lambda: get_catalog_client(
        settings=settings, transport=operator_transport
    )
    app.dependency_overrides[get_operator_client] = lambda: get_operator_client(
        settings=settings, transport=operator_transport
    )
    app.dependency_overrides[get_pack_index_client] = lambda: get_pack_index_client(
        settings=settings, transport=pack_transport
    )
    yield settings
    app.dependency_overrides.clear()
    get_settings.cache_clear()


@pytest.fixture
async def api_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.mark.asyncio
async def test_health(settings_override, api_client):
    response = await api_client.get("/v1/health")
    body = response.json()
    assert response.status_code == 200
    assert body["ok"] is True
    assert body["version"] == settings_override.api_version
    assert "uptime" in body
    assert response.headers["X-API-Version"] == settings_override.api_version


@pytest.mark.asyncio
async def test_agents_require_api_key(settings_override, api_client):
    response = await api_client.get("/v1/agents")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_agents_proxy(settings_override, api_client):
    response = await api_client.get("/v1/agents", headers={"X-BR-KEY": "secret"})
    body = response.json()
    assert response.status_code == 200
    assert body["ok"] is True
    assert body["agents"][0]["id"] == "a1"
    assert response.headers["X-Agent-Operator-URL"] == str(settings_override.operator_url)


@pytest.mark.asyncio
async def test_packs_listing(settings_override, api_client):
    response = await api_client.get("/v1/packs", headers={"X-BR-KEY": "secret"})
    body = response.json()
    assert response.status_code == 200
    assert body["ok"] is True
    assert len(body["packs"]) == 1
    assert body["packs"][0]["id"] == "alpha"
    assert body["packs"][0]["version"] == "1.0.0"
    assert body["retrievedAt"]


@pytest.mark.asyncio
async def test_pack_install(settings_override, api_client):
    response = await api_client.post(
        "/v1/packs/alpha/install",
        headers={"X-BR-KEY": "secret"},
        json={"version": "1.2.3"},
    )
    body = response.json()
    assert response.status_code == 202
    assert body["ok"] is True
    assert body["jobId"] == "job-1"


schema = schemathesis.from_asgi("/openapi.json", app=app)


@schema.parametrize()
@hypo_settings(max_examples=1, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_openapi_contract(case, settings_override):
    case.checks = (checks.response_schema_conformance,)
    case.headers = case.headers or {}
    case.headers["X-BR-KEY"] = "secret"
    response = case.call_asgi(app=app)
    case.validate_response(response, checks=(checks.response_schema_conformance,))
