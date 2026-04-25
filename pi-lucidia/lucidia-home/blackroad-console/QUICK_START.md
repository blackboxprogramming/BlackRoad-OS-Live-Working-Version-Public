# BlackRoad Console - Quick Start Guide

**Get your BlackRoad infrastructure running in 3 steps**

## Current Status ✅

**Console deployed and operational on Lucidia Pi (192.168.4.38)**

- Frontend: http://192.168.4.38/
- API: http://192.168.4.38/api/ping
- Backend: Healthy (Node.js + SQLite)
- Services: All running via Docker Compose

## Three Deployment Modes

### Mode 1: Pi-Only (Local Network) ⭐ CURRENT

**What you have now:**
- Lucidia Pi is the origin server
- Accessible on local network at 192.168.4.38
- No public domain needed
- Full control over logs, processes, debugging

**Access from:**
- ✅ Mac (same network)
- ✅ iPhone (same network)
- ✅ Other devices on 192.168.4.x
- ❌ Public internet

### Mode 2: Pi + Cloudflare Tunnel (Public Access)

**What you can add:**
- Public domains: console.blackroad.io, app.blackroad.io
- HTTPS via Cloudflare
- Still uses Pi as origin
- Accessible from anywhere

**Setup:** See PI_DEPLOYMENT.md "Adding Public Domains"

### Mode 3: Pi Fleet (Multi-Node)

**What you can build:**
- 4 standardized Pi nodes (Lucidia, Aria, Alice, BlackRoad-Pi)
- All bootstrapped identically with one command
- Tailscale mesh networking
- Distributed agent system

**Setup:** See PI_BOOTSTRAP.md

## Quick Commands

### On Your Mac

```bash
# Deploy latest changes to Pi
cd ~/blackroad-console-deploy
./deploy-to-pi.sh

# Check status remotely
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose ps'

# View logs
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f'

# Restart services
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose restart'
```

### On the Pi

```bash
ssh pi@192.168.4.38
cd ~/blackroad-console

# View all containers
docker compose ps

# Follow logs
docker compose logs -f

# Restart specific service
docker compose restart backend

# Check system health (after bootstrap)
br-status

# Interactive menu (after bootstrap)
br-menu
```

### Test Endpoints

```bash
# From anywhere on network:
curl http://192.168.4.38/api/ping
curl -I http://192.168.4.38/

# Expected responses:
# API: {"status":"ok","timestamp":"...","version":"1.0.0"}
# Frontend: HTTP/1.1 200 OK
```

## File Structure

```
blackroad-console-deploy/
├── index.html                    # Main console desktop
├── agent-alice.html              # Alice agent terminal
├── agent-lucidia-terminal.html   # Lucidia agent terminal
├── agent-aria.html               # Aria agent terminal
├── health.html                   # Health monitoring
├── memory.html                   # Memory vault
├── vault.html                    # Token vault
├── billing.html                  # Billing panel
├── settings.html                 # Settings panel
├── deploy-to-pi.sh              # Automated deployment script
├── docker-compose.yml           # Multi-container orchestration
├── Caddyfile                    # Reverse proxy config
├── nginx.conf                   # Static file server config
├── bootstrap.sh                 # Pi standardization script
├── backend/
│   ├── server.js                # Express API server
│   ├── Dockerfile               # Backend container
│   ├── package.json             # Node dependencies
│   ├── api/                     # API route handlers
│   ├── db/                      # SQLite schema
│   └── data/                    # Database files
├── PI_DEPLOYMENT.md             # Comprehensive deployment guide
├── PI_BOOTSTRAP.md              # Fleet reimage guide
└── QUICK_START.md               # This file
```

## URLs Reference

### Local Network
- **Console**: http://192.168.4.38/
- **API**: http://192.168.4.38/api/ping
- **Backend Direct**: http://192.168.4.38:3000/api/ping
- **Frontend Direct**: http://192.168.4.38:8081/

### Cloudflare Pages (currently 500 error)
- ❌ https://console.blackroad.io/
- ❌ https://app.blackroad.io/

**Note:** Cloudflare Pages deployments are encountering routing errors. Pi-based deployment is the working solution.

