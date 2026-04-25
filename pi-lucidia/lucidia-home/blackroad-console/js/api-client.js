/**
 * BlackRoad Console API Client
 * Unified API integration layer for all frontend pages
 */

class BlackRoadAPI {
  constructor() {
    this.baseURL = window.location.origin + '/api';
    this.wsURL = window.location.origin.replace('http', 'ws');
    this.token = localStorage.getItem('blackroad_token');
    this.user = JSON.parse(localStorage.getItem('blackroad_user') || 'null');
    this.ws = null;
    this.wsHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // ========================================
  // Authentication
  // ========================================

  isAuthenticated() {
    return !!this.token;
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      throw new Error('Authentication required');
    }
  }

  async register(username, email, password, fullName) {
    const res = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name: fullName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('blackroad_token', data.token);
    localStorage.setItem('blackroad_user', JSON.stringify(data.user));

    return data;
  }

  async login(username, password) {
    const res = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('blackroad_token', data.token);
    localStorage.setItem('blackroad_user', JSON.stringify(data.user));

    // Connect WebSocket after successful login
    this.connectWebSocket();

    return data;
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    this.token = null;
    this.user = null;
    localStorage.removeItem('blackroad_token');
    localStorage.removeItem('blackroad_user');

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    window.location.href = '/login.html';
  }

  async getCurrentUser() {
    const res = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      if (res.status === 401) {
        this.logout();
        throw new Error('Session expired');
      }
      throw new Error('Failed to get user');
    }
    const data = await res.json();
    this.user = data;
    localStorage.setItem('blackroad_user', JSON.stringify(data));
    return data;
  }

  // ========================================
  // Token Vault
  // ========================================

  async getVaultTokens() {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/tokens`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch tokens');
    return res.json();
  }

  async getVaultToken(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/tokens/${id}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch token');
    return res.json();
  }

  async createVaultToken(tokenData) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/tokens`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(tokenData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create token');
    }
    return res.json();
  }

  async updateVaultToken(id, updates) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/tokens/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update token');
    return res.json();
  }

  async rotateVaultToken(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/tokens/${id}/rotate`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to rotate token');
    return res.json();
  }

  async deleteVaultToken(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/tokens/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete token');
    return res.json();
  }

  async getVaultStats() {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/stats`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }

  async getCLITools() {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/vault/cli-tools`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch CLI tools');
    return res.json();
  }

  // ========================================
  // Agents
  // ========================================

  async getAgents() {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/agents`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  }

  async getAgent(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/agents/${id}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch agent');
    return res.json();
  }

  async createAgent(agentData) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/agents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(agentData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create agent');
    }
    return res.json();
  }

  async updateAgent(id, updates) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/agents/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update agent');
    return res.json();
  }

  async addAgentMetrics(id, metrics) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/agents/${id}/metrics`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(metrics)
    });
    if (!res.ok) throw new Error('Failed to add metrics');
    return res.json();
  }

  async deleteAgent(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/agents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete agent');
    return res.json();
  }

  // ========================================
  // Memory
  // ========================================

  async getMemories(filters = {}) {
    this.requireAuth();
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.search) params.set('search', filters.search);

    const url = `${this.baseURL}/memory${params.toString() ? '?' + params : ''}`;
    const res = await fetch(url, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  }

  async getMemory(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/memory/${id}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch memory');
    return res.json();
  }

  async createMemory(memoryData) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/memory`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(memoryData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create memory');
    }
    return res.json();
  }

  async updateMemory(id, updates) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/memory/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update memory');
    return res.json();
  }

  async deleteMemory(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/memory/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete memory');
    return res.json();
  }

  async getMemoryGraph() {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/memory/graph/data`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch memory graph');
    return res.json();
  }

  // ========================================
  // Health Monitoring
  // ========================================

  async getHealthNodes() {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/health/nodes`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch health nodes');
    return res.json();
  }

  async registerHealthNode(nodeData) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/health/nodes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(nodeData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to register node');
    }
    return res.json();
  }

  async sendHeartbeat(id, healthData) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/health/nodes/${id}/heartbeat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(healthData)
    });
    if (!res.ok) throw new Error('Failed to send heartbeat');
    return res.json();
  }

  async getHealthStats() {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/health/stats`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch health stats');
    return res.json();
  }

  async removeHealthNode(id) {
    this.requireAuth();
    const res = await fetch(`${this.baseURL}/health/nodes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to remove node');
    return res.json();
  }

  // ========================================
  // WebSocket Real-time Updates
  // ========================================

  connectWebSocket() {
    if (!this.token) {
      console.warn('Cannot connect WebSocket: not authenticated');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting to WebSocket...');
    this.ws = new WebSocket(this.wsURL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;

      // Authenticate
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: this.token
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);

        // Handle authentication response
        if (message.type === 'auth_success') {
          console.log('WebSocket authenticated successfully');
          return;
        }

        if (message.type === 'auth_error') {
          console.error('WebSocket auth failed:', message.message);
          this.logout();
          return;
        }

        // Dispatch to registered handlers
        const handlers = this.wsHandlers.get(message.type) || [];
        handlers.forEach(handler => {
          try {
            handler(message.data);
          } catch (err) {
            console.error('WebSocket handler error:', err);
          }
        });

        // Also dispatch custom event for global listeners
        window.dispatchEvent(new CustomEvent('blackroad-ws', {
          detail: message
        }));

      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');

      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connectWebSocket(), delay);
      }
    };
  }

  onWebSocketMessage(type, handler) {
    if (!this.wsHandlers.has(type)) {
      this.wsHandlers.set(type, []);
    }
    this.wsHandlers.get(type).push(handler);
  }

  offWebSocketMessage(type, handler) {
    const handlers = this.wsHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  subscribe(channel) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channel
      }));
    }
  }

  unsubscribe(channel) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        channel
      }));
    }
  }

  // ========================================
  // Helpers
  // ========================================

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Format date helpers
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }

  // Storage helpers
  cacheSet(key, value, ttlMinutes = 5) {
    const item = {
      value,
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  }

  cacheGet(key) {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;

    const parsed = JSON.parse(item);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return parsed.value;
  }

  cacheClear(pattern) {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_') && (!pattern || key.includes(pattern))) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Create global instance
window.BlackRoadAPI = new BlackRoadAPI();

// Auto-connect WebSocket if authenticated
if (window.BlackRoadAPI.isAuthenticated()) {
  window.BlackRoadAPI.connectWebSocket();
}

// Auto-redirect to login if on protected page without auth
if (!window.BlackRoadAPI.isAuthenticated()) {
  const publicPages = ['/login.html', '/register.html', '/'];
  const currentPage = window.location.pathname;

  if (!publicPages.includes(currentPage) && currentPage !== '/') {
    console.log('Not authenticated, redirecting to login');
    window.location.href = '/login.html';
  }
}
