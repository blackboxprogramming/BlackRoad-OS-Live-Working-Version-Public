/**
 * BlackRoad API Client - JavaScript/TypeScript SDK
 * Official JS client for BlackRoad products
 */

interface BlackRoadConfig {
  apiKey: string;
  baseUrl?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Deployment {
  id: string;
  product_id: string;
  environment: string;
  status: string;
  created_at: string;
}

class BlackRoadClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: BlackRoadConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.blackroad.io';
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BlackRoad-JS-SDK/1.0.0',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`BlackRoad API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>('GET', endpoint + queryString);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

class ProductsAPI {
  constructor(private client: BlackRoadClient) {}

  async list(limit: number = 100): Promise<Product[]> {
    return this.client.get<Product[]>('/v1/products', { limit });
  }

  async get(productId: string): Promise<Product> {
    return this.client.get<Product>(`/v1/products/${productId}`);
  }

  async create(data: Partial<Product>): Promise<Product> {
    return this.client.post<Product>('/v1/products', data);
  }
}

class DeploymentsAPI {
  constructor(private client: BlackRoadClient) {}

  async list(): Promise<Deployment[]> {
    return this.client.get<Deployment[]>('/v1/deployments');
  }

  async create(productId: string, environment: string): Promise<Deployment> {
    return this.client.post<Deployment>('/v1/deployments', {
      product_id: productId,
      environment,
    });
  }

  async getStatus(deploymentId: string): Promise<Deployment> {
    return this.client.get<Deployment>(`/v1/deployments/${deploymentId}`);
  }
}

/**
 * Main BlackRoad SDK class
 * 
 * @example
 * ```typescript
 * import { BlackRoad } from '@blackroad/sdk';
 * 
 * const client = new BlackRoad({ apiKey: 'your-api-key' });
 * const products = await client.products.list();
 * const deployment = await client.deployments.create('product-123', 'production');
 * ```
 */
export class BlackRoad {
  private client: BlackRoadClient;
  public products: ProductsAPI;
  public deployments: DeploymentsAPI;

  constructor(config: BlackRoadConfig) {
    this.client = new BlackRoadClient(config);
    this.products = new ProductsAPI(this.client);
    this.deployments = new DeploymentsAPI(this.client);
  }
}

export default BlackRoad;
