# ☁️ CLOUDFLARE DNS BLUEPRINT
## Multi-Domain DNS Configuration & Repo Responsibility Map

**Version**: 1.0
**Date**: 2025-11-18
**Source**: Extracted from MASTER_ORCHESTRATION_PLAN.md + ORG_STRUCTURE.md

---

## EXECUTIVE SUMMARY

This document maps **10+ BlackRoad domains** to:
- Cloudflare DNS records
- Repository ownership
- Deployment targets
- SSL configuration

**DNS Strategy**: Cloudflare nameservers (migrated from GoDaddy) for all domains
**SSL Strategy**: Full (strict) with automatic SSL via Cloudflare + Railway/Vercel

---

## PART 1: DOMAIN INVENTORY

### Primary Domains (Phase 1)

| Domain | Purpose | Owner Repo | Status | Phase |
|--------|---------|------------|--------|-------|
| **blackroad.systems** | Corporate site | blackroad.io | 🎯 Primary | 1 |
| **blackroad.ai** | Alias to OS | BlackRoad-Operating-System | Active | 1 |
| **blackroad.network** | Developer docs | BlackRoad-Operating-System | Planned | 1 |
| **blackroad.me** | Personal identity | BlackRoad-Operating-System | Planned | 1 |

### Secondary Domains (Phase 2)

| Domain | Purpose | Owner Repo | Status | Phase |
|--------|---------|------------|--------|-------|
| **aliceqi.com** | ALICE QI engine | lucidia / quantum-math-lab | Research | 2 |
| **blackroadqi.com** | Financial intelligence | blackroad-api (QI module) | Planned | 2 |
| **lucidia.earth** | Narrative experiences | lucidia | Development | 2 |
| **blackroadquantum.com** | Research hub | quantum-math-lab | Research | 2 |

### Tertiary Domains (Phase 3)

| Domain | Purpose | Owner Repo | Status | Phase |
|--------|---------|------------|--------|-------|
| **roadwallet.com** | Wallet service | BlackRoad-Operating-System | Alias | 3 |
| **aliceos.io** | Legacy alias | BlackRoad-Operating-System | Legacy | 3 |
| **blackroadquantum.net** | Quantum APIs | quantum-math-lab | Planned | 3 |
| **blackroadquantum.info** | Education hub | quantum-math-lab | Planned | 3 |
| **blackroadquantum.store** | Merch/courses | TBD (e-commerce repo) | Planned | 3 |
| **lucidia.studio** | Creative production | lucidia | Planned | 3 |
| **blackroad.store** | Community commerce | TBD (e-commerce repo) | Planned | 3 |

---

## PART 2: DNS RECORDS BY DOMAIN

### blackroad.systems (Primary Corporate Site)

**Zone ID**: `[Get from Cloudflare dashboard]`
**Registrar**: GoDaddy → **Migrate nameservers to Cloudflare**
**Owner Repo**: `blackboxprogramming/blackroad.io`

#### DNS Records

| Type | Name | Target | Proxy | TTL | Purpose | Responsible Repo |
|------|------|--------|-------|-----|---------|------------------|
| CNAME | @ | `cname.vercel-dns.com` | ✅ | Auto | Corporate site | blackroad.io |
| CNAME | www | `blackroad.systems` | ✅ | Auto | www redirect | blackroad.io |
| CNAME | os | `blackroad-os-production.up.railway.app` | ✅ | Auto | OS interface | BlackRoad-Operating-System |
| CNAME | api | `blackroad-api-production.up.railway.app` | ✅ | Auto | API gateway | blackroad-api (Phase 2) |
| CNAME | prism | `blackroad-prism-console.vercel.app` | ✅ | Auto | Prism Console | blackroad-prism-console |
| CNAME | operator | `blackroad-operator.up.railway.app` | ❌ | Auto | Operator (internal) | blackroad-operator |
| CNAME | lucidia | `lucidia-api.up.railway.app` | ✅ | Auto | Lucidia API | lucidia |
| CNAME | docs | `blackboxprogramming.github.io` | ✅ | Auto | Developer docs | BlackRoad-Operating-System |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | - | Auto | Email SPF | - |
| MX | @ | `1 aspmx.l.google.com` | - | Auto | Email MX | - |

**Cloudflare Settings**:
- SSL/TLS: **Full (strict)**
- Always Use HTTPS: **Enabled**
- Auto Minify: JavaScript, CSS, HTML
- Brotli: **Enabled**
- Cache Level: Standard

---

### blackroad.ai (OS Alias)

**Registrar**: GoDaddy
**Owner Repo**: `blackboxprogramming/BlackRoad-Operating-System`

