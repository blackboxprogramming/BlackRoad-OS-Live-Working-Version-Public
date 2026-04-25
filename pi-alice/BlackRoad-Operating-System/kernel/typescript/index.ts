/**
 * BlackRoad OS - Kernel Module Exports
 *
 * Main entry point for the BlackRoad OS kernel.
 * Import this module to access all kernel functionality.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 *
 * @example
 * ```typescript
 * import { rpc, events, logger, getKernelIdentity } from './kernel';
 *
 * // Get service identity
 * const identity = getKernelIdentity();
 *
 * // Call another service
 * const result = await rpc.call('core', 'getUserById', { id: 123 });
 *
 * // Emit an event
 * await events.emit('user:created', { userId: 123 });
 *
 * // Log a message
 * logger.info('Service started');
 * ```
 */

// Types
export * from './types';

// Service Registry
export {
  SERVICE_REGISTRY,
  getServiceUrl,
  getAllServices,
  getServiceByRole,
  getServicesByRole,
  hasService,
  getService,
  getInternalUrl,
  getPublicUrl,
} from './serviceRegistry';

// Identity
export {
  getKernelIdentity,
  setHealthStatus,
  getUptime,
  clearIdentityCache,
} from './identity';

// Config
export {
  kernelConfig,
  loadKernelConfig,
  validateConfig,
} from './config';

// Logger
export {
  Logger,
  logger,
  createLogger,
  getLogs,
  clearLogs,
} from './logger';

// RPC
export {
  RPCClient,
  rpc,
} from './rpc';

// Events
export {
  EventBus,
  events,
} from './events';

// Jobs
export {
  JobQueue,
  jobQueue,
} from './jobs';

// State
export {
  StateManager,
  state,
} from './state';
