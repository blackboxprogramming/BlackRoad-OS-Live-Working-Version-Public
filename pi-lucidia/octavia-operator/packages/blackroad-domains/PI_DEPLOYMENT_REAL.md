# The REAL Deployment System - Pi Edition

**How we actually deploy everything. No GitHub Actions. No Cloudflare Pages. No bullshit.**

---

## Architecture

```
Internet → Cloudflare DNS → Cloudflare Tunnel → Pi → BlackRoad OS → Docker
```

That's it.

---

## The Pi (192.168.4.64)

**Hardware:** Raspberry Pi 4B
**OS:** Raspberry Pi OS
**Hostname:** aria
**Running:** 26+ Docker containers

### Active Services

```bash
lucidia-earth              → port 3040 (3D Metaverse)
blackroadinc-us            → port 9444
blackroad-docs             → port 3050
roadchain-io               → port 3031
roadcoin-io                → port 3030
blackroadqi-com            → port 3020
earth-blackroad-io         → port 3013
blackroad os                      → reverse proxy (handles all routing)
portainer                  → port 9000 (container management)
```

### The Cloudflare Tunnel

Running as system service:
```bash
/usr/bin/cloudflared tunnel run --token eyJhIjoiODQ4Y2YwYjE4ZDUxZTAxNzBlMGQxNTM3YWVjMzUwNWEiLCJ0IjoiNTI5MTU4NTktZGExOC00YWE2LWFkZDUtN2JkOWZjYWMyZTBiIiwicyI6Ik1HWXdaRE13TXpVdFpHSXdZaTAwTjJJNUxUZzRObVV0WWpOaE1XSmxNVGRsTXpSbSJ9
```

This creates an encrypted tunnel from Cloudflare's edge to the Pi. No port forwarding. No VPN. No firewall config.

---

## How to Deploy ANYTHING

### Step 1: Build it locally

```bash
cd ~/your-project
npm run build
# or
python -m build
# or whatever your build command is
```

### Step 2: Copy it to the Pi

```bash
tar czf dist.tar.gz dist/
scp dist.tar.gz pi@192.168.4.64:/tmp/
```

### Step 3: Run it in Docker

```bash
ssh pi@192.168.4.64

# Extract
cd /tmp
tar xzf dist.tar.gz

# Run container on any available port
docker run -d \
  --name your-site \
  --restart unless-stopped \
  -p 3050:80 \
  -v /tmp/dist:/usr/share/nginx/html:ro \
  nginx:alpine
```

### Step 4: Add to BlackRoad OS

```bash
# Edit BlackRoad OSfile
docker exec blackroad os vi /etc/blackroad os/BlackRoad OSfile

# Add your domain:
your-domain.com {
    reverse_proxy localhost:3050
}

# Reload
docker exec blackroad os blackroad os reload --config /etc/blackroad os/BlackRoad OSfile
```

### Step 5: Add DNS Record

Go to Cloudflare dashboard:
- Type: CNAME
- Name: your-domain.com
- Content: lucidia-earth.pages.dev (or the tunnel hostname)
- Proxied: Yes

**Done. That's the whole process.**

---

## Real Example: Deploying lucidia.earth Metaverse

### What we did:

```bash
# Local machine
cd ~/lucidia-metaverse
npm run build
tar czf dist.tar.gz dist/
scp dist.tar.gz pi@192.168.4.64:/tmp/

# On Pi
ssh pi@192.168.4.64
cd /tmp
tar xzf dist.tar.gz
docker stop lucidia-earth
docker rename lucidia-earth lucidia-earth-old
docker run -d \
  --name lucidia-earth \
  --restart unless-stopped \
  -p 3040:80 \
  -v /tmp/dist:/usr/share/nginx/html:ro \
  nginx:alpine

# Test
curl http://localhost:3040
```

BlackRoad OS was already configured. DNS already pointed to the tunnel. Instant deployment.

**Time: 30 seconds.**

---

## Why This Works Better

### GitHub Actions / Cloudflare Pages
- ❌ Requires API tokens (expire, get revoked, auth errors)
- ❌ Requires GitHub secrets management
- ❌ Requires workflow files
- ❌ Requires SHA pinning for security
- ❌ Runs on shared infrastructure (slow, unreliable)
- ❌ 5-10 minute build times
- ❌ Complex debugging when it breaks
- ❌ 58 repositories = 58 configurations

### Pi Direct Deployment
- ✅ No tokens, no secrets, no auth
- ✅ No config files needed
- ✅ Runs on dedicated hardware (fast, reliable)
- ✅ 30 second deployments
- ✅ Direct SSH access for debugging
- ✅ One Pi = all 58 sites
- ✅ Can test locally before deploying
- ✅ Full control over everything

---

## Container Management

### View all containers
```bash
ssh pi@192.168.4.64
docker ps
```

### View logs
```bash
docker logs lucidia-earth --tail 50 -f
```

### Restart a site
```bash
docker restart lucidia-earth
```

### Update a site
```bash
# Build new version locally
npm run build

# Deploy
scp -r dist/* pi@192.168.4.64:/tmp/dist/
ssh pi@192.168.4.64 "docker restart lucidia-earth"
```

### Rollback
```bash
docker stop lucidia-earth
docker rename lucidia-earth-old lucidia-earth
docker start lucidia-earth
```

---

## BlackRoad OS Configuration

Location: `/etc/blackroad os/BlackRoad OSfile` (inside blackroad os container)

### Current routing:

