# RoadWorld

- Canonical host: `roadworld.blackroad.io`
- Owning org: `BlackRoad-Interactive`
- Support orgs: `BlackRoad-Studio, BlackRoad-Cloud`
- Route model: `marketing_plus_app_split`
- Runtime path: `/app`
- Health endpoint required: `True`
- Redirect aliases: `world.blackroad.io`
- Support subdomains: `assets.roadworld.blackroad.io, docs.roadworld.blackroad.io`

## Local start
```bash
cd services/roadworld
cp .env.example .env
npm install
npm run dev
```

## Required endpoints
- `GET /api/health`
- `GET /api/ready`
- `GET /api/version`

## Generated route intent
- `/`: marketing or overview landing
- `/app`: primary runtime surface
- `/app/settings`: runtime settings surface
- `/help`: product help and guidance
- `/docs`: documentation landing or pointer
- `/api/health`: liveness check
- `/api/ready`: readiness check
- `/api/version`: service metadata
- `assets.roadworld.blackroad.io`: documented support subdomain
- `docs.roadworld.blackroad.io`: documented support subdomain
