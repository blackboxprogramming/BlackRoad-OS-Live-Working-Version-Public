# Railway Service Settings (Satellite Repos)

These settings standardize how every satellite repo in the BlackRoad Operating System family deploys to Railway. Copy the values directly into each Railway service and you will get consistent Nixpacks/Docker defaults, health checks, and domain targets.

## Per-service configuration

| Service ID | Repo | Railway Service Name | Port | Build Command | Start Command | Health Path | Domain |
| ---------: | ---- | -------------------- | ---- | ------------- | ------------- | ----------- | ------ |
| core | `blackroad-os-core` | `core` | 8080 | `npm install && npm run build` | `npm start` | `/health` | `core.blackroad.systems` |
| api | `blackroad-os-api` | `api` | 8080 | `npm install && npm run build` | `npm start` | `/health` | `api.blackroad.systems` |
| agents | `blackroad-os-agents` | `agents` | 8080 | `npm install && npm run build` | `npm start` | `/health` | `agents.blackroad.systems`* |
| operator | `blackroad-os-operator` | `operator` | 8080 | `npm install && npm run build` | `npm start` | `/health` | `operator.blackroad.systems` |
| console | `blackroad-os-prism-console` | `console` | 8080 | `npm install && npm run build` | `npm start` | `/health` | `console.blackroad.systems` |
| web | `blackroad-os-web` | `app` | 8080 | `npm install && npm run build` | `npm start` | `/health` | `blackroad.systems` |
| docs | `blackroad-os-docs` | `docs` | 8080 | `npm install && npm run build` | `npm start` | `/health` | `docs.blackroad.systems`* |

\* If the `agents.` or `docs.` subdomains are not live in Cloudflare yet, Railway will deploy using the default `*.up.railway.app` hostname until DNS is ready.

### Railway UI checklist (apply to each service)

1. **Source**: Make sure the correct GitHub repo is connected.
2. **Variables**:
   - `PORT=8080`
   - For Prism Console: `API_URL=https://api.blackroad.systems` (or the deployed API Railway URL).
3. **Deploy** (Nixpacks):
   - **Build**: `npm install && npm run build`
   - **Start**: `npm start`
   - **Port**: `8080`
   - **Health Check Path**: `/health`

> Tip: Run `npm install && npm run build && npm start` locally before committing so you can hit `http://localhost:8080/health` and confirm the health endpoint.

## Optional Dockerfiles

Railway works fine with Nixpacks for all services. Use these Dockerfiles only if you explicitly switch a service to Docker build mode.

### Backend services (`core`, `api`, `agents`, `operator`)

```dockerfile
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app ./

EXPOSE 8080

CMD ["npm", "start"]
```

Railway settings when using this Dockerfile:
- Build command: leave blank (Railway builds from the Dockerfile)
- Start command: leave blank (CMD handles it)
- Port: `8080`
- Health path: `/health`

### Next.js frontends (`console`, `web`, `docs`)

```dockerfile
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app ./

EXPOSE 8080

CMD ["npm", "start"]
```

Use the same Railway settings as the backend Dockerfile (blank build/start, port `8080`, health `/health`).

## Deploy loop

For each repo:

```bash
npm install
npm run build
npm start # verify http://localhost:8080/health
```

Then commit/push and in Railway set Build/Start/Port/Health to the matrix values above. In the meta repo, run `npm run health:all` to check deployed status (and `npm run deploy:all` later once `RAILWAY_TOKEN` is wired in CI).
