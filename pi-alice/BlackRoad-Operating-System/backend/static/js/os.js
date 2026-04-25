/**
 * BlackRoad OS - Window Manager & Event Bus
 * Core operating system functionality for window management and global events
 *
 * Features:
 * - Window lifecycle management (create, focus, minimize, restore, close)
 * - Drag-and-drop window positioning
 * - Z-index management with overflow protection
 * - Event bus for app communication
 * - Notification system
 * - Keyboard navigation and shortcuts
 *
 * Architecture:
 * - Uses Map for O(1) window lookups
 * - Event-driven design for loose coupling
 * - Accessible-first with ARIA attributes
 *
 * TODO v0.3.0: Add window resizing support
 * TODO v0.3.0: Add window snapping/tiling
 * TODO v0.3.0: Add window position persistence (localStorage)
 *
 * v0.2.0 Features:
 * - Window maximize functionality (toggle between normal and maximized states)
 * - Double-click titlebar to maximize
 * - Keyboard shortcut support for maximize
 */

class BlackRoadOS {
    constructor() {
        this.windows = new Map(); // windowId -> { id, element, title, icon, minimized }
        this.zIndexCounter = 100;
        this.zIndexMax = 9999; // Prevent overflow
        this.eventBus = new EventEmitter();
        this.windowsContainer = null;
        this.taskbarWindows = null;
        this.commandPalette = null;

        // App lifecycle hooks registry
        this.lifecycleHooks = {
            onWindowCreated: [],
            onWindowFocused: [],
            onWindowMinimized: [],
            onWindowRestored: [],
            onWindowClosed: []
        };

        this.init();
    }

    init() {
        this.windowsContainer = document.getElementById('windows-container');
        this.taskbarWindows = document.getElementById('taskbar-windows');

        // Inject required CSS for dynamic window management
        this.injectStyles();

        // Setup global event listeners
        this.setupGlobalListeners();

        // Emit boot event
        this.eventBus.emit('os:boot', { timestamp: new Date().toISOString() });
        console.log('✅ BlackRoad OS initialized');
    }

