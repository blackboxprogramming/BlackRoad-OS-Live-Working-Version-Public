/**
 * Engineering App
 * DevTools, system diagnostics, event bus inspector
 * TODO: Add real-time event streaming
 * TODO: Add API testing tools
 * TODO: Add performance monitoring
 */

window.EngineeringApp = function() {
    const appId = 'engineering';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const clearLogsBtn = Components.Button('Clear Logs', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Logs Cleared',
                message: 'Event log buffer has been cleared',
                duration: 2000
            });
        }
    });

    const exportBtn = Components.Button('Export Diagnostics', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'success',
                title: 'Exported',
                message: 'Diagnostic data saved to downloads',
                duration: 2000
            });
        }
    });

    toolbar.appendChild(clearLogsBtn);
    toolbar.appendChild(exportBtn);

    // Create content
    const tabs = Components.Tabs([
        {
            id: 'diagnostics',
            label: 'System Diagnostics',
            content: createDiagnosticsTab()
        },
        {
            id: 'eventbus',
            label: 'Event Bus',
            content: createEventBusTab()
        },
        {
            id: 'api',
            label: 'API Tester',
            content: createAPITesterTab()
        },
        {
            id: 'console',
            label: 'Console',
            content: createConsoleTab()
        }
    ]);

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Engineering DevTools',
        icon: '🔧',
        toolbar: toolbar,
        content: tabs,
        width: '900px',
        height: '700px'
    });
};

function createDiagnosticsTab() {
    const container = document.createElement('div');

    const diag = MockData.diagnostics;

    const infoGrid = Components.Grid(4, [
        Components.Card({
            title: 'OS Version',
            content: `<div style="text-align: center; padding: 20px; font-size: 18px; font-weight: 600; color: var(--primary);">${diag.osVersion}</div>`
        }),
        Components.Card({
            title: 'Uptime',
            content: `<div style="text-align: center; padding: 20px; font-size: 18px; font-weight: 600; color: var(--success);">${diag.uptime}</div>`
        }),
        Components.Card({
            title: 'Active Windows',
            content: `<div style="text-align: center; padding: 20px; font-size: 18px; font-weight: 600; color: var(--info);">${window.OS.windows.size}</div>`
        }),
        Components.Card({
            title: 'Registered Apps',
            content: `<div style="text-align: center; padding: 20px; font-size: 18px; font-weight: 600; color: var(--text-primary);">${diag.registeredApps}</div>`
        })
    ]);

    container.appendChild(infoGrid);
    container.appendChild(document.createElement('br'));

    const detailsCard = Components.Card({
        title: 'System Information',
        content: `
            <table style="width: 100%; font-size: 13px;">
                <tr>
                    <td style="padding: 8px; color: var(--text-dim);">Build Date</td>
                    <td style="padding: 8px; color: var(--text-primary); font-weight: 600;">${diag.buildDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; color: var(--text-dim);">Event Bus Messages</td>
                    <td style="padding: 8px; color: var(--text-primary); font-weight: 600;">${diag.eventBusMessages}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; color: var(--text-dim);">Memory Usage (approx)</td>
                    <td style="padding: 8px; color: var(--text-primary); font-weight: 600;">${diag.memoryUsage}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; color: var(--text-dim);">Current Theme</td>
                    <td style="padding: 8px; color: var(--text-primary); font-weight: 600;">${diag.theme}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; color: var(--text-dim);">User Agent</td>
                    <td style="padding: 8px; color: var(--text-primary); font-weight: 600; font-size: 11px; word-break: break-all;">${navigator.userAgent}</td>
                </tr>
            </table>
        `
    });

    container.appendChild(detailsCard);

    return container;
}

function createEventBusTab() {
    const container = document.createElement('div');

    const info = document.createElement('div');
    info.style.marginBottom = '16px';
    info.innerHTML = `
        <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 8px;">Event Bus Inspector</div>
        <div style="color: var(--text-secondary); font-size: 13px;">
            Monitor real-time events flowing through the OS event bus
        </div>
    `;
    container.appendChild(info);

    // Mock event log
    const events = [
        { time: '09:23:45', event: 'os:boot', data: '{}' },
        { time: '09:23:46', event: 'os:ready', data: '{}' },
        { time: '09:24:12', event: 'window:created', data: '{"windowId":"prism"}' },
        { time: '09:24:15', event: 'window:focused', data: '{"windowId":"prism"}' },
        { time: '09:25:03', event: 'theme:changed', data: '{"theme":"nightOS"}' },
        { time: '09:25:45', event: 'notification:shown', data: '{"type":"info"}' },
        { time: '09:26:12', event: 'window:created', data: '{"windowId":"miners"}' },
        { time: '09:26:30', event: 'window:minimized', data: '{"windowId":"prism"}' },
    ];

    const eventLog = Components.Table(
        [
            { key: 'time', label: 'Time' },
            { key: 'event', label: 'Event' },
            { key: 'data', label: 'Data' }
        ],
        events.map(e => ({
            ...e,
            event: `<code style="color: var(--primary); font-size: 12px;">${e.event}</code>`,
            data: `<code style="color: var(--text-secondary); font-size: 11px;">${e.data}</code>`
        }))
    );

    container.appendChild(eventLog);

    return container;
}

function createAPITesterTab() {
    const container = document.createElement('div');

    const form = document.createElement('div');
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label">HTTP Method</label>
            <select class="form-select">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Endpoint URL</label>
            <input type="text" class="form-input" placeholder="https://api.blackroad.io/v1/..." value="https://api.blackroad.io/v1/agents">
        </div>
        <div class="form-group">
            <label class="form-label">Request Body (JSON)</label>
            <textarea class="form-input" rows="6" placeholder='{"key": "value"}' style="font-family: monospace;"></textarea>
        </div>
        <div style="margin-top: 16px;">
            ${Components.Button('Send Request', {
                type: 'primary',
                onClick: () => {
                    window.OS.showNotification({
                        type: 'success',
                        title: 'Request Sent',
                        message: 'Response received in 142ms',
                        duration: 3000
                    });
                }
            }).outerHTML}
        </div>
        <div style="margin-top: 24px;">
            <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 8px;">Response</div>
            ${Components.CodeBlock('{\n  "status": "ok",\n  "agents": [...],\n  "count": 12\n}').outerHTML}
        </div>
    `;

    container.appendChild(form);

    return container;
}

function createConsoleTab() {
    const container = document.createElement('div');

    const consoleOutput = Components.CodeBlock(
        `[09:23:45] BlackRoad OS initialized
[09:23:46] Theme Manager initialized: tealOS
[09:23:46] ✅ BlackRoad OS ready
[09:24:12] Window created: prism
[09:24:15] Window focused: prism
[09:25:03] Theme changed: nightOS
[09:26:12] Window created: miners
[09:26:30] Window minimized: prism

> Ready for commands...`
    );

    container.appendChild(consoleOutput);

    const inputArea = document.createElement('div');
    inputArea.style.marginTop = '16px';

    const input = document.createElement('input');
    input.className = 'form-input';
    input.placeholder = 'Type command... (e.g., "help", "clear", "info")';
    input.style.fontFamily = 'monospace';
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            window.OS.showNotification({
                type: 'info',
                title: 'Console Command',
                message: `Executed: ${input.value}`,
                duration: 2000
            });
            input.value = '';
        }
    });

    inputArea.appendChild(input);
    container.appendChild(inputArea);

    return container;
}
