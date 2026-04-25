/**
 * BlackRoad OS Theme Manager
 * Handles theme switching and persistence
 *
 * Built-in Themes:
 * - TealOS (default): Teal/cyan cyberpunk aesthetic
 * - NightOS: Purple/magenta dark theme
 *
 * Features:
 * - Theme persistence via localStorage
 * - Smooth transitions between themes
 * - Event emission for theme changes
 * - Extensible architecture for custom themes
 *
 * Theme System Architecture:
 * - Themes are defined via CSS variables in styles.css
 * - Body attribute `data-theme` controls which CSS vars are active
 * - All components reference CSS variables, not hardcoded colors
 * - New themes can be added by adding `body[data-theme="name"]` blocks
 *
 * TODO v0.2.0: Add theme preview system
 * TODO v0.2.0: Add custom theme builder in Settings app
 * TODO v0.3.0: Support theme import/export (JSON format)
 * TODO v0.3.0: Add system theme (auto dark/light based on OS preference)
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'tealOS';
        this.availableThemes = ['tealOS', 'nightOS', 'contrastOS']; // Extensible list
        // TODO v0.2.0: Load available themes dynamically from CSS
        this.init();
    }

    init() {
        // Load saved theme preference from localStorage
        const saved = localStorage.getItem('blackroad-theme');
        if (saved && this.availableThemes.includes(saved)) {
            this.currentTheme = saved;
        }

        // Apply theme immediately (before page renders)
        this.applyTheme(this.currentTheme);

        // Setup toggle button
        this.setupToggleButton();

        console.log(`🎨 Theme Manager initialized: ${this.currentTheme}`);
    }

    /**
     * Setup theme toggle button in system tray
     */
    setupToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        // Add accessibility attributes
        toggleBtn.setAttribute('aria-label', 'Toggle theme');
        toggleBtn.setAttribute('aria-pressed', 'false');

        toggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard support
        toggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        this.updateToggleButton();
    }

    /**
     * Toggle between available themes
     * Currently cycles between TealOS and NightOS
     * TODO v0.2.0: Support more than 2 themes with dropdown or cycle logic
     */
    toggleTheme() {
        // Cycle through available themes
        const currentIndex = this.availableThemes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.availableThemes.length;
        this.currentTheme = this.availableThemes[nextIndex];

        this.applyTheme(this.currentTheme);
        this.saveTheme();
        this.updateToggleButton();

        // Emit event so apps can react if needed
        if (window.OS) {
            window.OS.eventBus.emit('theme:changed', {
                theme: this.currentTheme,
                previousTheme: this.currentTheme === 'tealOS' ? 'nightOS' : 'tealOS'
            });

            // Show notification
            const themeName = this.currentTheme === 'tealOS' ? 'Teal OS' : 'Night OS';
            window.OS.showNotification({
                type: 'info',
                title: 'Theme Changed',
                message: `Switched to ${themeName}`,
                duration: 2000
            });
        }

        console.log(`🎨 Theme switched to: ${this.currentTheme}`);
    }

    /**
     * Apply a theme by setting data-theme attribute
     * @param {string} theme - Theme identifier (e.g., 'tealOS', 'nightOS')
     */
    applyTheme(theme) {
        if (!this.availableThemes.includes(theme)) {
            console.warn(`Unknown theme: ${theme}. Falling back to tealOS`);
            theme = 'tealOS';
        }

        // Apply theme with smooth transition
        document.body.classList.add('theme-transitioning');
        document.body.setAttribute('data-theme', theme);

        // Remove transition class after animation completes
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    }

    /**
     * Save current theme to localStorage
     */
    saveTheme() {
        localStorage.setItem('blackroad-theme', this.currentTheme);
    }

    /**
     * Update toggle button icon to reflect current theme
     */
    updateToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('.icon');
        if (icon) {
            const iconMap = { tealOS: '🌙', nightOS: '☀️', contrastOS: '⚡️' };
            icon.textContent = iconMap[this.currentTheme] || '🎨';
        }

        // Update aria-label for clarity
        const currentIndex = this.availableThemes.indexOf(this.currentTheme);
        const nextTheme = this.availableThemes[(currentIndex + 1) % this.availableThemes.length] || 'Teal OS';
        toggleBtn.setAttribute('aria-label', `Switch to ${nextTheme}`);
    }

    /**
     * Get current theme
     * @returns {string} Current theme identifier
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Set theme programmatically
     * @param {string} theme - Theme identifier
     */
    setTheme(theme) {
        if (this.availableThemes.includes(theme)) {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.saveTheme();
            this.updateToggleButton();

            // Emit event
            if (window.OS) {
                window.OS.eventBus.emit('theme:changed', { theme });
            }
        } else {
            console.error(`Cannot set theme: ${theme} is not available`);
        }
    }

    /**
     * Get list of available themes
     * @returns {Array} Array of theme identifiers
     */
    getAvailableThemes() {
        return [...this.availableThemes];
    }

    /**
     * Get theme metadata (for Settings app or theme picker)
     * @param {string} theme - Theme identifier
     * @returns {Object} Theme metadata
     */
    getThemeMetadata(theme) {
        const metadata = {
            tealOS: {
                id: 'tealOS',
                name: 'Teal OS',
                description: 'Cyberpunk teal/cyan aesthetic with dark background',
                primaryColor: '#0FA',
                author: 'BlackRoad Team',
                preview: null // TODO v0.2.0: Add preview image
            },
            nightOS: {
                id: 'nightOS',
                name: 'Night OS',
                description: 'Purple/magenta dark theme',
                primaryColor: '#A0F',
                author: 'BlackRoad Team',
                preview: null
            }
        };

        return metadata[theme] || null;
    }

    /**
     * Preview a theme without committing (for theme picker)
     * TODO v0.2.0: Implement preview mode with cancel/apply buttons
     * @param {string} theme - Theme to preview
     */
    previewTheme(theme) {
        console.log(`🔍 Preview mode for theme: ${theme} - Coming in v0.2.0`);
        // Would temporarily apply theme without saving
        // Settings app would show "Apply" and "Cancel" buttons
    }

    /**
     * Register a custom theme (extension point for future custom theme system)
     * TODO v0.3.0: Allow apps to register custom themes dynamically
     * @param {Object} themeDefinition - Theme definition object
     */
    registerCustomTheme(themeDefinition) {
        console.log('📦 Custom theme registration - Coming in v0.3.0');
        // Would validate theme definition
        // Add CSS variables dynamically
        // Add to availableThemes list
    }
}

// Create global instance
window.ThemeManager = new ThemeManager();
