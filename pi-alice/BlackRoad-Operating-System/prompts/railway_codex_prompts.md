# Railway Codex Prompt Collection

This document captures nine system prompts for generating production-ready Railway services across multiple runtimes. Each section includes the target Railway URL, runtime, port, repository structure, and implementation details.

## 1. Serene Success Service (Node + Express + TypeScript)
- **Railway URL:** https://serene-success-production.up.railway.app
- **Runtime:** Node 20, Express, TypeScript
- **Port:** 8080
- **Goal:** Backend HTTP API with health and version endpoints, structured for Railway deployment.
- **Repo layout:** `package.json`, `tsconfig.json`, `nodemon.json`, `.env.example`, `Dockerfile`, `railway.json`, `README.md`, `src/` with config, middleware, routes, services, and utils.
- **Key behaviors:**
  - Server reads `PORT` (default 8080), applies JSON parsing, CORS, request logging, mounts routes, and uses centralized error handling.
  - Routes: `/` returns service status JSON; `/health` reports `{ status: "healthy" }`; `/version` returns `{ version: "1.0.0", commit: process.env.COMMIT_SHA || null }`.
  - Logging middleware reports method, path, status code, and duration; error handler emits structured JSON `{ error: { message, code, details? } }`.
  - `.env.example` defines `PORT`, `NODE_ENV`, `COMMIT_SHA`.
  - Dockerfile uses `node:20-alpine`, builds TypeScript, exposes 8080; `railway.json` builds with `npm run build`, starts with `npm run start`, health at `/health`.

## 2. LangTrace Client Service (Tracing Client SDK)
- **Railway URL:** https://langtrace-client-production.up.railway.app
- **Runtime:** Node 20, TypeScript
- **Port:** 8080
- **Goal:** HTTP service to record traces/events and provide a reusable SDK client class.
- **Repo layout:** Node/TS scaffolding with Express server, config, middleware, routes (health, version, trace), SDK (`LangtraceClient`), and trace types.
- **Key behaviors:**
  - Express server with JSON + CORS; routes for root info, health, version, and `POST /trace`.
  - Trace endpoint accepts `{ serviceName, event, metadata? }`, stores in memory, logs to console, returns `{ ok: true, id: "<some-id>" }`.
  - SDK class supports `recordTrace` with base URL and optional API key, using fetch/axios with typed result and clean error handling.
  - Config handles `PORT`, optional `LANGTRACE_API_KEY`, and `LOG_LEVEL`.
  - Dockerfile and `railway.json` mirror the Serene Success pattern with health at `/health` and port 8080.
  - README documents local running and SDK usage in another Node project.

## 3. Postgres Service (Node + Express + Prisma)
- **Railway URL:** https://postgres-production-40e6.up.railway.app
- **Runtime:** Node 20, TypeScript, Express, Prisma
- **Port:** 8080
- **Database:** PostgreSQL via `DATABASE_URL` environment variable.
- **Goal:** API demonstrating DB connectivity with a simple `User` model.
- **Repo layout:** Node/TS project with Prisma schema/migrations, config, DB adapter, middleware, routes (health, version, users), services, and types.
- **Key behaviors:**
  - Prisma schema defines `User` model with `id`, `email` (unique), optional `name`, and `createdAt` defaulting to now.
  - Routes: `/health` verifies DB connectivity (e.g., `SELECT 1`); `/version` returns static version plus commit; `/users` GET lists users; `/users` POST creates user from `{ email, name }`.
  - Prisma client exported as singleton; `.env.example` includes `DATABASE_URL`, `PORT`, `NODE_ENV`.
  - Dockerfile runs `npx prisma migrate deploy` before start; `railway.json` builds with `npm run build`, starts with `npm run start`, health at `/health`, port 8080.

## 4. NodeJS API Service (Generic Node API)
- **Railway URL:** https://nodejs-production-2a66.up.railway.app
- **Runtime:** Node 20, TypeScript, Express
- **Port:** 8080
- **Goal:** Generic expandable API with clean architecture and sample domain data.
- **Repo layout:** Node/TS structure with config, middleware, routes (health, version, sample), services, and utils.
- **Key behaviors:**
  - Similar to Serene Success; `GET /sample` returns mocked domain data `{ items: [...] }`.
  - Dockerfile and `railway.json` use port 8080 and health at `/health`.

