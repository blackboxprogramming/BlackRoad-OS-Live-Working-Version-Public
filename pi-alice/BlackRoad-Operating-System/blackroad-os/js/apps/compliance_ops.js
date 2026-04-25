/**
 * Compliance & Ops console
 */

window.ComplianceOpsApp = function() {
    const appId = 'compliance-ops';
    const container = document.createElement('div');
    container.className = 'compliance-ops';

    const eventsTable = Components.Table(
        [
            { key: 'timestamp', label: 'When' },
            { key: 'actor', label: 'Actor' },
            { key: 'action', label: 'Action' },
            { key: 'resource', label: 'Resource' },
            { key: 'severity', label: 'Severity', render: (val) => Components.Badge(val, val === 'critical' ? 'error' : 'info') }
        ],
        MockData.auditLogs.map(log => ({
            timestamp: log.timestamp,
            actor: log.user,
            action: log.event,
            resource: log.ip,
            severity: log.result
        })),
        { caption: 'Recent events' }
    );

    const workflows = Components.Card({
        title: 'Workflows',
        subtitle: 'Make compliance visible instead of hidden',
        content: Components.List([
            { icon: '✅', title: 'Marketing review', subtitle: 'Queue: 5 items' },
            { icon: '🛡️', title: 'Security review', subtitle: 'Auto checks nightly' },
            { icon: '📜', title: 'Policy updates', subtitle: 'Notify teams automatically' }
        ])
    });

    container.appendChild(Components.Card({ title: 'Events', content: eventsTable }));
    container.appendChild(workflows);

    window.OS.createWindow({
        id: appId,
        title: 'Compliance & Ops',
        icon: '🧭',
        content: container,
        width: '900px',
        height: '650px'
    });
};
