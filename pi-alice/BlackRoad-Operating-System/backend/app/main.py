"""Main FastAPI application"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import platform
import time
from datetime import datetime, timezone

from app.config import settings
from app.database import async_engine, Base
from app.redis_client import close_redis
from app.routers import (
    auth, email, social, video, files, blockchain, ai_chat, devices, miner,
    digitalocean, github, huggingface, vscode, games, browser, dashboard,
    railway, vercel, stripe, twilio, slack, discord, sentry, api_health, agents,
    capture, identity_center, notifications_center, creator, compliance_ops,
    search, cloudflare, system, webhooks, prism_static, ip_vault, leitl, cognition,
    cece, br95, ollama
)
from app.services.crypto import rotate_plaintext_wallet_keys


openapi_tags = [
    {"name": "prism", "description": "Prism Console - Administrative interface for job queue, events, and metrics"},
    {"name": "railway", "description": "Railway deployment management"},
    {"name": "vercel", "description": "Vercel project automation"},
    {"name": "stripe", "description": "Stripe billing integrations"},
    {"name": "twilio", "description": "Twilio messaging"},
    {"name": "slack", "description": "Slack workspace automation"},
    {"name": "discord", "description": "Discord community integrations"},
    {"name": "sentry", "description": "Sentry monitoring hooks"},
    {"name": "health", "description": "BlackRoad OS service health"},
    {"name": "agents", "description": "BlackRoad Agent Library - 208 AI agents across 10 categories"},
    {"name": "cloudflare", "description": "Cloudflare zone, DNS, and Worker scaffolding"},
    {"name": "IP Vault", "description": "Cryptographic proof-of-origin for ideas and intellectual property"},
    {"name": "LEITL", "description": "Live Everyone In The Loop - Multi-agent collaboration with WebDAV context"},
    {"name": "Cognition", "description": "Cece Cognition Framework - 15-step reasoning + 6-step architecture + multi-agent orchestration"},
    {"name": "Cece Ultra", "description": "Full stack cognition engine with 15-step pipeline and architecture layer"},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("Starting BlackRoad Operating System Backend...")

    # Create database tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Database tables created successfully")
    print(f"Server running on {settings.ENVIRONMENT} mode")

    # Re-encrypt any legacy plaintext wallet keys before serving requests
    updated_users, updated_wallets = await rotate_plaintext_wallet_keys()
    if updated_users or updated_wallets:
        print(
            f"Re-encrypted {updated_users} user keys and {updated_wallets} wallet keys"
        )

    yield

    # Shutdown
    print("Shutting down...")
    await close_redis()
    await async_engine.dispose()
    print("Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for BlackRoad Operating System - A Windows 95-inspired web OS",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    openapi_tags=openapi_tags,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Include routers
app.include_router(auth.router)
app.include_router(email.router)
app.include_router(social.router)
app.include_router(video.router)
app.include_router(files.router)
app.include_router(blockchain.router)
app.include_router(ai_chat.router)
app.include_router(devices.router)
app.include_router(miner.router)
app.include_router(digitalocean.router)
app.include_router(github.router)
app.include_router(huggingface.router)
app.include_router(vscode.router)
app.include_router(games.router)
app.include_router(browser.router)
app.include_router(dashboard.router)

# New API integrations
app.include_router(railway.router)
app.include_router(vercel.router)
app.include_router(stripe.router)
app.include_router(twilio.router)
app.include_router(slack.router)
app.include_router(discord.router)
app.include_router(sentry.router)
app.include_router(capture.router)
app.include_router(identity_center.router)
app.include_router(notifications_center.router)
app.include_router(creator.router)
app.include_router(compliance_ops.router)
app.include_router(search.router)
app.include_router(cloudflare.router)
app.include_router(system.router)

# API health monitoring
app.include_router(api_health.router)

# Agent Library
app.include_router(agents.router)

# IP Vault
app.include_router(ip_vault.router)

# LEITL Protocol - Live Everyone In The Loop
app.include_router(leitl.router)

# Cognition Framework - Cece + Multi-Agent Orchestration
app.include_router(cognition.router)
# Cece Ultra - Full Stack Cognition
app.include_router(cece.router)

# GitHub Webhooks (Phase Q automation)
app.include_router(webhooks.router)

# BR-95 Desktop OS Data APIs + WebSocket
app.include_router(br95.router)

# Ollama local LLM proxy
app.include_router(ollama.router)

# Prism Console (Phase 2.5) - Admin interface at /prism
prism_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "prism-console")
if os.path.exists(prism_dir):
    app.mount("/prism", StaticFiles(directory=prism_dir, html=True), name="prism")
    print(f"✅ Prism Console mounted at /prism")
# Prism Console (must be before StaticFiles mount to take precedence)
app.include_router(prism_static.router)


# Static file serving for the BlackRoad OS front-end
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    # Mount static files (JS, CSS, images)
    app.mount("/static", StaticFiles(directory=static_dir, html=True), name="static")

    # Serve index.html at root
    @app.get("/")
    async def serve_frontend():
        """Serve the BlackRoad OS desktop interface"""
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "docs": "/api/docs",
            "prism": "/prism",
            "status": "operational",
            "note": "Front-end not found. API is operational."
        }
else:
    # Fallback if static directory doesn't exist
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "docs": "/api/docs",
            "prism": "/prism",
            "status": "operational",
            "note": "API-only mode. Front-end not deployed."
        }


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": "core-api",
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/version")
async def version_info():
    """Version information endpoint"""

    now = datetime.now(timezone.utc)

    return {
        "service": "core-api",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": now.isoformat(),
        "commit": os.getenv("GIT_COMMIT", os.getenv("GIT_SHA", "unknown")),
        "built_at": os.getenv("BUILD_TIMESTAMP", now.isoformat()),
        "python_version": platform.python_version(),
        "platform": platform.system(),
    }


# API info
@app.get("/api")
async def api_info():
    """API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "endpoints": {
            "auth": "/api/auth",
            "email": "/api/email",
            "social": "/api/social",
            "videos": "/api/videos",
            "files": "/api/files",
            "blockchain": "/api/blockchain",
            "ai_chat": "/api/ai-chat",
            "devices": "/api/devices",
            "miner": "/api/miner",
            "digitalocean": "/api/digitalocean",
            "github": "/api/github",
            "huggingface": "/api/huggingface",
            "vscode": "/api/vscode",
            "games": "/api/games",
            "browser": "/api/browser",
            "dashboard": "/api/dashboard",
            "railway": "/api/railway",
            "vercel": "/api/vercel",
            "stripe": "/api/stripe",
            "twilio": "/api/twilio",
            "slack": "/api/slack",
            "discord": "/api/discord",
            "sentry": "/api/sentry",
            "health": "/api/health",
            "agents": "/api/agents"
        },
        "documentation": {
            "swagger": "/api/docs",
            "redoc": "/api/redoc",
            "openapi": "/api/openapi.json"
        }
    }
