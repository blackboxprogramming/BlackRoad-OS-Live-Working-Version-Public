# Service Analysis: blackroad-backend

**Status**: ✅ ACTIVE (Production)
**Last Analyzed**: 2025-11-19
**Service Type**: Backend API + Static UI Server
**Repository**: `blackboxprogramming/BlackRoad-Operating-System` (monorepo)

---

## Overview

The `blackroad-backend` service is the **canonical production backend** for BlackRoad OS. It serves multiple purposes:
- REST API gateway (33+ routers)
- Static UI hosting (Pocket OS at `/`)
- Health & monitoring endpoints
- WebSocket support (planned)

---

## Technology Stack

### Language & Framework
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104.1
- **ASGI Server**: Uvicorn 0.24.0
- **Async Support**: Full async/await with asyncio

### Dependencies
- **Web**: FastAPI, Uvicorn, Pydantic 2.5.0
- **Database**: SQLAlchemy 2.0.23 (async), asyncpg, psycopg2-binary
- **Cache**: redis-py 5.0.1, hiredis 2.2.3
- **Auth**: python-jose (JWT), passlib (bcrypt)
- **Testing**: pytest, pytest-asyncio, pytest-cov
- **Monitoring**: prometheus-client, sentry-sdk

---

## Current Endpoints

### Core System
- `GET /` → Pocket OS UI (static HTML/CSS/JS)
- `GET /health` → Basic health check
- `GET /api/health/summary` → Comprehensive health with integration status
- `GET /api/system/version` → System version info
- `GET /api/system/config/public` → Public configuration
- `GET /api/docs` → OpenAPI/Swagger UI

### Authentication
- `POST /api/auth/register` → User registration
- `POST /api/auth/login` → User login (JWT)
- `POST /api/auth/refresh` → Token refresh
- `GET /api/auth/me` → Current user

### Blockchain (RoadChain)
- `GET /api/blockchain/blocks` → List blocks
- `POST /api/blockchain/blocks` → Create block
- `GET /api/blockchain/verify` → Verify chain integrity

### Applications
- `/api/email/*` → RoadMail
- `/api/social/*` → BlackRoad Social
- `/api/video/*` → BlackStream
- `/api/miner/*` → Mining operations
- `/api/dashboard/*` → Dashboard data
- `/api/ai_chat/*` → AI/Lucidia integration

### Integrations (30+ routers)
See `backend/app/main.py` for full list of routers.

---

## Infrastructure

### Deployment
- **Platform**: Railway
- **Container**: Docker (multi-stage build)
- **Dockerfile**: `backend/Dockerfile`
- **Build Context**: Repository root
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Resources (Current)
- **Memory**: ~512MB
- **CPU**: Shared
- **Port**: Dynamic ($PORT assigned by Railway)

### Healthcheck
- **Path**: `/health`
- **Interval**: 30s
- **Timeout**: 5s
- **Retries**: 3

---

## Database Schema

### Models (SQLAlchemy ORM)
Location: `backend/app/models/`

**Core Models**:
- `User` → User accounts
- `Wallet` → Blockchain wallets
- `Block` → RoadChain blocks
- `Transaction` → Blockchain transactions
- `Job` → Prism jobs (future)
- `Event` → Audit events

**Relationships**:
- User → Wallets (1:many)
- User → Jobs (1:many)
- Block → Transactions (1:many)

### Migrations
- **Tool**: Alembic 1.12.1
- **Location**: `backend/alembic/`
- **Auto-upgrade**: Disabled (manual for safety)

---

## Caching Strategy

### Redis Usage
- **Session Storage**:
  - Key pattern: `session:{user_id}`
  - TTL: 1 hour
- **API Response Cache**:
  - Key pattern: `api:cache:{endpoint}:{params_hash}`
  - TTL: 5-60 minutes (varies by endpoint)
- **WebSocket State** (future):
  - Pub/sub channels for real-time updates
- **Rate Limiting**:
  - Key pattern: `ratelimit:{ip}:{endpoint}`
  - TTL: 1 minute

---

## Security

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Access Token**: 30 minutes expiry
- **Refresh Token**: 7 days expiry
- **Algorithm**: HS256
- **Secret**: `SECRET_KEY` environment variable

### Password Hashing
- **Algorithm**: bcrypt
- **Rounds**: 12 (default)

### CORS
- **Allowed Origins**: Configurable via `ALLOWED_ORIGINS` env var
- **Default**: `https://blackroad.systems`
- **Credentials**: Allowed

### Input Validation
- **Framework**: Pydantic schemas
- **SQL Injection**: Protected (SQLAlchemy ORM)
- **XSS**: Frontend sanitization

---

## Current Issues & Fixes

### Recent Deployment Issues (Fixed)
✅ **Fixed 2025-11-18**: Railway `startCommand` mismatch
  - Issue: `cd backend && uvicorn ...` failed inside container
  - Fix: Removed override, let Dockerfile CMD handle it

