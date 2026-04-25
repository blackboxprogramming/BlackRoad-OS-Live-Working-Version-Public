# BlackRoad Info Service

Backend service for the BlackRoad Operating System exposing metadata and health endpoints.

---
**SERVICE METADATA**
- **Service Name:** BlackRoad Info Service
- **Service ID:** info
- **Kind:** backend
- **Repo URL:** https://github.com/blackroad-os/BlackRoad-Operating-System
- **Base URL (Railway):** https://blackroad-info.up.railway.app
---

## Endpoints
- `GET /health` — basic health check.
- `GET /info` — service metadata.
- `GET /version` — package version.
- `GET /debug/env` — safe environment variable dump.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Building

```bash
npm run build
npm start
```