    /**
     * Inject required CSS styles for window management
     */
    injectStyles() {
        // Check if styles are already injected
        if (document.getElementById('blackroad-os-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'blackroad-os-styles';
        styles.textContent = `
            /* BlackRoad OS Window Manager Styles */

            .os-window {
                position: absolute;
                background: var(--br95-gray, #181c2a);
                border-radius: 10px;
                border-top: 2px solid var(--br95-border-light, #4b5378);
                border-left: 2px solid var(--br95-border-light, #4b5378);
                border-right: 2px solid var(--br95-border-darkest, #000000);
                border-bottom: 2px solid var(--br95-border-darkest, #000000);
                box-shadow: inset 1px 1px 0 var(--br95-gray-lighter, #2f3554), 0 14px 40px rgba(0,0,0,0.7);
                min-width: 320px;
                min-height: 200px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: box-shadow 0.15s ease;
            }

            .os-window.focused {
                box-shadow: inset 1px 1px 0 var(--br95-gray-lighter, #2f3554),
                            0 14px 40px rgba(0,0,0,0.8),
                            0 0 0 2px rgba(105,247,255,0.16);
            }

            .os-window.minimized {
                display: none;
            }

            .os-window.opening {
                animation: windowOpen 0.2s ease-out;
            }

            @keyframes windowOpen {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            /* Maximized window state */
            .os-window.maximized {
                border-radius: 0 !important;
                transition: none;
            }

            .os-window.maximized .window-titlebar {
                border-radius: 0;
            }

            /* Window titlebar */
            .window-titlebar {
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 3px 6px;
                background: linear-gradient(90deg,
                    var(--br-accent-warm, #FF9D00),
                    var(--br-accent-mid, #FF006B),
                    var(--br-accent-cool, #0066FF));
                color: var(--br-white, #ffffff);
                cursor: move;
                user-select: none;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }

            .os-window.maximized .window-titlebar {
                cursor: default;
            }

            .window-titlebar-left {
                display: flex;
                align-items: center;
                gap: 6px;
                overflow: hidden;
            }

            .window-icon {
                font-size: 16px;
                flex-shrink: 0;
            }

            .window-title {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-shadow: 0 1px 2px rgba(0,0,0,0.6);
            }

            /* Window controls */
            .window-controls {
                display: flex;
                gap: 2px;
                flex-shrink: 0;
            }

            .window-control-btn {
                width: 20px;
                height: 20px;
                background: var(--br95-gray-light, #232842);
                border-top: 1px solid var(--br95-border-light, #4b5378);
                border-left: 1px solid var(--br95-border-light, #4b5378);
                border-right: 1px solid var(--br95-border-darkest, #000000);
                border-bottom: 1px solid var(--br95-border-darkest, #000000);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 700;
                color: var(--br-black, #02030a);
                cursor: pointer;
                box-shadow: inset 1px 1px 0 rgba(255,255,255,0.4);
                transition: transform 0.1s ease;
            }

            .window-control-btn:hover {
                background: var(--br95-gray-lighter, #2f3554);
            }

            .window-control-btn:active {
                border-top: 1px solid var(--br95-border-darkest, #000000);
                border-left: 1px solid var(--br95-border-darkest, #000000);
                border-right: 1px solid var(--br95-border-light, #4b5378);
                border-bottom: 1px solid var(--br95-border-light, #4b5378);
                box-shadow: inset 1px 1px 2px rgba(0,0,0,0.4);
            }

            .window-control-btn.close:hover {
                background: #e74c3c;
                color: white;
            }

            /* Window content */
            .window-content {
                flex: 1;
                background: var(--br-bg-elevated, #050816);
                padding: 12px;
                color: var(--br-white, #ffffff);
                font-size: 13px;
                overflow: auto;
            }

            .window-content.no-padding {
                padding: 0;
            }

            /* Taskbar window buttons */
            .taskbar-window-button {
                min-width: 100px;
                max-width: 160px;
                height: 28px;
                background: var(--br95-gray, #181c2a);
                border-top: 2px solid var(--br95-border-light, #4b5378);
                border-left: 2px solid var(--br95-border-light, #4b5378);
                border-right: 2px solid var(--br95-border-darkest, #000000);
                border-bottom: 2px solid var(--br95-border-darkest, #000000);
                padding: 0 10px;
                display: flex;
                align-items: center;
                font-size: 12px;
                color: var(--br-white, #ffffff);
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                box-shadow: inset 1px 1px 0 rgba(255,255,255,0.25);
            }

            .taskbar-window-button.active {
                border-top: 2px solid var(--br95-border-darkest, #000000);
                border-left: 2px solid var(--br95-border-darkest, #000000);
                border-right: 2px solid var(--br95-border-light, #4b5378);
                border-bottom: 2px solid var(--br95-border-light, #4b5378);
                box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5);
                background: var(--br95-gray-lighter, #2f3554);
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Setup global keyboard shortcuts and event listeners
     */
    setupGlobalListeners() {
        // Close focused window on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const focusedWindow = this.getFocusedWindow();
                if (focusedWindow) {
                    this.closeWindow(focusedWindow.id);
                }
            }
        });

        // Command palette on Ctrl+K (future feature)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.toggleCommandPalette();
            }
        });

        // Click on desktop to unfocus all windows
        document.getElementById('desktop')?.addEventListener('click', (e) => {
            if (e.target.id === 'desktop' || e.target.classList.contains('desktop-icons')) {
                this.unfocusAllWindows();
            }
        });
    }

    /**
     * Register a lifecycle hook
     * @param {string} hookName - onWindowCreated, onWindowFocused, etc.
     * @param {Function} callback - Function to call when event occurs
     */
    registerLifecycleHook(hookName, callback) {
        if (this.lifecycleHooks[hookName]) {
            this.lifecycleHooks[hookName].push(callback);
        } else {
            console.warn(`Unknown lifecycle hook: ${hookName}`);
        }
    }

    /**
     * Call all registered lifecycle hooks for an event
     * @param {string} hookName - The hook name
     * @param {Object} data - Data to pass to callbacks
     */
    callLifecycleHooks(hookName, data) {
        if (this.lifecycleHooks[hookName]) {
            this.lifecycleHooks[hookName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in lifecycle hook ${hookName}:`, error);
                }
            });
        }
    }

    /**
     * Create a new window or focus existing one
     * @param {Object} options - Window configuration
     * @param {string} options.id - Unique window identifier (recommended to match app ID)
     * @param {string} options.title - Window title
     * @param {string} options.icon - Icon emoji or HTML
     * @param {HTMLElement|string} options.content - Window content
     * @param {string} options.width - CSS width (default: '800px')
     * @param {string} options.height - CSS height (default: '600px')
     * @param {number} options.x - X position in pixels (optional, will center if not provided)
     * @param {number} options.y - Y position in pixels (optional, will center if not provided)
     * @param {HTMLElement} options.toolbar - Optional toolbar element
     * @param {HTMLElement} options.statusBar - Optional status bar element
     * @param {boolean} options.noPadding - Remove padding from content area
     * @returns {string} windowId
     */
    createWindow(options) {
        const windowId = options.id || `window_${Date.now()}`;

        // Window deduplication: if window already exists, focus it instead of creating duplicate
        if (this.windows.has(windowId)) {
            console.log(`🔄 Window "${windowId}" already exists - focusing existing instance`);
            const windowData = this.windows.get(windowId);

            // If minimized, restore it
            if (windowData.minimized) {
                this.restoreWindow(windowId);
            } else {
                this.focusWindow(windowId);
            }

            return windowId;
        }

        // Create window element
        const windowEl = document.createElement('div');
        windowEl.className = 'os-window opening';
        windowEl.id = windowId;
        windowEl.setAttribute('role', 'dialog');
        windowEl.setAttribute('aria-label', options.title || 'Untitled Window');
        windowEl.style.width = options.width || '800px';
        windowEl.style.height = options.height || '600px';

        // Position window: use provided coords or center with cascade offset
        if (options.x !== undefined && options.y !== undefined) {
            windowEl.style.left = `${options.x}px`;
            windowEl.style.top = `${options.y}px`;
        } else {
            // Center with cascade offset to avoid perfect stacking
            const offsetX = (this.windows.size * 30) % 100;
            const offsetY = (this.windows.size * 30) % 100;
            windowEl.style.left = `calc(50% - ${parseInt(options.width || 800) / 2}px + ${offsetX}px)`;
            windowEl.style.top = `calc(50% - ${parseInt(options.height || 600) / 2}px + ${offsetY}px)`;
        }

        windowEl.style.zIndex = this.getNextZIndex();

        // Create titlebar
        const titlebar = this.createTitlebar(windowId, options);
        windowEl.appendChild(titlebar);

        // Toolbar (if provided)
        if (options.toolbar) {
            windowEl.appendChild(options.toolbar);
        }

        // Window content
        const content = document.createElement('div');
        content.className = 'window-content';
        if (options.noPadding) {
            content.classList.add('no-padding');
        }
        if (typeof options.content === 'string') {
            content.innerHTML = options.content;
        } else if (options.content instanceof HTMLElement) {
            content.appendChild(options.content);
        }
        windowEl.appendChild(content);

        // Status bar (if provided)
        if (options.statusBar) {
            windowEl.appendChild(options.statusBar);
        }

        // Make draggable
        this.makeDraggable(windowEl, titlebar);

        // Add to container
        this.windowsContainer.appendChild(windowEl);

        // Store window data
        this.windows.set(windowId, {
            id: windowId,
            element: windowEl,
            title: options.title,
            icon: options.icon,
            minimized: false,
            maximized: false,
            // Store original bounds for restore after maximize
            originalBounds: {
                left: windowEl.style.left,
                top: windowEl.style.top,
                width: windowEl.style.width,
                height: windowEl.style.height
            }
        });

        // Add to taskbar
        this.addToTaskbar(windowId);

        // Focus window
        this.focusWindow(windowId);

        // Emit events
        this.eventBus.emit('window:created', { windowId, title: options.title });
        this.callLifecycleHooks('onWindowCreated', { windowId, title: options.title });

        // Remove opening animation class after animation completes
        setTimeout(() => {
            windowEl.classList.remove('opening');
        }, 200);

        console.log(`✨ Created window: "${options.title}" (${windowId})`);

        return windowId;
    }

    /**
     * Create window titlebar with controls
     * @param {string} windowId - Window identifier
     * @param {Object} options - Window options
     * @returns {HTMLElement} Titlebar element
     */
    createTitlebar(windowId, options) {
        const titlebar = document.createElement('div');
        titlebar.className = 'window-titlebar';

        // Double-click titlebar to toggle maximize
        titlebar.addEventListener('dblclick', (e) => {
            // Don't maximize if double-clicking on controls
            if (e.target.classList.contains('window-control-btn') || e.target.tagName === 'BUTTON') {
                return;
            }
            this.toggleMaximizeWindow(windowId);
        });

        const titlebarLeft = document.createElement('div');
        titlebarLeft.className = 'window-titlebar-left';

        if (options.icon) {
            const icon = document.createElement('div');
            icon.className = 'window-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.innerHTML = options.icon;
            titlebarLeft.appendChild(icon);
        }

        const title = document.createElement('div');
        title.className = 'window-title';
        title.textContent = options.title || 'Untitled Window';
        titlebarLeft.appendChild(title);

        titlebar.appendChild(titlebarLeft);

        // Window controls
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Window controls');

        // Minimize button
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'window-control-btn minimize';
        minimizeBtn.innerHTML = '−';
        minimizeBtn.setAttribute('aria-label', 'Minimize window');
        minimizeBtn.title = 'Minimize';
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(windowId);
        });

        // Maximize button
        const maximizeBtn = document.createElement('button');
        maximizeBtn.className = 'window-control-btn maximize';
        maximizeBtn.innerHTML = '□';
        maximizeBtn.setAttribute('aria-label', 'Maximize window');
        maximizeBtn.title = 'Maximize';
        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximizeWindow(windowId);
        });

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'window-control-btn close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close window');
        closeBtn.title = 'Close';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(windowId);
        });

        controls.appendChild(minimizeBtn);
        controls.appendChild(maximizeBtn);
        controls.appendChild(closeBtn);

        titlebar.appendChild(controls);

        return titlebar;
    }

    /**
     * Make window draggable via titlebar
     * @param {HTMLElement} windowEl - Window element
     * @param {HTMLElement} handle - Drag handle (titlebar)
     */
    makeDraggable(windowEl, handle) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        handle.addEventListener('mousedown', (e) => {
            // Don't drag if clicking on buttons or other interactive elements
            if (e.target.classList.contains('window-control-btn') || e.target.tagName === 'BUTTON') {
                return;
            }

            // Don't start drag if window is maximized
            const windowData = this.windows.get(windowEl.id);
            if (windowData?.maximized) {
                return;
            }

            isDragging = true;
            initialX = e.clientX - windowEl.offsetLeft;
            initialY = e.clientY - windowEl.offsetTop;

            // Focus window when drag starts
            this.focusWindow(windowEl.id);

            // Change cursor
            handle.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Prevent dragging completely off-screen
            // Keep at least 100px of window visible
            const minVisible = 100;
            currentX = Math.max(-windowEl.offsetWidth + minVisible, Math.min(currentX, window.innerWidth - minVisible));
            currentY = Math.max(0, Math.min(currentY, window.innerHeight - 100));

            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.style.cursor = 'move';
            }
        });
    }

    /**
     * Get next z-index with overflow protection
     * @returns {number} Next z-index value
     */
    getNextZIndex() {
        if (this.zIndexCounter >= this.zIndexMax) {
            // Reset z-index when we hit max, re-layer all windows
            console.log('🔄 Z-index overflow protection: resetting window layers');
            this.reindexWindows();
        }
        return this.zIndexCounter++;
    }

    /**
     * Reindex all windows to prevent z-index overflow
     * Maintains relative stacking order
     */
    reindexWindows() {
        const sortedWindows = Array.from(this.windows.values())
            .sort((a, b) => parseInt(a.element.style.zIndex) - parseInt(b.element.style.zIndex));

        this.zIndexCounter = 100;
        sortedWindows.forEach(windowData => {
            windowData.element.style.zIndex = this.zIndexCounter++;
        });
    }

    /**
     * Focus a window (bring to front)
     * @param {string} windowId - Window identifier
     */
    focusWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) {
            console.warn(`Cannot focus - window not found: ${windowId}`);
            return;
        }

        // Update z-index to bring to front
        windowData.element.style.zIndex = this.getNextZIndex();

        // Update visual states (only one window should be focused)
        this.windows.forEach((w, id) => {
            w.element.classList.toggle('focused', id === windowId);
        });

        // Update taskbar button states
        this.updateTaskbar();

        // Emit events
        this.eventBus.emit('window:focused', { windowId });
        this.callLifecycleHooks('onWindowFocused', { windowId });
    }

    /**
     * Unfocus all windows
     */
    unfocusAllWindows() {
        this.windows.forEach(windowData => {
            windowData.element.classList.remove('focused');
        });
        this.updateTaskbar();
    }

    /**
     * Minimize a window
     * @param {string} windowId - Window identifier
     */
    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        windowData.minimized = true;
        windowData.element.classList.add('minimized');

        this.updateTaskbar();

        // Emit events
        this.eventBus.emit('window:minimized', { windowId });
        this.callLifecycleHooks('onWindowMinimized', { windowId });
    }

    /**
     * Restore a minimized window
     * @param {string} windowId - Window identifier
     */
    restoreWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        windowData.minimized = false;
        windowData.element.classList.remove('minimized');

        // Focus when restoring
        this.focusWindow(windowId);

        // Emit events
        this.eventBus.emit('window:restored', { windowId });
        this.callLifecycleHooks('onWindowRestored', { windowId });
    }

    /**
     * Toggle window maximize state
     * @param {string} windowId - Window identifier
     */
    toggleMaximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        if (windowData.maximized) {
            this.unmaximizeWindow(windowId);
        } else {
            this.maximizeWindow(windowId);
        }
    }

    /**
     * Maximize a window to fill the available space
     * @param {string} windowId - Window identifier
     */
    maximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData || windowData.maximized) return;

        const windowEl = windowData.element;

        // Store current bounds for restore (update in case window was moved/resized)
        windowData.originalBounds = {
            left: windowEl.style.left,
            top: windowEl.style.top,
            width: windowEl.style.width,
            height: windowEl.style.height
        };

        // Calculate available space (excluding taskbar at bottom)
        // Taskbar is typically 40px, menubar is ~36px
        const menubarHeight = document.querySelector('.menubar')?.offsetHeight || 36;
        const taskbarHeight = document.querySelector('.taskbar')?.offsetHeight || 40;

        // Apply maximized state
        windowEl.style.left = '0';
        windowEl.style.top = `${menubarHeight}px`;
        windowEl.style.width = '100%';
        windowEl.style.height = `calc(100vh - ${menubarHeight}px - ${taskbarHeight}px)`;

        // Add maximized class for styling
        windowEl.classList.add('maximized');
        windowData.maximized = true;

        // Update maximize button icon to restore icon
        const maximizeBtn = windowEl.querySelector('.window-control-btn.maximize');
        if (maximizeBtn) {
            maximizeBtn.innerHTML = '❐';  // Restore/overlap icon
            maximizeBtn.title = 'Restore';
            maximizeBtn.setAttribute('aria-label', 'Restore window');
        }

        // Focus the window
        this.focusWindow(windowId);

        // Emit events
        this.eventBus.emit('window:maximized', { windowId });

        console.log(`⬜ Maximized window: "${windowData.title}" (${windowId})`);
    }

    /**
     * Restore a maximized window to its original size
     * @param {string} windowId - Window identifier
     */
    unmaximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData || !windowData.maximized) return;

        const windowEl = windowData.element;
        const bounds = windowData.originalBounds;

        // Restore original bounds
        windowEl.style.left = bounds.left;
        windowEl.style.top = bounds.top;
        windowEl.style.width = bounds.width;
        windowEl.style.height = bounds.height;

        // Remove maximized class
        windowEl.classList.remove('maximized');
        windowData.maximized = false;

        // Update maximize button icon back to maximize icon
        const maximizeBtn = windowEl.querySelector('.window-control-btn.maximize');
        if (maximizeBtn) {
            maximizeBtn.innerHTML = '□';  // Maximize icon
            maximizeBtn.title = 'Maximize';
            maximizeBtn.setAttribute('aria-label', 'Maximize window');
        }

        // Emit events
        this.eventBus.emit('window:unmaximized', { windowId });

        console.log(`⬛ Restored window: "${windowData.title}" (${windowId})`);
    }

    /**
     * Close a window
     * @param {string} windowId - Window identifier
     */
    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        const windowTitle = windowData.title;

        // Emit events before removal (so apps can clean up)
        this.eventBus.emit('window:closed', { windowId, title: windowTitle });
        this.callLifecycleHooks('onWindowClosed', { windowId, title: windowTitle });

        // Remove from DOM
        windowData.element.remove();

        // Remove from windows map
        this.windows.delete(windowId);

        // Update taskbar (will remove button)
        this.updateTaskbar();

        console.log(`❌ Closed window: "${windowTitle}" (${windowId})`);
    }

    /**
     * Add window to taskbar
     * @param {string} windowId - Window identifier
     */
    addToTaskbar(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        const btn = document.createElement('button');
        btn.className = 'taskbar-window-button';
        btn.id = `taskbar-${windowId}`;
        btn.textContent = windowData.title;
        btn.setAttribute('aria-label', `${windowData.title} window`);
        btn.setAttribute('role', 'button');

        btn.addEventListener('click', () => {
            if (windowData.minimized) {
                this.restoreWindow(windowId);
            } else {
                // If already focused, minimize; otherwise focus
                if (windowData.element.classList.contains('focused')) {
                    this.minimizeWindow(windowId);
                } else {
                    this.focusWindow(windowId);
                }
            }
        });

        // Keyboard navigation for taskbar buttons
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });

        this.taskbarWindows.appendChild(btn);
    }

    /**
     * Update taskbar button states to match window states
     */
    updateTaskbar() {
        this.windows.forEach((windowData, windowId) => {
            const btn = document.getElementById(`taskbar-${windowId}`);
            if (btn) {
                // Update active state
                btn.classList.toggle('active', windowData.element.classList.contains('focused'));

                // Update visual opacity for minimized windows
                btn.style.opacity = windowData.minimized ? '0.6' : '1';

                // Update ARIA state
                btn.setAttribute('aria-pressed', windowData.element.classList.contains('focused') ? 'true' : 'false');
            }
        });

        // Remove buttons for closed windows
        this.taskbarWindows.querySelectorAll('.taskbar-window-button').forEach(btn => {
            const windowId = btn.id.replace('taskbar-', '');
            if (!this.windows.has(windowId)) {
                btn.remove();
            }
        });
    }

    /**
     * Get currently focused window
     * @returns {Object|null} Window data or null if no window is focused
     */
    getFocusedWindow() {
        for (let [id, data] of this.windows) {
            if (data.element.classList.contains('focused')) {
                return data;
            }
        }
        return null;
    }

    /**
     * Get window by ID
     * @param {string} windowId - Window identifier
     * @returns {Object|null} Window data or null
     */
    getWindow(windowId) {
        return this.windows.get(windowId) || null;
    }

    /**
     * Get all open windows
     * @returns {Array} Array of window data objects
     */
    getAllWindows() {
        return Array.from(this.windows.values());
    }

    /**
     * Toggle global command palette for unified search
     */
    toggleCommandPalette() {
        if (!this.commandPalette) {
            this.buildCommandPalette();
        }
        const isVisible = this.commandPalette.classList.contains('open');
        if (isVisible) {
            this.commandPalette.classList.remove('open');
        } else {
            this.commandPalette.classList.add('open');
            const input = this.commandPalette.querySelector('input');
            input.value = '';
            input.focus();
            this.populatePaletteResults('');
        }
    }

    buildCommandPalette() {
        this.commandPalette = document.createElement('div');
        this.commandPalette.className = 'command-palette';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search apps, notes, and knowledge (Ctrl/Cmd + K)';
        input.setAttribute('aria-label', 'Global search');
        this.commandPalette.appendChild(input);

        const results = document.createElement('div');
        results.className = 'command-results';
        this.commandPalette.appendChild(results);

        input.addEventListener('input', (e) => this.populatePaletteResults(e.target.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.toggleCommandPalette();
        });

        document.body.appendChild(this.commandPalette);
        this.populatePaletteResults('');
    }

    populatePaletteResults(query) {
        if (!this.commandPalette) return;
        const resultsContainer = this.commandPalette.querySelector('.command-results');
        resultsContainer.innerHTML = '';

        const lower = query.toLowerCase();
        const appMatches = Object.values(window.AppRegistry).filter(app =>
            app.name.toLowerCase().includes(lower) || app.description.toLowerCase().includes(lower)
        );

        const captureMatches = (window.MockData?.captureItems || []).filter(item =>
            !query || (item.raw_content || '').toLowerCase().includes(lower)
        ).slice(0, 5);

        const projectMatches = (window.MockData?.creativeProjects || []).filter(project =>
            !query || project.title.toLowerCase().includes(lower)
        ).slice(0, 5);

        const renderGroup = (title, items, onClick) => {
            if (!items.length) return;
            const group = document.createElement('div');
            group.className = 'command-group';
            const heading = document.createElement('div');
            heading.className = 'command-group-title';
            heading.textContent = title;
            group.appendChild(heading);
            items.forEach(item => {
                const row = document.createElement('div');
                row.className = 'command-row';
                row.textContent = item.label;
                row.tabIndex = 0;
                row.addEventListener('click', () => onClick(item));
                row.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') onClick(item);
                });
                group.appendChild(row);
            });
            resultsContainer.appendChild(group);
        };

        renderGroup('Apps', appMatches.map(app => ({ label: `${app.icon} ${app.name}`, id: app.id })), (item) => {
            window.launchApp(item.id);
            this.toggleCommandPalette();
        });

        renderGroup('Chaos Inbox', captureMatches.map(c => ({ label: `🌀 ${c.raw_content || c.type}`, id: 'chaos-inbox' })), (item) => {
            window.launchApp(item.id);
            this.toggleCommandPalette();
        });

        renderGroup('Creator projects', projectMatches.map(p => ({ label: `🎨 ${p.title}`, id: 'creator-studio' })), (item) => {
            window.launchApp(item.id);
            this.toggleCommandPalette();
        });

        if (!resultsContainer.childElementCount) {
            resultsContainer.textContent = 'No matches yet. Try searching for an app or project.';
        }
    }

    /**
     * Show a toast notification
     * @param {Object} options - Notification options
     * @param {string} options.type - Notification type (success, error, warning, info)
     * @param {string} options.title - Notification title
     * @param {string} options.message - Notification message
     * @param {number} options.duration - Duration in ms (0 = persistent, default: 5000)
     */
    showNotification(options) {
        const container = document.getElementById('notification-container');

        const notification = document.createElement('div');
        notification.className = `notification ${options.type || 'info'}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');

        const header = document.createElement('div');
        header.className = 'notification-header';

        const title = document.createElement('div');
        title.className = 'notification-title';
        title.textContent = options.title || 'Notification';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        header.appendChild(title);
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'notification-body';
        body.textContent = options.message || '';

        notification.appendChild(header);
        notification.appendChild(body);

        container.appendChild(notification);

        // Auto-remove after duration
        const duration = options.duration !== undefined ? options.duration : 5000;
        if (duration > 0) {
            setTimeout(() => {
                notification.remove();
            }, duration);
        }

        this.eventBus.emit('notification:shown', options);
    }

    /**
     * Get system diagnostics
     * @returns {Object} System diagnostics data
     */
    getDiagnostics() {
        return {
            windowCount: this.windows.size,
            focusedWindowId: this.getFocusedWindow()?.id || null,
            zIndexCounter: this.zIndexCounter,
            eventBusListeners: Object.keys(this.eventBus.events).reduce((acc, key) => {
                acc[key] = this.eventBus.events[key].length;
                return acc;
            }, {})
        };
    }
}

/**
 * Simple Event Emitter for pub/sub communication
 * Enables loose coupling between OS and apps
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Emit an event to all listeners
     * @param {string} event - Event name
     * @param {*} data - Data to pass to listeners
     */
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
    }

    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
}

// Create global OS instance
window.OS = new BlackRoadOS();
