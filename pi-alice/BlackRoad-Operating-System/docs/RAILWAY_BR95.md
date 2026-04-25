# Railway Deployment Guide - BR-95 Desktop OS

This guide explains how to deploy the BlackRoad Operating System (BR-95 Desktop) to Railway.

## Overview

The BR-95 Desktop is a retro Windows 95-inspired web-based operating system that provides:
- **Lucidia AI Orchestration** - 1000+ AI agents
- **RoadChain Blockchain** - Decentralized ledger
- **RoadCoin Wallet** - Cryptocurrency management
- **Mining Interface** - RoadCoin mining dashboard
- **Raspberry Pi Management** - IoT device control
- **Terminal** - Simulated command-line interface
- **Real-time Updates** - WebSocket live data streaming

## Architecture

```
BR-95 Desktop (HTML + JS + CSS)
         ↓
FastAPI Backend (backend/app/main.py)
         ↓
BR-95 Router (backend/app/routers/br95.py)
         ↓
Data Simulator + WebSocket Manager
```

## Deployment Configuration

### Railway Project

- **Project Name**: `gregarious-wonder`
- **Service Name**: `BlackRoad-Operating-System`
- **Primary Domain**: `app.blackroad.systems`
- **Default URL**: `https://blackroad-operating-system-production.up.railway.app`

### Configuration Files

**railway.toml**:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Environment Variables

Railway automatically sets:
- `PORT` - The port the application should listen on (default: 8080)

Optional environment variables:
- `BR_OS_VERSION` - Version string for `/version` endpoint (default: "1.0.0")
- `GIT_SHA` - Git commit SHA for version tracking
- `BUILD_TIME` - Build timestamp

## API Endpoints

The BR-95 backend exposes the following endpoints:

### Health & Version

- `GET /health` - Health check endpoint
  ```json
  {
    "status": "healthy",
    "service": "blackroad-operating-system",
    "timestamp": "2025-11-20T12:34:56Z"
  }
  ```

- `GET /version` - Version information
  ```json
  {
    "service": "blackroad-operating-system",
    "version": "1.0.0",
    "git_sha": "abc123",
    "build_time": "2025-11-20T12:00:00Z"
  }
  ```

### BR-95 Data APIs

All BR-95 endpoints are prefixed with `/api/br95`:

- `GET /api/br95/lucidia` - Lucidia AI orchestration stats
- `GET /api/br95/agents` - AI agent statistics
- `GET /api/br95/roadchain` - Blockchain statistics
- `GET /api/br95/wallet` - Wallet balance and transactions
- `GET /api/br95/miner` - Mining performance metrics
- `GET /api/br95/raspberry-pi` - Raspberry Pi device stats
- `GET /api/br95/github` - GitHub integration stats
- `GET /api/br95/roadmail` - RoadMail statistics
- `GET /api/br95/roadcraft` - RoadCraft game statistics
- `GET /api/br95/road-city` - Road City metaverse statistics
- `POST /api/br95/terminal` - Execute terminal commands

### WebSocket

- `WS /api/br95/ws` - Real-time updates WebSocket

  **Message Types**:
  - `connected` - Initial connection confirmation
  - `miner_update` - Mining statistics update
  - `roadchain_update` - Blockchain statistics update
  - `wallet_update` - Wallet balance update

  **Example Message**:
  ```json
  {
    "type": "miner_update",
    "data": {
      "is_mining": true,
      "hash_rate": "1.2 GH/s",
      "shares_accepted": 8423,
      "blocks_mined": 12
    },
    "timestamp": "2025-11-20T12:34:56Z"
  }
  ```

## Deployment Process

### 1. Connect to Railway

```bash
# Install Railway CLI
curl -fsSL https://railway.com/install.sh | sh

# Login
railway login

# Link to project
railway link c03a8b98-5c40-467b-b344-81c97de22ba8
```

### 2. Deploy

Railway will automatically deploy when you push to the connected branch:

```bash
git push origin main
```

Or deploy manually:

```bash
railway up
```

### 3. Verify Deployment

Check the health endpoint:

```bash
curl https://app.blackroad.systems/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "blackroad-operating-system",
  "timestamp": "2025-11-20T12:34:56Z"
}
```

### 4. Test the BR-95 Desktop

Open in your browser:
```
https://app.blackroad.systems/
```

