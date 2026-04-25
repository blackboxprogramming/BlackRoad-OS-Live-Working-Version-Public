# API Overview

BlackRoad OS provides a comprehensive REST API powered by FastAPI.

**Base URL**: `https://blackroad.systems/api`

**Interactive Documentation**: `https://blackroad.systems/api/docs`

---

## API Categories

- **Authentication** - User login, registration, tokens
- **Prism Console** - Job queue, events, metrics
- **Blockchain** - RoadChain operations
- **Agents** - 200+ AI agent library
- **Integrations** - Railway, Stripe, Twilio, etc.

---

## Authentication

All protected endpoints require a JWT Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://blackroad.systems/api/endpoint
```

See [Authentication](authentication.md) for details.

---

**Where AI meets the open road.** 🛣️
