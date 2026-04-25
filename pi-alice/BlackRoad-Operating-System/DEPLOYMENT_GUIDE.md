# BlackRoad OS - Complete Deployment Guide

> **Last Updated**: 2025-11-29
> **Status**: Ready for deployment
> **Project**: BlackRoad OS (03ce1e43-5086-4255-b2bc-0146c8916f4c)

---

## Quick Start

```bash
# 1. Clone the monorepo
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System

# 2. Link to Railway
railway link -p 03ce1e43-5086-4255-b2bc-0146c8916f4c

# 3. Deploy (when ready)
railway up
```

---

## Part 1: Railway Custom Domains (Configured)

All 17 custom domains have been configured in Railway:

### blackroad.systems (12 subdomains)

| Subdomain | Service | Railway CNAME |
|-----------|---------|---------------|
| api.blackroad.systems | blackroad-os-api-gateway | wghu19q0.up.railway.app |
| core.blackroad.systems | blackroad-os-core | panyy677.up.railway.app |
| infra.blackroad.systems | blackroad-os-infra | xmky2kqn.up.railway.app |
| docs.blackroad.systems | blackroad-os-docs | xz8ar3k7.up.railway.app |
| console.blackroad.systems | blackroad-os-master | alxh5zmf.up.railway.app |
| demo.blackroad.systems | blackroad-os-demo | 828zo5g8.up.railway.app |
| archive.blackroad.systems | blackroad-os-archive | 6339jp4b.up.railway.app |
| research.blackroad.systems | blackroad-os-research | 3rlozcvl.up.railway.app |
| finance.blackroad.systems | blackroad-os-pack-finance | 70iyk36h.up.railway.app |
| legal.blackroad.systems | blackroad-os-pack-legal | 4zx90bq2.up.railway.app |
| lab.blackroad.systems | blackroad-os-pack-research-lab | rf5v4b68.up.railway.app |
| devops.blackroad.systems | blackroad-os-pack-infra-devops | gjsw3tvq.up.railway.app |

### blackroad.io (5 subdomains)

| Subdomain | Service | Railway CNAME |
|-----------|---------|---------------|
| app.blackroad.io | blackroad-os-web | qydv7efz.up.railway.app |
| home.blackroad.io | blackroad-os-home | e5zobwvo.up.railway.app |
| api.blackroad.io | blackroad-os-api | ulwsu2c6.up.railway.app |
| os.blackroad.io | blackroad-os | ay7xf8lw.up.railway.app |
| creator.blackroad.io | blackroad-os-pack-creator-studio | z1imx63q.up.railway.app |

### Already Active (3 domains)

| Domain | Service |
|--------|---------|
| operator.blackroad.systems | blackroad-os-operator |
| beacon.blackroad.systems | blackroad-os-beacon |
| prism.blackroad.systems | blackroad-prism-console |

---

## Part 2: Cloudflare DNS Setup

### Option A: Using Terraform (Recommended)

```bash
cd infra/cloudflare

# Create terraform.tfvars
cat > terraform.tfvars << EOF
cloudflare_api_token     = "your-cloudflare-api-token"
zone_id_blackroad_systems = "your-zone-id-for-blackroad-systems"
zone_id_blackroad_io      = "your-zone-id-for-blackroad-io"
EOF

# Initialize and apply
terraform init
terraform plan
terraform apply
```

### Option B: Manual DNS Configuration

Add these CNAME records in Cloudflare Dashboard:

#### For blackroad.systems zone:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | api | wghu19q0.up.railway.app | Proxied |
| CNAME | core | panyy677.up.railway.app | Proxied |
| CNAME | infra | xmky2kqn.up.railway.app | Proxied |
| CNAME | docs | xz8ar3k7.up.railway.app | Proxied |
| CNAME | console | alxh5zmf.up.railway.app | Proxied |
| CNAME | demo | 828zo5g8.up.railway.app | Proxied |
| CNAME | archive | 6339jp4b.up.railway.app | Proxied |
| CNAME | research | 3rlozcvl.up.railway.app | Proxied |
| CNAME | finance | 70iyk36h.up.railway.app | Proxied |
| CNAME | legal | 4zx90bq2.up.railway.app | Proxied |
| CNAME | lab | rf5v4b68.up.railway.app | Proxied |
| CNAME | devops | gjsw3tvq.up.railway.app | Proxied |

#### For blackroad.io zone:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | app | qydv7efz.up.railway.app | Proxied |
| CNAME | home | e5zobwvo.up.railway.app | Proxied |
| CNAME | api | ulwsu2c6.up.railway.app | Proxied |
| CNAME | os | ay7xf8lw.up.railway.app | Proxied |
| CNAME | creator | z1imx63q.up.railway.app | Proxied |

### Getting Zone IDs

1. Go to Cloudflare Dashboard
2. Select the domain (e.g., blackroad.systems)
3. Zone ID is in the right sidebar under "API"

---

## Part 3: GitHub Secrets Configuration

Add these secrets to the BlackRoad-Operating-System repository:

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token | Railway Dashboard → Account Settings → Tokens |
| `INFRA_DEPLOY_KEY` | SSH key for blackroad-os-infra | Generate with `ssh-keygen` |
| `CORE_DEPLOY_KEY` | SSH key for blackroad-os-core | Generate with `ssh-keygen` |
| `OPERATOR_DEPLOY_KEY` | SSH key for blackroad-os-operator | Generate with `ssh-keygen` |

### Generate Deploy Keys

