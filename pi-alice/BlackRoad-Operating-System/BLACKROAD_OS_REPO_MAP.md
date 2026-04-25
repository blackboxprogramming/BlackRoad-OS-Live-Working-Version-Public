# BlackRoad OS Repository Map

> **Version:** Phase 2 Scaffold
> **Last Updated:** 2025-11-18
> **Branch:** `claude/os-phase2-scaffold-01LKeSDWFNBtXhhsV2xMbM4T`

## Overview

This document maps all Phase 2 scaffolded components within the BlackRoad-Operating-System monorepo.

## Repository Structure

All components are housed in the **single monorepo**:
- **Repo:** `blackboxprogramming/BlackRoad-Operating-System`
- **Approach:** Monorepo with modular services
- **Future:** May extract to separate repos if needed

---

## Component Map

### 1. Backend API

| Property | Value |
|----------|-------|
| **Location** | `backend/` |
| **Language** | Python (FastAPI) |
| **New Endpoints** | `/api/system/version`, `/api/system/config/public`, `/api/system/os/state` |
| **Tests** | `backend/tests/test_system.py` |
| **CI Workflow** | `.github/workflows/backend-tests.yml` |
| **Run Command** | `cd backend && uvicorn app.main:app --reload` |
| **API Docs** | `http://localhost:8000/api/docs` |

**Key Features:**
- 30+ existing API routers
- New system endpoints for OS integration
- JWT authentication
- PostgreSQL + Redis integration

**How to Run:**
```bash
cd backend
uvicorn app.main:app --reload
# 🗺️ BlackRoad OS Repository Map

**Version**: 2.5
**Date**: 2025-11-18
**Purpose**: Complete module-by-module breakdown showing how components connect

---

## Repository Structure

```
BlackRoad-Operating-System/          # Canonical OS monorepo
├── backend/                          # FastAPI backend + static UI
│   ├── app/                          # Core application
│   │   ├── main.py                   # FastAPI app, router registration
│   │   ├── config.py                 # Settings (Pydantic)
│   │   ├── database.py               # SQLAlchemy async sessions
│   │   ├── redis_client.py           # Redis connection pool
│   │   ├── models/                   # Database models (SQLAlchemy)
│   │   ├── routers/                  # API endpoint routers (33+)
│   │   ├── services/                 # Business logic layer
│   │   └── utils/                    # Shared utilities
│   ├── static/                       # Frontend UI (canonical)
│   │   ├── index.html                # Main OS interface
│   │   ├── prism/                    # Prism Console UI
│   │   ├── js/                       # JavaScript modules
│   │   └── assets/                   # CSS, images, fonts
│   ├── tests/                        # Backend test suite
│   ├── requirements.txt              # Python dependencies
│   └── Dockerfile                    # Container definition
│
├── agents/                           # 200+ AI agent ecosystem
│   ├── base/                         # Core agent framework
│   ├── categories/                   # 10 agent categories
│   └── tests/                        # Agent tests
│
├── sdk/                              # Client SDKs
│   ├── python/                       # Python SDK
│   └── typescript/                   # TypeScript SDK
│
├── codex-docs/                       # MkDocs documentation
│   ├── mkdocs.yml                    # Docs configuration
│   ├── docs/                         # Markdown documentation
│   └── DEPLOY_DOCS.md                # Deployment guide
│
├── infra/                            # Infrastructure configs
│   ├── cloudflare/                   # DNS, Workers
│   ├── railway/                      # Railway deployment
│   └── env/                          # Environment variables
│
├── .github/                          # GitHub automation
│   ├── workflows/                    # CI/CD pipelines
│   └── CODEOWNERS                    # Code ownership
│
├── docs/                             # Legacy docs (consolidating to codex-docs/)
├── scripts/                          # Utility scripts
├── ops/                              # Operations tools
└── [Root documentation files]
    ├── README.md                     # Project overview
    ├── CLAUDE.md                     # AI assistant guide
    ├── MASTER_ORCHESTRATION_PLAN.md  # Infrastructure blueprint
    ├── PHASE2_5_SUMMARY_FOR_ALEXA.md # Phase 2.5 summary
    └── DEPLOYMENT_NOTES.md           # Production deployment guide
