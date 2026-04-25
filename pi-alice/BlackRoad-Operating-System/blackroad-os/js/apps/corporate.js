/**
 * Corporate OS App
 * Department-level management panels
 * TODO: Add HR tools
 * TODO: Add legal document management
 * TODO: Add finance admin dashboards
 */

window.CorporateApp = function() {
    const appId = 'corporate';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const refreshBtn = Components.Button('Refresh', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Refreshing',
                message: 'Updating department data',
                duration: 2000
            });
        }
    });

    toolbar.appendChild(refreshBtn);

    // Create content
    const content = createCorporateContent();

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Corporate OS',
        icon: '🏢',
        toolbar: toolbar,
        content: content,
        width: '800px',
        height: '600px'
    });
};

function createCorporateContent() {
    const container = document.createElement('div');

    const header = document.createElement('div');
    header.style.marginBottom = '24px';
    header.innerHTML = `
        <h2 style="color: var(--text-primary); margin-bottom: 8px;">Department Management</h2>
        <p style="color: var(--text-secondary); font-size: 14px;">
            Access department-specific tools and dashboards
        </p>
    `;

    container.appendChild(header);

    // Department grid
    const departmentsGrid = Components.Grid(3,
        MockData.departments.map(dept => createDepartmentCard(dept))
    );

    container.appendChild(departmentsGrid);

    // Quick Links Section
    const quickLinksSection = document.createElement('div');
    quickLinksSection.style.marginTop = '32px';
    quickLinksSection.innerHTML = `
        <h3 style="color: var(--text-primary); margin-bottom: 16px;">Quick Links</h3>
    `;

    const quickLinks = Components.List([
        {
            icon: '📋',
            title: 'Company Policies',
            subtitle: 'View and manage corporate policies',
            actions: Components.Button('Open', { size: 'small' })
        },
        {
            icon: '📊',
            title: 'Organization Chart',
            subtitle: 'View company hierarchy',
            actions: Components.Button('Open', { size: 'small' })
        },
        {
            icon: '📅',
            title: 'Corporate Calendar',
            subtitle: 'Important dates and events',
            actions: Components.Button('Open', { size: 'small' })
        },
        {
            icon: '📧',
            title: 'Internal Communications',
            subtitle: 'Company-wide announcements',
            actions: Components.Button('Open', { size: 'small' })
        }
    ]);

    quickLinksSection.appendChild(quickLinks);
    container.appendChild(quickLinksSection);

    return container;
}

function createDepartmentCard(dept) {
    const content = document.createElement('div');
    content.style.textAlign = 'center';
    content.style.padding = '20px';

    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.style.marginBottom = '12px';
    icon.textContent = dept.icon;

    const name = document.createElement('div');
    name.style.fontSize = '16px';
    name.style.fontWeight = '600';
    name.style.color = 'var(--text-primary)';
    name.style.marginBottom = '16px';
    name.textContent = dept.name;

    const openBtn = Components.Button('Open Dashboard', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: `${dept.name} dashboard will be available in v0.2`,
                duration: 3000
            });
        }
    });

    content.appendChild(icon);
    content.appendChild(name);
    content.appendChild(openBtn);

    const card = Components.Card({ content });
    card.style.cursor = 'pointer';
    card.style.borderColor = dept.color;
    card.addEventListener('mouseenter', () => {
        card.style.borderColor = dept.color;
        card.style.transform = 'translateY(-2px)';
        card.style.transition = 'all 0.2s';
    });
    card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--border-color)';
        card.style.transform = 'translateY(0)';
    });

    return card;
}
