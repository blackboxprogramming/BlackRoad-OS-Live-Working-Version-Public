# Components Overview

BlackRoad OS consists of 6 core modules that work together to provide a complete operating system experience.

## 1. Backend API

**Location:** `backend/`
**Technology:** FastAPI, Python
**Purpose:** REST API gateway and business logic

### Key Features
- 30+ API routers for different services
- JWT-based authentication
- PostgreSQL and Redis integration
- WebSocket support
- Async/await throughout

### API Endpoints
- `/health` - Health check
- `/api/system/version` - System version
- `/api/system/config/public` - Public config
- `/api/system/os/state` - OS state (stub)
- `/api/auth/*` - Authentication
- `/api/agents/*` - Agent library
- And 30+ more...

### Running Locally
```bash
cd backend
uvicorn app.main:app --reload
```

[Full Documentation →](modules/backend-api.md)

---

## 2. Core OS Runtime

**Location:** `core_os/`
**Technology:** Python
**Purpose:** OS state management and window control

### Key Features
- User session management
- Window lifecycle (open, close, minimize, maximize)
- Desktop, taskbar, and system tray state
- Backend API adapter

### Models
- `UserSession` - User session tracking
- `Window` - Application windows
- `OSState` - Complete OS state

### Usage
```python
from core_os import get_initial_state, open_window

state = get_initial_state()
state = open_window("notepad", "Untitled - Notepad")
```

[Full Documentation →](modules/core-os.md)

---

## 3. Operator Engine

**Location:** `operator_engine/`
**Technology:** Python
**Purpose:** Job scheduling and workflow orchestration

### Key Features
- In-memory job registry
- Simple interval-based scheduler
- Job lifecycle management
- Optional HTTP API

### Example Jobs
- Health Check Monitor (every 5 minutes)
- Agent Sync (hourly)
- Blockchain Ledger Sync (daily)

### Usage
```python
from operator_engine import Job, Scheduler

job = Job(name="Daily Backup", schedule="0 0 * * *")
scheduler = Scheduler()
await scheduler.execute_job(job.id)
```

[Full Documentation →](modules/operator.md)

---

## 4. Web Client (Pocket OS)

**Location:** `backend/static/`
**Technology:** Vanilla JavaScript, HTML, CSS
**Purpose:** Browser-based desktop interface

### Key Features
- Windows 95-style UI
- Drag-and-drop windows
- Multiple built-in applications
- Core OS API integration
- Zero dependencies

### New in Phase 2
- `core-os-client.js` - Core OS integration
- System version display
- Public config loading
- Event-driven updates

### Usage
```javascript
await window.coreOS.initialize();
const version = await window.coreOS.getVersion();
```

[Full Documentation →](modules/web-client.md)

---

## 5. Prism Console

**Location:** `prism-console/`
**Technology:** HTML, CSS, JavaScript
**Purpose:** Admin dashboard and monitoring

### Key Features
- System metrics dashboard
- Job management interface
- Agent library browser
- Log viewer
- System configuration display

### Tabs
- **Overview** - System status and metrics
- **Jobs** - Scheduled job management
- **Agents** - AI agent control
- **Logs** - Real-time logs
- **System** - Configuration viewer

### Running Locally
```bash
cd prism-console
python -m http.server 8080
```

[Full Documentation →](modules/prism.md)

---

## 6. Documentation (Codex)

**Location:** `codex-docs/`
**Technology:** MkDocs
**Purpose:** Complete system documentation

### Content
- Architecture guides
- Component documentation
- API reference
- Development guides
- Infrastructure setup

### Building Docs
```bash
cd codex-docs
pip install mkdocs mkdocs-material
mkdocs serve
```

---

## Component Integration

### How They Work Together

```
┌─────────────────────────────────────────────────┐
│  User Browser                                   │
│  ├── Pocket OS (Web Client)                     │
│  └── Prism Console (Admin UI)                   │
└──────────────┬──────────────────────────────────┘
               │ HTTP/WebSocket
               ▼
┌─────────────────────────────────────────────────┐
│  Backend API (FastAPI)                          │
│  ├── /api/system/* (System endpoints)           │
│  ├── /api/auth/* (Authentication)               │
│  ├── /api/agents/* (Agent library)              │
│  └── /api/* (30+ other routers)                 │
└──────────────┬──────────────────────────────────┘
               │ Python imports
               ▼
┌─────────────────────────────────────────────────┐
│  Core Modules (Python)                          │
│  ├── Core OS Runtime (state management)         │
│  └── Operator Engine (job scheduling)           │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Data Layer                                     │
│  ├── PostgreSQL (main database)                 │
│  ├── Redis (caching, sessions)                  │
│  └── RoadChain (audit ledger)                   │
└─────────────────────────────────────────────────┘
```

### Request Flow Example

**User opens a window in Pocket OS:**

1. User clicks desktop icon in Web Client
2. JavaScript calls `coreOS.openWindow(appId)`
3. API request to `POST /api/system/windows` (future endpoint)
4. Backend routes to Core OS Runtime
5. Core OS updates state
6. Response returns new window object
7. Web Client renders window in UI

### Data Flow

- **State Management**: Core OS Runtime → Backend API → Web Client
- **Job Execution**: Operator Engine → Backend API → Prism Console
- **Authentication**: Web Client → Backend API → PostgreSQL
- **Caching**: Backend API ↔ Redis

## Development Workflow

1. **Make changes** to any module
2. **Run tests** for that module
3. **Start backend** with `uvicorn`
4. **Test in browser** at `http://localhost:8000`
5. **View Prism** at `http://localhost:8000/prism` (if routed)
6. **Review docs** at `http://localhost:8080` (if serving)

## Testing

Each module has its own test suite:

```bash
# Backend API tests
cd backend
pytest tests/

# Core OS tests
pytest core_os/tests/

# Operator tests
pytest operator_engine/tests/
```

## Next Steps

- [Set up locally](dev/local-setup.md)
- [Explore the API](api/system.md)
- [Read architecture details](architecture.md)
