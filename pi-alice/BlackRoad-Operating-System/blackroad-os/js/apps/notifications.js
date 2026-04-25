/**
 * Notifications App
 * View and manage system notifications and alerts
 * TODO: Add notification filtering
 * TODO: Add notification history
 * TODO: Add notification preferences
 */

window.NotificationsApp = function() {
    const appId = 'notifications';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const markAllReadBtn = Components.Button('Mark All Read', {
        onClick: () => {
            MockData.notifications.forEach(n => n.read = true);
            window.OS.showNotification({
                type: 'success',
                title: 'All Read',
                message: 'All notifications marked as read',
                duration: 2000
            });
            renderContent();
        }
    });

    const focusSelect = document.createElement('select');
    focusSelect.innerHTML = `<option value="normal">Normal</option><option value="deep">Deep Work</option><option value="offline">Offline</option>`;
    focusSelect.onchange = () => {
        const mode = focusSelect.value;
        window.OS.eventBus.emit('notifications:focus', { mode });
        window.OS.showNotification({
            type: 'info',
            title: 'Focus mode',
            message: mode === 'deep' ? 'Only high-importance alerts will interrupt you' : mode === 'offline' ? 'Notifications will quietly queue' : 'All notifications enabled',
            duration: 2000
        });
    };
    focusSelect.setAttribute('aria-label', 'Focus mode');

    toolbar.appendChild(markAllReadBtn);
    toolbar.appendChild(focusSelect);

    // Create content
    const content = document.createElement('div');

    const renderContent = () => {
        content.innerHTML = '';
        content.appendChild(createNotificationsContent());
    };

    renderContent();

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Notifications',
        icon: '🔔',
        toolbar: toolbar,
        content: content,
        width: '500px',
        height: '600px'
    });
};

function createNotificationsContent() {
    const container = document.createElement('div');

    const unreadCount = MockData.notifications.filter(n => !n.read).length;

    const header = document.createElement('div');
    header.style.marginBottom = '16px';
    header.innerHTML = `
        <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 4px;">
            Notifications
        </div>
        <div style="color: var(--text-secondary); font-size: 13px;">
            ${unreadCount} unread • ${MockData.notifications.length} total
        </div>
    `;

    container.appendChild(header);

    // Notifications list
    if (MockData.notifications.length === 0) {
        container.appendChild(Components.EmptyState({
            icon: '🔔',
            title: 'No Notifications',
            text: 'You\'re all caught up!'
        }));
    } else {
        const notificationsList = Components.List(
            MockData.notifications.map(notif => ({
                icon: getNotificationIcon(notif.type),
                title: notif.title,
                subtitle: `${notif.message} • ${notif.timestamp}`,
                actions: createNotificationActions(notif),
                onClick: () => {
                    if (!notif.read) {
                        notif.read = true;
                        window.OS.showNotification({
                            type: 'info',
                            title: 'Marked as Read',
                            message: notif.title,
                            duration: 1500
                        });
                    }
                }
            }))
        );

        // Style unread notifications
        const listItems = notificationsList.querySelectorAll('.list-item');
        listItems.forEach((item, index) => {
            if (!MockData.notifications[index].read) {
                item.style.background = 'var(--bg-surface)';
                item.style.borderLeft = '3px solid var(--primary)';
                item.style.paddingLeft = '9px';
            }
        });

        container.appendChild(notificationsList);
    }

    return container;
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

function createNotificationActions(notif) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '4px';

    const deleteBtn = Components.Button('×', {
        size: 'small',
        onClick: (e) => {
            e.stopPropagation();
            window.OS.showNotification({
                type: 'info',
                title: 'Deleted',
                message: 'Notification removed',
                duration: 1500
            });
        }
    });

    container.appendChild(deleteBtn);

    return container;
}
