# BlackRoad OS Backend Integration Guide

## Overview

This document describes the complete integration between the BlackRoad OS desktop front-end and the FastAPI backend, transforming the static mockup into a fully functional web-based operating system.

## Architecture

### Full-Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONT-END (BlackRoad OS Desktop UI)                        │
│  Location: backend/static/                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  index.html                                          │  │
│  │  - Windows 95-inspired UI                            │  │
│  │  - 16 desktop applications                           │  │
│  │  - Dynamic content loading                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  JavaScript Modules                                  │  │
│  │  ├─ api-client.js (API communication layer)          │  │
│  │  ├─ auth.js (authentication & session management)    │  │
│  │  └─ apps.js (application data loading & UI updates)  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│  BACK-END (FastAPI Server)                                  │
│  Location: backend/app/                                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routers                                         │  │
│  │  ├─ /api/auth        - Authentication & user mgmt    │  │
│  │  ├─ /api/blockchain  - RoadCoin blockchain           │  │
│  │  ├─ /api/miner       - Mining stats & control        │  │
│  │  ├─ /api/devices     - IoT/Raspberry Pi management   │  │
│  │  ├─ /api/email       - RoadMail                      │  │
│  │  ├─ /api/social      - Social media feed             │  │
│  │  ├─ /api/videos      - BlackStream video platform    │  │
│  │  ├─ /api/files       - File storage                  │  │
│  │  └─ /api/ai-chat     - AI assistant                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────┐   ┌─────────────────────┐         │
│  │  PostgreSQL        │   │  Redis              │         │
│  │  - All data models │   │  - Sessions/cache   │         │
│  └────────────────────┘   └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## New Features Implemented

### 1. Device Management (Raspberry Pi / IoT)

**Backend:**
- New models: `Device`, `DeviceMetric`, `DeviceLog`
- Router: `backend/app/routers/devices.py`
- Endpoints:
  - `GET /api/devices/` - List all devices
  - `GET /api/devices/stats` - Overall device statistics
  - `GET /api/devices/{device_id}` - Get device details
  - `POST /api/devices/` - Register new device
  - `PUT /api/devices/{device_id}` - Update device
  - `POST /api/devices/{device_id}/heartbeat` - Device status update (for IoT agents)
  - `DELETE /api/devices/{device_id}` - Remove device

**Frontend:**
- Window: Raspberry Pi (🥧)
- Shows online/offline status of all registered devices
- Displays CPU, RAM, temperature metrics for online devices
- Auto-populated from `/api/devices` endpoint

### 2. Mining Stats & Control (RoadCoin Miner)

**Backend:**
- Router: `backend/app/routers/miner.py`
- Features:
  - Simulated mining process with hashrate, shares, temperature
  - Start/stop/restart mining controls
  - Lifetime statistics (blocks mined, RoadCoins earned)
  - Recent blocks listing
  - Mining pool information
- Endpoints:
  - `GET /api/miner/status` - Current miner performance
  - `GET /api/miner/stats` - Lifetime mining statistics
  - `GET /api/miner/blocks` - Recently mined blocks
  - `POST /api/miner/control` - Start/stop mining
  - `GET /api/miner/pool/info` - Pool connection info

**Frontend:**
- Window: RoadCoin Miner (⛏️)
- Live stats: hashrate, shares, temperature, power consumption
- Blocks mined count and RoadCoins earned
- Start/stop mining button
- Recent blocks list with timestamps

### 3. Enhanced Blockchain Explorer (RoadChain)

**Frontend Integration:**
- Window: RoadChain Explorer (⛓️)
- Live data from `/api/blockchain` endpoints:
  - Chain height, total transactions, difficulty
  - Recent blocks list (clickable for details)
  - "Mine New Block" button
- Auto-refreshes blockchain stats

### 4. Live Wallet

**Frontend Integration:**
- Window: Wallet (💰)
- Real-time balance from `/api/blockchain/balance`
- Wallet address display with copy functionality
- Recent transactions list with incoming/outgoing indicators
- USD conversion estimate

### 5. Authentication System

**Features:**
- Login/Register modal that blocks access until authenticated
- JWT token-based authentication stored in `localStorage`
- Session persistence across page reloads
- Auto-logout on token expiration
- User-specific data isolation

**Files:**
- `backend/static/js/auth.js` - Authentication module
- Automatic wallet creation on user registration
- Login form with keyboard support (Enter to submit)

### 6. Other Application Integrations

**RoadMail:**
- Connected to `/api/email` endpoints
- Shows real inbox messages
- Email detail viewing (TODO: full implementation)

**BlackRoad Social:**
- Connected to `/api/social/feed`
- Shows real posts from database
- Like/comment functionality
- Post creation (stub)

**BlackStream:**
- Connected to `/api/videos`
- Video grid with view/like counts
- Video playback (stub)

**AI Assistant:**
- Connected to `/api/ai-chat` endpoints
- Conversation management (basic UI)
- Message sending (simulated responses until OpenAI integration)

## API Client Architecture

### API Client Module (`api-client.js`)

**Key Features:**
- Automatic base URL detection (localhost vs production)
- JWT token management
- Automatic 401 handling (triggers re-login)
- Centralized error handling
- Type-safe method wrappers for all API endpoints

**Usage Example:**
```javascript
// Get miner status
const status = await window.BlackRoadAPI.getMinerStatus();

// Mine a new block
const block = await window.BlackRoadAPI.mineBlock();

// Get devices
const devices = await window.BlackRoadAPI.getDevices();
```

### Apps Module (`apps.js`)

**Responsibilities:**
- Load data when windows are opened
- Auto-refresh for real-time windows (miner stats every 5s)
- Format and render dynamic content
- Handle user interactions (mine block, toggle miner, etc.)

