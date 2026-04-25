/**
 * BlackRoad OS - Kernel Identity
 *
 * Service self-identification and metadata.
 * Exposed via /v1/sys/identity endpoint.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { KernelIdentity, Environment, ServiceRole, HealthStatus } from './types';
import { SERVICE_REGISTRY } from './serviceRegistry';

let cachedIdentity: KernelIdentity | null = null;
const bootTime = Date.now();

/**
 * Get kernel identity for this service
 */
export function getKernelIdentity(): KernelIdentity {
  if (cachedIdentity) {
    // Update dynamic fields
    cachedIdentity.runtime.uptime = process.uptime();
    cachedIdentity.health.uptime = (Date.now() - bootTime) / 1000;
    cachedIdentity.health.lastCheck = new Date().toISOString();
    return cachedIdentity;
  }

  const serviceName = process.env.SERVICE_NAME || 'unknown';
  const serviceRole = (process.env.SERVICE_ROLE as ServiceRole) || 'api';
  const environment = (process.env.ENVIRONMENT as Environment) || 'development';
  const version = process.env.npm_package_version || process.env.VERSION || '1.0.0';

  const service = SERVICE_REGISTRY[serviceRole];
  if (!service) {
    console.warn(`[Identity] Service role '${serviceRole}' not found in registry`);
  }

  const envConfig = service
    ? environment === 'production'
      ? service.production
      : service.development
    : null;

  cachedIdentity = {
    service: serviceName,
    role: serviceRole,
    version,
    environment,
    dns: {
      cloudflare: envConfig?.cloudflare || '',
      railway: envConfig?.railway || '',
      internal: envConfig?.internal || '',
    },
    runtime: {
      railwayHost: process.env.RAILWAY_STATIC_URL || envConfig?.railway || '',
      internalHost: envConfig?.internal || '',
      port: service?.port || parseInt(process.env.PORT || '8000', 10),
      pid: process.pid,
      uptime: process.uptime(),
    },
    health: {
      status: 'healthy' as HealthStatus,
      uptime: (Date.now() - bootTime) / 1000,
      lastCheck: new Date().toISOString(),
    },
    capabilities: ['rpc', 'events', 'jobs', 'state'],
  };

  return cachedIdentity;
}

/**
 * Update health status
 */
export function setHealthStatus(status: HealthStatus): void {
  if (cachedIdentity) {
    cachedIdentity.health.status = status;
    cachedIdentity.health.lastCheck = new Date().toISOString();
  }
}

/**
 * Get service uptime in seconds
 */
export function getUptime(): number {
  return (Date.now() - bootTime) / 1000;
}

/**
 * Clear cached identity (useful for tests)
 */
export function clearIdentityCache(): void {
  cachedIdentity = null;
}
