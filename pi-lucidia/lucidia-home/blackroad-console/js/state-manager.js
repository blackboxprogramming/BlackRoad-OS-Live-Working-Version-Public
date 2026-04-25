/**
 * BlackRoad State Manager
 * Reactive state management with real-time sync
 */

class StateManager {
  constructor() {
    this.state = {
      user: null,
      vault: {
        tokens: [],
        cliTools: [],
        stats: null
      },
      agents: [],
      memories: [],
      health: {
        nodes: [],
        stats: null
      },
      ui: {
        loading: false,
        error: null,
        notifications: []
      }
    };

    this.listeners = new Map();
    this.api = window.BlackRoadAPI;

    // Set up WebSocket listeners for real-time updates
    this.setupRealtimeSync();
  }

  // ========================================
  // State Management
  // ========================================

  get(path) {
    const keys = path.split('.');
    let value = this.state;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.state;

    for (const key of keys) {
      if (!target[key]) target[key] = {};
      target = target[key];
    }

    target[lastKey] = value;
    this.notify(path, value);
  }

  update(path, updater) {
    const current = this.get(path);
    const updated = typeof updater === 'function' ? updater(current) : updater;
    this.set(path, updated);
  }

  // ========================================
  // Subscriptions
  // ========================================

  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  notify(path, value) {
    // Notify exact path listeners
    const exactListeners = this.listeners.get(path);
    if (exactListeners) {
      exactListeners.forEach(callback => {
        try {
          callback(value);
        } catch (err) {
          console.error('State listener error:', err);
        }
      });
    }

    // Notify parent path listeners (e.g., 'vault' when 'vault.tokens' changes)
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      const parentListeners = this.listeners.get(parentPath);
      if (parentListeners) {
        const parentValue = this.get(parentPath);
        parentListeners.forEach(callback => {
          try {
            callback(parentValue);
          } catch (err) {
            console.error('State listener error:', err);
          }
        });
      }
    }
  }

  // ========================================
  // Real-time Sync
  // ========================================

  setupRealtimeSync() {
    // Agent updates
    this.api.onWebSocketMessage('agent_update', (data) => {
      console.log('Agent update received:', data);
      const agents = this.get('agents');
      const index = agents.findIndex(a => a.id === data.id);

      if (index >= 0) {
        agents[index] = { ...agents[index], ...data };
      } else {
        agents.push(data);
      }

      this.set('agents', [...agents]);
      this.notify('ui.notifications', this.addNotification({
        type: 'info',
        title: 'Agent Updated',
        message: `${data.name} status changed to ${data.status}`,
        timestamp: Date.now()
      }));
    });

    // Health updates
    this.api.onWebSocketMessage('health_update', (data) => {
      console.log('Health update received:', data);
      const nodes = this.get('health.nodes');
      const index = nodes.findIndex(n => n.id === data.id);

      if (index >= 0) {
        nodes[index] = { ...nodes[index], ...data };
      } else {
        nodes.push(data);
      }

      this.set('health.nodes', [...nodes]);
    });

    // Memory updates
    this.api.onWebSocketMessage('memory_update', (data) => {
      console.log('Memory update received:', data);
      const memories = this.get('memories');
      const index = memories.findIndex(m => m.id === data.id);

      if (index >= 0) {
        memories[index] = { ...memories[index], ...data };
      } else {
        memories.push(data);
      }

      this.set('memories', [...memories]);
      this.notify('ui.notifications', this.addNotification({
        type: 'info',
        title: 'Memory Updated',
        message: `Memory "${data.title}" was updated`,
        timestamp: Date.now()
      }));
    });

    // Vault updates
    this.api.onWebSocketMessage('vault_update', (data) => {
      console.log('Vault update received:', data);
      const tokens = this.get('vault.tokens');
      const index = tokens.findIndex(t => t.id === data.id);

      if (index >= 0) {
        tokens[index] = { ...tokens[index], ...data };
      } else {
        tokens.push(data);
      }

      this.set('vault.tokens', [...tokens]);
      this.notify('ui.notifications', this.addNotification({
        type: 'success',
        title: 'Token Rotated',
        message: `${data.name} token was rotated successfully`,
        timestamp: Date.now()
      }));
    });
  }

  // ========================================
  // Data Loading
  // ========================================

  async loadUser() {
    this.set('ui.loading', true);
    try {
      const user = await this.api.getCurrentUser();
      this.set('user', user);
      return user;
    } catch (err) {
      this.set('ui.error', err.message);
      throw err;
    } finally {
      this.set('ui.loading', false);
    }
  }

  async loadVaultData() {
    this.set('ui.loading', true);
    try {
      const [tokens, cliTools, stats] = await Promise.all([
        this.api.getVaultTokens(),
        this.api.getCLITools(),
        this.api.getVaultStats()
      ]);

      this.set('vault.tokens', tokens);
      this.set('vault.cliTools', cliTools);
      this.set('vault.stats', stats);

      return { tokens, cliTools, stats };
    } catch (err) {
      this.set('ui.error', err.message);
      throw err;
    } finally {
      this.set('ui.loading', false);
    }
  }

  async loadAgents() {
    this.set('ui.loading', true);
    try {
      const agents = await this.api.getAgents();
      this.set('agents', agents);
      return agents;
    } catch (err) {
      this.set('ui.error', err.message);
      throw err;
    } finally {
      this.set('ui.loading', false);
    }
  }

  async loadMemories(filters = {}) {
    this.set('ui.loading', true);
    try {
      const memories = await this.api.getMemories(filters);
      this.set('memories', memories);
      return memories;
    } catch (err) {
      this.set('ui.error', err.message);
      throw err;
    } finally {
      this.set('ui.loading', false);
    }
  }

  async loadHealthData() {
    this.set('ui.loading', true);
    try {
      const [nodes, stats] = await Promise.all([
        this.api.getHealthNodes(),
        this.api.getHealthStats()
      ]);

      this.set('health.nodes', nodes);
      this.set('health.stats', stats);

      return { nodes, stats };
    } catch (err) {
      this.set('ui.error', err.message);
      throw err;
    } finally {
      this.set('ui.loading', false);
    }
  }

  // ========================================
  // Actions
  // ========================================

  async createVaultToken(tokenData) {
    try {
      const token = await this.api.createVaultToken(tokenData);
      const tokens = this.get('vault.tokens');
      this.set('vault.tokens', [...tokens, token]);
      this.addNotification({
        type: 'success',
        title: 'Token Created',
        message: `${tokenData.name} was created successfully`,
        timestamp: Date.now()
      });
      return token;
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  async rotateVaultToken(id) {
    try {
      const token = await this.api.rotateVaultToken(id);
      const tokens = this.get('vault.tokens');
      const index = tokens.findIndex(t => t.id === id);
      if (index >= 0) {
        tokens[index] = token;
        this.set('vault.tokens', [...tokens]);
      }
      this.addNotification({
        type: 'success',
        title: 'Token Rotated',
        message: `Token was rotated successfully`,
        timestamp: Date.now()
      });
      return token;
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Rotation Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  async deleteVaultToken(id) {
    try {
      await this.api.deleteVaultToken(id);
      const tokens = this.get('vault.tokens');
      this.set('vault.tokens', tokens.filter(t => t.id !== id));
      this.addNotification({
        type: 'success',
        title: 'Token Deleted',
        message: 'Token was deleted successfully',
        timestamp: Date.now()
      });
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  async createAgent(agentData) {
    try {
      const agent = await this.api.createAgent(agentData);
      const agents = this.get('agents');
      this.set('agents', [...agents, agent]);
      this.addNotification({
        type: 'success',
        title: 'Agent Created',
        message: `${agentData.name} was created successfully`,
        timestamp: Date.now()
      });
      return agent;
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  async updateAgent(id, updates) {
    try {
      const agent = await this.api.updateAgent(id, updates);
      const agents = this.get('agents');
      const index = agents.findIndex(a => a.id === id);
      if (index >= 0) {
        agents[index] = agent;
        this.set('agents', [...agents]);
      }
      return agent;
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  async deleteAgent(id) {
    try {
      await this.api.deleteAgent(id);
      const agents = this.get('agents');
      this.set('agents', agents.filter(a => a.id !== id));
      this.addNotification({
        type: 'success',
        title: 'Agent Deleted',
        message: 'Agent was deleted successfully',
        timestamp: Date.now()
      });
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  async createMemory(memoryData) {
    try {
      const memory = await this.api.createMemory(memoryData);
      const memories = this.get('memories');
      this.set('memories', [...memories, memory]);
      this.addNotification({
        type: 'success',
        title: 'Memory Created',
        message: `"${memoryData.title}" was created successfully`,
        timestamp: Date.now()
      });
      return memory;
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  async deleteMemory(id) {
    try {
      await this.api.deleteMemory(id);
      const memories = this.get('memories');
      this.set('memories', memories.filter(m => m.id !== id));
      this.addNotification({
        type: 'success',
        title: 'Memory Deleted',
        message: 'Memory was deleted successfully',
        timestamp: Date.now()
      });
    } catch (err) {
      this.addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message,
        timestamp: Date.now()
      });
      throw err;
    }
  }

  // ========================================
  // Notifications
  // ========================================

  addNotification(notification) {
    const notifications = this.get('ui.notifications');
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification
    };
    this.set('ui.notifications', [...notifications, newNotification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 5000);

    return newNotification;
  }

  removeNotification(id) {
    const notifications = this.get('ui.notifications');
    this.set('ui.notifications', notifications.filter(n => n.id !== id));
  }

  clearNotifications() {
    this.set('ui.notifications', []);
  }

  // ========================================
  // UI Helpers
  // ========================================

  setLoading(loading) {
    this.set('ui.loading', loading);
  }

  setError(error) {
    this.set('ui.error', error);
    if (error) {
      this.addNotification({
        type: 'error',
        title: 'Error',
        message: error,
        timestamp: Date.now()
      });
    }
  }

  clearError() {
    this.set('ui.error', null);
  }

  // ========================================
  // Persistence
  // ========================================

  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(`blackroad_${key}`, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(`blackroad_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
      return null;
    }
  }

  clearLocalStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('blackroad_') && !key.includes('token') && !key.includes('user')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Create global instance
window.StateManager = new StateManager();
