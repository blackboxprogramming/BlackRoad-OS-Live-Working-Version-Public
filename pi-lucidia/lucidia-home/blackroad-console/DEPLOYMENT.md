# BlackRoad Console Deployment Guide

## Live URLs

**Primary Console:**
- https://app.blackroad.io/

**Cloudflare Pages:**
- https://blackroad-console.pages.dev/

**Alternative Domains:**
- https://console.blackroad.systems/
- https://os.blackroad.me/
- https://desktop.lucidia.earth/

## Deployment Methods

### Cloudflare Pages (Recommended)

The console is deployed via Cloudflare Pages using Wrangler CLI.

**Deploy command:**
```bash
cd /Users/alexa/blackroad-console-deploy
wrangler pages deploy . --project-name=blackroad-console
```

**Configuration:**
- Project: `blackroad-console`
- Custom Domain: `app.blackroad.io`
- Build Output: Current directory (static files)
- Wrangler Config: `wrangler.toml`

**Recent Deployment:**
```
✨ Success! Uploaded 36 files (5 already uploaded) (1.76 sec)
🌎 Deploying...
✨ Deployment complete! https://4f1838d9.blackroad-console.pages.dev
```

### Backend API Deployment

The backend API runs on Raspberry Pi (Lucidia).

**Deploy to Pi:**
```bash
./backend/deploy.sh
```

**Manual deployment:**
```bash
# From local machine
rsync -avz --exclude 'node_modules' --exclude 'data' backend/ pi@192.168.4.38:/home/pi/blackroad-console-backend/
ssh pi@192.168.4.38 'cd /home/pi/blackroad-console-backend && npm install --production && npm run init-db'
ssh pi@192.168.4.38 'sudo systemctl restart blackroad-api'
```

**Check status:**
```bash
ssh pi@192.168.4.38 'sudo systemctl status blackroad-api'
ssh pi@192.168.4.38 'sudo journalctl -u blackroad-api -f'
```

## File Structure

```
blackroad-console-deploy/
├── index.html              # Main desktop OS ✅
├── health.html             # Health monitor panel ✅
├── memory.html             # Memory vault panel ✅
├── vault.html              # Token vault panel ✅
├── agent-builder.html      # Agent builder panel ✅
├── billing.html            # Billing panel ✅
├── settings.html           # Settings panel ✅
├── login.html              # Authentication page ✅
├── calc.html               # Calculator utility
├── graph.html              # Graph visualization
├── wizard.html             # Setup wizard
├── agent-lucidia.html      # Lucidia agent interface
├── vault-integrated.html   # Integrated vault
├── wrangler.toml           # Cloudflare Pages config
├── PANEL_INTEGRATION.md    # Integration guide
├── SHORTCUTS.md            # Keyboard shortcuts
├── DEPLOYMENT.md           # This file
├── js/
│   ├── api-client.js       # API integration library
│   ├── state-manager.js    # State management
│   └── ui-components.js    # Reusable components
└── backend/
    ├── server.js           # Express API server
    ├── package.json        # Node dependencies
    ├── deploy.sh           # Pi deployment script
    ├── api/                # REST API routes
    ├── db/                 # SQLite schema
    ├── auth/               # JWT middleware
    ├── services/           # Logger utilities
    └── websocket/          # WebSocket handlers
```

## Deployment Checklist

### Frontend (Cloudflare Pages)

- [x] All panels integrated into index.html
- [x] Dock updated with all 9 panels
- [x] Keyboard shortcuts configured (Alt+1-9)
- [x] Operator Action Center implemented
- [x] Window management fully functional
- [x] iframe CSS optimized for panels
- [x] Deployed to app.blackroad.io
- [x] Documentation updated

### Backend (Raspberry Pi)

- [ ] Backend API deployed to Pi (192.168.4.38)
- [ ] SQLite database initialized
- [ ] Environment variables configured
- [ ] Systemd service running
- [ ] Nginx reverse proxy configured
- [ ] JWT authentication tested
- [ ] WebSocket connections verified
- [ ] API endpoints responding

## Environment Configuration

### Frontend (.env)

Not required - all static files.

### Backend (.env)

Required environment variables:

```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_aes_key_here
DB_PATH=./data/console.db
ALLOWED_ORIGINS=https://app.blackroad.io,https://blackroad-console.pages.dev
```

