# BlackRoad OS - Kernel Module (TypeScript)

**Version:** 2.0
**Author:** Atlas (Infrastructure Architect)
**Last Updated:** 2025-11-20

---

## Overview

The **BlackRoad OS Kernel** is a TypeScript module that provides a unified interface for all BlackRoad OS services. It enables:

- **Service Discovery**: Automatic DNS and Railway endpoint resolution
- **Inter-Service Communication**: RPC calls between services
- **Event Broadcasting**: Pub/sub event bus
- **Background Jobs**: Asynchronous task execution
- **State Management**: Shared key-value store
- **Structured Logging**: Centralized logging with levels
- **Health Monitoring**: Service health checks and status reporting

---

## Installation

### Option 1: Copy to Your Service

```bash
# Copy the entire kernel directory to your service
cp -r kernel/typescript/* your-service/src/kernel/
```

### Option 2: Symlink (Monorepo)

```bash
# Create a symlink to the kernel
cd your-service/src
ln -s ../../kernel/typescript kernel
```

### Option 3: NPM Package (Future)

```bash
# Not yet published
npm install @blackroad-os/kernel
```

---

## Usage

### Basic Setup

```typescript
// src/index.ts
import { kernelConfig, logger, getKernelIdentity } from './kernel';

async function main() {
  // Get service identity
  const identity = getKernelIdentity();
  logger.info('Service starting', { identity });

  // Log configuration
  logger.info('Configuration loaded', { config: kernelConfig });

  // Your service logic here...
}

main().catch((error) => {
  logger.fatal('Fatal error', { error: error.message });
  process.exit(1);
});
```

### Service Discovery

```typescript
import { getServiceUrl, getInternalUrl, SERVICE_REGISTRY } from './kernel';

// Get public URL (Cloudflare)
const coreUrl = getServiceUrl('core', 'production', 'cloudflare');
// => "https://core.blackroad.systems"

// Get internal URL (Railway)
const coreInternal = getInternalUrl('core', 'production');
// => "http://blackroad-os-core.railway.internal:8000"

// Get all services
const allServices = getAllServices();
// => ["operator", "core", "api", "console", ...]
```

### Inter-Service RPC

```typescript
import { rpc } from './kernel';

// Call a method on another service
const user = await rpc.call('core', 'getUserById', { id: 123 });

// Check service health
const health = await rpc.getHealth('operator');

// Get service identity
const identity = await rpc.getIdentity('api');

// Ping a service
const isAlive = await rpc.ping('docs');
```

### Event Bus

```typescript
import { events } from './kernel';

// Subscribe to an event
events.on('user:created', (event) => {
  console.log('User created:', event.data);
});

// Subscribe once
events.once('app:ready', (event) => {
  console.log('App ready!');
});

// Emit an event
await events.emit('user:created', { userId: 123, email: 'test@example.com' });

// Unsubscribe
const unsubscribe = events.on('data:updated', handler);
unsubscribe(); // Call to unsubscribe
```

### Background Jobs

```typescript
import { jobQueue } from './kernel';

// Register a job handler
jobQueue.registerHandler('send-email', async (params) => {
  const { to, subject, body } = params;
  // Send email logic...
  return { sent: true, messageId: '12345' };
});

// Create and execute a job
const job = await jobQueue.createJob('send-email', {
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Hello!',
});

// Get job status
const jobStatus = jobQueue.getJob(job.id);
console.log('Job status:', jobStatus?.status);

// Cancel a job
await jobQueue.cancelJob(job.id);
```

### State Management

```typescript
import { state } from './kernel';

// Set state
state.set('user:count', 0);

// Get state
const entry = state.get('user:count');
console.log('User count:', entry?.value);

// Update state
state.update('user:count', (current) => current + 1);

// Increment/decrement
state.increment('user:count');
state.decrement('user:count', 5);

// Optimistic locking
try {
  state.set('user:count', 10, 5); // expectedVersion = 5
} catch (error) {
  console.error('Version conflict!');
}
```

### Logging

```typescript
import { logger, createLogger } from './kernel';

// Use default logger
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error: 'details' });
logger.fatal('Fatal error');

// Create contextual logger
const dbLogger = createLogger('Database');
dbLogger.info('Connected to database');
```

---

## API Reference

### Types

All TypeScript types are defined in `types.ts`:

- `Environment`: "production" | "development" | "staging" | "test"
- `ServiceRole`: "core" | "api" | "operator" | "web" | "console" | "docs" | "shell" | "root"
- `HealthStatus`: "healthy" | "degraded" | "unhealthy"
- `LogLevel`: "debug" | "info" | "warn" | "error" | "fatal"
- `JobStatus`: "pending" | "queued" | "running" | "completed" | "failed" | "cancelled"

See `types.ts` for complete interface definitions.

### Service Registry

**Functions**:
- `getServiceUrl(serviceName, environment, urlType)`: Get service URL
- `getAllServices()`: Get all service names
- `getServiceByRole(role)`: Get service by role
- `hasService(serviceName)`: Check if service exists
- `getInternalUrl(serviceName, environment)`: Get internal Railway URL
- `getPublicUrl(serviceName, environment)`: Get public Cloudflare URL

### Identity

**Functions**:
- `getKernelIdentity()`: Get service identity
- `setHealthStatus(status)`: Update health status
- `getUptime()`: Get service uptime (seconds)

### Config

**Variables**:
- `kernelConfig`: Global configuration object

**Functions**:
- `loadKernelConfig()`: Load config from env vars
- `validateConfig(config)`: Validate configuration

### Logger

