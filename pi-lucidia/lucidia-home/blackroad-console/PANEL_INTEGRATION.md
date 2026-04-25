# BlackRoad OS Panel Integration Guide

## Overview

The BlackRoad OS Console has been fully integrated with all existing panels, creating a unified desktop operating system experience. All panels can now be launched as windows from the main desktop interface.

## Integrated Panels

### Core Panels (Embedded via iframe)

1. **Health Monitor** (`health.html`)
   - Icon: ❤️
   - Dock Position: 3
   - Keyboard: `Alt+3`
   - Size: 900x600
   - Purpose: Real-time system health monitoring and network topology

2. **Memory Vault** (`memory.html`)
   - Icon: 💎
   - Dock Position: 4
   - Keyboard: `Alt+4`
   - Size: 1000x650
   - Purpose: PS-SHA-∞ encrypted memory management and graph visualization

3. **Token Vault** (`vault.html`)
   - Icon: 🔐
   - Dock Position: 5
   - Keyboard: `Alt+5`
   - Size: 900x600
   - Purpose: AES-256-GCM encrypted API key storage and rotation

4. **Agent Builder** (`agent-builder.html`)
   - Icon: 🏗️
   - Dock Position: 6
   - Keyboard: `Alt+6`
   - Size: 1100x700
   - Purpose: Create and configure AI agents with full capability management

5. **Billing & Revenue** (`billing.html`)
   - Icon: 💰
   - Dock Position: 7
   - Keyboard: `Alt+7`
   - Size: 1000x650
   - Purpose: Financial tracking, revenue metrics, and billing management

### Built-in Panels (Native HTML)

6. **Terminal**
   - Icon: 🖥️
   - Dock Position: 1
   - Keyboard: `Alt+1`
   - Size: 700x450
   - Purpose: System command line interface

7. **Agent Registry**
   - Icon: 🤖
   - Dock Position: 2
   - Keyboard: `Alt+2`
   - Size: 650x500
   - Purpose: View and edit existing AI agents

8. **File Manager**
   - Icon: 📁
   - Dock Position: 8
   - Keyboard: `Alt+8`
   - Size: 600x400
   - Purpose: Browse BlackRoad OS file structure

9. **Settings**
   - Icon: ⚙️
   - Dock Position: 9
   - Keyboard: `Alt+9`
   - Size: 550x450
   - Purpose: System configuration and network status

## Operator Action Center

The Operator Action Center is a special control panel accessible from the top bar.

**Access:** Click the "🎯 OPERATOR" button in the top-right corner

**Features:**
- Quick action buttons to launch key panels
- Real-time system status (Infrastructure, Lucidia Pi, Cloudflare, GitHub)
- Crypto holdings overview (ETH, SOL, BTC)
- Personalized command center for Alexa

## Window Management

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + Tab` | Switch to next window |
| `Alt + Shift + Tab` | Switch to previous window |
| `Alt + 1-9` | Focus specific panel (1=Terminal, 2=Agents, etc.) |

### Window Controls

Each window has standard macOS-style controls:
- **Red (×)** - Close window
- **Yellow (–)** - Minimize to dock
- **Green (⬜)** - Maximize/restore window

### Window Features

- **Draggable** - Click and drag window header to move
- **Resizable** - Drag bottom-right corner to resize
- **Z-index Management** - Click any window to bring to front
- **Cascade Positioning** - New windows automatically offset from existing ones

## Technical Implementation

### iframe Integration

External panels are loaded via iframes with special CSS handling:

```css
.window-content iframe {
    display: block;
    margin: -20px;
    width: calc(100% + 40px);
    height: calc(100% + 40px);
}
```

This removes default padding and makes iframes fill the entire window content area.

### Panel Template Structure

```javascript
{
    title: 'Panel Name',
    icon: '🎯',
    type: 'unique-type',
    width: '900px',
    height: '600px',
    content: `<iframe src="panel.html" style="..."></iframe>`
}
```

### WindowManager API

**Methods:**
- `wm.createWindow(config)` - Create new window
- `wm.setActiveWindow(window)` - Focus window
- `wm.updateDockItems()` - Update dock active states
- `focusWindow(type)` - Focus window by type
- `switchToNextWindow()` - Cycle forward through windows
- `switchToPreviousWindow()` - Cycle backward through windows

## Dock System

The dock displays icons for all available panels and shows active state:

```html
<div class="dock-item active" data-app="terminal">🖥️</div>
```

**Active State:**
- Blue dot indicator below icon
- Window is open and not minimized

**Click Behavior:**
- If window minimized → Restore and focus
- If window closed → Create new window
- If window open → Focus window

## Default Layout

On page load, two windows automatically open:

1. **Terminal** - Position: (50px, 80px)
2. **Agent Registry** - Position: (760px, 80px)

These provide immediate access to core functionality.

## Backend Integration

All panels that require backend connectivity use:

```html
<script src="/js/api-client.js"></script>
<script src="/js/state-manager.js"></script>
<script src="/js/ui-components.js"></script>
```

These shared libraries provide:
- **api-client.js** - REST API calls to backend
- **state-manager.js** - Centralized state management
- **ui-components.js** - Reusable UI components

## URLs & Deployment

**Development:**
- http://localhost:8000/

**Production:**
- https://app.blackroad.io/ (Primary)
- https://blackroad-console.pages.dev/ (Cloudflare Pages)
- https://console.blackroad.systems/ (Alternative)
- https://os.blackroad.me/ (Alternative)
- https://desktop.lucidia.earth/ (Alternative)

## File Structure

```
blackroad-console-deploy/
├── index.html              # Main desktop OS (integrated system)
├── health.html             # Health monitoring panel
├── memory.html             # Memory vault panel
├── vault.html              # Token vault panel
├── agent-builder.html      # Agent creation panel
├── billing.html            # Billing & revenue panel
├── settings.html           # Settings panel
├── login.html              # Authentication page
├── js/
│   ├── api-client.js       # API integration
│   ├── state-manager.js    # State management
│   └── ui-components.js    # UI components
└── backend/
    ├── server.js           # Express API server
    ├── api/                # API routes
    ├── db/                 # Database schema
    └── websocket/          # WebSocket handlers
