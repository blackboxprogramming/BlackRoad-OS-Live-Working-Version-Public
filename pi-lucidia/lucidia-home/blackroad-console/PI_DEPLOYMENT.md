# BlackRoad Console - Pi Deployment Guide

## Architecture: Pi as Origin

**Decision:** Use Raspberry Pi (Lucidia @ 192.168.4.38) as the origin server, with optional Cloudflare Tunnel for public access.

**Why:**
- ✅ Full control over logs, processes, and debugging
- ✅ No Worker/Edge runtime mysteries
- ✅ Direct tmux integration for Claude
- ✅ All agents (Alice, Lucidia, Aria) accessible from one place
- ✅ Can add Cloudflare Tunnel later for public domains

## Stack

```
┌─────────────────────────────────────────┐
│  Cloudflare (optional)                  │
│  ↓ Tunnel to Pi (public domains)        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Lucidia Pi (192.168.4.38)              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Caddy (ports 80/443)              │ │
│  │  - Automatic HTTPS                  │ │
│  │  - Reverse proxy                    │ │
│  └────────────────────────────────────┘ │
│              ↓                           │
│  ┌────────────────────────────────────┐ │
│  │  Nginx (port 8080)                 │ │
│  │  - Serves static files             │ │
│  │  - Proxies /api to backend         │ │
│  └────────────────────────────────────┘ │
│              ↓                           │
│  ┌────────────────────────────────────┐ │
│  │  Node.js Backend (port 3000)       │ │
│  │  - Express API                      │ │
│  │  - WebSocket server                 │ │
│  │  - SQLite database                  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Quick Start

### 1. Deploy to Pi

From your Mac:

```bash
cd /Users/alexa/blackroad-console-deploy
./deploy-to-pi.sh
```

This will:
- Sync all files to Pi
- Build Docker containers
- Start the full stack
- Show status and logs

### 2. Access Console

**Local network:**
- http://192.168.4.38/

**From Mac/phone (on same network):**
- http://192.168.4.38/
- http://192.168.4.38/api/ping

### 3. Verify Deployment

```bash
# Check container status
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose ps'

# View logs
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f'

