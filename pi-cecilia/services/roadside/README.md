# RoadSide

- Canonical host: `roadside.blackroad.io`
- Owning org: `BlackRoad-Products`
- Support orgs: `BlackRoad-OS, BlackRoad-Studio`
- Route model: `guided_flow_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `side.blackroad.io`
- Support subdomains: `docs.roadside.blackroad.io`

## Local start
```bash
cd services/roadside
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
- `/docs`: documentation landing or pointer
- `/api/health`: liveness check
- `/api/ready`: readiness check
- `/api/version`: service metadata
- `docs.roadside.blackroad.io`: documented support subdomain
