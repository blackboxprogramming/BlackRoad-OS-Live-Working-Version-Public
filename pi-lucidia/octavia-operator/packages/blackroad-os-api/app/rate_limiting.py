from __future__ import annotations

from fastapi import Request
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address


def rate_limit_key(request: Request) -> str:
    api_key = request.headers.get("X-BR-KEY")
    return api_key or get_remote_address(request)


limiter = Limiter(key_func=rate_limit_key, default_limits=["100/minute"])
RateLimitExceeded = RateLimitExceeded
