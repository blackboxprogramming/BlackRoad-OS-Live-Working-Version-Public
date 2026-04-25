"""
Comprehensive tests for all API integrations
Tests Railway, Vercel, Stripe, Twilio, Slack, Discord, Sentry, and health monitoring
"""

import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
class TestAPIHealth:
    """Test API health monitoring endpoints"""

    async def test_health_summary(self, client: AsyncClient):
        """Test health summary endpoint"""
        response = await client.get("/api/health/summary")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "summary" in data
        assert "connected_apis" in data
        assert "not_configured_apis" in data

    async def test_health_all(self, client: AsyncClient):
        """Test comprehensive health check"""
        response = await client.get("/api/health/all")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "apis" in data
        assert "total_apis" in data
        assert "connected_apis" in data

    async def test_health_specific_api(self, client: AsyncClient):
        """Test specific API health check"""
        apis = ["railway", "vercel", "stripe", "twilio", "slack", "discord", "sentry"]

        for api_name in apis:
            response = await client.get(f"/api/health/{api_name}")
            assert response.status_code == 200
            data = response.json()
            assert "name" in data
            assert "status" in data
            assert data["name"] == api_name

    async def test_health_invalid_api(self, client: AsyncClient):
        """Test health check for non-existent API"""
        response = await client.get("/api/health/nonexistent")
        assert response.status_code == 404


