/**
 * Prism Console JavaScript
 * BlackRoad OS Admin Interface
 */

class PrismConsole {
  constructor() {
    this.apiBase = window.location.origin;
    this.services = [];
    this.init();
  }

  async init() {
    console.log('Prism Console initializing...');

    // Setup tab navigation
    this.setupTabs();

    // Load configuration and initial data
    await this.loadConfig();
    await this.loadDashboard();

    // Setup auto-refresh
    setInterval(() => this.loadDashboard(), 30000); // Every 30 seconds

    console.log('Prism Console ready');
  }

  setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove active from all
        navItems.forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.remove('active');
        });

        // Add active to clicked
        item.classList.add('active');
        const tabId = `${item.dataset.tab}-tab`;
        document.getElementById(tabId).classList.add('active');

        // Load tab-specific data
        this.loadTabData(item.dataset.tab);
      });
    });
  }

  async loadConfig() {
    try {
      const config = await this.fetchAPI('/api/system/prism/config');
      this.services = config.services || [];

      if (config.environment) {
        document.getElementById('environment-badge').textContent = config.environment;
      }
    } catch (error) {
      console.error('Failed to load Prism configuration', error);
      this.services = [];
    }
  }

  async loadDashboard() {
    try {
      // Get system version
      const version = await this.fetchAPI('/api/system/version');
      document.getElementById('backend-version').textContent = version.version;
      document.getElementById('environment-badge').textContent = version.env;

      // Get system status
      await this.loadServiceHealth();

      // Update last updated time
      const now = new Date().toLocaleTimeString();
      document.getElementById('last-updated').textContent = `Last updated: ${now}`;

    } catch (error) {
      console.error('Failed to load dashboard:', error);
      document.getElementById('system-status').textContent = 'Error';
      document.getElementById('health-status').style.color = '#ef4444';
    }
  }

  async loadTabData(tab) {
    console.log(`Loading data for tab: ${tab}`);

    switch (tab) {
      case 'jobs':
        await this.loadJobs();
        break;
      case 'agents':
        await this.loadAgents();
        break;
      case 'system':
        await this.loadSystemConfig();
        break;
      default:
        console.log('No specific data to load for this tab');
    }
  }

  async loadJobs() {
    console.log('TODO: Load jobs from Operator Engine API');
    // Future: Fetch from /api/operator/jobs
  }

  async loadAgents() {
    console.log('TODO: Load agents from Agent Library API');
    // Future: Fetch from /api/agents
  }

  async loadSystemConfig() {
    try {
      const config = await this.fetchAPI('/api/system/config/public');

      // Display config
      const configDisplay = document.getElementById('config-display');
      configDisplay.innerHTML = `
        <pre>${JSON.stringify(config, null, 2)}</pre>
      `;

      // Display features
      const featuresDisplay = document.getElementById('features-display');
      featuresDisplay.innerHTML = Object.entries(config.features || {})
        .map(([key, value]) => {
          const icon = value ? '✅' : '❌';
          return `<div>${icon} ${key}: ${value}</div>`;
        })
        .join('');

    } catch (error) {
      console.error('Failed to load system config:', error);
    }
  }

  async loadServiceHealth() {
    const tbody = document.getElementById('service-health-body');

    if (!tbody || !this.services.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No services configured</td></tr>';
      return;
    }

    const results = await Promise.all(
      this.services.map(async (service) => {
        const healthUrl = `${service.url}${service.health_path || '/health'}`;
        const versionUrl = `${service.url}${service.version_path || '/version'}`;

        try {
          const [health, version] = await Promise.all([
            this.fetchExternal(healthUrl),
            this.fetchExternal(versionUrl),
          ]);

          return {
            name: service.name,
            status: (health.status || 'unknown').toLowerCase(),
            version: version.version || 'unknown',
            endpoint: healthUrl,
          };
        } catch (error) {
          console.error(`Health check failed for ${service.name}:`, error);
          return {
            name: service.name,
            status: 'error',
            version: 'n/a',
            endpoint: healthUrl,
          };
        }
      })
    );

    const unhealthy = results.some((result) => result.status !== 'healthy');
    document.getElementById('system-status').textContent = unhealthy ? 'Issues Detected' : 'Healthy ✓';
    document.getElementById('health-status').style.color = unhealthy ? '#ef4444' : '#10b981';

    tbody.innerHTML = results
      .map(
        (result) => `
          <tr>
            <td>${result.name}</td>
            <td><span class="status-badge ${result.status === 'healthy' ? 'healthy' : 'unhealthy'}">${result.status}</span></td>
            <td>${result.version}</td>
            <td><a href="${result.endpoint}" target="_blank" rel="noopener noreferrer">${result.endpoint}</a></td>
          </tr>
        `
      )
      .join('');
  }

  async fetchAPI(endpoint) {
    const response = await fetch(`${this.apiBase}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async fetchExternal(url) {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}

// Global functions for HTML onclick
function refreshDashboard() {
  window.prism.loadDashboard();
}

function viewLogs() {
  document.querySelector('[data-tab="logs"]').click();
}

function openOS() {
  window.location.href = '/';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.prism = new PrismConsole();
});