```

## Adding New Panels

To add a new panel to the desktop OS:

1. **Create the panel HTML file** (e.g., `my-panel.html`)

2. **Add to appTemplates in index.html:**

```javascript
myPanel: {
    title: 'My Panel',
    icon: '🎨',
    type: 'my-panel',
    width: '800px',
    height: '500px',
    content: `
        <iframe src="my-panel.html" style="width: 100%; height: 100%; border: none;"></iframe>
    `
}
```

3. **Add dock item:**

```html
<div class="dock-item" data-app="my-panel" title="My Panel">🎨</div>
```

4. **Update keyboard shortcuts array:**

```javascript
const types = ['terminal', 'agents', 'health', 'memory', 'vault', 'builder', 'billing', 'files', 'settings', 'my-panel'];
```

5. **Test by clicking dock icon or using keyboard shortcut**

## Status & Metrics

The top bar shows real-time status indicators:

- **Lucidia** - Main system core status (green = online)
- **47 Agents** - Active agent count (pink = processing)
- **Net** - Network connectivity (green = connected)
- **Clock** - Real-time 24-hour format clock

## Color Scheme

The BlackRoad OS uses a consistent neon/cyberpunk color palette:

```css
--accent-orange: #f7931a  /* Bitcoin orange */
--accent-pink: #e91e8c    /* Primary brand */
--accent-purple: #9945ff  /* Solana purple */
--accent-blue: #14f195    /* Success/active */
--accent-cyan: #00d4ff    /* Info/links */
--gradient-brand: linear-gradient(135deg, #f7931a 0%, #e91e8c 50%, #9945ff 100%)
```

## Browser Compatibility

**Tested:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Required Features:**
- CSS Grid Layout
- CSS Custom Properties
- ES6 JavaScript
- iframe support
- backdrop-filter (for blur effects)

## Performance Notes

- iframes are lazy-loaded when windows open
- Windows maintain state when minimized (not destroyed)
- Maximum recommended open windows: 15
- Each iframe panel has its own JavaScript context

## Security Considerations

1. **iframe Sandboxing** - All external panels run in iframes with same-origin policy
2. **JWT Authentication** - Backend API uses JWT tokens stored in localStorage
3. **AES-256 Encryption** - Token vault encrypts all API keys
4. **PS-SHA-∞ Hashing** - Memory vault uses infinite cascade hashing
5. **CORS Protection** - Backend enforces allowed origins

## Future Enhancements

Planned features:
- [ ] Window state persistence (localStorage)
- [ ] Custom window layouts/workspaces
- [ ] Panel tabs (multiple instances of same panel)
- [ ] Window snapping/docking
- [ ] Full-screen mode for panels
- [ ] Panel search/launcher (Cmd+K)
- [ ] Window history/recently used
- [ ] Panel notifications/badges
- [ ] Multi-monitor support
- [ ] Dark/light theme toggle

## Troubleshooting

**Panel won't load:**
- Check browser console for errors
- Verify panel HTML file exists
- Check iframe src path
- Ensure HTTP server is running

**Window stuck/frozen:**
- Close window and reopen from dock
- Refresh entire page
- Clear localStorage

**Keyboard shortcuts not working:**
- Click desktop to ensure focus
- Check for browser extension conflicts
- Verify Alt key is not remapped

**Dock not updating:**
- Check wm.updateDockItems() calls
- Verify window type matches dock data-app
- Refresh page to reset state

## Support

For issues, feature requests, or questions:
- GitHub: BlackRoad-OS repositories
- Email: blackroad.systems@gmail.com
- Linear: Review queue for bug reports

---

**Version:** 1.0.0
**Last Updated:** 2025-12-21
**Author:** Alexa Amundson (with Claude Code assistance)
