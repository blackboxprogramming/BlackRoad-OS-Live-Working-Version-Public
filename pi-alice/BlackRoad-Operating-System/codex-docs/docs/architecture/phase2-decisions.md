# Phase 2.5 Architectural Decisions

**Date**: 2025-11-18
**Version**: 2.5
**Status**: Implemented

This document codifies the key architectural decisions made in BlackRoad OS Phase 2.5.

---

## Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Repository Strategy** | Monorepo | Single source of truth for Phase 1-2 |
| **Prism Console Serving** | Backend at `/prism` | Integrated deployment, shared auth |
| **Documentation Hosting** | GitHub Pages | Free, reliable, custom domain support |
| **Frontend Technology** | Vanilla JavaScript | Zero dependencies, no build process |

---

## Decision 1: Monorepo Strategy

### Context

BlackRoad OS consists of multiple components:

- Core OS runtime
- Backend API
- Frontend UI
- Prism Console
- Agent library
- Documentation
- Infrastructure configuration

### Options Considered

**Option A: Monorepo** (✅ Selected)

- **Pros**:
  - Single source of truth
  - Easier cross-component changes
  - Simpler CI/CD pipeline
  - Atomic commits across components
  - Faster iteration for small teams

- **Cons**:
  - Large repository size
  - All contributors need full repo access
  - Harder to scale to large teams

**Option B: Multi-Repo**

- **Pros**:
  - Clear component boundaries
  - Independent release cycles
  - Granular access control
  - Easier to scale teams

- **Cons**:
  - Coordination overhead
  - Cross-repo changes require multiple PRs
  - Complex CI/CD setup
  - Risk of version drift

### Decision

**Chose: Monorepo for Phase 1-2**

**When to reconsider:**

- Team size > 10 developers
- Independent release cycles needed
- Different tech stacks emerging
- Clear ownership boundaries established

**Migration path** (Phase 3):

```
BlackRoad-Operating-System (monorepo)
  ↓ git subtree split
├── blackroad-os-core
├── blackroad-os-api
├── blackroad-os-web
├── blackroad-os-prism
├── blackroad-os-operator
└── blackroad-os-docs
```

### Implementation

- Repository: `blackboxprogramming/BlackRoad-Operating-System`
- All components in single repo
- Shared CI/CD workflows
- Unified versioning

---

## Decision 2: Prism Console Serving

### Context

Prism Console is the administrative interface for BlackRoad OS. It needs to be:

- Accessible to authenticated users
- Integrated with backend API
- Properly routed and cached

### Options Considered

**Option A: Serve from Backend at `/prism`** (✅ Selected)

- **Pros**:
  - Single deployment unit
  - Shared authentication
  - No CORS issues
  - Easier routing

- **Cons**:
  - Backend serves static files
  - Couples frontend and backend

**Option B: Separate Static Hosting**

- **Pros**:
  - Decoupled deployments
  - CDN optimization
  - Independent scaling

- **Cons**:
  - CORS complexity
  - Multiple deployments
  - Auth token sharing

**Option C: Subdomain with Separate Deployment**

- **Pros**:
  - Clean separation
  - Independent deployment
  - Scalable

- **Cons**:
  - Additional infrastructure
  - DNS configuration
  - CORS setup

### Decision

**Chose: Serve from Backend at `/prism`**

**Rationale:**

1. **Simplicity**: Single deployment reduces operational complexity
2. **Authentication**: Shares auth context with main OS
3. **Routing**: Clean URL structure (`/prism`)
4. **Caching**: Cloudflare caches static assets anyway
5. **Phase 1 appropriate**: Good enough for early-stage product

**Future evolution** (Phase 3):

- Move to subdomain (`prism.blackroad.systems`)
- Separate deployment for independent scaling
- Dedicated CDN optimization

### Implementation

- Route: `GET /prism` → `backend/app/routers/prism_static.py`
- Static files: `backend/static/prism/`
- URL: `https://blackroad.systems/prism`

---

## Decision 3: Documentation Hosting

### Context

Technical documentation needs to be:

- Easy to write (Markdown)
- Easy to deploy (automated)
- Searchable
- Custom domain support
- Low/no cost

### Options Considered

**Option A: GitHub Pages with MkDocs** (✅ Selected)

- **Pros**:
  - Free hosting
  - Custom domain support
  - Automated deployment (GitHub Actions)
  - MkDocs Material theme (beautiful)
  - Search built-in

- **Cons**:
  - Static site only (no server-side logic)
  - Limited to public repos (or Enterprise)

**Option B: ReadTheDocs**

- **Pros**:
  - Purpose-built for docs
  - Versioning support
  - Free for open source

- **Cons**:
  - Less control
  - Custom domain on paid plans
  - Branding

**Option C: Serve from Backend**

- **Pros**:
  - Full control
  - Server-side features

- **Cons**:
  - Backend complexity
  - Deployment coupling
  - No built-in search

### Decision

**Chose: GitHub Pages with MkDocs Material**

**Rationale:**

1. **Cost**: Free for public repos
2. **Workflow**: GitHub Actions automation
3. **Quality**: Material theme is production-grade
4. **Search**: Built-in search with minisearch
5. **Custom domain**: `docs.blackroad.systems` support

