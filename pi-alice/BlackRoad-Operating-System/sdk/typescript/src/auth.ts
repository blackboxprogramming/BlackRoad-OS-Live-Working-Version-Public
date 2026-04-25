/**
 * Authentication client for BlackRoad SDK
 */

import type { AxiosInstance } from 'axios';
import type {
  User,
  AuthResponse,
  RefreshTokenResponse,
  UserCredentials,
  RegisterParams,
  UpdateProfileParams,
} from './types';
import { get, post, patch, setAuthToken } from './utils/http';

/**
 * Handles authentication operations
 */
export class AuthClient {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Registers a new user
   *
   * @param params - Registration parameters
   * @returns Authentication response with tokens and user data
   *
   * @example
   * ```typescript
   * const auth = await client.auth.register({
   *   email: 'user@example.com',
   *   password: 'secure-password',
   *   display_name: 'John Doe',
   * });
   * ```
   */
  async register(params: RegisterParams): Promise<AuthResponse> {
    return post<AuthResponse>(this.httpClient, '/auth/register', params);
  }

  /**
   * Logs in a user
   *
   * @param credentials - User credentials
   * @returns Authentication response with tokens and user data
   *
   * @example
   * ```typescript
   * const auth = await client.auth.login({
   *   email: 'user@example.com',
   *   password: 'secure-password',
   * });
   * ```
   */
  async login(credentials: UserCredentials): Promise<AuthResponse> {
    const response = await post<AuthResponse>(this.httpClient, '/auth/login', credentials);

    // Update the client's auth token
    setAuthToken(this.httpClient, response.access_token);

    return response;
  }

  /**
   * Logs out the current user
   *
   * @example
   * ```typescript
   * await client.auth.logout();
   * ```
   */
  async logout(): Promise<void> {
    await post<void>(this.httpClient, '/auth/logout');
  }

  /**
   * Refreshes the authentication token
   *
   * @param refreshToken - The refresh token
   * @returns New tokens
   *
   * @example
   * ```typescript
   * const tokens = await client.auth.refreshToken('refresh-token');
   * ```
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await post<RefreshTokenResponse>(this.httpClient, '/auth/refresh', {
      refresh_token: refreshToken,
    });

    // Update the client's auth token
    setAuthToken(this.httpClient, response.access_token);

    return response;
  }

  /**
   * Gets the current authenticated user
   *
   * @returns Current user
   *
   * @example
   * ```typescript
   * const user = await client.auth.getCurrentUser();
   * console.log(user.email);
   * ```
   */
  async getCurrentUser(): Promise<User> {
    return get<User>(this.httpClient, '/auth/me');
  }

  /**
   * Updates the current user's profile
   *
   * @param params - Profile update parameters
   * @returns Updated user
   *
   * @example
   * ```typescript
   * const user = await client.auth.updateProfile({
   *   display_name: 'Jane Doe',
   *   avatar_url: 'https://example.com/avatar.jpg',
   * });
   * ```
   */
  async updateProfile(params: UpdateProfileParams): Promise<User> {
    return patch<User>(this.httpClient, '/auth/me', params);
  }

  /**
   * Requests a password reset
   *
   * @param email - User's email address
   *
   * @example
   * ```typescript
   * await client.auth.requestPasswordReset('user@example.com');
   * ```
   */
  async requestPasswordReset(email: string): Promise<void> {
    await post<void>(this.httpClient, '/auth/password-reset', { email });
  }

  /**
   * Resets password using a reset token
   *
   * @param token - Password reset token
   * @param newPassword - New password
   *
   * @example
   * ```typescript
   * await client.auth.resetPassword('reset-token', 'new-password');
   * ```
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await post<void>(this.httpClient, '/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
    });
  }

  /**
   * Changes the current user's password
   *
   * @param currentPassword - Current password
   * @param newPassword - New password
   *
   * @example
   * ```typescript
   * await client.auth.changePassword('old-password', 'new-password');
   * ```
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await post<void>(this.httpClient, '/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /**
   * Verifies an email address using a verification token
   *
   * @param token - Email verification token
   *
   * @example
   * ```typescript
   * await client.auth.verifyEmail('verification-token');
   * ```
   */
  async verifyEmail(token: string): Promise<void> {
    await post<void>(this.httpClient, '/auth/verify-email', { token });
  }

  /**
   * Resends the email verification
   *
   * @example
   * ```typescript
   * await client.auth.resendVerificationEmail();
   * ```
   */
  async resendVerificationEmail(): Promise<void> {
    await post<void>(this.httpClient, '/auth/verify-email/resend');
  }
}
