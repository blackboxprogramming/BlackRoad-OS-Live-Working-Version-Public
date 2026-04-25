# Extending BlackRoad OS

**Version:** 0.1.1
**Target Audience:** AI Agents and Human Developers

This guide shows you **exactly** how to extend BlackRoad OS with new apps, components, themes, and real API connections.

---

## Table of Contents

1. [Adding a New App](#adding-a-new-app)
2. [Adding a New Component](#adding-a-new-component)
3. [Connecting Real APIs](#connecting-real-apis)
4. [Adding Mock Data](#adding-mock-data)
5. [Creating Custom Themes](#creating-custom-themes)
6. [Using the Event Bus](#using-the-event-bus)
7. [Adding Keyboard Shortcuts](#adding-keyboard-shortcuts)
8. [Best Practices](#best-practices)

---

## Adding a New App

Follow these steps to add a new application to BlackRoad OS.

### Step 1: Create the App File

Create `js/apps/yourapp.js`:

```javascript
/**
 * Your App
 * Brief description of what this app does
 * TODO: Add real API integration in v0.2.0
 */

window.YourApp = function() {
    const appId = 'yourapp';

    // Get app configuration
    const config = Config.getAppConfig(appId);

    // TODO: Real API integration point
    // if (Config.isFeatureEnabled('enableRealAPIs')) {
    //     const url = Config.getApiEndpoint('yourservice');
    //     const data = await fetch(url).then(r => r.json());
    // } else {
    //     const data = MockData.yourData;
    // }
    const data = MockData.yourData; // Using mock data for now

    // Build UI using Components
    const content = document.createElement('div');

    // Example: Add a header
    const header = document.createElement('h2');
    header.textContent = 'Welcome to Your App';
    content.appendChild(header);

    // Example: Add stats
    const statsGrid = Components.Grid(3, [
        Components.StatsBox({ value: '42', label: 'Total Items' }),
        Components.StatsBox({ value: '12', label: 'Active', change: 5.2 }),
        Components.StatsBox({ value: '3', label: 'Pending', change: -2.1 })
    ]);
    content.appendChild(statsGrid);

    // Example: Add a table
    const table = Components.Table(
        [
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' }
        ],
        data
    );
    content.appendChild(table);

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Your App',
        icon: '🚀',
        content: content,
        width: config.defaultWidth || '800px',
        height: config.defaultHeight || '600px'
    });
};
```

### Step 2: Add Mock Data (Optional)

In `js/mock_data.js`, add:

```javascript
const MockData = {
    // ... existing data ...

    yourData: [
        { id: 1, name: 'Item 1', status: 'active' },
        { id: 2, name: 'Item 2', status: 'pending' },
        { id: 3, name: 'Item 3', status: 'completed' }
    ]
};
```

### Step 3: Register in App Registry

In `js/registry.js`, add to `AppRegistry`:

```javascript
const AppRegistry = {
    // ... existing apps ...

    yourapp: {
        id: 'yourapp',
        name: 'Your App',
        icon: '🚀',
        description: 'Brief description of your app',
        category: 'Custom',
        entry: window.YourApp,
        defaultSize: { width: '800px', height: '600px' }
    }
};
```

### Step 4: Add to Config (Optional)

In `js/config.js`, add app-specific settings:

```javascript
APPS: {
    // ... existing apps ...

    yourapp: {
        defaultWidth: '800px',
        defaultHeight: '600px',
        refreshInterval: 5000,  // Auto-refresh every 5s
        // Add any app-specific settings
    }
}
```

### Step 5: Load Script in index.html

In `index.html`, add before the registry line:

```html
<!-- Applications -->
<script src="js/apps/prism.js"></script>
<!-- ... other apps ... -->
<script src="js/apps/yourapp.js"></script>

<!-- Registry and Bootloader (load last) -->
<script src="js/registry.js"></script>
```

### Step 6: Test

1. Open `index.html` in browser
2. Your app should appear on desktop and in start menu
3. Double-click icon or use start menu to launch
4. Check browser console for any errors

---

## Adding a New Component

Components are reusable UI building blocks.

### Step 1: Add to components.js

```javascript
const Components = {
    // ... existing components ...

    /**
     * Create a Your Component
     * Brief description
     *
     * @param {Object} options - Component options
     * @param {string} options.title - Component title
     * @param {string} options.value - Component value
     * @returns {HTMLElement} Component element
     *
     * @example
     * const comp = Components.YourComponent({
     *   title: 'Hello',
     *   value: 'World'
     * });
     */
    YourComponent(options = {}) {
        // 1. Create root element
        const component = document.createElement('div');
        component.className = 'your-component';

        // 2. Add accessibility
        component.setAttribute('role', 'region');
        component.setAttribute('aria-label', options.title || 'Your Component');

        // 3. Build structure
        if (options.title) {
            const title = document.createElement('h3');
            title.textContent = options.title;
            component.appendChild(title);
        }

        if (options.value) {
            const value = document.createElement('div');
            value.className = 'your-component-value';
            value.textContent = options.value;
            component.appendChild(value);
        }

        // 4. Add keyboard support if interactive
        if (options.onClick) {
            component.classList.add('clickable');
            component.setAttribute('role', 'button');
            component.setAttribute('tabindex', '0');
            component.addEventListener('click', options.onClick);

            component.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    options.onClick(e);
                }
            });
        }

        // 5. Return element
        return component;
    }
};
```

### Step 2: Add CSS Styles

In `assets/apps.css` or `assets/os.css`:

```css
/* Your Component Styles */
.your-component {
    padding: 16px;
    border-radius: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
}

.your-component-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
}

.your-component.clickable:hover {
    background: var(--bg-surface-hover);
    cursor: pointer;
}

.your-component.clickable:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}
```

### Step 3: Use in Apps

```javascript
const myComponent = Components.YourComponent({
    title: 'Sales This Month',
    value: '$42,500'
});

window.OS.createWindow({
    id: 'demo',
    title: 'Demo',
    content: myComponent
});
```

---

## Connecting Real APIs

When you're ready to connect real backend services:

### Step 1: Set Feature Flag

In `js/config.js`:

```javascript
FEATURE_FLAGS: {
    enableRealAPIs: true,  // Change from false → true
    // ...
}
```

### Step 2: Update API Endpoints

In `js/config.js`:

```javascript
API_ENDPOINTS: {
    base: 'https://api.blackroad.io',
    prism: 'https://api.blackroad.io/prism',
    yourservice: 'https://api.blackroad.io/yourservice',
    // ...
}
```

### Step 3: Update App to Use Real API

In your app file:

```javascript
window.YourApp = async function() {  // Make it async
    const appId = 'yourapp';

    // Show loading state
    const loadingState = Components.LoadingState('Fetching data...');
    window.OS.createWindow({
        id: appId,
        title: 'Your App',
        content: loadingState,
        width: '800px',
        height: '600px'
    });

    try {
        let data;

        // Check feature flag
        if (Config.isFeatureEnabled('enableRealAPIs')) {
            // Use real API
            const url = Config.getApiEndpoint('yourservice', '/data');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            data = await response.json();
        } else {
            // Use mock data
            data = MockData.yourData;
        }

        // Build UI with real data
        const content = buildContent(data);

        // Update window content
        const window = window.OS.getWindow(appId);
        if (window) {
            const contentEl = window.element.querySelector('.window-content');
            contentEl.innerHTML = '';
            contentEl.appendChild(content);
        }

    } catch (error) {
        console.error('Failed to load data:', error);

        // Show error state
        const errorState = Components.ErrorState({
            title: 'Failed to Load',
            message: error.message,
            onRetry: () => {
                window.OS.closeWindow(appId);
                window.YourApp();
            }
        });

        const window = window.OS.getWindow(appId);
        if (window) {
            const contentEl = window.element.querySelector('.window-content');
            contentEl.innerHTML = '';
            contentEl.appendChild(errorState);
        }
    }
};
```

### Step 4: Add Error Handling

Always handle errors gracefully:

```javascript
try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // ... use data
} catch (error) {
    // Show error state
    const errorState = Components.ErrorState({
        title: 'Connection Failed',
        message: 'Unable to connect to server. Please try again.',
        onRetry: retryFunction
    });
}
```

---

## Adding Mock Data

Mock data allows development without a backend.

### Step 1: Add to mock_data.js

```javascript
const MockData = {
    // ... existing data ...

    yourData: [
        { id: 1, name: 'Example 1', value: 100 },
        { id: 2, name: 'Example 2', value: 200 }
    ],

    // For generating fake data:
    generateYourData(count) {
        return Array.from({ length: count }, (_, i) => ({
            id: `item_${i + 1}`,
            name: `Item ${i + 1}`,
            value: Math.floor(Math.random() * 1000),
            timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        }));
    }
};

// Generate some data
MockData.yourGeneratedData = MockData.generateYourData(50);
```

### Step 2: Use in Apps

```javascript
const data = MockData.yourData;
// or
const data = MockData.yourGeneratedData;
```

---

## Creating Custom Themes

### Step 1: Define CSS Variables

In `assets/styles.css`:

```css
/* Your custom theme */
body[data-theme="yourtheme"] {
    --primary: #FF6B6B;
    --primary-dark: #EE5A5A;
    --primary-light: #FF9999;

    --bg-desktop: linear-gradient(135deg, #1a0505 0%, #330a0a 100%);
    --bg-surface: rgba(40, 10, 10, 0.95);
    --bg-surface-hover: rgba(60, 15, 15, 0.98);
    --bg-window: rgba(25, 10, 10, 0.98);

    --text-primary: #FFFFFF;
    --text-secondary: #CCAAAA;
    --text-dim: #886666;

    --border-color: rgba(255, 107, 107, 0.2);
    --shadow: rgba(0, 0, 0, 0.5);
    --taskbar-bg: rgba(20, 5, 5, 0.98);

    --success: #51CF66;
    --warning: #FFD43B;
    --error: #FF6B6B;
    --info: #74C0FC;
}
```

### Step 2: Register Theme

In `js/theme.js`:

```javascript
constructor() {
    this.currentTheme = 'tealOS';
    this.availableThemes = ['tealOS', 'nightOS', 'yourtheme'];  // Add here
    this.init();
}

getThemeMetadata(theme) {
    const metadata = {
        // ... existing themes ...

        yourtheme: {
            id: 'yourtheme',
            name: 'Your Theme Name',
            description: 'A custom red/dark theme',
            primaryColor: '#FF6B6B',
            author: 'Your Name',
            preview: null
        }
    };

    return metadata[theme] || null;
}
```

### Step 3: Apply Theme

```javascript
window.ThemeManager.setTheme('yourtheme');
```

---

## Using the Event Bus

The event bus enables loose coupling between components.

### Listening to Events

```javascript
// Listen for window creation
window.OS.eventBus.on('window:created', (data) => {
    console.log('New window:', data.windowId, data.title);
});

// Listen for theme changes
window.OS.eventBus.on('theme:changed', (data) => {
    console.log('Theme changed to:', data.theme);
});
```

### Emitting Custom Events

```javascript
// Emit a custom event
window.OS.eventBus.emit('yourapp:data:loaded', {
    itemCount: 42,
    timestamp: new Date().toISOString()
});

// Other parts of the app can listen
window.OS.eventBus.on('yourapp:data:loaded', (data) => {
    updateUI(data);
});
```

### Removing Listeners

```javascript
const handler = (data) => { /* ... */ };

window.OS.eventBus.on('some:event', handler);

// Later, remove it
window.OS.eventBus.off('some:event', handler);

// Or remove all listeners for an event
window.OS.eventBus.removeAllListeners('some:event');
```

### Using Lifecycle Hooks

```javascript
// Register a lifecycle hook
window.OS.registerLifecycleHook('onWindowCreated', (data) => {
    console.log(`Window ${data.windowId} was created`);
    // Track analytics, update state, etc.
});

window.OS.registerLifecycleHook('onWindowClosed', (data) => {
    console.log(`Window ${data.windowId} was closed`);
    // Clean up resources, save state, etc.
});
```

---

## Adding Keyboard Shortcuts

### Step 1: Add to Config

In `js/config.js`:

```javascript
SHORTCUTS: {
    // ... existing shortcuts ...
    openYourApp: 'Ctrl+Shift+Y',
}
```

### Step 2: Register in Bootloader

In `js/app.js`, add to `shortcuts` array:

```javascript
this.shortcuts = [
    // ... existing shortcuts ...
    { key: 'Y', ctrl: true, shift: true, app: 'yourapp', description: 'Open Your App' }
];
```

### Step 3: Shortcuts Are Auto-Registered

The bootloader automatically registers all shortcuts in the array.

### Getting Shortcuts List

```javascript
// For showing in Settings or Help
const shortcuts = window.BootLoader.getShortcuts();
```

---

## Best Practices

### 1. **Always Use Config**

✅ **Good:**
```javascript
const width = Config.getAppConfig('yourapp').defaultWidth;
const apiUrl = Config.getApiEndpoint('service');
```

❌ **Bad:**
```javascript
const width = '800px';  // Hardcoded
const apiUrl = 'https://api.blackroad.io/service';  // Hardcoded
```

### 2. **Use Components for UI**

✅ **Good:**
```javascript
const table = Components.Table(columns, data);
const card = Components.Card({ title: 'Stats', content: table });
```

❌ **Bad:**
```javascript
const table = document.createElement('table');
// Manual DOM construction...
```

### 3. **Add Accessibility**

✅ **Good:**
```javascript
button.setAttribute('aria-label', 'Save document');
button.setAttribute('role', 'button');
```

❌ **Bad:**
```javascript
// No ARIA attributes
```

### 4. **Handle Errors Gracefully**

✅ **Good:**
```javascript
try {
    const data = await fetchData();
    renderContent(data);
} catch (error) {
    const errorState = Components.ErrorState({
        message: error.message,
        onRetry: fetchData
    });
    showError(errorState);
}
```

❌ **Bad:**
```javascript
const data = await fetchData();  // No error handling
```

### 5. **Add Clear TODO Comments**

✅ **Good:**
```javascript
// TODO v0.2.0: Real API integration
// Should call Config.getApiEndpoint('service') when enableRealAPIs is true
const data = MockData.yourData;
```

❌ **Bad:**
```javascript
// TODO: fix this
const data = MockData.yourData;
```

### 6. **Use Feature Flags**

✅ **Good:**
```javascript
if (Config.isFeatureEnabled('yourFeature')) {
    // New feature code
}
```

❌ **Bad:**
```javascript
// Commenting out code instead of using flags
// if (true) { ... }
```

### 7. **Log Meaningful Messages**

✅ **Good:**
```javascript
console.log('✨ Created window:', windowId);
console.error('❌ Failed to fetch:', error.message);
```

❌ **Bad:**
```javascript
console.log('done');
console.log(error);
```

### 8. **Keep Functions Small**

✅ **Good:**
```javascript
function createHeader() { /* ... */ }
function createBody() { /* ... */ }
function createFooter() { /* ... */ }

const content = document.createElement('div');
content.appendChild(createHeader());
content.appendChild(createBody());
content.appendChild(createFooter());
```

❌ **Bad:**
```javascript
function createEverything() {
    // 500 lines of code...
}
```

### 9. **Use CSS Classes, Not Inline Styles**

✅ **Good:**
```javascript
element.className = 'stats-box highlighted';
```

❌ **Bad:**
```javascript
element.style.padding = '16px';
element.style.background = '#fff';
```

### 10. **Document Your Code**

✅ **Good:**
```javascript
/**
 * Calculate portfolio returns
 * @param {number} principal - Initial investment
 * @param {number} rate - Annual return rate (decimal)
 * @returns {number} Final value
 */
function calculateReturns(principal, rate) { /* ... */ }
```

❌ **Bad:**
```javascript
function calc(p, r) { /* ... */ }
```

---

## Quick Reference Card

### Create an App
1. Create `js/apps/yourapp.js` with `window.YourApp = function() {}`
2. Register in `js/registry.js`
3. Add to `index.html`
4. Optional: Add to `js/config.js`

### Create a Component
1. Add to `js/components.js` as `ComponentName(options) {}`
2. Add CSS in `assets/apps.css`
3. Use in apps: `Components.ComponentName({ ... })`

### Connect Real API
1. Set `Config.FEATURE_FLAGS.enableRealAPIs = true`
2. Update `Config.API_ENDPOINTS.*`
3. Use `Config.getApiEndpoint('service')`
4. Add try/catch error handling

### Add Mock Data
1. Add to `js/mock_data.js` as `MockData.yourData = [...]`
2. Use in apps: `MockData.yourData`

### Create Theme
1. Define CSS variables in `assets/styles.css`
2. Register in `js/theme.js`
3. Apply: `window.ThemeManager.setTheme('yourtheme')`

### Use Events
- Emit: `window.OS.eventBus.emit('event', data)`
- Listen: `window.OS.eventBus.on('event', callback)`
- Remove: `window.OS.eventBus.off('event', callback)`

### Add Shortcut
1. Add to `Config.SHORTCUTS`
2. Add to `BootLoader.shortcuts`
3. It auto-registers

---

## Getting Help

- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Quick Start:** See [README.md](README.md)
- **Component Docs:** See JSDoc comments in `js/components.js`
- **Examples:** Look at existing apps in `js/apps/`

---

**Happy extending! 🚀**
