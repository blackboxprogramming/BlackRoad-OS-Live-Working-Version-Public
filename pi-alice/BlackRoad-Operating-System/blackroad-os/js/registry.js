/**
 * Application Registry
 * Central registry of all installed apps
 * Maps app IDs to metadata and entry points
 * TODO: Add app categories/folders
 * TODO: Add app permissions system
 * TODO: Add dynamic app loading
 */

const AppRegistry = {
    // Core Apps
    prism: {
        id: 'prism',
        name: 'Prism Console',
        icon: '💠',
        description: 'Agent monitoring and system events',
        category: 'Core',
        entry: window.PrismApp,
        defaultSize: { width: '900px', height: '700px' }
    },

    miners: {
        id: 'miners',
        name: 'Miners Dashboard',
        icon: '⛏️',
        description: 'Mining operations and telemetry',
        category: 'Operations',
        entry: window.MinersApp,
        defaultSize: { width: '1000px', height: '700px' }
    },

    piops: {
        id: 'piops',
        name: 'Pi Ops',
        icon: '🥧',
        description: 'Raspberry Pi device management',
        category: 'Infrastructure',
        entry: window.PiOpsApp,
        defaultSize: { width: '900px', height: '650px' }
    },

    runbooks: {
        id: 'runbooks',
        name: 'Runbooks',
        icon: '📚',
        description: 'Operational procedures and guides',
        category: 'Documentation',
        entry: window.RunbooksApp,
        defaultSize: { width: '1100px', height: '750px' }
    },

    compliance: {
        id: 'compliance',
        name: 'Compliance Hub',
        icon: '✓',
        description: 'FINRA reviews and audit logs',
        category: 'Compliance',
        entry: window.ComplianceApp,
        defaultSize: { width: '1000px', height: '700px' }
    },

    finance: {
        id: 'finance',
        name: 'Finance & AUM',
        icon: '💰',
        description: 'Portfolio management and analytics',
        category: 'Finance',
        entry: window.FinanceApp,
        defaultSize: { width: '1100px', height: '750px' }
    },

    identity: {
        id: 'identity',
        name: 'Identity Ledger',
        icon: '🔐',
        description: 'SHA∞ identity system',
        category: 'Security',
        entry: window.IdentityApp,
        defaultSize: { width: '1000px', height: '700px' }
    },

    research: {
        id: 'research',
        name: 'Research Lab',
        icon: '🔬',
        description: 'Lucidia experiments and analysis',
        category: 'Research',
        entry: window.ResearchApp,
        defaultSize: { width: '1000px', height: '700px' }
    },

    engineering: {
        id: 'engineering',
        name: 'Engineering',
        icon: '🔧',
        description: 'DevTools and system diagnostics',
        category: 'Development',
        entry: window.EngineeringApp,
        defaultSize: { width: '900px', height: '700px' }
    },

    settings: {
        id: 'settings',
        name: 'Settings',
        icon: '⚙️',
        description: 'System preferences and configuration',
        category: 'System',
        entry: window.SettingsApp,
        defaultSize: { width: '700px', height: '600px' }
    },

    notifications: {
        id: 'notifications',
        name: 'Notifications',
        icon: '🔔',
        description: 'System alerts and messages',
        category: 'System',
        entry: window.NotificationsApp,
        defaultSize: { width: '500px', height: '600px' }
    },

    corporate: {
        id: 'corporate',
        name: 'Corporate OS',
        icon: '🏢',
        description: 'Department management panels',
        category: 'Corporate',
        entry: window.CorporateApp,
        defaultSize: { width: '800px', height: '600px' }
    },

    'chaos-inbox': {
        id: 'chaos-inbox',
        name: 'Chaos Inbox',
        icon: '🌀',
        description: 'All your scraps in one forgiving place',
        category: 'Focus',
        entry: window.ChaosInboxApp,
        defaultSize: { width: '1100px', height: '720px' }
    },

    'identity-center': {
        id: 'identity-center',
        name: 'Identity Center',
        icon: '🪪',
        description: 'Your info once, used everywhere',
        category: 'System',
        entry: window.IdentityCenterApp,
        defaultSize: { width: '800px', height: '650px' }
    },

    'creator-studio': {
        id: 'creator-studio',
        name: 'Creator Studio',
        icon: '🎨',
        description: 'Home base for creative work',
        category: 'Creators',
        entry: window.CreatorStudioApp,
        defaultSize: { width: '1000px', height: '700px' }
    },

    'compliance-ops': {
        id: 'compliance-ops',
        name: 'Compliance & Ops',
        icon: '🧭',
        description: 'Transparent logs & workflows',
        category: 'Compliance',
        entry: window.ComplianceOpsApp,
        defaultSize: { width: '900px', height: '650px' }
    }
};

/**
 * Launch an app by ID
 */
function launchApp(appId) {
    const app = AppRegistry[appId];
    if (!app) {
        console.error(`App not found: ${appId}`);
        return;
    }

    if (!app.entry) {
        console.error(`App entry point not defined: ${appId}`);
        window.OS.showNotification({
            type: 'error',
            title: 'App Error',
            message: `${app.name} is not yet implemented`,
            duration: 3000
        });
        return;
    }

    // Call the app's entry function
    app.entry();
}

// Make globally available
window.AppRegistry = AppRegistry;
window.launchApp = launchApp;