## 5. Fantastic Ambition Orchestrator (Main Backend)
- **Railway URL:** https://fantastic-ambition-production-d0de.up.railway.app
- **Runtime:** Node 20, TypeScript, Express
- **Port:** 8080
- **Goal:** Central orchestrator API prepared to integrate with other services (FastAPI, Postgres, Redis) via modular clients.
- **Repo layout:** Node/TS project with config, middleware, routes (health, version, orchestrate), services, clients, and utils.
- **Key behaviors:**
  - `POST /orchestrate` accepts `{ action, payload? }`, mocks calling FastAPI/Postgres/Redis clients, and returns composed JSON `{ action, called: ["fastapi", "postgres", "redis"], ok: true }`.
  - Clients read base URLs from env (`FASTAPI_BASE_URL`, `POSTGRES_API_URL`, `REDIS_API_URL`).
  - Dockerfile/`railway.json` follow standard pattern: build + start, port 8080, health at `/health`.

## 6. FastAPI Service (Python)
- **Railway URL:** https://fastapi-production-3753.up.railway.app
- **Runtime:** Python 3.11, FastAPI, Uvicorn
- **Port:** 8080
- **Goal:** FastAPI backend with health and version endpoints and clean structure.
- **Repo layout:** `pyproject.toml` or `requirements.txt`, Dockerfile, `railway.json`, `.env.example`, README, and `app/` with `main.py`, config, and routers for root, health, and version.
- **Key behaviors:**
  - `main.py` creates FastAPI app, includes routers, uses env `PORT` (default 8080) for Uvicorn binding.
  - Routes: `/` returns `{ service: "fastapi-service", status: "ok" }`; `/health` returns `{ status: "healthy" }`; `/version` returns `{ version: "1.0.0", commit: env("COMMIT_SHA", "") }`.
  - Config reads environment via pydantic or `os.environ`.
  - Dockerfile uses `python:3.11-slim`, installs dependencies, and runs `uvicorn app.main:app --host 0.0.0.0 --port 8080`; `railway.json` builds with pip install, starts with Uvicorn, health at `/health`, port 8080.

## 7. Redis Utility Service
- **Railway URL:** https://redis-production-ef5a.up.railway.app
- **Runtime:** Node 20, TypeScript, Express, Redis client
- **Port:** 8080
- **Goal:** Expose health and cache endpoints backed by Redis.
- **Repo layout:** Node/TS project with config, Redis client, middleware, routes (health, cache), and utils.
- **Key behaviors:**
  - Redis client connects via `REDIS_URL` and exposes get/set helpers.
  - `/health` pings Redis and returns `{ status: "healthy", redis: "ok" }` on success.
  - `POST /cache` accepts `{ key, value, ttlSeconds? }` and sets Redis value; `GET /cache/:key` returns `{ key, value }` or 404 JSON.
  - `.env.example` includes `REDIS_URL` and `PORT`; Dockerfile/`railway.json` mirror other Node services with port 8080 and health at `/health`.

## 8. Bun Function Service
- **Railway URL:** https://function-bun-production-8c33.up.railway.app
- **Runtime:** Bun
- **Port:** 8080
- **Goal:** Minimal Bun HTTP server with three endpoints and simple routing.
- **Repo layout:** `package.json` or `bunfig.toml`, `.env.example`, Dockerfile, `railway.json`, README, and `src/` with `index.ts` and `routes.ts`.
- **Key behaviors:**
  - Bun server uses `Bun.serve` on `PORT` (default 8080) with routes for `/`, `/health`, and `/version` returning status/version JSON.
  - Simple router in `routes.ts` matches path + method.
  - Dockerfile uses Bun base image, installs dependencies, and runs `bun src/index.ts`; `railway.json` builds with `bun install`, starts with `bun src/index.ts`, health at `/health`, port 8080.

## 9. Hello World Service (Minimal Node)
- **Railway URL:** https://hello-world-production-789d.up.railway.app
- **Runtime:** Node 20 + Express (JS or TS)
- **Port:** 8080
- **Goal:** Minimal production-safe Hello World service with root, health, and version routes plus Railway config.
- **Repo layout:** `package.json`, optional `tsconfig.json`, `.env.example`, Dockerfile, `railway.json`, README, and `src/index.(js|ts)`.
- **Key behaviors:**
  - Routes: `/` returns Hello World text or JSON; `/health` returns `{ status: "healthy" }`; `/version` returns `{ version: "1.0.0" }`.
  - Server reads `PORT` from env (default 8080) and logs on startup.
  - Dockerfile/`railway.json` align with other Node services (build + start, port 8080, health at `/health`).

