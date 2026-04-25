# Cloudflare DNS Blueprint
## Complete DNS Configuration for BlackRoad Universe

**Version:** 1.0
**Date:** 2025-11-18
**Purpose:** Canonical DNS configuration for all BlackRoad domains via Cloudflare

---

## Overview

This document provides the complete DNS setup for migrating all BlackRoad domains from GoDaddy DNS to Cloudflare DNS.

**Why Cloudflare?**
- Free tier includes: DNS, SSL, CDN, DDoS protection, Web Analytics
- Global anycast network (faster DNS resolution)
- CNAME flattening (allows root domain CNAMEs to Railway)
- Better security (WAF, rate limiting available)
- Future-ready for Workers, Zero Trust, edge functions

---

## Migration Process

### Step 1: Add Domain to Cloudflare

For each domain:

1. **Log in to Cloudflare dashboard**
2. Click **"Add a site"**
3. Enter domain (e.g., `blackroad.systems`)
4. Select **Free plan**
5. Cloudflare auto-scans existing DNS records from GoDaddy
6. Review scanned records, make adjustments (see configurations below)
7. Cloudflare provides 2 nameservers (e.g., `aaaa.ns.cloudflare.com`, `bbbb.ns.cloudflare.com`)

### Step 2: Update Nameservers at GoDaddy

For each domain:

1. **Log in to GoDaddy**
2. Go to **My Domains** → select domain → **Manage DNS**
3. Scroll to **Nameservers** section
4. Click **Change** → Select **Custom**
5. Enter Cloudflare nameservers (from Step 1)
6. Click **Save**
7. **Wait 5-60 minutes** for DNS propagation

### Step 3: Verify & Configure SSL

1. Return to Cloudflare dashboard
2. Wait for status to change from "Pending" to **"Active"**
3. Go to **SSL/TLS** → Set encryption mode to **"Full (strict)"**
4. Go to **SSL/TLS** → **Edge Certificates** → Enable **"Always Use HTTPS"**
5. Enable **"Automatic HTTPS Rewrites"**
6. Enable **"HTTP Strict Transport Security (HSTS)"** (optional, but recommended)

### Step 4: Optimize Performance

1. Go to **Speed** → **Optimization**
2. Enable **Auto Minify** (HTML, CSS, JS)
3. Enable **Brotli** compression
4. Enable **Rocket Loader** (optional - test first)
5. Go to **Caching** → Set **Browser Cache TTL** to "Respect Existing Headers"

---

## DNS Records Configuration

### Domain: blackroad.systems

**Purpose**: Flagship corporate site + OS application

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `blackroad-os-production.up.railway.app` | Auto | ✅ Proxied | Root domain → Railway (CNAME flattening) |
| CNAME | www | `blackroad.systems` | Auto | ✅ Proxied | www redirects to apex |
| CNAME | os | `blackroad.systems` | Auto | ✅ Proxied | Alternative OS alias |
| CNAME | api | `blackroad-os-production.up.railway.app` | Auto | ✅ Proxied | Explicit API subdomain |
| CNAME | prism | `blackroad-os-production.up.railway.app` | Auto | ✅ Proxied | Prism Console subdomain |
| CNAME | docs | `blackboxprogramming.github.io` | Auto | ✅ Proxied | GitHub Pages for docs |
| CNAME | cdn | `blackroad.systems` | Auto | ✅ Proxied | CDN alias (for future asset delivery) |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | Auto | - | SPF record (if using Google Workspace) |
| MX | @ | `1 aspmx.l.google.com` | Auto | - | Gmail MX (priority 1) |
| MX | @ | `5 alt1.aspmx.l.google.com` | Auto | - | Gmail MX (priority 5) |
| MX | @ | `5 alt2.aspmx.l.google.com` | Auto | - | Gmail MX (priority 5) |

**Page Rules** (Optional):
- `www.blackroad.systems/*` → Forwarding URL (301) → `https://blackroad.systems/$1`

---

### Domain: blackroad.ai