```bash
# Generate keys for each satellite repo
ssh-keygen -t ed25519 -C "deploy-infra" -f ~/.ssh/blackroad-infra-deploy -N ""
ssh-keygen -t ed25519 -C "deploy-core" -f ~/.ssh/blackroad-core-deploy -N ""
ssh-keygen -t ed25519 -C "deploy-operator" -f ~/.ssh/blackroad-operator-deploy -N ""

# Display public keys (add to repo Settings → Deploy Keys)
cat ~/.ssh/blackroad-infra-deploy.pub
cat ~/.ssh/blackroad-core-deploy.pub
cat ~/.ssh/blackroad-operator-deploy.pub

# Display private keys (add to GitHub Secrets)
cat ~/.ssh/blackroad-infra-deploy
cat ~/.ssh/blackroad-core-deploy
cat ~/.ssh/blackroad-operator-deploy
```

### Adding Deploy Keys to Repos

1. Go to each repo: `github.com/BlackRoad-OS/blackroad-os-{infra,core,operator}`
2. Settings → Deploy Keys → Add deploy key
3. Paste the **public** key
4. Check "Allow write access"

### Adding Secrets to Monorepo

1. Go to `github.com/blackboxprogramming/BlackRoad-Operating-System`
2. Settings → Secrets and variables → Actions
3. Add each **private** key as a secret

---

## Part 4: Service Deployment

### Current Service Status

The Railway services are configured but need application code deployed:

| Service | Status | Next Step |
|---------|--------|-----------|
| blackroad-os-infra | Configured | Deploy AIops service |
| blackroad-os-core | Configured | Deploy Analytics service |
| blackroad-os-operator | Configured | Deploy Codex + webhooks |
| blackroad-os-web | Configured | Deploy web frontend |
| blackroad-os-api | Configured | Deploy API server |
| blackroad-os-docs | Configured | Deploy documentation |

### Deploy Individual Services

```bash
# Deploy to specific service
cd /path/to/satellite-repo
railway link -p 03ce1e43-5086-4255-b2bc-0146c8916f4c
railway up --service blackroad-os-infra
```

### Deploy All Services (from monorepo)

The GitHub Actions workflow will automatically deploy when you push to main:
- Changes in `services/aiops/` → deploys to blackroad-os-infra
- Changes in `services/analytics/` → deploys to blackroad-os-core
- Changes in `services/codex/` → deploys to blackroad-os-operator

---

## Part 5: Verification Checklist

### DNS Verification

```bash
# Check DNS propagation
dig api.blackroad.systems CNAME
dig app.blackroad.io CNAME
```

### Service Health Checks

```bash
# Test health endpoints (after deployment)
curl https://api.blackroad.systems/health
curl https://core.blackroad.systems/health
curl https://infra.blackroad.systems/health
curl https://app.blackroad.io/health
```

### SSL/TLS Verification

All domains should have valid SSL certificates through Cloudflare:

```bash
# Check SSL
curl -vI https://api.blackroad.systems 2>&1 | grep -i "SSL certificate"
```

---

## Part 6: Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLOUDFLARE                                    │
│  ┌─────────────────────────┐    ┌─────────────────────────┐            │
│  │   blackroad.systems     │    │     blackroad.io        │            │
│  │   (Enterprise DNS)      │    │    (Consumer DNS)       │            │
│  └───────────┬─────────────┘    └───────────┬─────────────┘            │
└──────────────┼──────────────────────────────┼──────────────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            RAILWAY                                       │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ api-gateway │  │    core     │  │   infra     │  │    web      │   │
│  │  (AIops)    │  │ (Analytics) │  │  (AIops)    │  │ (Frontend)  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  operator   │  │   beacon    │  │   prism     │  │    docs     │   │
│  │  (Codex)    │  │  (Health)   │  │ (Console)   │  │   (Docs)    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         PACK SERVICES                              │ │
│  │  finance │ legal │ research-lab │ creator-studio │ devops         │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            GITHUB                                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  BlackRoad-Operating-System (Monorepo)                              ││
│  │  ├── services/aiops/     → syncs to → blackroad-os-infra           ││
│  │  ├── services/analytics/ → syncs to → blackroad-os-core            ││
│  │  └── services/codex/     → syncs to → blackroad-os-operator        ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  BlackRoad-OS Organization (Satellite Repos)                        ││
│  │  blackroad-os-infra │ blackroad-os-core │ blackroad-os-operator    ││
│  │  blackroad-os-web │ blackroad-os-api │ blackroad-os-docs │ ...     ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Troubleshooting

### DNS Not Resolving

```bash
# Check if CNAME is set correctly
dig +short api.blackroad.systems CNAME

# Expected output: wghu19q0.up.railway.app.
```

### Railway Service Not Found

```bash
# Check service status
railway status

# View logs
railway logs --service blackroad-os-infra
```

### SSL Certificate Issues

- Ensure Cloudflare SSL mode is "Full (strict)"
- Wait up to 24 hours for certificate provisioning

### GitHub Actions Failing

- Check that all secrets are configured
- Verify deploy keys have write access
- Check workflow logs for specific errors

---

## Quick Reference Commands

```bash
# Railway
railway login                           # Login to Railway
railway link                            # Link to project
railway status                          # Check current project
railway up                              # Deploy
railway logs                            # View logs
railway domain add <domain>             # Add custom domain

# Cloudflare (via Terraform)
cd infra/cloudflare
terraform init
terraform plan
terraform apply

# GitHub
gh secret set RAILWAY_TOKEN             # Set secret
gh workflow run deploy-railway.yml      # Trigger deployment
```

---

## Support

- **Railway Documentation**: https://docs.railway.app
- **Cloudflare Documentation**: https://developers.cloudflare.com
- **BlackRoad OS Issues**: https://github.com/BlackRoad-OS/blackroad-os/issues

---

*This guide is maintained in the BlackRoad-Operating-System repository.*