#### DNS Records

| Type | Name | Target | Proxy | Purpose | Responsible Repo |
|------|------|--------|-------|---------|------------------|
| CNAME | @ | `os.blackroad.systems` | ✅ | Alias to OS | BlackRoad-Operating-System |
| CNAME | www | `blackroad.ai` | ✅ | www redirect | BlackRoad-Operating-System |

**Page Rule**:
```
blackroad.ai/*
  → Forwarding URL (301 - Permanent Redirect)
  → https://os.blackroad.systems/$1
```

---

### blackroad.network (Developer Portal)

**Registrar**: GoDaddy
**Owner Repo**: `blackboxprogramming/BlackRoad-Operating-System` (docs/ directory)

#### DNS Records

| Type | Name | Target | Proxy | Purpose | Responsible Repo |
|------|------|--------|-------|---------|------------------|
| CNAME | @ | `blackboxprogramming.github.io` | ✅ | Developer docs | BlackRoad-Operating-System/docs/ |
| CNAME | www | `blackroad.network` | ✅ | www redirect | BlackRoad-Operating-System/docs/ |
| CNAME | api | `blackroad-api-production.up.railway.app` | ✅ | API for developers | blackroad-api |

**GitHub Pages Setup** (in BlackRoad-Operating-System repo):
1. Enable GitHub Pages from `docs/` directory
2. Add custom domain: `blackroad.network`
3. Enforce HTTPS
4. Cloudflare DNS points to GitHub Pages

---

### blackroad.me (Personal Identity)

**Registrar**: GoDaddy
**Owner Repo**: `blackboxprogramming/BlackRoad-Operating-System`

#### DNS Records

| Type | Name | Target | Proxy | Purpose | Responsible Repo |
|------|------|--------|-------|---------|------------------|
| CNAME | @ | `os.blackroad.systems` | ✅ | Identity portal | BlackRoad-Operating-System |
| CNAME | www | `blackroad.me` | ✅ | www redirect | BlackRoad-Operating-System |

**Host-Based Routing** (in BlackRoad-Operating-System):
```python
# backend/app/middleware/domain_routing.py
from fastapi import Request

async def domain_middleware(request: Request, call_next):
    host = request.headers.get("host")

    if host == "blackroad.me":
        # Serve identity portal theme
        request.state.theme = "identity"

    response = await call_next(request)
    return response
```

---

### lucidia.earth (Narrative Site)

**Registrar**: GoDaddy
**Owner Repo**: `blackboxprogramming/lucidia`

#### DNS Records

| Type | Name | Target | Proxy | Purpose | Responsible Repo |
|------|------|--------|-------|---------|------------------|
| CNAME | @ | `lucidia-narrative.vercel.app` | ✅ | Narrative site | lucidia |
| CNAME | www | `lucidia.earth` | ✅ | www redirect | lucidia |
| CNAME | api | `lucidia-api.up.railway.app` | ✅ | Lucidia API | lucidia |

**Phase 2 Launch** (Month 12+)

---

### aliceqi.com (ALICE QI Research)

**Registrar**: GoDaddy
**Owner Repo**: `blackboxprogramming/quantum-math-lab` or `lucidia-lab`

#### DNS Records

| Type | Name | Target | Proxy | Purpose | Responsible Repo |
|------|------|--------|-------|---------|------------------|
| CNAME | @ | `aliceqi-research.vercel.app` | ✅ | Research site | quantum-math-lab |
| CNAME | www | `aliceqi.com` | ✅ | www redirect | quantum-math-lab |

**Phase 2 Launch** (Month 12+)

---

### roadwallet.com (Wallet Alias)

**Registrar**: GoDaddy
**Owner Repo**: `blackboxprogramming/BlackRoad-Operating-System`

#### DNS Records

| Type | Name | Target | Proxy | Purpose | Responsible Repo |
|------|------|--------|-------|---------|------------------|
| CNAME | @ | `os.blackroad.systems` | ✅ | Alias to OS wallet | BlackRoad-Operating-System |
| CNAME | www | `roadwallet.com` | ✅ | www redirect | BlackRoad-Operating-System |

**Page Rule**: Redirect to `os.blackroad.systems#wallet` (deep link to Wallet app)

---

### aliceos.io (Legacy Alias)

**Registrar**: GoDaddy
**Owner Repo**: `blackboxprogramming/BlackRoad-Operating-System`

#### DNS Records

| Type | Name | Target | Proxy | Purpose | Responsible Repo |
|------|------|--------|-------|---------|------------------|
| CNAME | @ | `os.blackroad.systems` | ✅ | Legacy alias | BlackRoad-Operating-System |
| CNAME | www | `aliceos.io` | ✅ | www redirect | BlackRoad-Operating-System |

