/**
 * Tests for BlackRoadClient
 */

import { BlackRoadClient } from '../src/client';
import { AuthClient } from '../src/auth';
import { AgentsClient } from '../src/agents';
import { BlockchainClient } from '../src/blockchain';

describe('BlackRoadClient', () => {
  describe('constructor', () => {
    it('should create a client with default configuration', () => {
      const client = new BlackRoadClient();

      expect(client).toBeInstanceOf(BlackRoadClient);
      expect(client.auth).toBeInstanceOf(AuthClient);
      expect(client.agents).toBeInstanceOf(AgentsClient);
      expect(client.blockchain).toBeInstanceOf(BlockchainClient);
    });

    it('should create a client with API key', () => {
      const client = new BlackRoadClient({
        apiKey: 'test-api-key',
      });

      expect(client.isAuthenticated()).toBe(true);
    });

    it('should create a client with JWT token', () => {
      const client = new BlackRoadClient({
        token: 'test-jwt-token',
      });

      expect(client.isAuthenticated()).toBe(true);
    });

    it('should create a client with custom configuration', () => {
      const client = new BlackRoadClient({
        baseURL: 'https://custom.api.com',
        timeout: 60000,
        maxRetries: 5,
        debug: true,
      });

      const config = client.getConfig();
      expect(config.baseURL).toBe('https://custom.api.com');
      expect(config.timeout).toBe(60000);
      expect(config.maxRetries).toBe(5);
      expect(config.debug).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should return config without sensitive data', () => {
      const client = new BlackRoadClient({
        apiKey: 'secret-key',
        token: 'secret-token',
        baseURL: 'https://api.test.com',
      });

      const config = client.getConfig();

      expect(config).not.toHaveProperty('apiKey');
      expect(config).not.toHaveProperty('token');
      expect(config.baseURL).toBe('https://api.test.com');
    });
  });

  describe('authentication methods', () => {
    let client: BlackRoadClient;

    beforeEach(() => {
      client = new BlackRoadClient();
    });

    it('should set auth token', () => {
      expect(client.isAuthenticated()).toBe(false);

      client.setAuthToken('new-token');

      expect(client.isAuthenticated()).toBe(true);
    });

    it('should set API key', () => {
      expect(client.isAuthenticated()).toBe(false);

      client.setApiKey('new-api-key');

      expect(client.isAuthenticated()).toBe(true);
    });

    it('should clear authentication', () => {
      client.setAuthToken('test-token');
      expect(client.isAuthenticated()).toBe(true);

      client.clearAuth();

      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('URL methods', () => {
    it('should get base URL', () => {
      const client = new BlackRoadClient({
        baseURL: 'https://test.api.com',
      });

      expect(client.getBaseURL()).toBe('https://test.api.com');
    });

    it('should set base URL', () => {
      const client = new BlackRoadClient();

      client.setBaseURL('https://new.api.com');

      expect(client.getBaseURL()).toBe('https://new.api.com');
    });
  });

  describe('network methods', () => {
    it('should get default network', () => {
      const client = new BlackRoadClient();

      expect(client.getNetwork()).toBe('mainnet');
    });

    it('should set custom network', () => {
      const client = new BlackRoadClient({
        network: 'testnet',
      });

      expect(client.getNetwork()).toBe('testnet');
    });

    it('should switch network', () => {
      const client = new BlackRoadClient();

      client.setNetwork('devnet');

      expect(client.getNetwork()).toBe('devnet');
    });
  });

  describe('debug methods', () => {
    it('should enable debug mode', () => {
      const client = new BlackRoadClient({
        debug: false,
      });

      client.setDebug(true);

      const config = client.getConfig();
      expect(config.debug).toBe(true);
    });

    it('should disable debug mode', () => {
      const client = new BlackRoadClient({
        debug: true,
      });

      client.setDebug(false);

      const config = client.getConfig();
      expect(config.debug).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when not authenticated', () => {
      const client = new BlackRoadClient();

      expect(client.isAuthenticated()).toBe(false);
    });

    it('should return true with API key', () => {
      const client = new BlackRoadClient({
        apiKey: 'test-key',
      });

      expect(client.isAuthenticated()).toBe(true);
    });

    it('should return true with token', () => {
      const client = new BlackRoadClient({
        token: 'test-token',
      });

      expect(client.isAuthenticated()).toBe(true);
    });
  });
});
