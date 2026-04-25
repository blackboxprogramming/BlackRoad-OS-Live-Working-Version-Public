## BlackRoad Core OS Runtime

**Version:** 0.1.0
**Status:** Phase 2 Scaffold

## Overview

The Core OS Runtime is the heart of BlackRoad OS. It manages the operating system state, window management, user sessions, and provides the foundation for the desktop experience.

## Features

- **Session Management**: User session tracking and authentication state
- **Window Management**: Create, minimize, maximize, and close windows
- **State Management**: Centralized OS state with desktop, taskbar, and system tray
- **API Integration**: Adapter for backend API communication
- **Extensible**: Designed to integrate with backend persistence and real-time sync

## Architecture

```
core_os/
├── __init__.py          # Package exports
├── models.py            # Data models (UserSession, Window, OSState)
├── state.py             # State management functions
├── adapters/            # External service adapters
│   ├── __init__.py
│   └── api_client.py    # Backend API client
├── tests/               # Test suite
│   ├── test_models.py
│   └── test_state.py
└── README.md            # This file
```

## Quick Start

### Basic Usage

```python
from core_os import get_initial_state, open_window, close_window

# Get initial OS state
state = get_initial_state()
print(f"Session: {state.session.display_name}")
print(f"Desktop items: {len(state.desktop_items)}")

# Open a window
state = open_window("notepad", "Untitled - Notepad")
print(f"Windows open: {len(state.windows)}")

# Close the window
window_id = state.windows[0].id
state = close_window(window_id)
print(f"Windows remaining: {len(state.windows)}")
```

### With Backend API

```python
from core_os.adapters.api_client import BackendAPIClient

# Create client
api = BackendAPIClient("http://localhost:8000")

# Check backend health
healthy = await api.health_check()
print(f"Backend healthy: {healthy}")

# Get backend version
version = await api.get_version()
print(f"Backend version: {version['version']}")

# Get public config
config = await api.get_public_config()
print(f"Features: {config['features']}")
```

## Models

### UserSession

Represents a user session with:
- `id`: Unique session ID
- `user_id`: User ID from auth system
- `display_name`: Display name
- `created_at`: Session creation time
- `last_activity`: Last activity time

### Window

Represents an application window with:
- `id`: Unique window ID
- `app_id`: Application identifier
- `title`: Window title
- `state`: Window state (normal, minimized, maximized)
- `position`: Window position (x, y)
- `size`: Window size (width, height)
- `z_index`: Z-index for layering

### OSState

Complete OS state with:
- `session`: Current user session
- `windows`: List of open windows
- `active_window_id`: Currently focused window
- `desktop_items`: Desktop icons/shortcuts
- `taskbar_items`: Taskbar items
- `system_tray_items`: System tray items
- `theme`: Current theme name

## State Management Functions

```python
# Get current state
state = get_current_state()

# Open a window
state = open_window("calculator", "Calculator")

# Close a window
state = close_window(window_id)

# Minimize/maximize windows
state = minimize_window(window_id)
state = maximize_window(window_id)

# Set active window
state = set_active_window(window_id)

# Reset to initial state
state = reset_state()
```

## Running Tests

```bash
# Install pytest if not already installed
pip install pytest

# Run tests
python -m pytest core_os/tests/ -v

# With coverage
python -m pytest core_os/tests/ --cov=core_os --cov-report=html
```

## Integration with BlackRoad OS

The Core OS integrates with:

- **Backend API** - State persistence and authentication
- **Frontend (Pocket OS)** - Desktop UI rendering
- **Operator Engine** - Background task execution
- **Prism Console** - Admin monitoring and debugging

## Phase 2 Roadmap

Current implementation is a **minimal scaffold**. Production roadmap includes:

- [ ] Persistent state storage (Redis/PostgreSQL)
- [ ] Real-time state sync (WebSocket)
- [ ] Multi-user session support
- [ ] Window focus management
- [ ] Desktop customization (icons, wallpaper)
- [ ] Theme switching (classic, dark, custom)
- [ ] Clipboard management
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop support
- [ ] Window snapping and tiling

## How to Run Locally

```bash
# As a library (import in Python)
python
>>> from core_os import get_initial_state, open_window
>>> state = get_initial_state()
>>> print(state.to_dict())

# Run tests
pytest core_os/tests/
```

## API Client Usage

```python
import asyncio
from core_os.adapters.api_client import BackendAPIClient

async def main():
    client = BackendAPIClient("http://localhost:8000")

    # Health check
    if await client.health_check():
        print("Backend is healthy!")

        # Get version
        version = await client.get_version()
        print(f"Version: {version['version']}")

        # Get config
        config = await client.get_public_config()
        print(f"Environment: {config['environment']}")

asyncio.run(main())
```

## Development

```bash
# Install dependencies
pip install httpx pytest

# Run tests
pytest core_os/tests/

# Test with backend
# 1. Start backend: cd backend && uvicorn app.main:app --reload
# 2. Run integration tests
```

## License

Part of BlackRoad Operating System - MIT License

---

**Next Steps**: Integrate with backend persistence, add WebSocket for real-time sync, implement window focus management.
