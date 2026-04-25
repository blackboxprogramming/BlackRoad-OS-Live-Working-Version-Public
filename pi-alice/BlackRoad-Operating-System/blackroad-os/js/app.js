/**
 * BlackRoad OS Bootloader
 * Initializes the desktop environment and starts core services
 *
 * Responsibilities:
 * - Render desktop icons from app registry
 * - Populate start menu
 * - Setup system tray interactions
 * - Start system clock
 * - Register global keyboard shortcuts
 * - Display welcome notification
 * - Wire up desktop-level event listeners
 *
 * Boot Sequence:
 * 1. OS core (os.js) initializes
 * 2. Theme manager (theme.js) initializes
 * 3. Apps register themselves (apps/*.js)
 * 4. Registry builds app manifest (registry.js)
 * 5. Bootloader renders desktop (this file)
 *
 * This file is loaded LAST to ensure all dependencies are available
 */

class BootLoader {
    constructor() {
        // DOM references
        this.desktopIcons = document.getElementById('desktop-icons');
        this.startButton = document.getElementById('start-button');
        this.startMenu = document.getElementById('start-menu');
        this.systemClock = document.getElementById('system-clock');

        // Keyboard shortcut registry (centralized for maintainability)
        this.shortcuts = [
            { key: 'P', ctrl: true, shift: true, app: 'prism', description: 'Open Prism Console' },
            { key: 'M', ctrl: true, shift: true, app: 'miners', description: 'Open Miners Dashboard' },
            { key: 'E', ctrl: true, shift: true, app: 'engineering', description: 'Open Engineering DevTools' }
            // TODO v0.2.0: Make shortcuts customizable via Settings app
        ];

        this.boot();
    }

    boot() {
        console.log('🚀 Booting BlackRoad OS...');

        // Render desktop environment
        this.renderDesktopIcons();
        this.populateStartMenu();

        // Setup interactions
        this.setupStartMenu();
        this.setupSystemTray();

        // Start services
        this.startClock();

        // Register keyboard shortcuts
        this.registerKeyboardShortcuts();

        // Setup event listeners
        this.setupEventListeners();

        // Show welcome notification
        this.showWelcome();

        console.log('✅ BlackRoad OS ready');
        window.OS.eventBus.emit('os:ready', { timestamp: new Date().toISOString() });
    }

    /**
     * Render desktop icons from app registry
     * Double-click to launch apps
     */
    renderDesktopIcons() {
        const apps = Object.values(AppRegistry);

        apps.forEach(app => {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.dataset.appId = app.id;
            icon.setAttribute('role', 'button');
            icon.setAttribute('tabindex', '0');
            icon.setAttribute('aria-label', `Launch ${app.name}`);

            const iconImage = document.createElement('div');
            iconImage.className = 'desktop-icon-image';
            iconImage.textContent = app.icon;
            iconImage.setAttribute('aria-hidden', 'true');

            const iconLabel = document.createElement('div');
            iconLabel.className = 'desktop-icon-label';
            iconLabel.textContent = app.name;

            icon.appendChild(iconImage);
            icon.appendChild(iconLabel);

            // Double-click to launch (mouse)
            icon.addEventListener('dblclick', () => {
                launchApp(app.id);
            });

            // Enter or Space to launch (keyboard)
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    launchApp(app.id);
                }
            });

