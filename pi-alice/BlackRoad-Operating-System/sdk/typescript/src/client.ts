/**
 * Main BlackRoad SDK client
 */

import type { AxiosInstance } from 'axios';
import type { BlackRoadClientConfig } from './types';
import { createHttpClient } from './utils/http';
import { AuthClient } from './auth';
import { AgentsClient } from './agents';
import { BlockchainClient } from './blockchain';

/**
 * BlackRoad SDK client
 *
 * @example
 * ```typescript
 * import { BlackRoadClient } from '@blackroad/sdk';
 *
 * const client = new BlackRoadClient({
 *   apiKey: 'your-api-key',
 * });
 *
 * // Use the client
 * const agents = await client.agents.list();
 * const balance = await client.blockchain.getBalance('0x...');
 * ```
 */
export class BlackRoadClient {
  /** HTTP client instance */
  private httpClient: AxiosInstance;

  /** Authentication client */
  public readonly auth: AuthClient;

  /** Agents client */
  public readonly agents: AgentsClient;

  /** Blockchain client */
  public readonly blockchain: BlockchainClient;

  /** Client configuration */
  private config: BlackRoadClientConfig;

  /**
   * Creates a new BlackRoad client
   *
   * @param config - Client configuration
   *
   * @example
   * ```typescript
   * // With API key
   * const client = new BlackRoadClient({
   *   apiKey: 'your-api-key',
   * });
   *
   * // With JWT token
   * const client = new BlackRoadClient({
   *   token: 'your-jwt-token',
   * });
   *
   * // With custom configuration
   * const client = new BlackRoadClient({
   *   apiKey: 'your-api-key',
   *   baseURL: 'https://api.blackroad.io',
   *   timeout: 60000,
   *   maxRetries: 5,
   *   debug: true,
   * });
   * ```
   */
  constructor(config: BlackRoadClientConfig = {}) {
    this.config = {
      baseURL: 'https://api.blackroad.io',
      timeout: 30000,
      maxRetries: 3,
      debug: false,
      network: 'mainnet',
      ...config,
    };

    // Create HTTP client
    this.httpClient = createHttpClient(this.config);

    // Initialize sub-clients
    this.auth = new AuthClient(this.httpClient);
    this.agents = new AgentsClient(this.httpClient);
    this.blockchain = new BlockchainClient(this.httpClient);
  }

  /**
   * Gets the current configuration
   *
   * @returns Client configuration (sensitive data like API keys are excluded)
   */
  getConfig(): Omit<BlackRoadClientConfig, 'apiKey' | 'token'> {
    const { apiKey, token, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Updates the authentication token
   *
   * @param token - New JWT token
   *
   * @example
   * ```typescript
   * client.setAuthToken('new-jwt-token');
   * ```
   */
  setAuthToken(token: string): void {
    this.config.token = token;
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Updates the API key
   *
   * @param apiKey - New API key
   *
   * @example
   * ```typescript
   * client.setApiKey('new-api-key');
   * ```
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.httpClient.defaults.headers.common['X-API-Key'] = apiKey;
  }

  /**
   * Clears authentication credentials
   *
   * @example
   * ```typescript
   * client.clearAuth();
   * ```
   */
  clearAuth(): void {
    delete this.config.apiKey;
    delete this.config.token;
    delete this.httpClient.defaults.headers.common['Authorization'];
    delete this.httpClient.defaults.headers.common['X-API-Key'];
  }

  /**
   * Gets the base URL for the API
   *
   * @returns Base URL
   */
  getBaseURL(): string {
    return this.config.baseURL || 'https://api.blackroad.io';
  }

  /**
   * Updates the base URL
   *
   * @param baseURL - New base URL
   *
   * @example
   * ```typescript
   * client.setBaseURL('https://testnet.blackroad.io');
   * ```
   */
  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.httpClient.defaults.baseURL = baseURL;
  }

  /**
   * Checks if the client is authenticated
   *
   * @returns True if the client has authentication credentials
   */
  isAuthenticated(): boolean {
    return !!(this.config.apiKey || this.config.token);
  }

  /**
   * Gets the current network
   *
   * @returns Network name
   */
  getNetwork(): string {
    return this.config.network || 'mainnet';
  }

  /**
   * Switches to a different network
   *
   * @param network - Network to switch to
   *
   * @example
   * ```typescript
   * client.setNetwork('testnet');
   * ```
   */
  setNetwork(network: 'mainnet' | 'testnet' | 'devnet'): void {
    this.config.network = network;
    this.httpClient.defaults.headers.common['X-Network'] = network;
  }

  /**
   * Enables or disables debug logging
   *
   * @param enabled - Whether to enable debug logging
   *
   * @example
   * ```typescript
   * client.setDebug(true);
   * ```
   */
  setDebug(enabled: boolean): void {
    this.config.debug = enabled;
  }

  /**
   * Tests the connection to the API
   *
   * @returns True if the connection is successful
   *
   * @example
   * ```typescript
   * const isOnline = await client.ping();
   * if (isOnline) {
   *   console.log('Connected to BlackRoad API');
   * }
   * ```
   */
  async ping(): Promise<boolean> {
    try {
      await this.httpClient.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the API version
   *
   * @returns API version string
   *
   * @example
   * ```typescript
   * const version = await client.getVersion();
   * console.log('API version:', version);
   * ```
   */
  async getVersion(): Promise<string> {
    const response = await this.httpClient.get<{ version: string }>('/version');
    return response.data.version;
  }
}