### Planned Public Domains (via Cloudflare Tunnel)
- 🔜 https://console.blackroad.io/ → http://192.168.4.38/ (via tunnel)
- 🔜 https://app.blackroad.io/ → http://192.168.4.38/ (via tunnel)

## Next Steps

### Immediate (Console is Running)
1. ✅ **Console deployed** - http://192.168.4.38/
2. ✅ **Backend healthy** - All containers running
3. ⏭️ **Test in browser** - Open http://192.168.4.38/ on Mac/iPhone
4. ⏭️ **Create first user** - Register via console UI
5. ⏭️ **Add API tokens** - Store Anthropic/OpenAI keys in vault

### Short-term (Public Access)
1. ⏭️ **Set up Cloudflare Tunnel** - For public domains
2. ⏭️ **Update .env secrets** - Generate secure JWT_SECRET and ENCRYPTION_KEY
3. ⏭️ **Configure agents** - Deploy AI agents to worker Pis

### Long-term (Fleet Management)
1. ⏭️ **Bootstrap all Pis** - Run bootstrap.sh on Aria, Alice, BlackRoad-Pi
2. ⏭️ **Set up Tailscale** - Mesh networking between nodes
3. ⏭️ **Deploy agents** - Distribute AI workloads
4. ⏭️ **Tmux integration** - Name panes, use br-send/br-capture-all

## Environment Configuration

**Important:** Update secrets in production!

```bash
# On Pi:
ssh pi@192.168.4.38
cd ~/blackroad-console
nano .env

# Generate secure secrets:
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY
```

**Required variables:**
- `JWT_SECRET` - Must change from default
- `ENCRYPTION_KEY` - Must change from default (32 bytes for AES-256)
- `DB_PATH` - `/data/console.db` (default ok)
- `NODE_ENV` - `production`
- `PORT` - `3000`
- `ALLOWED_ORIGINS` - Add public domains when ready

## Monitoring

### Health Checks
```bash
# Console accessibility
curl -I http://192.168.4.38/

# API health
curl http://192.168.4.38/api/ping

# Container health
ssh pi@192.168.4.38 'docker compose ps'

# Resource usage
ssh pi@192.168.4.38 'docker stats --no-stream'
```

### Logs
```bash
# All services
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f'

# Backend only
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f backend'

# Last 100 lines
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs --tail=100'
```

## Troubleshooting

### Console not accessible
```bash
# Check containers running
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose ps'

# Restart all
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose restart'

# Check logs for errors
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs --tail=50'
```

### API returning 502
```bash
# Check backend health
ssh pi@192.168.4.38 'docker compose exec backend curl -f http://localhost:3000/api/ping'

# Restart backend
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose restart backend'
```

### Permission errors
```bash
# Fix file permissions (already applied, but if needed again)
ssh pi@192.168.4.38 'chmod -R 755 ~/blackroad-console && find ~/blackroad-console -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -exec chmod 644 {} \;'
```

### Port conflicts
```bash
# Check what's using ports
ssh pi@192.168.4.38 'sudo lsof -i :80 -i :3000 -i :8081'

# Stop conflicting services
ssh pi@192.168.4.38 'sudo systemctl stop nginx'  # If old nginx running
ssh pi@192.168.4.38 'sudo systemctl stop blackroad-api'  # If old service running
```

## Support Resources

- **PI_DEPLOYMENT.md** - Complete deployment documentation
- **PI_BOOTSTRAP.md** - Fleet reimaging and standardization
- **backend/CLAUDE.md** - Backend API architecture and code reference
- **WINDOW_NAVIGATION.md** - Desktop OS window system guide

**Emails:**
- Primary: amundsonalexa@gmail.com
- Company: blackroad.systems@gmail.com

**Infrastructure:**
- GitHub: BlackRoad-OS organization, blackboxprogramming
- Cloudflare: 16 zones, Pages, KV, D1
- Railway: 12+ projects
- DigitalOcean: 159.65.43.12 (codex-infinity)

---

**Last Updated:** December 21, 2025
**Status:** Console deployed and running on Lucidia Pi
**Next:** Test browser access, add Cloudflare Tunnel for public domains