**Purpose**: Product console, admin interface

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `os.blackroad.systems` | Auto | ✅ Proxied | Alias to main OS |
| CNAME | www | `blackroad.ai` | Auto | ✅ Proxied | www → apex redirect |
| CNAME | console | `os.blackroad.systems` | Auto | ✅ Proxied | Explicit console subdomain |

**Page Rules**:
- `www.blackroad.ai/*` → Forwarding URL (301) → `https://blackroad.ai/$1`

---

### Domain: blackroad.network

**Purpose**: Developer hub, documentation, community

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `blackboxprogramming.github.io` | Auto | ✅ Proxied | GitHub Pages for docs |
| CNAME | www | `blackroad.network` | Auto | ✅ Proxied | www → apex redirect |
| CNAME | api | `blackroad-os-production.up.railway.app` | Auto | ✅ Proxied | API access for developers |
| CNAME | sandbox | `blackroad-os-staging.up.railway.app` | Auto | ✅ Proxied | Staging/sandbox environment |

**CNAME File** (for GitHub Pages):
Create file `CNAME` in your `docs/` or GitHub Pages root:
```
blackroad.network
```

**Page Rules**:
- `www.blackroad.network/*` → Forwarding URL (301) → `https://blackroad.network/$1`

---

### Domain: blackroad.me

**Purpose**: Personal identity portal, Pocket OS

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `os.blackroad.systems` | Auto | ✅ Proxied | Identity portal via main OS |
| CNAME | www | `blackroad.me` | Auto | ✅ Proxied | www → apex redirect |
| CNAME | id | `os.blackroad.systems` | Auto | ✅ Proxied | Explicit identity subdomain |

---

### Domain: lucidia.earth

**Purpose**: Narrative experiences, interactive storytelling (Phase 2)

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `blackboxprogramming.github.io` | Auto | ✅ Proxied | GitHub Pages (Phase 2) |
| CNAME | www | `lucidia.earth` | Auto | ✅ Proxied | www → apex redirect |
| CNAME | studio | `lucidia-studio.vercel.app` | Auto | ✅ Proxied | Lucidia Studio (Phase 3) |

**CNAME File** (for GitHub Pages):
```
lucidia.earth
```

---

### Domain: aliceqi.com

**Purpose**: ALICE QI research showcase (Phase 2)

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `blackboxprogramming.github.io` | Auto | ✅ Proxied | GitHub Pages |
| CNAME | www | `aliceqi.com` | Auto | ✅ Proxied | www → apex redirect |
| CNAME | research | `aliceqi.com` | Auto | ✅ Proxied | Research portal |
| CNAME | docs | `aliceqi.com` | Auto | ✅ Proxied | Technical documentation |

---

### Domain: blackroadqi.com

**Purpose**: Financial/quantitative intelligence product (Phase 2)

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `blackroadqi-app.up.railway.app` | Auto | ✅ Proxied | Dedicated QI app (Phase 2) |
| CNAME | www | `blackroadqi.com` | Auto | ✅ Proxied | www → apex redirect |
| CNAME | api | `blackroadqi-api.up.railway.app` | Auto | ✅ Proxied | QI API endpoint |

---

### Domain: roadwallet.com

**Purpose**: Wallet interface (alias to OS)

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `os.blackroad.systems` | Auto | ✅ Proxied | Alias to main OS wallet |
| CNAME | www | `roadwallet.com` | Auto | ✅ Proxied | www → apex redirect |

---

### Domain: aliceos.io

**Purpose**: Legacy alias (points to main OS)

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `os.blackroad.systems` | Auto | ✅ Proxied | Legacy domain |
| CNAME | www | `aliceos.io` | Auto | ✅ Proxied | www → apex redirect |

---

### Domain: blackroadquantum.com

**Purpose**: Quantum research hub (Phase 2)

| Type | Name | Target | TTL | Proxy | Notes |
|------|------|--------|-----|-------|-------|
| CNAME | @ | `blackboxprogramming.github.io` | Auto | ✅ Proxied | GitHub Pages |
| CNAME | www | `blackroadquantum.com` | Auto | ✅ Proxied | www → apex redirect |
| CNAME | lab | `quantum-lab.up.railway.app` | Auto | ✅ Proxied | Quantum Lab app (Phase 2) |

---

