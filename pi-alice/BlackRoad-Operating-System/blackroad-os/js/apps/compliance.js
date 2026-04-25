/**
 * Compliance Hub App
 * FINRA 2210 reviews, SEC filings, audit logs
 * TODO: Add workflow automation
 * TODO: Add document annotations
 * TODO: Add compliance calendar
 */

window.ComplianceApp = function() {
    const appId = 'compliance';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const newReviewBtn = Components.Button('Submit for Review', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Review submission form will be available in v0.2',
                duration: 3000
            });
        }
    });

    const exportBtn = Components.Button('Export Logs', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Exporting',
                message: 'Generating audit log export...',
                duration: 2000
            });
        }
    });

    toolbar.appendChild(newReviewBtn);
    toolbar.appendChild(exportBtn);

    // Create content with tabs
    const tabs = Components.Tabs([
        {
            id: 'queue',
            label: 'Review Queue',
            content: createReviewQueueTab()
        },
        {
            id: 'audit',
            label: 'Audit Logs',
            content: createAuditLogsTab()
        },
        {
            id: 'compliance',
            label: 'Compliance Stats',
            content: createComplianceStatsTab()
        }
    ]);

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Compliance Hub',
        icon: '✓',
        toolbar: toolbar,
        content: tabs,
        width: '1000px',
        height: '700px'
    });
};

function createReviewQueueTab() {
    const container = document.createElement('div');

    // Stats
    const pending = MockData.complianceQueue.filter(c => c.status === 'pending').length;
    const inReview = MockData.complianceQueue.filter(c => c.status === 'in_review').length;
    const approved = MockData.complianceQueue.filter(c => c.status === 'approved').length;
    const rejected = MockData.complianceQueue.filter(c => c.status === 'rejected').length;

    const statsGrid = Components.Grid(4, [
        Components.StatsBox({ value: pending, label: 'Pending' }),
        Components.StatsBox({ value: inReview, label: 'In Review' }),
        Components.StatsBox({ value: approved, label: 'Approved' }),
        Components.StatsBox({ value: rejected, label: 'Rejected' })
    ]);

    container.appendChild(statsGrid);
    container.appendChild(document.createElement('br'));

    // Queue table
    const queueTable = Components.Table(
        [
            { key: 'type', label: 'Type' },
            { key: 'content', label: 'Content' },
            { key: 'submittedBy', label: 'Submitted By' },
            { key: 'submittedAt', label: 'Submitted' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' }
        ],
        MockData.complianceQueue.map(item => ({
            ...item,
            priority: Components.Badge(item.priority.toUpperCase(), getPriorityBadgeType(item.priority)),
            status: Components.Badge(item.status.replace('_', ' ').toUpperCase(), getStatusBadgeType(item.status)),
            actions: createComplianceActions(item)
        }))
    );

    container.appendChild(queueTable);

    return container;
}

function createAuditLogsTab() {
    const container = document.createElement('div');

    const logsTable = Components.Table(
        [
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'event', label: 'Event' },
            { key: 'user', label: 'User' },
            { key: 'ip', label: 'IP Address' },
            { key: 'result', label: 'Result' }
        ],
        MockData.auditLogs.map(log => ({
            ...log,
            result: Components.Badge(log.result.toUpperCase(), log.result === 'success' ? 'success' : 'error')
        }))
    );

    container.appendChild(logsTable);

    return container;
}

function createComplianceStatsTab() {
    const container = document.createElement('div');

    const stats = document.createElement('div');
    stats.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
            <h2 style="color: var(--success); margin-bottom: 12px;">Compliant</h2>
            <p style="color: var(--text-secondary); font-size: 14px;">
                All regulatory requirements are up to date
            </p>
            <div style="margin-top: 32px;">
                ${Components.Button('View Compliance Report', {
                    type: 'primary',
                    onClick: () => {
                        window.OS.showNotification({
                            type: 'info',
                            title: 'Generating Report',
                            message: 'Compliance report will be ready shortly',
                            duration: 3000
                        });
                    }
                }).outerHTML}
            </div>
        </div>
    `;

    container.appendChild(stats);

    return container;
}

function getPriorityBadgeType(priority) {
    const map = {
        'critical': 'error',
        'high': 'warning',
        'medium': 'info',
        'low': 'neutral'
    };
    return map[priority] || 'neutral';
}

function getStatusBadgeType(status) {
    const map = {
        'pending': 'neutral',
        'in_review': 'info',
        'approved': 'success',
        'rejected': 'error'
    };
    return map[status] || 'neutral';
}

function createComplianceActions(item) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '4px';

    const viewBtn = Components.Button('View', {
        size: 'small',
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Opening',
                message: `Viewing ${item.type}`,
                duration: 2000
            });
        }
    });

    container.appendChild(viewBtn);

    if (item.status === 'pending') {
        const reviewBtn = Components.Button('Review', {
            size: 'small',
            type: 'primary',
            onClick: () => {
                window.OS.showNotification({
                    type: 'info',
                    title: 'Starting Review',
                    message: `Reviewing ${item.content}`,
                    duration: 2000
                });
            }
        });
        container.appendChild(reviewBtn);
    }

    return container;
}
