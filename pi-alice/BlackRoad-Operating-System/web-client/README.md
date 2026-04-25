# BlackRoad Web Client (Pocket OS)

**Version:** 0.1.0
**Status:** Phase 2 Enhanced

## Overview

The BlackRoad Web Client (codename: **Pocket OS**) is the browser-facing frontend for BlackRoad OS. It provides a Windows 95-inspired desktop interface powered by vanilla JavaScript with zero dependencies.

## Architecture

```
web-client/
├── README.md               # This file
└── (Primary code is in backend/static/)

backend/static/
├── index.html              # Main OS interface
├── js/
│   ├── api-client.js       # Legacy API client
│   ├── core-os-client.js   # New Core OS client (Phase 2)
│   ├── apps.js             # Application definitions
│   └── auth.js             # Authentication
└── assets/
    ├── css/                # Stylesheets
    ├── images/             # Icons and images
    └── fonts/              # Custom fonts
```

## Features

### Phase 1 (Existing)
- ✅ Windows 95-style desktop UI
- ✅ Window management (drag, resize, minimize, maximize)
- ✅ Start menu and taskbar
- ✅ Multiple built-in applications
- ✅ Authentication system
- ✅ API integration

### Phase 2 (New)
- ✅ Core OS Client (`core-os-client.js`)
- ✅ System version API integration
- ✅ Public config API integration
- ✅ OS state management client-side
- ✅ Event-driven architecture
- 🔄 Real-time state sync (coming soon)
- 🔄 WebSocket support (coming soon)

## Quick Start

### Running the Web Client

The web client is served by the FastAPI backend at `/`:

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Visit http://localhost:8000/
# The OS interface loads automatically
```

### Using Core OS Client

```javascript
// Initialize Core OS
const result = await window.coreOS.initialize();
console.log('OS Version:', result.version);
console.log('OS Config:', result.config);
console.log('OS State:', result.state);

// Listen for state updates
window.coreOS.on('state:updated', (state) => {
  console.log('State changed:', state);
});

// Check backend health
const healthy = await window.coreOS.healthCheck();
console.log('Backend healthy:', healthy);

// Get system version
const version = await window.coreOS.getVersion();
console.log('System version:', version.version);
```

## API Endpoints Used

The web client communicates with these backend endpoints:

- `GET /health` - Backend health check
- `GET /api/system/version` - System version and build info
- `GET /api/system/config/public` - Public configuration
- `GET /api/system/os/state` - Current OS state
- `GET /api/auth/*` - Authentication endpoints
- `GET /api/agents/*` - Agent library
- And 30+ other API endpoints for apps

## Integration with Core OS Runtime

The web client integrates with the Core OS Runtime (Python) via HTTP API:

```
┌─────────────────────┐
│   Web Browser       │
│   (Pocket OS UI)    │
└──────────┬──────────┘
           │ HTTP/WebSocket
           ▼
┌─────────────────────┐
│   Backend API       │
│   (FastAPI)         │
└──────────┬──────────┘
           │ Python imports
           ▼
┌─────────────────────┐
│   Core OS Runtime   │
│   (Python)          │
└─────────────────────┘
```

## File Structure

### Main Entry Point
- **`backend/static/index.html`** - Main OS interface (97KB)
  - Includes complete Windows 95-style UI
  - Desktop with draggable icons
  - Taskbar with Start menu
  - System tray with clock
  - Multiple pre-built applications

### JavaScript Modules

#### Legacy (Phase 1)
- **`api-client.js`** (11KB)
  - REST API client
  - Authentication helpers
  - Request/response handling

- **`apps.js`** (33KB)
  - Application definitions
  - Window management
  - App lifecycle hooks

- **`auth.js`** (11KB)
  - Login/logout
  - Session management
  - Token handling

#### New (Phase 2)
- **`core-os-client.js`** (2KB)
  - Core OS API integration
  - System state management
  - Event system
  - Health monitoring

## Development Workflow

### Making Changes

1. **Edit files** in `backend/static/`
   ```bash
   cd backend/static
   # Edit index.html or js/*.js
   ```

2. **No build step required** - Vanilla JS, direct changes
   ```
   # Just refresh browser!
   ```

3. **Test locally**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   # Visit http://localhost:8000/
   ```

### Adding a New Application

1. **Define app** in `apps.js`:
   ```javascript
   window.Apps.MyNewApp = {
     init() {
       console.log('App initialized');
     },

     render() {
       return `
         <div class="app-content">
           <h1>My New App</h1>
         </div>
       `;
     }
   };
   ```

2. **Add desktop icon** in `index.html`:
   ```html
   <div class="desktop-icon" data-app="mynewapp">
     <div class="icon-image">🎨</div>
     <div class="icon-label">My New App</div>
   </div>
   ```

3. **Register in app system** (if needed)

### Using Core OS Client

Include in your HTML:
```html
<script src="/static/js/core-os-client.js"></script>
```

Then use in your code:
```javascript
// Auto-initialized as window.coreOS

// Initialize OS
coreOS.initialize().then(result => {
  console.log('OS ready!', result);
});

// Listen for events
coreOS.on('os:initialized', (data) => {
  console.log('OS initialized', data);
});

coreOS.on('state:updated', (state) => {
  console.log('State updated', state);
});

coreOS.on('os:error', (error) => {
  console.error('OS error', error);
});
```

## Testing

### Manual Testing
```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Open browser
# Visit http://localhost:8000/
# Test functionality manually
```

### Automated Testing (Future)
```bash
# Phase 2 will add:
# - Playwright/Puppeteer tests
# - Visual regression tests
# - E2E tests
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

- **Bundle size**: ~140KB uncompressed
- **Load time**: <200ms on broadband
- **Zero dependencies**: No framework overhead
- **Vanilla JS**: Direct DOM manipulation

## Phase 2 Enhancements

Current Phase 2 additions:

1. ✅ **Core OS Client** - New API client for system-level operations
2. ✅ **System endpoints** - `/api/system/version`, `/api/system/config/public`, `/api/system/os/state`
3. ✅ **Event system** - Client-side event bus for state changes
4. ✅ **Health monitoring** - Backend health check integration

Coming in Phase 2:

- 🔄 **Real-time sync** - WebSocket for live OS state updates
- 🔄 **Offline support** - Service worker for offline functionality
- 🔄 **PWA features** - Install as desktop app
- 🔄 **Enhanced state management** - Local state caching and sync

## Integration with Other Modules

### With Backend API
```javascript
// Core OS client talks to backend
const version = await coreOS.getVersion();
// Calls: GET /api/system/version
```

### With Operator Engine
```javascript
// Future: Subscribe to job updates
coreOS.on('job:completed', (job) => {
  console.log('Job finished:', job);
});
```

### With Prism Console
```javascript
// Future: Admin mode toggle
if (config.admin_mode) {
  window.location.href = '/prism';
}
```

## License

Part of BlackRoad Operating System - MIT License

---

**Next Steps**: Add WebSocket support, implement real-time state sync, create PWA manifest, add service worker for offline support.