```

---

## Module Connections & Data Flow

### 1. Request Flow (User → Backend → Database)

```
┌─────────────────────────────────────────────────────────────┐
│ USER BROWSER                                                 │
│ - Visits: https://blackroad.systems                         │
│ - Loads: backend/static/index.html                          │
│ - Executes: JavaScript (OS boot)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│ CLOUDFLARE CDN                                               │
│ - DNS resolution                                             │
│ - SSL termination                                            │
│ - Static asset caching                                       │
│ - DDoS protection                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ Proxy
┌─────────────────────────────────────────────────────────────┐
│ RAILWAY → FastAPI Backend (backend/app/main.py)             │
│                                                              │
│ Request Handling:                                            │
│ 1. CORS Middleware (app/main.py:78)                         │
│ 2. Timing Middleware (app/main.py:89)                       │
│ 3. Router Matching                                           │
│                                                              │
│ Routes:                                                      │
│ • GET / → StaticFiles(backend/static/)                      │
│ • GET /prism → StaticFiles(backend/static/prism/)           │
│ • GET /api/docs → OpenAPI documentation                     │
│ • GET /health → Health check endpoint                       │
│ • POST /api/auth/login → auth.router                        │
│ • GET /api/prism/jobs → prism.router (future)               │
│ • [30+ other API routes]                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ ROUTER LAYER (backend/app/routers/)                         │
│                                                              │
│ Example: POST /api/auth/login                               │
│ 1. routers/auth.py:login()                                  │
│ 2. Validate request (Pydantic schema)                       │
│ 3. Call service layer                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ SERVICE LAYER (backend/app/services/)                       │
│                                                              │
│ Example: services/auth.py                                    │
│ 1. authenticate_user(email, password)                        │
│ 2. Query database via models                                │
│ 3. Verify password hash                                     │
│ 4. Generate JWT token                                       │
│ 5. Store session in Redis                                   │
│ 6. Return user data + token                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER                                                   │
│                                                              │
│ PostgreSQL (Railway managed):                                │
│ • app/database.py → async session                           │
│ • app/models/ → SQLAlchemy ORM                              │
│ • Tables: users, wallets, blocks, etc.                      │
│                                                              │
│ Redis (Railway managed):                                     │
│ • app/redis_client.py → connection pool                     │
│ • Usage: sessions, caching, WebSocket state                 │
└─────────────────────────────────────────────────────────────┘
                            ↓ Response
┌─────────────────────────────────────────────────────────────┐
│ BROWSER (JavaScript)                                         │
│ - Receives JSON response                                    │
│ - Updates OS UI (DOM manipulation)                          │
│ - Stores token in localStorage                              │
│ - Makes subsequent API calls with auth header               │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Core OS Runtime

| Property | Value |
|----------|-------|
| **Location** | `core_os/` |
| **Language** | Python |
| **Key Files** | `models.py`, `state.py`, `adapters/api_client.py` |
| **Tests** | `core_os/tests/` |
| **CI Workflow** | `.github/workflows/core-os-tests.yml` |
| **README** | `core_os/README.md` |

**Key Features:**
- `UserSession`, `Window`, `OSState` models
- State management functions (open_window, close_window, etc.)
- Backend API adapter for communication
- In-memory state storage (future: Redis/PostgreSQL)

**How to Run:**
```python
from core_os import get_initial_state, open_window
state = get_initial_state()
state = open_window("notepad")
```

---

### 3. Operator Engine

| Property | Value |
|----------|-------|
| **Location** | `operator_engine/` |
| **Language** | Python |
| **Key Files** | `jobs.py`, `scheduler.py`, `server.py` |
| **Tests** | `operator_engine/tests/` |
| **CI Workflow** | `.github/workflows/operator-tests.yml` |
| **Run Command** | `python -m operator_engine.server` |
| **README** | `operator_engine/README.md` |

**Key Features:**
- In-memory job registry with example jobs
- Simple interval-based scheduler
- Optional HTTP API on port 8001
- Job lifecycle management (pending, running, completed, failed)

