# BlackRoad OS - Core API

**Version**: 1.0.0
**Status**: Production Ready
**Framework**: FastAPI 0.104.1
**Python**: 3.11+

> **Canonical path:** `services/core-api`
> **Mirror:** `BlackRoad-OS/blackroad-os-core`
> **Branch:** `main`
>
> This directory contains the core API service for BlackRoad OS. All changes must originate here and will be synced automatically to the mirror repository via `.github/workflows/sync-core-api.yml`.

---

## Overview

The **Core API** is the foundational business logic layer for BlackRoad OS. It provides:

- Health check endpoints for monitoring
- Version information for deployment tracking
- Core service status for Prism Console
- Foundation for future core business logic

This service is designed to be stateless, fast, and reliable.

---

## Endpoints

### Health & Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint with service info |
| `/health` | GET | Health check (used by Railway) |
| `/version` | GET | Version and build information |
| `/api/core/status` | GET | Detailed status for dashboards |

### API Documentation

| Endpoint | Description |
|----------|-------------|
| `/api/docs` | Swagger UI (OpenAPI) |
| `/api/redoc` | ReDoc documentation |
| `/api/openapi.json` | OpenAPI specification |

---

## Deployment

### Railway (Production)

**Service Name**: `blackroad-os-core-production`
**URL**: https://blackroad-os-core-production.up.railway.app
**Domain**: https://core.blackroad.systems (via Cloudflare)

#### Required Environment Variables

```bash
ENVIRONMENT=production
PORT=$PORT  # Auto-set by Railway
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems
```

#### Deploy Command

```bash
# Railway will automatically deploy on push to main
# Or manually via Railway CLI:
railway up
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

# Run server
uvicorn app.main:app --reload

# Visit http://localhost:8000
```

### Docker

```bash
# Build image
docker build -t blackroad-core-api .

# Run container
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e ALLOWED_ORIGINS=* \
  blackroad-core-api
```

---

## Health Check Response

```json
{
  "status": "healthy",
  "service": "core-api",
  "version": "1.0.0",
  "commit": "abc1234",
  "environment": "production",
  "timestamp": "2025-11-19T12:00:00Z",
  "uptime_seconds": 3600,
  "python_version": "3.11.0",
  "system": {
    "platform": "Linux",
    "release": "5.15.0",
    "machine": "x86_64"
  }
}
```

---

## Integration

### Consumed By

- **Public API Gateway** - Proxies requests to Core API
- **Prism Console** - Displays Core API status
- **Monitoring Systems** - Railway health checks

### Environment URLs

| Environment | URL |
|-------------|-----|
| Production | https://blackroad-os-core-production.up.railway.app |
| Development | https://blackroad-os-core-dev.up.railway.app |
| Local | http://localhost:8000 |

---

## Roadmap

- [ ] Add database connection pooling
- [ ] Add Redis caching layer
- [ ] Add core business logic endpoints
- [ ] Add authentication middleware
- [ ] Add request rate limiting
- [ ] Add comprehensive logging
- [ ] Add Prometheus metrics endpoint

---

## Support

**Operator**: Alexa Louise Amundson
**Repository**: blackboxprogramming/BlackRoad-Operating-System
**Service**: Core API
