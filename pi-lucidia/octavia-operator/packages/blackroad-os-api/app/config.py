from __future__ import annotations

import os
from datetime import datetime
from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    env: str = Field("development", alias="NODE_ENV")
    public_api_url: Optional[AnyHttpUrl] = Field(None, alias="PUBLIC_API_URL")
    operator_url: Optional[AnyHttpUrl] = Field(None, alias="OPERATOR_URL")
    pack_index_url: Optional[AnyHttpUrl] = Field(None, alias="PACK_INDEX_URL")

    api_keys: List[str] = Field(default_factory=list, alias="API_KEYS")
    public_api_key: Optional[str] = Field(None, alias="PUBLIC_API_KEY")
    app_version: str = Field("0.1.0", alias="APP_VERSION")
    build_time: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(), alias="BUILD_TIME"
    )
    commit: Optional[str] = Field(None, alias="GIT_COMMIT")

    log_level: str = Field("info", alias="LOG_LEVEL")
    port: int = Field(8000, alias="PORT")
    request_timeout_ms: int = Field(10000, alias="REQUEST_TIMEOUT_MS")

    model_config = {
        "case_sensitive": False,
        "populate_by_name": True,
    }

    @field_validator("commit", mode="before")
    @classmethod
    def prefer_railway_commit(cls, value: Optional[str]) -> Optional[str]:
        return value or os.getenv("RAILWAY_GIT_COMMIT_SHA")

    @field_validator("api_keys", mode="before")
    @classmethod
    def split_keys(cls, value: Optional[str]) -> List[str]:
        if value in (None, ""):
            return []
        if isinstance(value, str):
            return [key.strip() for key in value.split(",") if key.strip()]
        return value

    @property
    def request_timeout_seconds(self) -> float:
        return max(self.request_timeout_ms, 0) / 1000

    @property
    def allowed_api_keys(self) -> List[str]:
        keys: List[str] = []
        keys.extend(self.api_keys)
        if self.public_api_key:
            keys.append(self.public_api_key)
        # remove empties while preserving order
        return [key for key in keys if key]

    @property
    def api_version(self) -> str:
        return self.commit or self.app_version


@lru_cache()
def get_settings() -> Settings:
    return Settings()
