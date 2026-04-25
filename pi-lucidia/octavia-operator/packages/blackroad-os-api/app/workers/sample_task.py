"""Celery sample task wiring."""

from __future__ import annotations

from typing import Any

from celery import Celery

from app.core.logging import logger
from app.core.settings import settings

celery_app = Celery(settings.app_name, broker=settings.celery_broker_url)
celery_app.conf.task_default_queue = "default"


@celery_app.task(name="sample_task.log_payload")
def log_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Log the provided payload and echo it back."""

    logger.info("Received payload for sample task", extra={"payload": payload})
    return payload
