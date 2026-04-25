# BlackRoad OS - Syscall API Specification

**Version:** 2.0
**Last Updated:** 2025-11-20
**Author:** Atlas (Infrastructure Architect)
**Status:** Production Standard

---

## Overview

The **BlackRoad OS Syscall API** defines the standard kernel interface that **ALL services MUST implement**. This ensures uniform interoperability across the distributed operating system.

Think of syscalls as the "system calls" of a traditional OS, but exposed as HTTP REST endpoints. Every service is a process, and syscalls are how the OS and other processes interact with it.

---

## Table of Contents

1. [Core Syscalls](#core-syscalls)
2. [Logging Syscalls](#logging-syscalls)
3. [Metrics Syscalls](#metrics-syscalls)
4. [RPC Syscalls](#rpc-syscalls)
5. [Event Syscalls](#event-syscalls)
6. [Job Syscalls](#job-syscalls)
7. [State Syscalls](#state-syscalls)
8. [Implementation Guide](#implementation-guide)
9. [Examples](#examples)

---

## Core Syscalls

### GET /health

**Purpose**: Basic health check

**Request**: None

**Response**:
```json
{
  "status": "healthy"
}
```

**Status Codes**:
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is unhealthy

**Example**:
```bash
curl https://core.blackroad.systems/health
```

---

### GET /version

**Purpose**: Get service version

**Request**: None

**Response**:
```json
{
  "version": "1.0.0",
  "service": "blackroad-os-core"
}
```

**Status Codes**:
- `200 OK`: Success

**Example**:
```bash
curl https://core.blackroad.systems/version
```

---

### GET /v1/sys/identity

**Purpose**: Get complete service identity

**Request**: None

**Response**: `KernelIdentity` object
```json
{
  "service": "blackroad-os-core",
  "role": "core",
  "version": "1.0.0",
  "environment": "production",
  "dns": {
    "cloudflare": "https://core.blackroad.systems",
    "railway": "https://9gw4d0h2.up.railway.app",
    "internal": "http://blackroad-os-core.railway.internal:8000"
  },
  "runtime": {
    "railwayHost": "9gw4d0h2.up.railway.app",
    "internalHost": "http://blackroad-os-core.railway.internal:8000",
    "port": 8000,
    "pid": 1234,
    "uptime": 3600
  },
  "health": {
    "status": "healthy",
    "uptime": 3600,
    "lastCheck": "2025-11-20T12:00:00Z"
  },
  "capabilities": ["rpc", "events", "jobs", "state"]
}
```

**Status Codes**:
- `200 OK`: Success

**Example**:
```bash
curl https://core.blackroad.systems/v1/sys/identity
```

---

### GET /v1/sys/health

**Purpose**: Extended health check with detailed metrics

**Request**: None

**Response**: `HealthCheck` object
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T12:00:00Z",
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "checks": {
    "database": {
      "status": "ok",
      "latency": 5
    },
    "redis": {
      "status": "ok",
      "latency": 2
    },
    "dependencies": {
      "status": "ok",
      "message": "All dependencies healthy"
    }
  }
}
```

**Status Codes**:
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is unhealthy or degraded

**Example**:
```bash
curl https://core.blackroad.systems/v1/sys/health
```

---

### GET /v1/sys/version

**Purpose**: Extended version information

**Request**: None

**Response**: `VersionInfo` object
```json
{
  "version": "1.0.0",
  "service": "blackroad-os-core",
  "commit": "a1b2c3d4e5f6",
  "buildTime": "2025-11-20T10:00:00Z",
  "nodeVersion": "20.10.0",
  "environment": "production"
}
```

**Status Codes**:
- `200 OK`: Success

**Example**:
```bash
curl https://core.blackroad.systems/v1/sys/version
```

---

### GET /v1/sys/config

**Purpose**: Get non-sensitive service configuration

**Request**: None

**Response**: Partial `KernelConfig` (excluding secrets)
```json
{
  "service": {
    "name": "blackroad-os-core",
    "role": "core",
    "version": "1.0.0",
    "environment": "production",
    "port": 8000
  },
  "features": {
    "rpc": true,
    "events": true,
    "jobs": true,
    "state": true
  }
}
```

**Status Codes**:
- `200 OK`: Success

**Example**:
```bash
curl https://core.blackroad.systems/v1/sys/config
```

---

## Logging Syscalls

### POST /v1/sys/log

**Purpose**: Log a message (remote logging)

**Request**: `LogEntry` (partial)
```json
{
  "level": "info",
  "message": "User logged in",
  "meta": {
    "userId": 123,
    "ip": "192.168.1.1"
  }
}
```

**Response**:
```json
{
  "id": "1732104000000-abc123",
  "timestamp": "2025-11-20T12:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Log entry created
- `400 Bad Request`: Invalid log entry

**Example**:
```bash
curl -X POST https://core.blackroad.systems/v1/sys/log \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"Test log"}'
```

---

### GET /v1/sys/logs

**Purpose**: Get buffered logs

**Query Parameters**:
- `level` (optional): Filter by log level
- `limit` (optional): Number of logs to return (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Request**: None

**Response**:
```json
{
  "logs": [
    {
      "id": "1732104000000-abc123",
      "timestamp": "2025-11-20T12:00:00Z",
      "level": "info",
      "message": "User logged in",
      "service": "blackroad-os-core",
      "meta": { "userId": 123 }
    }
  ],
  "total": 500,
  "limit": 100,
  "offset": 0
}
```

**Status Codes**:
- `200 OK`: Success

**Example**:
```bash
curl "https://core.blackroad.systems/v1/sys/logs?level=error&limit=50"
```

---

## Metrics Syscalls

### POST /v1/sys/metric

**Purpose**: Record a metric

**Request**: `MetricEntry` (partial)
```json
{
  "name": "http.request.duration",
  "value": 125,
  "unit": "ms",
  "tags": {
    "method": "GET",
    "path": "/api/users",
    "status": "200"
  }
}
```

**Response**:
```json
{
  "id": "1732104000000-xyz789",
  "timestamp": "2025-11-20T12:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Metric recorded
- `400 Bad Request`: Invalid metric

**Example**:
```bash
curl -X POST https://core.blackroad.systems/v1/sys/metric \
  -H "Content-Type: application/json" \
  -d '{"name":"cpu.usage","value":75,"unit":"percent"}'
```

---

### GET /v1/sys/metrics

**Purpose**: Get recorded metrics

**Query Parameters**:
- `name` (optional): Filter by metric name
- `from` (optional): Start timestamp (ISO 8601)
- `to` (optional): End timestamp (ISO 8601)
- `limit` (optional): Number of metrics to return (default: 100)

**Request**: None

**Response**:
```json
{
  "metrics": [
    {
      "id": "1732104000000-xyz789",
      "timestamp": "2025-11-20T12:00:00Z",
      "name": "http.request.duration",
      "value": 125,
      "unit": "ms",
      "tags": { "method": "GET" }
    }
  ],
  "total": 1000,
  "limit": 100
}
```

**Status Codes**:
- `200 OK`: Success

**Example**:
```bash
curl "https://core.blackroad.systems/v1/sys/metrics?name=cpu.usage&limit=50"
```

---

## RPC Syscalls

### POST /v1/sys/rpc

**Purpose**: Call a remote procedure (method) on this service

**Request**: `RPCRequest`
```json
{
  "method": "getUserById",
  "params": {
    "id": 123
  },
  "timeout": 5000
}
```

**Response**: `RPCResponse`
```json
{
  "result": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response**:
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 123 not found",
    "details": { "id": 123 }
  }
}
```

**Status Codes**:
- `200 OK`: RPC call succeeded
- `400 Bad Request`: Invalid RPC request
- `404 Not Found`: Method not found
- `500 Internal Server Error`: RPC call failed

**Headers**:
- `X-Service-Name`: Calling service name
- `X-Service-Role`: Calling service role

**Example**:
```bash
curl -X POST https://core.blackroad.systems/v1/sys/rpc \
  -H "Content-Type: application/json" \
  -H "X-Service-Name: blackroad-os-operator" \
  -H "X-Service-Role: operator" \
  -d '{"method":"getUserById","params":{"id":123}}'
```

---

## Event Syscalls

### POST /v1/sys/event

**Purpose**: Emit an event (publish to subscribers)

**Request**: Event (partial)
```json
{
  "event": "user:created",
  "data": {
    "userId": 123,
    "email": "user@example.com"
  }
}
```

**Response**:
```json
{
  "id": "1732104000000-evt123",
  "timestamp": "2025-11-20T12:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Event emitted
- `400 Bad Request`: Invalid event

**Example**:
```bash
curl -X POST https://core.blackroad.systems/v1/sys/event \
  -H "Content-Type: application/json" \
  -d '{"event":"user:created","data":{"userId":123}}'
```

---

### GET /v1/sys/events

**Purpose**: Subscribe to events (Server-Sent Events stream)

**Query Parameters**:
- `event` (optional): Filter by event name
- `since` (optional): Only events after this timestamp (ISO 8601)

**Request**: None

**Response**: SSE stream
```
data: {"id":"1732104000000-evt123","event":"user:created","timestamp":"2025-11-20T12:00:00Z","source":"blackroad-os-core","data":{"userId":123}}

data: {"id":"1732104000001-evt124","event":"user:updated","timestamp":"2025-11-20T12:00:01Z","source":"blackroad-os-core","data":{"userId":123}}

```

**Status Codes**:
- `200 OK`: SSE stream started

**Example**:
```bash
curl -N "https://core.blackroad.systems/v1/sys/events?event=user:created"
```

---

## Job Syscalls

### POST /v1/sys/job

**Purpose**: Create a background job

**Request**: Job (partial)
```json
{
  "name": "send-email",
  "params": {
    "to": "user@example.com",
    "subject": "Welcome",
    "body": "Hello!"
  },
  "schedule": "0 0 * * *"
}
```

**Response**: `Job`
```json
{
  "id": "job-1732104000000-abc123",
  "name": "send-email",
  "params": { "to": "user@example.com" },
  "schedule": "0 0 * * *",
  "status": "queued",
  "createdAt": "2025-11-20T12:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Job created
- `400 Bad Request`: Invalid job
- `404 Not Found`: Job handler not found

**Example**:
```bash
curl -X POST https://core.blackroad.systems/v1/sys/job \
  -H "Content-Type: application/json" \
  -d '{"name":"send-email","params":{"to":"user@example.com","subject":"Test"}}'
```

---

### GET /v1/sys/job/:id

**Purpose**: Get job status

**Request**: None

**Response**: `Job`
```json
{
  "id": "job-1732104000000-abc123",
  "name": "send-email",
  "params": { "to": "user@example.com" },
  "status": "completed",
  "createdAt": "2025-11-20T12:00:00Z",
  "startedAt": "2025-11-20T12:00:01Z",
  "completedAt": "2025-11-20T12:00:05Z",
  "result": { "sent": true, "messageId": "12345" }
}
```

**Error Response** (if job failed):
```json
{
  "id": "job-1732104000000-abc123",
  "status": "failed",
  "error": {
    "message": "SMTP connection failed",
    "stack": "..."
  }
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Job not found

**Example**:
```bash
curl https://core.blackroad.systems/v1/sys/job/job-1732104000000-abc123
```

---

### POST /v1/sys/job/:id/cancel

**Purpose**: Cancel a running or queued job

**Request**: None

**Response**: `Job`
```json
{
  "id": "job-1732104000000-abc123",
  "status": "cancelled",
  "completedAt": "2025-11-20T12:00:10Z"
}
```

**Status Codes**:
- `200 OK`: Job cancelled
- `400 Bad Request`: Job cannot be cancelled (already completed/failed)
- `404 Not Found`: Job not found

**Example**:
```bash
curl -X POST https://core.blackroad.systems/v1/sys/job/job-1732104000000-abc123/cancel
```

---

## State Syscalls

### GET /v1/sys/state

**Purpose**: Get state value(s)

**Query Parameters**:
- `key` (optional): Get specific key (if omitted, returns all state)

**Request**: None

**Response** (single key):
```json
{
  "key": "user:count",
  "value": 42,
  "version": 5,
  "updatedAt": "2025-11-20T12:00:00Z"
}
```

**Response** (all keys):
```json
{
  "state": [
    {
      "key": "user:count",
      "value": 42,
      "version": 5,
      "updatedAt": "2025-11-20T12:00:00Z"
    },
    {
      "key": "session:count",
      "value": 10,
      "version": 2,
      "updatedAt": "2025-11-20T11:00:00Z"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Key not found (if specific key requested)

**Example**:
```bash
# Get specific key
curl "https://core.blackroad.systems/v1/sys/state?key=user:count"

# Get all state
curl "https://core.blackroad.systems/v1/sys/state"
```

---

### PUT /v1/sys/state

**Purpose**: Set state value

**Request**: State update
```json
{
  "key": "user:count",
  "value": 43,
  "expectedVersion": 5
}
```

**Response**: `StateEntry`
```json
{
  "key": "user:count",
  "value": 43,
  "version": 6,
  "updatedAt": "2025-11-20T12:00:10Z"
}
```

**Error Response** (version conflict):
```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Version conflict for key 'user:count': expected 5, got 6"
  }
}
```

**Status Codes**:
- `200 OK`: State updated
- `409 Conflict`: Version conflict (optimistic locking)
- `400 Bad Request`: Invalid request

**Example**:
```bash
curl -X PUT https://core.blackroad.systems/v1/sys/state \
  -H "Content-Type: application/json" \
  -d '{"key":"user:count","value":43,"expectedVersion":5}'
```

---

## Implementation Guide

### Express.js Example

```typescript
import express from 'express';
import { getKernelIdentity, logger, rpc, events, jobQueue, state } from './kernel';

const app = express();
app.use(express.json());

// Core syscalls
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/version', (req, res) => {
  const identity = getKernelIdentity();
  res.json({ version: identity.version, service: identity.service });
});

app.get('/v1/sys/identity', (req, res) => {
  res.json(getKernelIdentity());
});

// RPC syscall
app.post('/v1/sys/rpc', async (req, res) => {
  const { method, params } = req.body;

  try {
    // Call your RPC handler
    const result = await handleRPC(method, params);
    res.json({ result });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'RPC_ERROR',
        message: error.message,
      },
    });
  }
});

// Event syscall
app.post('/v1/sys/event', async (req, res) => {
  const { event, data } = req.body;
  await events.emit(event, data);
  res.status(201).json({
    id: generateId(),
    timestamp: new Date().toISOString(),
  });
});

// Job syscall
app.post('/v1/sys/job', async (req, res) => {
  const { name, params, schedule } = req.body;
  const job = await jobQueue.createJob(name, params, schedule);
  res.status(201).json(job);
});

// State syscalls
app.get('/v1/sys/state', (req, res) => {
  const { key } = req.query;
  if (key) {
    const entry = state.get(key as string);
    if (!entry) {
      return res.status(404).json({ error: 'Key not found' });
    }
    res.json(entry);
  } else {
    res.json({ state: state.getAll() });
  }
});

app.put('/v1/sys/state', (req, res) => {
  const { key, value, expectedVersion } = req.body;
  try {
    const entry = state.set(key, value, expectedVersion);
    res.json(entry);
  } catch (error) {
    res.status(409).json({
      error: {
        code: 'VERSION_CONFLICT',
        message: error.message,
      },
    });
  }
});

app.listen(8000, () => {
  logger.info('Service started on port 8000');
});
```

---

## Examples

### Health Check Flow

```bash
# Check if service is alive
curl https://operator.blackroad.systems/health
# => {"status":"healthy"}

# Get detailed health
curl https://operator.blackroad.systems/v1/sys/health
# => {"status":"healthy","uptime":3600,"memory":{...},"checks":{...}}
```

### RPC Call Flow

```typescript
// Operator calling Core API to get user
import { rpc } from './kernel';

const user = await rpc.call('core', 'getUserById', { id: 123 });
console.log('User:', user);
```

Under the hood:
```bash
# 1. RPC client resolves internal URL
# http://blackroad-os-core.railway.internal:8000

# 2. POST to /v1/sys/rpc
curl -X POST http://blackroad-os-core.railway.internal:8000/v1/sys/rpc \
  -H "Content-Type: application/json" \
  -H "X-Service-Name: blackroad-os-operator" \
  -d '{"method":"getUserById","params":{"id":123}}'

# 3. Core API responds
# {"result":{"id":123,"email":"user@example.com"}}
```

### Event Flow

```typescript
// Service A emits event
await events.emit('user:created', { userId: 123 });

// Service B subscribes (local)
events.on('user:created', (event) => {
  console.log('User created:', event.data.userId);
});

// Remote subscription (SSE)
curl -N "https://core.blackroad.systems/v1/sys/events?event=user:created"
```

---

## Compliance

All BlackRoad OS services MUST implement:

✅ **Required Syscalls**:
- `/health`
- `/version`
- `/v1/sys/identity`
- `/v1/sys/health`
- `/v1/sys/rpc`

⚠️ **Optional Syscalls** (recommended):
- `/v1/sys/log`
- `/v1/sys/metric`
- `/v1/sys/event`
- `/v1/sys/job`
- `/v1/sys/state`

📋 **Testing**:
- All syscalls must have tests
- Health checks must complete in < 100ms
- RPC calls must support timeouts
- All responses must be valid JSON

---

## References

- **Kernel Implementation**: `kernel/typescript/`
- **Service Registry**: `INFRASTRUCTURE.md`
- **DNS Mapping**: `infra/DNS.md`
- **Deployment**: `docs/RAILWAY_DEPLOYMENT.md`

---

**Version:** 2.0
**Last Updated:** 2025-11-20
**Author:** Atlas (Infrastructure Architect)
**Status:** ✅ Production Standard
