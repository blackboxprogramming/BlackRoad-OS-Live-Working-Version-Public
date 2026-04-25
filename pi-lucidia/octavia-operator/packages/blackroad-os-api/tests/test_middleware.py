import json

import pytest
from fastapi import Request

from app.errors import UpstreamError
from app.middleware.auth import api_key_auth
from app.middleware.errors import ErrorHandlerMiddleware


@pytest.mark.asyncio
async def test_error_handler_upstream_error():
    middleware = ErrorHandlerMiddleware(app=None)
    request = Request(scope={"type": "http", "method": "GET", "path": "/"})

    async def call_next(_):
        raise UpstreamError(source="packs", message="boom", status_code=502, details={"foo": "bar"})

    response = await middleware.dispatch(request, call_next)
    body = response.body.decode()
    data = json.loads(body)
    assert response.status_code == 502
    assert data["error"]["code"] == "UPSTREAM_ERROR"
    assert data["error"]["details"]["foo"] == "bar"


@pytest.mark.asyncio
async def test_error_handler_generic_error():
    middleware = ErrorHandlerMiddleware(app=None)
    request = Request(scope={"type": "http", "method": "GET", "path": "/"})

    async def call_next(_):
        raise RuntimeError("unexpected")

    response = await middleware.dispatch(request, call_next)
    data = json.loads(response.body.decode())
    assert response.status_code == 500
    assert data["error"]["code"] == "INTERNAL_ERROR"


def test_api_key_auth_raises_on_missing_key():
    with pytest.raises(Exception):
        api_key_auth(x_br_key=None, api_keys=[])
