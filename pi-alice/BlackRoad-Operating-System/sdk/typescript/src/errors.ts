/**
 * Custom error classes for BlackRoad SDK
 */

/**
 * Base error class for all BlackRoad SDK errors
 */
export class BlackRoadError extends Error {
  /** HTTP status code if applicable */
  public statusCode?: number;

  /** Additional error details */
  public details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'BlackRoadError';
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when authentication fails
 */
export class AuthenticationError extends BlackRoadError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when authorization fails (authenticated but not permitted)
 */
export class AuthorizationError extends BlackRoadError {
  constructor(message: string = 'Permission denied', details?: unknown) {
    super(message, 403, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Thrown when input validation fails
 */
export class ValidationError extends BlackRoadError {
  /** Validation error details */
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400, errors);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends BlackRoadError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown when there's a conflict with the current state
 */
export class ConflictError extends BlackRoadError {
  constructor(message: string = 'Resource conflict', details?: unknown) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends BlackRoadError {
  /** When the rate limit resets */
  public retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when there's a network or connection error
 */
export class NetworkError extends BlackRoadError {
  constructor(message: string, details?: unknown) {
    super(message, undefined, details);
    this.name = 'NetworkError';
  }
}

/**
 * Thrown when the server returns an error
 */
export class ServerError extends BlackRoadError {
  constructor(message: string = 'Internal server error', statusCode: number = 500, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'ServerError';
  }
}

/**
 * Thrown when request times out
 */
export class TimeoutError extends BlackRoadError {
  constructor(message: string = 'Request timeout', details?: unknown) {
    super(message, 408, details);
    this.name = 'TimeoutError';
  }
}

/**
 * Maps HTTP status codes to appropriate error classes
 */
export function createErrorFromResponse(
  statusCode: number,
  message: string,
  data?: unknown
): BlackRoadError {
  switch (statusCode) {
    case 400:
      if (data && typeof data === 'object' && 'errors' in data) {
        return new ValidationError(message, data.errors as Record<string, string[]>);
      }
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message, data);
    case 403:
      return new AuthorizationError(message, data);
    case 404:
      return new NotFoundError(message, data);
    case 408:
      return new TimeoutError(message, data);
    case 409:
      return new ConflictError(message, data);
    case 429:
      const retryAfter = data && typeof data === 'object' && 'retry_after' in data
        ? (data.retry_after as number)
        : undefined;
      return new RateLimitError(message, retryAfter);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, statusCode, data);
    default:
      return new BlackRoadError(message, statusCode, data);
  }
}
