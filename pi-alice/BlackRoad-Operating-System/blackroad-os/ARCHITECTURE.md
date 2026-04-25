# BlackRoad OS Architecture

**Version:** 0.1.1
**Last Updated:** 2025-11-16
**Architecture Style:** Layered, Event-Driven, Component-Based

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [System Layers](#system-layers)
4. [File Structure](#file-structure)
5. [Boot Sequence](#boot-sequence)
6. [Window Management](#window-management)
7. [Event System](#event-system)
8. [Component Library](#component-library)
9. [Configuration System](#configuration-system)
10. [Theme System](#theme-system)
11. [Data Flow](#data-flow)
12. [Extension Points](#extension-points)

---

## Overview

BlackRoad OS is a **browser-based desktop operating system** built with vanilla JavaScript, HTML, and CSS. It provides a complete windowing environment, application framework, and component library for building enterprise portals.

**Core Characteristics:**
- **Zero dependencies** - Pure vanilla JS/CSS (no frameworks, no build tools)
- **Accessibility-first** - ARIA attributes, keyboard navigation throughout
- **Event-driven** - Loose coupling via pub/sub event bus
- **Theme-aware** - CSS variables enable easy theming
- **Extensible** - Clear hooks for adding apps, themes, and features

---

## Design Principles

### 1. **Simplicity Over Complexity**
- Use vanilla JS DOM APIs directly
- Avoid abstractions unless they provide clear value
- Keep functions small and focused

### 2. **Accessibility is Not Optional**
- Every interactive element must be keyboard-accessible
- Use semantic HTML and ARIA attributes
- Screen reader support from day one

### 3. **Progressive Enhancement**
- Core functionality works without JavaScript (where possible)
- Features degrade gracefully
- Mobile/responsive support planned for v0.3.0

### 4. **Separation of Concerns**
- OS core (windowing) separate from apps
- Components independent of apps
- Mock data separate from app logic
- Configuration separate from implementation

### 5. **Future-Proof Extension Points**
- Lifecycle hooks for app integration
- Feature flags for toggling functionality
- Config-based API endpoints
- Clear TODOs for future versions

---

## System Layers

BlackRoad OS is structured as 7 distinct layers:

```
┌─────────────────────────────────────────┐
│         12 Applications                  │  ← Apps (Prism, Miners, etc.)
├─────────────────────────────────────────┤
│        App Registry                      │  ← Metadata & entry points
├─────────────────────────────────────────┤
│      Component Library                   │  ← UI primitives
├─────────────────────────────────────────┤
│   Theme Manager + Config                 │  ← Theme switching & config
├─────────────────────────────────────────┤
│      OS Core (Window Manager)            │  ← Window lifecycle & events
├─────────────────────────────────────────┤
│         Bootloader                       │  ← Desktop initialization
├─────────────────────────────────────────┤
│      HTML Shell + CSS                    │  ← DOM structure & styles
└─────────────────────────────────────────┘
```

### Layer 1: HTML Shell
**File:** `index.html`
**Purpose:** DOM structure and script/style loading

```html
<main id="desktop">
  <div id="desktop-icons"></div>
  <div id="windows-container"></div>
</main>
<footer id="taskbar">...</footer>
<nav id="start-menu">...</nav>
```

### Layer 2: Bootloader
**File:** `js/app.js`
**Purpose:** Initialize desktop environment

- Render desktop icons from registry
- Populate start menu
- Start system clock
- Register keyboard shortcuts
- Setup event listeners

### Layer 3: OS Core
**File:** `js/os.js`
**Purpose:** Window management and event bus

**Key Classes:**
- `BlackRoadOS` - Window manager singleton
- `EventEmitter` - Pub/sub event system

**Core Methods:**
- `createWindow(options)` - Create/focus window
- `focusWindow(windowId)` - Bring window to front
- `minimizeWindow(windowId)` - Minimize to taskbar
- `restoreWindow(windowId)` - Restore from taskbar
- `closeWindow(windowId)` - Destroy window
- `showNotification(options)` - Toast notifications

### Layer 4: Theme Manager + Config
**Files:** `js/theme.js`, `js/config.js`
**Purpose:** Theme switching and configuration

**Theme Manager:**
- Manages TealOS/NightOS themes
- Persists choice to localStorage
- Emits theme change events

**Config:**
- Feature flags (enable/disable features)
- API endpoints (mock vs real)
- App defaults (window sizes, intervals)
- System settings

### Layer 5: Component Library
**File:** `js/components.js`
**Purpose:** Reusable UI primitives

**15 Components:**
- `Card`, `Badge`, `Table`, `List`
- `StatsBox`, `Grid`, `GraphPlaceholder`
- `Button`, `EmptyState`, `LoadingState`, `ErrorState`
- `Spinner`, `CodeBlock`, `SidebarLayout`, `Tabs`

All components return `HTMLElement` with:
- Accessibility attributes (ARIA)
- Keyboard navigation
- Theme-aware styles

### Layer 6: App Registry
**File:** `js/registry.js`
**Purpose:** Central app manifest

```javascript
const AppRegistry = {
  prism: {
    id: 'prism',
    name: 'Prism Console',
    icon: '💠',
    description: '...',
    category: 'Core',
    entry: window.PrismApp,
    defaultSize: { width: '900px', height: '700px' }
  },
  // ... 11 more apps
};
```

### Layer 7: Applications
**Files:** `js/apps/*.js`
**Purpose:** Individual applications

Each app is a function that:
1. Reads config: `Config.getAppConfig('appId')`
2. Fetches data: `MockData.*` (or real API in v0.2.0)
3. Builds UI using `Components.*`
4. Creates window: `window.OS.createWindow({ ... })`

---

## File Structure

```
blackroad-os/
├── index.html                 # Main entry point
├── ARCHITECTURE.md            # This file
├── EXTENDING.md               # How to add apps/components
├── README.md                  # Quick start guide
│
├── assets/
│   ├── reset.css             # CSS reset
│   ├── styles.css            # Theme variables
│   ├── os.css                # Window system styles
│   └── apps.css              # Component styles
│
└── js/
    ├── config.js             # Configuration & feature flags
    ├── mock_data.js          # Mock datasets
    ├── components.js         # UI component library
    ├── os.js                 # Window manager & event bus
    ├── theme.js              # Theme manager
    ├── registry.js           # App registry
    ├── app.js                # Bootloader
    │
    └── apps/
        ├── prism.js          # Prism Console
        ├── miners.js         # Miners Dashboard
        ├── pi_ops.js         # Pi Ops
        ├── runbooks.js       # Runbooks
        ├── compliance.js     # Compliance Hub
        ├── finance.js        # Finance & AUM
        ├── identity.js       # Identity Ledger
        ├── research.js       # Research Lab
        ├── engineering.js    # Engineering DevTools
        ├── settings.js       # Settings
        ├── notifications.js  # Notifications
        └── corporate.js      # Corporate OS
```

**Load Order (Critical):**
1. `config.js` - Configuration first
2. `mock_data.js` - Data layer
3. `components.js` - UI primitives
4. `os.js` - Window manager
5. `theme.js` - Theme system
6. `apps/*.js` - Applications (register themselves)
7. `registry.js` - Build app manifest
8. `app.js` - Boot desktop

---

## Boot Sequence

```
┌──────────────┐
│ Page Load    │
└──────┬───────┘
       │
       ├─> Config loads → Feature flags available
       ├─> Mock data loads → MockData.* available
       ├─> Components load → Components.* available
       ├─> OS loads → window.OS created, event bus ready
       ├─> Theme Manager loads → Applies saved theme
       ├─> Apps load → window.PrismApp, window.MinersApp, etc. defined
       ├─> Registry loads → AppRegistry populated
       │
       ├─> Bootloader loads (app.js)
       │   ├─> Render desktop icons
       │   ├─> Populate start menu
       │   ├─> Start system clock
       │   ├─> Register keyboard shortcuts
       │   └─> Show welcome notification
       │
       └─> os:ready event emitted
           ✅ Desktop ready
```

---

## Window Management

### Window Lifecycle

```
[App Launch]
    ↓
createWindow(options)
    ↓
[Check if window exists]
    ├─> Yes → focusWindow(windowId) → DONE
    └─> No ↓
        Create DOM element
        ↓
        Add titlebar & content
        ↓
        Make draggable
        ↓
        Add to taskbar
        ↓
        Focus window
        ↓
        Emit 'window:created'
        ↓
        Call lifecycle hooks
        ↓
        [Window Open]
            ↓
        [User minimizes] → minimizeWindow()
            ↓
        [User restores] → restoreWindow()
            ↓
        [User closes] → closeWindow()
            ↓
        Emit 'window:closed'
        ↓
        Remove from DOM & taskbar
        ↓
        [Window Destroyed]
```

### Z-Index Management

- All windows start at `z-index: 100`
- Each focus increments counter: `zIndexCounter++`
- When counter hits `zIndexMax (9999)`:
  - Call `reindexWindows()`
  - Sort all windows by current z-index
  - Reassign z-index starting at 100
  - Preserves stacking order

### Window Deduplication

```javascript
if (this.windows.has(windowId)) {
  console.log(`🔄 Window "${windowId}" already exists - focusing`);
  if (windowData.minimized) {
    this.restoreWindow(windowId);
  } else {
    this.focusWindow(windowId);
  }
  return windowId;
}
```

**Benefits:**
- Prevents duplicate windows
- User-friendly behavior (focus instead of error)
- Explicit logging for debugging

---

## Event System

### Event Bus Architecture

```javascript
window.OS.eventBus.emit('event:name', { data });
window.OS.eventBus.on('event:name', (data) => { /* handle */ });
window.OS.eventBus.off('event:name', callback);
```

### Built-in Events

| Event | When Fired | Data |
|-------|-----------|------|
| `os:boot` | OS initialized | `{ timestamp }` |
| `os:ready` | Desktop ready | `{ timestamp }` |
| `window:created` | Window created | `{ windowId, title }` |
| `window:focused` | Window focused | `{ windowId }` |
| `window:minimized` | Window minimized | `{ windowId }` |
| `window:restored` | Window restored | `{ windowId }` |
| `window:closed` | Window closed | `{ windowId, title }` |
| `theme:changed` | Theme switched | `{ theme, previousTheme }` |
| `notification:shown` | Notification displayed | `{ type, title, message }` |

### Lifecycle Hooks (v0.1.1)

Apps can register callbacks for window events:

```javascript
window.OS.registerLifecycleHook('onWindowCreated', (data) => {
  console.log('Window created:', data.windowId);
});
```

**Available Hooks:**
- `onWindowCreated`
- `onWindowFocused`
- `onWindowMinimized`
- `onWindowRestored`
- `onWindowClosed`

---

## Component Library

### Component Design Pattern

All components follow this pattern:

```javascript
ComponentName(options) {
  // 1. Create root element
  const element = document.createElement('div');
  element.className = 'component-name';

  // 2. Add accessibility attributes
  element.setAttribute('role', 'appropriate-role');
  element.setAttribute('aria-label', 'descriptive label');

  // 3. Build structure
  // ... create children, add event listeners

  // 4. Return HTMLElement
  return element;
}
```

### Accessibility Requirements

Every component must:
- Use semantic HTML where possible
- Include appropriate ARIA roles
- Support keyboard navigation (if interactive)
- Have clear focus indicators
- Provide aria-labels for screen readers

Example (Button):
```javascript
Button('Save', {
  type: 'primary',
  icon: '💾',
  onClick: handleSave,
  ariaLabel: 'Save document'
});
```

Generated HTML:
```html
<button class="btn primary" aria-label="Save document">
  <span class="btn-icon" aria-hidden="true">💾</span>
  <span>Save</span>
</button>
```

---

## Configuration System

### Feature Flags

```javascript
// Check if feature is enabled
if (Config.isFeatureEnabled('enableRealAPIs')) {
  // Use real API
} else {
  // Use mock data
}
```

### API Endpoints

```javascript
// Get API URL
const url = Config.getApiEndpoint('prism', '/agents/runs');
// Returns: 'https://api.blackroad.io/prism/agents/runs'
```

### App Configuration

```javascript
// Get app defaults
const appConfig = Config.getAppConfig('miners');
// Returns: { defaultWidth, defaultHeight, refreshInterval, ... }
```

---

## Theme System

### How Themes Work

1. **CSS Variables** (in `assets/styles.css`):
```css
:root {
  --primary: #0FA;
  --bg-desktop: linear-gradient(135deg, #001a1a 0%, #003333 100%);
  /* ... */
}

body[data-theme="nightOS"] {
  --primary: #A0F;
  --bg-desktop: linear-gradient(135deg, #0a0014 0%, #1a0033 100%);
  /* ... */
}
```

2. **Theme Manager** sets `data-theme` attribute:
```javascript
document.body.setAttribute('data-theme', 'nightOS');
```

3. **Components** reference CSS variables:
```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
}
```

### Adding a New Theme

1. Add theme to `theme.js`:
```javascript
this.availableThemes = ['tealOS', 'nightOS', 'myTheme'];
```

2. Define variables in `styles.css`:
```css
body[data-theme="myTheme"] {
  --primary: #F0A;
  --bg-desktop: ...;
  /* ... */
}
```

3. Add metadata:
```javascript
getThemeMetadata('myTheme') {
  return {
    id: 'myTheme',
    name: 'My Theme',
    description: '...',
    primaryColor: '#F0A'
  };
}
```

---

## Data Flow

### Mock Data (Current v0.1.1)

```
┌─────────────┐
│  App Logic  │
└──────┬──────┘
       │
       ├─> Read MockData.*
       │
       ├─> Build UI with Components.*
       │
       └─> Display in window
```

### Real API (Future v0.2.0)

```
┌─────────────┐
│  App Logic  │
└──────┬──────┘
       │
       ├─> Check Config.isFeatureEnabled('enableRealAPIs')
       │
       ├─> If true:
       │   ├─> fetch(Config.getApiEndpoint('service'))
       │   └─> await response.json()
       │
       ├─> Else:
       │   └─> Use MockData.*
       │
       ├─> Build UI with Components.*
       │
       └─> Display in window
```

### Example (Prism App)

```javascript
window.PrismApp = function() {
  // Get configuration
  const config = Config.getAppConfig('prism');

  // Fetch data
  let agentRuns;
  if (Config.isFeatureEnabled('enableRealAPIs')) {
    // TODO v0.2.0: Real API
    const url = Config.getApiEndpoint('prism', '/agents/runs');
    agentRuns = await fetch(url).then(r => r.json());
  } else {
    // Mock data
    agentRuns = MockData.agentRuns;
  }

  // Build UI
  const content = Components.Tabs([...]);

  // Create window
  window.OS.createWindow({
    id: 'prism',
    title: 'Prism Console',
    content,
    width: config.defaultWidth,
    height: config.defaultHeight
  });
};
```

---

## Extension Points

### For v0.2.0

1. **Window Resize:**
   - Add resize handles to window corners
   - Update window size on drag
   - Emit `window:resized` event

2. **Window Maximize:**
   - Enable maximize button
   - Store original size/position
   - Toggle between normal and fullscreen

3. **Command Palette:**
   - Show on Ctrl+K
   - Fuzzy search apps and commands
   - Keyboard-navigable list

4. **Real API Integration:**
   - Set `Config.FEATURE_FLAGS.enableRealAPIs = true`
   - Update `Config.API_ENDPOINTS.*` with real URLs
   - Apps automatically switch from mock → real

5. **Window Persistence:**
   - Save window positions to localStorage
   - Restore on boot
   - Option to "Restore last session"

### For v0.3.0

1. **Mobile/Responsive:**
   - Adapt window system for mobile
   - Touch gestures for dragging
   - Collapsible taskbar

2. **Virtual Desktops:**
   - Multiple desktop workspaces
   - Switch with keyboard shortcuts
   - Move windows between desktops

3. **Collaboration:**
   - Real-time multi-user support
   - Shared windows
   - Presence indicators

---

## Summary

BlackRoad OS is built on clear architectural principles:
- **Layered** - Each layer has a single responsibility
- **Event-driven** - Loose coupling via pub/sub
- **Accessible** - Keyboard nav and ARIA throughout
- **Extensible** - Hooks and config for future features
- **Simple** - Vanilla JS, no frameworks, easy to understand

The architecture enables:
- ✅ Easy addition of new apps
- ✅ Swapping mock data for real APIs
- ✅ Theme customization
- ✅ Feature flag experimentation
- ✅ Clear upgrade path to v0.2.0 and beyond

---

**For extending the OS, see [EXTENDING.md](EXTENDING.md)**
