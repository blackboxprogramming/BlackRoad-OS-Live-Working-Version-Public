"""
Discord API Integration Router

Provides endpoints for sending messages, managing channels, and interacting with Discord servers.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import httpx
import os
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/discord", tags=["discord"])

# Discord API configuration
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")


class DiscordMessage(BaseModel):
    """Discord message model"""
    content: str
    embeds: Optional[List[Dict]] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None


class DiscordEmbed(BaseModel):
    """Discord embed model"""
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[int] = 0x00ff00
    url: Optional[str] = None
    timestamp: Optional[str] = None
    fields: Optional[List[Dict]] = None


class DiscordClient:
    """Discord REST API client"""

    def __init__(self, token: Optional[str] = None):
        self.token = token or DISCORD_BOT_TOKEN
        self.base_url = "https://discord.com/api/v10"

    def _get_headers(self) -> Dict[str, str]:
        """Get API request headers"""
        if not self.token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Discord bot token not configured"
            )

        return {
            "Authorization": f"Bot {self.token}",
            "Content-Type": "application/json"
        }

    async def _request(
        self,
        method: str,
        endpoint: str,
        json_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make API request"""
        headers = self._get_headers()
        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method,
                    url,
                    headers=headers,
                    json=json_data,
                    timeout=30.0
                )
                response.raise_for_status()

                # Some endpoints return 204 No Content
                if response.status_code == 204:
                    return {"success": True}

                return response.json()

            except httpx.HTTPStatusError as e:
                logger.error(f"Discord API error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Discord API error: {e.response.text}"
                )
            except httpx.HTTPError as e:
                logger.error(f"Discord API request failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Discord API request failed: {str(e)}"
                )

    async def send_message(
        self,
        channel_id: str,
        content: str,
        embeds: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Send a message to a channel"""
        data = {"content": content}
        if embeds:
            data["embeds"] = embeds

        return await self._request("POST", f"/channels/{channel_id}/messages", json_data=data)

    async def get_channel(self, channel_id: str) -> Dict[str, Any]:
        """Get channel information"""
        return await self._request("GET", f"/channels/{channel_id}")

    async def get_guild(self, guild_id: str) -> Dict[str, Any]:
        """Get guild (server) information"""
        return await self._request("GET", f"/guilds/{guild_id}")

    async def list_guild_channels(self, guild_id: str) -> List[Dict[str, Any]]:
        """List channels in a guild"""
        return await self._request("GET", f"/guilds/{guild_id}/channels")

    async def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user information"""
        return await self._request("GET", f"/users/{user_id}")

    async def get_current_user(self) -> Dict[str, Any]:
        """Get current bot user information"""
        return await self._request("GET", "/users/@me")


async def send_webhook_message(
    content: str,
    embeds: Optional[List[Dict]] = None,
    username: Optional[str] = "BlackRoad OS",
    avatar_url: Optional[str] = None
):
    """Send message via webhook (doesn't require bot token)"""
    if not DISCORD_WEBHOOK_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Discord webhook URL not configured"
        )

    data = {
        "content": content,
        "username": username
    }
    if embeds:
        data["embeds"] = embeds
    if avatar_url:
        data["avatar_url"] = avatar_url

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                DISCORD_WEBHOOK_URL,
                json=data,
                timeout=10.0
            )
            response.raise_for_status()
            return {"success": True, "message": "Message sent via webhook"}

        except httpx.HTTPError as e:
            logger.error(f"Discord webhook error: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Discord webhook failed: {str(e)}"
            )


# Initialize client
discord_client = DiscordClient()


@router.get("/status")
async def get_discord_status():
    """Get Discord API connection status"""
    if not DISCORD_BOT_TOKEN:
        return {
            "connected": False,
            "message": "Discord bot token not configured. Set DISCORD_BOT_TOKEN environment variable.",
            "webhook_configured": bool(DISCORD_WEBHOOK_URL)
        }

    try:
        # Test API connection by getting bot user info
        user = await discord_client.get_current_user()
        return {
            "connected": True,
            "message": "Discord API connected successfully",
            "bot_username": user.get("username"),
            "bot_id": user.get("id"),
            "webhook_configured": bool(DISCORD_WEBHOOK_URL)
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Discord API connection failed: {str(e)}",
            "webhook_configured": bool(DISCORD_WEBHOOK_URL)
        }


@router.post("/channels/{channel_id}/messages")
async def send_message(channel_id: str, content: str, embeds: Optional[List[Dict]] = None):
    """Send a message to a Discord channel"""
    try:
        result = await discord_client.send_message(
            channel_id=channel_id,
            content=content,
            embeds=embeds
        )
        return {
            "success": True,
            "message_id": result.get("id"),
            "channel_id": result.get("channel_id")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )


@router.post("/webhook")
async def send_webhook(message: DiscordMessage):
    """Send message via incoming webhook"""
    try:
        result = await send_webhook_message(
            content=message.content,
            embeds=message.embeds,
            username=message.username or "BlackRoad OS",
            avatar_url=message.avatar_url
        )
        return result
    except HTTPException:
        raise


@router.get("/channels/{channel_id}")
async def get_channel(channel_id: str):
    """Get channel information"""
    try:
        channel = await discord_client.get_channel(channel_id)
        return channel
    except HTTPException:
        raise


@router.get("/guilds/{guild_id}")
async def get_guild(guild_id: str):
    """Get guild (server) information"""
    try:
        guild = await discord_client.get_guild(guild_id)
        return guild
    except HTTPException:
        raise


@router.get("/guilds/{guild_id}/channels")
async def list_channels(guild_id: str):
    """List channels in a guild"""
    try:
        channels = await discord_client.list_guild_channels(guild_id)
        return {
            "channels": channels,
            "count": len(channels)
        }
    except HTTPException:
        raise


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user information"""
    try:
        user = await discord_client.get_user(user_id)
        return user
    except HTTPException:
        raise


@router.get("/users/@me")
async def get_current_user():
    """Get current bot user information"""
    try:
        user = await discord_client.get_current_user()
        return user
    except HTTPException:
        raise


@router.get("/health")
async def discord_health_check():
    """Discord API health check endpoint"""
    return {
        "service": "discord",
        "status": "operational" if DISCORD_BOT_TOKEN else "not_configured",
        "webhook_status": "operational" if DISCORD_WEBHOOK_URL else "not_configured",
        "timestamp": utc_now().isoformat()
    }
