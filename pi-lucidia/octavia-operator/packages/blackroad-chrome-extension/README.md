# BlackRoad Chrome Extension

Official Chrome extension for BlackRoad - quick access to your admin dashboard, deployments, and real-time notifications.

## Features

### Popup Dashboard
- **Stats Overview** - View agent, task, and memory counts at a glance
- **Quick Actions** - Deploy, create tasks, and log entries with one click
- **Recent Activity** - See latest memory entries
- **Quick Links** - Jump to dashboard, docs, and API status

### Background Features
- **Real-time Notifications** - Get notified about urgent tasks
- **Badge Counter** - See pending tasks count on the extension icon
- **Periodic Checks** - Automatic status updates every 5 minutes

### Settings
- Configure API key and endpoint
- Enable/disable notifications
- Filter notifications to urgent only

## Installation

### From Chrome Web Store
1. Visit [Chrome Web Store](https://chrome.google.com/webstore) (coming soon)
2. Click "Add to Chrome"

### Manual Installation (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/BlackRoad-OS/blackroad-chrome-extension
   cd blackroad-chrome-extension
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the extension folder

5. The BlackRoad icon will appear in your toolbar

## Usage

### Initial Setup
1. Click the BlackRoad icon in your toolbar
2. Click "Connect" or open Settings
3. Enter your API key from [console.blackroad.io](https://console.blackroad.io/settings/api)
4. Click "Save Settings"

### Quick Actions
- **Deploy** - Create a deployment task for any project
- **New Task** - Quickly dispatch a new task
- **Log** - Add an entry to the memory system

### Notifications
The extension will notify you when:
- New urgent tasks are pending
- Tasks are assigned to you (configurable)

You can configure notifications in Settings.

## Files Structure

```
blackroad-chrome-extension/
├── manifest.json       # Extension manifest (Manifest V3)
├── src/
│   ├── popup.html     # Popup UI
│   ├── popup.css      # Popup styles (BlackRoad brand)
│   ├── popup.js       # Popup logic
│   ├── background.js  # Service worker
│   ├── options.html   # Settings page
│   └── options.js     # Settings logic
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Development

### Building
No build step required - the extension uses vanilla JavaScript.

### Testing
1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the BlackRoad extension
4. Test your changes

### Packaging
```bash
# Create zip for Chrome Web Store
zip -r blackroad-chrome-extension.zip . -x "*.git*" -x "*.DS_Store"
```

## Permissions

The extension requires:
- `storage` - Save API key and settings
- `notifications` - Show desktop notifications
- `alarms` - Periodic background checks
- `host_permissions` - Access BlackRoad API

## Links

- [BlackRoad Console](https://console.blackroad.io)
- [API Documentation](https://docs.blackroad.io/api)
- [Support](https://github.com/BlackRoad-OS/blackroad-chrome-extension/issues)

## License

See [LICENSE](./LICENSE) for details.

---

Part of the **BlackRoad Empire**
