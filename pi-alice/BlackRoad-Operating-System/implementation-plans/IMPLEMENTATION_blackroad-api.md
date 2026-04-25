# 🚀 IMPLEMENTATION PLAN: blackroad-api
## Standalone API Gateway & Routing Layer

**Repo**: `blackboxprogramming/blackroad-api` (to be created/populated)
**Purpose**: Extract API gateway from monolith, enable microservices architecture
**Version**: 1.0
**Phase**: **Phase 2 (Months 12-18) - Strategic Split**

---

## EXECUTIVE SUMMARY

**blackroad-api** will be the **standalone API gateway** serving all BlackRoad OS clients. It extracts the 33 routers from the monolith (`BlackRoad-Operating-System`) and adds:
- Advanced routing (host-based, versioning)
- Rate limiting & throttling
- API key management
- GraphQL support (optional)
- Centralized authentication

**Current State**: Stub/planned repo
**Target State**: Production API gateway serving 1000+ requests/second
**Migration From**: `BlackRoad-Operating-System/backend/app/routers/`

**Role in 7-Layer Architecture**:
- **Layer 5** (API Gateway): Primary responsibility
- Sits between frontend (Layer 6) and orchestration (Layer 4)
- Routes to services: Prism, Lucidia, Operator, RoadChain

---

## PART 1: PURPOSE & FINAL ROLE

### Why Split from Monolith?

**Problems with Monolith API**:
- Scaling: Frontend UI and API have different scaling needs
- Deployment: API changes require full OS redeploy
- Performance: Static files and API compete for resources
- Organization: 33 routers in one repo is hard to navigate
- Testing: Integration tests are slow and complex

