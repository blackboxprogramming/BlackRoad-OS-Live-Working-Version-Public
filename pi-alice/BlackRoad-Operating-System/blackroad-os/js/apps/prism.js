/**
 * Prism Console App
 * Agent monitoring, run logs, system events dashboard
 * TODO: Add real-time event streaming
 * TODO: Add agent control panel
 * TODO: Add filtering and search
 */

window.PrismApp = function() {
    const appId = 'prism';

    // If the window already exists, just focus it
    if (window.OS?.windows?.has(appId)) {
        window.OS.focusWindow(appId);
        return;
    }

    const liveEvents = [...MockData.systemEvents];
    const eventSubscriptions = [];
    let eventsListEl = null;

    const addEvent = (level, source, message, timestamp = new Date().toISOString()) => {
        liveEvents.unshift({ timestamp, level, source, message });
        if (liveEvents.length > 50) {
            liveEvents.pop();
        }
        refreshEventsList();
    };

    const refreshEventsList = () => {
        if (!eventsListEl) return;
        const newList = Components.List(formatEvents(liveEvents));
        eventsListEl.replaceWith(newList);
        eventsListEl = newList;
    };

    const formatEvents = (events) => events.map(event => ({
        icon: getLevelIcon(event.level),
        title: event.message,
        subtitle: `${event.source} • ${event.timestamp}`
    }));

    const subscribeToSystemEvents = () => {
        const bindings = [
            ['os:boot', () => addEvent('info', 'OS', 'System boot completed')],
            ['os:ready', () => addEvent('success', 'OS', 'Desktop ready')],
            ['window:created', ({ windowId, title }) => addEvent('info', 'WindowManager', `Window created: ${title || windowId}`)],
            ['window:focused', ({ windowId }) => addEvent('info', 'WindowManager', `Window focused: ${windowId}`)],
            ['window:minimized', ({ windowId }) => addEvent('warning', 'WindowManager', `Window minimized: ${windowId}`)],
            ['window:restored', ({ windowId }) => addEvent('success', 'WindowManager', `Window restored: ${windowId}`)],
            ['window:closed', ({ windowId }) => addEvent('info', 'WindowManager', `Window closed: ${windowId}`)],
            ['notification:shown', ({ title, type }) => addEvent(type || 'info', 'Notifications', title || 'Notification shown')]
        ];

        bindings.forEach(([event, handler]) => {
            window.OS.eventBus.on(event, handler);
            eventSubscriptions.push({ event, handler });
        });
    };

    const unsubscribeFromSystemEvents = () => {
        eventSubscriptions.forEach(({ event, handler }) => {
            window.OS.eventBus.off(event, handler);
        });
        eventSubscriptions.length = 0;
    };

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const refreshBtn = Components.Button('Refresh', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Refreshing...',
                message: 'Fetching latest agent data',
                duration: 2000
            });
        }
    });

    const apiExplorerBtn = Components.Button('API Explorer', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'API Explorer will be available in v0.2',
                duration: 3000
            });
        }
    });

    toolbar.appendChild(refreshBtn);
    toolbar.appendChild(apiExplorerBtn);

    // Create content with tabs
    const tabs = Components.Tabs([
        {
            id: 'runs',
            label: 'Agent Runs',
            content: createRunsTab()
        },
        {
            id: 'events',
            label: 'System Events',
            content: createEventsTab()
        },
        {
            id: 'health',
            label: 'System Health',
            content: createHealthTab()
        }
    ]);

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Prism Console',
        icon: '💠',
        toolbar: toolbar,
        content: tabs,
        width: '900px',
        height: '700px'
    });

    subscribeToSystemEvents();

    // Clean up listeners when Prism window closes
    const closeListener = ({ windowId }) => {
        if (windowId === appId) {
            unsubscribeFromSystemEvents();
            window.OS.eventBus.off('window:closed', closeListener);
        }
    };
    window.OS.eventBus.on('window:closed', closeListener);

    function createEventsTab() {
        const container = document.createElement('div');

        const intro = document.createElement('div');
        intro.style.marginBottom = '12px';
        intro.style.color = 'var(--text-secondary)';
        intro.textContent = 'Live feed from the OS event bus (windows, notifications, and system lifecycle).';
        container.appendChild(intro);

        eventsListEl = Components.List(formatEvents(liveEvents));
        container.appendChild(eventsListEl);

        return container;
    }
};

function createRunsTab() {
    const container = document.createElement('div');

    // Stats overview
    const statsGrid = Components.Grid(4, [
        Components.StatsBox({ value: MockData.agentRuns.length, label: 'Total Runs' }),
        Components.StatsBox({
            value: MockData.agentRuns.filter(r => r.status === 'success').length,
            label: 'Successful'
        }),
        Components.StatsBox({
            value: MockData.agentRuns.filter(r => r.status === 'failed').length,
            label: 'Failed'
        }),
        Components.StatsBox({
            value: MockData.agentRuns.filter(r => r.status === 'running').length,
            label: 'Running'
        })
    ]);

    container.appendChild(statsGrid);

    // Spacing
    container.appendChild(document.createElement('br'));

    // Runs table
    const runsTable = Components.Table(
        [
            { key: 'agent', label: 'Agent' },
            { key: 'status', label: 'Status' },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'duration', label: 'Duration' },
            { key: 'message', label: 'Message' }
        ],
        MockData.agentRuns.map(run => ({
            ...run,
            status: createStatusBadge(run.status)
        }))
    );

    container.appendChild(runsTable);

    return container;
}

function createHealthTab() {
    const container = document.createElement('div');

    const healthCards = Components.Grid(3, [
        Components.Card({
            title: 'Agent System',
            content: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                    <div style="font-size: 18px; font-weight: 600; color: var(--success);">Operational</div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">
                        All agents responding
                    </div>
                </div>
            `
        }),
        Components.Card({
            title: 'Event Bus',
            content: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                    <div style="font-size: 18px; font-weight: 600; color: var(--success);">Healthy</div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">
                        ${MockData.diagnostics.eventBusMessages} messages processed
                    </div>
                </div>
            `
        }),
        Components.Card({
            title: 'API Gateway',
            content: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                    <div style="font-size: 18px; font-weight: 600; color: var(--warning);">Degraded</div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">
                        Latency elevated (230ms avg)
                    </div>
                </div>
            `
        })
    ]);

    container.appendChild(healthCards);

    return container;
}

function createStatusBadge(status) {
    const statusMap = {
        'success': 'success',
        'failed': 'error',
        'running': 'info',
        'pending': 'neutral'
    };
    return Components.Badge(status, statusMap[status] || 'neutral');
}

function getLevelIcon(level) {
    const icons = {
        'info': 'ℹ️',
        'warning': '⚠️',
        'error': '❌',
        'success': '✅'
    };
    return icons[level] || 'ℹ️';
}
