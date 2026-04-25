"""Operator Engine Configuration"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class OperatorSettings(BaseSettings):
    """Operator engine settings"""

    # Application
    APP_NAME: str = "BlackRoad Operator Engine"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    # Scheduler
    SCHEDULER_INTERVAL_SECONDS: int = 60
    MAX_CONCURRENT_JOBS: int = 5
    JOB_TIMEOUT_SECONDS: int = 300

    # Database (inherited from main backend)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = OperatorSettings()