## Advanced Configuration

### SSL/TLS Settings

**For all domains**:

1. **Encryption Mode**: Full (strict)
   - Cloudflare ↔ Railway: encrypted with valid cert

2. **Edge Certificates**:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Certificate Transparency Monitoring
   - ✅ TLS 1.3 (enabled by default)

3. **HSTS** (HTTP Strict Transport Security):
   - ✅ Enable HSTS
   - Max Age: 6 months (15768000 seconds)
   - ✅ Include subdomains
   - ❌ Preload (wait until stable, then enable)

### Caching Rules

**Static Assets** (CSS, JS, images):
```
Cache Level: Standard
Browser Cache TTL: Respect Existing Headers
Edge Cache TTL: 1 month
```

**API Endpoints** (`/api/*`):
```
Cache Level: Bypass
(Don't cache API responses)
```

**Page Rules Example** (`blackroad.systems`):
```
Rule 1: *blackroad.systems/api/*
  - Cache Level: Bypass
  - Disable Apps
  - Disable Performance

Rule 2: *blackroad.systems/*.css
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 day

Rule 3: *blackroad.systems/*.js
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 day

Rule 4: www.blackroad.systems/*
  - Forwarding URL: 301 redirect to https://blackroad.systems/$1
```

### Firewall Rules

**Block known bots** (optional):
```
Field: User Agent
Operator: contains
Value: "BadBot|Scraper|AhrefsBot"
Action: Block
```

**Rate Limiting** (protect API):
```
Field: URI Path
Operator: starts with
Value: /api/
Rate: 100 requests per minute
Action: Challenge (CAPTCHA)
```

### Security Headers

**Via Cloudflare Workers** (optional, advanced):

Create a Worker to add security headers:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)

  // Security headers
  newHeaders.set('X-Frame-Options', 'DENY')
  newHeaders.set('X-Content-Type-Options', 'nosniff')
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

---

## Verification Checklist

After DNS setup for each domain:

- [ ] **DNS Propagation**: Check with `dig <domain>` or https://dnschecker.org
- [ ] **SSL Certificate**: Visit `https://<domain>` - should show valid cert (🔒)
- [ ] **WWW Redirect**: Visit `https://www.<domain>` - should redirect to apex
- [ ] **HTTP → HTTPS**: Visit `http://<domain>` - should redirect to HTTPS
- [ ] **API Endpoint**: Test `curl https://<domain>/health` (if applicable)
- [ ] **Cloudflare Analytics**: Check Cloudflare dashboard → Analytics tab

---

## Implementation Files

This blueprint is now implemented in the following files:

### 1. DNS Records Configuration
**File**: `infra/cloudflare/records.yaml`

This file is the **single source of truth** for all DNS records across all BlackRoad domains. It includes:
- Complete record definitions (type, name, content, TTL, proxy status)
- Domain metadata (zone ID, phase, priority)
- Human-readable comments for each record
- Organized by phase (Phase 1 active domains, Phase 2 future domains)

**Quick reference**: See `records.yaml` for the exact DNS configuration to apply.

### 2. Migration Guide
**File**: `infra/cloudflare/migrate_to_cloudflare.md`

A **step-by-step guide** for migrating DNS from GoDaddy to Cloudflare. Designed for human operators (Alexa) with:
- Detailed instructions with screenshots references
- Mobile-friendly (can be done from iPhone)
- Troubleshooting section
- Verification steps
- Checklist for tracking progress

**Quick reference**: Follow this guide to migrate each domain from GoDaddy DNS to Cloudflare DNS.

### 3. Automation Script
**File**: `infra/cloudflare/cloudflare_dns_sync.py`

An **idempotent Python script** that syncs DNS records from `records.yaml` to Cloudflare via API. Features:
- Reads structured YAML configuration
- Creates, updates, and optionally deletes DNS records
- Dry-run mode for safe testing
- Domain and phase filtering
- Comprehensive logging

