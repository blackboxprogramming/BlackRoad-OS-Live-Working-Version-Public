# 🚀 IMPLEMENTATION PLAN: blackroad.io
## Corporate Marketing Site

**Repo**: `blackboxprogramming/blackroad.io`
**Purpose**: Marketing site for blackroad.systems domain
**Phase**: **Phase 1 (Months 0-3)**

---

## PURPOSE

**blackroad.io** is the **corporate marketing site** hosted at `blackroad.systems`. It serves:
- Homepage (hero, value prop, CTA)
- Product overview
- Solutions (industry-specific)
- Pricing
- Blog/resources
- Contact/demo request

**Role in Architecture**: **Layer 7** (User Experience)

**Domain**: `blackroad.systems` (primary), `www.blackroad.systems`

---

## TECHNOLOGY OPTIONS

**Option A** (Recommended): Astro + Tailwind
- Static site generator (fast, SEO-friendly)
- Markdown for content
- Easy to maintain

**Option B**: Next.js
- More features (SSR, API routes)
- Vercel deployment

**Option C**: Simple HTML/CSS
- Matches OS aesthetic (Win95 theme)
- Zero build process
- Fast deployment

**Recommendation**: **Astro** (modern, fast, SEO-optimized)

---

## SITE STRUCTURE

### Pages (MVP)

1. **Homepage** (`/`)
   - Hero section
   - Capabilities overview
   - Social proof (case studies)
   - CTA (Request Demo)

2. **Architecture** (`/architecture`)
   - 7-layer diagram
   - Technical overview
   - Security & compliance

3. **Solutions** (`/solutions/financial-services`)
   - Industry-specific use cases
   - ROI calculator
   - Customer testimonials

4. **Pricing** (`/pricing`)
   - 3 tiers: Free, Team, Enterprise
   - Feature comparison table
   - FAQ

5. **Contact** (`/contact`)
   - Demo request form
   - Sales contact
   - Support links

### Blog (Phase 2)

- `/blog` - Blog homepage
- `/blog/introducing-blackroad-os` - Launch post
- `/blog/deterministic-ai` - Thought leadership

---

## REPOSITORY STRUCTURE

```
blackroad.io/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── architecture.astro
│   │   ├── solutions/
│   │   │   └── financial-services.astro
│   │   ├── pricing.astro
│   │   └── contact.astro
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── Navbar.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── styles/
│       └── global.css
├── public/
│   ├── images/
│   └── favicon.ico
├── astro.config.mjs
├── package.json
└── README.md
```

---

## REQUIRED WORKFLOWS

### 1. Deploy to Vercel (`.github/workflows/deploy.yml`)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 2. Lighthouse CI (`.github/workflows/lighthouse.yml`)

```yaml
name: Lighthouse
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://blackroad.systems
            https://blackroad.systems/pricing
          uploadArtifacts: true
```

---

## CLOUDFLARE & DOMAINS

**DNS Records** (`blackroad.systems` zone):

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | `cname.vercel-dns.com` | ✅ |
| CNAME | www | `blackroad.systems` | ✅ |

**Vercel Custom Domain Setup**:
1. Add `blackroad.systems` in Vercel project settings
2. Vercel provides CNAME target
3. Add CNAME to Cloudflare
4. Wait for SSL provisioning (~5 min)

---

## CONTENT PLAN

### Homepage Copy

**Hero**:
```
Where AI Meets the Open Road
Build deterministic, auditable AI systems with BlackRoad OS.
The operating system for enterprise AI agents.

[Request Demo] [View Documentation]
```

**Capabilities**:
1. **Deterministic AI** - Repeatable, traceable, verifiable
2. **Agent Orchestration** - 200+ autonomous agents
3. **Audit Trails** - Blockchain-backed provenance
4. **Enterprise Ready** - SOC 2, GDPR, HIPAA

### Pricing Tiers

| Feature | Free | Team ($499/mo) | Enterprise (Custom) |
|---------|------|----------------|---------------------|
| Users | 1 | Up to 10 | Unlimited |
| Agents | 10 | 100 | Unlimited |
| API Calls | 1,000/mo | 100,000/mo | Unlimited |
| Support | Community | Email | Dedicated |
| SLA | - | 99.5% | 99.9% |

---

## PHASE 1 MILESTONES

**Week 1-2**: Repo setup, homepage design
**Week 3-4**: Content writing, page implementation
**Week 5**: Deploy, DNS setup
**Week 6**: Launch, promote on social media

**Success Criteria**:
- ✅ Site live at blackroad.systems
- ✅ 100/100 Lighthouse score
- ✅ 10+ demo requests in first month
- ✅ <2s page load time

---

## MARKETING INTEGRATION

**Analytics**:
- Google Analytics 4
- Mixpanel (product analytics)

**SEO**:
- Sitemap.xml
- Robots.txt
- Meta tags (Open Graph, Twitter Card)

**CRM**:
- HubSpot form integration (contact page)
- Salesforce lead creation

---

**Last Updated**: 2025-11-18
