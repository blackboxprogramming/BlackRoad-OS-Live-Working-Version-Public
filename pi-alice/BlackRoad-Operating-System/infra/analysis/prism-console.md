# Service Analysis: prism-console (PLANNED)

**Status**: 📋 PLANNED (Phase 2)
**Target Date**: Q1 2026
**Service Type**: Admin Console UI
**Repository**: `blackboxprogramming/blackroad-prism-console` (to be created)

---

## Overview

Standalone admin console for job queue monitoring, system observability, and operator dashboards. Currently exists as static files in `prism-console/` directory.

---

## Current State

### Location
- **Source**: `prism-console/` in monolith
- **Status**: Built but not integrated
- **Access**: Should be served at `/prism` by backend

### Features (Implemented)
- Job queue dashboard
- System metrics display
- Event log viewer
- Multi-tab navigation
- Dark theme UI

---

## Phase 2 Plan

### Extraction Strategy
1. **Immediate (Phase 1.5)**:
   - Integrate into backend: `app.mount("/prism", StaticFiles(...))`
   - Deploy and test

2. **Phase 2**:
   - Extract to separate repo
   - Build as React/Next.js app (or keep Vanilla JS)
   - Deploy to Railway/Vercel

### Technology Options

**Option A: Keep Vanilla JS**
- Pros: Zero dependencies, fast load
- Cons: Limited scalability for complex features

**Option B: React 18+**
- Pros: Component reusability, rich ecosystem
- Cons: Build complexity, larger bundle

**Option C: Next.js 14+**
- Pros: SSR, routing, optimizations
- Cons: More infrastructure needed

---

## Configuration

### Environment Variables
```bash
REACT_APP_API_URL=https://blackroad.systems/api
REACT_APP_CORE_API_URL=https://api.blackroad.systems
REACT_APP_AGENTS_API_URL=https://agents.blackroad.systems
```

### Domains
- **Production**: `prism.blackroad.systems`
- **Staging**: `staging.prism.blackroad.systems`

---

## API Integration

### Required Endpoints
- `GET /api/prism/jobs` - Job queue
- `GET /api/prism/events` - Event stream
- `GET /api/system/version` - Version info
- `GET /api/health/summary` - Health status
- `WebSocket /api/prism/stream` - Real-time updates

---

*Analysis Date: 2025-11-19*
*Status: Planning Phase*
