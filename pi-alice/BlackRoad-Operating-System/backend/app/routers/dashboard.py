"""
Unified Services Dashboard API Router

Provides a comprehensive overview of all integrated services:
- Service health status
- Usage statistics
- Quick actions
- Recent activity
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Integer
from typing import Dict, List, Any
from datetime import datetime, timedelta
import os

from ..database import get_db
from ..auth import get_current_user
from ..models import User, Device, Email, Post, Video, File, Conversation, Block, Transaction
from pydantic import BaseModel
from ..utils import utc_now

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class ServiceStatus(BaseModel):
    name: str
    status: str  # online, offline, degraded
    enabled: bool
    connected: bool
    last_check: str


@router.get("/overview")
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive dashboard overview with all services and stats
    """

    # Check which services are configured
    digital_ocean_token = os.getenv("DIGITAL_OCEAN_API_KEY") or os.getenv(
        "DIGITALOCEAN_TOKEN"
    )
    services_config = {
        "digitalocean": bool(digital_ocean_token),
        "github": bool(os.getenv("GITHUB_TOKEN")),
        "huggingface": bool(os.getenv("HUGGINGFACE_TOKEN")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "aws_s3": bool(os.getenv("AWS_ACCESS_KEY_ID")),
        "smtp": bool(os.getenv("SMTP_HOST")),
    }

    # Get user statistics
    stats = await get_user_stats(db, current_user)

    # Service status
    services = [
        {
            "name": "Email",
            "icon": "📧",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"total": stats["email"]["total"], "unread": stats["email"]["unread"]},
            "endpoint": "/api/email"
        },
        {
            "name": "Social Media",
            "icon": "🌐",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"posts": stats["social"]["posts"], "followers": stats["social"]["followers"]},
            "endpoint": "/api/social"
        },
        {
            "name": "Blockchain",
            "icon": "⛓️",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"balance": stats["blockchain"]["balance"], "transactions": stats["blockchain"]["transactions"]},
            "endpoint": "/api/blockchain"
        },
        {
            "name": "Mining",
            "icon": "⛏️",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"hashrate": stats["mining"]["hashrate"], "blocks_mined": stats["mining"]["blocks_mined"]},
            "endpoint": "/api/miner"
        },
        {
            "name": "AI Assistant",
            "icon": "🤖",
            "status": "online" if services_config["openai"] else "offline",
            "enabled": services_config["openai"],
            "connected": services_config["openai"],
            "stats": {"conversations": stats["ai"]["conversations"], "messages": stats["ai"]["messages"]},
            "endpoint": "/api/ai-chat"
        },
        {
            "name": "File Storage",
            "icon": "📁",
            "status": "online" if services_config["aws_s3"] else "degraded",
            "enabled": True,
            "connected": services_config["aws_s3"],
            "stats": {"files": stats["files"]["total"], "storage_used": stats["files"]["storage_used"]},
            "endpoint": "/api/files"
        },
        {
            "name": "Video Platform",
            "icon": "🎬",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"videos": stats["videos"]["total"], "views": stats["videos"]["views"]},
            "endpoint": "/api/videos"
        },
        {
            "name": "Devices (IoT/Pi)",
            "icon": "🥧",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"total": stats["devices"]["total"], "online": stats["devices"]["online"]},
            "endpoint": "/api/devices"
        },
        {
            "name": "DigitalOcean",
            "icon": "🌊",
            "status": "online" if services_config["digitalocean"] else "offline",
            "enabled": services_config["digitalocean"],
            "connected": services_config["digitalocean"],
            "stats": {"droplets": 0, "spaces": 0},
            "endpoint": "/api/digitalocean"
        },
        {
            "name": "GitHub",
            "icon": "🐙",
            "status": "online" if services_config["github"] else "offline",
            "enabled": services_config["github"],
            "connected": services_config["github"],
            "stats": {"repos": 0, "notifications": 0},
            "endpoint": "/api/github"
        },
        {
            "name": "Hugging Face",
            "icon": "🤗",
            "status": "online" if services_config["huggingface"] else "offline",
            "enabled": services_config["huggingface"],
            "connected": services_config["huggingface"],
            "stats": {"models": 0, "inferences": 0},
            "endpoint": "/api/huggingface"
        },
        {
            "name": "VS Code",
            "icon": "💻",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"files": stats["files"]["total"], "projects": 1},
            "endpoint": "/api/vscode"
        },
        {
            "name": "Games",
            "icon": "🎮",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"cities": 1, "characters": 1, "worlds": 1},
            "endpoint": "/api/games"
        },
        {
            "name": "Browser",
            "icon": "🌍",
            "status": "online",
            "enabled": True,
            "connected": True,
            "stats": {"bookmarks": 4, "history": 3},
            "endpoint": "/api/browser"
        }
    ]

    # System health
    system_health = {
        "overall_status": "healthy",
        "services_online": sum(1 for s in services if s["status"] == "online"),
        "services_total": len(services),
        "uptime": "99.9%",
        "response_time_ms": 45
    }

    return {
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "wallet_address": current_user.wallet_address,
            "balance": current_user.balance
        },
        "services": services,
        "system_health": system_health,
        "timestamp": utc_now().isoformat()
    }


