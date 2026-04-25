# RoadCode

- Canonical host: `roadcode.blackroad.io`
- Owning org: `BlackRoad-Code-Solutions`
- Support orgs: `BlackRoad-Cloud, BlackRoad-OS`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `code.blackroad.io`
- Support subdomains: `api.roadcode.blackroad.io, docs.roadcode.blackroad.io`

## Local start
```bash
cd services/roadcode
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
- `api.roadcode.blackroad.io`: documented support subdomain
- `docs.roadcode.blackroad.io`: documented support subdomain
