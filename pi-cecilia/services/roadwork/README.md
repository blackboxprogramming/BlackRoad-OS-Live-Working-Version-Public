# RoadWork

- Canonical host: `roadwork.blackroad.io`
- Owning org: `BlackRoad-Products`
- Support orgs: `BlackRoad-Security, BlackRoad-Data`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `work.blackroad.io`
- Support subdomains: `api.roadwork.blackroad.io`

## Local start
```bash
cd services/roadwork
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
- `api.roadwork.blackroad.io`: documented support subdomain
