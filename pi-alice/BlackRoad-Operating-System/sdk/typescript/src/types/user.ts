/**
 * User-related type definitions
 */

/**
 * Represents a user in the BlackRoad system
 */
export interface User {
  /** Unique user identifier */
  id: string;

  /** User's email address */
  email: string;

  /** User's display name */
  display_name?: string;

  /** Avatar URL */
  avatar_url?: string;

  /** User's wallet address */
  wallet_address?: string;

  /** Account creation timestamp */
  created_at: string;

  /** Last update timestamp */
  updated_at: string;

  /** Whether the user's email is verified */
  email_verified: boolean;

  /** User's role */
  role: UserRole;

  /** User's metadata */
  metadata?: Record<string, unknown>;
}

/**
 * User roles in the system
 */
export type UserRole = 'user' | 'admin' | 'developer' | 'agent';

/**
 * Parameters for updating user profile
 */
export interface UpdateProfileParams {
  /** New display name */
  display_name?: string;

  /** New avatar URL */
  avatar_url?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * User authentication credentials
 */
export interface UserCredentials {
  /** Email address */
  email: string;

  /** Password */
  password: string;
}

/**
 * User registration parameters
 */
export interface RegisterParams extends UserCredentials {
  /** Display name */
  display_name?: string;

  /** Optional invite code */
  invite_code?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /** JWT access token */
  access_token: string;

  /** Refresh token */
  refresh_token: string;

  /** Token type (usually "Bearer") */
  token_type: string;

  /** Token expiration time in seconds */
  expires_in: number;

  /** Authenticated user */
  user: User;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  /** New JWT access token */
  access_token: string;

  /** New refresh token */
  refresh_token: string;

  /** Token type */
  token_type: string;

  /** Token expiration time in seconds */
  expires_in: number;
}
