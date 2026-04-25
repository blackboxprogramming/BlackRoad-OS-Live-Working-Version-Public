/**
 * BlackRoad Operating System SDK
 *
 * Official TypeScript/JavaScript SDK for the BlackRoad Operating System.
 *
 * @packageDocumentation
 */

// Export main client
export { BlackRoadClient } from './client';

// Export sub-clients
export { AuthClient } from './auth';
export { AgentsClient } from './agents';
export { BlockchainClient } from './blockchain';

// Export all types
export * from './types';

// Export errors
export * from './errors';

// Export utilities
export * from './utils';

// Package version
export const VERSION = '0.1.0';

/**
 * Creates a new BlackRoad client with the given configuration
 *
 * @param config - Client configuration
 * @returns Configured BlackRoad client
 *
 * @example
 * ```typescript
 * import { createClient } from '@blackroad/sdk';
 *
 * const client = createClient({
 *   apiKey: 'your-api-key',
 * });
 * ```
 */
export { BlackRoadClient as createClient };
