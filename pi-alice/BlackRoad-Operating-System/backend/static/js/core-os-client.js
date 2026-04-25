/**
 * BlackRoad Core OS Client
 *
 * JavaScript client for interacting with the Core OS Runtime via the backend API.
 * Provides OS state management, window control, and real-time updates.
 *
 * @version 0.1.0
 */

class CoreOSClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.state = null;
    this.listeners = {};
  }

  /**
   * Get system version information
   * @returns {Promise<Object>} Version info
   */
  async getVersion() {
    const response = await fetch(`${this.baseUrl}/api/system/version`);
    if (!response.ok) {
      throw new Error(`Failed to get version: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get public configuration
   * @returns {Promise<Object>} Public config
   */
  async getPublicConfig() {
    const response = await fetch(`${this.baseUrl}/api/system/config/public`);
    if (!response.ok) {
      throw new Error(`Failed to get config: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get current OS state
   * @returns {Promise<Object>} OS state
   */
  async getOSState() {
    const response = await fetch(`${this.baseUrl}/api/system/os/state`);
    if (!response.ok) {
      throw new Error(`Failed to get OS state: ${response.statusText}`);
    }
    this.state = await response.json();
    this.emit('state:updated', this.state);
    return this.state;
  }

  /**
   * Initialize the OS (get initial state and config)
   * @returns {Promise<Object>} Initialization result
   */
  async initialize() {
    try {
      const [version, config, state] = await Promise.all([
        this.getVersion(),
        this.getPublicConfig(),
        this.getOSState(),
      ]);

      const result = {
        version,
        config,
        state,
        initialized: true,
      };

      this.emit('os:initialized', result);
      return result;
    } catch (error) {
      console.error('Failed to initialize Core OS:', error);
      this.emit('os:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if backend is healthy
   * @returns {Promise<boolean>} Health status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Event listener registration
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  /**
   * Get local OS state (cached)
   * @returns {Object|null} Cached state
   */
  getLocalState() {
    return this.state;
  }
}

// Export for use in other modules
window.CoreOSClient = CoreOSClient;

// Create global instance
window.coreOS = new CoreOSClient();

// Log when loaded
console.log('Core OS Client loaded (v0.1.0)');