@router.get("/services")
async def list_all_services(
    current_user: User = Depends(get_current_user)
):
    """List all available services with configuration status"""
    services = [
        {
            "id": "email",
            "name": "RoadMail",
            "description": "Email client with folders and threading",
            "category": "communication",
            "icon": "📧",
            "configured": True
        },
        {
            "id": "social",
            "name": "BlackRoad Social",
            "description": "Social media platform with posts, likes, and follows",
            "category": "communication",
            "icon": "🌐",
            "configured": True
        },
        {
            "id": "blockchain",
            "name": "RoadChain Explorer",
            "description": "Blockchain and cryptocurrency wallet",
            "category": "finance",
            "icon": "⛓️",
            "configured": True
        },
        {
            "id": "miner",
            "name": "RoadCoin Miner",
            "description": "Cryptocurrency mining dashboard",
            "category": "finance",
            "icon": "⛏️",
            "configured": True
        },
        {
            "id": "ai_chat",
            "name": "AI Assistant",
            "description": "Conversational AI powered by OpenAI",
            "category": "productivity",
            "icon": "🤖",
            "configured": bool(os.getenv("OPENAI_API_KEY"))
        },
        {
            "id": "files",
            "name": "File Explorer",
            "description": "File storage with folders and sharing",
            "category": "productivity",
            "icon": "📁",
            "configured": True
        },
        {
            "id": "videos",
            "name": "BlackStream",
            "description": "Video platform with upload and streaming",
            "category": "media",
            "icon": "🎬",
            "configured": True
        },
        {
            "id": "devices",
            "name": "Device Manager",
            "description": "IoT and Raspberry Pi management",
            "category": "infrastructure",
            "icon": "🥧",
            "configured": True
        },
        {
            "id": "digitalocean",
            "name": "DigitalOcean",
            "description": "Cloud infrastructure management",
            "category": "infrastructure",
            "icon": "🌊",
            "configured": bool(digital_ocean_token)
        },
        {
            "id": "github",
            "name": "GitHub",
            "description": "Repository and code management",
            "category": "development",
            "icon": "🐙",
            "configured": bool(os.getenv("GITHUB_TOKEN"))
        },
        {
            "id": "huggingface",
            "name": "Hugging Face",
            "description": "AI models and inference",
            "category": "ai",
            "icon": "🤗",
            "configured": bool(os.getenv("HUGGINGFACE_TOKEN"))
        },
        {
            "id": "vscode",
            "name": "VS Code",
            "description": "Code editor with syntax highlighting",
            "category": "development",
            "icon": "💻",
            "configured": True
        },
        {
            "id": "games",
            "name": "Games",
            "description": "City builder, life sim, and voxel worlds",
            "category": "entertainment",
            "icon": "🎮",
            "configured": True
        },
        {
            "id": "browser",
            "name": "RoadView Browser",
            "description": "Web browser with bookmarks and history",
            "category": "productivity",
            "icon": "🌍",
            "configured": True
        }
    ]

    categories = {}
    for service in services:
        category = service["category"]
        if category not in categories:
            categories[category] = []
        categories[category].append(service)

    return {
        "services": services,
        "categories": categories,
        "total": len(services),
        "configured": sum(1 for s in services if s["configured"])
    }


