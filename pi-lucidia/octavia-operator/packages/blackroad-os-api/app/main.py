"""Application entrypoint for blackroad-os-api."""

from time import perf_counter

from fastapi import FastAPI

from app.api.v1.router import router as v1_router
from app.core.logging import configure_logging
from app.core.settings import settings
from app.workers.sample_task import celery_app


def create_app() -> FastAPI:
    """Instantiate the FastAPI application."""

    configure_logging()
    application = FastAPI(title=settings.app_name, version=settings.version)
    application.state.settings = settings
    # TODO(celery-integration): Celery app is stored for future use. Integrate Celery tasks with FastAPI endpoints in upcoming releases.
    application.state.celery_app = celery_app
    application.state.start_time = perf_counter()

    # TODO(api-next): add authentication, rate limiting, and tracing middleware.
    application.include_router(v1_router)
    return application


app = create_app()
__all__ = ["app"]
import pathlib
import yaml
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app import __version__
from app.config import get_settings
from app.generated import models  # noqa: F401
from app.generated.router import router as generated_router
from app.middleware.errors import ErrorHandlerMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.response_headers import ResponseHeaderMiddleware
from app.rate_limiting import RateLimitExceeded as RateLimitExceededType, limiter

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
OPENAPI_PATH = BASE_DIR / "openapi.yaml"


app = FastAPI(
    title="BlackRoad OS Public API",
    description="Public-facing gateway for BlackRoad services",
    version=__version__,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceededType, rate_limit_handler)

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(ResponseHeaderMiddleware)
app.add_middleware(RequestIdMiddleware)
app.add_middleware(ErrorHandlerMiddleware)

app.include_router(generated_router)

# retain original generator to avoid recursion when overriding
original_openapi = app.openapi


@app.get("/", include_in_schema=False)
async def index():
    return {"message": "BlackRoad public API gateway", "docs": "/docs"}


def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    from app.errors import build_error_response

    payload = build_error_response(
        code="RATE_LIMIT_EXCEEDED",
        message=str(exc.detail) if getattr(exc, "detail", None) else "Too many requests",
        request_id=getattr(request.state, "request_id", None),
    )
    return JSONResponse(status_code=429, content=payload)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    if OPENAPI_PATH.exists():
        with OPENAPI_PATH.open("r", encoding="utf-8") as handle:
            schema = yaml.safe_load(handle)
            app.openapi_schema = schema
            return app.openapi_schema
    return original_openapi()


app.openapi = custom_openapi
