"""
BlackRoad OS - Minimal Service Template

A minimal FastAPI service that implements the required syscall endpoints
for BlackRoad OS distributed architecture.

Use this template for:
- Creating new services
- Quick testing and deployment
- Service stub implementations

Required env vars:
- SERVICE_NAME: Name of the service (e.g., "blackroad-os-docs")
- SERVICE_ROLE: Role of the service (e.g., "docs", "web", "api")
- ENVIRONMENT: "production" or "development"
- PORT: Port to run on (default: 8000)
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
import os
import time
import platform
from datetime import datetime
from typing import Dict, Any, Optional

# ============================================================================
# CONFIGURATION
# ============================================================================

# Service metadata
SERVICE_NAME = os.getenv("SERVICE_NAME", "blackroad-os-service")
SERVICE_ROLE = os.getenv("SERVICE_ROLE", "unknown")
VERSION = os.getenv("SERVICE_VERSION", "1.0.0")
COMMIT = os.getenv("RAILWAY_GIT_COMMIT_SHA", "local")[:7]
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Startup time for uptime calculation
START_TIME = time.time()

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title=SERVICE_NAME,
    description=f"BlackRoad OS - {SERVICE_ROLE.title()} Service",
    version=VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_uptime_seconds() -> int:
    """Get service uptime in seconds"""
    return int(time.time() - START_TIME)


def get_identity() -> Dict[str, Any]:
    """Get service identity (syscall API compliant)"""
    uptime = get_uptime_seconds()

    return {
        "service": SERVICE_NAME,
        "role": SERVICE_ROLE,
        "version": VERSION,
        "environment": ENVIRONMENT,
        "dns": {
            "cloudflare": os.getenv("CLOUDFLARE_URL", f"https://{SERVICE_ROLE}.blackroad.systems"),
            "railway": os.getenv("RAILWAY_STATIC_URL", "unknown"),
            "internal": os.getenv("RAILWAY_PRIVATE_URL", f"http://{SERVICE_NAME}.railway.internal:8000")
        },
        "runtime": {
            "railwayHost": os.getenv("RAILWAY_STATIC_URL", "unknown"),
            "internalHost": os.getenv("RAILWAY_PRIVATE_URL", "unknown"),
            "port": int(os.getenv("PORT", 8000)),
            "pid": os.getpid(),
            "uptime": uptime
        },
        "health": {
            "status": "healthy",
            "uptime": uptime,
            "lastCheck": datetime.utcnow().isoformat() + "Z"
        },
        "capabilities": ["http", "static"],  # Add more as needed
        "metadata": {
            "commit": COMMIT,
            "pythonVersion": platform.python_version(),
            "platform": platform.system(),
            "release": platform.release()
        }
    }

# ============================================================================
# CORE ENDPOINTS (Required)
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - Hello World"""
    return HTMLResponse(content=f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{SERVICE_NAME}</title>
        <style>
            body {{
                font-family: 'Courier New', monospace;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #0a0a0a;
                color: #00ff00;
            }}
            h1 {{ color: #00ff00; border-bottom: 2px solid #00ff00; padding-bottom: 10px; }}
            .info {{ background: #1a1a1a; padding: 15px; border-left: 4px solid #00ff00; margin: 20px 0; }}
            .status {{ color: #ffff00; }}
            a {{ color: #00aaff; text-decoration: none; }}
            a:hover {{ text-decoration: underline; }}
            pre {{ background: #1a1a1a; padding: 10px; overflow-x: auto; }}
            .emoji {{ font-size: 2em; }}
        </style>
    </head>
    <body>
        <h1><span class="emoji">🛣️</span> BlackRoad OS - {SERVICE_ROLE.title()} Service</h1>

        <div class="info">
            <p><strong>Service:</strong> {SERVICE_NAME}</p>
            <p><strong>Role:</strong> {SERVICE_ROLE}</p>
            <p><strong>Version:</strong> {VERSION}</p>
            <p><strong>Environment:</strong> {ENVIRONMENT}</p>
            <p><strong>Status:</strong> <span class="status">✓ ONLINE</span></p>
            <p><strong>Uptime:</strong> {get_uptime_seconds()} seconds</p>
        </div>

        <h2>Available Endpoints</h2>
        <ul>
            <li><a href="/health">/health</a> - Basic health check</li>
            <li><a href="/version">/version</a> - Version information</li>
            <li><a href="/v1/sys/identity">/v1/sys/identity</a> - Service identity (syscall API)</li>
            <li><a href="/v1/sys/health">/v1/sys/health</a> - Detailed health (syscall API)</li>
            <li><a href="/api/docs">/api/docs</a> - API documentation (Swagger UI)</li>
            <li><a href="/api/redoc">/api/redoc</a> - API documentation (ReDoc)</li>
        </ul>

        <h2>Hello World Test</h2>
        <pre>
$ curl https://{SERVICE_ROLE}.blackroad.systems/health
{{"status": "healthy", "service": "{SERVICE_ROLE}", "version": "{VERSION}"}}

$ curl https://{SERVICE_ROLE}.blackroad.systems/version
{{"version": "{VERSION}", "commit": "{COMMIT}", "environment": "{ENVIRONMENT}"}}
        </pre>

        <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #333; color: #666;">
            <p>BlackRoad Operating System - Distributed OS Architecture</p>
            <p>Part of the BlackRoad ecosystem | <a href="https://blackroad.systems">blackroad.systems</a></p>
        </footer>
    </body>
    </html>
    """)


@app.get("/health")
async def health_check():
    """
    Basic health check endpoint (Required by Railway and syscall API).
    Returns 200 OK if service is healthy.
    """
    uptime = get_uptime_seconds()

    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": SERVICE_ROLE,
            "version": VERSION,
            "commit": COMMIT,
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "uptime_seconds": uptime
        }
    )


@app.get("/version")
async def version_info():
    """
    Version information endpoint (Required by syscall API).
    Returns detailed version and build information.
    """
    return {
        "version": VERSION,
        "service": SERVICE_NAME,
        "role": SERVICE_ROLE,
        "commit": COMMIT,
        "environment": ENVIRONMENT,
        "buildTime": os.getenv("BUILD_TIME", "unknown"),
        "pythonVersion": platform.python_version(),
        "deployment": {
            "platform": "Railway",
            "region": os.getenv("RAILWAY_REGION", "unknown"),
            "serviceId": os.getenv("RAILWAY_SERVICE_ID", "unknown"),
            "deploymentId": os.getenv("RAILWAY_DEPLOYMENT_ID", "unknown"),
            "staticUrl": os.getenv("RAILWAY_STATIC_URL", "unknown")
        }
    }

# ============================================================================
# SYSCALL API ENDPOINTS (BlackRoad OS Standard)
# ============================================================================

@app.get("/v1/sys/identity")
async def sys_identity():
    """
    Get complete service identity (syscall API).
    Returns full identity object including DNS, runtime, and health info.
    """
    return get_identity()


@app.get("/v1/sys/health")
async def sys_health():
    """
    Detailed health check with extended metrics (syscall API).
    Returns comprehensive health information.
    """
    uptime = get_uptime_seconds()

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime": uptime,
        "memory": {
            "rss": 0,  # TODO: Add actual memory metrics
            "heapTotal": 0,
            "heapUsed": 0,
            "external": 0
        },
        "checks": {
            "self": {
                "status": "ok",
                "message": "Service is running"
            },
            # Add more health checks here (database, redis, etc.)
        },
        "service": {
            "name": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "version": VERSION
        }
    }


@app.get("/v1/sys/version")
async def sys_version():
    """
    Extended version information (syscall API).
    Returns comprehensive version and build details.
    """
    return version_info()


@app.get("/v1/sys/config")
async def sys_config():
    """
    Get non-sensitive service configuration (syscall API).
    Returns partial config without secrets.
    """
    return {
        "service": {
            "name": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "version": VERSION,
            "environment": ENVIRONMENT,
            "port": int(os.getenv("PORT", 8000))
        },
        "features": {
            "http": True,
            "static": True,
            "rpc": False,  # Not implemented in minimal template
            "events": False,  # Not implemented in minimal template
            "jobs": False,  # Not implemented in minimal template
            "state": False  # Not implemented in minimal template
        },
        "cors": {
            "enabled": True,
            "allowedOrigins": ALLOWED_ORIGINS
        }
    }

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "path": str(request.url.path),
            "message": "The requested resource was not found",
            "service": SERVICE_NAME,
            "suggestion": "Try /health, /version, or /v1/sys/identity"
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
            "service": SERVICE_NAME
        }
    )

# ============================================================================
# STARTUP
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Runs on application startup"""
    print(f"🛣️ Starting {SERVICE_NAME}...")
    print(f"   Role: {SERVICE_ROLE}")
    print(f"   Version: {VERSION}")
    print(f"   Environment: {ENVIRONMENT}")
    print(f"   Port: {os.getenv('PORT', 8000)}")
    print(f"✓ Service is ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Runs on application shutdown"""
    print(f"Shutting down {SERVICE_NAME}...")
    print("✓ Shutdown complete")

# ============================================================================
# MAIN (for local development)
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    reload = ENVIRONMENT == "development"

    print(f"\n{'='*60}")
    print(f"BlackRoad OS - {SERVICE_ROLE.title()} Service")
    print(f"{'='*60}")
    print(f"Service: {SERVICE_NAME}")
    print(f"Version: {VERSION}")
    print(f"Environment: {ENVIRONMENT}")
    print(f"Port: {port}")
    print(f"Reload: {reload}")
    print(f"{'='*60}\n")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
        log_level="info"
    )