**How to Run:**
```bash
# As a library
python -c "from operator_engine import Scheduler; print('OK')"

# As a service
python -m operator_engine.server
# Visit http://localhost:8001/docs
## 2. Frontend Architecture (Vanilla JavaScript)

### Main OS (backend/static/)

```
static/
├── index.html                        # OS entry point
│   └── Loads:
│       ├── css/os.css                # OS styling
│       ├── js/os.js                  # Core OS runtime
│       ├── js/components.js          # UI component library
│       ├── js/registry.js            # App registry
│       └── js/apps/*.js              # Individual apps
│
├── js/
│   ├── os.js                         # Core OS
│   │   ├── window.OS object          # Global OS namespace
│   │   ├── Event bus                 # Inter-app communication
│   │   ├── Window manager            # Draggable windows
│   │   └── State management          # Local storage
│   │
│   ├── components.js                 # UI Components
│   │   ├── Button()                  # Button component
│   │   ├── Card()                    # Card component
│   │   ├── Modal()                   # Modal dialog
│   │   └── [12+ other components]
│   │
│   ├── registry.js                   # App Registry
│   │   ├── List of all apps          # Icon, name, category
│   │   └── App initialization        # Load on demand
│   │
│   └── apps/                         # Application Modules
│       ├── prism.js                  # Prism Console app
│       ├── lucidia.js                # AI chat app
│       ├── miners.js                 # Mining app
│       ├── dashboard.js              # Dashboard app
│       └── [20+ other apps]
│
└── assets/
    ├── css/                          # Stylesheets
    │   ├── os.css                    # Main OS styles
    │   ├── win95.css                 # Windows 95 theme
    │   └── components.css            # Component styles
    │
    └── images/                       # Icons, logos, backgrounds
```

### Prism Console (backend/static/prism/)

```
prism/
├── index.html                        # Prism entry point (served at /prism)
│   └── Loads:
│       ├── css/prism.css             # Prism-specific styling
│       ├── js/prism-core.js          # Prism runtime
│       └── js/prism-components.js    # Prism UI components
│
├── js/
│   ├── prism-core.js                 # Core Prism logic
│   │   ├── Job queue management      # Monitor running jobs
│   │   ├── Event log viewer          # System event stream
│   │   ├── Metrics dashboard         # Health, performance
│   │   └── API client                # Calls /api/prism/*
│   │
│   └── prism-components.js           # Prism-specific UI
│       ├── JobCard()                 # Job display card
│       ├── LogViewer()               # Event log component
│       └── MetricsChart()            # Metrics visualization
│
└── assets/
    └── css/prism.css                 # Prism styling
```

### Communication Pattern

```javascript
// Example: Prism Console fetching jobs

// 1. Prism UI component (prism/js/prism-core.js)
async function fetchJobs() {
    const response = await fetch('/api/prism/jobs', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const jobs = await response.json();
    renderJobs(jobs);
}

// 2. Backend router (backend/app/routers/prism.py)
@router.get("/jobs")
async def get_jobs(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    jobs = await db.execute(select(Job).where(Job.user_id == current_user.id))
    return jobs.scalars().all()

// 3. Response flows back to frontend, rendered in UI
```

---

### 4. Web Client (Pocket OS)

| Property | Value |
|----------|-------|
| **Location** | `backend/static/` (primary), `web-client/` (docs) |
| **Language** | JavaScript (Vanilla), HTML, CSS |
| **New File** | `backend/static/js/core-os-client.js` |
| **CI Workflow** | `.github/workflows/ci.yml` (HTML/JS validation) |
| **Run Command** | Served by backend at `http://localhost:8000/` |
| **README** | `web-client/README.md` |

**Key Features:**
- Windows 95-style desktop UI
- New `CoreOSClient` class for API integration
- Event-driven architecture
- Zero dependencies

**How to Run:**
```bash
# Start backend (serves frontend at /)
cd backend
uvicorn app.main:app --reload

# Visit http://localhost:8000/
```

**New in Phase 2:**
```javascript
await window.coreOS.initialize();
const version = await window.coreOS.getVersion();
console.log('OS Version:', version.version);
## 3. Backend API Architecture

### Router Organization (backend/app/routers/)

```
routers/
├── auth.py                           # Authentication
│   ├── POST /api/auth/register       # User registration
│   ├── POST /api/auth/login          # User login
│   ├── POST /api/auth/refresh        # Token refresh
│   └── GET /api/auth/me              # Current user
│
├── prism_static.py                   # Prism Console static serving (NEW)
│   └── GET /prism/*                  # Serve Prism UI files
│
├── prism.py                          # Prism API (future)
│   ├── GET /api/prism/jobs           # List jobs
│   ├── POST /api/prism/jobs          # Create job
│   ├── GET /api/prism/jobs/{id}      # Get job details
│   ├── GET /api/prism/events         # Event stream
│   └── GET /api/prism/metrics        # System metrics
│
├── dashboard.py                      # Dashboard data
│   ├── GET /api/dashboard/stats      # System statistics
│   └── GET /api/dashboard/activity   # Recent activity
│
├── blockchain.py                     # RoadChain
│   ├── GET /api/blockchain/blocks    # List blocks
│   ├── POST /api/blockchain/blocks   # Create block
│   └── GET /api/blockchain/verify    # Verify chain
│
├── ai_chat.py                        # AI/Lucidia integration
│   ├── POST /api/chat/message        # Send message
│   └── GET /api/chat/history         # Chat history
│
├── miner.py                          # Mining operations
│   ├── POST /api/miner/start         # Start mining
│   ├── POST /api/miner/stop          # Stop mining
│   └── GET /api/miner/stats          # Mining statistics
│
└── [30+ other routers]               # See backend/app/main.py for full list
```

### Service Layer (backend/app/services/)

```
services/
├── auth.py                           # Authentication logic
│   ├── authenticate_user()           # Verify credentials
│   ├── create_access_token()         # Generate JWT
│   └── verify_token()                # Validate JWT
│
├── crypto.py                         # Cryptography
│   ├── hash_password()               # Password hashing
│   ├── verify_password()             # Password verification
│   └── encrypt_wallet_key()          # Wallet encryption
│
├── blockchain.py                     # RoadChain logic
│   ├── create_block()                # Create new block
│   ├── verify_chain()                # Verify blockchain
│   └── calculate_hash()              # SHA-256 hashing
│
└── [Other services]
```

### Database Models (backend/app/models/)

```
models/
├── user.py                           # User model
│   ├── id: int (PK)
│   ├── email: str (unique)
│   ├── password_hash: str
│   ├── created_at: datetime
│   └── Relationships: wallets, jobs
│
├── wallet.py                         # Wallet model
│   ├── id: int (PK)
│   ├── user_id: int (FK → users)
│   ├── address: str (unique)
│   ├── private_key_encrypted: str
│   └── balance: float
│
├── block.py                          # Blockchain block
│   ├── id: int (PK)
│   ├── index: int
│   ├── timestamp: datetime
│   ├── data: JSON
│   ├── previous_hash: str
│   └── hash: str
│
├── job.py                            # Prism job (future)
│   ├── id: int (PK)
│   ├── user_id: int (FK → users)
│   ├── type: str (e.g., "deploy", "test")
│   ├── status: str (pending/running/completed/failed)
│   ├── created_at: datetime
│   └── result: JSON
│
└── [Other models]
```

---

### 5. Prism Console

| Property | Value |
|----------|-------|
| **Location** | `prism-console/` |
| **Language** | HTML, CSS, JavaScript |
| **Entry Point** | `prism-console/index.html` |
| **Run Command** | `cd prism-console && python -m http.server 8080` |
| **README** | `prism-console/README.md` |

**Key Features:**
- Modern dark-themed admin UI
- Multi-tab navigation (Overview, Jobs, Agents, Logs, System)
- System metrics dashboard
- Backend API integration
- Auto-refresh every 30 seconds

**How to Run:**
```bash
# Standalone
cd prism-console
python -m http.server 8080
# Visit http://localhost:8080/

# Or integrate with backend (future)
# Visit http://localhost:8000/prism
```

---

### 6. Documentation (Codex)

| Property | Value |
|----------|-------|
| **Location** | `codex-docs/` |
| **Technology** | MkDocs + Material theme |
| **Config** | `codex-docs/mkdocs.yml` |
| **Source** | `codex-docs/docs/` |
| **CI Workflow** | `.github/workflows/docs-build.yml` |
| **Run Command** | `cd codex-docs && mkdocs serve` |
| **README** | `codex-docs/README.md` |

**Key Features:**
- Complete system documentation
- Architecture guides
- Component documentation
- API reference
- Development guides

**How to Run:**
```bash
cd codex-docs
pip install mkdocs mkdocs-material mkdocstrings
mkdocs serve
# Visit http://localhost:8000
## 4. Agent Ecosystem (agents/)

### Base Framework (agents/base/)

```
base/
├── agent.py                          # Base Agent class
│   ├── __init__(name, version, category)
│   ├── async execute()               # Main execution method
│   ├── async initialize()            # Setup before execution
│   ├── async cleanup()               # Cleanup after execution
│   └── async on_error(error)         # Error handling
│
├── executor.py                       # Execution engine
│   ├── run_agent(agent)              # Execute single agent
│   ├── run_workflow(agents)          # Execute agent workflow
│   └── schedule_agent(agent, cron)   # Schedule recurring execution
│
└── registry.py                       # Agent discovery
    ├── register(agent)               # Register agent
    ├── discover()                    # Auto-discover agents
    └── get_agent(name)               # Get agent by name
```

### Agent Categories (agents/categories/)

```
categories/
├── devops/                           # DevOps agents (30+)
│   ├── deploy_agent.py               # Deployment automation
│   ├── monitor_agent.py              # Infrastructure monitoring
│   └── backup_agent.py               # Backup automation
│
├── engineering/                      # Engineering agents (40+)
│   ├── code_review_agent.py          # Code review
│   ├── test_generator_agent.py       # Test generation
│   └── refactor_agent.py             # Code refactoring
│
├── ai_ml/                            # AI/ML agents (25+)
│   ├── model_trainer_agent.py        # Model training
│   ├── data_pipeline_agent.py        # Data processing
│   └── inference_agent.py            # Model inference
│
└── [7 more categories]               # See agents/README.md
```

### Agent Communication (via Prism)

```
┌─────────────────────────────────────────────────────────────┐
│ AGENT A (Deploy Agent)                                       │
│ 1. Execute deployment                                        │
│ 2. Publish event to Prism: {"type": "deploy_complete"}      │
└─────────────────────────────────────────────────────────────┘
                            ↓ Event
┌─────────────────────────────────────────────────────────────┐
│ PRISM (Event Bus)                                            │
│ - Receives event                                             │
│ - Logs to event table (database)                            │
│ - Publishes to Redis (pub/sub)                              │
│ - Notifies subscribed agents                                │
└─────────────────────────────────────────────────────────────┘
                            ↓ Subscription
┌─────────────────────────────────────────────────────────────┐
│ AGENT B (Monitor Agent)                                      │
│ 1. Receives "deploy_complete" event                         │
│ 2. Runs health checks                                       │
│ 3. Publishes event: {"type": "health_check_passed"}        │
└─────────────────────────────────────────────────────────────┘
```

---

## CI/CD Workflows

All workflows in `.github/workflows/`:

| Workflow | Triggers | Tests | Artifact |
|----------|----------|-------|----------|
| `backend-tests.yml` | backend/* changes | Backend API + system endpoints | Test results |
| `core-os-tests.yml` | core_os/* changes | Core OS models + state management | Test results |
| `operator-tests.yml` | operator_engine/* changes | Operator jobs + scheduler | Test results |
| `docs-build.yml` | codex-docs/* changes | MkDocs build | Documentation site |
| `ci.yml` | HTML/JS changes | HTML/JS validation | - |

---

## Integration Flow

### User Request Flow

```
User Browser
    ↓
Web Client (Pocket OS)
    ├── core-os-client.js
    ├── Calls: GET /api/system/version
    └── Calls: GET /api/system/os/state
    ↓
Backend API (FastAPI)
    ├── /api/system/version → system.py router
    ├── /api/system/config/public → system.py router
    └── /api/system/os/state → system.py router (stub)
    ↓
Core OS Runtime (future integration)
    ├── get_current_state()
    └── Returns OSState with windows, desktop, etc.
```

### Admin/Ops Flow

```
Admin Browser
    ↓
Prism Console
    ├── prism.js
    ├── Calls: GET /api/system/version
    ├── Calls: GET /api/system/config/public
    └── Calls: GET /api/operator/jobs (future)
    ↓
Backend API
    ↓
Operator Engine (future integration)
    ├── list_jobs()
    └── execute_job(job_id)
## 5. Documentation (codex-docs/)

### MkDocs Structure

```
codex-docs/
├── mkdocs.yml                        # Configuration
│   ├── site_name: "BlackRoad OS Codex"
│   ├── theme: material               # Material for MkDocs
│   ├── plugins: search, etc.         # MkDocs plugins
│   └── nav: [navigation structure]   # Sidebar navigation
│
├── docs/                             # Markdown documentation
│   ├── index.md                      # Landing page
│   │
│   ├── architecture/                 # Architecture docs
│   │   ├── overview.md               # System overview
│   │   ├── phase2-decisions.md       # Phase 2.5 decisions
│   │   └── infra-deployment.md       # Deployment architecture
│   │
│   ├── api/                          # API reference
│   │   ├── authentication.md         # Auth endpoints
│   │   ├── prism.md                  # Prism API
│   │   └── blockchain.md             # RoadChain API
│   │
│   ├── guides/                       # User guides
│   │   ├── quickstart.md             # Quick start guide
│   │   ├── deployment.md             # Deployment guide
│   │   └── development.md            # Development setup
│   │
│   ├── agents/                       # Agent documentation
│   │   ├── overview.md               # Agent ecosystem
│   │   ├── creating-agents.md        # How to create agents
│   │   └── categories.md             # Agent categories
│   │
│   └── contributing.md               # Contribution guidelines
│
├── DEPLOY_DOCS.md                    # Deployment guide for docs
│
└── site/                             # Generated site (gitignored)
    └── [Built HTML files]
```

### Documentation Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ DEVELOPER                                                    │
│ 1. Edit markdown in codex-docs/docs/                        │
│ 2. Test locally: mkdocs serve                               │
│ 3. Commit and push to main                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ Git Push
┌─────────────────────────────────────────────────────────────┐
│ GITHUB ACTIONS (.github/workflows/docs-deploy.yml)          │
│ 1. Checkout code                                             │
│ 2. Install MkDocs + Material theme                          │
│ 3. Run: mkdocs build --strict                               │
│ 4. Deploy to gh-pages branch                                │
└─────────────────────────────────────────────────────────────┘
                            ↓ Deploy
┌─────────────────────────────────────────────────────────────┐
│ GITHUB PAGES                                                 │
│ - Serves from: gh-pages branch                              │
│ - URL: https://blackboxprogramming.github.io/BlackRoad-*    │
└─────────────────────────────────────────────────────────────┘
                            ↓ DNS
┌─────────────────────────────────────────────────────────────┐
│ CLOUDFLARE                                                   │
│ - CNAME: docs.blackroad.systems → blackboxprogramming.github.io │
│ - Proxied: Yes (SSL + CDN)                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ USER                                                         │
│ - Visits: https://docs.blackroad.systems                    │
│ - Views: MkDocs documentation                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Path Examples

### Example 1: Get System Version

**Client Code:**
```javascript
const version = await window.coreOS.getVersion();
```

**HTTP Request:**
```
GET /api/system/version
```

**Backend Route:**
```python
# backend/app/routers/system.py
@router.get("/version")
async def get_version():
    return {
        "version": settings.APP_VERSION,
        "build_time": datetime.utcnow().isoformat(),
        "env": settings.ENVIRONMENT,
    }
```

**Response:**
```json
{
  "version": "1.0.0",
  "build_time": "2025-11-18T12:00:00",
  "env": "development",
  "git_sha": "abc12345"
}
## 6. SDK Architecture (sdk/)

### Python SDK (sdk/python/)

```python
# Example usage:
from blackroad import BlackRoadClient

client = BlackRoadClient(
    base_url="https://blackroad.systems",
    api_key="your-api-key"
)

# Authenticate
user = await client.auth.login("email@example.com", "password")

# Create a job
job = await client.prism.create_job({
    "type": "deploy",
    "target": "production",
    "config": {...}
})

# Monitor job
status = await client.prism.get_job_status(job.id)
```

### TypeScript SDK (sdk/typescript/)

```typescript
// Example usage:
import { BlackRoadClient } from '@blackroad/sdk';

const client = new BlackRoadClient({
    baseUrl: 'https://blackroad.systems',
    apiKey: 'your-api-key'
});

// Authenticate
const user = await client.auth.login('email@example.com', 'password');

// Create a job
const job = await client.prism.createJob({
    type: 'deploy',
    target: 'production',
    config: {...}
});

// Monitor job
const status = await client.prism.getJobStatus(job.id);
```

---

### Example 2: Get Public Config

**Client Code:**
```javascript
const config = await window.coreOS.getPublicConfig();
```

**HTTP Request:**
```
GET /api/system/config/public
```

**Response:**
```json
{
  "environment": "development",
  "app_name": "BlackRoad Operating System",
  "version": "1.0.0",
  "features": {
    "blockchain_enabled": true,
    "ai_agents_enabled": true,
    "video_streaming_enabled": true
  },
  "limits": {
    "max_upload_size_mb": 100,
    "session_timeout_minutes": 60
  },
  "external_services": {
    "github_integration": true,
    "stripe_enabled": false,
    "openai_enabled": true
  }
}
## 7. Infrastructure (infra/)

### Cloudflare (infra/cloudflare/)

```
cloudflare/
├── records.yaml                      # DNS records
├── CLOUDFLARE_DNS_BLUEPRINT.md       # DNS configuration guide
├── DNS_CONFIGURATION.md              # Detailed DNS setup (NEW)
└── cloudflare_dns_sync.py            # Automated DNS sync script
```

### Railway (infra/railway/)

```
railway/
├── RAILWAY_DEPLOYMENT_GUIDE.md       # Complete deployment guide (NEW)
├── railway.toml                      # Railway configuration
└── railway.json                      # Service definitions
```

### Environment (infra/env/)

```
env/
└── ENVIRONMENT_MAP.md                # Cross-platform env vars
```

---

### Example 3: Initialize OS (Client-side)

**Client Code:**
```javascript
const result = await window.coreOS.initialize();
console.log('Version:', result.version);
console.log('Config:', result.config);
console.log('State:', result.state);
```

**Makes 3 parallel requests:**
1. `GET /api/system/version`
2. `GET /api/system/config/public`
3. `GET /api/system/os/state`

---

## Testing Each Component

### Backend API
```bash
cd backend
pytest tests/test_system.py -v
```

### Core OS
```bash
pytest core_os/tests/ -v
```

### Operator Engine
```bash
pytest operator_engine/tests/ -v
```

### Web Client
```bash
# Start backend
cd backend && uvicorn app.main:app --reload

# Open browser: http://localhost:8000/
# Open console: Should see "Core OS Client loaded (v0.1.0)"
# Run: await window.coreOS.initialize()
```

### Prism Console
```bash
cd prism-console
python -m http.server 8080

# Visit http://localhost:8080/
# Should see system metrics dashboard
```

### Documentation
```bash
cd codex-docs
mkdocs build
# Check for errors in build output
```

---

## File Count Summary

| Component | Files Created | Tests | CI Workflows |
|-----------|--------------|-------|--------------|
| Backend API | 1 new router | 1 test file | Existing |
| Core OS | 6 files | 2 test files | 1 new workflow |
| Operator Engine | 7 files | 2 test files | 1 new workflow |
| Web Client | 2 files | Manual | Existing |
| Prism Console | 4 files | Manual | None yet |
| Documentation | 10+ files | Build test | 1 new workflow |

**Total New Files:** ~30+
**Total New Tests:** 5 test files
**Total New Workflows:** 3 CI workflows

---

## Environment Variables

All modules share these environment variables (set in `backend/.env`):

```bash
# Core
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here

# Application
APP_NAME="BlackRoad Operating System"
APP_VERSION="1.0.0"
ENVIRONMENT=development

# Operator
SCHEDULER_INTERVAL_SECONDS=60
MAX_CONCURRENT_JOBS=5

# External (optional)
GITHUB_TOKEN=...
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
```

---

## Next Steps (Post-PR)

1. **Merge PR** - Review and merge this scaffold
2. **Deploy to Railway** - Test in production
3. **Integrate Core OS** - Connect backend API to core_os module
4. **Enable Prism Route** - Serve Prism at `/prism` from backend
5. **Add WebSocket** - Real-time state sync
6. **Production Jobs** - Replace stub jobs with real ones
7. **Deploy Docs** - Publish Codex to GitHub Pages

---

## Troubleshooting

### Backend won't start
```bash
# Check dependencies
pip install -r backend/requirements.txt

# Check database
# Ensure DATABASE_URL is set

# Check ports
# Ensure port 8000 is available
```

### Tests failing
```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run with verbose output
pytest -v --tb=short
```

### Docs won't build
```bash
# Install MkDocs
pip install mkdocs mkdocs-material mkdocstrings

# Build with strict mode
cd codex-docs
mkdocs build --strict
```

---

## Repository Summary

**Monorepo:** `blackboxprogramming/BlackRoad-Operating-System`
**Branch:** `claude/os-phase2-scaffold-01LKeSDWFNBtXhhsV2xMbM4T`
**Components:** 6 modules (API, Core OS, Operator, Web, Prism, Docs)
**New Code:** ~3,000 lines (Python + JavaScript + HTML + Markdown)
**Tests:** 5 test suites with 15+ tests
**CI:** 3 new workflows + 4 existing
**Documentation:** 10+ pages in MkDocs

---

**Phase 2 Scaffold Complete! Ready for Alexa's review. 🚀**
## 8. CI/CD (.github/workflows/)

```
workflows/
├── ci.yml                            # Main CI (lint, test, build)
├── backend-tests.yml                 # Backend test suite
├── railway-deploy.yml                # Deploy to Railway
├── docs-deploy.yml                   # Deploy docs to GitHub Pages (NEW)
├── railway-automation.yml            # Railway secrets audit
└── [Other workflows]
```

---

## API Contracts Between Layers

### Frontend ↔ Backend

**Authentication:**
```typescript
// Request
POST /api/auth/login
{
    "email": "user@example.com",
    "password": "password123"
}

// Response
{
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
        "id": 1,
        "email": "user@example.com"
    }
}
```

**Prism Jobs:**
```typescript
// Request
GET /api/prism/jobs
Headers: { "Authorization": "Bearer eyJhbGciOi..." }

// Response
{
    "data": [
        {
            "id": 1,
            "type": "deploy",
            "status": "completed",
            "created_at": "2025-11-18T12:00:00Z",
            "result": {...}
        }
    ],
    "total": 42,
    "page": 1,
    "per_page": 20
}
```

### Backend ↔ Database

**User Query:**
```python
# ORM Query (SQLAlchemy)
from app.models.user import User
from sqlalchemy import select

result = await db.execute(
    select(User).where(User.email == email)
)
user = result.scalar_one_or_none()
```

**Blockchain Query:**
```python
# Get latest blocks
from app.models.block import Block

result = await db.execute(
    select(Block)
    .order_by(Block.index.desc())
    .limit(10)
)
blocks = result.scalars().all()
```

### Backend ↔ Redis

**Session Storage:**
```python
# Store session
await redis.setex(
    f"session:{user_id}",
    3600,  # 1 hour
    json.dumps({"user_id": user_id, "email": email})
)

# Retrieve session
session_data = await redis.get(f"session:{user_id}")
```

**WebSocket State:**
```python
# Publish event
await redis.publish(
    "prism:events",
    json.dumps({"type": "job_completed", "job_id": 123})
)

# Subscribe to events
pubsub = redis.pubsub()
await pubsub.subscribe("prism:events")
```

---

## Key Integration Points

### 1. OS → Prism Console
- User clicks "Prism Console" app in OS
- OS opens window with iframe/route to `/prism`
- Prism UI loads, shares auth token from OS
- Prism makes API calls to `/api/prism/*`

### 2. Prism → Backend API
- Prism fetches jobs: `GET /api/prism/jobs`
- Backend queries database via models
- Returns JSON response
- Prism renders in UI

### 3. Backend → Database
- Router receives request
- Service layer business logic
- ORM query via async session
- Results returned to router

### 4. Backend → Redis
- Session management
- WebSocket state
- Caching API responses
- Pub/sub for real-time events

### 5. Frontend → Documentation
- "Help" link in OS
- Opens new tab to `https://docs.blackroad.systems`
- MkDocs site served from GitHub Pages
- Searchable documentation

---

## Deployment Connections

### Development Environment

```
Developer Machine
├── Backend: http://localhost:8000
│   ├── OS: http://localhost:8000/
│   ├── Prism: http://localhost:8000/prism
│   └── API Docs: http://localhost:8000/api/docs
│
├── Docs: http://localhost:8001
│   └── mkdocs serve (port 8001)
│
├── PostgreSQL: localhost:5432 (via Docker)
└── Redis: localhost:6379 (via Docker)
```

### Production Environment

```
User Browser
     ↓
Cloudflare CDN (DNS + SSL)
     ↓
Railway Backend
├── FastAPI (port 8000)
├── PostgreSQL (Railway managed)
└── Redis (Railway managed)

GitHub Pages
└── Docs (codex-docs/ → gh-pages branch)
```

---

## Phase 2 vs Phase 3: Monorepo Evolution

### Phase 2 (Current): Monorepo

**All in `BlackRoad-Operating-System`:**
- ✅ Single source of truth
- ✅ Easy cross-component changes
- ✅ Simple CI/CD

### Phase 3 (Future): Multi-Repo

**When to split:**
- Team size > 10 developers
- Independent release cycles needed
- Different tech stacks emerging

**Potential split:**
```
blackroad-os-core         → Core runtime (Python)
blackroad-os-api          → Backend API (Python/FastAPI)
blackroad-os-web          → Frontend UI (JavaScript)
blackroad-os-prism        → Prism Console (JavaScript/Python)
blackroad-os-operator     → Worker engine (Python)
blackroad-os-docs         → Documentation (Markdown/MkDocs)
```

**Migration strategy:**
- Use `git subtree split` to preserve history
- Set up cross-repo CI coordination
- Implement versioned API contracts
- Maintain unified documentation

---

## Summary: How It All Connects

1. **User** visits `blackroad.systems`
2. **Cloudflare** resolves DNS, terminates SSL, proxies to Railway
3. **Railway** runs FastAPI backend
4. **Backend** serves static OS UI from `backend/static/`
5. **OS** boots in browser, renders Windows 95-style interface
6. **User** opens Prism Console app
7. **OS** loads `/prism` route (static Prism UI)
8. **Prism** makes API calls to `/api/prism/*`
9. **Backend** routes to `routers/prism.py`
10. **Router** calls service layer
11. **Service** queries database via models
12. **Database** returns data
13. **Service** returns to router
14. **Router** returns JSON to Prism
15. **Prism** renders data in UI
16. **User** sees job queue, metrics, events

**For documentation:**
1. **Developer** edits `codex-docs/docs/`
2. **Push** to main branch
3. **GitHub Actions** runs `mkdocs build`
4. **Deploys** to `gh-pages` branch
5. **GitHub Pages** serves at `blackboxprogramming.github.io/...`
6. **Cloudflare** CNAMEs `docs.blackroad.systems` to GitHub Pages
7. **User** visits `https://docs.blackroad.systems`

---

**Where AI meets the open road.** 🛣️

*Complete repository map showing all module connections and data flows.*