**Window Loading:**
- Lazy loading: data is fetched only when window is opened
- Auto-refresh for critical apps (miner, blockchain)
- Efficient state management

## Environment Configuration

### Production Deployment

**Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_ASYNC_URL=postgresql+asyncpg://user:pass@host:5432/db

# Redis
REDIS_URL=redis://host:6379/0

# Security
SECRET_KEY=your-production-secret-key

# CORS - Add your production domain
ALLOWED_ORIGINS=https://www.blackroad.systems

# Optional: AI Integration
OPENAI_API_KEY=sk-...

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: File Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=blackroad-files
```

### Railway Deployment

The app is designed to work seamlessly with Railway:

1. **Static Files**: Backend serves `backend/static/index.html` at root URL
2. **API Routes**: All API endpoints under `/api/*`
3. **CORS**: Configured to allow Railway domains
4. **Database**: PostgreSQL plugin
5. **Redis**: Redis plugin

**Start Command:**
```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Database Schema

### New Tables

**devices:**
- Device registration and status tracking
- Real-time metrics (CPU, RAM, temperature)
- Services and capabilities tracking
- Owner association (user_id)

**device_metrics:**
- Time-series data for device performance
- Historical tracking

**device_logs:**
- Device event logging
- System, network, service, hardware events

### Updated Tables

**users:**
- Added `devices` relationship

## Static File Serving

The backend now serves the front-end:

```python
# backend/app/main.py
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
app.mount("/static", StaticFiles(directory=static_dir, html=True), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse(os.path.join(static_dir, "index.html"))
```

## Development Workflow

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   docker-compose up -d  # Start PostgreSQL + Redis
   python run.py         # Start FastAPI server (defaults to :8000 unless PORT is set)
   ```

2. **Access UI:**
   ```
   http://localhost:8000
   ```

3. **API Docs:**
   ```
   http://localhost:8000/api/docs
   ```

### Testing

```bash
cd backend
pytest
```

### Building for Production

```bash
# All static files are already in backend/static/
# No build step required - pure HTML/CSS/JS
```

## Future Enhancements

### Priority 1 (Core Functionality)
- [ ] Real XMRig integration for actual cryptocurrency mining
- [ ] WebSocket support for real-time updates
- [ ] MQTT broker integration for device heartbeats
- [ ] Actual AI chat integration (OpenAI/Anthropic API)

### Priority 2 (Features)
- [ ] File upload to S3
- [ ] Email sending via SMTP
- [ ] Video upload and streaming
- [ ] Enhanced blockchain features (peer-to-peer, consensus)

### Priority 3 (UX Improvements)
- [ ] Mobile responsive design
- [ ] Dark mode support
- [ ] Keyboard shortcuts for all actions
- [ ] Desktop icon customization

## Security Considerations

### Current Implementation

✅ **Implemented:**
- JWT authentication with token expiration
- Password hashing (bcrypt)
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- User data isolation

⚠️ **TODO:**
- Rate limiting on API endpoints
- HTTPS enforcement in production
- Wallet private key encryption at rest
- Two-factor authentication
- API key rotation

## Troubleshooting

### Common Issues

**1. Authentication Modal Won't Close**
- Check browser console for API errors
- Verify DATABASE_URL and SECRET_KEY are set
- Ensure PostgreSQL is running

**2. Static Files Not Loading**
- Verify `backend/static/` directory exists
- Check `backend/static/js/` has all three JS files
- Review browser console for 404 errors

**3. API Calls Failing**
- Check CORS settings in `.env`
- Verify ALLOWED_ORIGINS includes your domain
- Check browser network tab for CORS errors

**4. Mining Stats Not Updating**
- Verify user is logged in
- Check browser console for errors
- Ensure `/api/miner` endpoints are working (test in `/api/docs`)

## File Structure Summary

```
BlackRoad-Operating-System/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app with static file serving
│   │   ├── models/
│   │   │   ├── device.py           # NEW: Device, DeviceMetric, DeviceLog
│   │   │   └── user.py             # UPDATED: Added devices relationship
│   │   └── routers/
│   │       ├── devices.py          # NEW: Device management API
│   │       └── miner.py            # NEW: Mining stats & control API
│   ├── static/
│   │   ├── index.html              # UPDATED: Added auth modal, CSS, JS imports
│   │   └── js/
│   │       ├── api-client.js       # NEW: Centralized API client
│   │       ├── auth.js             # NEW: Authentication module
│   │       └── apps.js             # NEW: Application data loaders
│   └── .env.example                # UPDATED: Added device & mining vars
└── INTEGRATION_GUIDE.md            # THIS FILE
```

## API Endpoint Summary

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Invalidate token

### Mining
- `GET /api/miner/status` - Current performance
- `GET /api/miner/stats` - Lifetime stats
- `GET /api/miner/blocks` - Recent blocks
- `POST /api/miner/control` - Start/stop

### Blockchain
- `GET /api/blockchain/wallet` - User wallet
- `GET /api/blockchain/balance` - Current balance
- `GET /api/blockchain/blocks` - Recent blocks
- `POST /api/blockchain/mine` - Mine new block
- `GET /api/blockchain/stats` - Chain statistics

### Devices
- `GET /api/devices/` - List devices
- `GET /api/devices/stats` - Statistics
- `POST /api/devices/` - Register device
- `POST /api/devices/{id}/heartbeat` - Update status

### Social/Email/Videos
- See existing API documentation at `/api/docs`

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues
- Pull Requests: Always welcome!

---

**Last Updated:** 2025-11-16
**Version:** 1.0.0 - Full Backend Integration
