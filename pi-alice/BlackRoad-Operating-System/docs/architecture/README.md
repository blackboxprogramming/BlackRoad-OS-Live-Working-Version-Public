# BlackRoad OS Architecture Overview

BlackRoad OS combines the Pocket OS front-end, a Python backend, and deployment infrastructure across Railway, Cloudflare, and GitHub Actions. This document captures the high-level layout, the next build milestones, and the prompts/processes needed to keep contributors and agents aligned.

## Repository Layout (proposed)

```
/
  backend/             # API, workers, models, tests
  frontend/            # Pocket OS UI
  apps/                # Modular OS applications (planned)
  infra/               # Deployment, DNS, automation configs
    env/               # Environment variable source of truth
  docs/                # Architecture, onboarding, specs
```

Use this as the north-star layout when moving files or adding new components so tooling and contributors can find things quickly.

## Current System

- **Frontend**: Pocket OS UI deployed via Railway static hosting with Cloudflare in front.
- **Backend**: Python service (FastAPI/Flask) deployed on Railway with `/health` available for smoke checks.
- **CI/CD**: GitHub Actions building and deploying to Railway; DNS managed via Cloudflare/GoDaddy.

## Next Three Moves (execution-focused)

1. **Stabilize the foundation**
   - Refine the directory structure above; group backend code into `app/api`, `app/models`, `app/utils`, `app/workers`, and collect tests under `backend/tests`.
   - Centralize environment variables under `infra/env/ENVIRONMENT_MAP.md` and sync to Railway, GitHub Actions, and Cloudflare.
   - Maintain a single architectural source of truth (this file) to reduce context churn for agents.

2. **Turn the OS into an OS**
   - Introduce a pluggable app system under `/apps/<app-name>` with a `manifest.json` and optional `index.js`/`api.js` entrypoints.
   - Persist user state (open windows, layout, theme, installed apps, agent console state) via localStorage initially, with a path to backend storage.
   - Build an **Agent Panel** so Lucidia, Cece, Codex, Silas, etc. appear as processes inside the OS.

3. **Harden deployments**
   - Split CI pipelines so backend and frontend deploy independently; include Cloudflare cache invalidation.
   - Add smoke/health checks (backend `/health`, frontend `/`) gated in the pipeline.
   - Define fallback routing: if Railway is unavailable, serve from GitHub Pages; otherwise serve backend static as a last resort.

## Visual Identity (priority)

Lock in the OS look-and-feel early:
- Neon spectrum palette, window chrome, typography, animation timing, and a short boot sequence.
- Keep these tokens centralized (e.g., a theme module in `frontend/src/systems/theme`).

## Agent Kernel Concept

A lightweight kernel to orchestrate agents inside the OS:
```
/kernel/
  agent_registry.js
  message_bus.js
  process_scheduler.js
```
Agents register with the kernel and render inside the Agent Panel for observability and control.

## Prompt for Scaffolding Agents

When onboarding new AI agents, provide this file plus:
- The environment map (`infra/env/ENVIRONMENT_MAP.md`).
- The current CI/CD pipeline summary.
- The pluggable app spec (once created).

This reduces hallucinations and keeps responses grounded in the actual architecture.