✅ **Fixed 2025-11-18**: Dockerfile security hardening
  - Added non-root user
  - Multi-stage build for smaller image
  - Health check integrated

### Known Limitations
⚠️ **Prism Console**: Not yet served at `/prism` (planned)
⚠️ **WebSockets**: Not yet implemented (planned)
⚠️ **GraphQL**: REST-only currently

---

## Environment Variables

### Critical (Must Set)
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
SECRET_KEY=<generate>
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://blackroad.systems
```

### Important
```bash
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
WALLET_MASTER_KEY=<generate>
API_BASE_URL=https://blackroad.systems
FRONTEND_URL=https://blackroad.systems
```

### Optional (Features)
```bash
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=<generate>
STRIPE_SECRET_KEY=sk_...
SENTRY_DSN=https://...
```

---

## Monitoring & Observability

### Metrics
- **Prometheus**: Custom metrics at `/metrics` (planned)
- **Railway**: Built-in CPU, memory, network metrics

### Logging
- **Format**: Structured JSON
- **Level**: INFO (production), DEBUG (development)
- **Destination**: stdout → Railway logs

### Error Tracking
- **Sentry**: Configured when `SENTRY_DSN` set
- **Coverage**: All uncaught exceptions

### Alerts (Recommended)
- Health check failures
- Error rate > 5%
- Response time p95 > 1s
- Memory usage > 80%

---

## Performance

### Current Benchmarks
- **Cold start**: ~3-5 seconds
- **Warm response**: ~50-200ms (cached)
- **Database query**: ~10-50ms (simple)
- **API throughput**: ~100 req/s (estimated)

### Optimization Opportunities
1. **Add Redis caching** for expensive queries
2. **Implement CDN** for static assets
3. **Enable Gzip compression**
4. **Database connection pooling** (already configured)
5. **Async background tasks** with Celery

---

## Testing

### Test Suite
- **Location**: `backend/tests/`
- **Framework**: pytest + pytest-asyncio
- **Coverage**: ~60-75% (target: 80%)

### Test Types
- **Unit**: Individual function tests
- **Integration**: Database + Redis tests
- **API**: Endpoint contract tests
- **E2E**: Frontend + backend flows (manual)

### Running Tests
```bash
cd backend
pytest -v --cov=app
```

---

## Development Workflow

### Local Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with local DATABASE_URL, REDIS_URL, SECRET_KEY
uvicorn app.main:app --reload
```

### Docker Setup
```bash
cd backend
docker-compose up
# Starts FastAPI, Postgres, Redis, Adminer
```

### Making Changes
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes in `backend/app/`
3. Add tests in `backend/tests/`
4. Run tests: `pytest -v`
5. Commit and push
6. Open PR → CI runs → Auto-merge (if passing)

---

## Deployment Process

### Automatic (Recommended)
```bash
git checkout main
git pull origin main
# Merge PR via GitHub UI or merge queue
# GitHub Actions triggers Railway deployment
# Monitor Railway dashboard for status
```

### Manual (Emergency)
```bash
railway login
railway link <PROJECT_ID>
railway up --service blackroad-backend
railway logs --tail 100
```

### Verification
```bash
curl https://blackroad.systems/health
# Should return: {"status": "healthy", "environment": "production"}

curl https://blackroad.systems/api/docs
# Should return Swagger UI HTML
```

---

## Rollback Procedure

### Via Railway Dashboard
1. Go to Railway → Deployments
2. Find previous working deployment
3. Click "Rollback" button
4. Verify health check passes

### Via Git
```bash
git revert <bad-commit>
git push origin main
# Wait for auto-deployment
```

---

## Future Enhancements

### Phase 2 (Q1-Q2 2026)
- [ ] Extract API gateway to separate service
- [ ] Serve Prism Console at `/prism`
- [ ] WebSocket support for real-time updates
- [ ] GraphQL endpoint for flexible queries

### Phase 3 (Q3-Q4 2026)
- [ ] Microservices architecture
- [ ] Service mesh (Istio/Linkerd)
- [ ] Multi-region deployment
- [ ] Advanced caching with CDN

---

## Dependencies

### Runtime Dependencies
- **Postgres**: Required (managed by Railway)
- **Redis**: Required (managed by Railway)
- **Cloudflare**: Optional (for CDN + DNS)

### External APIs (Optional)
- OpenAI API (for AI features)
- GitHub API (for agent integrations)
- Stripe API (for payments)
- Twilio API (for SMS)

---

## Contact & Support

**Primary Operator**: Alexa Louise Amundson (Cadillac)
**AI Assistant**: Atlas (Infrastructure), Cece (Engineering)
**Documentation**: See `CLAUDE.md`, `MASTER_ORCHESTRATION_PLAN.md`
**Issues**: GitHub Issues in `blackboxprogramming/BlackRoad-Operating-System`

---

*Analysis Date: 2025-11-19*
*Next Review: 2025-12-19*
*Maintained By: Atlas (AI Infrastructure Orchestrator)*
