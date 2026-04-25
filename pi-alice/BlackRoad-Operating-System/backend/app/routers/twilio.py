"""
Twilio API Integration Router

Provides endpoints for SMS, voice calls, and WhatsApp messaging.
Twilio is a cloud communications platform.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import httpx
import base64
import os
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/twilio", tags=["twilio"])

# Twilio API configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


class SMSMessage(BaseModel):
    """SMS message model"""
    to: str
    message: str
    from_number: Optional[str] = None


class WhatsAppMessage(BaseModel):
    """WhatsApp message model"""
    to: str
    message: str


class TwilioClient:
    """Twilio REST API client"""

    def __init__(
        self,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        phone_number: Optional[str] = None
    ):
        self.account_sid = account_sid or TWILIO_ACCOUNT_SID
        self.auth_token = auth_token or TWILIO_AUTH_TOKEN
        self.phone_number = phone_number or TWILIO_PHONE_NUMBER
        self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}"

    def _get_headers(self) -> Dict[str, str]:
        """Get API request headers with basic auth"""
        if not self.account_sid or not self.auth_token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Twilio credentials not configured"
            )

        # Create basic auth header
        credentials = f"{self.account_sid}:{self.auth_token}"
        encoded = base64.b64encode(credentials.encode()).decode()

        return {
            "Authorization": f"Basic {encoded}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None
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
                    data=data,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                logger.error(f"Twilio API error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Twilio API error: {e.response.text}"
                )
            except httpx.HTTPError as e:
                logger.error(f"Twilio API request failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Twilio API request failed: {str(e)}"
                )

    async def send_sms(
        self,
        to: str,
        body: str,
        from_: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send SMS message"""
        data = {
            "To": to,
            "From": from_ or self.phone_number,
            "Body": body
        }

        if not data["From"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Twilio phone number not configured"
            )

        return await self._request("POST", "/Messages.json", data=data)

    async def send_whatsapp(
        self,
        to: str,
        body: str
    ) -> Dict[str, Any]:
        """Send WhatsApp message"""
        data = {
            "To": f"whatsapp:{to}",
            "From": f"whatsapp:{self.phone_number}",
            "Body": body
        }

        if not self.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Twilio phone number not configured"
            )

        return await self._request("POST", "/Messages.json", data=data)

    async def get_message(self, message_sid: str) -> Dict[str, Any]:
        """Get message details"""
        return await self._request("GET", f"/Messages/{message_sid}.json")

    async def list_messages(self, limit: int = 20) -> Dict[str, Any]:
        """List messages"""
        data = {"PageSize": limit}
        return await self._request("GET", "/Messages.json", data=data)


# Initialize client
twilio_client = TwilioClient()


@router.get("/status")
async def get_twilio_status():
    """Get Twilio API connection status"""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        return {
            "connected": False,
            "message": "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
        }

    try:
        # Try to list messages as a health check
        await twilio_client.list_messages(limit=1)
        return {
            "connected": True,
            "message": "Twilio API connected successfully",
            "phone_number_configured": bool(TWILIO_PHONE_NUMBER)
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Twilio API connection failed: {str(e)}"
        }


@router.post("/sms")
async def send_sms(message: SMSMessage):
    """Send SMS message"""
    try:
        result = await twilio_client.send_sms(
            to=message.to,
            body=message.message,
            from_=message.from_number
        )
        return {
            "success": True,
            "message": result,
            "sid": result.get("sid")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending SMS: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send SMS: {str(e)}"
        )


@router.post("/whatsapp")
async def send_whatsapp(message: WhatsAppMessage):
    """Send WhatsApp message"""
    try:
        result = await twilio_client.send_whatsapp(
            to=message.to,
            body=message.message
        )
        return {
            "success": True,
            "message": result,
            "sid": result.get("sid")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending WhatsApp: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send WhatsApp: {str(e)}"
        )


@router.get("/messages/{message_sid}")
async def get_message(message_sid: str):
    """Get message details"""
    try:
        message = await twilio_client.get_message(message_sid)
        return message
    except HTTPException:
        raise


@router.get("/messages")
async def list_messages(limit: int = 20):
    """List messages"""
    try:
        result = await twilio_client.list_messages(limit)
        return result
    except HTTPException:
        raise


@router.get("/health")
async def twilio_health_check():
    """Twilio API health check endpoint"""
    return {
        "service": "twilio",
        "status": "operational" if (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) else "not_configured",
        "timestamp": utc_now().isoformat()
    }
