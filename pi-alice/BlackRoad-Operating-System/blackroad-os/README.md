# BlackRoad OS v0.2

**The Living Portal** — A complete front-end operating system for the BlackRoad ecosystem.

![BlackRoad OS](https://img.shields.io/badge/version-0.1.1-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1-green)

---

## 🌟 Overview

BlackRoad OS is a **production-ready**, fully-accessible desktop operating system built entirely with vanilla JavaScript, HTML, and CSS. No frameworks, no build tools, no dependencies - just clean, maintainable code.

**New in v0.2:**
- 🌀 **Chaos Inbox** for neurodivergent-friendly capture and clustering
- 🪪 **Identity Center** to kill duplication across apps
- 🔔 **Notification Center focus modes** to tame alert noise
- 🎨 **Creator Studio** baseline workspace for creators
- 🧭 **Compliance & Ops** surface for audits/workflows
- ⌨️ **Global command palette** (Ctrl/Cmd + K) unified search
- 🎨 **High contrast theme** added to theme cycle

It provides a complete enterprise portal for managing all BlackRoad operations including:

- **Prism Console** — Agent monitoring and system events
- **Miners Dashboard** — Mining operations and telemetry
- **Pi Ops** — Raspberry Pi device management
- **Runbooks** — Operational procedures
- **Compliance Hub** — FINRA reviews and audit logs
- **Finance & AUM** — Portfolio management
- **Identity Ledger** — SHA∞ identity system
- **Research Lab** — Lucidia experiments
- **Engineering Tools** — DevTools and diagnostics
- **Settings** — System configuration
- **Notifications** — Alert management
- **Corporate OS** — Department dashboards

---

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, layers, and design patterns
- **[EXTENDING.md](EXTENDING.md)** - Step-by-step guides for adding apps, components, and APIs
- **[README.md](README.md)** - This file (quick start and overview)

---

## 📦 Project Structure

```
blackroad-os/
├── index.html                 # Main entry point
├── README.md                  # This file
├── ARCHITECTURE.md            # System architecture guide
├── EXTENDING.md               # Extension guide for developers
├── assets/
│   ├── reset.css             # CSS reset
│   ├── styles.css            # Global styles and themes
│   ├── os.css                # Window system styles
│   └── apps.css              # App component styles
└── js/
    ├── config.js             # Configuration & feature flags (NEW v0.1.1)
    ├── mock_data.js          # Mock data for all apps
    ├── components.js         # UI component library (15 components)
    ├── os.js                 # Window manager & event bus
    ├── theme.js              # Theme manager
    ├── registry.js           # Application registry
    ├── app.js                # Bootloader
    └── apps/
        ├── prism.js          # Prism Console app
        ├── miners.js         # Miners Dashboard app
        ├── pi_ops.js         # Pi Ops app
        ├── runbooks.js       # Runbooks app
        ├── compliance.js     # Compliance Hub app
        ├── finance.js        # Finance & AUM app
        ├── identity.js       # Identity Ledger app
        ├── research.js       # Research Lab app
        ├── engineering.js    # Engineering app
        ├── settings.js       # Settings app
        ├── notifications.js  # Notifications app
        └── corporate.js      # Corporate OS app
```

---

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone or download** this repository
2. **Open** `index.html` in a modern web browser
3. **That's it!** No build process required.

```bash
# Navigate to the directory
cd blackroad-os

# Open in browser (macOS)
open index.html

# Open in browser (Linux)
xdg-open index.html

# Open in browser (Windows)
start index.html
```

### Option 2: Local Web Server

For the best experience (and to avoid CORS issues if you add external API calls later):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (install http-server globally)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Lucidia Shell Prototype (v0.1)

For a minimal Lucidia-focused experience, open `lucidia-shell.html` in the same directory. It includes a retro desktop, window manager, Operator Core, and Lucidia Terminal with commands for listing/switching environments, listing/opening apps, and listing/running stub flows.

---

## 🌐 Deploy Anywhere

BlackRoad OS is a static site with zero dependencies. Deploy it anywhere that can serve HTML:

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd blackroad-os
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd blackroad-os
netlify deploy
```

### GitHub Pages

1. Push to a GitHub repository
2. Go to Settings → Pages
3. Select branch and `/blackroad-os` folder
4. Save

### AWS S3 + CloudFront

```bash
# Upload to S3
aws s3 sync blackroad-os/ s3://your-bucket-name/ --acl public-read

# Configure CloudFront distribution pointing to the S3 bucket
```

### Docker (Nginx)

```dockerfile
FROM nginx:alpine
COPY blackroad-os /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t blackroad-os .
docker run -p 8080:80 blackroad-os
```

---

## 🎨 Features

### Window Management
- ✅ Draggable windows
- ✅ Z-index management (bring to front on focus)
- ✅ Minimize/restore
- ✅ Taskbar integration
- ⏳ Maximize (coming soon)
- ⏳ Window resizing (coming soon)

### Desktop Environment
- ✅ Desktop icons
- ✅ Start menu with app launcher
- ✅ System tray
- ✅ Real-time clock
- ✅ Notifications system
- ⏳ Command palette (Ctrl+K)

### Themes
- ✅ TealOS (default)
- ✅ NightOS
- ✅ Theme persistence (localStorage)
- ⏳ Custom theme builder

### Apps
- ✅ 12 fully functional apps
- ✅ Comprehensive mock data
- ✅ Tabbed interfaces
- ✅ Sidebars and layouts
- ✅ Interactive components

### Event System
- ✅ Global event bus
- ✅ Window lifecycle events
- ✅ Theme change events
- ✅ Custom app events

---

## 🔧 Extending BlackRoad OS

**For detailed guides, see [EXTENDING.md](EXTENDING.md)**

### Quick Example: Adding a New App

1. **Create the app file** in `js/apps/yourapp.js`:

```javascript
window.YourApp = function() {
    const appId = 'yourapp';

    const content = document.createElement('div');
    content.innerHTML = '<h1>Hello from Your App!</h1>';

    window.OS.createWindow({
        id: appId,
        title: 'Your App',
        icon: '🚀',
        content: content,
        width: '800px',
        height: '600px'
    });
};
```

2. **Register the app** in `js/registry.js`:

```javascript
yourapp: {
    id: 'yourapp',
    name: 'Your App',
    icon: '🚀',
    description: 'Your awesome app',
    category: 'Custom',
    entry: window.YourApp,
    defaultSize: { width: '800px', height: '600px' }
}
```

3. **Load the script** in `index.html`:

```html
<script src="js/apps/yourapp.js"></script>
```

4. **Refresh** and your app will appear on the desktop!

For more examples and patterns, see **[EXTENDING.md](EXTENDING.md)**.

### Using Components

BlackRoad OS v0.1.1 includes 15 accessible, keyboard-navigable components:

BlackRoad OS includes a built-in component library:

```javascript
// Create a card
const card = Components.Card({
    title: 'My Card',
    subtitle: 'Optional subtitle',
    content: 'Card content here'
});

// Create a table
const table = Components.Table(
    [{ key: 'name', label: 'Name' }, { key: 'value', label: 'Value' }],
    [{ name: 'Alice', value: 100 }, { name: 'Bob', value: 200 }]
);

// Create a badge
const badge = Components.Badge('SUCCESS', 'success');

// Create buttons
const btn = Components.Button('Click Me', {
    type: 'primary',
    onClick: () => alert('Clicked!')
});

// Create a grid
const grid = Components.Grid(3, [card1, card2, card3]);

// Loading and error states (NEW v0.1.1)
const loading = Components.LoadingState('Fetching data...');
const error = Components.ErrorState({
    title: 'Failed to load',
    message: 'Could not connect to server',
    onRetry: () => fetchData()
});

// And many more...
```

All components include:
- **Full JSDoc documentation** with examples
- **ARIA attributes** for accessibility
- **Keyboard navigation** for interactive elements

See `js/components.js` or **[EXTENDING.md](EXTENDING.md)** for the full API.

### Adding Mock Data

Add your mock data to `js/mock_data.js`:

```javascript
const MockData = {
    // ... existing data ...

    myNewData: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ]
};
```

### Event Bus

Listen to and emit custom events:

```javascript
// Listen for events
window.OS.eventBus.on('myevent', (data) => {
    console.log('Event received:', data);
});

