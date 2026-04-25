# Multi-API Integration Guide

BlackRoad Operating System now supports comprehensive API integrations for deployment, payments, communications, monitoring, and more.

## 🚀 Deployment Platforms

### Railway
**GraphQL API for cloud deployments**

- **Endpoints**: `/api/railway/*`
- **Configuration**: `RAILWAY_TOKEN`
- **Features**:
  - List and manage projects
  - View deployments and services
  - Trigger new deployments
  - Manage environment variables
- **Docs**: https://docs.railway.app/reference/public-api

### Vercel
**REST API for serverless deployments**

- **Endpoints**: `/api/vercel/*`
- **Configuration**: `VERCEL_TOKEN`, `VERCEL_TEAM_ID` (optional)
- **Features**:
  - Manage projects and deployments
  - Configure custom domains
  - Set environment variables
  - Monitor deployment status
- **Docs**: https://vercel.com/docs/rest-api

## 💳 Payment Processing

### Stripe
**Payment processing and billing**

- **Endpoints**: `/api/stripe/*`
- **Configuration**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- **Features**:
  - Create payment intents
  - Manage customers
  - Handle subscriptions
  - View account balance
- **Docs**: https://stripe.com/docs/api

## 📱 Communications

### Twilio
**SMS, Voice, and WhatsApp messaging**

- **Endpoints**: `/api/twilio/*`
- **Configuration**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Features**:
  - Send SMS messages
  - Send WhatsApp messages
  - Track message status
  - View message history
- **Docs**: https://www.twilio.com/docs/usage/api

### Slack
**Team collaboration and notifications**

- **Endpoints**: `/api/slack/*`
- **Configuration**: `SLACK_BOT_TOKEN`, `SLACK_WEBHOOK_URL` (optional)
- **Features**:
  - Post messages to channels
  - List channels
  - Send webhook notifications
  - Get user information
- **Docs**: https://api.slack.com/

### Discord
**Community messaging and notifications**

- **Endpoints**: `/api/discord/*`
- **Configuration**: `DISCORD_BOT_TOKEN`, `DISCORD_WEBHOOK_URL` (optional)
- **Features**:
  - Send messages to channels
  - Manage guild/server information
  - Send webhook notifications
  - Get user details
- **Docs**: https://discord.com/developers/docs/intro

## 🔍 Monitoring & Error Tracking

### Sentry
**Application monitoring and error tracking**

- **Endpoints**: `/api/sentry/*`
- **Configuration**: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_DSN`
- **Features**:
  - View error issues
  - Track events
  - Manage releases
  - Get project statistics
- **Docs**: https://docs.sentry.io/api/

## 🏥 Health Monitoring

### Centralized API Health Check
**Monitor all API connections in one place**

- **Endpoints**:
  - `/api/health/all` - Comprehensive health check for all APIs
  - `/api/health/summary` - Quick summary of API status
  - `/api/health/{api_name}` - Check specific API (e.g., `/api/health/railway`)

- **Response Example**:
```json
{
  "status": "healthy",
  "total_apis": 12,
  "connected_apis": 8,
  "not_configured_apis": 3,
  "error_apis": 1,
  "apis": {
    "railway": {
      "name": "railway",
      "status": "connected",
      "message": "Railway API connected successfully",
      "last_checked": "2025-01-16T12:00:00Z"
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

All API integrations require environment variables. Copy `.env.example` to `.env` and configure:

```bash
# Deployment Platforms
RAILWAY_TOKEN=your-railway-api-token
VERCEL_TOKEN=your-vercel-api-token
VERCEL_TEAM_ID=your-team-id  # Optional

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Communications
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

SLACK_BOT_TOKEN=xoxb-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

DISCORD_BOT_TOKEN=...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=your-org-slug
```

### Quick Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the server**:
   ```bash
   python run.py
   ```

4. **Check API health**:
   ```bash
   curl http://localhost:8000/api/health/summary
   ```

## 📖 API Documentation

Once the server is running, access interactive documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI Schema**: http://localhost:8000/api/openapi.json

## 🧪 Testing

### Run all tests:
```bash
cd backend
pytest -v
```

### Run API integration tests:
```bash
pytest tests/test_api_integrations.py -v
```

### Test specific API:
```bash
pytest tests/test_api_integrations.py::TestRailwayAPI -v
```

## 🚢 Deployment

### Railway
1. Install Railway CLI: `curl -fsSL https://railway.app/install.sh | sh`
2. Login: `railway login`
3. Deploy: `railway up`

Configuration files:
- `railway.json` - Railway build configuration
- `railway.toml` - Railway deployment settings

### GitHub Actions
Automated workflows are configured in `.github/workflows/`:
- `backend-tests.yml` - Run tests and check API connectivity
- `railway-deploy.yml` - Deploy to Railway on push to main

## 🔑 Getting API Keys

### Railway
1. Go to https://railway.app
2. Create account → Settings → Tokens → Create Token

### Vercel
1. Go to https://vercel.com
2. Settings → Tokens → Create Token

### Stripe
1. Go to https://dashboard.stripe.com
2. Developers → API Keys → Create Key

### Twilio
1. Go to https://www.twilio.com/console
2. Get Account SID and Auth Token

### Slack
1. Go to https://api.slack.com/apps
2. Create App → OAuth & Permissions → Bot Token

### Discord
1. Go to https://discord.com/developers/applications
2. Create Application → Bot → Copy Token

### Sentry
1. Go to https://sentry.io
2. Settings → Auth Tokens → Create Token

## 📊 Monitoring Best Practices

1. **Use health checks**: Monitor `/api/health/all` endpoint
2. **Set up webhooks**: Configure Slack/Discord for deployment notifications
3. **Enable Sentry**: Track errors in production
4. **Monitor API quotas**: Check usage limits for each service

## 🛡️ Security

- **Never commit API keys**: Use `.env` files (gitignored)
- **Rotate keys regularly**: Update credentials periodically
- **Use environment-specific keys**: Different keys for dev/staging/prod
- **Monitor API usage**: Watch for unusual activity

## 🤝 Support

For issues or questions:
- Check logs: `docker-compose logs backend`
- API documentation: `/api/docs`
- Health status: `/api/health/summary`

## 📝 License

Part of BlackRoad Operating System - See main README for license information.
