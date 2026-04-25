# Service Analysis: blackroad-api (PLANNED)

**Status**: 📋 PLANNED (Phase 2)
**Target Date**: Q2 2026
**Service Type**: Public API Gateway
**Repository**: `blackboxprogramming/blackroad-api` (to be created)

---

## Overview

Standalone public API gateway to be extracted from the monolith in Phase 2. Will serve versioned API endpoints with enhanced security, rate limiting, and developer experience.

---

## Extraction Plan

### Source
- **Current Location**: `backend/app/routers/` in monolith
- **Target Repo**: New `blackroad-api` repository
- **Migration Method**: `git subtree split`

### Timeline
1. **Month 1-2**: Plan API contract versioning
2. **Month 3-4**: Extract routers, create new repo
3. **Month 5**: Deploy to Railway (parallel with monolith)
4. **Month 6**: DNS cutover, deprecate monolith API

---

## Architecture

### Technology Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104.1
- **Features**:
  - Versioned endpoints (`/v1/`, `/v2/`)
  - Enhanced rate limiting
  - API key management
  - Developer portal

### Endpoints (Planned)
- `/v1/health` - Health check
- `/v1/version` - API version
- `/v1/auth/*` - Authentication
- `/v1/blockchain/*` - RoadChain access
- `/v1/agents/*` - Agent orchestration
- `/v1/data/*` - Data access APIs

---

## Configuration

### Environment Variables
```bash
CORE_API_URL=https://core-internal.blackroad.systems
AGENTS_API_URL=https://agents-internal.blackroad.systems
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
API_KEYS_ENCRYPTION_KEY=<generate>
RATE_LIMIT_PER_MINUTE=60
```

### Domains
- **Production**: `api.blackroad.systems`
- **Staging**: `staging.api.blackroad.systems`
- **Dev**: `dev.api.blackroad.systems`

---

## Dependencies
- Internal core API (monolith)
- Internal agents API
- PostgreSQL (shared or dedicated)
- Redis (shared or dedicated)

---

## Risks & Mitigation
- **Risk**: Breaking changes for existing clients
  - **Mitigation**: Version API endpoints, maintain v1 compatibility
- **Risk**: Performance degradation with extra hop
  - **Mitigation**: Implement intelligent caching, optimize internal calls

---

*Analysis Date: 2025-11-19*
*Status: Planning Phase*
