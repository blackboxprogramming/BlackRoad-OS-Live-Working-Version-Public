"""v1 API router with basic service endpoints."""

from time import perf_counter

from fastapi import APIRouter, Request

router = APIRouter()
@router.get("/health")
def health(request: Request) -> dict[str, float | str]:
    """Return liveness information with uptime."""

    start_time: float = request.app.state.start_time
    uptime = perf_counter() - start_time
    return {"status": "ok", "uptime": round(uptime, 3)}


@router.get("/version")
def version(request: Request) -> dict[str, str]:
    """Return the running application version metadata."""

    app_settings = request.app.state.settings
    return {"version": app_settings.version, "commit": app_settings.git_sha}