**Benefits of Standalone API**:
- Independent scaling (scale API separately from UI)
- Faster deployments (API changes don't touch frontend)
- Better caching (Cloudflare can cache API responses)
- Clear boundaries (API team vs. UI team)
- Easier testing (isolated API tests)

### Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENTS                                                     │
│ ├── Web UI (os.blackroad.systems)                           │
│ ├── Mobile App (future)                                     │
│ ├── CLI (blackroad-cli)                                     │
│ └── SDKs (Python, TypeScript, Go, Rust)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ CLOUDFLARE (DNS, SSL, CDN, DDoS)                           │
│ api.blackroad.systems                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ blackroad-api (THIS REPO)                                   │
│ ├── Authentication & Authorization (JWT, API keys)         │
│ ├── Rate Limiting & Throttling                             │
│ ├── Routing & Versioning (v1, v2, v3)                      │
│ ├── Request Validation & Transformation                     │
│ └── Response Caching & Compression                          │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓              ↓
┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ blackroad-    │ │ lucidia  │ │ blackroad│ │ PostgreSQL   │
│ operator      │ │ (AI)     │ │ -os      │ │ (direct)     │
│ (agents)      │ │          │ │ (core)   │ │              │
└───────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

### API Domains

| Domain | Purpose | Target | Phase |
|--------|---------|--------|-------|
| **api.blackroad.systems** | Primary API (versioned) | This repo | Phase 2 |
| **v1.api.blackroad.systems** | Explicit v1 API | This repo | Phase 2 |
| **v2.api.blackroad.systems** | v2 API (breaking changes) | This repo | Phase 3 |
| **graphql.api.blackroad.systems** | GraphQL endpoint | This repo | Phase 3 |

---

## PART 2: REQUIRED WORKFLOWS

### GitHub Actions (5 core workflows)

#### 1. CI/CD (`.github/workflows/ci.yml`)

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install flake8 black mypy
      - run: black --check .
      - run: flake8 .
      - run: mypy app/

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: pytest --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3

  contract-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install -r requirements.txt
      - run: pytest tests/contract/  # API contract tests
```

#### 2. Deploy to Railway (`.github/workflows/deploy.yml`)

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: blackroad-api
      - name: Health Check
        run: |
          sleep 30  # Wait for deploy
          curl -f https://api.blackroad.systems/health || exit 1
```

#### 3. Security Scan (`.github/workflows/security.yml`)

```yaml
name: Security
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: github/codeql-action/init@v2
        with:
          languages: python
      - uses: github/codeql-action/analyze@v2

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: snyk/actions/python@master
        with:
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

#### 4. API Documentation (`.github/workflows/docs.yml`)

```yaml
name: API Docs
on:
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install -r requirements.txt
      - run: python scripts/generate_openapi.py
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

#### 5. Performance Tests (`.github/workflows/performance.yml`)

```yaml
name: Performance
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2am
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install locust
      - run: locust -f tests/load/locustfile.py --headless -u 100 -r 10 --run-time 5m --host https://api.blackroad.systems
      - uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: reports/
```

---

## PART 3: SECRETS & ENVIRONMENT VARIABLES

### GitHub Secrets

| Secret | Purpose | How to Get |
|--------|---------|-----------|
| **RAILWAY_TOKEN** | Deploy to Railway | `railway login --browserless` |
| **CODECOV_TOKEN** | Coverage reporting | CodeCov project settings |
| **SNYK_TOKEN** | Security scanning | Snyk account settings |
| **SENTRY_DSN** | Error monitoring | Sentry project |

### Railway Environment Variables

**Core** (required):
```bash
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<openssl rand -hex 32>
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_ASYNC_URL=${{Postgres.DATABASE_ASYNC_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
PORT=8000
```

**API-Specific**:
```bash
# CORS
ALLOWED_ORIGINS=https://os.blackroad.systems,https://blackroadai.com,https://blackroad.me

# Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS_PER_MINUTE=60  # Per API key
RATE_LIMIT_BURST=100

# API Keys
API_KEY_ENCRYPTION_KEY=<openssl rand -hex 32>

# Service URLs (for routing to other services)
OPERATOR_SERVICE_URL=https://operator.blackroad.systems
LUCIDIA_SERVICE_URL=https://lucidia.blackroad.systems
OS_CORE_SERVICE_URL=https://os.blackroad.systems

# Monitoring
SENTRY_DSN=https://...
PROMETHEUS_ENABLED=True
```

---

## PART 4: CLOUDFLARE & DOMAIN WIRING

### DNS Records

**Primary API Domain** (`blackroad.systems` zone):

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | api | `blackroad-api-production.up.railway.app` | ✅ | Primary API endpoint |
| CNAME | v1.api | `blackroad-api-production.up.railway.app` | ✅ | Explicit v1 |
| CNAME | v2.api | `blackroad-api-v2.up.railway.app` | ✅ | v2 (future) |

### Cloudflare Configuration

**Cache Rules**:
- Cache static OpenAPI docs for 1 day
- Cache GET requests for 5 minutes (with cache-control header)
- Don't cache POST/PUT/DELETE
- Bypass cache for authenticated requests

**Page Rules**:
```
api.blackroad.systems/docs/*
  Cache Level: Everything
  Edge Cache TTL: 1 day

api.blackroad.systems/v1/*
  Cache Level: Cache Everything
  Edge Cache TTL: 5 minutes
  Respect Existing Headers: On
```

**Transform Rules** (add version header):
```javascript
// Add to all responses
X-API-Version: v1
X-Powered-By: BlackRoad OS
```

---

## PART 5: MIGRATION NOTES

### Migration from Monolith

**Step 1: Create Repo Structure**
```bash
mkdir blackroad-api
cd blackroad-api

# Initialize repo
git init
gh repo create blackboxprogramming/blackroad-api --public

# Copy structure from monolith
cp -r ../BlackRoad-Operating-System/backend/app ./
cp -r ../BlackRoad-Operating-System/backend/requirements.txt ./
cp ../BlackRoad-Operating-System/backend/Dockerfile ./

# Remove frontend (stays in monolith)
rm -rf app/static/

# Create new main.py (API-only)
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import *  # Import all 33 routers
from app.config import settings

app = FastAPI(
    title="BlackRoad OS API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(email.router)
# ... all 33 routers

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}
EOF
```

**Step 2: Update Imports**
```bash
# Find and replace import paths
find app/ -type f -name "*.py" -exec sed -i 's/from app\./from /g' {} \;
```

**Step 3: Add API-Specific Features**
```python
# app/middleware/rate_limit.py
from fastapi import Request, HTTPException
from redis import Redis
import time

class RateLimitMiddleware:
    def __init__(self, redis_url: str, requests_per_minute: int = 60):
        self.redis = Redis.from_url(redis_url)
        self.limit = requests_per_minute

    async def __call__(self, request: Request, call_next):
        api_key = request.headers.get("X-API-Key")
        if not api_key:
            raise HTTPException(401, "API key required")

        # Check rate limit
        key = f"rate_limit:{api_key}"
        count = self.redis.incr(key)
        if count == 1:
            self.redis.expire(key, 60)  # 1 minute window

        if count > self.limit:
            raise HTTPException(429, "Rate limit exceeded")

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, self.limit - count))
        return response
```

**Step 4: Deploy to Railway**
```bash
# Link Railway project
railway link

# Set environment variables
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set REDIS_URL=$REDIS_URL
# ... all other vars

# Deploy
railway up --service blackroad-api
```

**Step 5: Update Monolith**

In `BlackRoad-Operating-System/backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import httpx

app = FastAPI()

# Serve static UI
app.mount("/", StaticFiles(directory="static", html=True), name="static")

# Proxy API calls to new service
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def api_proxy(path: str, request: Request):
    async with httpx.AsyncClient() as client:
        url = f"https://api.blackroad.systems/{path}"
        response = await client.request(
            request.method,
            url,
            headers=dict(request.headers),
            content=await request.body()
        )
        return Response(response.content, response.status_code, dict(response.headers))
```

**Effort**: 2-3 weeks (includes testing, migration, deployment)

---

## PART 6: PHASE LABEL & MILESTONES

### Phase 2 (Months 12-18)

**Q1 (Months 12-15): API Extraction**
- [ ] Create repo, copy code from monolith
- [ ] Update imports, test locally
- [ ] Deploy to Railway staging
- [ ] Run API contract tests
- [ ] Migrate 50% of traffic to new API
- [ ] Monitor performance, errors
- [ ] Migrate 100% of traffic

**Q2 (Months 15-18): API Enhancements**
- [ ] Add rate limiting middleware
- [ ] Implement API key management
- [ ] Add GraphQL endpoint (optional)
- [ ] Performance optimization (cache, CDN)
- [ ] v2 API alpha (breaking changes)

**Success Metrics**:
- ✅ 99.9% uptime
- ✅ <100ms average latency
- ✅ 1000+ requests/second
- ✅ 0 migration-related incidents

### Phase 3 (Months 18-24+)

- [ ] GraphQL federation
- [ ] gRPC support for internal services
- [ ] Advanced caching (Redis + Cloudflare)
- [ ] API marketplace (third-party integrations)

---

## PART 7: SUCCESS CRITERIA

**Technical**:
- ✅ All 33 routers migrated successfully
- ✅ API contract tests passing (100% coverage)
- ✅ Performance equal or better than monolith
- ✅ Zero downtime during migration

**Business**:
- ✅ No customer-reported issues during migration
- ✅ Developer experience improved (faster API responses)
- ✅ Reduced deployment time (10 min → 3 min)

---

## QUICK REFERENCE

### API Endpoints (33 routers)

**Core**:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/dashboard/*` - Dashboard data

**Social & Communication**:
- `/api/email/*` - RoadMail
- `/api/social/*` - BlackRoad Social
- `/api/discord/*`, `/api/slack/*` - Messaging

**Content & Media**:
- `/api/video/*` - BlackStream
- `/api/games/*` - Gaming
- `/api/browser/*` - Web browsing

**Infrastructure**:
- `/api/blockchain/*` - RoadChain
- `/api/miner/*` - Mining
- `/api/devices/*` - Device management

**DevOps & Cloud**:
- `/api/railway/*`, `/api/vercel/*`, `/api/digitalocean/*`, `/api/cloudflare/*`

**AI & Integrations**:
- `/api/ai_chat/*` - OpenAI
- `/api/agents/*` - Agent execution
- `/api/huggingface/*` - ML models

**Developer Tools**:
- `/api/github/*`, `/api/vscode/*`, `/api/creator/*`

### Essential Commands

```bash
# Local development
uvicorn app.main:app --reload --port 8000

# Run tests
pytest --cov=app

# Deploy
railway up --service blackroad-api

# Logs
railway logs --service blackroad-api --tail 100

# Health check
curl https://api.blackroad.systems/health
```

---

**Last Updated**: 2025-11-18
**Next Review**: Phase 2 kickoff (Month 12)
