# ✅ UPDATED GIANT CODEX PROMPT (RAILWAY SERVICES)

Use this prompt to generate a complete, production-ready repository for any service in the Railway project. Paste the base prompt into Codex/Claude, replace `<RAILWAY_URL_FROM_LIST>` with one of the real service URLs below, and let it scaffold the full repo for that deployment. Copy/paste-ready versions for every service are included at the end.

## Railway project and service URLs
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Services:
  - serene-success-production.up.railway.app
  - langtrace-client-production.up.railway.app
  - postgres-production-40e6.up.railway.app
  - nodejs-production-2a66.up.railway.app
  - fantastic-ambition-production-d0de.up.railway.app
  - fastapi-production-3753.up.railway.app
  - redis-production-ef5a.up.railway.app
  - function-bun-production-8c33.up.railway.app
  - hello-world-production-789d.up.railway.app

---

## Base prompt (fill in one service URL per run)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: <RAILWAY_URL_FROM_LIST>
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

---

## Copy/paste-ready prompts (one per service)
Each block is the full prompt with the assigned Railway URL already filled in.

### serene-success-production (Node.js + Express + TypeScript)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: serene-success-production.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### langtrace-client-production (SDK client)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: langtrace-client-production.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### postgres-production-40e6 (Prisma + migrations)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: postgres-production-40e6.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### nodejs-production-2a66 (Node.js + Express + TypeScript)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: nodejs-production-2a66.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### fantastic-ambition-production-d0de (choose stack based on name)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: fantastic-ambition-production-d0de.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### fastapi-production-3753 (FastAPI)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: fastapi-production-3753.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### redis-production-ef5a (Redis helper)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: redis-production-ef5a.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### function-bun-production-8c33 (Bun function)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: function-bun-production-8c33.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```

### hello-world-production-789d (minimal Express)
```markdown
You are generating a complete, production-ready repository for a Railway service.

RAILWAY SERVICE INFORMATION:
- Official Railway Project: https://railway.com/project/c03a8b98-5c40-467b-b344-81c97de22ba8?environmentId=ef7787c7-387b-4fb7-9d13-a32e2cbe20df
- Assigned Railway URL: hello-world-production-789d.up.railway.app
(Examples:
  serene-success-production.up.railway.app
  langtrace-client-production.up.railway.app
  postgres-production-40e6.up.railway.app
  nodejs-production-2a66.up.railway.app
  fantastic-ambition-production-d0de.up.railway.app
  fastapi-production-3753.up.railway.app
  redis-production-ef5a.up.railway.app
  function-bun-production-8c33.up.railway.app
  hello-world-production-789d.up.railway.app
)

REPO PURPOSE:
Create 1 complete deployable service repo that matches the assigned Railway URL.

SERVICE TYPE:
Choose the correct stack automatically based on the Railway URL:
- If name contains “node” or “success”: Node.js + Express + TypeScript
- If name contains “fastapi”: Python FastAPI
- If name contains “function” or “bun”: Bun/JS function
- If name contains “redis”: Provide Redis client bootstrap + health
- If name contains “postgres”: Provide Prisma + migrations
- If name contains “client”: Provide SDK wrapper
- If name contains “hello-world”: Minimal Express server

REQUIRED OUTPUT:
Generate the FULL repo file tree and all files, fully filled out.

FILES TO GENERATE FOR EVERY SERVICE:
1. package.json or pyproject.toml depending on language
2. README.md
3. Dockerfile
4. railway.json
5. .env.example
6. src/index.(ts|py|js)
7. /routes (if backend)
8. /services
9. /controllers (if applicable)
10. /utils
11. Health endpoint at /health
12. Version endpoint at /version
13. Logging middleware
14. Error handler

DATABASE SERVICES:
- For postgres-production-40e6.up.railway.app:
    - Include Prisma schema
    - Include migrations folder
    - Include example User model
    - Include /db adapter

REDIS SERVICES:
- For redis-production-ef5a.up.railway.app:
    - Include Redis client connector
    - Include /cache helper
    - Include /health check verifying Redis ping

FASTAPI SERVICES:
- For fastapi-production-3753.up.railway.app:
    - Include main.py
    - /routers folder
    - /models folder
    - /schemas folder
    - /health route
    - /version route
    - uvicorn server
    - Proper Dockerfile using python:3.11-slim

BUN FUNCTION SERVICES:
- For function-bun-production-8c33.up.railway.app:
    - Create a Bun function entrypoint
    - Create router
    - Include slashes: /health, /version, /
    - Bun-compatible Dockerfile

NODE.JS SERVICES:
- For nodejs-production-2a66.up.railway.app:
    - Express + TypeScript
    - tsconfig.json
    - nodemon.json
    - Proper PORT=8080 config

LANGTRACE CLIENT:
- For langtrace-client-production.up.railway.app:
    - Provide full SDK client implementation
    - Provide tracing wrappers
    - README with usage examples

HELLO WORLD SERVICE:
- For hello-world-production-789d.up.railway.app:
    - Keep minimal Express server
    - Add /health and /version

RAILWAY DEPLOYMENT INSTRUCTIONS:
- Build: “npm install && npm run build” or python build
- Start: “npm run start” or “uvicorn main:app —host 0.0.0.0 —port $PORT”
- Health path: /health
- Port: 8080

OUTPUT FORMAT:
- Start with the repo tree
- Then output every file in clean code blocks
- No explanations, no commentary
```
