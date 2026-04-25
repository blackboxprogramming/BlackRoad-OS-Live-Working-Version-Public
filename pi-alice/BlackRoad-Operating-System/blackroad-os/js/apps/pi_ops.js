/**
 * Pi Ops App
 * Raspberry Pi device management and monitoring
 * TODO: Add SSH terminal integration
 * TODO: Add bulk operations
 * TODO: Add device provisioning wizard
 */

window.PiOpsApp = function() {
    const appId = 'piops';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const refreshBtn = Components.Button('Refresh', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Syncing',
                message: 'Fetching Pi device status',
                duration: 2000
            });
        }
    });

    const provisionBtn = Components.Button('Provision New Device', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Device provisioning wizard will be available in v0.2',
                duration: 3000
            });
        }
    });

    toolbar.appendChild(refreshBtn);
    toolbar.appendChild(provisionBtn);

    // Create content
    const content = createPiOpsContent();

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Pi Ops',
        icon: '🥧',
        toolbar: toolbar,
        content: content,
        width: '900px',
        height: '650px'
    });
};

function createPiOpsContent() {
    const container = document.createElement('div');

    // Stats
    const onlineCount = MockData.piDevices.filter(d => d.status === 'online').length;
    const offlineCount = MockData.piDevices.filter(d => d.status === 'offline').length;
    const warningCount = MockData.piDevices.filter(d => d.status === 'warning').length;

    const statsGrid = Components.Grid(4, [
        Components.StatsBox({ value: MockData.piDevices.length, label: 'Total Devices' }),
        Components.StatsBox({ value: onlineCount, label: 'Online' }),
        Components.StatsBox({ value: offlineCount, label: 'Offline' }),
        Components.StatsBox({ value: warningCount, label: 'Warnings' })
    ]);

    container.appendChild(statsGrid);

    // Spacing
    container.appendChild(document.createElement('br'));

    // Devices table
    const devicesTable = Components.Table(
        [
            { key: 'hostname', label: 'Hostname' },
            { key: 'ip', label: 'IP Address' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status' },
            { key: 'cpu', label: 'CPU' },
            { key: 'memory', label: 'Memory' },
            { key: 'disk', label: 'Disk' },
            { key: 'uptime', label: 'Uptime' },
            { key: 'actions', label: 'Actions' }
        ],
        MockData.piDevices.map(device => ({
            ...device,
            status: createDeviceStatusBadge(device.status),
            cpu: `${device.cpu}%`,
            memory: `${device.memory}%`,
            disk: `${device.disk}%`,
            actions: createDeviceActions(device)
        }))
    );

    container.appendChild(devicesTable);

    return container;
}

function createDeviceStatusBadge(status) {
    const statusMap = {
        'online': 'success',
        'offline': 'error',
        'warning': 'warning'
    };
    return Components.Badge(status.toUpperCase(), statusMap[status] || 'neutral');
}

function createDeviceActions(device) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '4px';

    if (device.status === 'online' || device.status === 'warning') {
        const rebootBtn = Components.Button('Reboot', {
            size: 'small',
            onClick: () => {
                if (confirm(`Reboot ${device.hostname}?`)) {
                    window.OS.showNotification({
                        type: 'info',
                        title: 'Rebooting',
                        message: `${device.hostname} is rebooting...`,
                        duration: 3000
                    });
                }
            }
        });

        const pingBtn = Components.Button('Ping', {
            size: 'small',
            onClick: () => {
                window.OS.showNotification({
                    type: 'success',
                    title: 'Ping Success',
                    message: `${device.hostname} responded in 12ms`,
                    duration: 2000
                });
            }
        });

        container.appendChild(pingBtn);
        container.appendChild(rebootBtn);
    } else {
        const diagBtn = Components.Button('Diagnose', {
            size: 'small',
            type: 'danger',
            onClick: () => {
                window.OS.showNotification({
                    type: 'error',
                    title: 'Device Unreachable',
                    message: `Cannot connect to ${device.hostname}`,
                    duration: 3000
                });
            }
        });
        container.appendChild(diagBtn);
    }

    return container;
}
