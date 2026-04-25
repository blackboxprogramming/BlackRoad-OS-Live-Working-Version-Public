# BlackRoad OS - DNS Infrastructure Map

**Version:** 2.0
**Last Updated:** 2025-11-20
**Owner:** Alexa Louise (Cadillac)
**Status:** Production Active

---

## Overview

This document provides the **complete, production-accurate** DNS and Railway service mapping for BlackRoad Operating System. BlackRoad OS is a **distributed operating system** where each Railway service acts as a system process, each domain as a mount point, and all services communicate via a unified kernel/syscall layer.

**Key Principle**: BlackRoad OS is **NOT** deployed as a monorepo. The monorepo (`BlackRoad-Operating-System`) serves as the **source of truth** that syncs to **satellite repositories**, which are then individually deployed to Railway.

---

## Production DNS Mapping (Cloudflare)

All domains are configured in Cloudflare with CNAME records pointing to Railway production endpoints.

### Primary Domain: blackroad.io (Consumer-Facing)

The primary public-facing domain for BlackRoad OS.

| Subdomain | CNAME Target | Service | Purpose |
|-----------|--------------|---------|---------|
| **@ (root)** | blackroad-operating-system-production.up.railway.app | OS Shell | Main BlackRoad OS interface |
| **www** | blackroad.io | WWW Redirect | Standard www redirect to root |
| **app** | blackroad-operating-system-production.up.railway.app | OS Shell | Alias for main OS |
| **api** | ac7bx15h.up.railway.app | Public API | Public-facing API gateway |
| **docs** | 2izt9kog.up.railway.app | Documentation | API docs, guides, references |

### Secondary Domain: blackroad.systems (Infrastructure)

| Subdomain | CNAME Target | Service | Purpose |
|-----------|--------------|---------|---------|
| **operator** | blackroad-os-operator-production-3983.up.railway.app | Operator Engine | GitHub automation, PR orchestration, job scheduling |
| **core** | 9gw4d0h2.up.railway.app | Core API | Core backend services, auth, blockchain |
| **api** | ac7bx15h.up.railway.app | Public API | Public-facing API gateway |
| **app** | blackroad-operating-system-production.up.railway.app | OS Shell | Main operating system interface |
| **@ (root)** | blackroad-operating-system-production.up.railway.app | Root Service | Domain root - points to main OS interface |
| **console** | qqr1r4hd.up.railway.app | Prism Console | AI orchestration console |
| **docs** | 2izt9kog.up.railway.app | Documentation | API docs, guides, references |
| **os** | vtrb1hrx.up.railway.app | OS Interface | Operating system UI |
| **web** | blackroad-os-web-production-3bbb.up.railway.app | Web Client | Web application frontend |
| **www** | blackroad.systems | WWW Redirect | Standard www redirect to root |

### Email Configuration (Cloudflare Email Routing)

| Record Type | Name | Value | Priority | Purpose |
|-------------|------|-------|----------|---------|
| MX | blackroad.systems | route1.mx.cloudflare.net | 75 | Primary mail |
| MX | blackroad.systems | route2.mx.cloudflare.net | 12 | Secondary mail |
| MX | blackroad.systems | route3.mx.cloudflare.net | 49 | Tertiary mail |
| TXT | blackroad.systems | "v=spf1 include:_spf.mx.cloudflare.net ~all" | - | SPF record |
| TXT | _dmarc | "v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;" | - | DMARC policy |
| TXT | cf2024-1._domainkey | (DKIM key) | - | DKIM signature |

---

## Railway Service Registry (Production)

### Service: blackroad-os-operator-production
- **Railway URL**: blackroad-os-operator-production-3983.up.railway.app
- **Cloudflare DNS**: operator.blackroad.systems
- **Internal URL**: blackroad-os-operator.railway.internal
- **Proxy Port**: caboose.proxy.rlwy.net:45194
- **Purpose**: GitHub webhook handler, PR orchestration, job scheduler
- **Satellite Repo**: BlackRoad-OS/blackroad-os-operator

### Service: blackroad-os-core-production
- **Railway URL**: 9gw4d0h2.up.railway.app
- **Cloudflare DNS**: core.blackroad.systems
- **Internal URL**: blackroad-os-core.railway.internal
- **Proxy Port**: hopper.proxy.rlwy.net:10593
- **Purpose**: Core backend API, authentication, blockchain
- **Satellite Repo**: BlackRoad-OS/blackroad-os-core

