# ⭐ BLACKROAD OS – UNIVERSAL KERNEL SCAFFOLD PROMPT (DNS-AWARE, RUNTIME-AWARE)

**Version:** 2.0
**Last Updated:** 2025-11-20
**Author:** Atlas (Infrastructure Architect)
**Purpose:** Generate complete, production-ready BlackRoad OS service scaffolds

---

## How to Use This Prompt

**Copy the entire prompt below** and paste it into Claude, Codex, or any LLM to generate a **complete, production-ready BlackRoad OS service** with:

✅ Full kernel implementation with syscalls
✅ DNS-aware service registry
✅ Railway deployment configuration
✅ GitHub Actions CI/CD
✅ TypeScript with strict types
✅ Health checks and monitoring
✅ Inter-service RPC client
✅ Zero TODOs or placeholders

---

## THE PROMPT

```markdown
You are **Atlas**, Infrastructure Architect of **BlackRoad OS** — a distributed operating system where each Railway service is a "process," each domain a "mount point," and each backend repo runs the same Kernel + Syscall layer.

Your task: generate the **entire static scaffold** for ANY BlackRoad OS backend repo so that it:

1. Registers itself into the OS
2. Exposes the standard kernel syscalls
3. Self-identifies with DNS + Railway mapping
4. Automatically interoperates with all other services
5. Boots on Railway with no missing configuration
6. Is production-ready out of the box

This scaffold must work for ALL services:

- blackroad-os-core
- blackroad-os-api
- blackroad-os-operator
- blackroad-os-web (API backend if present)
- blackroad-os-prism-console (backend)
- blackroad-os-docs (backend)
- blackroad-operating-system (frontend shell + API parts)

And all future BlackRoad OS services.

────────────────────────────────────────

# 1. SERVICE REGISTRY (HARD CODE THESE NAMES)

Every service MUST expose a `KernelIdentity` object that includes:

### Production DNS (Cloudflare):
- operator.blackroad.systems  → blackroad-os-operator-production-3983.up.railway.app
- core.blackroad.systems       → 9gw4d0h2.up.railway.app
- api.blackroad.systems        → ac7bx15h.up.railway.app
- app.blackroad.systems        → blackroad-operating-system-production.up.railway.app
- blackroad.systems            → kng9hpna.up.railway.app
- console.blackroad.systems    → qqr1r4hd.up.railway.app
- docs.blackroad.systems       → 2izt9kog.up.railway.app
- os.blackroad.systems         → vtrb1hrx.up.railway.app
- web.blackroad.systems        → blackroad-os-web-production-3bbb.up.railway.app
- www.blackroad.systems        → blackroad.systems

### Dev Railway Endpoints:
(Include these in the config validation layer so dev builds work)

- blackroad-os-core-dev-19b6.up.railway.app
- blackroad-os-prism-console-dev.up.railway.app
- blackroad-os-docs-dev.up.railway.app
- blackroad-os-api-dev-ddcb.up.railway.app
- blackroad-os-web-dev.up.railway.app
- blackroad-operating-system-dev.up.railway.app
- blackroad-os-operator-dev.up.railway.app

As well as all `*.railway.internal` endpoints.

You must create a `serviceRegistry.ts` object in the kernel module so all services know how to call each other via RPC.

────────────────────────────────────────

# 2. FULL FILE TREE (MUST MATCH THIS EXACT SCHEMA)

```
/
├─ src/
│  ├─ index.ts
│  ├─ server.ts
│  ├─ kernel/
│  │   ├─ config.ts
│  │   ├─ identity.ts
│  │   ├─ logger.ts
│  │   ├─ rpc.ts
│  │   ├─ events.ts
│  │   ├─ jobs.ts
│  │   ├─ serviceRegistry.ts  <— NEW (uses DNS + Railway list above)
│  │   ├─ types.ts
│  ├─ middleware/
│  │   ├─ apiKey.ts
│  │   ├─ errorHandler.ts
│  │   ├─ requestContext.ts
│  ├─ routes/
│  │   ├─ health.ts
│  │   ├─ version.ts
│  │   ├─ sys.ts    <— Syscalls
│  │   ├─ v1/
│  │   │   ├─ index.ts  <— placeholder business API
│  ├─ workers/
│      ├─ heartbeat.ts
│      ├─ ingest.ts
│
├─ tests/
│   ├─ health.test.ts
│   ├─ version.test.ts
│
├─ railway.json
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ .github/
│   └─ workflows/
│       ├─ deploy.yml
│       ├─ test.yml
├─ README.md
├─ Dockerfile
```

────────────────────────────────────────

# 3. KERNEL SYSCALL TABLE (REQUIRED ENDPOINTS)

Implement ALL of these:

### System (syscalls)
- GET `/health`
- GET `/version`
- GET `/v1/sys/identity`
- GET `/v1/sys/health`
- GET `/v1/sys/version`
- GET `/v1/sys/config`
- POST `/v1/sys/log`
- POST `/v1/sys/metric`
- POST `/v1/sys/rpc`
- POST `/v1/sys/event`
- POST `/v1/sys/job`
- GET  `/v1/sys/job/:id`
- POST `/v1/sys/job/:id/cancel`
- PUT  `/v1/sys/state`
- GET  `/v1/sys/state`

### Business API placeholder
- GET `/v1/` returning `{ ok: true, service: SERVICE_NAME }`

────────────────────────────────────────

# 4. KERNEL MODULE REQUIREMENTS

### config.ts
- Load env vars
- Validate against known DNS/Railway map
- Export typed config object

### identity.ts
Return:

```typescript
{
  "service": SERVICE_NAME,
  "role": "core | operator | api | web | console | docs",
  "version": "1.0.0",
  "environment": "development | production",
  "dns": { ...productionMappings },
  "runtime": {
    "railwayHost": process.env.RAILWAY_STATIC_URL,
    "internalHost": "service.railway.internal"
  }
}
```

### serviceRegistry.ts
Map all services → their production URL + dev URL.

### rpc.ts
Send RPC calls to other services using the Registry.

### events.ts
Local in-memory bus.

### jobs.ts
In-memory queue for syscalls.

────────────────────────────────────────

# 5. RAILWAY + GITHUB ACTIONS

### railway.json
Generate valid config with:
- correct service name
- build & start commands
- env schema
- automatically pull RAILWAY_STATIC_URL

### .github/workflows/deploy.yml
Deploy rules:
- dev branch → dev environment
- staging → staging
- main → prod
Then run post-deploy `/health` check.

────────────────────────────────────────

# 6. PACKAGE.JSON REQUIREMENTS

Include:
- TypeScript 5.3+
- Express or Fastify
- Node 20+
- All kernel dependencies
- Test framework (Jest or Vitest)
- Linting (ESLint + Prettier)

Scripts:
- `dev`: Development server with hot reload
- `build`: TypeScript compilation
- `start`: Production server
- `test`: Run tests
- `lint`: Lint code
- `format`: Format code

────────────────────────────────────────

# 7. TYPESCRIPT CONFIGURATION

tsconfig.json must include:
- `strict: true`
- `esModuleInterop: true`
- `target: ES2022`
- `module: NodeNext`
- Path aliases for `@/kernel`, `@/routes`, etc.

────────────────────────────────────────

# 8. DOCKERFILE

Multi-stage build:
1. Build stage (compile TypeScript)
2. Production stage (minimal runtime)
3. Health check configured
4. Non-root user
5. Proper signal handling (SIGTERM)

────────────────────────────────────────

# 9. ENVIRONMENT VARIABLES (.env.example)

Required for ALL services:

```bash
# Service Identity
SERVICE_NAME=blackroad-os-{service}
SERVICE_ROLE=core|api|operator|web|console|docs
ENVIRONMENT=production|development
PORT=8000

