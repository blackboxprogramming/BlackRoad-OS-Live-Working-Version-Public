"""
Stripe API Integration Router

Provides endpoints for payment processing, subscriptions, and billing.
Stripe is a payment processing platform for online businesses.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import httpx
import os
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

# Stripe API configuration
STRIPE_API_URL = "https://api.stripe.com/v1"
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")


class PaymentIntent(BaseModel):
    """Payment intent model"""
    amount: int  # Amount in cents
    currency: str = "usd"
    description: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None


class Customer(BaseModel):
    """Customer model"""
    email: EmailStr
    name: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None


class StripeClient:
    """Stripe REST API client"""

    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = secret_key or STRIPE_SECRET_KEY
        self.base_url = STRIPE_API_URL

    def _get_headers(self) -> Dict[str, str]:
        """Get API request headers"""
        if not self.secret_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stripe API key not configured"
            )

        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
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
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                logger.error(f"Stripe API error: {e.response.text}")
                error_data = e.response.json().get("error", {})
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=error_data.get("message", "Stripe API error")
                )
            except httpx.HTTPError as e:
                logger.error(f"Stripe API request failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Stripe API request failed: {str(e)}"
                )

    async def create_payment_intent(
        self,
        amount: int,
        currency: str = "usd",
        description: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create a payment intent"""
        data = {
            "amount": amount,
            "currency": currency
        }
        if description:
            data["description"] = description
        if metadata:
            for key, value in metadata.items():
                data[f"metadata[{key}]"] = value

        return await self._request("POST", "/payment_intents", data=data)

    async def get_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """Get payment intent details"""
        return await self._request("GET", f"/payment_intents/{payment_intent_id}")

    async def create_customer(
        self,
        email: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create a customer"""
        data = {"email": email}
        if name:
            data["name"] = name
        if description:
            data["description"] = description
        if metadata:
            for key, value in metadata.items():
                data[f"metadata[{key}]"] = value

        return await self._request("POST", "/customers", data=data)

    async def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Get customer details"""
        return await self._request("GET", f"/customers/{customer_id}")

    async def list_customers(self, limit: int = 10) -> Dict[str, Any]:
        """List customers"""
        params = {"limit": limit}
        return await self._request("GET", "/customers", params=params)

    async def create_subscription(
        self,
        customer_id: str,
        price_id: str,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create a subscription"""
        data = {
            "customer": customer_id,
            "items[0][price]": price_id
        }
        if metadata:
            for key, value in metadata.items():
                data[f"metadata[{key}]"] = value

        return await self._request("POST", "/subscriptions", data=data)

    async def list_products(self, limit: int = 10) -> Dict[str, Any]:
        """List products"""
        params = {"limit": limit}
        return await self._request("GET", "/products", params=params)

    async def list_prices(self, limit: int = 10) -> Dict[str, Any]:
        """List prices"""
        params = {"limit": limit}
        return await self._request("GET", "/prices", params=params)

    async def get_balance(self) -> Dict[str, Any]:
        """Get account balance"""
        return await self._request("GET", "/balance")


# Initialize client
stripe_client = StripeClient()


@router.get("/status")
async def get_stripe_status():
    """Get Stripe API connection status"""
    if not STRIPE_SECRET_KEY:
        return {
            "connected": False,
            "message": "Stripe API key not configured. Set STRIPE_SECRET_KEY environment variable."
        }

    try:
        # Try to fetch balance as a health check
        await stripe_client.get_balance()
        return {
            "connected": True,
            "message": "Stripe API connected successfully",
            "publishable_key_configured": bool(STRIPE_PUBLISHABLE_KEY)
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Stripe API connection failed: {str(e)}"
        }


@router.post("/payment-intents")
async def create_payment_intent(payment: PaymentIntent):
    """Create a payment intent"""
    try:
        intent = await stripe_client.create_payment_intent(
            amount=payment.amount,
            currency=payment.currency,
            description=payment.description,
            metadata=payment.metadata
        )
        return {
            "success": True,
            "payment_intent": intent,
            "client_secret": intent.get("client_secret")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment intent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment intent: {str(e)}"
        )


@router.get("/payment-intents/{payment_intent_id}")
async def get_payment_intent(payment_intent_id: str):
    """Get payment intent details"""
    try:
        intent = await stripe_client.get_payment_intent(payment_intent_id)
        return intent
    except HTTPException:
        raise


@router.post("/customers")
async def create_customer(customer: Customer):
    """Create a customer"""
    try:
        result = await stripe_client.create_customer(
            email=customer.email,
            name=customer.name,
            description=customer.description,
            metadata=customer.metadata
        )
        return {
            "success": True,
            "customer": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating customer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create customer: {str(e)}"
        )


@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get customer details"""
    try:
        customer = await stripe_client.get_customer(customer_id)
        return customer
    except HTTPException:
        raise


@router.get("/customers")
async def list_customers(limit: int = 10):
    """List customers"""
    try:
        result = await stripe_client.list_customers(limit)
        return result
    except HTTPException:
        raise


@router.get("/products")
async def list_products(limit: int = 10):
    """List products"""
    try:
        result = await stripe_client.list_products(limit)
        return result
    except HTTPException:
        raise


@router.get("/prices")
async def list_prices(limit: int = 10):
    """List prices"""
    try:
        result = await stripe_client.list_prices(limit)
        return result
    except HTTPException:
        raise


@router.get("/balance")
async def get_balance():
    """Get account balance"""
    try:
        balance = await stripe_client.get_balance()
        return balance
    except HTTPException:
        raise


@router.get("/health")
async def stripe_health_check():
    """Stripe API health check endpoint"""
    return {
        "service": "stripe",
        "status": "operational" if STRIPE_SECRET_KEY else "not_configured",
        "timestamp": utc_now().isoformat()
    }
