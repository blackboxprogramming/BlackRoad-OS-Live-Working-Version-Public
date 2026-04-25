# Cloudflare DNS & Tunnel Configuration

## Overview

All BlackRoad domains route through Cloudflare for:
- DNS management
- SSL/TLS termination
- DDoS protection
- Tunnel to Railway services

## Tunnel Configuration

### Tunnel Name: `blackroad-os-tunnel`

| Public Hostname | Service | Path | Headers |
|-----------------|---------|------|---------|
| `blackroad.io` | `http://blackroad-os-web.railway.internal:3000` | `/*` | `X-BR-Context: marketing` |
| `www.blackroad.io` | `http://blackroad-os-web.railway.internal:3000` | `/*` | `X-BR-Context: marketing` |
| `app.blackroad.io` | `http://blackroad-os-web.railway.internal:3000` | `/*` | `X-BR-Context: workspace` |
| `console.blackroad.io` | `http://blackroad-os-web.railway.internal:3000` | `/*` | `X-BR-Context: console` |
| `finance.blackroad.io` | `http://blackroad-os-web.railway.internal:3000` | `/*` | `X-BR-Context: finance` |
| `studio.blackroad.io` | `http://blackroad-os-web.railway.internal:3000` | `/*` | `X-BR-Context: studio` |
| `edu.blackroad.io` | `http://blackroad-os-web.railway.internal:3000` | `/*` | `X-BR-Context: education` |
| `api.blackroad.io` | `http://blackroad-os-api-gateway.railway.internal:8080` | `/*` | - |

## DNS Records

### blackroad.io

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| CNAME | `www` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| CNAME | `app` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| CNAME | `console` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| CNAME | `finance` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| CNAME | `studio` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| CNAME | `edu` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| CNAME | `api` | `tunnel-id.cfargotunnel.com` | ✅ Proxied |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | - |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@blackroad.io` | - |

### Other Domains (Redirect to Primary)

For domains like `blackroad.me`, `blackroad.network`, `blackroad.systems`:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `blackroad.io` | ✅ Proxied |
| CNAME | `www` | `blackroad.io` | ✅ Proxied |

With Page Rule: `*blackroad.me/*` → 301 Redirect to `https://blackroad.io/$2`

### Lucidia Domains

| Domain | Type | Name | Content |
|--------|------|------|---------|
| `lucidia.earth` | CNAME | `@` | `tunnel-id.cfargotunnel.com` |
| `lucidia.studio` | CNAME | `@` | `tunnel-id.cfargotunnel.com` |
| `lucidiaqi.com` | CNAME | `@` | `tunnel-id.cfargotunnel.com` |

## SSL/TLS Settings

- **Mode**: Full (strict)
- **Always Use HTTPS**: ✅ Enabled
- **Automatic HTTPS Rewrites**: ✅ Enabled
- **Minimum TLS Version**: TLS 1.2
- **TLS 1.3**: ✅ Enabled

## Security Settings

- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: ✅ Enabled
- **Hotlink Protection**: ✅ Enabled

## Caching

- **Caching Level**: Standard
- **Browser Cache TTL**: 4 hours
- **Always Online**: ✅ Enabled

## Page Rules

1. **Force HTTPS**
   - URL: `*blackroad.io/*`
   - Setting: Always Use HTTPS

2. **API No Cache**
   - URL: `api.blackroad.io/*`
   - Setting: Cache Level = Bypass

3. **Static Assets Cache**
   - URL: `*blackroad.io/_next/static/*`
   - Setting: Cache Level = Cache Everything, Edge TTL = 1 month

## Setup Commands

```bash
# Install cloudflared
brew install cloudflared

# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create blackroad-os-tunnel

# Configure tunnel (creates config.yml)
cloudflared tunnel route dns blackroad-os-tunnel blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel app.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel console.blackroad.io
cloudflared tunnel route dns blackroad-os-tunnel api.blackroad.io

# Run tunnel (for testing)
cloudflared tunnel run blackroad-os-tunnel

# For production, run as service on Railway or dedicated host
```

## Tunnel Config File

```yaml
# ~/.cloudflared/config.yml
tunnel: blackroad-os-tunnel
credentials-file: /path/to/credentials.json

ingress:
  - hostname: blackroad.io
    service: http://blackroad-os-web.railway.internal:3000
    originRequest:
      httpHostHeader: blackroad.io

  - hostname: app.blackroad.io
    service: http://blackroad-os-web.railway.internal:3000
    originRequest:
      httpHostHeader: app.blackroad.io

  - hostname: api.blackroad.io
    service: http://blackroad-os-api-gateway.railway.internal:8080
    originRequest:
      httpHostHeader: api.blackroad.io

  # Catch-all
  - service: http_status:404
```

---

*Last updated: 2024-11-30*
