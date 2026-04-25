"""
BlackRoad OS Core API

Core business logic API with health checks and version info.
Serves as the source of truth for all core operations.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time
from datetime import datetime
import platform

# App metadata
VERSION = "1.0.0"
COMMIT = os.getenv("RAILWAY_GIT_COMMIT_SHA", "local")[:7]
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Create FastAPI app
app = FastAPI(
    title="BlackRoad OS Core API",
    description="Core business logic API for BlackRoad Operating System",
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

# Startup time for uptime calculation
START_TIME = time.time()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "BlackRoad OS Core API",
        "version": VERSION,
        "status": "online",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint for Railway and monitoring systems.
    Returns 200 OK if service is healthy.
    """
    uptime_seconds = int(time.time() - START_TIME)

    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "core-api",
            "version": VERSION,
            "commit": COMMIT,
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "uptime_seconds": uptime_seconds,
            "python_version": platform.python_version(),
            "system": {
                "platform": platform.system(),
                "release": platform.release(),
                "machine": platform.machine()
            }
        }
    )


@app.get("/version")
async def version_info():
    """
    Version information endpoint.
    Returns detailed version and build information.
    """
    return {
        "version": VERSION,
        "commit": COMMIT,
        "environment": ENVIRONMENT,
        "build_time": os.getenv("BUILD_TIME", "unknown"),
        "python_version": platform.python_version(),
        "deployment": {
            "platform": "Railway",
            "region": os.getenv("RAILWAY_REGION", "unknown"),
            "service_id": os.getenv("RAILWAY_SERVICE_ID", "unknown"),
            "deployment_id": os.getenv("RAILWAY_DEPLOYMENT_ID", "unknown")
        }
    }


@app.get("/api/core/status")
async def core_status():
    """
    Core service status with detailed health information.
    Used by Prism Console and monitoring dashboards.
    """
    uptime_seconds = int(time.time() - START_TIME)
    uptime_hours = uptime_seconds / 3600

    return {
        "service": "core-api",
        "status": "operational",
        "version": VERSION,
        "uptime": {
            "seconds": uptime_seconds,
            "hours": round(uptime_hours, 2),
            "human": f"{int(uptime_hours)}h {int((uptime_hours % 1) * 60)}m"
        },
        "environment": ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "dependencies": {
            "database": "not_configured",  # TODO: Add DB health check
            "cache": "not_configured"      # TODO: Add Redis health check
        }
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "path": str(request.url.path),
            "message": "The requested resource was not found"
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
            "service": "core-api"
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