### Implementation

- Source: `codex-docs/` directory
- Builder: MkDocs + Material theme
- Deployment: `.github/workflows/docs-deploy.yml`
- Branch: `gh-pages` (auto-created)
- URL: `https://docs.blackroad.systems`

---

## Decision 4: Frontend Technology

### Context

Frontend needs to be:

- Fast to load
- Easy to maintain
- No build complexity
- Accessible (WCAG 2.1)

### Options Considered

**Option A: Vanilla JavaScript** (✅ Selected)

- **Pros**:
  - Zero dependencies
  - No build process
  - Fast load times (~200KB)
  - Easy to understand
  - No framework lock-in

- **Cons**:
  - More verbose
  - Manual DOM manipulation
  - No TypeScript (unless added)

**Option B: React**

- **Pros**:
  - Rich ecosystem
  - Component model
  - TypeScript support

- **Cons**:
  - Build process required
  - Bundle size (~300KB+ with React + deps)
  - Learning curve
  - Overkill for Phase 1

**Option C: Vue or Svelte**

- **Pros**:
  - Smaller than React
  - Easier learning curve
  - Good developer experience

- **Cons**:
  - Still requires build
  - Framework dependency
  - Not needed for current scope

### Decision

**Chose: Vanilla JavaScript (ES6+)**

**Rationale:**

1. **Philosophy**: Aligns with "Zero-Dependency" principle
2. **Performance**: Fastest load times
3. **Simplicity**: No build process to maintain
4. **Maintainability**: Plain JavaScript is timeless
5. **Nostalgia**: Fits Windows 95 theme

**When to reconsider:**

- App complexity exceeds ~10,000 LOC
- Team prefers framework
- TypeScript becomes critical

**Evolution path**:

- Add TypeScript (via Vite, no bundling)
- Migrate to Lit (web components, minimal overhead)
- Or stick with vanilla (perfectly fine!)

### Implementation

- Location: `backend/static/`
- Structure:
  - `js/os.js` - Core OS runtime
  - `js/components.js` - UI library
  - `js/apps/*.js` - Applications
- Patterns:
  - Event-driven architecture
  - Factory pattern for components
  - Module pattern for encapsulation

---

## Cross-Cutting Concerns

### Deployment Flow

```
Developer pushes to main
  ↓
GitHub Actions CI
  ↓
Tests pass ✓
  ↓
├── Backend → Railway
│   ├── Build Docker image
│   ├── Deploy to production
│   └── Serve OS at / and Prism at /prism
│
└── Docs → GitHub Pages
    ├── Build MkDocs
    └── Deploy to gh-pages branch
```

### URL Structure

| Path | Serves | Source |
|------|--------|--------|
| `https://blackroad.systems` | Main OS | `backend/static/index.html` |
| `https://blackroad.systems/prism` | Prism Console | `backend/static/prism/index.html` |
| `https://blackroad.systems/api/docs` | API Documentation | FastAPI OpenAPI |
| `https://docs.blackroad.systems` | Technical Docs | GitHub Pages (codex-docs/) |

### DNS Configuration

| Record | Target | Purpose |
|--------|--------|---------|
| `blackroad.systems` → | Railway backend | Main OS + API |
| `docs.blackroad.systems` → | GitHub Pages | Documentation |
| `www.blackroad.systems` → | `blackroad.systems` | Redirect |

---

## Future Decisions (Phase 3+)

### Likely Changes

1. **Multi-Repo Split**
   - When: Team > 10 people
   - How: Git subtree split
   - Why: Independent releases

2. **Microservices**
   - When: Scaling bottlenecks
   - Services: API gateway, Prism worker, Lucidia engine
   - Why: Independent scaling

3. **Frontend Framework**
   - When: App > 10,000 LOC or team preference
   - Options: Lit (web components), Vue (lightweight), or stick with vanilla
   - Why: Developer experience

### Unlikely Changes

1. **Documentation Hosting**
   - GitHub Pages + MkDocs works well
   - No reason to change

2. **Backend Framework**
   - FastAPI is excellent
   - Python async ecosystem mature
   - No reason to change

---

## Decision Log

| Date | Decision | Status |
|------|----------|--------|
| 2025-11-18 | Monorepo for Phase 1-2 | ✅ Implemented |
| 2025-11-18 | Prism at `/prism` route | ✅ Implemented |
| 2025-11-18 | Docs via GitHub Pages | ✅ Implemented |
| 2025-11-18 | Vanilla JS frontend | ✅ Confirmed |

---

## References

- [MASTER_ORCHESTRATION_PLAN.md](../../MASTER_ORCHESTRATION_PLAN.md) - Complete infrastructure blueprint
- [PHASE2_5_SUMMARY_FOR_ALEXA.md](../../PHASE2_5_SUMMARY_FOR_ALEXA.md) - Phase 2.5 summary
- [BLACKROAD_OS_REPO_MAP.md](../../BLACKROAD_OS_REPO_MAP.md) - Repository structure
- [DEPLOYMENT_NOTES.md](../../DEPLOYMENT_NOTES.md) - Deployment guide

---

**Where AI meets the open road.** 🛣️

*Architectural decisions for BlackRoad OS Phase 2.5*
