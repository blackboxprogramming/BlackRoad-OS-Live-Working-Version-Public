/**
 * Settings App
 * System preferences, theme controls, API configuration
 * TODO: Add user profile management
 * TODO: Add keyboard shortcuts customization
 * TODO: Add backup/restore settings
 */

window.SettingsApp = function() {
    const appId = 'settings';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const resetBtn = Components.Button('Reset to Defaults', {
        type: 'danger',
        onClick: () => {
            if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                window.OS.showNotification({
                    type: 'warning',
                    title: 'Settings Reset',
                    message: 'All settings restored to defaults',
                    duration: 3000
                });
            }
        }
    });

    const saveBtn = Components.Button('Save Changes', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'success',
                title: 'Settings Saved',
                message: 'Your preferences have been saved',
                duration: 2000
            });
        }
    });

    toolbar.appendChild(resetBtn);
    toolbar.appendChild(saveBtn);

    // Create content
    const sidebar = createSettingsSidebar();
    const content = createSettingsContent();

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Settings',
        icon: '⚙️',
        toolbar: toolbar,
        content: Components.SidebarLayout(sidebar, content),
        width: '700px',
        height: '600px',
        noPadding: true
    });
};

function createSettingsSidebar() {
    const sidebar = document.createElement('div');

    const sections = [
        { id: 'appearance', icon: '🎨', label: 'Appearance' },
        { id: 'system', icon: '💻', label: 'System' },
        { id: 'api', icon: '🔌', label: 'API Configuration' },
        { id: 'notifications', icon: '🔔', label: 'Notifications' },
        { id: 'about', icon: 'ℹ️', label: 'About' }
    ];

    sections.forEach((section, index) => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        if (index === 0) item.classList.add('active');
        item.innerHTML = `<span>${section.icon}</span> ${section.label}`;
        item.addEventListener('click', () => {
            sidebar.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // TODO: Switch content panel
        });
        sidebar.appendChild(item);
    });

    return sidebar;
}

function createSettingsContent() {
    const container = document.createElement('div');
    container.style.padding = '20px';

    // Appearance Section
    const appearanceSection = document.createElement('div');
    appearanceSection.innerHTML = `
        <h3 style="color: var(--text-primary); margin-bottom: 16px;">Appearance</h3>
        <div class="form-group">
            <label class="form-label">Theme</label>
            <select class="form-select" id="theme-select">
                <option value="tealOS" ${window.ThemeManager.getTheme() === 'tealOS' ? 'selected' : ''}>Teal OS (Default)</option>
                <option value="nightOS" ${window.ThemeManager.getTheme() === 'nightOS' ? 'selected' : ''}>Night OS</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-checkbox">
                <input type="checkbox" checked>
                <span>Enable window animations</span>
            </label>
        </div>
        <div class="form-group">
            <label class="form-checkbox">
                <input type="checkbox" checked>
                <span>Show desktop icons</span>
            </label>
        </div>
        <div class="form-group">
            <label class="form-checkbox">
                <input type="checkbox">
                <span>Auto-hide taskbar</span>
            </label>
        </div>
    `;

    // Wire up theme selector
    setTimeout(() => {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                window.ThemeManager.setTheme(e.target.value);
            });
        }
    }, 100);

    container.appendChild(appearanceSection);

    // System Section
    const systemSection = document.createElement('div');
    systemSection.style.marginTop = '32px';
    systemSection.innerHTML = `
        <h3 style="color: var(--text-primary); margin-bottom: 16px;">System</h3>
        <div class="form-group">
            <label class="form-label">Startup Behavior</label>
            <select class="form-select">
                <option>Show desktop</option>
                <option>Auto-launch Prism Console</option>
                <option>Restore last session</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Notification Duration</label>
            <select class="form-select">
                <option>3 seconds</option>
                <option selected>5 seconds</option>
                <option>10 seconds</option>
                <option>Until dismissed</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-checkbox">
                <input type="checkbox" checked>
                <span>Enable keyboard shortcuts</span>
            </label>
        </div>
    `;

    container.appendChild(systemSection);

    // API Configuration Section
    const apiSection = document.createElement('div');
    apiSection.style.marginTop = '32px';
    apiSection.innerHTML = `
        <h3 style="color: var(--text-primary); margin-bottom: 16px;">API Configuration</h3>
        <div class="form-group">
            <label class="form-label">API Base URL</label>
            <input type="text" class="form-input" value="https://api.blackroad.io/v1" placeholder="https://api.blackroad.io/v1">
        </div>
        <div class="form-group">
            <label class="form-label">API Key</label>
            <input type="password" class="form-input" value="••••••••••••••••" placeholder="Enter API key">
        </div>
        <div class="form-group">
            <label class="form-label">Timeout (ms)</label>
            <input type="number" class="form-input" value="30000" placeholder="30000">
        </div>
    `;

    container.appendChild(apiSection);

    // About Section
    const aboutSection = document.createElement('div');
    aboutSection.style.marginTop = '32px';
    aboutSection.innerHTML = `
        <h3 style="color: var(--text-primary); margin-bottom: 16px;">About BlackRoad OS</h3>
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 64px; margin-bottom: 12px;">◆</div>
            <div style="font-size: 20px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                BlackRoad OS
            </div>
            <div style="color: var(--text-secondary); margin-bottom: 16px;">
                Version ${MockData.diagnostics.osVersion}
            </div>
            <div style="color: var(--text-dim); font-size: 13px;">
                Built on ${MockData.diagnostics.buildDate}
            </div>
        </div>
    `;

    container.appendChild(aboutSection);

    return container;
}
