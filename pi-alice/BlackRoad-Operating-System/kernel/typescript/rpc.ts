/**
 * BlackRoad OS - RPC Client
 *
 * Inter-service Remote Procedure Call (RPC) client.
 * Uses Railway internal DNS for optimal performance.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { RPCRequest, RPCResponse, KernelIdentity, Environment } from './types';
import { getInternalUrl, getServiceUrl } from './serviceRegistry';
import { logger } from './logger';
import { kernelConfig } from './config';

/**
 * RPC Client for inter-service communication
 */
export class RPCClient {
  private environment: Environment;
  private timeout: number;

  constructor(environment?: Environment, timeout: number = 10000) {
    this.environment = environment || kernelConfig.service.environment;
    this.timeout = timeout;
  }

  /**
   * Call a remote procedure on another service
   */
  async call<T = any>(
    service: string,
    method: string,
    params?: Record<string, any>,
    timeout?: number
  ): Promise<T> {
    const url = getInternalUrl(service, this.environment);
    const requestTimeout = timeout || this.timeout;

    const requestBody: RPCRequest = {
      method,
      params,
      timeout: requestTimeout,
    };

    logger.debug(`[RPC] Calling ${service}.${method}`, { service, method, params });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      const response = await fetch(`${url}/v1/sys/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Name': kernelConfig.service.name,
          'X-Service-Role': kernelConfig.service.role,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RPC call failed: ${response.status} ${response.statusText}`);
      }

      const data: RPCResponse<T> = await response.json();

      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      logger.debug(`[RPC] Call successful: ${service}.${method}`);
      return data.result as T;
    } catch (error) {
      logger.error(`[RPC] Call failed: ${service}.${method}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get health status of a service
   */
  async getHealth(service: string): Promise<any> {
    const url = getInternalUrl(service, this.environment);

    try {
      const response = await fetch(`${url}/health`, {
        headers: {
          'X-Service-Name': kernelConfig.service.name,
          'X-Service-Role': kernelConfig.service.role,
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      logger.error(`[RPC] Health check failed: ${service}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get identity of a service
   */
  async getIdentity(service: string): Promise<KernelIdentity> {
    const url = getInternalUrl(service, this.environment);

    try {
      const response = await fetch(`${url}/v1/sys/identity`, {
        headers: {
          'X-Service-Name': kernelConfig.service.name,
          'X-Service-Role': kernelConfig.service.role,
        },
      });

      if (!response.ok) {
        throw new Error(`Identity fetch failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      logger.error(`[RPC] Identity fetch failed: ${service}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Ping a service (check if reachable)
   */
  async ping(service: string): Promise<boolean> {
    try {
      await this.getHealth(service);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Global RPC client instance
 */
export const rpc = new RPCClient();

export default rpc;
