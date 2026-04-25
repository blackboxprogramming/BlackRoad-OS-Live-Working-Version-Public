from __future__ import annotations

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings


class ResponseHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        override = getattr(request.app, "dependency_overrides", {}).get(get_settings)
        settings = override() if override else get_settings()
        response = await call_next(request)
        response.headers["X-API-Version"] = settings.api_version
        if settings.operator_url:
            response.headers["X-Agent-Operator-URL"] = str(settings.operator_url)
        return response
