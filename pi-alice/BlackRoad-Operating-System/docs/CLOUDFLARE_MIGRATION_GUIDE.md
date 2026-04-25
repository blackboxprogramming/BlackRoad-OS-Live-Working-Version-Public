# Cloudflare DNS Migration Guide
## Complete Step-by-Step Guide for BlackRoad Domains

**Version:** 1.0
**Date:** 2025-11-18
**Estimated Time:** 2-4 hours for all domains
**Skill Level:** Intermediate

---

## Overview

This guide walks you through migrating BlackRoad domains from GoDaddy DNS to Cloudflare DNS. The migration provides:

- ✅ **Free SSL certificates** (automatic renewal)
- ✅ **Global CDN** (faster page loads worldwide)
- ✅ **DDoS protection** (automatic threat mitigation)
- ✅ **Better DNS performance** (anycast network)
- ✅ **Advanced features** (Workers, Zero Trust, edge functions)
- ✅ **Superior analytics** (traffic insights, security events)

**What you'll need:**
- Cloudflare account (free tier is sufficient)
- GoDaddy account with domain access
- 2-4 hours of time
- Basic command line familiarity (optional, for automation)

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Phase 1: Set Up Cloudflare Account](#phase-1-set-up-cloudflare-account)
3. [Phase 2: Add Domains to Cloudflare](#phase-2-add-domains-to-cloudflare)
4. [Phase 3: Update Nameservers at GoDaddy](#phase-3-update-nameservers-at-godaddy)
5. [Phase 4: Configure DNS Records](#phase-4-configure-dns-records)
6. [Phase 5: Configure SSL/TLS](#phase-5-configure-ssltls)
7. [Phase 6: Optimize Performance](#phase-6-optimize-performance)
8. [Phase 7: Verify Migration](#phase-7-verify-migration)
9. [Phase 8: Automation Setup (Optional)](#phase-8-automation-setup-optional)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Plan](#rollback-plan)

---

## Pre-Migration Checklist

Before starting, gather this information:

- [ ] **GoDaddy credentials** - Username and password
- [ ] **Current DNS records** - Document existing configuration
- [ ] **Email access** - For Cloudflare verification
- [ ] **Railway hostname** - Your production app URL (e.g., `your-app.up.railway.app`)
- [ ] **Current uptime** - Note if services are running properly

**⚠️ Important Notes:**
- Migration happens with **zero downtime** if done correctly
- DNS propagation takes 5-60 minutes (sometimes up to 24 hours)
- Keep GoDaddy account active (domain registration stays there)
- Only DNS management moves to Cloudflare

---

## Phase 1: Set Up Cloudflare Account

### Step 1.1: Create Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Enter your email address
3. Create a strong password
4. Verify your email address

### Step 1.2: Two-Factor Authentication (Recommended)

1. Click on your profile (top right)
2. Go to **My Profile** → **Authentication**
3. Enable **Two-Factor Authentication**
4. Save backup codes in a secure location

### Step 1.3: Get API Token

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Select **Edit zone DNS** template
4. Configure permissions:
   - **Zone - DNS - Edit**
   - **Zone - Zone - Read**
5. Select **Specific zones** → (you'll add zones in Phase 2)
6. Click **Continue to summary** → **Create Token**
7. **Copy the token immediately** (you won't see it again!)
8. Save it securely (we'll use it later for automation)

---

## Phase 2: Add Domains to Cloudflare

We'll start with the primary domain (`blackroad.systems`) and then add others.

### Step 2.1: Add blackroad.systems

1. From Cloudflare dashboard, click **Add a site**
2. Enter: `blackroad.systems`
3. Click **Add site**
4. Select **Free plan** → Click **Continue**
5. Cloudflare will scan existing DNS records from GoDaddy
6. Wait 30-60 seconds for scan to complete

### Step 2.2: Review Scanned Records

Cloudflare should detect existing records. Review them:

- ✅ Check for A records pointing to your server
- ✅ Check for CNAME records
- ✅ Check for MX records (email)
- ✅ Check for TXT records (SPF, verification)

**Common issues:**
- Some records might be missing → We'll add them manually later
- TTL values might be high → We'll adjust them

### Step 2.3: Get Nameservers

After scanning, Cloudflare will show 2 nameservers like:

```
aaaa.ns.cloudflare.com
bbbb.ns.cloudflare.com
```

**⚠️ IMPORTANT:** Copy these nameservers! You'll need them in Phase 3.

**Don't click "Done" yet** - we'll do that after updating nameservers at GoDaddy.

---

## Phase 3: Update Nameservers at GoDaddy

**⏰ Estimated Time:** 10 minutes + 5-60 minutes propagation

### Step 3.1: Log in to GoDaddy

1. Go to [https://account.godaddy.com](https://account.godaddy.com)
2. Sign in with your credentials
3. Go to **My Products** → **Domains**

### Step 3.2: Update Nameservers for blackroad.systems

1. Find `blackroad.systems` in your domain list
2. Click the three dots (...) → **Manage DNS**
3. Scroll down to **Nameservers** section
4. Click **Change** → Select **Enter my own nameservers (advanced)**
5. Remove existing nameservers
6. Add the 2 Cloudflare nameservers from Phase 2, Step 2.3:
   ```
   aaaa.ns.cloudflare.com
   bbbb.ns.cloudflare.com
   ```
7. Click **Save**
8. Confirm the change

**What happens now:**
- GoDaddy will propagate the nameserver change
- This takes 5-60 minutes (sometimes up to 24 hours)
- Your site will continue working during this time

### Step 3.3: Return to Cloudflare

1. Go back to Cloudflare dashboard
2. Click **Done, check nameservers**
3. Cloudflare will start checking for nameserver changes
4. You'll see status: **Pending Nameserver Update**

**⏳ Wait time:** 5-60 minutes for Cloudflare to detect the change

You can check status by:
- Refreshing the Cloudflare dashboard
- Running: `dig NS blackroad.systems` (should show Cloudflare nameservers)
- Using: [https://dnschecker.org](https://dnschecker.org)

---

## Phase 4: Configure DNS Records

Once Cloudflare shows **Active** status, configure DNS records.

### Step 4.1: Verify Existing Records

1. In Cloudflare dashboard, go to **DNS** → **Records**
2. Review scanned records
3. Remove any incorrect or outdated records

### Step 4.2: Add/Update Primary Records

#### Root Domain (blackroad.systems)

| Type | Name | Target | Proxy | TTL |
|------|------|--------|-------|-----|
| CNAME | @ | `your-app.up.railway.app` | ✅ Proxied | Auto |

**Steps:**
1. Click **Add record**
2. Type: **CNAME**
3. Name: **@** (represents root domain)
4. Target: **your-railway-app.up.railway.app** (replace with actual Railway URL)
5. Proxy status: **Proxied** (orange cloud icon)
6. TTL: **Auto**
7. Click **Save**

#### WWW Subdomain

| Type | Name | Target | Proxy | TTL |
|------|------|--------|-------|-----|
| CNAME | www | blackroad.systems | ✅ Proxied | Auto |

**Steps:**
1. Click **Add record**
2. Type: **CNAME**
3. Name: **www**
4. Target: **blackroad.systems**
5. Proxy status: **Proxied**
6. Click **Save**

#### API Subdomain

| Type | Name | Target | Proxy | TTL |
|------|------|--------|-------|-----|
| CNAME | api | `your-app.up.railway.app` | ✅ Proxied | Auto |

#### OS Subdomain

| Type | Name | Target | Proxy | TTL |
|------|------|--------|-------|-----|
| CNAME | os | blackroad.systems | ✅ Proxied | Auto |

### Step 4.3: Configure Email Records (If Applicable)

If you use Google Workspace, G Suite, or custom email:

#### SPF Record
| Type | Name | Content | TTL |
|------|------|---------|-----|
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | Auto |

#### MX Records
| Type | Name | Content | Priority | TTL |
|------|------|---------|----------|-----|
| MX | @ | aspmx.l.google.com | 1 | Auto |
| MX | @ | alt1.aspmx.l.google.com | 5 | Auto |
| MX | @ | alt2.aspmx.l.google.com | 5 | Auto |

### Step 4.4: Verify Records

```bash
# Check DNS resolution
dig blackroad.systems
dig www.blackroad.systems
dig api.blackroad.systems

# Or use Cloudflare dashboard DNS checker
```

---

## Phase 5: Configure SSL/TLS

### Step 5.1: Set Encryption Mode

1. In Cloudflare dashboard, go to **SSL/TLS**
2. Set **Encryption mode** to **Full (strict)**
   - This ensures encryption between Cloudflare and Railway
   - Railway automatically provides SSL certificates

**⚠️ Important:** Do NOT use "Flexible" mode (insecure)

### Step 5.2: Enable Always Use HTTPS

1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable **Always Use HTTPS**
   - This redirects all HTTP traffic to HTTPS
3. Enable **Automatic HTTPS Rewrites**
   - Fixes mixed content warnings

### Step 5.3: Enable HSTS (Optional but Recommended)

1. Still in **Edge Certificates**
2. Enable **HTTP Strict Transport Security (HSTS)**
3. Configuration:
   - **Max Age:** 6 months (15768000 seconds)
   - **Include subdomains:** ✅ Enabled
   - **Preload:** ❌ Disabled (enable later when stable)
   - **No-Sniff header:** ✅ Enabled

**⚠️ Warning:** HSTS is irreversible for the max-age period. Only enable when confident.

### Step 5.4: Enable TLS 1.3

1. Go to **SSL/TLS** → **Edge Certificates**
2. **Minimum TLS Version:** Set to **TLS 1.2** (or 1.3 if supported)
3. **TLS 1.3:** ✅ Enabled

### Step 5.5: Verify SSL Configuration

1. Visit: `https://blackroad.systems`
2. Click the padlock icon in browser
3. Verify certificate is valid and issued by Cloudflare
4. Check expiry date (should auto-renew)

**Test with SSL Labs:**
```
https://www.ssllabs.com/ssltest/analyze.html?d=blackroad.systems
```

---

## Phase 6: Optimize Performance

### Step 6.1: Configure Caching

1. Go to **Caching** → **Configuration**
2. **Caching Level:** Standard
3. **Browser Cache TTL:** Respect Existing Headers

### Step 6.2: Enable Auto Minify

1. Go to **Speed** → **Optimization**
2. Enable **Auto Minify**:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### Step 6.3: Enable Brotli Compression

1. Still in **Speed** → **Optimization**
2. Enable **Brotli** compression (better than gzip)

### Step 6.4: Create Page Rules

1. Go to **Rules** → **Page Rules**
2. Create rule for API bypass:

**Rule 1: API Cache Bypass**
```
URL: *blackroad.systems/api/*
Settings:
  - Cache Level: Bypass
```

**Rule 2: WWW Redirect**
```
URL: www.blackroad.systems/*
Settings:
  - Forwarding URL: 301 redirect to https://blackroad.systems/$1
```

**Note:** Free plan allows 3 page rules. Use them wisely!

---

## Phase 7: Verify Migration

### Step 7.1: DNS Verification

```bash
# Check DNS propagation
dig blackroad.systems

# Check with multiple tools
dig @8.8.8.8 blackroad.systems
dig @1.1.1.1 blackroad.systems

# Or use online tool
# https://dnschecker.org
```

**Expected results:**
- Should resolve to Cloudflare IP addresses
- CNAME records should point to Railway
- Nameservers should be Cloudflare

### Step 7.2: HTTP/HTTPS Verification

```bash
# Test HTTP → HTTPS redirect
curl -I http://blackroad.systems
# Should return: 301 Moved Permanently
# Location: https://blackroad.systems/

# Test HTTPS
curl -I https://blackroad.systems
# Should return: 200 OK

# Test WWW → apex redirect
curl -I https://www.blackroad.systems
# Should redirect to https://blackroad.systems
```

### Step 7.3: SSL Certificate Check

```bash
# Check SSL certificate
openssl s_client -connect blackroad.systems:443 -servername blackroad.systems

# Look for:
# - Issuer: Cloudflare
# - Valid dates
# - No errors
```

### Step 7.4: Application Functionality

1. Visit `https://blackroad.systems`
2. Test all major features:
   - [ ] Page loads correctly
   - [ ] No mixed content warnings
   - [ ] API calls work
   - [ ] Authentication works
   - [ ] Static assets load (CSS, JS, images)

### Step 7.5: Automated Validation

```bash
# Use the validation script
cd /path/to/BlackRoad-Operating-System
python scripts/cloudflare/validate_dns.py --domain blackroad.systems

# This checks:
# - DNS resolution
# - SSL certificate validity
# - HTTP accessibility
# - Redirect configuration
```

---

## Phase 8: Automation Setup (Optional)

### Step 8.1: Install Script Dependencies

```bash
# Navigate to project
cd /path/to/BlackRoad-Operating-System

# Install Python dependencies
pip install -r scripts/cloudflare/requirements.txt
```

### Step 8.2: Set Up Environment Variables

```bash
# Create .env file (DO NOT COMMIT)
cat >> .env << EOF
CF_API_TOKEN=your-cloudflare-api-token
CF_ZONE_ID=your-zone-id
EOF

# Or add to shell profile
echo 'export CF_API_TOKEN="your-token"' >> ~/.bashrc
echo 'export CF_ZONE_ID="your-zone-id"' >> ~/.bashrc
source ~/.bashrc
```

### Step 8.3: Update domains.yaml

Edit `ops/domains.yaml` to reflect your Cloudflare configuration:

```yaml
domains:
  - name: "blackroad.systems"
    type: "root"
    provider: "cloudflare"
    mode: "dns"
    record:
      type: "CNAME"
      value: "your-actual-railway-app.up.railway.app"
      proxied: true

  - name: "blackroad.ai"
    type: "root"
    provider: "cloudflare"
    mode: "dns"
    record:
      type: "CNAME"
      value: "blackroad.systems"
      proxied: true
```

### Step 8.4: Test Automation

```bash
# Dry run (shows what would change)
python scripts/cloudflare/sync_dns.py --dry-run

# Apply changes
python scripts/cloudflare/sync_dns.py

# Validate
python scripts/cloudflare/validate_dns.py --all
```

### Step 8.5: Set Up GitHub Actions (Optional)

Add secrets to GitHub:

```bash
gh secret set CF_API_TOKEN
gh secret set CF_ZONE_ID
```

Create workflow file (`.github/workflows/sync-cloudflare-dns.yml`):

```yaml
name: Sync Cloudflare DNS

on:
  push:
    paths:
      - 'ops/domains.yaml'
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install -r scripts/cloudflare/requirements.txt
      - run: python scripts/cloudflare/sync_dns.py
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
```

---

## Troubleshooting

### Issue: DNS Not Resolving

**Symptoms:** `dig blackroad.systems` returns no results

**Causes:**
- Nameservers not updated at GoDaddy
- DNS propagation not complete
- Records not configured in Cloudflare

**Solutions:**
1. Check nameservers at GoDaddy
2. Wait 5-60 minutes for propagation
3. Check Cloudflare zone status (should be "Active")
4. Verify DNS records exist in Cloudflare

### Issue: SSL Certificate Errors

**Symptoms:** Browser shows "Not Secure" or certificate warning

**Causes:**
- SSL/TLS mode incorrect
- Railway app doesn't have valid certificate
- Certificate provisioning in progress

**Solutions:**
1. Set SSL/TLS mode to "Full (strict)"
2. Verify Railway app has SSL
3. Wait 5-10 minutes for certificate provisioning
4. Clear browser cache and retry

### Issue: Site Not Loading (403/502 Errors)

**Symptoms:** Site returns 403 Forbidden or 502 Bad Gateway

**Causes:**
- Railway app not running
- Incorrect CNAME target
- Cloudflare firewall blocking

**Solutions:**
1. Check Railway app status and logs
2. Verify CNAME points to correct Railway URL
3. Check Cloudflare firewall rules
4. Disable Cloudflare proxy temporarily (DNS-only) to test

### Issue: Mixed Content Warnings

**Symptoms:** Some assets load as insecure (http://)

**Causes:**
- Hard-coded HTTP URLs in code
- External resources using HTTP

**Solutions:**
1. Enable "Automatic HTTPS Rewrites" in Cloudflare
2. Update hard-coded URLs to HTTPS
3. Use protocol-relative URLs: `//example.com/asset.js`

### Issue: Email Not Working

**Symptoms:** Emails not sending/receiving

**Causes:**
- MX records not migrated
- SPF/DKIM records missing

**Solutions:**
1. Add MX records in Cloudflare (from Phase 4.3)
2. Add SPF TXT record
3. Add DKIM records if using custom email
4. Verify with: `dig MX blackroad.systems`

---

## Rollback Plan

If you need to revert to GoDaddy DNS:

### Quick Rollback

1. Go to GoDaddy → Domains → blackroad.systems
2. Nameservers → Change to **GoDaddy defaults**
3. Wait 5-60 minutes for propagation
4. Site will revert to GoDaddy DNS

**⚠️ Note:** You can keep the Cloudflare account and try again later.

### Gradual Rollback

If experiencing issues but want to keep trying:

1. In Cloudflare, change proxy status to **DNS Only** (gray cloud)
2. This bypasses Cloudflare's proxy but keeps DNS
3. Troubleshoot issues
4. Re-enable proxy when fixed

---

## Next Steps After Migration

### For All Remaining Domains

Repeat the process for:
- blackroad.ai
- blackroad.network
- blackroad.me
- lucidia.earth
- aliceqi.com
- blackroadqi.com
- roadwallet.com
- aliceos.io
- blackroadquantum.com

**Pro tip:** After doing blackroad.systems, the others are easier!

### Monitoring and Maintenance

1. **Set up monitoring:**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - SSL certificate expiry monitoring
   - Performance monitoring (Cloudflare Analytics)

2. **Review quarterly:**
   - DNS records (remove unused)
   - Page rules and caching
   - Security settings
   - Analytics and performance

3. **Stay updated:**
   - Review Cloudflare changelog
   - Test new features in sandbox
   - Keep API tokens rotated

---

## Migration Checklist

Use this to track your progress:

### Pre-Migration
- [ ] GoDaddy credentials ready
- [ ] Current DNS records documented
- [ ] Railway hostname confirmed
- [ ] Cloudflare account created

### Cloudflare Setup
- [ ] API token generated and saved
- [ ] Domain added to Cloudflare
- [ ] DNS records scanned
- [ ] Nameservers noted

### GoDaddy Update
- [ ] Nameservers updated at GoDaddy
- [ ] Change confirmed
- [ ] Propagation completed (zone shows "Active")

### DNS Configuration
- [ ] Root domain CNAME added
- [ ] WWW subdomain added
- [ ] API subdomain added
- [ ] OS subdomain added
- [ ] Email records added (if applicable)

### SSL/TLS
- [ ] Encryption mode set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] Automatic HTTPS Rewrites enabled
- [ ] HSTS configured (optional)
- [ ] TLS 1.3 enabled

### Performance
- [ ] Auto Minify enabled
- [ ] Brotli compression enabled
- [ ] Page rules configured
- [ ] Caching configured

### Verification
- [ ] DNS resolution verified
- [ ] SSL certificate valid
- [ ] HTTP → HTTPS redirect working
- [ ] WWW → apex redirect working
- [ ] Site accessible and functional
- [ ] API endpoints working
- [ ] Email working (if applicable)

### Automation (Optional)
- [ ] Python dependencies installed
- [ ] Environment variables set
- [ ] domains.yaml updated
- [ ] Automation scripts tested
- [ ] GitHub Actions configured (optional)

---

## Resources

### Documentation
- [Cloudflare DNS Blueprint](../infra/cloudflare/CLOUDFLARE_DNS_BLUEPRINT.md)
- [Scripts README](../scripts/cloudflare/README.md)
- [Domain Configuration](../ops/domains.yaml)

### External Links
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [DNS Checker Tool](https://dnschecker.org)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Railway Dashboard](https://railway.app/dashboard)

### Support
- Cloudflare Community: https://community.cloudflare.com/
- Railway Discord: https://discord.gg/railway
- BlackRoad GitHub Issues: https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues

---

**Congratulations!** 🎉

You've successfully migrated to Cloudflare DNS. Your sites now benefit from:
- Global CDN and faster performance
- Free SSL with auto-renewal
- DDoS protection
- Advanced security features
- Better analytics and insights

**Questions or issues?** Check the troubleshooting section or open a GitHub issue.

---

**Last Updated:** 2025-11-18
**Maintainer:** BlackRoad DevOps Team
**Version:** 1.0
