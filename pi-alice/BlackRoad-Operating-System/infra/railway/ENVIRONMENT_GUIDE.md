# Railway Environment Guide

Railway deployments are driven from the monorepo. Each service declares its own variables here so workflows can validate and operators can provision them consistently.

- See `SERVICE_SETTINGS.md` in this folder for the per-repo Railway build/start/health matrix and optional Dockerfile templates.

## Core API (`services/core-api`)
- `CORE_API_DATABASE_URL`
- `CORE_API_SECRET_KEY`
- `CORE_API_ALLOWED_ORIGINS`
- `CORE_API_HEALTHCHECK_URL` (defaults to deployed `/health` endpoint)

## Public API (`services/public-api`)
- `PUBLIC_API_DATABASE_URL`
- `PUBLIC_API_SECRET_KEY`
- `PUBLIC_API_ALLOWED_ORIGINS`
- `PUBLIC_API_HEALTHCHECK_URL`

## Operator (`services/operator`)
- `OPERATOR_API_URL`
- `OPERATOR_SECRET_KEY`
- `OPERATOR_ALLOWED_ORIGINS`
- `OPERATOR_HEALTHCHECK_URL`

## Prism Console (`apps/prism-console`)
- `PRISM_API_URL`
- `PRISM_CONSOLE_PUBLIC_URL`
- `PRISM_CONSOLE_AUTH_TOKEN`

## Web (`apps/web`)
- `WEB_PUBLIC_URL`
- `WEB_API_URL`
- `WEB_BUILD_ENV`

## Docs (`docs/site`)
- `DOCS_PUBLIC_URL`

## Deployment Notes
- Secrets are injected via `${{ secrets.RAILWAY_TOKEN }}` in GitHub Actions; do not commit credentials.
- Healthchecks should respond on `/health` and `/version` for every deployed service.
- Update this guide when adding a new service so deployment workflows remain aligned.
