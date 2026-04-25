# Fix and Expansion Blueprint for BlackRoad OS

This document provides a concise, repo-wide action plan to stabilize the existing code, raise test coverage, and expand capabilities in a controlled, incremental manner. It prioritizes high-risk areas first and defines clear ownership and exit criteria so workstreams can proceed in parallel without blocking each other.

## Objectives
- Restore baseline stability for backend APIs, static UI delivery, and SDKs.
- Eliminate configuration drift between environments and align `.env` with runtime settings.
- Increase automated test coverage (unit + integration) across backend, agents, and SDKs.
- Consolidate the authoritative UI bundle and publish a verified artifact per release.
- Prepare the platform for feature expansion (integrations, analytics, observability) with guardrails.

## Workstreams

### 1) Environment and Config Hardening
- **Actions:**
  - Run `scripts/railway/validate_env_template.py` against `.env.example` and reconcile with `app.config.Settings`.
  - Enforce fail-fast defaults for non-dev environments (disallow SQLite/localhost unless explicitly enabled).
  - Add CI check to block merges if required env keys are missing.
- **Exit criteria:** CI gate fails when required env vars are absent or misaligned; docs updated to reflect required secrets.

### 2) Backend Stabilization
- **Actions:**
  - Run `./test_all.sh --suite backend --strict`; fix failing tests in routers (auth, identity, payments, integrations).
  - Add contract tests around `/health`, auth flows, and critical integrations with mocks for external providers.
  - Ensure lifespan handlers close Redis/DB cleanly; add regression test for graceful shutdown.
- **Exit criteria:** Backend suite green in strict mode; coverage report published; health and auth routes validated in CI.

### 3) Agent Library Reliability
- **Actions:**
  - Execute `./test_all.sh --suite agents --strict` and address flaky agents or missing fixtures.
  - Document category-level capabilities and mark experimental agents; add smoke tests for registry/executor.
  - Introduce deterministic seeds for any stochastic behaviors to stabilize CI runs.
- **Exit criteria:** Agents suite green; registry smoke test executes deterministically; docs list stable vs experimental agents.

### 4) SDK (Python & TypeScript) Quality Pass
- **Actions:**
  - Run `./test_all.sh --suite sdk-python --strict` and `./test_all.sh --suite sdk-typescript --strict`.
  - Align SDK authentication and error handling with backend responses; add E2E tests against local backend.
  - Publish typed client generation steps so released SDKs mirror API schema.
- **Exit criteria:** Both SDK suites green; generated clients match API schema; publish instructions in `sdk/README`.

### 5) Static UI Consolidation
- **Actions:**
  - Choose `backend/static` as the authoritative bundle; document deprecation path for `blackroad-os/`.
  - Add visual regression snapshots for key views (dashboard, auth, notifications) and wire into CI.
  - Provide a release script that fingerprints assets and uploads a versioned bundle for backend to serve.
- **Exit criteria:** Single source of truth for UI; regression snapshots stored; release script produces versioned artifacts.

### 6) Observability & Ops
- **Actions:**
  - Enable structured logging across backend routers; add tracing hooks where supported.
  - Integrate Sentry (or configured alternative) behind env flag with safe defaults.
  - Document smoke test checklist in `DEPLOYMENT_SMOKE_TEST_GUIDE.md` and ensure it references the consolidated UI.
- **Exit criteria:** Logs/traces emitted with request correlation IDs; optional Sentry integrated; smoke guide updated and used.

### 7) Expansion Pipeline
- **Actions:**
  - Define a feature toggle framework for new integrations (Stripe/Twilio/Discord/Slack) to allow staged rollout.
  - Add analytics hooks for user actions in the UI and relevant backend events, guarded by opt-in env vars.
  - Schedule quarterly dependency audits and supply-chain checks (pip/npm vulnerability scans) in CI.
- **Exit criteria:** Feature flags available; analytics opt-in documented; automated dependency scans included in CI.

## Execution Guidance
- Start with environment validation to unblock all suites, then tackle backend and agents in parallel.
- Keep changes small and merged frequently; avoid large rebases by gating on suite-level CI runs.
- For any integration requiring secrets, rely on mocked providers in CI and document manual smoke steps separately.

## Milestones
1. **Stability Gate (Week 1):** Env validation CI check merged; backend + agents tests audited with failing cases identified.
2. **Consolidation (Week 2-3):** Backend/static UI aligned; SDKs synced to API schema; majority of tests passing in strict mode.
3. **Expansion Ready (Week 4):** Feature flags landed; observability wired; dependency scan jobs active; release process documented.
