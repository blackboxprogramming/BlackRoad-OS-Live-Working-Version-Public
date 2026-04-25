# BlackRoad OS Production Secrets Registry

> **Single source of truth** for all production keys, tokens, and secrets.
> Last updated: 2026-02-28
> Account: `acct_1S70Zn3e5FMFdlFw` (BlackRoad)

---

## CRITICAL: Never commit actual secret values to git

All secrets must be stored in:
1. **GitHub Actions Secrets** (for CI/CD)
2. **Railway Environment Variables** (for backend services)
3. **Cloudflare Worker Secrets** (for edge services)
4. **Vercel Environment Variables** (for frontend deploys)
5. **`~/.blackroad/`** (for local CLI tools, chmod 600)

---

## 1. Stripe (Payment Processing)

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Payment Gateway, CLI, Webhooks | Railway, Wrangler, `~/.blackroad/stripe.conf` | **REQUIRED** |
| `STRIPE_PUBLISHABLE_KEY` | Frontend checkout pages | Vercel (NEXT_PUBLIC), Cloudflare Pages | **REQUIRED** |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | Railway, Wrangler | **REQUIRED** |
| `STRIPE_PRICE_PRO_MONTHLY` | Checkout session creation | Railway, Wrangler | **PROVISION** |
| `STRIPE_PRICE_PRO_YEARLY` | Checkout session creation | Railway, Wrangler | **PROVISION** |
| `STRIPE_PRICE_ENT_MONTHLY` | Checkout session creation | Railway, Wrangler | **PROVISION** |
| `STRIPE_PRICE_ENT_YEARLY` | Checkout session creation | Railway, Wrangler | **PROVISION** |

### Stripe Products to Provision

**Account Status: `acct_1S70Zn3e5FMFdlFw` — 0 products, 0 prices (EMPTY)**

Run `br stripe products create` or use `production/provision-stripe.sh` to create:

| Product | Tier | Monthly | Yearly | Agents | Tasks |
|---|---|---|---|---|---|
| BlackRoad OS Free | `free` | $0 | $0 | 3 | 100/mo |
| BlackRoad OS Pro | `pro` | $29 | $290 | 100 | 10K/mo |
| BlackRoad OS Enterprise | `enterprise` | $199 | $1,990 | Unlimited | Unlimited |
| BlackRoad OS Custom | `custom` | Contact Sales | Contact Sales | Custom | Custom |

**Additional Products (Sponsorship/Licensing):**

| Product | Type | Price |
|---|---|---|
| Open Source Support - Friend | Recurring | $5/mo |
| Open Source Support - Supporter | Recurring | $25/mo |
| Open Source Support - Sponsor | Recurring | $100/mo |
| Open Source Support - Coffee | One-time | $10 |
| Open Source Support - Backer | One-time | $50 |
| Open Source Support - Champion | One-time | $500 |
| Commercial License - Startup | Yearly | $499/yr |
| Commercial License - Business | Yearly | $999/yr |
| Commercial License - Enterprise | Yearly | $2,499/yr |
| Consulting - Hourly | One-time | $250 |
| Consulting - Daily | One-time | $1,500 |
| Consulting - Project | One-time | $5,000 |
| Priority Support | Recurring | $499/mo |

---

## 2. Google Drive (File Storage & Content)

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Drive API, file sync, photo backgrounds | Railway, `~/.blackroad/google-sa.json` | **REQUIRED** |
| `GOOGLE_DRIVE_FOLDER_ID` | Root shared folder for assets | Railway, Vercel | **REQUIRED** |
| `GOOGLE_CLIENT_ID` | OAuth2 for user-facing Drive access | Vercel (NEXT_PUBLIC) | **OPTIONAL** |
| `GOOGLE_CLIENT_SECRET` | OAuth2 token exchange | Railway | **OPTIONAL** |

### Google Drive Integration Points

| Integration | Method | Purpose |
|---|---|---|
| n8n Workflows | OAuth2 + Service Account | File automation, backup |
| Airbyte Connector | Service Account | Data sync from Drive |
| Activepieces | OAuth2 | Workflow automation |
| Photo Backgrounds | Service Account | Asset serving for templates |
| Content Pipeline | Service Account | Docs/Sheets data extraction |

---

