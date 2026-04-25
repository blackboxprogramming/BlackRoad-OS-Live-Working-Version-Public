"""Logging configuration utilities."""

import logging

from app.core.settings import settings


def configure_logging(level: str | int | None = None) -> None:
    """Configure application-wide logging.

    Args:
        level: Optional logging level override. Defaults to settings.log_level.
    """

    resolved_level: int | str = level or settings.log_level
    logging.basicConfig(
        level=resolved_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


logger = logging.getLogger(settings.app_name)