@router.get("/activity")
async def get_recent_activity(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent activity across all services"""
    # In production, aggregate from all services
    # For now, return mock activity feed
    activities = [
        {
            "id": 1,
            "service": "email",
            "icon": "📧",
            "action": "Received new email",
            "description": "Meeting reminder from Sarah",
            "timestamp": (utc_now() - timedelta(minutes=5)).isoformat()
        },
        {
            "id": 2,
            "service": "blockchain",
            "icon": "⛓️",
            "action": "Transaction completed",
            "description": "Sent 10 RoadCoins to wallet abc123",
            "timestamp": (utc_now() - timedelta(minutes=15)).isoformat()
        },
        {
            "id": 3,
            "service": "miner",
            "icon": "⛏️",
            "action": "Block mined",
            "description": "Mined block #1234, earned 50 RoadCoins",
            "timestamp": (utc_now() - timedelta(hours=1)).isoformat()
        },
        {
            "id": 4,
            "service": "devices",
            "icon": "🥧",
            "action": "Device connected",
            "description": "Raspberry Pi 4 - Living Room came online",
            "timestamp": (utc_now() - timedelta(hours=2)).isoformat()
        },
        {
            "id": 5,
            "service": "social",
            "icon": "🌐",
            "action": "New like",
            "description": "Mike liked your post",
            "timestamp": (utc_now() - timedelta(hours=3)).isoformat()
        }
    ]

    return {
        "activities": activities[:limit],
        "total": len(activities)
    }


@router.get("/quick-stats")
async def get_quick_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quick overview statistics"""
    stats = await get_user_stats(db, current_user)

    return {
        "wallet_balance": stats["blockchain"]["balance"],
        "unread_emails": stats["email"]["unread"],
        "online_devices": stats["devices"]["online"],
        "total_files": stats["files"]["total"],
        "ai_conversations": stats["ai"]["conversations"],
        "mining_hashrate": stats["mining"]["hashrate"]
    }


async def get_user_stats(db: AsyncSession, user: User) -> Dict[str, Any]:
    """Helper function to aggregate user statistics across all services"""

    # Email stats
    email_total_result = await db.execute(
        select(func.count(Email.id)).filter(Email.recipient_id == user.id)
    )
    email_total = email_total_result.scalar() or 0

    email_unread_result = await db.execute(
        select(func.count(Email.id)).filter(
            Email.recipient_id == user.id,
            Email.is_read == False
        )
    )
    email_unread = email_unread_result.scalar() or 0

    # Social stats
    posts_result = await db.execute(
        select(func.count(Post.id)).filter(Post.user_id == user.id)
    )
    posts_total = posts_result.scalar() or 0

    # Files stats
    files_result = await db.execute(
        select(func.count(File.id), func.sum(File.size)).filter(File.user_id == user.id)
    )
    files_data = files_result.first()
    files_total = files_data[0] or 0
    files_size = files_data[1] or 0

    # Videos stats
    videos_result = await db.execute(
        select(func.count(Video.id), func.sum(Video.views_count)).filter(Video.user_id == user.id)
    )
    videos_data = videos_result.first()
    videos_total = videos_data[0] or 0
    videos_views = videos_data[1] or 0

    # AI chat stats
    conversations_result = await db.execute(
        select(func.count(Conversation.id)).filter(Conversation.user_id == user.id)
    )
    conversations_total = conversations_result.scalar() or 0

    # Blockchain stats
    transactions_result = await db.execute(
        select(func.count(Transaction.id)).filter(
            (Transaction.from_address == user.wallet_address) |
            (Transaction.to_address == user.wallet_address)
        )
    )
    transactions_total = transactions_result.scalar() or 0

    # Devices stats
    devices_result = await db.execute(
        select(func.count(Device.id), func.sum(cast(Device.is_online, Integer)))
        .filter(Device.owner_id == user.id)
    )
    devices_data = devices_result.first()
    devices_total = devices_data[0] or 0
    devices_online = devices_data[1] or 0

    return {
        "email": {
            "total": email_total,
            "unread": email_unread
        },
        "social": {
            "posts": posts_total,
            "followers": 0  # Would need Follow model
        },
        "blockchain": {
            "balance": user.balance,
            "transactions": transactions_total
        },
        "mining": {
            "hashrate": "125.3 MH/s",
            "blocks_mined": 42
        },
        "ai": {
            "conversations": conversations_total,
            "messages": conversations_total * 5  # Estimate
        },
        "files": {
            "total": files_total,
            "storage_used": f"{files_size / (1024*1024):.2f} MB"
        },
        "videos": {
            "total": videos_total,
            "views": videos_views
        },
        "devices": {
            "total": devices_total,
            "online": devices_online
        }
    }