## 3. Database (PostgreSQL on Cecilia)

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `PG_HOST` | All backend services | Railway, `.env` | `10.10.0.2` |
| `PG_PORT` | All backend services | Railway, `.env` | `5432` |
| `PG_USER` | All backend services | Railway, `.env` | `blackroad` |
| `PG_PASSWORD` | All backend services | Railway, `.env` | **REQUIRED** |
| `DATABASE_URL` | ORM connections | Railway | **REQUIRED** |

---

## 4. Redis (Cecilia)

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `REDIS_HOST` | Session cache, job queues | Railway, `.env` | `10.10.0.2` |
| `REDIS_PORT` | Session cache, job queues | Railway, `.env` | `6379` |
| `REDIS_PASSWORD` | Session cache, job queues | Railway, `.env` | **REQUIRED** |

---

## 5. MinIO (Lucidia - Object Storage)

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `MINIO_ENDPOINT` | File storage, model weights | Railway, `.env` | `10.10.0.3` |
| `MINIO_PORT` | File storage | Railway, `.env` | `9000` |
| `MINIO_ACCESS_KEY` | File storage | Railway, `.env` | **REQUIRED** |
| `MINIO_SECRET_KEY` | File storage | Railway, `.env` | **REQUIRED** |

---

## 6. AI Services

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Claude routing, agent orchestration | Railway, Wrangler | **REQUIRED** |
| `OPENAI_API_KEY` | GPT routing, fallback | Railway, Wrangler | **OPTIONAL** |

---

## 7. Cloudflare

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Worker deployments, DNS, Pages | GitHub Actions | **REQUIRED** |
| `CLOUDFLARE_ACCOUNT_ID` | Worker deployments, Pages | GitHub Actions | **REQUIRED** |

---

## 8. Authentication

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `JWT_SECRET` | API token signing | Railway | **REQUIRED** |
| `NEXTAUTH_SECRET` | Next.js auth sessions | Vercel | **REQUIRED** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend auth | Vercel, Cloudflare Pages | **REQUIRED** |
| `CLERK_SECRET_KEY` | Clerk backend auth | Railway | **REQUIRED** |

---

## 9. Deployment Platforms

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `RAILWAY_TOKEN` | Railway deployments | GitHub Actions | **REQUIRED** |
| `DEPLOY_URL` | Health checks, self-healing | GitHub Actions | **REQUIRED** |

---

## 10. Email & Notifications

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `SENDGRID_API_KEY` | Transactional email | Railway, Wrangler | **OPTIONAL** |

---

## 11. Monitoring

| Secret Name | Where Used | Storage Location | Status |
|---|---|---|---|
| `SENTRY_DSN` | Error tracking (server) | Railway | **OPTIONAL** |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking (client) | Vercel | **OPTIONAL** |

---

## GitHub Actions Secrets Checklist

These secrets must be set in **every** repository or at the **organization level**:

```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_ENT_MONTHLY
STRIPE_PRICE_ENT_YEARLY
GOOGLE_SERVICE_ACCOUNT_KEY
GOOGLE_DRIVE_FOLDER_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
RAILWAY_TOKEN
DEPLOY_URL
ANTHROPIC_API_KEY
JWT_SECRET
NEXTAUTH_SECRET
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
PG_PASSWORD
REDIS_PASSWORD
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
SENTRY_DSN
SENDGRID_API_KEY
```

---

## Quick Setup Commands

```bash
# 1. Configure Stripe CLI
br stripe auth sk_live_YOUR_KEY

# 2. Provision all Stripe products
./production/provision-stripe.sh

# 3. Set Cloudflare Worker secrets
cd workers/payment-gateway
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PRICE_PRO_MONTHLY
wrangler secret put STRIPE_PRICE_PRO_YEARLY
wrangler secret put STRIPE_PRICE_ENT_MONTHLY
wrangler secret put STRIPE_PRICE_ENT_YEARLY

# 4. Set Railway secrets
railway variables set STRIPE_SECRET_KEY=sk_live_xxx
railway variables set PG_PASSWORD=xxx
railway variables set REDIS_PASSWORD=xxx

# 5. Set GitHub org-level secrets
gh secret set STRIPE_SECRET_KEY --org BlackRoad-OS-Inc
gh secret set CLOUDFLARE_API_TOKEN --org BlackRoad-OS-Inc
gh secret set RAILWAY_TOKEN --org BlackRoad-OS-Inc
```