**Usage**:
```bash
# Set Cloudflare API token
export CF_API_TOKEN="your-cloudflare-api-token"

# Dry run (safe - shows changes without applying)
python infra/cloudflare/cloudflare_dns_sync.py --dry-run

# Sync specific domain
python infra/cloudflare/cloudflare_dns_sync.py --domain blackroad.systems

# Sync all Phase 1 domains
python infra/cloudflare/cloudflare_dns_sync.py --phase 1

# Apply all changes
python infra/cloudflare/cloudflare_dns_sync.py
```

**Requirements**:
```bash
pip install pyyaml requests
```

## How These Files Connect to Railway + GitHub

### DNS → Railway Flow

1. **Cloudflare DNS** receives user request for `os.blackroad.systems`
2. **CNAME record** (from `records.yaml`) points to `blackroad-os-production.up.railway.app`
3. **Cloudflare CDN** proxies request (SSL, caching, DDoS protection)
4. **Railway** receives request and routes to FastAPI backend
5. **FastAPI** serves Pocket OS frontend from `backend/static/`

### Railway Custom Domains

For each subdomain pointing to Railway, you must also:
1. Add the custom domain in **Railway dashboard**:
   - Service → Settings → Networking → Custom Domains
   - Add domain (e.g., `os.blackroad.systems`)
   - Railway auto-provisions SSL certificate (Let's Encrypt)

2. Wait for Railway to show **green checkmark** (SSL ready)

3. Verify: Visit `https://os.blackroad.systems` - should show valid SSL 🔒

### GitHub Actions Integration

The DNS sync script can be automated via GitHub Actions:

**Workflow file** (create at `.github/workflows/dns-sync.yml`):
```yaml
name: Sync Cloudflare DNS

on:
  push:
    paths:
      - 'infra/cloudflare/records.yaml'
  workflow_dispatch:

jobs:
  sync-dns:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install pyyaml requests

      - name: Sync DNS records
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        run: |
          python infra/cloudflare/cloudflare_dns_sync.py --phase 1
```

**Required GitHub Secrets**:
- `CF_API_TOKEN` - Cloudflare API token with Zone.DNS edit permissions

**How it works**:
1. Push changes to `records.yaml`
2. GitHub Action runs automatically
3. Script syncs DNS records to Cloudflare
4. Changes are live within seconds

---

## Troubleshooting

### DNS Not Resolving

**Problem**: `dig blackroad.systems` returns no results

**Solutions**:
1. Check nameservers are updated at GoDaddy
2. Wait 5-60 minutes for propagation
3. Verify zone is "Active" in Cloudflare dashboard
4. Check DNS records exist in Cloudflare

### SSL Certificate Errors

**Problem**: Browser shows "Not Secure" or certificate error

**Solutions**:
1. Check SSL/TLS mode is "Full (strict)" in Cloudflare
2. Verify Railway app has valid SSL cert
3. Check "Always Use HTTPS" is enabled
4. Wait a few minutes for edge certificate provisioning

### Site Not Loading

**Problem**: Domain resolves but site doesn't load

**Solutions**:
1. Check Railway app is deployed and healthy
2. Verify custom domain is added in Railway dashboard
3. Check Railway logs for errors: `railway logs --service backend`
4. Test Railway URL directly (e.g., `your-app.up.railway.app`)

### Mixed Content Warnings

**Problem**: Page loads but some assets show as insecure

**Solutions**:
1. Enable "Automatic HTTPS Rewrites" in Cloudflare
2. Update hard-coded `http://` URLs to `https://` in code
3. Use protocol-relative URLs: `//example.com/asset.js`

---

## Maintenance

**Monthly**:
- Review Cloudflare analytics
- Check SSL certificate status
- Review firewall logs (if WAF enabled)

**Quarterly**:
- Audit DNS records (remove unused)
- Review page rules and caching
- Update security headers if needed

**Annually**:
- Review Cloudflare plan (consider Pro if traffic grows)
- Audit all domain registrations (renew at GoDaddy)
- Review and update security policies

---

## References

- **Cloudflare Docs**: https://developers.cloudflare.com/dns/
- **Railway Custom Domains**: https://docs.railway.app/deploy/custom-domains
- **DNS Checker**: https://dnschecker.org
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/

---

**This blueprint ensures all BlackRoad domains are properly configured with Cloudflare for optimal performance, security, and reliability.**
