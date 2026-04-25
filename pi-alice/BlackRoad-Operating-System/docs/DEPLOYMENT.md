# Deployment Orchestration

The `BlackRoad-Operating-System` repository is the control plane for deploying the wider BlackRoad OS services. It contains a single registry of services, simple TypeScript utilities for deploys and health checks, and a GitHub Actions workflow for one-click releases.

## Service registry

Service metadata lives in `infra/services.json`. Each entry includes the repository location, Railway project and service names, and the health endpoint for monitoring.

### Adding a new service

1. Add a new object to `infra/services.json` with the required fields (`id`, `name`, `repo`, `kind`, `railwayProject`, `railwayService`, `domain`, `healthPath`).
2. Ensure the Railway project and service names match the target deployment.
3. Include the service `id` in the deploy order inside `scripts/deployAll.ts` if it should participate in the sequential rollout.

## Local commands

Install dependencies once with `npm install`, then use:

- `npm run deploy:all` — deploys all services sequentially via Railway.
- `npm run deploy:service -- <serviceId>` — deploys a single service from the registry.
- `npm run health:all` — checks the health endpoints for every registered service.

## GitHub Actions

Use the **Deploy All** workflow in the Actions tab (`.github/workflows/deploy-all.yml`).

- Trigger manually with **Run workflow** to deploy every service.
- Provide the optional `serviceId` input to deploy just one service using `deploy:service`.
- Deployments expect `RAILWAY_TOKEN` to be available as a GitHub Actions secret and run with `NODE_ENV=production`.
# BlackRoad OS Deployment

This repo is the *orchestrator* for all BlackRoad OS services.

## Commands

- `npm run deploy:all`  
  Deploys all services (core, api, operator, agents, console, web, docs) via Railway.

- `npm run deploy:service -- core`  
  Deploy only a single service by `id`.

- `npm run health:all`  
  Check health endpoints for all services using their public domains.

## Service Registry

All services are defined in `infra/services.json`.

To add or change a service:

1. Edit `infra/services.json` and update:
   - `id`
   - `railwayProject`
   - `railwayService`
   - `domain`
   - `healthPath`
2. Make sure the Railway project/service names match.
3. Commit and push your changes.

## GitHub Actions

The workflow `.github/workflows/deploy-all.yml` lets you:

- Trigger **Deploy BlackRoad OS** from the Actions tab.
- Optionally pass `serviceId` to deploy just one service.