**Security Notes:**
- JWT_SECRET must be changed from default
- ENCRYPTION_KEY must be 32 bytes for AES-256
- ALLOWED_ORIGINS must include all production domains

## Custom Domain Setup

### Cloudflare DNS Configuration

The custom domain `app.blackroad.io` is configured via Cloudflare Pages:

1. Go to Cloudflare Pages dashboard
2. Select `blackroad-console` project
3. Navigate to "Custom domains"
4. Add `app.blackroad.io`
5. DNS records auto-configured (CNAME to pages.dev)

### SSL/TLS

- Automatic HTTPS via Cloudflare Pages
- Universal SSL certificate
- Always use HTTPS enabled

## CI/CD Pipeline

Currently using **manual deployment** via Wrangler CLI.

**Future enhancement options:**
- GitHub Actions workflow
- Auto-deploy on git push
- Staging environment (staging.blackroad.io)
- Preview deployments for branches

## Monitoring

### Frontend

- Cloudflare Analytics (automatic)
- Real User Monitoring (RUM)
- Core Web Vitals tracking

### Backend

- Systemd journal logs: `journalctl -u blackroad-api -f`
- Activity log table in SQLite
- Health endpoint: `/api/health/nodes`

## Rollback Procedure

### Frontend Rollback

```bash
# List deployments
wrangler pages deployment list --project-name=blackroad-console

# Rollback to specific deployment
wrangler pages deployment tail <DEPLOYMENT_ID>
```

### Backend Rollback

```bash
# SSH to Pi
ssh pi@192.168.4.38

# Restore from backup
cd /home/pi/blackroad-console-backend
git checkout <previous-commit>
npm install --production
sudo systemctl restart blackroad-api
```

## Testing Checklist

After deployment, verify:

- [ ] Index page loads at app.blackroad.io
- [ ] All 9 dock icons present
- [ ] Terminal window auto-opens
- [ ] Agent Registry window auto-opens
- [ ] Health Monitor panel loads in iframe
- [ ] Memory Vault panel loads in iframe
- [ ] Token Vault panel loads in iframe
- [ ] Agent Builder panel loads in iframe
- [ ] Billing panel loads in iframe
- [ ] Settings panel loads correctly
- [ ] File Manager shows structure
- [ ] Operator Action Center opens
- [ ] Keyboard shortcuts work (Alt+1-9)
- [ ] Window dragging/resizing works
- [ ] Window minimize/maximize/close work
- [ ] Alt+Tab window switching works
- [ ] Clock displays correctly
- [ ] Status indicators show correct state

## Backend API Testing

- [ ] Health endpoint: `GET /api/health/nodes`
- [ ] Auth endpoint: `POST /api/auth/register`
- [ ] Login endpoint: `POST /api/auth/login`
- [ ] Agents endpoint: `GET /api/agents`
- [ ] Memory endpoint: `GET /api/memory`
- [ ] Vault endpoint: `GET /api/vault/tokens`
- [ ] WebSocket connection: `ws://192.168.4.38:3000`

## Performance Optimization

### Frontend

- Static HTML/CSS/JS served via Cloudflare CDN
- Gzip compression automatic
- HTTP/2 enabled
- Brotli compression enabled
- Asset caching via Cloudflare

### Backend

- SQLite WAL mode for concurrency
- Connection pooling
- JWT session caching
- Activity log batching

## Known Issues

1. **iframe CORS**: Ensure backend allows app.blackroad.io origin
2. **WebSocket**: May require separate ws:// connection config
3. **Local Storage**: Each iframe has its own localStorage context
4. **Authentication**: JWT tokens need to be passed to iframes

## Support & Maintenance

**Logs:**
- Frontend: Cloudflare Pages dashboard
- Backend: `ssh pi@192.168.4.38 'sudo journalctl -u blackroad-api -f'`

**Database:**
- Location: `/home/pi/blackroad-console-backend/data/console.db`
- Backup: Daily automatic backups recommended

**Contact:**
- Email: blackroad.systems@gmail.com
- GitHub: BlackRoad-OS organization
- Linear: Bug tracking and feature requests

---

**Last Deployed:** 2025-12-21
**Deployment ID:** 4f1838d9
**Version:** 1.0.0
**Environment:** Production
