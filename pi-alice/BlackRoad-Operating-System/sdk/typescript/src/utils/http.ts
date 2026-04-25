/**
 * HTTP utilities for making API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import {
  BlackRoadError,
  NetworkError,
  TimeoutError,
  createErrorFromResponse,
} from '../errors';
import type { APIResponse, APIErrorResponse, BlackRoadClientConfig } from '../types';

/**
 * Creates and configures an HTTP client
 */
export function createHttpClient(config: BlackRoadClientConfig): AxiosInstance {
  const {
    baseURL = 'https://api.blackroad.io',
    timeout = 30000,
    maxRetries = 3,
    apiKey,
    token,
    headers = {},
    debug = false,
  } = config;

  // Create axios instance
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  // Add authentication headers
  if (apiKey) {
    client.defaults.headers.common['X-API-Key'] = apiKey;
  } else if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Configure retry logic
  axiosRetry(client, {
    retries: maxRetries,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error: AxiosError) => {
      // Retry on network errors or 5xx server errors
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response?.status !== undefined && error.response.status >= 500)
      );
    },
    onRetry: (retryCount, error, requestConfig) => {
      if (debug) {
        console.log(
          `[BlackRoad SDK] Retry attempt ${retryCount} for ${requestConfig.url}`,
          error.message
        );
      }
    },
  });

  // Request interceptor for logging
  if (debug) {
    client.interceptors.request.use(
      (config) => {
        console.log(`[BlackRoad SDK] ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          params: config.params,
          data: config.data,
        });
        return config;
      },
      (error) => {
        console.error('[BlackRoad SDK] Request error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Response interceptor for logging and error handling
  client.interceptors.response.use(
    (response) => {
      if (debug) {
        console.log(`[BlackRoad SDK] Response from ${response.config.url}:`, {
          status: response.status,
          data: response.data,
        });
      }
      return response;
    },
    (error: AxiosError) => {
      if (debug) {
        console.error('[BlackRoad SDK] Response error:', error);
      }
      throw handleAxiosError(error);
    }
  );

  return client;
}

/**
 * Handles axios errors and converts them to BlackRoad errors
 */
function handleAxiosError(error: AxiosError): BlackRoadError {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new TimeoutError('Request timeout');
    }
    return new NetworkError(
      error.message || 'Network error occurred',
      { originalError: error }
    );
  }

  // HTTP error response
  const { status, data } = error.response;
  const errorData = data as APIErrorResponse;

  const message = errorData?.message || error.message || 'An error occurred';

  return createErrorFromResponse(status, message, errorData);
}

/**
 * Makes a GET request
 */
export async function get<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<APIResponse<T>> = await client.get(url, config);
  return response.data.data;
}

/**
 * Makes a POST request
 */
export async function post<T>(
  client: AxiosInstance,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<APIResponse<T>> = await client.post(url, data, config);
  return response.data.data;
}

/**
 * Makes a PUT request
 */
export async function put<T>(
  client: AxiosInstance,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<APIResponse<T>> = await client.put(url, data, config);
  return response.data.data;
}

/**
 * Makes a PATCH request
 */
export async function patch<T>(
  client: AxiosInstance,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<APIResponse<T>> = await client.patch(url, data, config);
  return response.data.data;
}

/**
 * Makes a DELETE request
 */
export async function del<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<APIResponse<T>> = await client.delete(url, config);
  return response.data.data;
}

/**
 * Updates the authentication token on the client
 */
export function setAuthToken(client: AxiosInstance, token: string): void {
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Removes the authentication token from the client
 */
export function clearAuthToken(client: AxiosInstance): void {
  delete client.defaults.headers.common['Authorization'];
  delete client.defaults.headers.common['X-API-Key'];
}

/**
 * Sets a custom header on the client
 */
export function setHeader(client: AxiosInstance, name: string, value: string): void {
  client.defaults.headers.common[name] = value;
}

/**
 * Removes a custom header from the client
 */
export function removeHeader(client: AxiosInstance, name: string): void {
  delete client.defaults.headers.common[name];
}
