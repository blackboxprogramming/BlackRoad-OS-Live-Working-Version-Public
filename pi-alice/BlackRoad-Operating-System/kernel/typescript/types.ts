/**
 * BlackRoad OS - Kernel Type Definitions
 *
 * Shared TypeScript types for the BlackRoad OS kernel layer.
 * All services must use these types for interoperability.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

export type Environment = 'production' | 'development' | 'staging' | 'test';

export type ServiceRole =
  | 'core'
  | 'api'
  | 'operator'
  | 'web'
  | 'console'
  | 'docs'
  | 'shell'
  | 'root';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type JobStatus =
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Service endpoint configuration
 */
export interface ServiceEndpoint {
  name: string;
  role: ServiceRole;
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

/**
 * Kernel identity exposed via /v1/sys/identity
 */
export interface KernelIdentity {
  service: string;         // e.g., "blackroad-os-core"
  role: ServiceRole;       // e.g., "core", "api", "operator"
  version: string;         // e.g., "1.0.0"
  environment: Environment; // "production" | "development"
  dns: {
    cloudflare: string;    // Public DNS
    railway: string;       // Railway URL
    internal: string;      // Internal DNS
  };
  runtime: {
    railwayHost: string;   // RAILWAY_STATIC_URL
    internalHost: string;  // service.railway.internal
    port: number;          // Service port
    pid: number;           // Process ID
    uptime: number;        // Process uptime (seconds)
  };
  health: {
    status: HealthStatus;
    uptime: number;        // Service uptime (seconds)
    lastCheck: string;     // ISO timestamp
  };
  capabilities: string[];  // ["rpc", "events", "jobs", "state"]
}

/**
 * Extended health check response
 */
export interface HealthCheck {
  status: HealthStatus;
  timestamp: string;       // ISO timestamp
  uptime: number;          // Seconds
  memory: {
    rss: number;           // Resident Set Size (bytes)
    heapTotal: number;     // Total heap (bytes)
    heapUsed: number;      // Used heap (bytes)
    external: number;      // External memory (bytes)
  };
  checks: {
    database?: HealthCheckResult;
    redis?: HealthCheckResult;
    dependencies?: HealthCheckResult;
    [key: string]: HealthCheckResult | undefined;
  };
}

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down';
  message?: string;
  latency?: number;        // Milliseconds
}

/**
 * Version information
 */
export interface VersionInfo {
  version: string;         // Package version
  service: string;         // Service name
  commit?: string;         // Git commit hash
  buildTime?: string;      // ISO timestamp
  nodeVersion: string;     // Node.js version
  environment: Environment;
}

/**
 * Configuration object
 */
export interface KernelConfig {
  service: {
    name: string;
    role: ServiceRole;
    version: string;
    environment: Environment;
    port: number;
  };
  railway: {
    staticUrl?: string;
    environment?: string;
    projectId?: string;
  };
  urls: {
    operator: string;
    core: string;
    api: string;
    console: string;
    docs: string;
    web: string;
    os: string;
  };
  internalUrls: {
    operator: string;
    core: string;
    api: string;
    console: string;
    docs: string;
    web: string;
  };
  features: {
    rpc: boolean;
    events: boolean;
    jobs: boolean;
    state: boolean;
  };
}

/**
 * Log entry
 */
export interface LogEntry {
  id: string;              // UUID
  timestamp: string;       // ISO timestamp
  level: LogLevel;
  message: string;
  service: string;
  meta?: Record<string, any>;
}

/**
 * Metric entry
 */
export interface MetricEntry {
  id: string;              // UUID
  timestamp: string;       // ISO timestamp
  name: string;            // Metric name (e.g., "http.request.duration")
  value: number;
  unit?: string;           // e.g., "ms", "bytes", "count"
  tags?: Record<string, string>;
}

/**
 * RPC request
 */
export interface RPCRequest {
  method: string;          // Method name
  params?: Record<string, any>;
  timeout?: number;        // Milliseconds
}

/**
 * RPC response
 */
export interface RPCResponse<T = any> {
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Event
 */
export interface Event {
  id: string;              // UUID
  event: string;           // Event name
  timestamp: string;       // ISO timestamp
  source: string;          // Service that emitted
  data?: Record<string, any>;
}

/**
 * Job definition
 */
export interface Job {
  id: string;              // UUID
  name: string;            // Job name
  params?: Record<string, any>;
  schedule?: string;       // Cron expression (optional)
  status: JobStatus;
  createdAt: string;       // ISO timestamp
  startedAt?: string;      // ISO timestamp
  completedAt?: string;    // ISO timestamp
  result?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * State entry
 */
export interface StateEntry {
  key: string;
  value: any;
  version: number;         // Optimistic locking
  updatedAt: string;       // ISO timestamp
}

/**
 * API Response wrapper
 */
export interface APIResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}