### Service: blackroad-os-api-production
- **Railway URL**: ac7bx15h.up.railway.app
- **Cloudflare DNS**: api.blackroad.systems
- **Internal URL**: blackroad-os-api.railway.internal
- **Proxy Port**: (see internal registry)
- **Purpose**: Public API gateway
- **Satellite Repo**: BlackRoad-OS/blackroad-os-api

### Service: blackroad-operating-system-production
- **Railway URL**: blackroad-operating-system-production.up.railway.app
- **Cloudflare DNS**: app.blackroad.systems
- **Internal URL**: blackroad-operating-system.railway.internal
- **Proxy Port**: metro.proxy.rlwy.net:32948
- **Purpose**: Main OS interface (frontend shell)
- **Satellite Repo**: BlackRoad-OS/blackroad-operating-system

### Service: blackroad-os-prism-console-production
- **Railway URL**: qqr1r4hd.up.railway.app
- **Cloudflare DNS**: console.blackroad.systems
- **Internal URL**: blackroad-os-prism-console.railway.internal
- **Proxy Port**: hopper.proxy.rlwy.net:38896
- **Purpose**: Prism AI orchestration console
- **Satellite Repo**: BlackRoad-OS/blackroad-os-prism-console

### Service: blackroad-os-docs-production
- **Railway URL**: 2izt9kog.up.railway.app
- **Cloudflare DNS**: docs.blackroad.systems
- **Internal URL**: blackroad-os-docs.railway.internal
- **Proxy Port**: (see internal registry)
- **Purpose**: Documentation site
- **Satellite Repo**: BlackRoad-OS/blackroad-os-docs

### Service: blackroad-os-web-production
- **Railway URL**: blackroad-os-web-production-3bbb.up.railway.app
- **Cloudflare DNS**: web.blackroad.systems
- **Internal URL**: blackroad-os-web.railway.internal
- **Proxy Port**: interchange.proxy.rlwy.net:59770
- **Purpose**: Web client/frontend application
- **Satellite Repo**: BlackRoad-OS/blackroad-os-web

### Service: blackroad-os-root-production
- **Railway URL**: vtrb1hrx.up.railway.app
- **Cloudflare DNS**: os.blackroad.systems
- **Internal URL**: (root service)
- **Purpose**: OS interface alternative endpoint

### Service: blackroad-os-root-domain
- **Railway URL**: blackroad-operating-system-production.up.railway.app
- **Cloudflare DNS**: blackroad.systems (root)
- **Purpose**: Domain root service - redirects to main OS interface

---

## Development Environment (Railway)

All dev services use the same Railway project but in the **development environment**.

| Service | Dev Railway URL | Internal URL | Proxy |
|---------|----------------|--------------|-------|
| Core API | blackroad-os-core-dev-19b6.up.railway.app | blackroad-os-core.railway.internal | hopper.proxy.rlwy.net:10593 |
| Prism Console | blackroad-os-prism-console-dev.up.railway.app | blackroad-os-prism-console.railway.internal | hopper.proxy.rlwy.net:38896 |
| Docs | blackroad-os-docs-dev.up.railway.app | blackroad-os-docs.railway.internal | (internal) |
| Public API | blackroad-os-api-dev-ddcb.up.railway.app | blackroad-os-api.railway.internal | (internal) |
| Web Client | blackroad-os-web-dev.up.railway.app | blackroad-os-web.railway.internal | interchange.proxy.rlwy.net:59770 |
| OS Shell | blackroad-operating-system-dev.up.railway.app | blackroad-operating-system.railway.internal | metro.proxy.rlwy.net:32948 |
| Operator | blackroad-os-operator-dev.up.railway.app | blackroad-os-operator.railway.internal | caboose.proxy.rlwy.net:45194 |
| Function (Bun) | function-bun-dev-c96f.up.railway.app | - | - |

**Additional Proxies**:
- switchback.proxy.rlwy.net:33936
- shuttle.proxy.rlwy.net:35851

---

## Railway Project Structure

**Project ID**: 57687c3e-5e71-48b6-bc3e-c5b52aebdfc9
**Environment ID (Dev)**: 8bf38bda-7cae-48aa-bef2-8678f158f022

**Project URL**: https://railway.com/project/57687c3e-5e71-48b6-bc3e-c5b52aebdfc9?environmentId=8bf38bda-7cae-48aa-bef2-8678f158f022

### Service Architecture

