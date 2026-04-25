/**
 * Type definitions for BlackRoad SDK
 */

// Re-export all types
export * from './agent';
export * from './blockchain';
export * from './user';

/**
 * SDK configuration options
 */
export interface BlackRoadClientConfig {
  /** API key for authentication */
  apiKey?: string;

  /** JWT token for authentication */
  token?: string;

  /** Base URL for the API (default: https://api.blackroad.io) */
  baseURL?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Number of retry attempts for failed requests (default: 3) */
  maxRetries?: number;

  /** Custom headers to include in all requests */
  headers?: Record<string, string>;

  /** Enable debug logging (default: false) */
  debug?: boolean;

  /** Network to use (default: mainnet) */
  network?: 'mainnet' | 'testnet' | 'devnet';
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Number of results to return */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Results array */
  data: T[];

  /** Total count of items */
  total: number;

  /** Number of items returned */
  count: number;

  /** Offset used */
  offset: number;

  /** Whether there are more results */
  has_more: boolean;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  /** Response data */
  data: T;

  /** Success status */
  success: boolean;

  /** Error message if any */
  message?: string;

  /** Response metadata */
  metadata?: Record<string, unknown>;
}

/**
 * API error response
 */
export interface APIErrorResponse {
  /** Success status (always false) */
  success: false;

  /** Error message */
  message: string;

  /** Error code */
  code?: string;

  /** Validation errors */
  errors?: Record<string, string[]>;

  /** Additional error details */
  details?: unknown;
}
