# CarPool

- Canonical host: `carpool.blackroad.io`
- Owning org: `BlackRoad-Infrastructure`
- Support orgs: `BlackRoad-AI, BlackRoad-Cloud`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `pool.blackroad.io`
- Support subdomains: `api.carpool.blackroad.io, status.carpool.blackroad.io`

## Local start
```bash
cd services/carpool
cp .env.example .env
npm install
npm run dev
```

## Required endpoints
- `GET /api/health`
- `GET /api/ready`
- `GET /api/version`

## Generated route intent
- `/`: primary runtime surface
- `/settings`: runtime settings surface
- `/help`: product help and guidance
- `/status`: status landing or pointer
- `/api/health`: liveness check
- `/api/ready`: readiness check
- `/api/version`: service metadata
- `api.carpool.blackroad.io`: documented support subdomain
- `status.carpool.blackroad.io`: documented support subdomain
