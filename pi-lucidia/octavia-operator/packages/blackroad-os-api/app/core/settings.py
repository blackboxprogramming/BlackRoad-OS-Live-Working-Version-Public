"""Application settings using Pydantic BaseSettings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings loaded from environment."""

    app_name: str = "blackroad-os-api"
    version: str = "0.0.1"
    git_sha: str = Field("unknown", alias="GIT_SHA")
    log_level: str = "INFO"
    celery_broker_url: str = Field(default="memory://", alias="CELERY_BROKER_URL")

    model_config = SettingsConfigDict(
        env_file=(".env", "infra/api.env"), env_file_encoding="utf-8"
    )


settings = Settings()