            this.desktopIcons.appendChild(icon);
        });

        console.log(`🖥️ Rendered ${apps.length} desktop icons`);
    }

    /**
     * Populate start menu with all apps
     * Click to launch and close menu
     */
    populateStartMenu() {
        const menuApps = document.getElementById('start-menu-apps');
        const apps = Object.values(AppRegistry);

        apps.forEach((app, index) => {
            const item = document.createElement('div');
            item.className = 'start-menu-item';
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '0');

            const icon = document.createElement('div');
            icon.className = 'start-menu-item-icon';
            icon.textContent = app.icon;
            icon.setAttribute('aria-hidden', 'true');

            const details = document.createElement('div');
            details.className = 'start-menu-item-details';

            const name = document.createElement('div');
            name.className = 'start-menu-item-name';
            name.textContent = app.name;

            const desc = document.createElement('div');
            desc.className = 'start-menu-item-desc';
            desc.textContent = app.description;

            details.appendChild(name);
            details.appendChild(desc);

            item.appendChild(icon);
            item.appendChild(details);

            // Click to launch
            item.addEventListener('click', () => {
                launchApp(app.id);
                this.startMenu.style.display = 'none';
            });

            // Keyboard navigation
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    launchApp(app.id);
                    this.startMenu.style.display = 'none';
                }

                // Arrow key navigation within start menu
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = item.nextElementSibling;
                    if (next && next.classList.contains('start-menu-item')) {
                        next.focus();
                    }
                }

                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = item.previousElementSibling;
                    if (prev && prev.classList.contains('start-menu-item')) {
                        prev.focus();
                    }
                }

                // Escape to close menu
                if (e.key === 'Escape') {
                    this.startMenu.style.display = 'none';
                    this.startButton.focus();
                }
            });

            menuApps.appendChild(item);
        });

        console.log(`📋 Populated start menu with ${apps.length} apps`);
    }

    /**
     * Setup start menu toggle and interactions
     */
    setupStartMenu() {
        // Toggle start menu on button click
        this.startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = this.startMenu.style.display === 'block';
            this.startMenu.style.display = isVisible ? 'none' : 'block';

            // Focus first menu item when opening
            if (!isVisible) {
                const firstItem = this.startMenu.querySelector('.start-menu-item');
                if (firstItem) {
                    setTimeout(() => firstItem.focus(), 100);
                }
            }
        });

        // Keyboard support for start button
        this.startButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.startButton.click();
            }
        });

        // Close start menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.startMenu.contains(e.target) && !this.startButton.contains(e.target)) {
                this.startMenu.style.display = 'none';
            }
        });

        // Escape to close start menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.startMenu.style.display === 'block') {
                this.startMenu.style.display = 'none';
                this.startButton.focus();
            }
        });

        // Shutdown button
        const shutdownBtn = document.getElementById('shutdown-btn');
        shutdownBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to shutdown BlackRoad OS?')) {
                window.OS.showNotification({
                    type: 'info',
                    title: 'Shutting Down',
                    message: 'BlackRoad OS is shutting down...',
                    duration: 2000
                });
                setTimeout(() => {
                    // Reload the page to simulate shutdown/restart
                    window.location.reload();
                }, 2000);
            }
        });
    }

    /**
     * Setup system tray icon interactions
     */
    setupSystemTray() {
        // Notifications tray icon
        const notificationsTray = document.getElementById('notifications-tray');
        notificationsTray.addEventListener('click', () => {
            launchApp('notifications');
        });

        // Settings tray icon
        const settingsTray = document.getElementById('settings-tray');
        settingsTray.addEventListener('click', () => {
            launchApp('settings');
        });

        // Update notification badge count
        this.updateNotificationBadge();

        // Update badge periodically (in real app, would listen to events)
        setInterval(() => this.updateNotificationBadge(), 30000);
    }

    /**
     * Update notification badge count
     */
    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        const unreadCount = MockData.notifications.filter(n => !n.read).length;

        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'block';
            badge.setAttribute('aria-label', `${unreadCount} unread notifications`);
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Start system clock (updates every second)
     */
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeString = `${hours}:${minutes}`;

            this.systemClock.textContent = timeString;
            this.systemClock.setAttribute('aria-label', `Current time: ${timeString}`);
        };

        updateClock();
        setInterval(updateClock, 1000);

        console.log('🕐 System clock started');
    }

    /**
     * Register global keyboard shortcuts
     */
    registerKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check each registered shortcut
            this.shortcuts.forEach(shortcut => {
                const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
                const altMatch = shortcut.alt ? e.altKey : !e.altKey;
                const keyMatch = e.key.toUpperCase() === shortcut.key.toUpperCase();

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    e.preventDefault();
                    launchApp(shortcut.app);
                }
            });
        });

        console.log(`⌨️ Registered ${this.shortcuts.length} keyboard shortcuts`);
    }

    /**
     * Show welcome notification on boot
     */
    showWelcome() {
        setTimeout(() => {
            window.OS.showNotification({
                type: 'success',
                title: 'Welcome to BlackRoad OS',
                message: 'System initialized successfully. All services online.',
                duration: 5000
            });
        }, 500);
    }

    /**
     * Setup desktop-level event listeners
     */
    setupEventListeners() {
        // Listen for window lifecycle events
        window.OS.eventBus.on('window:created', (data) => {
            console.log(`🪟 Window created: ${data.windowId}`);
        });

        window.OS.eventBus.on('window:closed', (data) => {
            console.log(`❌ Window closed: ${data.windowId}`);
        });

        window.OS.eventBus.on('theme:changed', (data) => {
            console.log(`🎨 Theme changed: ${data.theme}`);
        });

        // Listen for notification badge updates
        // In a real app, would listen to notification events from backend
        window.OS.eventBus.on('notification:shown', () => {
            // Could update badge here if notifications came from apps
        });
    }

    /**
     * Get list of registered shortcuts (for Settings or Help)
     * @returns {Array} Shortcut definitions
     */
    getShortcuts() {
        return this.shortcuts;
    }
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BootLoader = new BootLoader();
    });
} else {
    window.BootLoader = new BootLoader();
}
