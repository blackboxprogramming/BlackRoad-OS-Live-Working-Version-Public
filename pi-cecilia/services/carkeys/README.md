# CarKeys

- Canonical host: `carkeys.blackroad.io`
- Owning org: `BlackRoad-Foundation`
- Support orgs: `BlackRoad-Security, BlackRoad-Cloud`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `keys.blackroad.io, roadauth.blackroad.io`
- Support subdomains: `api.carkeys.blackroad.io`

## Local start
```bash
cd services/carkeys
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
- `api.carkeys.blackroad.io`: documented support subdomain
