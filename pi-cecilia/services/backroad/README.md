# BackRoad

- Canonical host: `social.blackroad.io`
- Owning org: `BlackRoad-Media`
- Support orgs: `BlackRoad-Studio, BlackRoad-Products`
- Route model: `marketing_plus_app_split`
- Runtime path: `/app`
- Health endpoint required: `True`
- Redirect aliases: `backroad.blackroad.io`
- Support subdomains: `api.social.blackroad.io, status.social.blackroad.io`

## Local start
```bash
cd services/social
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
- `/status`: status landing or pointer
- `/api/health`: liveness check
- `/api/ready`: readiness check
- `/api/version`: service metadata
- `api.social.blackroad.io`: documented support subdomain
- `status.social.blackroad.io`: documented support subdomain
