# Architecture Overview

BlackRoad OS is built on a **7-layer architecture** that spans from DNS/CDN at the bottom to user-facing applications at the top.

## The 7-Layer Stack

### Layer 1: DNS & CDN
**Purpose:** Domain management, SSL, DDoS protection

- **Provider:** Cloudflare
- **Domains:** 10+ domains (blackroad.systems, blackroadai.com, lucidia.earth, etc.)
- **Features:** DNS routing, SSL termination, caching, DDoS protection

### Layer 2: Compute & Infrastructure
**Purpose:** Application hosting and execution

- **Railway:** Production backend (FastAPI, PostgreSQL, Redis)
- **DigitalOcean:** Future RoadChain nodes
- **Cloudflare Workers:** Edge functions (future)

### Layer 3: Data & State
**Purpose:** Persistence, caching, and blockchain

- **PostgreSQL:** Primary relational database (Railway managed)
- **Redis:** Caching and session storage
- **RoadChain:** Tamper-evident audit ledger
- **Vault:** Compliance and encrypted storage

### Layer 4: Orchestration & Intelligence
**Purpose:** AI, job scheduling, and workflow automation

- **Lucidia Layer:** Multi-model AI orchestration (Phase 2)
- **Prism Layer:** Job queue, event log, metrics
- **Operator Engine:** Scheduled agents and workflows

### Layer 5: API Gateway & Routing
**Purpose:** HTTP API and WebSocket endpoints

- **FastAPI Backend:** REST API + WebSocket
- **Routes:** 30+ API routers for different services
- **Features:** Authentication, CORS, rate limiting

### Layer 6: Application Layer
**Purpose:** User-facing applications

- **Pocket OS:** Windows 95-style web interface
- **Prism Console:** Admin dashboard
- **Native Apps:** RoadStudio, CloudWay, Lucidia Chat, etc.

### Layer 7: User Experience
**Purpose:** Branded domains and landing pages

- **blackroad.systems:** Corporate website
- **os.blackroad.systems:** Main OS interface
- **prism.blackroad.systems:** Admin console
- **lucidia.earth:** AI narrative experiences

## Request Flow

Here's how a user request flows through the system:

```
User Browser
    ↓
Cloudflare DNS (Layer 1)
    ↓
Cloudflare CDN/SSL (Layer 1)
    ↓
Railway Load Balancer (Layer 2)
    ↓
FastAPI Backend (Layer 5)
    ↓
Business Logic (Layer 4: Operator, Prism, Lucidia)
    ↓
Database/Redis/RoadChain (Layer 3)
    ↓
Response → Browser
```

## Module Architecture

### Backend API
```
backend/
├── app/
│   ├── main.py           # FastAPI app
│   ├── routers/          # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   └── utils/            # Helpers
└── static/               # Frontend assets
```

### Core OS Runtime
```
core_os/
├── models.py             # UserSession, Window, OSState
├── state.py              # State management
└── adapters/
    └── api_client.py     # Backend communication
```

### Operator Engine
```
operator_engine/
├── jobs.py               # Job definitions
├── scheduler.py          # Scheduling logic
└── server.py             # Optional HTTP API
```

### Web Client (Pocket OS)
```
backend/static/
├── index.html            # Main UI
└── js/
    ├── core-os-client.js # Core OS integration
    ├── apps.js           # Applications
    └── auth.js           # Authentication
```

### Prism Console
```
prism-console/
├── index.html            # Admin UI
└── static/
    ├── css/prism.css     # Styles
    └── js/prism.js       # Console logic
```

## Technology Stack

### Backend
- **FastAPI 0.104.1** - Modern async web framework
- **SQLAlchemy 2.0.23** - ORM
- **PostgreSQL** - Database
- **Redis 5.0.1** - Caching
- **Uvicorn 0.24.0** - ASGI server

### Frontend
- **Vanilla JavaScript** - No framework
- **HTML5 / CSS3** - Modern web standards
- **Zero dependencies** - No build process

### Infrastructure
- **Railway** - Backend hosting
- **Cloudflare** - DNS, CDN, SSL
- **GitHub Actions** - CI/CD
- **Docker** - Containerization

## Design Principles

1. **Agent-First**: Humans orchestrate, agents execute
2. **Memory-Conscious**: Everything is logged and retrievable
3. **Ledger-Aware**: Critical actions are provable and tamper-evident
4. **Zero-Dependency Frontend**: Vanilla JS with no build process
5. **Cloud-Native**: Infrastructure as software

## Scalability

### Current Capacity
- Single Railway instance
- PostgreSQL (managed)
- Redis (managed)

### Future Scaling
- Horizontal scaling via Railway
- Database read replicas
- Redis clustering
- Cloudflare Workers for edge compute
- RoadChain distributed nodes

## Security

- **HTTPS Everywhere**: Cloudflare SSL
- **JWT Authentication**: Token-based auth
- **Input Validation**: Pydantic models
- **SQL Injection Protection**: ORM queries
- **CORS Configuration**: Restricted origins
- **Rate Limiting**: API throttling (future)

## Monitoring

- **Health Checks**: `/health` endpoint
- **Logging**: Structured logging
- **Error Tracking**: Sentry integration
- **Metrics**: Prometheus (future)
- **Observability**: Prism Console

## Next: Component Deep Dive

See [Components](components.md) for detailed information about each module.
