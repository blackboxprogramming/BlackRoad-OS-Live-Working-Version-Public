import httpx
import pytest

from app.clients.catalog_client import CatalogClient
from app.clients.operator_client import OperatorClient
from app.clients.pack_index_client import PackIndexClient
from app.errors import UpstreamError, build_error_response


@pytest.mark.asyncio
async def test_pack_index_requires_url():
    client = PackIndexClient(index_url=None, default_timeout=0.1)
    with pytest.raises(UpstreamError) as exc:
        await client.list_packs()
    assert exc.value.status_code == 502
    assert exc.value.detail == "PACK_INDEX_URL not configured"


@pytest.mark.asyncio
async def test_catalog_client_requires_base_url():
    client = CatalogClient(base_url=None, default_timeout=0.1)
    with pytest.raises(UpstreamError) as exc:
        await client.list_agents()
    assert exc.value.status_code == 502


@pytest.mark.asyncio
async def test_catalog_client_invalid_json():
    transport = httpx.MockTransport(lambda request: httpx.Response(200, text="not json"))
    client = CatalogClient(base_url="https://example.com", default_timeout=0.1, transport=transport)
    with pytest.raises(UpstreamError) as exc:
        await client.list_agents()
    assert exc.value.status_code == 502
    assert "invalid JSON" in exc.value.detail


@pytest.mark.asyncio
async def test_operator_client_http_error():
    transport = httpx.MockTransport(lambda request: httpx.Response(500, json={"error": "boom"}))
    client = OperatorClient(base_url="https://example.com", default_timeout=0.1, transport=transport)
    with pytest.raises(UpstreamError) as exc:
        await client.enqueue_install("alpha", None)
    assert exc.value.status_code == 500
    assert "operator upstream returned error" in exc.value.detail


@pytest.mark.asyncio
async def test_operator_client_requires_base_url():
    client = OperatorClient(base_url=None, default_timeout=0.1)
    with pytest.raises(UpstreamError) as exc:
        await client.enqueue_install("alpha", None)
    assert exc.value.status_code == 502


@pytest.mark.asyncio
async def test_pack_index_timeout():
    def raise_timeout(request):
        raise httpx.TimeoutException("boom")

    transport = httpx.MockTransport(raise_timeout)
    client = PackIndexClient(index_url="https://packs.example.com", default_timeout=0.1, transport=transport)
    with pytest.raises(UpstreamError) as exc:
        await client.list_packs()
    assert exc.value.status_code == 504


@pytest.mark.asyncio
async def test_pack_index_http_error():
    transport = httpx.MockTransport(lambda request: httpx.Response(500, text="error"))
    client = PackIndexClient(index_url="https://packs.example.com", default_timeout=0.1, transport=transport)
    with pytest.raises(UpstreamError) as exc:
        await client.list_packs()
    assert exc.value.status_code == 500


@pytest.mark.asyncio
async def test_pack_index_invalid_json():
    transport = httpx.MockTransport(lambda request: httpx.Response(200, text="oops"))
    client = PackIndexClient(index_url="https://packs.example.com", default_timeout=0.1, transport=transport)
    with pytest.raises(UpstreamError) as exc:
        await client.list_packs()
    assert "invalid JSON" in exc.value.detail


@pytest.mark.asyncio
async def test_catalog_client_http_status_error():
    transport = httpx.MockTransport(lambda request: httpx.Response(500, text="fail"))
    client = CatalogClient(base_url="https://example.com", default_timeout=0.1, transport=transport)
    with pytest.raises(UpstreamError) as exc:
        await client.list_agents()
    assert exc.value.status_code == 500


def test_build_error_response_includes_details_and_request():
    payload = build_error_response("CODE", "message", "req-1", {"extra": True})
    assert payload["error"]["details"] == {"extra": True}
    assert payload["error"]["requestId"] == "req-1"
    assert payload["error"]["code"] == "CODE"
