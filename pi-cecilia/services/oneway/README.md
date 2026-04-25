# OneWay

- Canonical host: `oneway.blackroad.io`
- Owning org: `BlackRoad-Data`
- Support orgs: `BlackRoad-Foundation, BlackRoad-Products`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `way.blackroad.io`
- Support subdomains: `api.oneway.blackroad.io`

## Local start
```bash
cd services/oneway
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
- `/api/health`: liveness check
- `/api/ready`: readiness check
- `/api/version`: service metadata
- `api.oneway.blackroad.io`: documented support subdomain
