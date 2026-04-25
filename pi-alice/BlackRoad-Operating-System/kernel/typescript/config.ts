/**
 * BlackRoad OS - Kernel Configuration
 *
 * Environment-aware configuration management.
 * Loads and validates environment variables.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { KernelConfig, Environment, ServiceRole } from './types';

/**
 * Load kernel configuration from environment variables
 */
export function loadKernelConfig(): KernelConfig {
  const environment = (process.env.ENVIRONMENT as Environment) || 'development';
  const serviceName = process.env.SERVICE_NAME || 'unknown';
  const serviceRole = (process.env.SERVICE_ROLE as ServiceRole) || 'api';
  const version = process.env.npm_package_version || process.env.VERSION || '1.0.0';
  const port = parseInt(process.env.PORT || '8000', 10);

  return {
    service: {
      name: serviceName,
      role: serviceRole,
      version,
      environment,
      port,
    },
    railway: {
      staticUrl: process.env.RAILWAY_STATIC_URL,
      environment: process.env.RAILWAY_ENVIRONMENT,
      projectId: process.env.RAILWAY_PROJECT_ID,
    },
    urls: {
      operator: process.env.OPERATOR_URL || 'https://operator.blackroad.systems',
      core: process.env.CORE_API_URL || 'https://core.blackroad.systems',
      api: process.env.PUBLIC_API_URL || 'https://api.blackroad.systems',
      console: process.env.CONSOLE_URL || 'https://console.blackroad.systems',
      docs: process.env.DOCS_URL || 'https://docs.blackroad.systems',
      web: process.env.WEB_URL || 'https://web.blackroad.systems',
      os: process.env.OS_URL || 'https://os.blackroad.systems',
    },
    internalUrls: {
      operator:
        process.env.OPERATOR_INTERNAL_URL ||
        'http://blackroad-os-operator.railway.internal:8001',
      core:
        process.env.CORE_API_INTERNAL_URL ||
        'http://blackroad-os-core.railway.internal:8000',
      api:
        process.env.PUBLIC_API_INTERNAL_URL ||
        'http://blackroad-os-api.railway.internal:8000',
      console:
        process.env.CONSOLE_INTERNAL_URL ||
        'http://blackroad-os-prism-console.railway.internal:8000',
      docs:
        process.env.DOCS_INTERNAL_URL ||
        'http://blackroad-os-docs.railway.internal:8000',
      web:
        process.env.WEB_INTERNAL_URL ||
        'http://blackroad-os-web.railway.internal:8000',
    },
    features: {
      rpc: process.env.ENABLE_RPC !== 'false',
      events: process.env.ENABLE_EVENTS !== 'false',
      jobs: process.env.ENABLE_JOBS !== 'false',
      state: process.env.ENABLE_STATE !== 'false',
    },
  };
}

/**
 * Validate required environment variables
 */
export function validateConfig(config: KernelConfig): void {
  const errors: string[] = [];

  if (!config.service.name || config.service.name === 'unknown') {
    errors.push('SERVICE_NAME is required');
  }

  if (!config.service.role) {
    errors.push('SERVICE_ROLE is required');
  }

  if (config.service.port < 1 || config.service.port > 65535) {
    errors.push(`Invalid PORT: ${config.service.port}`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Global configuration instance
 */
export const kernelConfig: KernelConfig = loadKernelConfig();

/**
 * Validate config on module load
 */
try {
  validateConfig(kernelConfig);
} catch (error) {
  console.error('[Config] Validation failed:', error);
  // Don't exit in case this is imported for testing
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export default kernelConfig;