**Note**: Consider deprecating or redirecting to blackroad.systems in Phase 2

---

## PART 3: REPO RESPONSIBILITY MAP

### Canonical Ownership Table

| Subdomain / Domain | Repo | Service Type | Deployment Target | Phase |
|--------------------|------|--------------|-------------------|-------|
| **blackroad.systems** | blackroad.io | Static site (Astro) | Vercel | 1 |
| **os.blackroad.systems** | BlackRoad-Operating-System | FastAPI + static UI | Railway | 1 |
| **api.blackroad.systems** | blackroad-api | FastAPI API | Railway | 2 |
| **prism.blackroad.systems** | blackroad-prism-console | React SPA | Vercel | 2 |
| **operator.blackroad.systems** | blackroad-operator | Worker service | Railway | 2 |
| **lucidia.blackroad.systems** | lucidia | FastAPI AI service | Railway | 1/2 |
| **docs.blackroad.systems** | BlackRoad-Operating-System | GitHub Pages (docs/) | GitHub Pages | 1 |
| **blackroad.network** | BlackRoad-Operating-System | GitHub Pages (docs/) | GitHub Pages | 1 |
| **blackroad.me** | BlackRoad-Operating-System | Identity portal | Railway | 1 |
| **lucidia.earth** | lucidia | Narrative site | Vercel | 2 |
| **aliceqi.com** | quantum-math-lab | Research site | Vercel | 2 |

---

## PART 4: CLOUDFLARE MIGRATION CHECKLIST

### Per-Domain Migration (Repeat for all domains)

#### Step 1: Add Domain to Cloudflare
- [ ] Log in to Cloudflare dashboard
- [ ] Click "Add a site"
- [ ] Enter domain (e.g., `blackroad.systems`)
- [ ] Choose Free plan
- [ ] Cloudflare scans existing DNS records from GoDaddy
- [ ] Review imported records, add missing ones

#### Step 2: Update Nameservers
- [ ] Cloudflare provides 2 nameservers (e.g., `aaaa.ns.cloudflare.com`, `bbbb.ns.cloudflare.com`)
- [ ] Log in to GoDaddy
- [ ] Go to domain → Manage DNS → Nameservers
- [ ] Switch from GoDaddy to Custom
- [ ] Enter Cloudflare nameservers
- [ ] Save (propagation: 5-60 minutes)

#### Step 3: Verify Active
- [ ] Wait for Cloudflare to detect nameserver change
- [ ] Cloudflare dashboard should say "Active" (not "Pending")
- [ ] Test DNS resolution: `dig blackroad.systems` (should show Cloudflare IPs)

#### Step 4: Configure SSL
- [ ] Cloudflare → SSL/TLS → Set to "Full (strict)"
- [ ] SSL/TLS → Edge Certificates → Enable "Always Use HTTPS"
- [ ] SSL/TLS → Edge Certificates → Enable "Automatic HTTPS Rewrites"

#### Step 5: Configure Performance
- [ ] Speed → Optimization → Enable Auto Minify (JS, CSS, HTML)
- [ ] Speed → Optimization → Enable Brotli
- [ ] Caching → Configuration → Cache Level: Standard

#### Step 6: Test
- [ ] Visit `https://yourdomain.com` → Should load with 🔒
- [ ] Visit `http://yourdomain.com` → Should redirect to HTTPS
- [ ] Test API: `curl https://os.blackroad.systems/health`

### Domains to Migrate (Priority Order)

**Week 1**:
1. [ ] blackroad.systems (corporate site - highest priority)
2. [ ] blackroad.ai (OS alias)
3. [ ] blackroad.me (identity)

**Week 2**:
4. [ ] blackroad.network (developer docs)
5. [ ] roadwallet.com (wallet alias)

**Phase 2** (Month 12+):
6. [ ] lucidia.earth
7. [ ] aliceqi.com
8. [ ] blackroadqi.com
9. [ ] blackroadquantum.com

---

## PART 5: AUTOMATION SCRIPTS

### DNS Sync Script (Planned)

**File**: `scripts/cloudflare/sync_dns.py`