```
BlackRoad-Operating-System (Monorepo - NOT deployed)
├── Syncs to satellite repos via GitHub Actions
│
├─ BlackRoad-OS/blackroad-os-core → Railway Service (core-production)
├─ BlackRoad-OS/blackroad-os-api → Railway Service (api-production)
├─ BlackRoad-OS/blackroad-os-operator → Railway Service (operator-production)
├─ BlackRoad-OS/blackroad-os-prism-console → Railway Service (console-production)
├─ BlackRoad-OS/blackroad-os-docs → Railway Service (docs-production)
├─ BlackRoad-OS/blackroad-os-web → Railway Service (web-production)
└─ BlackRoad-OS/blackroad-operating-system → Railway Service (os-production)
```

---

## Cloudflare Configuration

### SSL/TLS Settings
- **Mode**: Full (Strict)
- **Always Use HTTPS**: Enabled
- **Automatic HTTPS Rewrites**: Enabled
- **Minimum TLS Version**: 1.2
- **Opportunistic Encryption**: Enabled

### Proxy Status
- **All CNAME records**: Proxied (Orange Cloud) ☁️
- **MX records**: DNS Only (Grey Cloud)
- **TXT records**: DNS Only (Grey Cloud)

### Security Features
- **WAF (Web Application Firewall)**: Enabled
- **DDoS Protection**: Auto-enabled with proxy
- **Rate Limiting**: Configured per service
- **Bot Fight Mode**: Enabled

---

## Service Communication

### Internal Service-to-Service Communication

Services communicate using **Railway internal DNS**:

```typescript
// Example: Operator calling Core API
const coreApiUrl = process.env.CORE_API_INTERNAL_URL || 'http://blackroad-os-core.railway.internal:8000';
const response = await fetch(`${coreApiUrl}/v1/sys/health`);
```

### External Client Communication

External clients use **Cloudflare DNS**:

```bash
# Public API calls
curl https://api.blackroad.systems/v1/health

# Operator health check
curl https://operator.blackroad.systems/health

# OS interface
open https://os.blackroad.systems
```

---

## Health Check Endpoints

All services MUST implement these standard syscall endpoints:

| Endpoint | Method | Purpose | Expected Response |
|----------|--------|---------|-------------------|
| `/health` | GET | Basic health check | `{"status": "healthy"}` |
| `/version` | GET | Version info | `{"version": "1.0.0", "service": "name"}` |
| `/v1/sys/identity` | GET | Service identity | Full identity object |
| `/v1/sys/health` | GET | Detailed health | Extended health metrics |
| `/v1/sys/config` | GET | Config info | Service configuration |

### Monitoring

**Cloudflare Health Checks**:
- Interval: 60 seconds
- Timeout: 5 seconds
- Retries: 2
- Expected: 200 OK

**Railway Health Checks**:
- Path: `/health`
- Interval: 30 seconds
- Timeout: 10 seconds

---

## Environment Variables

### Required for All Services

```bash
# Service Identity
SERVICE_NAME=blackroad-os-{service}
SERVICE_ROLE=core|api|operator|web|console|docs
ENVIRONMENT=production|development

# Railway
RAILWAY_STATIC_URL=<auto-provided>
RAILWAY_ENVIRONMENT=production|development

# Cloudflare
CLOUDFLARE_DOMAIN=blackroad.systems
CLOUDFLARE_PROXIED=true

# Inter-Service Communication
OPERATOR_URL=https://operator.blackroad.systems
CORE_API_URL=https://core.blackroad.systems
PUBLIC_API_URL=https://api.blackroad.systems
CONSOLE_URL=https://console.blackroad.systems
DOCS_URL=https://docs.blackroad.systems
WEB_URL=https://web.blackroad.systems
OS_URL=https://os.blackroad.systems

# Internal URLs (Railway)
OPERATOR_INTERNAL_URL=http://blackroad-os-operator.railway.internal:8001
CORE_API_INTERNAL_URL=http://blackroad-os-core.railway.internal:8000
PUBLIC_API_INTERNAL_URL=http://blackroad-os-api.railway.internal:8000
```

---

## Deployment Flow

### Production Deployment (Automatic)

1. **Developer commits to monorepo** (`BlackRoad-Operating-System/main`)
2. **GitHub Action syncs to satellite** (e.g., `BlackRoad-OS/blackroad-os-core`)
3. **Satellite repo triggers Railway deploy**
4. **Railway builds Docker image**
5. **Railway runs migrations** (if applicable)
6. **Railway deploys to production**
7. **Health check validates** deployment
8. **Cloudflare routes traffic** to new deployment

