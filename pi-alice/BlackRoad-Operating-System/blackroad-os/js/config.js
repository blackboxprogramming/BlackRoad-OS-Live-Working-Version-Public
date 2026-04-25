/**
 * BlackRoad OS Configuration
 * Central configuration for API endpoints, feature flags, and app settings
 *
 * Purpose:
 * - Provides single source of truth for environment-specific settings
 * - Makes it easy to switch between mock and real APIs
 * - Enables feature flag-based development
 * - Centralizes app default configurations
 *
 * How to use:
 *   import { API_ENDPOINTS, FEATURE_FLAGS } from './config.js';
 *   const url = API_ENDPOINTS.prism + '/agents/runs';
 *
 * For real API integration (v0.2.0+):
 * 1. Set FEATURE_FLAGS.enableRealAPIs = true
 * 2. Update API_ENDPOINTS with actual backend URLs
 * 3. Apps will automatically use real endpoints instead of MockData
 */

const Config = {
    /**
     * Application metadata
     */
    APP: {
        name: 'BlackRoad OS',
        version: '0.1.1',
        buildDate: '2025-11-16',
        environment: 'development' // development | production
    },

    /**
     * Feature flags for controlling functionality
     * Toggle these to enable/disable features without code changes
     */
    FEATURE_FLAGS: {
        // API & Data
        enableRealAPIs: false,          // Use real backend APIs instead of mock data
        enableDebugLogging: true,       // Show detailed console logs
        enablePerformanceMetrics: false, // Track and log performance metrics

        // UI Features
        enableCommandPalette: false,    // Ctrl+K command palette (v0.2.0)
        enableWindowResize: false,      // Window resizing (v0.2.0)
        enableWindowMaximize: false,    // Window maximize (v0.2.0)
        enableThemeBuilder: false,      // Custom theme builder (v0.2.0)
        enableNotificationSound: false, // Audio notifications

        // Advanced Features
        enableWindowPersistence: false, // Remember window positions (v0.2.0)
        enableMultiUser: false,         // Multi-user support (v0.3.0)
        enableCollaboration: false,     // Real-time collaboration (v0.3.0)
        enableAnalytics: false          // Usage analytics tracking
    },

    /**
     * API Endpoints
     * Update these when connecting to real backend services
     *
     * Current: All point to mock data layer
     * Future: Point to actual FastAPI/Next.js backends
     */
    API_ENDPOINTS: {
        // Base URLs
        base: 'https://api.blackroad.io',           // Main API base
        prism: 'https://api.blackroad.io/prism',    // Prism agent system
        miners: 'https://api.blackroad.io/miners',  // Mining operations
        piOps: 'https://api.blackroad.io/pi',       // Pi device management
        compliance: 'https://api.blackroad.io/compliance', // FINRA compliance
        finance: 'https://api.blackroad.io/finance',       // Portfolio/AUM
        identity: 'https://api.blackroad.io/identity',     // SHA∞ identity
        research: 'https://api.blackroad.io/research',     // Lucidia research

        // Specific endpoints (examples for future use)
        // TODO v0.2.0: Implement these when backend is ready
        agents: {
            runs: '/agents/runs',
            status: '/agents/status',
            logs: '/agents/logs'
        },
        miners: {
            list: '/miners',
            status: '/miners/:id/status',
            telemetry: '/miners/:id/telemetry'
        }
    },

    /**
     * App default configurations
     * Default window sizes, behaviors, and settings for each app
     */
    APPS: {
        prism: {
            defaultWidth: '900px',
            defaultHeight: '700px',
            refreshInterval: 5000,  // Auto-refresh every 5s
            maxLogLines: 1000
        },
        miners: {
            defaultWidth: '1000px',
            defaultHeight: '700px',
            refreshInterval: 10000, // Auto-refresh every 10s
            alertThreshold: {
                temperature: 80,    // Alert if temp > 80°C
                hashrate: 100       // Alert if hashrate < 100 TH/s
            }
        },
        piOps: {
            defaultWidth: '900px',
            defaultHeight: '650px',
            refreshInterval: 30000, // Auto-refresh every 30s
            alertThreshold: {
                cpu: 90,           // Alert if CPU > 90%
                memory: 90,        // Alert if memory > 90%
                disk: 95           // Alert if disk > 95%
            }
        },
        runbooks: {
            defaultWidth: '1100px',
            defaultHeight: '750px',
            enableMarkdownPreview: true,
            autoSave: true
        },
        compliance: {
            defaultWidth: '1000px',
            defaultHeight: '700px',
            refreshInterval: 60000, // Auto-refresh every minute
            priorityLevels: ['critical', 'high', 'medium', 'low']
        },
        finance: {
            defaultWidth: '1100px',
            defaultHeight: '750px',
            refreshInterval: 15000, // Auto-refresh every 15s
            currency: 'USD',
            chartType: 'line'      // line | bar | candlestick
        },
        identity: {
            defaultWidth: '1000px',
            defaultHeight: '700px',
            searchDebounce: 300,   // Debounce search by 300ms
            pageSize: 50
        },
        research: {
            defaultWidth: '1000px',
            defaultHeight: '700px',
            enableLivePreview: true,
            autoSaveInterval: 30000 // Auto-save every 30s
        },
        engineering: {
            defaultWidth: '900px',
            defaultHeight: '700px',
            showInternalMetrics: true
        },
        settings: {
            defaultWidth: '700px',
            defaultHeight: '600px'
        },
        notifications: {
            defaultWidth: '500px',
            defaultHeight: '600px',
            markReadOnOpen: true,
            maxUnreadBadge: 99
        },
        corporate: {
            defaultWidth: '800px',
            defaultHeight: '600px'
        }
    },

    /**
     * Theme configuration
     */
    THEME: {
        default: 'tealOS',
        available: ['tealOS', 'nightOS'],
        transitionDuration: 300 // ms
    },

    /**
     * System settings
     */
    SYSTEM: {
        notificationDuration: 5000,     // Default notification duration (ms)
        clockFormat: '24h',             // 24h | 12h
        dateFormat: 'YYYY-MM-DD',       // ISO format
        maxOpenWindows: 20,             // Prevent memory issues
        zIndexMax: 9999,                // Z-index ceiling
        autoSaveInterval: 60000         // Auto-save user data every minute
    },

    /**
     * Keyboard shortcuts
     * Centralized registry (can be overridden in Settings v0.2.0)
     */
    SHORTCUTS: {
        openCommandPalette: 'Ctrl+K',
        openPrism: 'Ctrl+Shift+P',
        openMiners: 'Ctrl+Shift+M',
        openEngineering: 'Ctrl+Shift+E',
        closeWindow: 'Escape',
        toggleTheme: 'Ctrl+Shift+T',    // TODO: Implement
        toggleFullscreen: 'F11'         // TODO: Implement
    },

    /**
     * Get app configuration
     * @param {string} appId - App identifier
     * @returns {Object} App configuration
     */
    getAppConfig(appId) {
        return this.APPS[appId] || {};
    },

    /**
     * Check if feature flag is enabled
     * @param {string} flagName - Feature flag name
     * @returns {boolean} True if enabled
     */
    isFeatureEnabled(flagName) {
        return this.FEATURE_FLAGS[flagName] === true;
    },

    /**
     * Get API endpoint
     * @param {string} service - Service name (e.g., 'prism', 'miners')
     * @param {string} path - Optional path to append
     * @returns {string} Full API URL
     */
    getApiEndpoint(service, path = '') {
        const base = this.API_ENDPOINTS[service] || this.API_ENDPOINTS.base;
        return path ? `${base}${path}` : base;
    },

    /**
     * Log configuration (for debugging)
     */
    logConfig() {
        if (this.FEATURE_FLAGS.enableDebugLogging) {
            console.log('🔧 BlackRoad OS Configuration:', {
                version: this.APP.version,
                environment: this.APP.environment,
                realAPIsEnabled: this.FEATURE_FLAGS.enableRealAPIs,
                featureFlags: this.FEATURE_FLAGS
            });
        }
    }
};

// Make globally available
window.Config = Config;

// Log configuration on load
Config.logConfig();

// Export for ES modules (future-proof)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