**Class**: `Logger`
- `debug(message, meta?)`: Log debug message
- `info(message, meta?)`: Log info message
- `warn(message, meta?)`: Log warning
- `error(message, meta?)`: Log error
- `fatal(message, meta?)`: Log fatal error

**Functions**:
- `createLogger(context?)`: Create logger with context
- `getLogs(level?, limit?, offset?)`: Get buffered logs
- `clearLogs()`: Clear log buffer

### RPC Client

**Class**: `RPCClient`
- `call<T>(service, method, params?, timeout?)`: Call remote procedure
- `getHealth(service)`: Get service health
- `getIdentity(service)`: Get service identity
- `ping(service)`: Ping service

### Event Bus

**Class**: `EventBus`
- `on(eventName, handler)`: Subscribe to event
- `once(eventName, handler)`: Subscribe once
- `off(eventName, handler)`: Unsubscribe
- `emit(eventName, data?)`: Emit event
- `getEventNames()`: Get all event names
- `getSubscriberCount(eventName)`: Get subscriber count
- `clearEvent(eventName)`: Clear event handlers
- `clearAll()`: Clear all handlers

### Job Queue

**Class**: `JobQueue`
- `registerHandler(name, handler)`: Register job handler
- `createJob(name, params?, schedule?)`: Create job
- `getJob(jobId)`: Get job status
- `getAllJobs()`: Get all jobs
- `getJobsByStatus(status)`: Get jobs by status
- `cancelJob(jobId)`: Cancel job
- `clearCompleted()`: Clear completed jobs

### State Manager

**Class**: `StateManager`
- `get(key)`: Get state value
- `getAll()`: Get all state entries
- `set(key, value, expectedVersion?)`: Set state value
- `delete(key)`: Delete state entry
- `has(key)`: Check if key exists
- `clear()`: Clear all state
- `size()`: Get state size
- `keys()`: Get all keys
- `update(key, updater)`: Update state value
- `increment(key, delta?)`: Increment numeric value
- `decrement(key, delta?)`: Decrement numeric value

---

## Environment Variables

Required for all services:

```bash
# Service Identity
SERVICE_NAME=blackroad-os-{service}
SERVICE_ROLE=core|api|operator|web|console|docs|shell|root
ENVIRONMENT=production|development|staging|test
PORT=8000

# Railway (auto-provided in production)
RAILWAY_STATIC_URL=
RAILWAY_ENVIRONMENT=

# Service URLs (public)
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
CONSOLE_INTERNAL_URL=http://blackroad-os-prism-console.railway.internal:8000
DOCS_INTERNAL_URL=http://blackroad-os-docs.railway.internal:8000
WEB_INTERNAL_URL=http://blackroad-os-web.railway.internal:8000
```

---

## Testing

Example test using the kernel:

```typescript
import { getKernelIdentity, rpc, events, state } from './kernel';

describe('Kernel', () => {
  beforeEach(() => {
    // Set up test environment
    process.env.SERVICE_NAME = 'test-service';
    process.env.SERVICE_ROLE = 'api';
    process.env.ENVIRONMENT = 'test';
  });

  it('should return kernel identity', () => {
    const identity = getKernelIdentity();
    expect(identity.service).toBe('test-service');
    expect(identity.role).toBe('api');
  });

  it('should emit and receive events', async () => {
    const handler = jest.fn();
    events.on('test:event', handler);

    await events.emit('test:event', { foo: 'bar' });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'test:event',
        data: { foo: 'bar' },
      })
    );
  });

  it('should manage state', () => {
    state.set('test:key', 'test:value');
    const entry = state.get('test:key');
    expect(entry?.value).toBe('test:value');
    expect(entry?.version).toBe(1);
  });
});
```

---

## Architecture

The kernel follows a modular architecture:

```
kernel/typescript/
├── types.ts           # Type definitions
├── serviceRegistry.ts # Service discovery
├── identity.ts        # Service identity
├── config.ts          # Configuration
├── logger.ts          # Logging
├── rpc.ts             # Inter-service RPC
├── events.ts          # Event bus
├── jobs.ts            # Job queue
├── state.ts           # State management
├── index.ts           # Main exports
└── README.md          # This file
```

Each module is:
- **Self-contained**: No external dependencies (except Node.js built-ins)
- **Typed**: Full TypeScript support
- **Testable**: Easy to mock and test
- **Documented**: JSDoc comments for all public APIs

---

## Best Practices

1. **Use internal URLs for RPC**: Always prefer `getInternalUrl()` for inter-service communication
2. **Handle RPC errors**: Wrap RPC calls in try/catch blocks
3. **Version state carefully**: Use optimistic locking for concurrent updates
4. **Clean up event listeners**: Always unsubscribe when done
5. **Use contextual loggers**: Create loggers with context for better debugging
6. **Register job handlers early**: Register all handlers before creating jobs

---

## Roadmap

Future enhancements:

- [ ] Distributed event bus (cross-service events)
- [ ] Persistent job queue (Redis/Postgres)
- [ ] Distributed state (Redis/Consul)
- [ ] Circuit breaker for RPC calls
- [ ] Request tracing (OpenTelemetry)
- [ ] Metrics export (Prometheus)
- [ ] Service mesh integration
- [ ] NPM package publication

---

## Contributing

This kernel is part of the BlackRoad OS monorepo. To contribute:

1. Edit files in `kernel/typescript/`
2. Run tests: `npm test` (when available)
3. Update this README if adding features
4. Sync changes to satellite repos

---

## License

Part of BlackRoad Operating System
© 2025 Alexa Louise (Cadillac)

---

**Version:** 2.0
**Last Updated:** 2025-11-20
**Status:** ✅ Production Ready