### Manual Deployment (Railway CLI)

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Link to project
railway link 57687c3e-5e71-48b6-bc3e-c5b52aebdfc9

# Deploy specific service
railway up --service blackroad-os-core-production

# Check status
railway status

# View logs
railway logs --service blackroad-os-core-production
```

---

## Troubleshooting

### DNS Issues

**Problem**: Domain not resolving
```bash
# Check DNS propagation
dig operator.blackroad.systems
nslookup operator.blackroad.systems

# Check Cloudflare DNS
curl -H "Accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=operator.blackroad.systems&type=CNAME"
```

**Problem**: Wrong IP/CNAME returned
- Verify Cloudflare DNS settings
- Check proxy status (should be orange cloud)
- Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)

### Railway Issues

**Problem**: Service not responding
```bash
# Check Railway service status
railway status --service blackroad-os-core-production

# View recent logs
railway logs --service blackroad-os-core-production

# Check health endpoint directly
curl https://9gw4d0h2.up.railway.app/health
```

**Problem**: 502 Bad Gateway
- Service crashed or not running
- Check Railway logs for errors
- Verify health check endpoint exists
- Redeploy service

### Cloudflare Issues

**Problem**: 521 Error (Web server down)
- Railway service is down
- Check Railway service status
- Verify Railway URL is correct in CNAME

**Problem**: 525 Error (SSL handshake failed)
- SSL/TLS mode mismatch
- Set Cloudflare to "Full (Strict)"
- Verify Railway has valid SSL cert

**Problem**: CORS errors
- Check `ALLOWED_ORIGINS` in service env vars
- Ensure Cloudflare domains are included
- Verify preflight requests are handled

---

## Security Considerations

### API Keys & Secrets

**NEVER expose in DNS or public configs**:
- Database credentials
- JWT secrets
- API keys
- Webhook secrets

**Store in Railway environment variables**:
- Use Railway's built-in secrets management
- Rotate secrets regularly
- Use different secrets per environment

### Rate Limiting

Configure Cloudflare rate limiting:
- API endpoints: 100 req/min per IP
- Auth endpoints: 10 req/min per IP
- Public pages: 500 req/min per IP

### DDoS Protection

Cloudflare provides automatic DDoS protection when proxied (orange cloud):
- Layer 3/4 protection
- Layer 7 (application) protection
- Automatic mitigation

---

## Monitoring & Observability

### Metrics to Track

**Per Service**:
- Request rate (requests/second)
- Error rate (%)
- Latency (p50, p95, p99)
- CPU usage (%)
- Memory usage (MB)
- Disk usage (GB)

**Global**:
- Total requests across all services
- Inter-service call graph
- Error budget consumption
- SLA compliance

### Alerting

**Critical Alerts** (PagerDuty/Slack):
- Service down (health check fails)
- Error rate > 5%
- Latency p99 > 2s
- Memory usage > 90%

**Warning Alerts** (Email):
- Error rate > 1%
- Latency p95 > 1s
- CPU usage > 80%

---

## Service Discovery

### Kernel Service Registry

All services MUST register themselves in the kernel service registry. See `INFRASTRUCTURE.md` for the complete registry implementation.

**Example registration**:
```typescript
{
  "operator": {
    "production": "https://operator.blackroad.systems",
    "internal": "http://blackroad-os-operator.railway.internal:8001",
    "railway": "blackroad-os-operator-production-3983.up.railway.app"
  },
  "core": {
    "production": "https://core.blackroad.systems",
    "internal": "http://blackroad-os-core.railway.internal:8000",
    "railway": "9gw4d0h2.up.railway.app"
  }
}
```

---

## Next Steps

- [ ] Implement kernel `serviceRegistry.ts` in all satellite repos
- [ ] Add DNS validation tests
- [ ] Create automated DNS sync checker
- [ ] Set up Cloudflare Analytics integration
- [ ] Configure custom Cloudflare WAF rules
- [ ] Implement service mesh for internal communication
- [ ] Add distributed tracing (Jaeger/OpenTelemetry)
- [ ] Create DNS failover strategy

---

## References

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Railway Dashboard**: https://railway.app/project/57687c3e-5e71-48b6-bc3e-c5b52aebdfc9
- **Monorepo**: https://github.com/blackboxprogramming/BlackRoad-Operating-System
- **Satellite Org**: https://github.com/BlackRoad-OS

---

**Document Version**: 2.0
**Last Updated**: 2025-11-20
**Owner**: Alexa Louise (Cadillac)
**Status**: ✅ Production Active
