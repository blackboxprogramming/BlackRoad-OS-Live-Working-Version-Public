# RoadTrip

- Canonical host: `roadtrip.blackroad.io`
- Owning org: `BlackRoad-Agents`
- Support orgs: `BlackRoad-AI, BlackRoad-Foundation`
- Route model: `app_at_root`
- Runtime path: `/`
- Health endpoint required: `True`
- Redirect aliases: `trip.blackroad.io`
- Support subdomains: `api.roadtrip.blackroad.io`

## Local start
```bash
cd services/roadtrip
cp .env.example .env
npm install
npm run dev
```

### Backend wiring

The homepage runtime now proxies authenticated RoadTrip backend requests server-side.

Required environment variables:

- `ROADTRIP_API_BASE_URL`
- `ROADTRIP_API_TOKEN`

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
- `api.roadtrip.blackroad.io`: documented support subdomain
