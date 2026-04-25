# BlackRoad OS Metrics - Complete Deployment Guide

**From Development to Production**

© 2023-2025 BlackRoad OS, Inc. All Rights Reserved.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Deployment](#detailed-deployment)
5. [Configuration](#configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers deploying the complete BlackRoad OS Metrics system, including:

- ✅ **294 KPIs** across 8 categories
- ✅ **Interactive dashboards** (metrics + financial)
- ✅ **Revenue tracking** and projections
- ✅ **Investor pitch deck** (11 slides)
- ✅ **Agent task integration** for automation
- ✅ **Analytics tracking** across all properties
- ✅ **Stripe monetization** infrastructure
- ✅ **Automated updates** via GitHub Actions

---

## Prerequisites

### Required Tools

```bash
# Check installations
git --version          # Git (any recent version)
python3 --version      # Python 3.8+
node --version         # Node.js 16+ (optional, for npm scripts)
gh --version           # GitHub CLI (optional, for automated deployment)
wrangler --version     # Cloudflare Wrangler (for Pages deployment)
```

### Required Accounts

- [x] GitHub account with access to BlackRoad-OS organization
- [ ] Cloudflare account (free tier works)
- [ ] Stripe account (for monetization)
- [ ] Plausible Analytics or Google Analytics (optional)

### Environment Setup

```bash
# Clone the repository
gh repo clone BlackRoad-OS/blackroad-os-metrics
cd blackroad-os-metrics

# Or use standalone version
cd ~/blackroad-os-metrics-standalone
```

---

## Quick Start

### 1. Generate All Data (One Command)

```bash
# Run complete update
./deploy_all.sh
```

This script:
- Updates all KPIs and metrics
- Generates revenue projections
- Creates financial reports
- Generates investor pitch deck
- Creates agent tasks
- Commits and pushes to GitHub

### 2. View Dashboards Locally

```bash
# Main metrics dashboard
open dashboards/index.html

# Financial dashboard
open financial/dashboard.html

# Investor pitch deck
open financial/pitch_deck.html

# Analytics dashboard
open scripts/analytics_dashboard.html
```

### 3. Deploy to Production

```bash
# Enable GitHub Pages
# Go to: Settings → Pages → Deploy from: main, /dashboards

# Deploy to Cloudflare Pages
wrangler pages deploy dashboards --project-name=blackroad-metrics-dashboard
wrangler pages deploy financial --project-name=blackroad-financial-dashboard
```

---

## Detailed Deployment

### Step 1: Data Generation

#### Update KPIs (294 metrics)

```bash
python3 scripts/update_kpis.py
```

Output: `kpis.json`

#### Update Complete History

```bash
python3 scripts/update_complete_history.py
```

Output: `complete_history.json`

#### Generate Revenue Projections

```bash
cd financial
python3 revenue_tracker.py
```

Output: `revenue_projections.json`

#### Generate Financial Reports

```bash
python3 generate_reports.py
```

Outputs:
- `monthly_forecast.csv`
- `revenue_streams.csv`
- `milestones.csv`
- `FINANCIAL_SUMMARY.md`
- `investor_deck_data.json`
- `quarterly_targets.json`

#### Generate Investor Pitch Deck

```bash
python3 generate_pitch_deck.py
```

Output: `pitch_deck.html` (11-slide presentation)

#### Generate Agent Tasks

```bash
cd ..
python3 scripts/agent_task_integration.py
```

Output: `scripts/agent_tasks/*.yml`

### Step 2: GitHub Deployment

#### Commit Changes

```bash
git add -A
git commit -m "Update metrics and financial data - $(date '+%Y-%m-%d %H:%M:%S')

📊 Auto-generated metrics update
💰 Revenue projections updated
🤖 Agent tasks generated
📈 All data current as of $(date '+%Y-%m-%d %H:%M:%S')

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Push to GitHub

```bash
git push origin main
```

#### Enable GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages"
3. Source: Deploy from branch
4. Branch: `main`, Folder: `/dashboards`
5. Save

**Live URL:** `https://blackroad-os.github.io/blackroad-os-metrics/dashboards/`

### Step 3: Cloudflare Pages Deployment

#### Create Cloudflare Pages Projects

```bash
# Main metrics dashboard
wrangler pages project create blackroad-metrics-dashboard

# Financial dashboard
wrangler pages project create blackroad-financial-dashboard
```

#### Deploy Dashboards

```bash
# Main dashboard
wrangler pages deploy dashboards \
  --project-name=blackroad-metrics-dashboard \
  --branch=main

# Financial dashboard
wrangler pages deploy financial \
  --project-name=blackroad-financial-dashboard \
  --branch=main
```

**Live URLs:**
- `https://blackroad-metrics-dashboard.pages.dev`
- `https://blackroad-financial-dashboard.pages.dev`

#### Custom Domains (Optional)

```bash
# Add custom domain to Cloudflare Pages
wrangler pages deployment domain add \
  blackroad-metrics-dashboard \
  metrics.blackroad.io
```

### Step 4: Monetization Setup

#### Deploy Sponsor Page

```bash
# Deploy to main website
wrangler pages deploy stripe \
  --project-name=blackroad-website

# Or copy sponsor.html to existing site
cp stripe/sponsor.html /path/to/website/sponsor/index.html
```

**Target URL:** `https://blackroad.io/sponsor`

#### Set Up Stripe Products

1. Log in to Stripe Dashboard
2. Create Products:
   - **Friend Tier:** $5/month recurring
   - **Supporter Tier:** $25/month recurring
   - **Sponsor Tier:** $100/month recurring
   - **Startup License:** $499/year
   - **Business License:** $999/year
   - **Enterprise License:** $2,499/year
3. Copy Product IDs to `stripe/sponsor.html`
4. Update Stripe Publishable Key

#### Deploy FUNDING.yml to All Repos

```bash
# Automated deployment (requires GitHub CLI)
for repo in $(gh repo list BlackRoad-OS --limit 100 --json name --jq '.[].name'); do
  echo "Deploying FUNDING.yml to $repo..."

  # Clone repo
  gh repo clone "BlackRoad-OS/$repo" "/tmp/br-funding/$repo" 2>/dev/null || continue

  # Copy FUNDING.yml
  mkdir -p "/tmp/br-funding/$repo/.github"
  cp stripe/FUNDING.yml "/tmp/br-funding/$repo/.github/FUNDING.yml"

  # Commit and push
  cd "/tmp/br-funding/$repo"
  git add .github/FUNDING.yml
  git commit -m "Add GitHub funding configuration"
  git push origin main 2>/dev/null || git push origin master 2>/dev/null

  cd -
done
```

### Step 5: Analytics Setup

#### Run Analytics Setup

```bash
bash scripts/setup_analytics.sh
```

This:
- Creates analytics snippets (Plausible, GA4, custom)
- Injects tracking code into dashboards
- Creates analytics dashboard
- Sets up Cloudflare Workers endpoint

#### Deploy Analytics Worker

```bash
cd scripts/cloudflare_workers

# Update account and zone IDs in wrangler.toml
nano wrangler.toml

# Deploy worker
wrangler publish
```

#### Configure Analytics Platforms

**Plausible (Recommended):**
1. Sign up at plausible.io
2. Add domain: `blackroad.io`
3. Copy tracking code to analytics snippets
4. Redeploy dashboards

**Google Analytics (Optional):**
1. Create GA4 property
2. Copy Measurement ID (G-XXXXXXXXXX)
3. Update `scripts/setup_analytics.sh` with ID
4. Redeploy dashboards

### Step 6: Automation Setup

#### Enable GitHub Actions Automation

File: `.github/workflows/update-metrics.yml`

```yaml
name: Update Metrics

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Update All Metrics
        run: |
          python3 scripts/update_kpis.py
          python3 scripts/update_complete_history.py
          cd financial
          python3 revenue_tracker.py
          python3 generate_reports.py
          python3 generate_pitch_deck.py
          cd ..
          python3 scripts/agent_task_integration.py

      - name: Commit Changes
        run: |
          git config user.name "BlackRoad Bot"
          git config user.email "bot@blackroad.io"
          git add -A
          git commit -m "Auto-update metrics $(date '+%Y-%m-%d %H:%M:%S')" || exit 0
          git push
```

**Verify:** Go to Actions tab in GitHub to see hourly runs

---

## Configuration

### Customize Revenue Projections

Edit `financial/revenue_tracker.py`:

```python
# Line 44-196: Revenue stream projections
"projections": {
    "conservative": {
        "monthly": 100,  # Adjust here
        "annual": 1200,
        # ...
    }
}
```

### Customize Brand Colors

Edit dashboard files:

```css
/* Main brand gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Accent colors */
--accent-orange: #FF9D00;
--accent-pink: #FF0066;
--accent-blue: #0066FF;
```

### Customize Analytics

Edit `scripts/analytics_snippets/custom_analytics.js`:

```javascript
const analytics = {
  endpoint: 'https://analytics.blackroad.io/track',  // Change endpoint
  // ...
}
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check if all files are up to date
ls -lt *.json | head -5

# Verify GitHub Pages deployment
curl -I https://blackroad-os.github.io/blackroad-os-metrics/dashboards/

# Check Cloudflare Pages
curl -I https://blackroad-metrics-dashboard.pages.dev
```

### Regular Updates

```bash
# Run weekly for manual updates
./deploy_all.sh

# Or rely on hourly GitHub Actions automation
```

### Monitor Analytics

```bash
# View analytics dashboard
open scripts/analytics_dashboard.html

# Check Cloudflare Workers logs
wrangler tail blackroad-analytics
```

---

## Troubleshooting

### GitHub Pages Not Showing

**Problem:** 404 error on GitHub Pages URL

**Solution:**
```bash
# Verify GitHub Pages is enabled
gh repo view --web
# Go to Settings → Pages → Verify configuration

# Check if index.html exists
ls dashboards/index.html

# Force refresh Pages
git commit --allow-empty -m "Force Pages rebuild"
git push
```

### Cloudflare Deployment Fails

**Problem:** `wrangler pages deploy` fails

**Solution:**
```bash
# Login to Cloudflare
wrangler login

# Verify project exists
wrangler pages project list

# Create project if needed
wrangler pages project create blackroad-metrics-dashboard

# Deploy again
wrangler pages deploy dashboards --project-name=blackroad-metrics-dashboard
```

### Analytics Not Tracking

**Problem:** No analytics data being recorded

**Solution:**
```bash
# Verify analytics code injected
grep "BlackRoad OS Custom Analytics" financial/dashboard.html

# Check browser console for errors
# Open dashboard → F12 → Console

# Verify Cloudflare Worker is running
curl -X POST https://analytics.blackroad.io/track \
  -H "Content-Type: application/json" \
  -d '{"event":"test","timestamp":"2025-01-01T00:00:00Z"}'
```

### Python Scripts Fail

**Problem:** `ModuleNotFoundError` when running Python scripts

**Solution:**
```bash
# Install required packages
pip3 install --upgrade pip
# Most scripts use only standard library

# If GitHub integration needed:
pip3 install PyGithub
```

### Data Not Updating

**Problem:** Metrics show old data

**Solution:**
```bash
# Manually run update scripts
python3 scripts/update_kpis.py
python3 financial/revenue_tracker.py

# Check GitHub Actions logs
gh run list
gh run view [run-id]

# Force re-run
gh workflow run update-metrics.yml
```

---

## Next Steps

After successful deployment:

1. ✅ **Test All Dashboards**
   - Open each dashboard and verify data loads
   - Check responsiveness on mobile
   - Test all interactive features

2. ✅ **Configure Stripe**
   - Create all products
   - Update sponsor page with real product IDs
   - Test payment flow

3. ✅ **Set Up Monitoring**
   - Configure Cloudflare email alerts
   - Set up uptime monitoring (UptimeRobot)
   - Enable GitHub notifications for Actions

4. ✅ **Launch Marketing**
   - Share dashboards on LinkedIn
   - Tweet about metrics
   - Email potential sponsors
   - Update personal website

5. ✅ **Create Agent Tasks**
   - Review generated tasks in `scripts/agent_tasks/`
   - Create GitHub Issues from approved tasks
   - Label with `agent-task` for Codex pickup

---

## Support

**Questions or Issues?**

- 📧 Email: blackroad.systems@gmail.com
- 💼 LinkedIn: https://linkedin.com/in/alexaamundson
- 🐙 GitHub: https://github.com/BlackRoad-OS/blackroad-os-metrics/issues

---

**© 2023-2025 BlackRoad OS, Inc. All Rights Reserved.**

*This document is confidential and proprietary.*
