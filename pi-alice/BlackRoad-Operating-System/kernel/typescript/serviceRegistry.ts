/**
 * BlackRoad OS - Service Registry
 *
 * Complete, production-accurate service registry for all BlackRoad OS services.
 * This is the single source of truth for service discovery.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { ServiceEndpoint, ServiceRole } from './types';

/**
 * Complete service registry with all production + dev URLs
 */
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
    role: 'shell',
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

/**
 * Get service URL by service name, environment, and URL type
 */
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

/**
 * Get all registered service names
 */
export function getAllServices(): string[] {
  return Object.keys(SERVICE_REGISTRY);
}

/**
 * Get service by role
 */
export function getServiceByRole(role: ServiceRole): ServiceEndpoint | undefined {
  return Object.values(SERVICE_REGISTRY).find((s) => s.role === role);
}

/**
 * Get all services by role
 */
export function getServicesByRole(role: ServiceRole): ServiceEndpoint[] {
  return Object.values(SERVICE_REGISTRY).filter((s) => s.role === role);
}

/**
 * Check if a service exists in the registry
 */
export function hasService(serviceName: string): boolean {
  return serviceName in SERVICE_REGISTRY;
}

/**
 * Get service endpoint configuration
 */
export function getService(serviceName: string): ServiceEndpoint {
  const service = SERVICE_REGISTRY[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return service;
}

/**
 * Get internal URL for inter-service communication
 * Prefers Railway internal DNS for performance
 */
export function getInternalUrl(
  serviceName: string,
  environment: 'production' | 'development' = 'production'
): string {
  return getServiceUrl(serviceName, environment, 'internal');
}

/**
 * Get public URL (Cloudflare DNS)
 */
export function getPublicUrl(
  serviceName: string,
  environment: 'production' | 'development' = 'production'
): string {
  if (environment === 'production') {
    return getServiceUrl(serviceName, environment, 'cloudflare');
  }
  return getServiceUrl(serviceName, environment, 'railway');
}

/**
 * Export for convenience
 */
export default SERVICE_REGISTRY;