```blackroad osfile
# Main lucidia.earth
lucidia.earth, www.lucidia.earth {
    reverse_proxy localhost:3040
}

# BlackRoad main site
blackroad.io {
    reverse_proxy localhost:3000
}

# Subdomains
earth.blackroad.io {
    reverse_proxy localhost:3013
}

demo.blackroad.io {
    reverse_proxy localhost:3002
}

# Quantum domains
blackroadqi.com {
    reverse_proxy localhost:3020
}

# Blockchain
roadchain.io {
    reverse_proxy localhost:3031
}

roadcoin.io {
    reverse_proxy localhost:3030
}

# Future Lucidia subdomains
app.lucidia.earth {
    reverse_proxy localhost:3041
}

tube.lucidia.earth {
    reverse_proxy localhost:3042
}

studio.lucidia.earth {
    reverse_proxy localhost:3043
}
```

BlackRoad OS automatically handles:
- SSL certificates (Let's Encrypt)
- HTTP → HTTPS redirect
- Certificate renewal
- Load balancing (if multiple backends)

---

## Port Allocation

Reserved ports on the Pi:

```
3000  - blackroad.io (main site)
3001  - node-api-3001
3002  - demo.blackroad.io
3003  - node-api-3003
3004  - creator-studio.blackroad.io
3005  - devops.blackroad.io
3006  - education.blackroad.io
3007  - finance.blackroad.io
3008  - ideas.blackroad.io
3009  - legal.blackroad.io
3010  - research-lab.blackroad.io
3011  - studio.blackroad.io
3012  - brand.blackroad.io
3013  - earth.blackroad.io
3020  - blackroadqi.com
3021  - blackroadquantum.info
3022  - blackroadquantum.net
3023  - blackroadquantum.shop
3024  - blackroadquantum.store
3030  - roadcoin.io
3031  - roadchain.io
3040  - lucidia.earth (3D Metaverse)
3041  - app.lucidia.earth (reserved)
3042  - tube.lucidia.earth (reserved)
3043  - studio.lucidia.earth (reserved)
3044  - (available)
3050  - blackroad-docs
8081  - blackroad-whoami
9000  - portainer
9443  - portainer (https)
9444  - blackroadinc.us
```

Next available: 3044+

---

## Deployment Automation Script

Save as `~/deploy-to-pi.sh`:

```bash
#!/usr/bin/env bash
# deploy-to-pi.sh - Deploy any project to the Pi
# Usage: ./deploy-to-pi.sh <project-name> <port> <domain>

set -e

PROJECT=$1
PORT=$2
DOMAIN=$3

if [ -z "$PROJECT" ] || [ -z "$PORT" ] || [ -z "$DOMAIN" ]; then
    echo "Usage: ./deploy-to-pi.sh <project-name> <port> <domain>"
    echo "Example: ./deploy-to-pi.sh lucidia-metaverse 3040 lucidia.earth"
    exit 1
fi

echo "🚀 Deploying $PROJECT to $DOMAIN on port $PORT..."

# Build
echo "📦 Building..."
npm run build

# Package
echo "📦 Packaging..."
tar czf /tmp/$PROJECT.tar.gz dist/

# Upload
echo "📤 Uploading to Pi..."
scp /tmp/$PROJECT.tar.gz pi@192.168.4.64:/tmp/

# Deploy
echo "🐳 Deploying container..."
ssh pi@192.168.4.64 << ENDSSH
cd /tmp
tar xzf $PROJECT.tar.gz
docker stop $PROJECT 2>/dev/null || true
docker rm $PROJECT 2>/dev/null || true
docker run -d \
  --name $PROJECT \
  --restart unless-stopped \
  -p $PORT:80 \
  -v /tmp/dist:/usr/share/nginx/html:ro \
  nginx:alpine
echo "✅ Container running on port $PORT"
ENDSSH

echo ""
echo "✅ DEPLOYED!"
echo "   Container: $PROJECT"
echo "   Port: $PORT"
echo "   URL: https://$DOMAIN"
echo ""
echo "Next steps:"
echo "  1. Add domain to BlackRoad OS config"
echo "  2. Add DNS record in Cloudflare"

rm /tmp/$PROJECT.tar.gz
```

Usage:
```bash
chmod +x ~/deploy-to-pi.sh
~/deploy-to-pi.sh lucidia-metaverse 3040 lucidia.earth
```

---

## Monitoring

### Check Pi status
```bash
ssh pi@192.168.4.64 "
  echo 'System:'
  uptime
  echo ''
  echo 'Containers:'
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
  echo ''
  echo 'BlackRoad OS status:'
  docker logs blackroad os --tail 5
"
```

### Check tunnel status
```bash
ssh pi@192.168.4.64 "ps aux | grep cloudflared"
```

### Check site is live
```bash
curl -s https://lucidia.earth | grep -o '<title>.*</title>'
```

---

## Backups

All container volumes are stored in `/var/lib/docker/volumes/` on the Pi.

To backup a site:
```bash
ssh pi@192.168.4.64
docker commit lucidia-earth lucidia-earth:backup-$(date +%Y%m%d)
docker save lucidia-earth:backup-$(date +%Y%m%d) | gzip > ~/backups/lucidia-earth-$(date +%Y%m%d).tar.gz
```

---

## The Truth

This is how we **actually** deploy everything. Not GitHub Actions. Not Cloudflare Pages. Just:

1. Build locally
2. SCP to Pi
3. Docker run
4. Done

**30 seconds. Every time. No exceptions.**

---

**"The simplest system that works." 🛣️**
