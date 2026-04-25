/**
 * Chaos Inbox
 * Neurodivergent-friendly capture surface for scraps, links, and ideas
 */

window.ChaosInboxApp = function() {
    const appId = 'chaos-inbox';

    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const quickCaptureInput = document.createElement('input');
    quickCaptureInput.type = 'text';
    quickCaptureInput.placeholder = 'Quick capture a note...';
    quickCaptureInput.setAttribute('aria-label', 'Quick capture note');
    quickCaptureInput.className = 'input';

    const captureButton = Components.Button('Save', {
        onClick: () => {
            if (!quickCaptureInput.value) return;
            const newItem = {
                id: Date.now(),
                type: 'note',
                raw_content: quickCaptureInput.value,
                status: 'inbox',
                created_at: new Date().toISOString()
            };
            MockData.captureItems.unshift(newItem);
            quickCaptureInput.value = '';
            renderContent();
            window.OS.showNotification({
                type: 'success',
                title: 'Captured',
                message: 'Added to Chaos Inbox',
                duration: 1500
            });
        }
    });

    toolbar.appendChild(quickCaptureInput);
    toolbar.appendChild(captureButton);

    const container = document.createElement('div');
    container.className = 'chaos-inbox';

    function renderItemCard(item) {
        const tags = item.tags?.length ? item.tags.join(', ') : 'No tags';
        const statusBadge = Components.Badge(item.status, item.status === 'inbox' ? 'warning' : 'info');
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="chaos-meta">
                <span>${item.type.toUpperCase()} • ${item.source || 'manual'}</span>
                <span>${item.created_at}</span>
            </div>
            <div class="chaos-body">${item.raw_content || 'Empty'}</div>
            <div class="chaos-tags">${tags}</div>
        `;
        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.appendChild(statusBadge);
        const actions = document.createElement('div');
        const archiveBtn = Components.Button('Archive', {
            size: 'small',
            onClick: () => {
                item.status = 'archived';
                renderContent();
            }
        });
        const resurfaceBtn = Components.Button('Resurface', {
            size: 'small',
            onClick: () => {
                item.status = 'resurfaced';
                renderContent();
            }
        });
        actions.appendChild(archiveBtn);
        actions.appendChild(resurfaceBtn);
        footer.appendChild(actions);

        return Components.Card({
            title: item.raw_content?.slice(0, 40) || item.type,
            subtitle: `Status: ${item.status}`,
            content,
            footer
        });
    }

    function renderClusters() {
        const clusterWrap = document.createElement('div');
        clusterWrap.className = 'chaos-clusters';
        const heading = document.createElement('h3');
        heading.textContent = 'Suggested clusters';
        clusterWrap.appendChild(heading);
        MockData.captureClusters.forEach(cluster => {
            const linked = MockData.captureItems.filter(item => cluster.item_ids.includes(item.id));
            const body = document.createElement('div');
            body.innerHTML = `<div class="cluster-desc">${cluster.description}</div>`;
            linked.forEach(item => {
                const pill = Components.Badge(item.type, 'info');
                pill.textContent = `${item.type}: ${item.raw_content?.slice(0, 24)}`;
                pill.classList.add('pill');
                body.appendChild(pill);
            });
            clusterWrap.appendChild(Components.Card({ title: cluster.name, content: body }));
        });
        return clusterWrap;
    }

    function renderResurface() {
        const older = MockData.captureItems.filter(item => item.status === 'inbox');
        if (!older.length) return document.createElement('div');
        const list = Components.List(older.map(item => ({
            title: item.raw_content || item.type,
            subtitle: `Captured ${item.created_at}`,
            icon: '🔄'
        })));
        return Components.Card({ title: 'Resurface', subtitle: 'Things that need love', content: list });
    }

    function renderContent() {
        container.innerHTML = '';
        const filters = document.createElement('div');
        filters.className = 'chaos-filters';
        const statusFilter = document.createElement('select');
        statusFilter.innerHTML = `<option value="all">All</option><option value="inbox">Inbox</option><option value="clustered">Clustered</option><option value="resurfaced">Resurfaced</option>`;
        statusFilter.onchange = () => renderContent();
        filters.appendChild(statusFilter);

        const columns = document.createElement('div');
        columns.className = 'two-column-layout';
        const left = document.createElement('div');
        const right = document.createElement('div');

        const selectedStatus = statusFilter.value;
        const items = MockData.captureItems.filter(item => selectedStatus === 'all' || item.status === selectedStatus);
        if (!items.length) {
            left.appendChild(Components.EmptyState({ icon: '🌀', title: 'Nothing captured yet', text: 'Quick add something above.' }));
        } else {
            items.forEach(item => left.appendChild(renderItemCard(item)));
        }

        right.appendChild(renderClusters());
        right.appendChild(renderResurface());

        columns.appendChild(left);
        columns.appendChild(right);
        container.appendChild(filters);
        container.appendChild(columns);
    }

    renderContent();

    window.OS.createWindow({
        id: appId,
        title: 'Chaos Inbox',
        icon: '🌀',
        toolbar,
        content: container,
        width: '1100px',
        height: '720px'
    });
};
