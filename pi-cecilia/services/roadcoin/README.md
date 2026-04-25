# RoadCoin

- Canonical host: `roadcoin.blackroad.io`
- Owning org: `BlackRoad-QI`
- Support orgs: `BlackRoad-Quantum, BlackRoad-Foundation`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `None`
- Support subdomains: `docs.roadcoin.blackroad.io, status.roadcoin.blackroad.io`

## Local start
```bash
cd services/roadcoin
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
- `/status`: status landing or pointer
- `/api/health`: liveness check
- `/api/ready`: readiness check
- `/api/version`: service metadata
- `docs.roadcoin.blackroad.io`: documented support subdomain
- `status.roadcoin.blackroad.io`: documented support subdomain
