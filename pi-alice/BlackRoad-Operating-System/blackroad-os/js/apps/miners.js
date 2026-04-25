/**
 * Miners Dashboard App
 * Mining operations monitoring and control
 * TODO: Add real-time hashrate charts
 * TODO: Add miner control actions
 * TODO: Add temperature alerts
 */

window.MinersApp = function() {
    const appId = 'miners';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const refreshBtn = Components.Button('Refresh Data', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Refreshing',
                message: 'Fetching latest miner telemetry',
                duration: 2000
            });
        }
    });

    const emergencyStopBtn = Components.Button('Emergency Stop All', {
        type: 'danger',
        onClick: () => {
            if (confirm('Emergency stop all miners? This cannot be undone without manual intervention.')) {
                window.OS.showNotification({
                    type: 'warning',
                    title: 'Emergency Stop Initiated',
                    message: 'Shutting down all mining operations',
                    duration: 4000
                });
            }
        }
    });

    toolbar.appendChild(refreshBtn);
    toolbar.appendChild(document.createElement('div')).className = 'toolbar-separator';
    toolbar.appendChild(emergencyStopBtn);

    // Create content
    const content = createMinersContent();

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Miners Dashboard',
        icon: '⛏️',
        toolbar: toolbar,
        content: content,
        width: '1000px',
        height: '700px'
    });
};

function createMinersContent() {
    const container = document.createElement('div');

    // Overview stats
    const onlineCount = MockData.miners.filter(m => m.status === 'online').length;
    const offlineCount = MockData.miners.filter(m => m.status === 'offline').length;
    const warningCount = MockData.miners.filter(m => m.status === 'warning').length;
    const totalHashrate = MockData.miners
        .filter(m => m.status === 'online' || m.status === 'warning')
        .reduce((sum, m) => sum + parseFloat(m.hashrate), 0);

    const statsGrid = Components.Grid(4, [
        Components.StatsBox({
            value: onlineCount,
            label: 'Online',
            change: 0
        }),
        Components.StatsBox({
            value: offlineCount,
            label: 'Offline'
        }),
        Components.StatsBox({
            value: `${totalHashrate.toFixed(0)} TH/s`,
            label: 'Total Hashrate',
            change: 2.3
        }),
        Components.StatsBox({
            value: warningCount,
            label: 'Warnings'
        })
    ]);

    container.appendChild(statsGrid);

    // Spacing
    const spacer = document.createElement('div');
    spacer.style.height = '20px';
    container.appendChild(spacer);

    // Miners grid
    const minersGrid = Components.Grid(2,
        MockData.miners.map(miner => createMinerCard(miner))
    );

    container.appendChild(minersGrid);

    // Hashrate chart placeholder
    container.appendChild(document.createElement('br'));
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = 'Hashrate History';
    chartTitle.style.marginBottom = '10px';
    container.appendChild(chartTitle);
    container.appendChild(Components.GraphPlaceholder('24-Hour Hashrate Chart'));

    return container;
}

function createMinerCard(miner) {
    const statusColors = {
        'online': 'var(--success)',
        'offline': 'var(--error)',
        'warning': 'var(--warning)'
    };

    const statusBadgeType = {
        'online': 'success',
        'offline': 'error',
        'warning': 'warning'
    };

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.marginTop = '12px';

    if (miner.status !== 'offline') {
        const restartBtn = Components.Button('Restart', {
            size: 'small',
            onClick: () => {
                window.OS.showNotification({
                    type: 'info',
                    title: 'Restarting Miner',
                    message: `${miner.name} is restarting...`,
                    duration: 3000
                });
            }
        });
        actions.appendChild(restartBtn);
    } else {
        const startBtn = Components.Button('Start', {
            size: 'small',
            type: 'primary',
            onClick: () => {
                window.OS.showNotification({
                    type: 'info',
                    title: 'Starting Miner',
                    message: `${miner.name} is starting up...`,
                    duration: 3000
                });
            }
        });
        actions.appendChild(startBtn);
    }

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="margin-bottom: 12px;">
            ${Components.Badge(miner.status.toUpperCase(), statusBadgeType[miner.status]).outerHTML}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
            <div>
                <div style="color: var(--text-dim);">Hashrate</div>
                <div style="font-weight: 600; color: var(--primary);">${miner.hashrate}</div>
            </div>
            <div>
                <div style="color: var(--text-dim);">Temperature</div>
                <div style="font-weight: 600; color: ${miner.temp > 65 ? 'var(--warning)' : 'var(--text-primary)'};">${miner.temp}°C</div>
            </div>
            <div>
                <div style="color: var(--text-dim);">Power</div>
                <div style="font-weight: 600;">${miner.power}W</div>
            </div>
            <div>
                <div style="color: var(--text-dim);">Uptime</div>
                <div style="font-weight: 600;">${miner.uptime}</div>
            </div>
        </div>
        <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
            📍 ${miner.location}
        </div>
    `;
    content.appendChild(actions);

    return Components.Card({
        title: miner.name,
        subtitle: miner.id,
        content: content
    });
}
