"""
Prism Console - Static File Server

Simple FastAPI server to serve Prism Console static files.
Provides health check endpoints for Railway deployment.
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from datetime import datetime

# App metadata
VERSION = "1.0.0"
COMMIT = os.getenv("RAILWAY_GIT_COMMIT_SHA", "local")[:7]
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Backend service URLs (for injection into status.html)
CORE_API_URL = os.getenv("CORE_API_URL", "https://blackroad-os-core-production.up.railway.app")
PUBLIC_API_URL = os.getenv("PUBLIC_API_URL", "https://blackroad-os-api-production.up.railway.app")
OPERATOR_API_URL = os.getenv("OPERATOR_API_URL", "https://blackroad-os-operator-production.up.railway.app")
PRISM_CONSOLE_URL = os.getenv("PRISM_CONSOLE_URL", "https://blackroad-os-prism-console-production.up.railway.app")

# Create FastAPI app
app = FastAPI(
    title="Prism Console",
    description="BlackRoad OS Administrative Console",
    version=VERSION
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


@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    uptime_seconds = int(time.time() - START_TIME)

    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "prism-console",
            "version": VERSION,
            "commit": COMMIT,
            "environment": ENVIRONMENT,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "uptime_seconds": uptime_seconds
        }
    )


@app.get("/version")
async def version_info():
    """Version information"""
    return {
        "version": VERSION,
        "commit": COMMIT,
        "environment": ENVIRONMENT,
        "deployment": {
            "platform": "Railway",
            "region": os.getenv("RAILWAY_REGION", "unknown")
        }
    }


@app.get("/config.js")
async def config_js():
    """
    Inject environment configuration into JavaScript.
    Allows status.html to access backend URLs.
    """
    js_config = f"""
// Auto-generated config from server
window.ENV = {{
    CORE_API_URL: '{CORE_API_URL}',
    PUBLIC_API_URL: '{PUBLIC_API_URL}',
    OPERATOR_API_URL: '{OPERATOR_API_URL}',
    PRISM_CONSOLE_URL: '{PRISM_CONSOLE_URL}',
    ENVIRONMENT: '{ENVIRONMENT}',
    VERSION: '{VERSION}'
}};
"""
    return FileResponse(
        path=None,
        content=js_config.encode(),
        media_type="application/javascript"
    )


@app.get("/")
async def root():
    """Serve main Prism Console page"""
    return FileResponse("index.html")


@app.get("/status")
async def status_page():
    """Serve status monitoring page"""
    return FileResponse("status.html")


# Mount static files (CSS, JS, images, fonts)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/modules", StaticFiles(directory="modules"), name="modules")
app.mount("/pages", StaticFiles(directory="pages"), name="pages")
app.mount("/styles", StaticFiles(directory="styles"), name="styles")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=ENVIRONMENT == "development"
    )