# Test API
curl http://192.168.4.38/api/ping
```

## Docker Compose Services

### Backend (`blackroad-api`)
- **Port:** 3000
- **Database:** SQLite at `/data/console.db`
- **Health check:** `GET /api/ping`
- **Restart policy:** unless-stopped

### Frontend (`blackroad-console`)
- **Port:** 8080
- **Image:** nginx:alpine
- **Serves:** Static HTML/CSS/JS
- **Proxies:** `/api/*` to backend

### Caddy (`blackroad-caddy`)
- **Ports:** 80, 443
- **Features:** Automatic HTTPS, reverse proxy
- **Config:** `Caddyfile`

## Configuration

### Environment Variables

Edit `.env` on the Pi:

```bash
ssh pi@192.168.4.38
cd ~/blackroad-console
nano .env
```

**Required variables:**
```env
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=change-me-to-32-byte-key-for-aes
DB_PATH=/data/console.db
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=http://localhost,http://192.168.4.38,https://console.blackroad.io
```

**Generate secure secrets:**
```bash
# JWT Secret (32 bytes)
openssl rand -base64 32

# Encryption Key (32 bytes for AES-256)
openssl rand -base64 32
```

## Management Commands

### On Your Mac

```bash
# Deploy latest changes
./deploy-to-pi.sh

# Check status
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose ps'

# View logs
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f'

# Restart all services
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose restart'

# Stop all services
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose down'

# Rebuild and restart
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose up -d --build'
```

### On the Pi

```bash
ssh pi@192.168.4.38
cd ~/blackroad-console

# View all containers
docker compose ps

# Follow logs
docker compose logs -f

# Follow specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f caddy

# Restart a specific service
docker compose restart backend

# Exec into a container
docker compose exec backend sh
docker compose exec frontend sh

# View resource usage
docker stats

# Clean up old images
docker system prune -a
```

## Adding Public Domains (Optional)

### Option A: Cloudflare Tunnel

1. **Install cloudflared on Pi:**
```bash
ssh pi@192.168.4.38
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

2. **Authenticate:**
```bash
cloudflared tunnel login
```

3. **Create tunnel:**
```bash
cloudflared tunnel create blackroad-console
```

4. **Configure tunnel:**
```bash
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: blackroad-console
credentials-file: /home/pi/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: console.blackroad.io
    service: http://localhost:80
  - hostname: app.blackroad.io
    service: http://localhost:80
  - service: http_status:404
```

5. **Add DNS records:**
```bash
cloudflared tunnel route dns blackroad-console console.blackroad.io
cloudflared tunnel route dns blackroad-console app.blackroad.io
```

6. **Run tunnel:**
```bash
cloudflared tunnel run blackroad-console
```

7. **Or install as service:**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### Option B: Port Forwarding + Dynamic DNS

1. Forward ports 80/443 on your router to 192.168.4.38
2. Use Dynamic DNS service (e.g., DuckDNS, No-IP)
3. Point console.blackroad.io CNAME to your dynamic DNS

### Option C: Tailscale Funnel (Easy Public Access)

```bash
ssh pi@192.168.4.38
tailscale funnel 80
```

This creates a public URL like: `https://lucidia.tailnet-name.ts.net`

## Tmux Integration

With the console running on the Pi, you can now:

1. **SSH to Pi with tmux:**
```bash
ssh pi@192.168.4.38
tmux attach
```

2. **Set pane names:**
```bash
# In lucidia pane (already on Pi)
tmux select-pane -T lucidia

# In alice pane (SSH to alice machine)
tmux select-pane -T alice

# In aria pane (SSH to aria machine)
tmux select-pane -T aria
```

3. **Use br-send from Mac:**
```bash
# Set up SSH tunnel for tmux control
ssh -t pi@192.168.4.38 "tmux attach"

# Or use br-send locally if tmux is on Mac
~/br-send lucidia "docker compose ps"
```

4. **Capture all pane outputs:**
```bash
~/br-capture-all > context.txt
# Send context.txt to Claude
```

## Monitoring

### Health Checks

```bash
# API health
curl http://192.168.4.38/api/ping

# Container health
ssh pi@192.168.4.38 'docker compose ps'

# System resources
ssh pi@192.168.4.38 'htop'
```

### Logs

```bash
# All services
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f'

# Backend only
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f backend'

# Last 100 lines
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs --tail=100'

# Follow new logs
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose logs -f --tail=0'
```

### Database

```bash
# Backup database
ssh pi@192.168.4.38 'cd ~/blackroad-console/backend/data && sqlite3 console.db .dump > backup.sql'

# Check database size
ssh pi@192.168.4.38 'du -h ~/blackroad-console/backend/data/console.db'

# Interactive SQL
ssh pi@192.168.4.38
cd ~/blackroad-console/backend/data
sqlite3 console.db
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs backend

# Check if port is in use
sudo netstat -tlnp | grep 3000

# Rebuild from scratch
docker compose down
docker compose up -d --build --force-recreate
```

### Can't access from browser

```bash
# Check if containers are running
docker compose ps

# Check if Caddy is listening
curl -I http://localhost

# Check firewall
sudo ufw status

# Allow ports if needed
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Database locked errors

```bash
# Stop all containers
docker compose down

# Check for lock file
ls -la backend/data/

# Remove lock if safe
rm backend/data/console.db-wal
rm backend/data/console.db-shm

# Restart
docker compose up -d
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean old logs
docker compose logs --tail=0 > /dev/null
```

## Backups

### Automated Backup Script

Create on Pi:

```bash
ssh pi@192.168.4.38
nano ~/backup-console.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/pi/backups/console"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp ~/blackroad-console/backend/data/console.db $BACKUP_DIR/console_$DATE.db

# Backup env file
cp ~/blackroad-console/.env $BACKUP_DIR/env_$DATE.txt

# Keep only last 7 backups
ls -t $BACKUP_DIR/console_*.db | tail -n +8 | xargs rm -f
ls -t $BACKUP_DIR/env_*.txt | tail -n +8 | xargs rm -f

echo "Backup complete: $DATE"
```

```bash
chmod +x ~/backup-console.sh

# Add to crontab (daily at 2am)
crontab -e
# Add: 0 2 * * * /home/pi/backup-console.sh
```

## Performance

### Expected Performance on Pi 4

- **Response time:** 50-200ms (local network)
- **Concurrent users:** 10-50 (sufficient for personal use)
- **Memory usage:** ~500MB total
- **CPU usage:** 5-15% idle, 30-60% under load

### Optimization

```bash
# Increase Node.js memory limit if needed
# Edit docker-compose.yml, add to backend environment:
NODE_OPTIONS=--max-old-space-size=512
```

## URLs Summary

**Local Network:**
- http://192.168.4.38/
- http://192.168.4.38/api/ping

**With Cloudflare Tunnel:**
- https://console.blackroad.io/
- https://app.blackroad.io/

**With Tailscale Funnel:**
- https://lucidia.tailnet-name.ts.net/

---

**Last Updated:** December 21, 2025
**Pi:** Lucidia @ 192.168.4.38
**Stack:** Docker Compose + Caddy + Nginx + Node.js + SQLite