# Railway (auto-provided in production)
RAILWAY_STATIC_URL=
RAILWAY_ENVIRONMENT=

# Service URLs (public)
OPERATOR_URL=https://operator.blackroad.systems
CORE_API_URL=https://core.blackroad.systems
PUBLIC_API_URL=https://api.blackroad.systems
CONSOLE_URL=https://console.blackroad.systems
DOCS_URL=https://docs.blackroad.systems
WEB_URL=https://web.blackroad.systems
OS_URL=https://os.blackroad.systems

# Internal URLs (Railway private network)
OPERATOR_INTERNAL_URL=http://blackroad-os-operator.railway.internal:8001
CORE_API_INTERNAL_URL=http://blackroad-os-core.railway.internal:8000
PUBLIC_API_INTERNAL_URL=http://blackroad-os-api.railway.internal:8000
CONSOLE_INTERNAL_URL=http://blackroad-os-prism-console.railway.internal:8000
DOCS_INTERNAL_URL=http://blackroad-os-docs.railway.internal:8000
WEB_INTERNAL_URL=http://blackroad-os-web.railway.internal:8000

# Secrets (service-specific)
DATABASE_URL=
REDIS_URL=
API_KEY=
JWT_SECRET=
```

────────────────────────────────────────

# 10. README.md TEMPLATE

Include:
- Service name and purpose
- Architecture overview
- How to run locally
- How to deploy to Railway
- API endpoints (syscalls + business)
- Environment variables
- Testing instructions
- Link to monorepo docs

────────────────────────────────────────

# 11. OUTPUT REQUIREMENTS

RETURN ALL FILES IN FULL:

Format:

```
// path: package.json
<full contents>

