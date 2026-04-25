# Roadie

- Canonical host: `roadie.blackroad.io`
- Owning org: `BlackRoad-Education`
- Support orgs: `BlackRoad-AI, BlackRoad-Products`
- Route model: `guided_flow_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `tutor.blackroad.io`
- Support subdomains: `docs.tutor.blackroad.io`

## Local start
```bash
cd services/roadie
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
- `docs.tutor.blackroad.io`: documented support subdomain