@pytest.mark.asyncio
class TestRailwayAPI:
    """Test Railway API integration"""

    async def test_railway_status(self, client: AsyncClient):
        """Test Railway API status endpoint"""
        response = await client.get("/api/railway/status")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "message" in data

    async def test_railway_health(self, client: AsyncClient):
        """Test Railway health check"""
        response = await client.get("/api/railway/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "railway"
        assert "status" in data

    async def test_railway_projects_unauthenticated(self, client: AsyncClient):
        """Test Railway projects endpoint without token"""
        response = await client.get("/api/railway/projects")
        # Should return error if not configured
        assert response.status_code in [200, 503]


@pytest.mark.asyncio
class TestVercelAPI:
    """Test Vercel API integration"""

    async def test_vercel_status(self, client: AsyncClient):
        """Test Vercel API status endpoint"""
        response = await client.get("/api/vercel/status")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "message" in data

    async def test_vercel_health(self, client: AsyncClient):
        """Test Vercel health check"""
        response = await client.get("/api/vercel/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "vercel"
        assert "status" in data

    async def test_vercel_projects_unauthenticated(self, client: AsyncClient):
        """Test Vercel projects endpoint without token"""
        response = await client.get("/api/vercel/projects")
        # Should return error if not configured
        assert response.status_code in [200, 503]


@pytest.mark.asyncio
class TestStripeAPI:
    """Test Stripe API integration"""

    async def test_stripe_status(self, client: AsyncClient):
        """Test Stripe API status endpoint"""
        response = await client.get("/api/stripe/status")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "message" in data

    async def test_stripe_health(self, client: AsyncClient):
        """Test Stripe health check"""
        response = await client.get("/api/stripe/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "stripe"
        assert "status" in data

    async def test_stripe_balance_unauthenticated(self, client: AsyncClient):
        """Test Stripe balance endpoint without API key"""
        response = await client.get("/api/stripe/balance")
        # Should return error if not configured
        assert response.status_code in [200, 503]

    async def test_create_payment_intent_validation(self, client: AsyncClient):
        """Test payment intent creation with invalid data"""
        response = await client.post(
            "/api/stripe/payment-intents",
            json={"amount": -100, "currency": "usd"}  # Invalid negative amount
        )
        # Should fail validation or API error
        assert response.status_code in [422, 400, 503]


@pytest.mark.asyncio
class TestTwilioAPI:
    """Test Twilio API integration"""

    async def test_twilio_status(self, client: AsyncClient):
        """Test Twilio API status endpoint"""
        response = await client.get("/api/twilio/status")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "message" in data

    async def test_twilio_health(self, client: AsyncClient):
        """Test Twilio health check"""
        response = await client.get("/api/twilio/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "twilio"
        assert "status" in data

    async def test_send_sms_validation(self, client: AsyncClient):
        """Test SMS sending with validation"""
        response = await client.post(
            "/api/twilio/sms",
            json={"to": "+1234567890", "message": "Test"}
        )
        # Should return error if not configured
        assert response.status_code in [200, 400, 503]


@pytest.mark.asyncio
class TestSlackAPI:
    """Test Slack API integration"""

    async def test_slack_status(self, client: AsyncClient):
        """Test Slack API status endpoint"""
        response = await client.get("/api/slack/status")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "message" in data
        assert "webhook_configured" in data

    async def test_slack_health(self, client: AsyncClient):
        """Test Slack health check"""
        response = await client.get("/api/slack/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "slack"
        assert "status" in data
        assert "webhook_status" in data

    async def test_post_message_validation(self, client: AsyncClient):
        """Test Slack message posting validation"""
        response = await client.post(
            "/api/slack/messages",
            json={"channel": "general", "text": "Test message"}
        )
        # Should return error if not configured
        assert response.status_code in [200, 400, 503]


@pytest.mark.asyncio
class TestDiscordAPI:
    """Test Discord API integration"""

    async def test_discord_status(self, client: AsyncClient):
        """Test Discord API status endpoint"""
        response = await client.get("/api/discord/status")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "message" in data
        assert "webhook_configured" in data

    async def test_discord_health(self, client: AsyncClient):
        """Test Discord health check"""
        response = await client.get("/api/discord/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "discord"
        assert "status" in data
        assert "webhook_status" in data

    async def test_send_webhook_validation(self, client: AsyncClient):
        """Test Discord webhook message sending"""
        response = await client.post(
            "/api/discord/webhook",
            json={"content": "Test message"}
        )
        # Should return error if not configured
        assert response.status_code in [200, 503]


@pytest.mark.asyncio
class TestSentryAPI:
    """Test Sentry API integration"""

    async def test_sentry_status(self, client: AsyncClient):
        """Test Sentry API status endpoint"""
        response = await client.get("/api/sentry/status")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "message" in data
        assert "org_configured" in data
        assert "dsn_configured" in data

    async def test_sentry_health(self, client: AsyncClient):
        """Test Sentry health check"""
        response = await client.get("/api/sentry/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "sentry"
        assert "status" in data

    async def test_sentry_projects_unauthenticated(self, client: AsyncClient):
        """Test Sentry projects endpoint without auth"""
        response = await client.get("/api/sentry/projects")
        # Should return error if not configured
        assert response.status_code in [200, 400, 503]


@pytest.mark.asyncio
class TestAPIEndpoints:
    """Test that all API endpoints are registered"""

    async def test_api_info_includes_new_endpoints(self, client: AsyncClient):
        """Test that /api endpoint includes new integrations"""
        response = await client.get("/api")
        assert response.status_code == 200
        data = response.json()
        assert "endpoints" in data

        # Check that new endpoints are listed
        endpoints = data["endpoints"]
        assert "railway" in endpoints
        assert "vercel" in endpoints
        assert "stripe" in endpoints
        assert "twilio" in endpoints
        assert "slack" in endpoints
        assert "discord" in endpoints
        assert "sentry" in endpoints
        assert "health" in endpoints

    async def test_all_health_endpoints_accessible(self, client: AsyncClient):
        """Test that all health endpoints are accessible"""
        health_endpoints = [
            "/api/railway/health",
            "/api/vercel/health",
            "/api/stripe/health",
            "/api/twilio/health",
            "/api/slack/health",
            "/api/discord/health",
            "/api/sentry/health",
        ]

        for endpoint in health_endpoints:
            response = await client.get(endpoint)
            assert response.status_code == 200, f"Failed for {endpoint}"
            data = response.json()
            assert "service" in data
            assert "status" in data


@pytest.mark.asyncio
class TestAPIDocumentation:
    """Test API documentation endpoints"""

    async def test_openapi_schema(self, client: AsyncClient):
        """Test that OpenAPI schema includes new routers"""
        response = await client.get("/api/openapi.json")
        assert response.status_code == 200
        schema = response.json()

        # Check that new API tags exist
        tags = [tag["name"] for tag in schema.get("tags", [])]
        assert "railway" in tags
        assert "vercel" in tags
        assert "stripe" in tags
        assert "twilio" in tags
        assert "slack" in tags
        assert "discord" in tags
        assert "sentry" in tags
        assert "health" in tags