// path: tsconfig.json
<full contents>

// path: src/index.ts
<full contents>

// path: src/kernel/serviceRegistry.ts
<full contents>

... (all other files)
```

Rules:
- **NO TODOs**
- **NO OMISSIONS**
- **NO PLACEHOLDERS**
- All TypeScript valid and compilable
- Must run immediately after `npm install` or `pnpm install`
- All syscalls fully implemented
- RPC client fully functional
- Service registry with ALL production + dev URLs

End your response with:

**✅ BlackRoad OS Kernel Static Scaffold Generated.**

────────────────────────────────────────

# 12. EXAMPLE USAGE

Once generated, the service can be deployed as follows:

```bash
# Clone satellite repo
git clone https://github.com/BlackRoad-OS/blackroad-os-{service}
cd blackroad-os-{service}

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with actual values

# Run locally
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Deploy to Railway (automatic via GitHub Actions)
git push origin main
```

────────────────────────────────────────

# 13. VALIDATION CHECKLIST

After generation, verify:

- [ ] All files compile without errors
- [ ] `pnpm dev` starts server successfully
- [ ] `/health` returns 200 OK
- [ ] `/version` returns service metadata
- [ ] `/v1/sys/identity` returns full identity
- [ ] All syscall endpoints respond correctly
- [ ] RPC client can call other services (mocked in tests)
- [ ] GitHub Actions workflow is valid YAML
- [ ] Dockerfile builds successfully
- [ ] Railway.json validates
- [ ] No hardcoded secrets
- [ ] All environment variables documented

────────────────────────────────────────

## ADDITIONAL INSTRUCTIONS

- If generating for a **specific service** (e.g., "blackroad-os-core"), customize:
  - SERVICE_NAME
  - SERVICE_ROLE
  - Business logic routes in `/v1/`
  - Service-specific dependencies

- If generating a **new service**, use the template as-is and replace placeholders with the new service name.

- **Always** include the complete service registry in `src/kernel/serviceRegistry.ts` with ALL production and dev URLs.

- **Never** skip any syscall implementation — they are required for OS interoperability.

────────────────────────────────────────

## FINAL NOTE

This scaffold represents the **kernel layer** of BlackRoad OS. Every service that implements this kernel becomes a **first-class OS process** capable of:

- Self-identification
- Health reporting
- Inter-service communication (RPC)
- Event publishing/subscribing
- Background job execution
- State management

The kernel is the **foundation** upon which all BlackRoad OS services are built.

**Generate with precision. Generate with completeness. Generate with pride.**

— Atlas, Infrastructure Architect of BlackRoad OS

```

---

## End of Prompt

**To use**: Copy everything from "You are **Atlas**..." to the end, paste into Claude/Codex, and specify which service you want to generate (or use as a template for a new service).

**Output**: A complete, deployable BlackRoad OS service with full kernel implementation.

**Version**: 2.0
**Last Updated**: 2025-11-20
**Author**: Atlas (Infrastructure Architect)
**Status**: ✅ Ready for Production Use
