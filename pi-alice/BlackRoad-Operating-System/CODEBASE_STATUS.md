# BlackRoad OS Repository Snapshot

## 1. Repo Structure Summary
- `backend/`: FastAPI backend with routing, models, and the canonical `backend/static` UI bundle served by the API layer.
- `backend/static/`: Windows 95-inspired single-page interface served by FastAPI (`/` and `/static`).
- `blackroad-os/`: Older standalone static build (HTML/JS/assets) that appears superseded by `backend/static` but still present in the repo.
- `agents/`: Python agent library with base abstractions, categories, templates, and tests.
- `sdk/`: Language-specific SDKs (Python/TypeScript) for integrating with the platform.
- `docs/`, `scripts/`, `CI` assets (`.github/workflows`), and root-level guidance/vision documents provide deployment, security, and integration references.

## 2. Backend Analysis
- Framework: FastAPI with CORS middleware, mounted static files, and `/health` endpoint; routes imported from many service modules (auth, email, social, video, files, blockchain, AI chat, integrations, v0.2 capture/identity/notifications/creator/compliance/search).
- Lifespan creates DB tables via SQLAlchemy async engine and rotates wallet keys on startup; shutdown closes Redis and disposes DB connections.
- Settings default to SQLite for local/dev while `.env` template targets PostgreSQL/Redis; ALLOWED_ORIGINS, JWT secrets, and cloud keys are environment-driven.
- ENV vars referenced include database URLs, Redis URL, SECRET_KEY/JWT settings, wallet master key, OpenAI key, S3 credentials, SMTP settings, blockchain tuning, Stripe keys, Twilio/Slack/Discord/Sentry tokens, Railway config, and more (see `.env.example`).
- Health check: `/health` returns JSON with status/timestamp; OpenAPI docs served under `/api/docs`.

## 3. Frontend Analysis
- Primary SPA lives in `backend/static/index.html` with inline assets, delivered directly by FastAPI root route for API co-location.
- Additional legacy UI in `blackroad-os/index.html` with supporting JS/assets suggests duplication/possible drift from canonical static bundle.
- No build tooling; vanilla HTML/CSS/JS per root README instructions.

## 4. Auth & Identity
- Backend includes `auth` router providing JWT-based auth with access/refresh expiry settings; relies on SECRET_KEY/ALGORITHM env vars.
- New identity-centric routes included via `identity_center` router (v0.2 APIs) though implementation status should be validated per-router.

## 5. Stripe & Payments
- Stripe router is included in `app.main`; `.env.example` declares `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`, but actual wiring/state of routes should be confirmed in stripe module before production use.

## 6. Agent / AI Logic
- Agent library lives in `agents/` with base agent/executor/registry, 10 category folders, templates, and tests; advertised as 200+ agents.
- AI chat router loaded in FastAPI alongside OpenAI API key in settings, but external provider configuration depends on env vars.

## 7. DevOps / CI-CD
- GitHub Actions workflows present for CI (`ci.yml`), backend tests, deploy, Railway automation/deploy.
- Dockerfile and docker-compose in `backend/`; Railway configs (`railway.toml`/`railway.json`) at repo root.
- Tests exist under `backend/tests/` covering auth, blockchain, miner, integrations, dashboard, VS Code router; test results not run in this snapshot.

## 8. Critical Risks
- Missing or incorrect env vars (DB/Redis/SECRET_KEY/Stripe/OpenAI/etc.) will break startup or integrations.
- Legacy `blackroad-os` static bundle could diverge from `backend/static`, leading to inconsistent deployments if wrong entry point is published.
- SQLite defaults in `app.config.Settings` may hide Postgres/Redis issues until production; migrations/alembic configs exist but runtime auto-creates tables at startup, risking schema drift.
- External integration routers (Stripe/Twilio/Slack/Discord/etc.) may be stubbed or unconfigured; deployment without keys will fail requests.
- CI presence suggests expectations for tests; failing/long-running suites could block PRs if dependencies not installed.

## 9. Low-Hanging Fruit
- Validate `.env` contents against `app.config.Settings` using `scripts/railway/validate_env_template.py` before deployment to ensure secrets alignment.
- Consolidate on `backend/static` as the authoritative UI and document deprecation of `blackroad-os` to reduce confusion.
- Add explicit status documentation per router (implemented vs stub) to set expectations for integrations like Stripe/Twilio.
- Switch default settings to rely on env vars (or fail-fast) in non-dev environments to avoid accidental SQLite/localhost usage.
- Run and document backend test results in CI badges to highlight current health.

## 10. Recommended Branch Strategy
- Use `main` for stable releases tied to Railway deploys; require CI pass and env validation before merge.
- Maintain `develop` (or feature branches) for active work on routers/agents/UI; protect with PR checks and targeted reviewers per area (backend vs agents vs static UI).
- When touching integrations, gate merges behind mocked tests plus manual smoke checks against a staging environment with representative secrets.

