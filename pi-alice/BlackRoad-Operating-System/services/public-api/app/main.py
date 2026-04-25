"""
BlackRoad OS Public API Gateway

API gateway that routes requests to:
- Core API (business logic)
- Operator API (agent orchestration)
- Other microservices (future)
"""
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import time
from datetime import datetime
import platform
from typing import Optional

# App metadata
VERSION = "1.0.0"
COMMIT = os.getenv("RAILWAY_GIT_COMMIT_SHA", "local")[:7]
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Backend service URLs
CORE_API_URL = os.getenv("CORE_API_URL", "http://localhost:8001")
AGENTS_API_URL = os.getenv("AGENTS_API_URL", "http://localhost:8002")

# Create FastAPI app
app = FastAPI(
    title="BlackRoad OS Public API Gateway",
    description="Public-facing API gateway for BlackRoad Operating System",
    version=VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup time
START_TIME = time.time()

# HTTP client for proxying
http_client = httpx.AsyncClient(timeout=30.0)


@app.on_event("shutdown")
async def shutdown_event():
    """Close HTTP client on shutdown"""
    await http_client.aclose()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "BlackRoad OS Public API Gateway",
        "version": VERSION,
        "status": "online",
        "docs": "/api/docs",
        "backends": {
            "core": CORE_API_URL,
            "agents": AGENTS_API_URL
        }
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint for Railway and monitoring systems.
    Also checks health of backend services.
    """
    uptime_seconds = int(time.time() - START_TIME)

    # Check backend health
    backends_status = {
        "core": "unknown",
        "agents": "unknown"
    }

    # Try to ping Core API
    try:
        core_response = await http_client.get(f"{CORE_API_URL}/health", timeout=5.0)
        backends_status["core"] = "healthy" if core_response.status_code == 200 else "unhealthy"
    except Exception:
        backends_status["core"] = "unreachable"

    # Try to ping Agents API
    try:
        agents_response = await http_client.get(f"{AGENTS_API_URL}/health", timeout=5.0)
        backends_status["agents"] = "healthy" if agents_response.status_code == 200 else "unhealthy"
    except Exception:
        backends_status["agents"] = "unreachable"

    # Gateway is healthy if at least one backend is reachable
    is_healthy = any(status in ["healthy", "unhealthy"] for status in backends_status.values())

    return JSONResponse(
        status_code=200 if is_healthy else 503,
        content={
            "status": "healthy" if is_healthy else "degraded",
            "service": "public-api-gateway",
            "version": VERSION,
            "commit": COMMIT,
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "uptime_seconds": uptime_seconds,
            "backends": backends_status
        }
    )


@app.get("/version")
async def version_info():
    """Version information"""
    return {
        "version": VERSION,
        "commit": COMMIT,
        "environment": ENVIRONMENT,
        "python_version": platform.python_version(),
        "deployment": {
            "platform": "Railway",
            "region": os.getenv("RAILWAY_REGION", "unknown"),
            "service_id": os.getenv("RAILWAY_SERVICE_ID", "unknown")
        },
        "backends": {
            "core_api": CORE_API_URL,
            "agents_api": AGENTS_API_URL
        }
    }


# ============================================================================
# PROXY ROUTES
# ============================================================================

@app.api_route("/api/core/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_to_core(path: str, request: Request):
    """
    Proxy all /api/core/* requests to Core API service.
    """
    # Build target URL
    target_url = f"{CORE_API_URL}/api/core/{path}"

    # Get query params
    query_params = dict(request.query_params)

    # Get request body if applicable
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()

    # Forward request
    try:
        response = await http_client.request(
            method=request.method,
            url=target_url,
            params=query_params,
            content=body,
            headers={k: v for k, v in request.headers.items() if k.lower() not in ["host", "content-length"]}
        )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type")
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Core API is unreachable")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Core API timeout")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {str(e)}")


@app.api_route("/api/agents/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_to_agents(path: str, request: Request):
    """
    Proxy all /api/agents/* requests to Agents/Operator API service.
    """
    # Build target URL
    target_url = f"{AGENTS_API_URL}/api/agents/{path}"

    # Get query params
    query_params = dict(request.query_params)

    # Get request body if applicable
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()

    # Forward request
    try:
        response = await http_client.request(
            method=request.method,
            url=target_url,
            params=query_params,
            content=body,
            headers={k: v for k, v in request.headers.items() if k.lower() not in ["host", "content-length"]}
        )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type")
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Agents API is unreachable")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Agents API timeout")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {str(e)}")


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "path": str(request.url.path),
            "message": "The requested resource was not found",
            "hint": "Available routes: /api/core/*, /api/agents/*"
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Custom 500 handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "service": "public-api-gateway"
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=ENVIRONMENT == "development"
    )
