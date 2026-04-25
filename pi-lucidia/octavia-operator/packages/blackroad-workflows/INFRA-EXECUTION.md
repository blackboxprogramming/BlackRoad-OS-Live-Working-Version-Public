# BlackRoad OS Infrastructure Execution Plan

> Step-by-step guide to wire up Cloudflare + Railway for the consolidated OS.

## Overview

After consolidation, we need:
1. Railway project with 5 core services
2. Cloudflare Tunnel routing domains to Railway
3. DNS records pointing to the Tunnel

---

## Prerequisites Checklist

- [ ] Railway CLI installed: `npm install -g @railway/cli`
- [ ] Cloudflare CLI installed: `brew install cloudflared`
- [ ] Logged into Railway: `railway login`
- [ ] Logged into Cloudflare: `cloudflared tunnel login`
- [ ] GitHub secrets set for all repos (RAILWAY_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

---

## Phase 1: Railway Project Setup

### Step 1.1: Create the Production Project

```bash
# Login to Railway
railway login

# Create new project
railway init --name blackroad-os-production

# Link to the project
railway link
```

### Step 1.2: Create Services

In the Railway dashboard (https://railway.app/dashboard):

1. Click **"New Service"** → **"GitHub Repo"**
2. Connect each repo:

| Service Name | Repo | Port | Domain |
|--------------|------|------|--------|
| blackroad-os-web | BlackRoad-OS/blackroad-os-web | 3000 | (via Cloudflare) |
| blackroad-os-api-gateway | BlackRoad-OS/blackroad-os-api-gateway | 8080 | api.blackroad.io |
| blackroad-os-core | BlackRoad-OS/blackroad-os-core | 9000 | (internal only) |
| blackroad-os-operator | BlackRoad-OS/blackroad-os-operator | 9001 | (internal only) |
| blackroad-os-mesh | BlackRoad-OS/blackroad-os-mesh | 9002 | (internal only) |

### Step 1.3: Set Environment Variables

For each service, set these variables:

**blackroad-os-web:**
```
NODE_ENV=production
API_URL=http://blackroad-os-api-gateway.railway.internal:8080
NEXT_PUBLIC_API_URL=https://api.blackroad.io
```

**blackroad-os-api-gateway:**
```
NODE_ENV=production
CORE_URL=http://blackroad-os-core.railway.internal:9000
OPERATOR_URL=http://blackroad-os-operator.railway.internal:9001
MESH_URL=http://blackroad-os-mesh.railway.internal:9002
```

**blackroad-os-operator:**
```
NODE_ENV=production
ANTHROPIC_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
CORE_URL=http://blackroad-os-core.railway.internal:9000
```

### Step 1.4: Verify Internal Networking

Railway auto-creates internal URLs like `service-name.railway.internal`. Test with:

```bash
# SSH into a service
railway shell -s blackroad-os-web

# Test internal connectivity
curl http://blackroad-os-api-gateway.railway.internal:8080/health
```

---

## Phase 2: Cloudflare Tunnel Setup

### Step 2.1: Create Tunnel

```bash
# Login (opens browser)
cloudflared tunnel login

# Create the tunnel
cloudflared tunnel create blackroad-os-tunnel

# Note the tunnel ID (looks like: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
```

### Step 2.2: Configure Tunnel Routes

Create config file at `~/.cloudflared/config.yml`:

```yaml
tunnel: blackroad-os-tunnel
credentials-file: /Users/alexa/.cloudflared/<tunnel-id>.json

ingress:
  # Marketing site
  - hostname: blackroad.io
    service: http://localhost:3000
    originRequest:
      httpHostHeader: blackroad.io

  - hostname: www.blackroad.io
    service: http://localhost:3000

  # App endpoints (all go to same web service)
  - hostname: app.blackroad.io
    service: http://localhost:3000

  - hostname: console.blackroad.io
    service: http://localhost:3000

  - hostname: finance.blackroad.io
    service: http://localhost:3000

  - hostname: studio.blackroad.io
    service: http://localhost:3000

  - hostname: edu.blackroad.io
    service: http://localhost:3000

  # API
  - hostname: api.blackroad.io
    service: http://localhost:8080

  # Lucidia domains
  - hostname: lucidia.earth
    service: http://localhost:3000

  - hostname: lucidia.studio
    service: http://localhost:3000

  # Catch-all (404 for unknown)
  - service: http_status:404
```

**Note:** Replace `localhost:3000` with Railway's actual URL once deployed.
For Railway, use the public URL like `https://blackroad-os-web-production.up.railway.app`

### Step 2.3: Route DNS to Tunnel

```bash
# Add DNS routes (creates CNAME records automatically)
cloudflared tunnel route dns blackroad-os-tunnel blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel www.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel app.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel console.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel finance.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel studio.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel edu.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel api.blackroad.io
```

### Step 2.4: Run Tunnel (Testing)

```bash
# Test locally
cloudflared tunnel run blackroad-os-tunnel
```

### Step 2.5: Deploy Tunnel as Service

For production, run the tunnel on Railway or a dedicated host:

**Option A: Run on Railway**
1. Create a new service in Railway
2. Use Docker image: `cloudflare/cloudflared:latest`
3. Set command: `tunnel --config /etc/cloudflared/config.yml run`
4. Mount config as a volume or use environment variables

**Option B: Run on Pi/VPS**
```bash
# Install as system service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## Phase 3: DNS Cleanup in Cloudflare Dashboard

### Step 3.1: Remove Legacy Records

Go to: https://dash.cloudflare.com → blackroad.io → DNS

**Delete these legacy A records** (if they exist):
- Any A records pointing to old DigitalOcean IPs (like 104.x.x.x, 167.x.x.x)
- Any AAAA records you're not using

### Step 3.2: Verify Tunnel CNAME Records

After running `cloudflared tunnel route dns`, you should see:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | www | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | app | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | console | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | finance | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | studio | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | edu | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | api | `<tunnel-id>.cfargotunnel.com` | Proxied |

### Step 3.3: Configure SSL/TLS

In Cloudflare dashboard → SSL/TLS:
- Set mode to **Full (strict)**
- Enable **Always Use HTTPS**
- Enable **Automatic HTTPS Rewrites**

### Step 3.4: Configure Page Rules (Optional)

1. **Force HTTPS everywhere:**
   - URL: `*blackroad.io/*`
   - Setting: Always Use HTTPS

2. **Cache static assets:**
   - URL: `*blackroad.io/_next/static/*`
   - Setting: Cache Level = Cache Everything, Edge Cache TTL = 1 month

---

## Phase 4: Verification Checklist

### Railway Services
- [ ] blackroad-os-web deployed and healthy
- [ ] blackroad-os-api-gateway deployed and healthy
- [ ] blackroad-os-core deployed and healthy (internal)
- [ ] blackroad-os-operator deployed and healthy (internal)
- [ ] blackroad-os-mesh deployed and healthy (internal)
- [ ] Internal service communication working

### Cloudflare Tunnel
- [ ] Tunnel created and running
- [ ] DNS routes configured for all subdomains
- [ ] SSL/TLS set to Full (strict)

### Domain Verification
- [ ] https://blackroad.io loads
- [ ] https://app.blackroad.io loads
- [ ] https://console.blackroad.io loads
- [ ] https://api.blackroad.io/health returns 200
- [ ] https://lucidia.earth loads

---

## Quick Reference Commands

```bash
# Railway
railway login
railway link
railway up
railway logs
railway shell -s <service-name>

# Cloudflare Tunnel
cloudflared tunnel login
cloudflared tunnel create <name>
cloudflared tunnel route dns <tunnel> <hostname>
cloudflared tunnel run <tunnel>
cloudflared tunnel list
cloudflared tunnel info <tunnel>

# Check DNS
dig blackroad.io
dig app.blackroad.io
nslookup api.blackroad.io

# Test endpoints
curl -I https://blackroad.io
curl https://api.blackroad.io/health
```

---

## Troubleshooting

### Tunnel not connecting
```bash
# Check tunnel status
cloudflared tunnel info blackroad-os-tunnel

# Run with debug
cloudflared tunnel --loglevel debug run blackroad-os-tunnel
```

### Railway service not reachable
```bash
# Check service logs
railway logs -s blackroad-os-web

# Check internal networking
railway shell -s blackroad-os-web
curl http://blackroad-os-api-gateway.railway.internal:8080/health
```

### DNS not propagating
- Wait 5-10 minutes for DNS propagation
- Clear local DNS cache: `sudo dscacheutil -flushcache`
- Check with: `dig @1.1.1.1 blackroad.io`

---

*Created: 2024-11-30*
*Last updated: 2024-11-30*
