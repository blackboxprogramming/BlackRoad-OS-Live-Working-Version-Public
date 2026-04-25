# Window Navigation & Agent Editing System

## Overview
The BlackRoad OS Console now supports full window navigation and agent editing capabilities. You can navigate between windows using keyboard shortcuts and edit agent configurations through a dedicated UI.

## Window Navigation Features

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + Tab` | Switch to next window |
| `Alt + Shift + Tab` | Switch to previous window |
| `Alt + 1` | Focus Terminal window |
| `Alt + 2` | Focus Agent Registry window |
| `Alt + 3` | Focus Metrics window |
| `Alt + 4` | Focus File Manager window |
| `Alt + 5` | Focus Settings window |

### Window Management Functions

**focusWindow(windowType)**
- Focuses a specific window by type
- Automatically unminimizes if the window is minimized
- Returns the window object or null

**switchToNextWindow()**
- Cycles through all open windows in order
- Automatically unminimizes windows
- Wraps around to first window after last

**switchToPreviousWindow()**
- Cycles backward through all open windows
- Automatically unminimizes windows
- Wraps around to last window before first

## Agent Editing Features

### Interactive Agent Cards

All agent cards in the Agent Registry window are now clickable. Clicking any agent card opens an Agent Editor window with the following fields:

- **Agent ID** (read-only) - Unique identifier
- **Name** - Display name of the agent
- **Type** - Agent role (orchestrator, inference, security, analytics, memory, routing)
- **Status** - Current status (online, offline, idle, busy)
- **Capabilities** - Comma-separated list of capabilities
- **Home Server** - IP address or hostname of the agent's server

### editAgent(agentId)

Opens an editor window for the specified agent with a pre-populated form.

**Features:**
- Cascading window positioning (offset based on number of open windows)
- Full form validation
- Real-time updates to the Agent Registry
- Status color coding (online=blue, busy=orange, idle=purple, offline=gray)

### saveAgentChanges(event, agentId)

Saves the agent configuration and updates the UI:
1. Collects form data
2. Updates the agent card in the registry
3. Changes status indicator color
4. Displays success notification
5. Closes the editor window

**Console logging:** All saves are logged to console for debugging:
```javascript
{
  agentId: 'lucidia-prime',
  name: 'Lucidia Prime',
  type: 'orchestrator',
  status: 'online',
  capabilities: 'reasoning, task_execution, memory_access',
  server: '192.168.4.38'
}
```

## Frontend Integration Points

### index.html (lines 715-745)
Agent cards with click handlers:
```html
<div class="agent-card" data-agent-id="lucidia-prime" onclick="editAgent('lucidia-prime')">
```

### WindowManager Class (lines 515-672)
Core window management with:
- `createWindow(config)` - Creates new window
- `setActiveWindow(window)` - Focus management
- `setupDragging(window)` - Drag support
- `setupResizing(window)` - Resize support

### Navigation Functions (lines 892-925)
- Window focus and switching logic
- Keyboard event listeners
- Window state management

### Agent Editor (lines 927-1041)
- Dynamic form generation
- Save/Cancel handlers
- UI update logic

## CSS Styling (lines 358-414)

Agent cards have interactive hover states:
```css
.agent-card:hover {
    transform: translateY(-2px);
    border-color: var(--border-glow);
    box-shadow: 0 8px 24px rgba(233,30,140,0.2);
}
```

## Usage Examples

### Navigate Between Windows
```javascript
// Switch to next window
switchToNextWindow();

// Focus a specific window type
focusWindow('agents');

// Via keyboard
// Press Alt+Tab to cycle windows
// Press Alt+2 to focus Agent Registry
```

### Edit an Agent
```javascript
// Programmatically open editor
editAgent('oracle');

// Or click any agent card in the UI
```

### Save Changes
```javascript
// Form submit automatically calls saveAgentChanges()
// Updates are applied immediately to the agent card
// Changes are logged to console for backend integration
```

## Backend Integration Ready

The agent editing system logs all changes to console and is ready to integrate with the backend API:

**Endpoint to call:** `PATCH /api/agents/:id`

**Payload structure:**
```json
{
  "name": "Oracle",
  "type": "inference",
  "status": "online",
  "capabilities": "reasoning, task_execution, memory_access",
  "home_server": "192.168.4.38"
}
```

Add this to `saveAgentChanges()` to persist changes:
```javascript
await window.BlackRoadAPI.updateAgent(agentId, {
  name, type, status,
  capabilities: capabilities.split(',').map(c => c.trim()),
  home_server: server
});
```

## Status Indicators

Color coding for agent status:
- **Online** - `var(--accent-blue)` - #14f195 (cyan/green)
- **Busy** - `var(--accent-orange)` - #f7931a (orange)
- **Idle** - `var(--accent-purple)` - #9945ff (purple)
- **Offline** - `var(--text-muted)` - rgba(255,255,255,0.3) (gray)

## Future Enhancements

Potential additions:
1. Backend API integration for persistence
2. Real-time WebSocket sync of agent changes
3. Agent metrics visualization in editor
4. Bulk agent operations
5. Agent cloning/duplication
6. Drag-and-drop agent organization
7. Agent search/filter in registry
