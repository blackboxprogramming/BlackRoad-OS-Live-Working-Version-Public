# Cloudflare DNS Configuration Plan

**Version:** 1.0
**Last Updated:** 2025-11-19
**Owner:** Alexa Louise (Cadillac)

---

## Overview

This document provides the DNS configuration plan for routing BlackRoad OS services through Cloudflare. All services are deployed to Railway and fronted by Cloudflare for CDN, DDoS protection, and SSL termination.

---

## DNS Records

Configure the following DNS records in the Cloudflare dashboard for `blackroad.systems`:

| Subdomain | Type | Target (Railway URL) | Proxy | SSL/TLS Mode | Purpose |
|-----------|------|----------------------|-------|--------------|---------|
| `@` (root) | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | Main website redirect |
| `www` | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | WWW redirect |
| `api` | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | Public API Gateway |
| `core` | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | Core Backend (alias) |
| `operator` | CNAME | `<operator-railway>.up.railway.app` | ☁️ ON | Full (strict) | Operator Engine |
| `console` | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | Prism Console (served at /prism) |
| `docs` | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | Documentation site |
| `web` | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | Web/Frontend OS UI |
| `os` | CNAME | `<backend-railway>.up.railway.app` | ☁️ ON | Full (strict) | Operating System UI |

---

## Service Mapping

### Backend Service (Railway)

**Railway Service Name:** `blackroad-backend`
**Railway URL:** `<TBD>-production.up.railway.app`
**Internal Port:** 8000

**Serves:**
- `/` → Frontend OS UI (backend/static/index.html)
- `/prism` → Prism Console UI
- `/api/*` → All API endpoints
- `/health` → Health check
- `/version` → Version info
- `/api/health/all` → Comprehensive API health

**Routed via:**
- `api.blackroad.systems`
- `core.blackroad.systems`
- `console.blackroad.systems`
- `docs.blackroad.systems`
- `web.blackroad.systems`
- `os.blackroad.systems`
- `blackroad.systems` (root)
- `www.blackroad.systems`

### Operator Service (Railway)

**Railway Service Name:** `blackroad-operator`
**Railway URL:** `<TBD>-production.up.railway.app`
**Internal Port:** 8001

**Serves:**
- `/health` → Health check
- `/version` → Version info
- `/jobs` → Job list
- `/jobs/{id}` → Job details
- `/scheduler/status` → Scheduler status

**Routed via:**
- `operator.blackroad.systems`

---

## How to Configure

### Step 1: Get Railway URLs

After deploying to Railway, retrieve the production URLs:

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Link project
railway link <project-id>

# Get service URLs
railway status

# Or check Railway dashboard:
# https://railway.app/dashboard
```

You should see URLs like:
- `blackroad-backend-production.up.railway.app`
- `blackroad-operator-production.up.railway.app`

### Step 2: Add DNS Records in Cloudflare

1. **Login to Cloudflare:** https://dash.cloudflare.com
2. **Select domain:** `blackroad.systems`
3. **Go to DNS tab**
4. **Add CNAME records** per table above

**Example:**
```
Type: CNAME
Name: api
Target: blackroad-backend-production.up.railway.app
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### Step 3: Configure SSL/TLS

1. Go to **SSL/TLS** tab in Cloudflare
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### Step 4: Configure Page Rules (Optional)

Add page rules for better routing:

1. **Force HTTPS:**
   - URL: `http://*blackroad.systems/*`
   - Setting: Always Use HTTPS

2. **Cache API responses (optional):**
   - URL: `api.blackroad.systems/api/*`
   - Settings:
     - Cache Level: Standard
     - Edge Cache TTL: 2 hours
     - Browser Cache TTL: 30 minutes

3. **No cache for dynamic endpoints:**
   - URL: `api.blackroad.systems/api/auth/*`
   - Setting: Cache Level: Bypass

### Step 5: Verify Configuration

Test each endpoint:

```bash
# Backend health
curl -i https://api.blackroad.systems/health

# Backend version
curl -i https://api.blackroad.systems/version

# API health summary
curl -i https://api.blackroad.systems/api/health/summary

# Operator health
curl -i https://operator.blackroad.systems/health

# Operator version
curl -i https://operator.blackroad.systems/version

# Frontend
open https://os.blackroad.systems

# Prism Console
open https://console.blackroad.systems/prism
```

---

## Health Check Configuration

Configure Cloudflare Health Checks for uptime monitoring:

### Backend Health Check