```python
#!/usr/bin/env python3
"""
Sync DNS records from config to Cloudflare
Usage: python scripts/cloudflare/sync_dns.py --domain blackroad.systems
"""

import os
import yaml
import requests
from typing import Dict, List

CF_API_TOKEN = os.getenv("CF_API_TOKEN")
CF_ZONE_ID = os.getenv("CF_ZONE_ID")

def load_config(domain: str) -> Dict:
    """Load DNS config from ops/domains/{domain}.yaml"""
    with open(f"ops/domains/{domain}.yaml") as f:
        return yaml.safe_load(f)

def get_existing_records(zone_id: str) -> List[Dict]:
    """Fetch existing DNS records from Cloudflare"""
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    headers = {"Authorization": f"Bearer {CF_API_TOKEN}"}
    response = requests.get(url, headers=headers)
    return response.json()["result"]

def create_dns_record(zone_id: str, record: Dict):
    """Create DNS record in Cloudflare"""
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=record)
    return response.json()

def update_dns_record(zone_id: str, record_id: str, record: Dict):
    """Update existing DNS record"""
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}"
    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.put(url, headers=headers, json=record)
    return response.json()

def sync_domain(domain: str):
    """Sync DNS records for a domain"""
    print(f"Syncing DNS for {domain}...")

    config = load_config(domain)
    existing = get_existing_records(CF_ZONE_ID)

    for record in config["dns_records"]:
        # Check if record exists
        existing_record = next((r for r in existing if r["name"] == record["name"] and r["type"] == record["type"]), None)

        if existing_record:
            print(f"  Updating {record['type']} {record['name']}")
            update_dns_record(CF_ZONE_ID, existing_record["id"], record)
        else:
            print(f"  Creating {record['type']} {record['name']}")
            create_dns_record(CF_ZONE_ID, record)

    print(f"✅ Sync complete for {domain}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--domain", required=True)
    args = parser.parse_args()

    sync_domain(args.domain)
```

**Config File Example** (`ops/domains/blackroad.systems.yaml`):

```yaml
domain: blackroad.systems
zone_id: your-zone-id

dns_records:
  - type: CNAME
    name: "@"
    content: cname.vercel-dns.com
    proxied: true
    ttl: 1  # Auto

  - type: CNAME
    name: www
    content: blackroad.systems
    proxied: true
    ttl: 1

  - type: CNAME
    name: os
    content: blackroad-os-production.up.railway.app
    proxied: true
    ttl: 1

  # ... more records
```

**Usage**:
```bash
export CF_API_TOKEN="your-token"
export CF_ZONE_ID="your-zone-id"

python scripts/cloudflare/sync_dns.py --domain blackroad.systems
```

---

## PART 6: MONITORING & HEALTH CHECKS

### Domain Health Check Workflow

**File**: `.github/workflows/domain-health.yml`

```yaml
name: Domain Health
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  health:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        domain:
          - https://blackroad.systems
          - https://os.blackroad.systems
          - https://api.blackroad.systems
          - https://prism.blackroad.systems
          - https://blackroad.network
    steps:
      - name: Check ${{ matrix.domain }}
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ matrix.domain }}/health || echo "000")
          if [ "$STATUS" != "200" ]; then
            echo "❌ ${{ matrix.domain }} is down (status: $STATUS)"
            exit 1
          else
            echo "✅ ${{ matrix.domain }} is up"
          fi

      - name: Check SSL
        run: |
          echo | openssl s_client -servername $(echo ${{ matrix.domain }} | sed 's/https:\/\///') -connect $(echo ${{ matrix.domain }} | sed 's/https:\/\///'):443 2>/dev/null | openssl x509 -noout -dates
```

---

## PART 7: COST SUMMARY

### Cloudflare Costs

**Free Tier** (all Phase 1 domains):
- Unlimited DNS queries
- SSL certificates (automatic)
- DDoS protection (unmetered)
- CDN caching (100 GB/month)
- 3 Page Rules per domain

**Pro Tier** ($20/mo per domain, if needed):
- More Page Rules
- Image optimization
- Mobile redirect
- Polish (WebP/AVIF)

**Recommendation**: Stay on Free tier for Phase 1

### GoDaddy Costs

**Domain Registration** (annual):
- .systems: ~$15/year
- .com: ~$12/year
- .ai: ~$90/year (premium TLD)
- .earth: ~$20/year
- .me: ~$20/year
- .io: ~$40/year

**Total Annual**: ~$200-300/year for all domains

**DNS Hosting**: $0 (migrated to Cloudflare)

---

## CONCLUSION

**Current State**: Domains registered with GoDaddy, DNS managed by GoDaddy
**Target State**: Domains registered with GoDaddy, DNS managed by Cloudflare
**Migration Effort**: 1-2 days for Phase 1 domains

**Next Action**: Start with `blackroad.systems` migration (see NEXT_ACTIONS_ALEXA.md, Item #1)

---

**Last Updated**: 2025-11-18
**Next Review**: After Phase 1 DNS migration complete (Week 2)