You should see:
1. Boot screen with BlackRoad logo animation
2. Desktop with icons (Lucidia, Agents, RoadChain, Wallet, Miner, etc.)
3. Taskbar with "Road" button and system clock
4. Working windows with real-time data from the API

### 5. Test WebSocket

Open the browser console and check for:
```
✅ BR-95 WebSocket connected
WebSocket confirmed: BR-95 OS WebSocket connected
```

## Troubleshooting

### Health Check Failures

If the health check fails:

1. Check the Railway logs:
   ```bash
   railway logs
   ```

2. Verify the service is listening on `$PORT`:
   ```python
   # backend/app/main.py should use:
   # uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```

3. Ensure `/health` endpoint is accessible:
   ```bash
   curl https://app.blackroad.systems/health
   ```

### WebSocket Connection Issues

If WebSocket fails to connect:

1. Check the browser console for errors
2. Verify WebSocket is properly configured in `br95.py`:
   ```python
   @router.websocket("/ws")
   async def websocket_endpoint(websocket: WebSocket):
       await manager.connect(websocket)
       # ...
   ```

3. Test WebSocket manually:
   ```javascript
   const ws = new WebSocket('wss://app.blackroad.systems/api/br95/ws');
   ws.onopen = () => console.log('Connected');
   ws.onmessage = (e) => console.log('Message:', e.data);
   ```

### Missing Dependencies

If deployment fails due to missing dependencies:

1. Verify `psutil` is in `backend/requirements.txt`:
   ```
   psutil==5.9.6
   ```

2. Rebuild the service:
   ```bash
   railway up --detach
   ```

### API Returns 404

If `/api/br95/*` endpoints return 404:

1. Verify the router is registered in `backend/app/main.py`:
   ```python
   from app.routers import br95
   app.include_router(br95.router)
   ```

2. Check the router prefix in `br95.py`:
   ```python
   router = APIRouter(prefix="/api/br95", tags=["BR-95 Desktop"])
   ```

### Static Files Not Loading

If CSS/JS files fail to load:

1. Verify static file serving in `main.py`:
   ```python
   app.mount("/static", StaticFiles(directory=static_dir, html=True), name="static")
   ```

2. Check file paths in HTML:
   ```html
   <!-- Should be relative paths -->
   <link rel="stylesheet" href="styles.css">
   <script src="script.js"></script>
   ```

## Monitoring

### View Logs

```bash
railway logs
railway logs --follow  # Stream logs
```

### Check Metrics

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count

Access these in the Railway dashboard.

### Custom Metrics

The BR-95 backend includes Prometheus metrics (if enabled):

- Request duration
- Request count
- WebSocket connections
- API endpoint usage

## Scaling

Railway automatically handles scaling for:
- Horizontal scaling (multiple instances)
- Vertical scaling (increased resources)

To manually adjust:
1. Go to Railway dashboard
2. Select the service
3. Adjust resources under "Settings"

## Custom Domain

The service is already configured with:
- Primary: `app.blackroad.systems`
- Railway default: `blackroad-operating-system-production.up.railway.app`

To add additional domains:
1. Go to Railway dashboard
2. Select the service
3. Click "Settings" → "Domains"
4. Add custom domain
5. Configure DNS (CNAME or A record)

## Security

### Environment Variables

Store sensitive data in Railway environment variables:
```bash
railway variables set SECRET_KEY=your-secret-key
railway variables set DATABASE_URL=postgresql://...
```

### CORS Configuration

CORS is configured in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Update `ALLOWED_ORIGINS` in environment:
```bash
railway variables set ALLOWED_ORIGINS="https://app.blackroad.systems,https://blackroad.systems"
```

## Rollback

To rollback to a previous deployment:

1. Go to Railway dashboard
2. Select the service
3. Click "Deployments"
4. Select previous deployment
5. Click "Redeploy"

Or via CLI:
```bash
railway rollback
```

## Support

For issues:
1. Check Railway logs: `railway logs`
2. Review this documentation
3. Check CLAUDE.md for development guidelines
4. Open an issue on GitHub

## References

- Railway Documentation: https://docs.railway.app
- FastAPI Documentation: https://fastapi.tiangolo.com
- WebSocket Documentation: https://websockets.readthedocs.io
- BR-95 Router: `backend/app/routers/br95.py`
- Main Application: `backend/app/main.py`
- Desktop UI: `backend/static/index.html`
