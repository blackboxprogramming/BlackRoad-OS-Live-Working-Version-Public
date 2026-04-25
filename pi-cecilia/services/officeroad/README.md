# OfficeRoad

- Canonical host: `officeroad.blackroad.io`
- Owning org: `BlackRoad-Interactive`
- Support orgs: `BlackRoad-Agents, BlackRoad-Studio`
- Route model: `marketing_plus_app_split`
- Runtime path: `/app`
- Health endpoint required: `True`
- Redirect aliases: `office.blackroad.io, live.blackroad.io`
- Support subdomains: `status.officeroad.blackroad.io`

## Local start
```bash
cd services/officeroad
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
- `status.officeroad.blackroad.io`: documented support subdomain
