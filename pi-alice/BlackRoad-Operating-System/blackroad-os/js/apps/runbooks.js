/**
 * Runbooks App
 * Operational procedures and documentation
 * TODO: Add markdown editor
 * TODO: Add version control
 * TODO: Add search functionality
 */

window.RunbooksApp = function() {
    const appId = 'runbooks';

    // State
    let selectedRunbook = MockData.runbooks[0];

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const newBtn = Components.Button('New Runbook', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Runbook editor will be available in v0.2',
                duration: 3000
            });
        }
    });

    const searchInput = document.createElement('input');
    searchInput.className = 'form-input';
    searchInput.placeholder = 'Search runbooks...';
    searchInput.style.width = '300px';

    toolbar.appendChild(searchInput);
    toolbar.appendChild(newBtn);

    // Create content
    const content = createRunbooksContent(selectedRunbook, (runbook) => {
        selectedRunbook = runbook;
        // Update viewer
        const viewer = document.getElementById('runbook-viewer');
        if (viewer) {
            viewer.innerHTML = '';
            viewer.appendChild(createRunbookViewer(runbook));
        }
    });

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Runbooks',
        icon: '📚',
        toolbar: toolbar,
        content: content,
        width: '1100px',
        height: '750px',
        noPadding: true
    });
};

function createRunbooksContent(selectedRunbook, onSelect) {
    // Sidebar with categories
    const sidebar = document.createElement('div');
    sidebar.style.padding = '20px 0';

    // Group by category
    const categories = {};
    MockData.runbooks.forEach(rb => {
        if (!categories[rb.category]) {
            categories[rb.category] = [];
        }
        categories[rb.category].push(rb);
    });

    Object.entries(categories).forEach(([category, runbooks]) => {
        const section = document.createElement('div');
        section.className = 'sidebar-section';

        const title = document.createElement('div');
        title.className = 'sidebar-section-title';
        title.textContent = category;
        section.appendChild(title);

        runbooks.forEach(rb => {
            const item = document.createElement('div');
            item.className = 'sidebar-item';
            if (rb.id === selectedRunbook.id) {
                item.classList.add('active');
            }
            item.textContent = rb.title;
            item.addEventListener('click', () => {
                // Remove active from all
                sidebar.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                onSelect(rb);
            });
            section.appendChild(item);
        });

        sidebar.appendChild(section);
    });

    // Content area
    const contentArea = document.createElement('div');
    contentArea.style.padding = '20px';
    contentArea.id = 'runbook-viewer';
    contentArea.appendChild(createRunbookViewer(selectedRunbook));

    return Components.SidebarLayout(sidebar, contentArea);
}

function createRunbookViewer(runbook) {
    const container = document.createElement('div');

    // Header
    const header = document.createElement('div');
    header.style.marginBottom = '24px';
    header.style.paddingBottom = '16px';
    header.style.borderBottom = '1px solid var(--border-color)';

    const title = document.createElement('h2');
    title.textContent = runbook.title;
    title.style.marginBottom = '8px';
    title.style.color = 'var(--text-primary)';

    const meta = document.createElement('div');
    meta.style.fontSize = '13px';
    meta.style.color = 'var(--text-secondary)';
    meta.innerHTML = `
        ${Components.Badge(runbook.category, 'neutral').outerHTML}
        <span style="margin: 0 8px;">•</span>
        Last updated: ${runbook.lastUpdated}
        <span style="margin: 0 8px;">•</span>
        Author: ${runbook.author}
    `;

    header.appendChild(title);
    header.appendChild(meta);
    container.appendChild(header);

    // Content (convert markdown to HTML - simplified)
    const content = document.createElement('div');
    content.style.lineHeight = '1.8';
    content.style.color = 'var(--text-secondary)';
    content.innerHTML = markdownToHTML(runbook.content);
    container.appendChild(content);

    // Action buttons
    const actions = document.createElement('div');
    actions.style.marginTop = '32px';
    actions.style.display = 'flex';
    actions.style.gap = '12px';

    const editBtn = Components.Button('Edit Runbook', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Runbook editing will be available in v0.2',
                duration: 3000
            });
        }
    });

    const exportBtn = Components.Button('Export PDF', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Exporting',
                message: `Exporting "${runbook.title}" to PDF...`,
                duration: 2000
            });
        }
    });

    actions.appendChild(editBtn);
    actions.appendChild(exportBtn);
    container.appendChild(actions);

    return container;
}

// Simple markdown to HTML converter
function markdownToHTML(markdown) {
    return markdown
        .replace(/^# (.*$)/gim, '<h3 style="color: var(--primary); margin-top: 24px; margin-bottom: 12px;">$1</h3>')
        .replace(/^## (.*$)/gim, '<h4 style="color: var(--text-primary); margin-top: 20px; margin-bottom: 10px;">$1</h4>')
        .replace(/^### (.*$)/gim, '<h5 style="color: var(--text-primary); margin-top: 16px; margin-bottom: 8px;">$1</h5>')
        .replace(/^\- (.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 4px; list-style: decimal;">$1</li>')
        .replace(/\n\n/g, '<br><br>');
}
