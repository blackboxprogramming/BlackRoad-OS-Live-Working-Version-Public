"""Smoke tests for health and version endpoints."""

from fastapi.testclient import TestClient

from app.core.settings import settings
from app.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["uptime"] >= 0


def test_version_endpoint() -> None:
    response = client.get("/version")
    assert response.status_code == 200
    assert response.json() == {"version": settings.version, "commit": settings.git_sha}
