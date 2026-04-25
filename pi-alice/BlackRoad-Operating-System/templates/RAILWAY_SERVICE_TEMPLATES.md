# Railway Service Templates

This document captures copy-pasteable service scaffolds that can be dropped into individual repositories and deployed directly to Railway. It includes two fully fleshed out anchor services plus slimmer patterns for common variations (Postgres + Prisma, Redis utilities, and a minimal hello world).

## Anchor 1: FastAPI service (`fastapi-production-3753`)

**Repository layout**

```text
fastapi-service/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py
│   └── api/
│       ├── __init__.py
│       ├── deps.py
│       └── routes/
│           ├── __init__.py
│           ├── root.py
│           ├── health.py
│           └── version.py
├── .env.example
├── Dockerfile
├── pyproject.toml
├── railway.json
└── README.md
```

**pyproject.toml**

```toml
[project]
name = "fastapi-service"
version = "1.0.0"
description = "FastAPI service for Railway"
requires-python = ">=3.11"
dependencies = [
  "fastapi==0.114.0",
  "uvicorn[standard]==0.30.0",
  "python-dotenv==1.0.1",
  "pydantic-settings==2.3.4"
]

[project.optional-dependencies]
dev = [
  "ruff",
  "pytest"
]

[tool.uvicorn]
factory = false
reload = false
```

**.env.example**

```bash
PORT=8080
ENVIRONMENT=production
SERVICE_NAME=fastapi-service
COMMIT_SHA=
```

**app/core/config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8080
    environment: str = "production"
    service_name: str = "fastapi-service"
    commit_sha: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
```

**app/api/routes/root.py**

```python
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/", summary="Root info")
async def root():
    return {
        "service": settings.service_name,
        "status": "ok",
        "environment": settings.environment,
    }
```

**app/api/routes/health.py**

```python
from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="Health check")
async def health():
    return {"status": "healthy"}
```

**app/api/routes/version.py**

```python
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/version", summary="Version info")
async def version():
    return {
        "version": "1.0.0",
        "commit": settings.commit_sha,
    }
```

**app/api/routes/__init__.py**

```python
from fastapi import APIRouter
from . import root, health, version

api_router = APIRouter()
api_router.include_router(root.router)
api_router.include_router(health.router)
api_router.include_router(version.router)
```

**app/api/deps.py**

```python
# Placeholder for future dependencies (DB sessions, auth, etc.)
from collections.abc import AsyncGenerator


async def get_dummy_dep() -> AsyncGenerator[None, None]:
    try:
        yield
    finally:
        return
```

**app/main.py**

```python
from fastapi import FastAPI
from app.api.routes import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.service_name,
        version="1.0.0",
    )
    app.include_router(api_router)
    return app


app = create_app()
```

**Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY pyproject.toml ./
RUN pip install --no-cache-dir uvicorn fastapi python-dotenv pydantic-settings

COPY app ./app

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**railway.json**

```json
{
  "build": "pip install --no-cache-dir uvicorn fastapi python-dotenv pydantic-settings",
  "start": "uvicorn app.main:app --host 0.0.0.0 --port 8080",
  "healthcheckPath": "/health",
  "port": 8080
}
```

**README.md**

```markdown
# FastAPI Service

FastAPI microservice for Railway.

## Running locally

```bash
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

## Endpoints

* `GET /` – basic info
* `GET /health` – healthcheck
* `GET /version` – version info
```

---

## Anchor 2: Serene Success Node/Express TS (`serene-success-production`)

**Repository layout**

```text
serene-success-service/
├── src/
│   ├── index.ts
│   ├── config/
│   │   └── env.ts
│   ├── middleware/
│   │   ├── logging.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── health.ts
│   │   └── version.ts
│   ├── services/
│   │   └── statusService.ts
│   └── utils/
│       └── logger.ts
├── package.json
├── tsconfig.json
├── nodemon.json
├── .env.example
├── Dockerfile
├── railway.json
└── README.md
```

**package.json**

```json
{
  "name": "serene-success-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.2",
    "nodemon": "^3.1.4",
    "typescript": "^5.5.4"
  }
}
```

**tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**.env.example**

```bash
PORT=8080
NODE_ENV=production
SERVICE_NAME=serene-success
COMMIT_SHA=
```

**src/config/env.ts**

```ts
export const env = {
  port: parseInt(process.env.PORT || "8080", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "serene-success",
  commitSha: process.env.COMMIT_SHA || null
};
```

**src/utils/logger.ts**

```ts
/* Simple logger wrapper */
export const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args)
};
```

**src/middleware/logging.ts**

```ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
}
```

**src/middleware/errorHandler.ts**

```ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      message: "Internal server error"
    }
  });
}
```

**src/services/statusService.ts**

```ts
import { env } from "../config/env";

export function getStatus() {
  return {
    service: env.serviceName,
    status: "ok",
    timestamp: new Date().toISOString()
  };
}
```

**src/routes/health.ts**

```ts
import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

export default router;
```

**src/routes/version.ts**

```ts
import { Router } from "express";
import { env } from "../config/env";

const router = Router();

router.get("/version", (_req, res) => {
  res.json({
    version: "1.0.0",
    commit: env.commitSha
  });
});

export default router;
```

**src/routes/index.ts**

```ts
import { Router } from "express";
import { getStatus } from "../services/statusService";
import healthRouter from "./health";
import versionRouter from "./version";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getStatus());
});

router.use(healthRouter);
router.use(versionRouter);

export default router;
```

**src/index.ts**

```ts
import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/logging";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use(routes);

app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`Serene Success listening on port ${env.port}`);
});
```

**Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* tsconfig.json ./
RUN npm install

COPY src ./src

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
```

**railway.json**

```json
{
  "build": "npm install && npm run build",
  "start": "npm run start",
  "healthcheckPath": "/health",
  "port": 8080
}
```

**README.md**

```markdown
# Serene Success Service

Node.js + Express + TypeScript service for Railway.

## Local dev

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints

* `GET /` – status JSON
* `GET /health`
* `GET /version`
```

---

## Slim patterns you can mix in

These snippets plug into the Node/Express skeleton above:

### Postgres + Prisma (add to `serene-success` skeleton)

- `prisma/schema.prisma`
- `src/db/prisma.ts`
- `src/services/userService.ts`
- `src/routes/users.ts` (wire into `routes/index.ts`)

**prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

**src/db/prisma.ts**

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

**src/services/userService.ts**

```ts
import prisma from "../db/prisma";

export async function listUsers() {
  return prisma.user.findMany();
}

export async function createUser(email: string, name?: string) {
  return prisma.user.create({
    data: { email, name }
  });
}
```

**src/routes/users.ts**

```ts
import { Router } from "express";
import { listUsers, createUser } from "../services/userService";

const router = Router();

router.get("/users", async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.post("/users", async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    const user = await createUser(email, name);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
```

### Redis utility routes

Add `src/redis/client.ts` and `src/routes/cache.ts`, then mount `cacheRouter` in `routes/index.ts`.

**src/redis/client.ts**

```ts
import { createClient } from "redis";
import { logger } from "../utils/logger";

const url = process.env.REDIS_URL;
if (!url) {
  logger.warn("REDIS_URL not set, Redis client will fail to connect.");
}

export const redis = createClient({ url });

redis.on("error", (err) => logger.error("Redis error:", err));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}
```

**src/routes/cache.ts**

```ts
import { Router } from "express";
import { redis, connectRedis } from "../redis/client";

const router = Router();

router.post("/cache", async (req, res, next) => {
  try {
    const { key, value, ttlSeconds } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "key and value required" });
    }
    await connectRedis();
    if (ttlSeconds) {
      await redis.set(key, value, { EX: Number(ttlSeconds) });
    } else {
      await redis.set(key, value);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/cache/:key", async (req, res, next) => {
  try {
    await connectRedis();
    const value = await redis.get(req.params.key);
    if (value === null) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ key: req.params.key, value });
  } catch (err) {
    next(err);
  }
});

export default router;
```

### Hello World minimal (`hello-world-production-789d`)

A barebones Express variant using the same `package.json`/`Dockerfile` scaffold:

```ts
import express from "express";

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);

app.get("/", (_req, res) => {
  res.json({ message: "Hello, World" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.get("/version", (_req, res) => {
  res.json({ version: "1.0.0" });
});

app.listen(port, () => {
  console.log(`Hello World service listening on ${port}`);
});
```

---

## How to extend for other service names

Use the Node/Express scaffold as a base and tweak routes/configuration:

- `nodejs-production-2a66`: duplicate the Serene Success layout, rename the service, and add any bespoke routes you need.
- `fantastic-ambition-production-d0de`: start from the same base, add an `/orchestrate` route plus any client wrappers (e.g., `clients/fastapiClient.ts`).
- `langtrace-client-production`: reuse the scaffold and add an `sdk/LangtraceClient.ts` plus a `/trace` POST route.
- `function-bun-production-8c33`: mimic the REST surface (`/`, `/health`, `/version`) using `Bun.serve` instead of Express.

Each template keeps `/health` for Railway health checks and assumes port `8080`; adjust in `.env.example` and `railway.json` if needed.
