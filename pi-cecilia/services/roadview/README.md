# RoadView

- Canonical host: `search.blackroad.io`
- Owning org: `BlackRoad-Index`
- Support orgs: `BlackRoad-Cloud, BlackRoad-Analytics`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `roadview.blackroad.io, seo.blackroad.io`
- Support subdomains: `api.search.blackroad.io, docs.search.blackroad.io`

## Local start
```bash
cd services/search
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
- `api.search.blackroad.io`: documented support subdomain
- `docs.search.blackroad.io`: documented support subdomain
