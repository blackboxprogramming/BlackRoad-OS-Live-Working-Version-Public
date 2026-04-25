# BlackRoad OS Production Readiness Checklist

> 24 hours. All repos. Production level. MOVE FASTER THINK HARDER ALWAYS BELIEVE.

---

## Phase 1: Stripe Products (30 min)

- [ ] Get Stripe API keys from https://dashboard.stripe.com/acct_1S70Zn3e5FMFdlFw/apikeys
- [ ] Run `br stripe auth sk_live_xxx` to configure CLI
- [ ] Run `./production/provision-stripe.sh` to create ALL products & prices
- [ ] Copy price IDs from output to `.env.production`
- [ ] Create webhook endpoint in Stripe Dashboard:
  - URL: `https://pay.blackroad.io/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
- [ ] Copy webhook secret (`whsec_xxx`) to `.env.production`
- [ ] Verify: `br stripe products list` shows all products

## Phase 2: Google Drive (20 min)

- [ ] Create Google Cloud project: `blackroad-os-production`
- [ ] Enable APIs: Drive, Sheets, Docs
- [ ] Create service account: `blackroad-drive-service`
- [ ] Download JSON key
- [ ] Run `./production/google-drive-setup.sh path/to/key.json`
- [ ] Create Drive folder structure (see setup script output)
- [ ] Share root folder with service account email
- [ ] Set `GOOGLE_DRIVE_FOLDER_ID` in env
- [ ] Set base64 key in Railway + GitHub Actions

## Phase 3: Database & Redis (15 min)

- [ ] Verify PostgreSQL running on Cecilia (10.10.0.2:5432)
- [ ] Create production database: `blackroad_prod`
- [ ] Run schema migrations (payment-gateway tables)
- [ ] Verify Redis running on Cecilia (10.10.0.2:6379)
- [ ] Set strong passwords for both services
- [ ] Test connectivity from deployment targets

## Phase 4: Deploy Payment Gateway (20 min)

- [ ] Set all env vars in Railway for payment-gateway service
- [ ] Deploy: `railway up` from `migration/phase4-services/`
- [ ] Verify health: `curl https://pay.blackroad.io/health`
- [ ] Test checkout flow with Stripe test card
- [ ] Verify webhook delivery in Stripe Dashboard

## Phase 5: Set GitHub Organization Secrets (15 min)

Run these for `BlackRoad-OS-Inc`:

```bash
# Core Stripe
gh secret set STRIPE_SECRET_KEY --org BlackRoad-OS-Inc
gh secret set STRIPE_PUBLISHABLE_KEY --org BlackRoad-OS-Inc
gh secret set STRIPE_WEBHOOK_SECRET --org BlackRoad-OS-Inc

# Stripe Price IDs (from provision-stripe.sh output)
gh secret set STRIPE_PRICE_PRO_MONTHLY --org BlackRoad-OS-Inc
gh secret set STRIPE_PRICE_PRO_YEARLY --org BlackRoad-OS-Inc
gh secret set STRIPE_PRICE_ENT_MONTHLY --org BlackRoad-OS-Inc
gh secret set STRIPE_PRICE_ENT_YEARLY --org BlackRoad-OS-Inc

# Google Drive
gh secret set GOOGLE_SERVICE_ACCOUNT_KEY --org BlackRoad-OS-Inc
gh secret set GOOGLE_DRIVE_FOLDER_ID --org BlackRoad-OS-Inc

# Infrastructure
gh secret set CLOUDFLARE_API_TOKEN --org BlackRoad-OS-Inc
gh secret set CLOUDFLARE_ACCOUNT_ID --org BlackRoad-OS-Inc
gh secret set RAILWAY_TOKEN --org BlackRoad-OS-Inc
gh secret set DEPLOY_URL --org BlackRoad-OS-Inc

# Auth
gh secret set JWT_SECRET --org BlackRoad-OS-Inc
gh secret set NEXTAUTH_SECRET --org BlackRoad-OS-Inc
gh secret set CLERK_SECRET_KEY --org BlackRoad-OS-Inc

# AI
gh secret set ANTHROPIC_API_KEY --org BlackRoad-OS-Inc

# Database
gh secret set PG_PASSWORD --org BlackRoad-OS-Inc
gh secret set REDIS_PASSWORD --org BlackRoad-OS-Inc
gh secret set DATABASE_URL --org BlackRoad-OS-Inc
```

## Phase 6: Deploy Cloudflare Workers (20 min)

```bash
# Payment gateway worker
cd workers/payment-gateway
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PRICE_PRO_MONTHLY
wrangler secret put STRIPE_PRICE_PRO_YEARLY
wrangler secret put STRIPE_PRICE_ENT_MONTHLY
wrangler secret put STRIPE_PRICE_ENT_YEARLY
wrangler deploy

# Email worker
cd ../email
wrangler deploy

# Auth worker
cd ../auth
wrangler deploy
```

## Phase 7: Update Per-Repo Stripe Configs (30 min)

After provisioning, update all `stripe-config.json` files with real price IDs:

- [ ] `orgs/core/blackroad-agent-os/stripe-config.json`
- [ ] `orgs/core/blackroad-agents/stripe-config.json`
- [ ] `orgs/core/blackroad-cli/stripe-config.json`
- [ ] `orgs/core/blackroad-hello/stripe-config.json`
- [ ] `orgs/core/blackroad-os-docs/stripe-config.json`
- [ ] `orgs/core/blackroad-pi-ops/stripe-config.json`
- [ ] `orgs/core/blackroad-tools/stripe-config.json`
- [ ] `orgs/core/containers-template/stripe-config.json`
- [ ] `orgs/core/lucidia-core/stripe-config.json`

## Phase 8: Verify Everything (15 min)

- [ ] `br stripe revenue` - shows dashboard
- [ ] `br stripe products list` - shows all products
- [ ] `curl https://pay.blackroad.io/health` - returns healthy
- [ ] `curl https://api.blackroad.io/health` - returns healthy
- [ ] Test checkout: visit https://pay.blackroad.io, select Pro, complete with test card
- [ ] Verify webhook fires in Stripe Dashboard > Webhooks
- [ ] Verify subscription appears: `br stripe subscriptions list`
- [ ] Check Google Drive folder accessible via service account

---

## Total Estimated Time: ~2.5 hours

## Product Summary (After Provisioning)

| # | Product | Prices | Revenue Potential |
|---|---------|--------|-------------------|
| 1 | BlackRoad OS Pro | $29/mo, $290/yr | Core MRR |
| 2 | BlackRoad OS Enterprise | $199/mo, $1,990/yr | Enterprise MRR |
| 3 | Open Source Support | $5-$500 | Sponsorship |
| 4 | Commercial License | $499-$2,499/yr | Licensing ARR |
| 5 | Consulting | $250-$5,000 | Services |
| 6 | Priority Support | $499/mo | Support MRR |
| 7-11 | Per-Repo Products (5x) | $9-$99/mo each | Module MRR |

**Total Products: 11 | Total Price Points: 35+**
