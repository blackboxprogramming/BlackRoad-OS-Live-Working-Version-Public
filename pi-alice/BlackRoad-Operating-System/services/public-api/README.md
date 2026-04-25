# BlackRoad OS - Public API Gateway

**Version**: 1.0.0
**Status**: Production Ready
**Framework**: FastAPI 0.104.1
**Python**: 3.11+

> **Canonical path:** `services/public-api`
> **Mirror:** `BlackRoad-OS/blackroad-os-api`
> **Branch:** `main`
>
> The public-facing API surface for BlackRoad OS lives here. Make changes in this directory; the sync workflow will mirror them to `blackroad-os-api`.

---

## Overview

The **Public API Gateway** is the entry point for all external API requests to BlackRoad OS. It routes requests to appropriate backend services:

- **Core API** - Business logic and core operations
- **Operator/Agents API** - AI agent orchestration
- **Other microservices** (future)

### Key Features

- **Intelligent routing** - Routes requests to correct backend
- **Health aggregation** - Monitors all backend services
- **CORS handling** - Configured for web clients
- **Error handling** - Graceful degradation
- **Request proxying** - Transparent forwarding

---

## Endpoints

### Gateway Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint with backend info |
| `/health` | GET | Health check + backend status |
| `/version` | GET | Version and deployment info |

### Proxy Routes

| Route | Target | Description |
|-------|--------|-------------|
| `/api/core/*` | Core API | Business logic operations |
| `/api/agents/*` | Operator API | Agent orchestration |

### API Documentation

| Endpoint | Description |
|----------|-------------|
| `/api/docs` | Swagger UI (OpenAPI) |
| `/api/redoc` | ReDoc documentation |
| `/api/openapi.json` | OpenAPI specification |

---

## Architecture

```
┌─────────────────┐
│  External       │
│  Clients        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Public API Gateway     │
│  (This Service)         │
│  - Routes requests      │
│  - Checks health        │
│  - Handles CORS         │
└────┬──────────────┬─────┘
     │              │
     ▼              ▼
┌─────────┐    ┌──────────┐
│ Core    │    │ Operator │
│ API     │    │ API      │
└─────────┘    └──────────┘
```

---

## Deployment

### Railway (Production)

**Service Name**: `blackroad-os-api-production`
**URL**: https://blackroad-os-api-production.up.railway.app
**Domain**: https://api.blackroad.systems (via Cloudflare)

#### Required Environment Variables

```bash
ENVIRONMENT=production
PORT=$PORT  # Auto-set by Railway

# Backend URLs
CORE_API_URL=https://blackroad-os-core-production.up.railway.app
AGENTS_API_URL=https://blackroad-os-operator-production.up.railway.app

# CORS
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems,https://api.blackroad.systems
```

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with local backend URLs:
# CORE_API_URL=http://localhost:8001
# AGENTS_API_URL=http://localhost:8002

# Run server
uvicorn app.main:app --reload

# Visit http://localhost:8000
```

### Docker

```bash
# Build image
docker build -t blackroad-public-api .

# Run container
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e CORE_API_URL=http://core-api:8001 \
  -e AGENTS_API_URL=http://operator:8002 \
  blackroad-public-api
```

---

## Health Check Response

```json
{
  "status": "healthy",
  "service": "public-api-gateway",
  "version": "1.0.0",
  "commit": "abc1234",
  "environment": "production",
  "timestamp": "2025-11-19T12:00:00Z",
  "uptime_seconds": 3600,
  "backends": {
    "core": "healthy",
    "agents": "healthy"
  }
}
```

Backend status values:
- `healthy` - Backend is responding correctly
- `unhealthy` - Backend returned non-200 status
- `unreachable` - Backend is not accessible

---

## Routing Examples

### Core API Requests

```bash
# Request to gateway
GET https://api.blackroad.systems/api/core/status

# Proxied to
GET https://blackroad-os-core-production.up.railway.app/api/core/status
```

### Agents API Requests

```bash
# Request to gateway
POST https://api.blackroad.systems/api/agents/deploy

# Proxied to
POST https://blackroad-os-operator-production.up.railway.app/api/agents/deploy
```

---

## Integration

### Consumed By

- **Prism Console** - Admin dashboard
- **BlackRoad OS UI** - Main operating system interface
- **External Clients** - Third-party integrations
- **Mobile Apps** (future)

### Backends

- **Core API** - `$CORE_API_URL`
- **Operator API** - `$AGENTS_API_URL`

### Environment URLs

| Environment | URL |
|-------------|-----|
| Production | https://blackroad-os-api-production.up.railway.app |
| Staging | https://blackroad-os-api-staging.up.railway.app |
| Local | http://localhost:8000 |

---

## Error Handling

### Gateway Errors

- `404` - Route not found (invalid path)
- `500` - Internal gateway error
- `502` - Backend returned invalid response
- `503` - Backend is unreachable
- `504` - Backend timeout (> 30s)

### Backend Errors

Backend errors are passed through transparently with original status codes.

---

## Roadmap

- [ ] Add API key authentication
- [ ] Add rate limiting per client
- [ ] Add request/response logging
- [ ] Add caching layer (Redis)
- [ ] Add request transformation
- [ ] Add circuit breaker pattern
- [ ] Add Prometheus metrics
- [ ] Add distributed tracing

---

## Support

**Operator**: Alexa Louise Amundson
**Repository**: blackboxprogramming/BlackRoad-Operating-System
**Service**: Public API Gateway
