# BlackRoad OS - Infrastructure & Service Registry

**Version:** 2.0
**Last Updated:** 2025-11-20
**Owner:** Alexa Louise (Cadillac)
**Status:** Production Active

---

## Table of Contents

1. [Overview](#overview)
2. [Architectural Principles](#architectural-principles)
3. [Service Registry](#service-registry)
4. [Kernel Architecture](#kernel-architecture)
5. [Syscall API](#syscall-api)
6. [Inter-Service Communication](#inter-service-communication)
7. [Deployment Model](#deployment-model)
8. [Service Lifecycle](#service-lifecycle)

---

## Overview

BlackRoad OS is a **distributed operating system** where:
- Each **Railway service** = an OS **process**
- Each **Cloudflare domain** = a **mount point**
- All services communicate via a **unified kernel/syscall layer**
- The **monorepo** is the **source of truth** (not deployed)
- **Satellite repos** are **individually deployed** to Railway

This infrastructure document defines the **complete service registry**, **kernel architecture**, and **inter-service communication protocols**.

---

## Architectural Principles

### 1. Monorepo-to-Satellite Sync

```
┌─────────────────────────────────────────────┐
│  BlackRoad-Operating-System (Monorepo)     │
│  Source of Truth - NOT deployed             │
│  Contains: services/, agents/, docs/        │
└─────────────────┬───────────────────────────┘
                  │
         GitHub Actions Sync
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│ Satellite Repo  │  │ Satellite Repo  │
│ blackroad-os-   │  │ blackroad-os-   │
│ core            │  │ api             │
└────────┬────────┘  └────────┬────────┘
         │                    │
    Railway Deploy       Railway Deploy
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│ Railway Service │  │ Railway Service │
│ core-production │  │ api-production  │
└─────────────────┘  └─────────────────┘
         │                    │
         └──────────┬─────────┘
                    │
              Cloudflare DNS
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
  core.blackroad.systems  api.blackroad.systems
```

### 2. Service-as-Process Model

Every service is a **kernel process** with:
- **PID**: Service name (e.g., `blackroad-os-core`)
- **Identity**: Metadata (role, version, environment)
- **Syscalls**: Standard kernel API (`/v1/sys/*`)
- **IPC**: Inter-service RPC via kernel
- **State**: Managed by kernel state manager
- **Lifecycle**: Boot, run, health checks, shutdown

### 3. DNS-as-Filesystem

Cloudflare DNS acts as the **distributed filesystem**:
- **Mount points**: Each subdomain is a mountpoint
- **Symlinks**: CNAME records redirect to services
- **Resolution**: DNS lookup = filesystem path resolution

---

## Service Registry

### Complete Service Map

This is the **canonical registry** that ALL services must reference.

```typescript
// src/kernel/serviceRegistry.ts

export interface ServiceEndpoint {
  name: string;
  role: string;
  production: {
    cloudflare: string;    // Public DNS (Cloudflare)
    railway: string;       // Railway public URL
    internal: string;      // Railway internal DNS
    proxy?: string;        // Railway proxy (if applicable)
  };
  development: {
    railway: string;       // Dev Railway URL
    internal: string;      // Dev internal DNS
    proxy?: string;        // Dev proxy
  };
  port: number;            // Service port
  healthCheck: string;     // Health check path
  satelliteRepo: string;   // GitHub satellite repo
}

export const SERVICE_REGISTRY: Record<string, ServiceEndpoint> = {
  operator: {
    name: 'blackroad-os-operator',
    role: 'operator',
    production: {
      cloudflare: 'https://operator.blackroad.systems',
      railway: 'https://blackroad-os-operator-production-3983.up.railway.app',
      internal: 'http://blackroad-os-operator.railway.internal:8001',
      proxy: 'caboose.proxy.rlwy.net:45194',
    },
    development: {
      railway: 'https://blackroad-os-operator-dev.up.railway.app',
      internal: 'http://blackroad-os-operator.railway.internal:8001',
      proxy: 'caboose.proxy.rlwy.net:45194',
    },
    port: 8001,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-operator',
  },

  core: {
    name: 'blackroad-os-core',
    role: 'core',
    production: {
      cloudflare: 'https://core.blackroad.systems',
      railway: 'https://9gw4d0h2.up.railway.app',
      internal: 'http://blackroad-os-core.railway.internal:8000',
      proxy: 'hopper.proxy.rlwy.net:10593',
    },
    development: {
      railway: 'https://blackroad-os-core-dev-19b6.up.railway.app',
      internal: 'http://blackroad-os-core.railway.internal:8000',
      proxy: 'hopper.proxy.rlwy.net:10593',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-core',
  },

  api: {
    name: 'blackroad-os-api',
    role: 'api',
    production: {
      cloudflare: 'https://api.blackroad.systems',
      railway: 'https://ac7bx15h.up.railway.app',
      internal: 'http://blackroad-os-api.railway.internal:8000',
    },
    development: {
      railway: 'https://blackroad-os-api-dev-ddcb.up.railway.app',
      internal: 'http://blackroad-os-api.railway.internal:8000',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-api',
  },

  app: {
    name: 'blackroad-operating-system',
    role: 'shell',
    production: {
      cloudflare: 'https://app.blackroad.systems',
      railway: 'https://blackroad-operating-system-production.up.railway.app',
      internal: 'http://blackroad-operating-system.railway.internal:8000',
      proxy: 'metro.proxy.rlwy.net:32948',
    },
    development: {
      railway: 'https://blackroad-operating-system-dev.up.railway.app',
      internal: 'http://blackroad-operating-system.railway.internal:8000',
      proxy: 'metro.proxy.rlwy.net:32948',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-operating-system',
  },

  console: {
    name: 'blackroad-os-prism-console',
    role: 'console',
    production: {
      cloudflare: 'https://console.blackroad.systems',
      railway: 'https://qqr1r4hd.up.railway.app',
      internal: 'http://blackroad-os-prism-console.railway.internal:8000',
      proxy: 'hopper.proxy.rlwy.net:38896',
    },
    development: {
      railway: 'https://blackroad-os-prism-console-dev.up.railway.app',
      internal: 'http://blackroad-os-prism-console.railway.internal:8000',
      proxy: 'hopper.proxy.rlwy.net:38896',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-prism-console',
  },

  docs: {
    name: 'blackroad-os-docs',
    role: 'docs',
    production: {
      cloudflare: 'https://docs.blackroad.systems',
      railway: 'https://2izt9kog.up.railway.app',
      internal: 'http://blackroad-os-docs.railway.internal:8000',
    },
    development: {
      railway: 'https://blackroad-os-docs-dev.up.railway.app',
      internal: 'http://blackroad-os-docs.railway.internal:8000',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-docs',
  },

  web: {
    name: 'blackroad-os-web',
    role: 'web',
    production: {
      cloudflare: 'https://web.blackroad.systems',
      railway: 'https://blackroad-os-web-production-3bbb.up.railway.app',
      internal: 'http://blackroad-os-web.railway.internal:8000',
      proxy: 'interchange.proxy.rlwy.net:59770',
    },
    development: {
      railway: 'https://blackroad-os-web-dev.up.railway.app',
      internal: 'http://blackroad-os-web.railway.internal:8000',
      proxy: 'interchange.proxy.rlwy.net:59770',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-web',
  },

  os: {
    name: 'blackroad-os-interface',
    role: 'os',
    production: {
      cloudflare: 'https://os.blackroad.systems',
      railway: 'https://vtrb1hrx.up.railway.app',
      internal: 'http://blackroad-os-interface.railway.internal:8000',
    },
    development: {
      railway: 'https://blackroad-os-interface-dev.up.railway.app',
      internal: 'http://blackroad-os-interface.railway.internal:8000',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-interface',
  },

  root: {
    name: 'blackroad-os-root',
    role: 'root',
    production: {
      cloudflare: 'https://blackroad.systems',
      railway: 'https://kng9hpna.up.railway.app',
      internal: 'http://blackroad-os-root.railway.internal:8000',
    },
    development: {
      railway: 'https://blackroad-os-root-dev.up.railway.app',
      internal: 'http://blackroad-os-root.railway.internal:8000',
    },
    port: 8000,
    healthCheck: '/health',
    satelliteRepo: 'BlackRoad-OS/blackroad-os-root',
  },
};

// Helper functions
export function getServiceUrl(
  serviceName: string,
  environment: 'production' | 'development' = 'production',
  urlType: 'cloudflare' | 'railway' | 'internal' = 'cloudflare'
): string {
  const service = SERVICE_REGISTRY[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  if (urlType === 'cloudflare' && environment === 'production') {
    return service.production.cloudflare;
  }

  const envConfig = environment === 'production' ? service.production : service.development;
  return urlType === 'internal' ? envConfig.internal : envConfig.railway;
}

export function getAllServices(): string[] {
  return Object.keys(SERVICE_REGISTRY);
}

export function getServiceByRole(role: string): ServiceEndpoint | undefined {
  return Object.values(SERVICE_REGISTRY).find((s) => s.role === role);
}
```

---

## Kernel Architecture

### Kernel Modules

Every service MUST implement these kernel modules:

```
src/kernel/
├── config.ts          # Environment configuration
├── identity.ts        # Service identity
├── logger.ts          # Structured logging
├── rpc.ts             # Inter-service RPC
├── events.ts          # Event bus
├── jobs.ts            # Background job queue
├── serviceRegistry.ts # Service discovery
├── state.ts           # State management
└── types.ts           # Shared TypeScript types
```

### Kernel Identity

Every service exposes its identity via `/v1/sys/identity`:

```typescript
// src/kernel/identity.ts

export interface KernelIdentity {
  service: string;         // e.g., "blackroad-os-core"
  role: string;            // e.g., "core", "api", "operator"
  version: string;         // e.g., "1.0.0"
  environment: string;     // "production" | "development"
  dns: {
    cloudflare: string;    // Public DNS
    railway: string;       // Railway URL
    internal: string;      // Internal DNS
  };
  runtime: {
    railwayHost: string;   // RAILWAY_STATIC_URL
    internalHost: string;  // service.railway.internal
    port: number;          // Service port
  };
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;        // Seconds
    lastCheck: string;     // ISO timestamp
  };
  capabilities: string[];  // ["rpc", "events", "jobs", "state"]
}

export function getKernelIdentity(): KernelIdentity {
  const serviceName = process.env.SERVICE_NAME || 'unknown';
  const serviceRole = process.env.SERVICE_ROLE || 'unknown';
  const environment = process.env.ENVIRONMENT || 'development';

  const service = SERVICE_REGISTRY[serviceRole];
  if (!service) {
    throw new Error(`Service not found in registry: ${serviceRole}`);
  }

  const envConfig = environment === 'production' ? service.production : service.development;

  return {
    service: serviceName,
    role: serviceRole,
    version: process.env.npm_package_version || '1.0.0',
    environment,
    dns: {
      cloudflare: envConfig.cloudflare || '',
      railway: envConfig.railway,
      internal: envConfig.internal,
    },
    runtime: {
      railwayHost: process.env.RAILWAY_STATIC_URL || envConfig.railway,
      internalHost: envConfig.internal,
      port: service.port,
    },
    health: {
      status: 'healthy',
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
    },
    capabilities: ['rpc', 'events', 'jobs', 'state'],
  };
}
```

---

## Syscall API

All services MUST implement these syscall endpoints:

### Core Syscalls

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/health` | GET | Basic health check | None | `{status: "healthy"}` |
| `/version` | GET | Version info | None | `{version: "1.0.0", service: "name"}` |
| `/v1/sys/identity` | GET | Service identity | None | `KernelIdentity` |
| `/v1/sys/health` | GET | Detailed health | None | Extended health metrics |
| `/v1/sys/version` | GET | Extended version | None | Full version + build info |
| `/v1/sys/config` | GET | Service config | None | Config (non-sensitive) |

### Logging Syscalls

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/v1/sys/log` | POST | Log message | `{level, message, meta}` | `{id, timestamp}` |
| `/v1/sys/logs` | GET | Get logs | `?level&limit&offset` | `{logs: [...]}` |

### Metrics Syscalls

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/v1/sys/metric` | POST | Record metric | `{name, value, tags}` | `{id, timestamp}` |
| `/v1/sys/metrics` | GET | Get metrics | `?name&from&to` | `{metrics: [...]}` |

### RPC Syscalls

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/v1/sys/rpc` | POST | Call remote procedure | `{service, method, params}` | `{result}` |

### Event Syscalls

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/v1/sys/event` | POST | Emit event | `{event, data}` | `{id, timestamp}` |
| `/v1/sys/events` | GET | Subscribe to events | `?event&since` | SSE stream |

### Job Syscalls

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/v1/sys/job` | POST | Create job | `{name, params, schedule}` | `{id, status}` |
| `/v1/sys/job/:id` | GET | Get job status | None | `{id, status, result}` |
| `/v1/sys/job/:id/cancel` | POST | Cancel job | None | `{id, status: "cancelled"}` |

### State Syscalls

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/v1/sys/state` | GET | Get state | `?key` | `{key, value, version}` |
| `/v1/sys/state` | PUT | Set state | `{key, value}` | `{key, version}` |

---

## Inter-Service Communication

### RPC Client

```typescript
// src/kernel/rpc.ts

import { SERVICE_REGISTRY, getServiceUrl } from './serviceRegistry';

export class RPCClient {
  private environment: 'production' | 'development';

  constructor(environment?: 'production' | 'development') {
    this.environment = environment || (process.env.ENVIRONMENT as any) || 'development';
  }

  async call<T = any>(
    service: string,
    method: string,
    params?: Record<string, any>
  ): Promise<T> {
    // Prefer internal URLs for inter-service communication
    const url = getServiceUrl(service, this.environment, 'internal');

    const response = await fetch(`${url}/v1/sys/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': process.env.SERVICE_NAME || 'unknown',
        'X-Service-Role': process.env.SERVICE_ROLE || 'unknown',
      },
      body: JSON.stringify({ method, params }),
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async getHealth(service: string): Promise<any> {
    const url = getServiceUrl(service, this.environment, 'internal');
    const response = await fetch(`${url}/health`);
    return response.json();
  }

  async getIdentity(service: string): Promise<KernelIdentity> {
    const url = getServiceUrl(service, this.environment, 'internal');
    const response = await fetch(`${url}/v1/sys/identity`);
    return response.json();
  }
}

// Global RPC client
export const rpc = new RPCClient();
```

### Usage Examples

```typescript
// Example 1: Operator calling Core API
import { rpc } from './kernel/rpc';

const health = await rpc.getHealth('core');
console.log('Core health:', health);

// Example 2: API calling Operator
const jobResult = await rpc.call('operator', 'createJob', {
  name: 'deploy-service',
  params: { service: 'blackroad-os-api', branch: 'main' },
});

// Example 3: Core calling Docs
const identity = await rpc.getIdentity('docs');
console.log('Docs service:', identity.service, identity.version);
```

---

## Deployment Model

### Satellite Sync Flow

```yaml
# .github/workflows/sync-to-satellite.yml (in monorepo)

name: Sync to Satellite Repos
on:
  push:
    branches: [main]
    paths:
      - 'services/core-api/**'
      - 'services/operator/**'
      - 'services/public-api/**'

jobs:
  sync-core:
    if: contains(github.event.head_commit.modified, 'services/core-api')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync to blackroad-os-core
        run: |
          git clone https://github.com/BlackRoad-OS/blackroad-os-core
          cp -r services/core-api/* blackroad-os-core/
          cd blackroad-os-core
          git config user.name "BlackRoad Bot"
          git config user.email "bot@blackroad.systems"
          git add .
          git commit -m "Sync from monorepo: ${{ github.event.head_commit.message }}"
          git push
```

### Railway Deployment Flow

```yaml
# railway.yml (in satellite repo)

services:
  blackroad-os-core-production:
    build:
      dockerfile: Dockerfile
    environment:
      SERVICE_NAME: blackroad-os-core
      SERVICE_ROLE: core
      ENVIRONMENT: production
    healthcheck:
      path: /health
      interval: 30s
      timeout: 10s
    deploy:
      replicas: 2
      restart_policy: always
```

---

## Service Lifecycle

### 1. Boot Sequence

```typescript
// src/index.ts

import { initKernel } from './kernel/init';
import { startServer } from './server';

async function boot() {
  console.log('[BOOT] Starting BlackRoad OS service...');

  // 1. Initialize kernel
  await initKernel();

  // 2. Validate environment
  validateEnvironment();

  // 3. Connect to dependencies (DB, Redis, etc.)
  await connectDependencies();

  // 4. Register syscalls
  registerSyscalls();

  // 5. Start server
  await startServer();

  // 6. Announce to service mesh
  await announceToMesh();

  console.log('[BOOT] Service ready');
}

boot().catch((error) => {
  console.error('[BOOT] Fatal error:', error);
  process.exit(1);
});
```

### 2. Health Checks

```typescript
// src/routes/health.ts

export function healthHandler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: checkDatabase(),
      redis: checkRedis(),
      dependencies: checkDependencies(),
    },
  };

  const isHealthy = Object.values(health.checks).every((c) => c.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
}
```

### 3. Graceful Shutdown

```typescript
// src/server.ts

process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] Received SIGTERM, shutting down gracefully...');

  // 1. Stop accepting new requests
  server.close();

  // 2. Finish in-flight requests (with timeout)
  await drainRequests({ timeout: 10000 });

  // 3. Close database connections
  await closeDependencies();

  // 4. Deregister from service mesh
  await deregisterFromMesh();

  console.log('[SHUTDOWN] Shutdown complete');
  process.exit(0);
});
```

---

## Environment Variables

### Required for All Services

```bash
# Service Identity
SERVICE_NAME=blackroad-os-{service}
SERVICE_ROLE=core|api|operator|web|console|docs|shell
ENVIRONMENT=production|development

# Railway (auto-provided)
RAILWAY_STATIC_URL=<auto>
RAILWAY_ENVIRONMENT=production|development

# Service URLs (for RPC)
OPERATOR_URL=https://operator.blackroad.systems
CORE_API_URL=https://core.blackroad.systems
PUBLIC_API_URL=https://api.blackroad.systems
CONSOLE_URL=https://console.blackroad.systems
DOCS_URL=https://docs.blackroad.systems
WEB_URL=https://web.blackroad.systems
OS_URL=https://os.blackroad.systems

# Internal URLs (Railway private network)
OPERATOR_INTERNAL_URL=http://blackroad-os-operator.railway.internal:8001
CORE_API_INTERNAL_URL=http://blackroad-os-core.railway.internal:8000
PUBLIC_API_INTERNAL_URL=http://blackroad-os-api.railway.internal:8000
```

---

## Next Steps

- [ ] Implement kernel modules in all satellite repos
- [ ] Add RPC client to all services
- [ ] Create service mesh dashboard
- [ ] Implement distributed tracing
- [ ] Add circuit breakers for RPC calls
- [ ] Create service dependency graph
- [ ] Implement automated failover
- [ ] Add service versioning/blue-green deployments

---

## References

- **DNS Map**: `infra/DNS.md`
- **Syscall API Spec**: `SYSCALL_API.md`
- **Railway Deployment**: `docs/RAILWAY_DEPLOYMENT.md`
- **Kernel Source**: `kernel/typescript/`

---

**Document Version**: 2.0
**Last Updated**: 2025-11-20
**Owner**: Alexa Louise (Cadillac)
**Status**: ✅ Production Active
