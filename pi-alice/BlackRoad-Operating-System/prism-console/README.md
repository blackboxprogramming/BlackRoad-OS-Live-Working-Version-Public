# Prism Console

**Version:** 0.1.0
**Status:** Phase 2 Scaffold

## Overview

Prism Console is the administrative and observability interface for BlackRoad OS. It provides real-time monitoring, job management, agent control, and system configuration.

## Features

### Current (Phase 2 Scaffold)
- ✅ Modern dark-themed admin UI
- ✅ Multi-tab navigation (Overview, Jobs, Agents, Logs, System)
- ✅ System metrics dashboard
- ✅ Backend API integration
- ✅ Auto-refresh every 30 seconds
- ✅ Responsive design

### Planned (Production)
- 🔄 Real-time job monitoring (Operator Engine integration)
- 🔄 Live log streaming (WebSocket)
- 🔄 Agent execution controls
- 🔄 System metrics graphs (Prometheus)
- 🔄 User management
- 🔄 Access control (admin-only)

## Architecture

```
prism-console/
├── index.html              # Main console interface
├── static/
│   ├── css/
│   │   └── prism.css       # Console styles
│   └── js/
│       └── prism.js        # Console JavaScript
└── README.md               # This file
```

## Quick Start

### Running Locally

**Option 1: Via Backend (Recommended)**
```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Visit http://localhost:8000/prism
# (Requires backend route configuration)
```

**Option 2: Standalone**
```bash
# Serve from prism-console directory
cd prism-console
python -m http.server 8080

# Visit http://localhost:8080/
```

### Backend Integration

To serve Prism from the main backend, add this to `backend/app/main.py`:

```python
from fastapi.staticfiles import StaticFiles

# Mount Prism Console
prism_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "../prism-console")
if os.path.exists(prism_dir):
    app.mount("/prism", StaticFiles(directory=prism_dir, html=True), name="prism")
```

## UI Components

### Navigation Tabs

1. **Overview** - System status, metrics, quick actions
2. **Jobs** - Scheduled job management (integrates with Operator Engine)
3. **Agents** - AI agent library and execution control
4. **Logs** - Real-time system logs
5. **System** - Configuration and environment variables

### Metrics Dashboard

- System Status (healthy/error)
- Backend Version
- Active Jobs
- Total Agents

### API Endpoints Used

- `GET /api/system/version` - System version and build info
- `GET /api/system/config/public` - Public configuration
- `GET /health` - Backend health check
- `GET /api/operator/jobs` - Job list (future)
- `GET /api/agents` - Agent library (future)

## Integration Points

### With Operator Engine
```javascript
// Future: Real-time job monitoring
async loadJobs() {
  const jobs = await this.fetchAPI('/api/operator/jobs');
  this.renderJobsTable(jobs);
}
```

### With Agent Library
```javascript
// Future: Agent execution
async executeAgent(agentId) {
  await this.fetchAPI(`/api/agents/${agentId}/execute`, {
    method: 'POST'
  });
}
```

### With Logging System
```javascript
// Future: WebSocket log streaming
const ws = new WebSocket('ws://localhost:8000/ws/logs');
ws.onmessage = (event) => {
  this.appendLogEntry(event.data);
};
```

## Styling

Prism uses a dark theme with:
- Primary: Indigo (#6366f1)
- Secondary: Purple (#8b5cf6)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Danger: Red (#ef4444)
- Background: Slate (#0f172a)

## Development

### Adding a New Tab

1. **Add nav button** in `index.html`:
```html
<button class="nav-item" data-tab="mytab">My Tab</button>
```

2. **Add tab panel**:
```html
<div class="tab-panel" id="mytab-tab">
  <h2>My Tab</h2>
  <!-- Content here -->
</div>
```

3. **Add data loader** in `prism.js`:
```javascript
case 'mytab':
  await this.loadMyTabData();
  break;
```

### Customizing Metrics

Edit the metrics grid in `index.html`:
```html
<div class="metric-card">
  <div class="metric-label">My Metric</div>
  <div class="metric-value" id="my-metric">0</div>
</div>
```

Update in `prism.js`:
```javascript
document.getElementById('my-metric').textContent = data.value;
```

## Access Control

**Current**: No authentication (Phase 2 scaffold)

**Future**: Admin-only access
```javascript
// Check if user is admin
if (!await checkAdminRole()) {
  window.location.href = '/';
}
```

## Performance

- **Load time**: <100ms
- **Bundle size**: ~15KB (HTML + CSS + JS)
- **Auto-refresh**: 30 seconds
- **Zero dependencies**: Vanilla JavaScript

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Screenshots

### Overview Tab
- System metrics cards
- Health status indicator
- Quick action buttons

### Jobs Tab
- Scheduled jobs table
- Job status indicators
- Execute/pause controls (future)

### System Tab
- Environment configuration
- Feature flags
- Public settings

## License

Part of BlackRoad Operating System - MIT License

---

**Next Steps**:
1. Add backend route to serve Prism at `/prism`
2. Integrate with Operator Engine for real jobs
3. Add WebSocket for real-time logs
4. Implement authentication/authorization
5. Add metrics visualization (charts)
## Prism Console — Merge Dashboard

**Prism** is the visual command center for BlackRoad OS operations.

The **Merge Dashboard** provides real-time visibility into:
- Active PRs across all repos
- Merge queue status
- CI/CD check results
- Auto-merge eligibility
- PR action history

### Features

- **Real-time Updates**: WebSocket integration for live status
- **Queue Management**: View and manage the merge queue
- **Action Triggers**: Manually trigger PR actions when needed
- **Logs**: View execution logs from the Operator Engine
- **Analytics**: Track merge velocity and queue metrics

### Architecture

```
prism-console/
├── modules/
│   ├── merge-dashboard.js    # Main dashboard logic
│   ├── pr-card.js             # PR status card component
│   └── action-log.js          # Action log viewer
├── pages/
│   └── merge-dashboard.html   # Dashboard UI
├── styles/
│   └── merge-dashboard.css    # Dashboard styling
└── api/
    └── prism-api.js           # API client for Operator Engine
```

### Usage

The Merge Dashboard is integrated into the BlackRoad OS desktop as the "Prism Console" application.

### API Integration

The dashboard connects to the Operator Engine via:
- `/api/operator/queue/stats` - Queue statistics
- `/api/operator/queue/pr/{owner}/{repo}/{pr_number}` - PR action history
- `/api/operator/webhooks/github` - GitHub webhook events

### Development

```bash
# Open in browser
open prism-console/pages/merge-dashboard.html

# Or access via BlackRoad OS
# Desktop > Prism Console
```