// Emit events
window.OS.eventBus.emit('myevent', { foo: 'bar' });
```

Built-in events:
- `os:boot` — System boot
- `os:ready` — System ready
- `window:created` — Window created
- `window:focused` — Window focused
- `window:minimized` — Window minimized
- `window:restored` — Window restored
- `window:closed` — Window closed
- `theme:changed` — Theme changed
- `notification:shown` — Notification shown

---

## 🎯 Keyboard Shortcuts

- **Escape** — Close focused window
- **Ctrl+Shift+P** — Open Prism Console
- **Ctrl+Shift+M** — Open Miners Dashboard
- **Ctrl+Shift+E** — Open Engineering DevTools
- **Ctrl+K** — Command palette (coming soon)

---

## 🛠 Development Roadmap

### v0.2.0 (Planned)
- [ ] Window resizing
- [ ] Window maximize
- [ ] Command palette
- [ ] App search
- [ ] Keyboard navigation
- [ ] Custom themes builder
- [ ] Real API integration hooks
- [ ] Local storage persistence for window positions

### v0.3.0 (Planned)
- [ ] Multi-monitor support
- [ ] Virtual desktops/workspaces
- [ ] Window snapping/tiling
- [ ] App marketplace
- [ ] Plugin system
- [ ] Real-time collaborative features

---

## 🔒 Security Notes

**Current Status**: This is v0.1.0-alpha with **mock data only**.

Before deploying to production:

1. **Replace mock data** with real API calls
2. **Implement authentication** (OAuth, JWT, etc.)
3. **Add input validation** on all forms
4. **Sanitize user inputs** to prevent XSS
5. **Use HTTPS** for all deployments
6. **Implement CSRF protection**
7. **Add rate limiting** on API calls
8. **Review and audit** all code

---

## 📝 Technical Details

- **Framework**: Vanilla JavaScript (ES6+)
- **CSS**: Custom CSS with CSS Variables
- **Architecture**: Event-driven, layered, component-based
- **Accessibility**: WCAG 2.1 compliant, full keyboard navigation
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Dependencies**: None
- **Build Process**: None required
- **Bundle Size**: ~200KB (uncompressed, v0.1.1)
- **Lines of Code**: ~3,500 (well-documented)

---

## 🤝 Contributing

This is a proprietary BlackRoad project. If you're part of the team:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📜 License

Proprietary — BlackRoad Corporation
All rights reserved.

---

## 💬 Support

For questions or issues, contact:
- **Engineering**: engineering@blackroad.io
- **Infrastructure**: infra@blackroad.io

---

## 🎉 Acknowledgments

Built with precision by the BlackRoad engineering team.

**Welcome to the future of enterprise operating systems.**

---

**Booting BlackRoad OS...**

✅ Ready.
