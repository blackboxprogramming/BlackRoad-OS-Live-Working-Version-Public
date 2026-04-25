/**
 * Identity Ledger App
 * SHA∞ identity system and event tracking
 * TODO: Add hash visualization
 * TODO: Add identity verification tools
 * TODO: Add fractal depth analysis
 */

window.IdentityApp = function() {
    const appId = 'identity';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const newHashBtn = Components.Button('Create Identity', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'success',
                title: 'Identity Created',
                message: 'New SHA∞ hash generated and recorded',
                duration: 3000
            });
        }
    });

    const verifyBtn = Components.Button('Verify Hash', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Hash verification tool will be available in v0.2',
                duration: 3000
            });
        }
    });

    toolbar.appendChild(newHashBtn);
    toolbar.appendChild(verifyBtn);

    // Create content
    const tabs = Components.Tabs([
        {
            id: 'ledger',
            label: 'Identity Ledger',
            content: createLedgerTab()
        },
        {
            id: 'timeline',
            label: 'Event Timeline',
            content: createTimelineTab()
        },
        {
            id: 'fractal',
            label: 'Fractal Analysis',
            content: createFractalTab()
        }
    ]);

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Identity Ledger (SHA∞)',
        icon: '🔐',
        toolbar: toolbar,
        content: tabs,
        width: '1000px',
        height: '700px'
    });
};

function createLedgerTab() {
    const container = document.createElement('div');

    // Stats
    const totalHashes = MockData.identityHashes.length;
    const verified = MockData.identityHashes.filter(h => h.verified).length;
    const avgDepth = (MockData.identityHashes.reduce((sum, h) => sum + h.depth, 0) / totalHashes).toFixed(1);

    const statsGrid = Components.Grid(4, [
        Components.StatsBox({ value: totalHashes, label: 'Total Identities' }),
        Components.StatsBox({ value: verified, label: 'Verified' }),
        Components.StatsBox({ value: avgDepth, label: 'Avg Depth' }),
        Components.StatsBox({ value: totalHashes - verified, label: 'Pending' })
    ]);

    container.appendChild(statsGrid);
    container.appendChild(document.createElement('br'));

    // Ledger table (show first 20)
    const ledgerTable = Components.Table(
        [
            { key: 'id', label: 'ID' },
            { key: 'hash', label: 'SHA∞ Hash' },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'depth', label: 'Depth' },
            { key: 'verified', label: 'Verified' },
            { key: 'eventType', label: 'Event Type' }
        ],
        MockData.identityHashes.slice(0, 20).map(h => ({
            ...h,
            hash: `<code style="font-family: monospace; font-size: 11px; color: var(--primary);">${h.hash.substring(0, 24)}...</code>`,
            verified: h.verified ? Components.Badge('✓ Verified', 'success') : Components.Badge('Pending', 'neutral'),
            eventType: Components.Badge(h.eventType, 'info')
        }))
    );

    container.appendChild(ledgerTable);

    const footer = document.createElement('div');
    footer.style.marginTop = '12px';
    footer.style.textAlign = 'center';
    footer.style.color = 'var(--text-secondary)';
    footer.style.fontSize = '13px';
    footer.textContent = `Showing 20 of ${totalHashes} identities`;
    container.appendChild(footer);

    return container;
}

function createTimelineTab() {
    const container = document.createElement('div');

    // Group events by date
    const eventsByDate = {};
    MockData.identityHashes.slice(0, 30).forEach(h => {
        if (!eventsByDate[h.timestamp]) {
            eventsByDate[h.timestamp] = [];
        }
        eventsByDate[h.timestamp].push(h);
    });

    Object.entries(eventsByDate).forEach(([date, events]) => {
        const dateHeader = document.createElement('div');
        dateHeader.style.fontWeight = '600';
        dateHeader.style.color = 'var(--primary)';
        dateHeader.style.marginTop = '20px';
        dateHeader.style.marginBottom = '10px';
        dateHeader.textContent = date;
        container.appendChild(dateHeader);

        const eventsList = Components.List(
            events.map(event => ({
                icon: '🔐',
                title: `${event.eventType} (Depth ${event.depth})`,
                subtitle: `${event.id} • ${event.verified ? 'Verified' : 'Pending'}`,
            }))
        );

        container.appendChild(eventsList);
    });

    return container;
}

function createFractalTab() {
    const container = document.createElement('div');

    const fractalViz = document.createElement('div');
    fractalViz.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 120px; margin-bottom: 20px; line-height: 1;">∞</div>
            <h3 style="color: var(--primary); margin-bottom: 12px;">SHA∞ Fractal Visualization</h3>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">
                Recursive hash depth analysis and pattern recognition
            </p>
            ${Components.GraphPlaceholder('Fractal Depth Visualization').outerHTML}
            <div style="margin-top: 24px;">
                <div style="display: inline-block; text-align: left;">
                    <div style="margin-bottom: 8px;">
                        <span style="color: var(--text-dim);">Max Depth:</span>
                        <span style="color: var(--primary); font-weight: 600; margin-left: 8px;">10</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: var(--text-dim);">Branching Factor:</span>
                        <span style="color: var(--primary); font-weight: 600; margin-left: 8px;">3.2</span>
                    </div>
                    <div>
                        <span style="color: var(--text-dim);">Complexity Score:</span>
                        <span style="color: var(--primary); font-weight: 600; margin-left: 8px;">8.7/10</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.appendChild(fractalViz);

    return container;
}