- **Name:** BlackRoad Backend
- **URL:** `https://api.blackroad.systems/health`
- **Interval:** 60 seconds
- **Retries:** 2
- **Expected codes:** 200
- **Notification:** Email on failure

### Operator Health Check

- **Name:** BlackRoad Operator
- **URL:** `https://operator.blackroad.systems/health`
- **Interval:** 60 seconds
- **Retries:** 2
- **Expected codes:** 200
- **Notification:** Email on failure

---

## Firewall Rules

Add Cloudflare firewall rules to protect your services:

### 1. Rate Limiting (Recommended)

- **URL:** `api.blackroad.systems/api/*`
- **Rule:** Block if rate > 100 requests/minute from same IP

### 2. Bot Protection

- **URL:** `*blackroad.systems/*`
- **Rule:** Challenge known bots, block malicious bots

### 3. Geo-blocking (Optional)

- **URL:** `*blackroad.systems/*`
- **Rule:** Block countries with high spam rates (if desired)

---

## Troubleshooting

### Issue: DNS not resolving

**Solution:**
1. Check DNS propagation: https://dnschecker.org
2. Wait up to 24 hours for global propagation
3. Flush local DNS: `sudo dscacheutil -flushcache` (macOS)

### Issue: 521 Error (Web server is down)

**Solution:**
1. Check Railway service status
2. Verify health endpoint: `curl <railway-url>/health`
3. Check Railway logs: `railway logs`

### Issue: 525 Error (SSL handshake failed)

**Solution:**
1. Ensure Railway has valid SSL certificate
2. Set Cloudflare SSL/TLS to **Full (strict)**
3. Check Railway environment variables

### Issue: CORS errors

**Solution:**
1. Ensure `ALLOWED_ORIGINS` in backend `.env` includes Cloudflare domains
2. Add `https://api.blackroad.systems` to allowed origins
3. Restart backend service

---

## Environment Variables

Ensure these environment variables are set in Railway for both services:

### Backend Service

```bash
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://blackroad.systems,https://www.blackroad.systems,https://os.blackroad.systems,https://api.blackroad.systems,https://console.blackroad.systems,https://docs.blackroad.systems,https://web.blackroad.systems,https://core.blackroad.systems
DATABASE_URL=<postgres-connection-string>
REDIS_URL=<redis-connection-string>
SECRET_KEY=<your-secret-key>
# ... other secrets
```

### Operator Service

```bash
ENVIRONMENT=production
GITHUB_TOKEN=<github-pat>
GITHUB_WEBHOOK_SECRET=<webhook-secret>
# ... other secrets
```

---

## Monitoring & Alerts

### Cloudflare Analytics

Monitor:
- **Requests:** Total requests, unique visitors
- **Bandwidth:** Data transfer
- **Threats:** Blocked requests
- **Performance:** Cache hit ratio

### Railway Metrics

Monitor:
- **CPU usage:** Should stay < 80%
- **Memory usage:** Should stay < 90%
- **Request latency:** p50, p95, p99
- **Error rate:** Should stay < 1%

### Uptime Monitoring (External)

Use a third-party service for independent monitoring:
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://pingdom.com
- StatusCake: https://www.statuscake.com

---

## Security Best Practices

1. **Enable Cloudflare WAF (Web Application Firewall)**
   - Protects against OWASP Top 10
   - Managed rulesets for common attacks

2. **Use Cloudflare Zero Trust (Optional)**
   - Add authentication layer for admin routes
   - Restrict `/prism` to authorized IPs

3. **Enable DDoS Protection**
   - Already included with Cloudflare proxy
   - Configure rate limiting per endpoint

4. **Regular SSL Certificate Rotation**
   - Railway auto-renews Let's Encrypt certs
   - Cloudflare Universal SSL auto-renews

5. **Audit Logs**
   - Review Cloudflare Security Events weekly
   - Review Railway deployment logs
   - Monitor GitHub webhook events

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy operator to Railway
3. ⏳ Get Railway production URLs
4. ⏳ Configure Cloudflare DNS records
5. ⏳ Set up health checks
6. ⏳ Configure firewall rules
7. ⏳ Enable monitoring & alerts
8. ⏳ Test all endpoints
9. ⏳ Update documentation with actual URLs

---

## Contact

**Owner:** Alexa Louise (Cadillac)
**Repository:** https://github.com/blackboxprogramming/BlackRoad-Operating-System
**Railway Project:** `<TBD>`
**Cloudflare Account:** `<TBD>`

---

**Last Updated:** 2025-11-19
**Document Version:** 1.0
