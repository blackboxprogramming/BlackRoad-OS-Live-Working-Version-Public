/**
 * BlackRoad UI Components
 * Reusable UI components and helpers
 */

class UIComponents {
  constructor() {
    this.state = window.StateManager;
    this.notifications = null;
    this.initNotificationContainer();
  }

  // ========================================
  // Notifications
  // ========================================

  initNotificationContainer() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
      this.notifications = container;

      // Subscribe to notifications
      this.state.subscribe('ui.notifications', (notifications) => {
        this.renderNotifications(notifications);
      });
    }
  }

  renderNotifications(notifications) {
    if (!this.notifications) return;

    this.notifications.innerHTML = '';

    notifications.forEach(notif => {
      const el = this.createNotification(notif);
      this.notifications.appendChild(el);
    });
  }

  createNotification(notif) {
    const div = document.createElement('div');
    div.className = `notification notification-${notif.type}`;
    div.style.cssText = `
      background: var(--bg-card, #13161d);
      border: 1px solid ${this.getNotificationColor(notif.type)};
      border-radius: 10px;
      padding: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      cursor: pointer;
    `;

    div.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <div style="font-size: 18px;">${this.getNotificationIcon(notif.type)}</div>
        <div style="flex: 1;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary, #e6edf3);">
            ${notif.title}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary, #8b949e);">
            ${notif.message}
          </div>
        </div>
        <button style="background: none; border: none; color: var(--text-muted, #484f58); cursor: pointer; font-size: 16px; padding: 0;">×</button>
      </div>
    `;

    div.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.removeNotification(notif.id);
    });

    div.addEventListener('click', () => {
      this.state.removeNotification(notif.id);
    });

    return div;
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  getNotificationColor(type) {
    const colors = {
      success: 'rgba(57,211,83,0.3)',
      error: 'rgba(248,81,73,0.3)',
      warning: 'rgba(210,153,34,0.3)',
      info: 'rgba(88,166,255,0.3)'
    };
    return colors[type] || colors.info;
  }

  // ========================================
  // Loading Spinner
  // ========================================

  showLoading(text = 'Loading...') {
    let spinner = document.getElementById('global-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.id = 'global-spinner';
      spinner.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(10,10,15,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      document.body.appendChild(spinner);
    }

    spinner.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 48px; height: 48px; border: 3px solid rgba(233,30,140,0.2); border-top-color: #e91e8c; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text-secondary, #8b949e);">${text}</div>
      </div>
    `;
    spinner.style.display = 'flex';

    // Add spin animation if not exists
    if (!document.getElementById('spin-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spin-keyframes';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }
  }

  hideLoading() {
    const spinner = document.getElementById('global-spinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  }

  // ========================================
  // Modal
  // ========================================

  showModal(options) {
    const { title, content, buttons = [], width = '500px' } = options;

    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      animation: fadeIn 0.2s ease;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--bg-terminal, #0d1117);
      border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
      border-radius: 14px;
      width: ${width};
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      animation: scaleIn 0.2s ease;
    `;

    const header = `
      <div style="padding: 20px; border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.08));">
        <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary, #e6edf3);">${title}</h3>
      </div>
    `;

    const body = `
      <div style="padding: 20px;">
        ${content}
      </div>
    `;

    const footer = buttons.length > 0 ? `
      <div style="padding: 16px 20px; border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.08)); display: flex; gap: 10px; justify-content: flex-end;">
        ${buttons.map((btn, i) => `
          <button data-action="${i}" style="
            padding: 10px 18px;
            background: ${btn.primary ? 'linear-gradient(135deg, #f7931a 0%, #e91e8c 50%, #9945ff 100%)' : 'var(--bg-input, #161b22)'};
            border: ${btn.primary ? 'none' : '1px solid var(--border-subtle, rgba(255,255,255,0.08))'};
            border-radius: 8px;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            color: ${btn.primary ? 'white' : 'var(--text-primary, #e6edf3)'};
            cursor: pointer;
            transition: all 0.15s;
          ">${btn.label}</button>
        `).join('')}
      </div>
    ` : '';

    modal.innerHTML = header + body + footer;

    buttons.forEach((btn, i) => {
      const btnEl = modal.querySelector(`[data-action="${i}"]`);
      if (btnEl && btn.onClick) {
        btnEl.addEventListener('click', () => {
          btn.onClick();
          this.closeModal();
        });
      }
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeModal();
      }
    });

    // Add animations
    if (!document.getElementById('modal-keyframes')) {
      const style = document.createElement('style');
      style.id = 'modal-keyframes';
      style.textContent = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); } to { transform: scale(1); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `;
      document.head.appendChild(style);
    }
  }

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // ========================================
  // Form Helpers
  // ========================================

  createFormField(options) {
    const { label, type = 'text', id, placeholder = '', required = false, value = '' } = options;

    return `
      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; color: var(--text-muted, #484f58); text-transform: uppercase; margin-bottom: 6px; display: block;">
          ${label} ${required ? '<span style="color: var(--accent-red, #f85149);">*</span>' : ''}
        </label>
        <input
          type="${type}"
          id="${id}"
          placeholder="${placeholder}"
          ${required ? 'required' : ''}
          value="${value}"
          style="
            width: 100%;
            padding: 12px;
            background: var(--bg-input, #161b22);
            border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
            border-radius: 8px;
            font-family: inherit;
            font-size: 13px;
            color: var(--text-primary, #e6edf3);
          "
        >
      </div>
    `;
  }

  createSelectField(options) {
    const { label, id, items, required = false, value = '' } = options;

    return `
      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; color: var(--text-muted, #484f58); text-transform: uppercase; margin-bottom: 6px; display: block;">
          ${label} ${required ? '<span style="color: var(--accent-red, #f85149);">*</span>' : ''}
        </label>
        <select
          id="${id}"
          ${required ? 'required' : ''}
          style="
            width: 100%;
            padding: 12px;
            background: var(--bg-input, #161b22);
            border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
            border-radius: 8px;
            font-family: inherit;
            font-size: 13px;
            color: var(--text-primary, #e6edf3);
          "
        >
          ${items.map(item => `
            <option value="${item.value}" ${item.value === value ? 'selected' : ''}>
              ${item.label}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }

  createTextarea(options) {
    const { label, id, placeholder = '', required = false, value = '', rows = 4 } = options;

    return `
      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; color: var(--text-muted, #484f58); text-transform: uppercase; margin-bottom: 6px; display: block;">
          ${label} ${required ? '<span style="color: var(--accent-red, #f85149);">*</span>' : ''}
        </label>
        <textarea
          id="${id}"
          placeholder="${placeholder}"
          ${required ? 'required' : ''}
          rows="${rows}"
          style="
            width: 100%;
            padding: 12px;
            background: var(--bg-input, #161b22);
            border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
            border-radius: 8px;
            font-family: inherit;
            font-size: 13px;
            color: var(--text-primary, #e6edf3);
            resize: vertical;
          "
        >${value}</textarea>
      </div>
    `;
  }

  // ========================================
  // Status Badges
  // ========================================

  createStatusBadge(status, customColors = {}) {
    const colors = {
      active: 'var(--accent-cyan, #39d353)',
      idle: 'var(--accent-blue, #58a6ff)',
      error: 'var(--accent-red, #f85149)',
      warning: 'var(--accent-yellow, #d29922)',
      ...customColors
    };

    const color = colors[status] || colors.idle;

    return `
      <span style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: ${color}15;
        border: 1px solid ${color}30;
        border-radius: 4px;
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        color: ${color};
        text-transform: uppercase;
      ">
        <span style="width: 5px; height: 5px; background: ${color}; border-radius: 50%;"></span>
        ${status}
      </span>
    `;
  }

  // ========================================
  // Empty States
  // ========================================

  createEmptyState(options) {
    const { icon = '📭', title, message, action } = options;

    return `
      <div style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 64px; margin-bottom: 16px;">${icon}</div>
        <div style="font-size: 16px; font-weight: 600; color: var(--text-primary, #e6edf3); margin-bottom: 8px;">
          ${title}
        </div>
        <div style="font-size: 13px; color: var(--text-muted, #484f58); margin-bottom: 24px;">
          ${message}
        </div>
        ${action ? `
          <button onclick="${action.onClick}" style="
            padding: 12px 24px;
            background: linear-gradient(135deg, #f7931a 0%, #e91e8c 50%, #9945ff 100%);
            border: none;
            border-radius: 8px;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            color: white;
            cursor: pointer;
          ">
            ${action.label}
          </button>
        ` : ''}
      </div>
    `;
  }
}

// Create global instance
window.UIComponents = new UIComponents();

// Subscribe to loading state
window.StateManager.subscribe('ui.loading', (loading) => {
  if (loading) {
    window.UIComponents.showLoading();
  } else {
    window.UIComponents.hideLoading();
  }
});
