# BlackBoard

- Canonical host: `blackboard.blackroad.io`
- Owning org: `BlackRoad-Analytics`
- Support orgs: `BlackRoad-Index, BlackRoad-Products`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `board.blackroad.io, kpi.blackroad.io, roadlog.blackroad.io`
- Support subdomains: `api.blackboard.blackroad.io, status.blackboard.blackroad.io`

## Local start
```bash
cd services/blackboard
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
- `/status`: status landing or pointer
- `/api/health`: liveness check
- `/api/ready`: readiness check
- `/api/version`: service metadata
- `api.blackboard.blackroad.io`: documented support subdomain
- `status.blackboard.blackroad.io`: documented support subdomain
