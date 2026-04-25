from __future__ import annotations

import secrets
from typing import List, Optional

from fastapi import Depends, Header, HTTPException, status

from app.config import Settings, get_settings


def get_api_keys(settings: Settings = Depends(get_settings)) -> List[str]:
    return settings.allowed_api_keys


def api_key_auth(
    x_br_key: Optional[str] = Header(None, alias="X-BR-KEY"),
    api_keys: List[str] = Depends(get_api_keys),
):
    if not api_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid or missing API key."},
        )

    if x_br_key and any(secrets.compare_digest(x_br_key, key) for key in api_keys):
        return x_br_key

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "UNAUTHORIZED", "message": "Invalid or missing API key."},
    )
