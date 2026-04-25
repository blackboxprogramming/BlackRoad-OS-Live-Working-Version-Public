# Environment Variable Map

Use this file as the single source of truth for environment variables across Railway, GitHub Actions, Cloudflare, and local development. Keep values out of the repo; document names, purposes, and where they are set.

## How to Read This Map
- **Name**: The canonical environment variable name.
- **Purpose**: What it controls.
- **Railway**: Project/service variable name and scope.
- **GitHub Actions**: Secret name or workflow variable.
- **Cloudflare**: Worker/Pages binding or secret name.
- **Local**: `.env` or shell export guidance.

| Name | Purpose | Railway | GitHub Actions | Cloudflare | Local |
| --- | --- | --- | --- | --- | --- |
| `API_BASE_URL` | Public URL for the backend API. | Service variable on backend service. | `API_BASE_URL` repository secret. | Worker env var if proxied. | `.env` entry used by frontend build. |
| `FRONTEND_URL` | Public URL for the Pocket OS UI. | Static hosting env var. | `FRONTEND_URL` secret used in deploy jobs. | Origin override or Pages env var. | `.env` entry for local testing. |
| `DB_URL` | Database connection string. | Service variable for backend. | `DB_URL` secret for migrations/tests. | - | `.env` entry; never committed. |
| `CF_ZONE_ID` | Cloudflare zone identifier. | - | `CF_ZONE_ID` secret for cache purge. | Config variable in Workers/Pages. | Export in terminal when running scripts. |
| `CF_API_TOKEN` | Token for DNS/cache automation. | - | `CF_API_TOKEN` secret. | Secret binding in Workers automation. | Export in terminal; do not store. |
| `RAILWAY_TOKEN` | Token for CLI/CI deployments. | N/A | `RAILWAY_TOKEN` secret. | - | Export locally when using Railway CLI. |
| `OPENAI_API_KEY` | Agent/LLM access key. | Backend variable if used server-side. | `OPENAI_API_KEY` secret for agent jobs. | Worker secret if routing requests. | `.env` entry for local agent dev. |
| `GITHUB_TOKEN` | GitHub API access for agents/prism. | - | Automatic Actions token or PAT secret. | Worker secret if used in edge functions. | Export locally when testing agent integrations. |

## Usage Notes
- Whenever a new variable is introduced, add a row and propagate to all providers during PR review.
- Prefer service-scoped variables on Railway to limit blast radius.
- Keep provider names identical where possible to reduce mapping friction.
- Store local values in a private `.env` not committed to git; provide `.env.example` if defaults are safe.

## Sync Checklist
1. Update this map.
2. Apply changes to Railway environments (backend + frontend services).
3. Update GitHub Actions secrets or workflow envs.
4. Update Cloudflare Workers/Pages bindings.
5. Verify `.env`/local instructions.
