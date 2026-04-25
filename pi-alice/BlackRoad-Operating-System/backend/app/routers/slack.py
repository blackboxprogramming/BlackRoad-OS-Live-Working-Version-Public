"""
Slack API Integration Router

Provides endpoints for sending messages, managing channels, and interacting with Slack workspaces.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/slack", tags=["slack"])

# Slack API configuration
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")


class SlackMessage(BaseModel):
    """Slack message model"""
    channel: str
    text: str
    blocks: Optional[List[Dict]] = None
    thread_ts: Optional[str] = None


class WebhookMessage(BaseModel):
    """Webhook message model"""
    text: str
    username: Optional[str] = "BlackRoad OS"
    icon_emoji: Optional[str] = ":robot_face:"


class SlackClient:
    """Slack Web API client"""

    def __init__(self, token: Optional[str] = None):
        self.token = token or SLACK_BOT_TOKEN
        self.base_url = "https://slack.com/api"

    def _get_headers(self) -> Dict[str, str]:
        """Get API request headers"""
        if not self.token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Slack bot token not configured"
            )

        return {
            "Authorization": f"Bearer {self.token}",
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
        url = f"{self.base_url}/{endpoint}"

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
                data = response.json()

                # Slack returns 200 with ok:false for errors
                if not data.get("ok", False):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Slack API error: {data.get('error', 'Unknown error')}"
                    )

                return data

            except httpx.HTTPStatusError as e:
                logger.error(f"Slack API error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Slack API error: {e.response.text}"
                )
            except httpx.HTTPError as e:
                logger.error(f"Slack API request failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Slack API request failed: {str(e)}"
                )

    async def post_message(
        self,
        channel: str,
        text: str,
        blocks: Optional[List[Dict]] = None,
        thread_ts: Optional[str] = None
    ) -> Dict[str, Any]:
        """Post a message to a channel"""
        data = {
            "channel": channel,
            "text": text
        }
        if blocks:
            data["blocks"] = blocks
        if thread_ts:
            data["thread_ts"] = thread_ts

        return await self._request("POST", "chat.postMessage", json_data=data)

    async def list_channels(self) -> Dict[str, Any]:
        """List public channels"""
        return await self._request("GET", "conversations.list")

    async def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """Get user information"""
        return await self._request("POST", "users.info", json_data={"user": user_id})

    async def upload_file(
        self,
        channels: str,
        content: str,
        filename: str,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a file"""
        data = {
            "channels": channels,
            "content": content,
            "filename": filename
        }
        if title:
            data["title"] = title

        return await self._request("POST", "files.upload", json_data=data)


async def send_webhook_message(text: str, username: str = "BlackRoad OS", icon_emoji: str = ":robot_face:"):
    """Send message via webhook (doesn't require bot token)"""
    if not SLACK_WEBHOOK_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Slack webhook URL not configured"
        )

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                SLACK_WEBHOOK_URL,
                json={
                    "text": text,
                    "username": username,
                    "icon_emoji": icon_emoji
                },
                timeout=10.0
            )
            response.raise_for_status()
            return {"success": True, "message": "Message sent via webhook"}

        except httpx.HTTPError as e:
            logger.error(f"Slack webhook error: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Slack webhook failed: {str(e)}"
            )


# Initialize client
slack_client = SlackClient()


@router.get("/status")
async def get_slack_status():
    """Get Slack API connection status"""
    if not SLACK_BOT_TOKEN:
        return {
            "connected": False,
            "message": "Slack bot token not configured. Set SLACK_BOT_TOKEN environment variable.",
            "webhook_configured": bool(SLACK_WEBHOOK_URL)
        }

    try:
        # Test API connection
        result = await slack_client._request("POST", "auth.test")
        return {
            "connected": True,
            "message": "Slack API connected successfully",
            "team": result.get("team"),
            "user": result.get("user"),
            "webhook_configured": bool(SLACK_WEBHOOK_URL)
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Slack API connection failed: {str(e)}",
            "webhook_configured": bool(SLACK_WEBHOOK_URL)
        }


@router.post("/messages")
async def post_message(message: SlackMessage):
    """Post a message to a Slack channel"""
    try:
        result = await slack_client.post_message(
            channel=message.channel,
            text=message.text,
            blocks=message.blocks,
            thread_ts=message.thread_ts
        )
        return {
            "success": True,
            "ts": result.get("ts"),
            "channel": result.get("channel")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error posting message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to post message: {str(e)}"
        )


@router.post("/webhook")
async def send_webhook(message: WebhookMessage):
    """Send message via incoming webhook"""
    try:
        result = await send_webhook_message(
            text=message.text,
            username=message.username,
            icon_emoji=message.icon_emoji
        )
        return result
    except HTTPException:
        raise


@router.get("/channels")
async def list_channels():
    """List Slack channels"""
    try:
        result = await slack_client.list_channels()
        return {
            "channels": result.get("channels", []),
            "count": len(result.get("channels", []))
        }
    except HTTPException:
        raise


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user information"""
    try:
        result = await slack_client.get_user_info(user_id)
        return result.get("user", {})
    except HTTPException:
        raise


@router.get("/health")
async def slack_health_check():
    """Slack API health check endpoint"""
    return {
        "service": "slack",
        "status": "operational" if SLACK_BOT_TOKEN else "not_configured",
        "webhook_status": "operational" if SLACK_WEBHOOK_URL else "not_configured",
        "timestamp": utc_now().isoformat()
    }
