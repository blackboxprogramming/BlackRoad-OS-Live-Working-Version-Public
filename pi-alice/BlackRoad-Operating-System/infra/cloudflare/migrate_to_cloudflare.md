# Migrate DNS to Cloudflare - Step-by-Step Guide

**Version:** 1.0
**Date:** 2025-11-18
**For:** Alexa Louise Amundson (Cadillac)
**Time Required:** 30-60 minutes per domain
**Difficulty:** Beginner-friendly

---

## Overview

This guide will walk you through migrating DNS management from GoDaddy to Cloudflare for all BlackRoad domains. This migration will give you:

- ✅ **Free SSL certificates** (automatic)
- ✅ **CDN** (content delivery network for faster loading)
- ✅ **DDoS protection** (automatic security)
- ✅ **Better performance** (global anycast network)
- ✅ **Advanced features** (Workers, Zero Trust, analytics)

**Important**: You'll keep your domain registered with GoDaddy. We're only moving the DNS management to Cloudflare.

---

## Prerequisites

Before you start, make sure you have:

- [x] Access to your **GoDaddy account** (where domains are registered)
- [x] A **Cloudflare account** (create free at https://cloudflare.com if you don't have one)
- [x] Access to your **Railway account** (to get your app URLs)
- [x] About **30-60 minutes** per domain (can do one at a time)
- [x] Your **iPhone** or computer (both work fine)

---

## Part 1: Get Your Railway App URLs

Before configuring DNS, you need to know your Railway app URLs.

### Step 1.1: Log into Railway

1. Go to https://railway.app
2. Log in with your account
3. Select your **BlackRoad-Operating-System** project

### Step 1.2: Find Your Production Backend URL

1. Click on your **backend** service
2. Click **Settings** → **Networking**
3. Look for **Public Networking** section
4. You'll see a URL like: `blackroad-os-production.up.railway.app`
5. **Copy this URL** - you'll need it later

**Write it down here:**
```
Production Backend URL: _________________________________
```

### Step 1.3: Find Your Staging Backend URL (if exists)

If you have a staging environment:
1. Select your staging service
2. Repeat the same steps
3. Copy the staging URL

**Write it down here:**
```
Staging Backend URL: _________________________________
```

---

## Part 2: Add Your First Domain to Cloudflare

We'll start with **blackroad.systems** (the main domain). Once you understand the process, you can repeat for other domains.

### Step 2.1: Add Site to Cloudflare

1. Log into **Cloudflare** (https://dash.cloudflare.com)
2. Click **"Add a site"** (big blue button on the right)
3. Enter your domain: `blackroad.systems`
4. Click **"Add site"**

### Step 2.2: Select Free Plan

1. Cloudflare shows you plan options
2. Select **"Free"** plan ($0/month)
3. Click **"Continue"**

### Step 2.3: Review DNS Records

1. Cloudflare automatically **scans** your existing DNS records from GoDaddy
2. You'll see a list of records it found
3. Review them - **don't worry if it doesn't look perfect** yet
4. Click **"Continue"** at the bottom

**Note:** We'll configure the correct DNS records later using `records.yaml`.

### Step 2.4: Get Your Cloudflare Nameservers

This is the most important step!

1. Cloudflare will show you **2 nameservers** like:
   ```
   aaaa.ns.cloudflare.com
   bbbb.ns.cloudflare.com
   ```
   (The actual names will be different - they're unique to your account)

2. **Write them down carefully:**
   ```
   Nameserver 1: _________________________________
   Nameserver 2: _________________________________
   ```

3. **Keep this tab open** - you'll come back to it!

---

## Part 3: Update Nameservers at GoDaddy

Now we'll tell GoDaddy to use Cloudflare's nameservers instead of its own.

### Step 3.1: Log into GoDaddy

1. Open a **new tab** (keep Cloudflare tab open)
2. Go to https://godaddy.com
3. Log in with your account
4. Click **"My Domains"** (or go to https://dcc.godaddy.com/manage/domains)

### Step 3.2: Manage Domain Settings

1. Find **blackroad.systems** in your domain list
2. Click the **three dots** (•••) next to it
3. Click **"Manage DNS"**

### Step 3.3: Change Nameservers

1. Scroll down to the **"Nameservers"** section
2. Click **"Change"** button
3. Select **"I'll use my own nameservers"** (or "Custom")
4. You'll see text boxes for nameservers

5. **Enter your Cloudflare nameservers:**
   - Nameserver 1: (paste the first Cloudflare nameserver)
   - Nameserver 2: (paste the second Cloudflare nameserver)

6. Click **"Save"**

7. GoDaddy will show a warning: *"Changing nameservers will affect your DNS..."*
   - This is normal - click **"Continue"** or **"Yes, I'm sure"**

**Important:** DNS propagation can take 5-60 minutes. Usually it's faster (5-15 minutes).

---

## Part 4: Verify DNS is Active in Cloudflare

Now we wait for DNS propagation and verify everything works.

### Step 4.1: Return to Cloudflare Tab

1. Go back to your **Cloudflare tab**
2. After changing nameservers, click **"Done, check nameservers"**
3. Cloudflare will start checking (this can take 5-60 minutes)

### Step 4.2: Wait for "Active" Status

**Option A: Wait for Email**
- Cloudflare will email you when the domain is active
- Subject: "Your site is now active on a Cloudflare Free plan"

**Option B: Check Dashboard**
1. Go to Cloudflare dashboard → Your site
2. Look at the status at the top
3. Wait for it to change from **"Pending"** to **"Active"**

**While you wait:** This is a good time to grab coffee ☕ or work on something else for 15-30 minutes.

### Step 4.3: Verify with DNS Checker

Once Cloudflare shows "Active", verify DNS is working:

1. Go to https://dnschecker.org
2. Enter your domain: `blackroad.systems`
3. Select record type: **CNAME** (or A)
4. Click **"Search"**
5. You should see Cloudflare IPs across different locations

**Green checkmarks** = DNS has propagated in that region 🎉

---

## Part 5: Configure DNS Records

Now that Cloudflare is managing your DNS, let's set up the correct records.

### Step 5.1: Get Your Zone ID

1. In Cloudflare dashboard, select **blackroad.systems**
2. Scroll down on the **Overview** page
3. On the right sidebar, find **"Zone ID"**
4. Click to **copy** it

**Write it down:**
```
Zone ID for blackroad.systems: _________________________________
```

### Step 5.2: Update records.yaml

1. Open `infra/cloudflare/records.yaml` in your code editor
2. Find the `blackroad.systems` section
3. Replace `REPLACE_WITH_ZONE_ID_FROM_CLOUDFLARE` with your actual Zone ID
4. Replace `blackroad-os-production.up.railway.app` with your actual Railway URL (from Part 1)
5. **Save the file**

### Step 5.3: Configure Records Manually (Option A - Browser)

**For each record in `records.yaml`:**

1. Go to Cloudflare → **DNS** → **Records**
2. Click **"Add record"**
3. Fill in:
   - **Type**: (e.g., CNAME)
   - **Name**: (e.g., @ for root, www for www subdomain)
   - **Target**: (e.g., your Railway URL)
   - **Proxy status**: Click the cloud icon to make it **orange** (proxied) ✅
   - **TTL**: Select **Auto**
4. Click **"Save"**
5. Repeat for all records

**Pro tip:** Delete any old records Cloudflare imported from GoDaddy that you don't need.

### Step 5.4: Configure Records Automatically (Option B - Script)

If you're comfortable with command line:

```bash
# Set your Cloudflare credentials
export CF_API_TOKEN="your-cloudflare-api-token"
export CF_ZONE_ID="your-zone-id"

# Run the sync script
python infra/cloudflare/cloudflare_dns_sync.py
```

See `cloudflare_dns_sync.py` documentation for details.

---

## Part 6: Configure SSL/TLS

Cloudflare provides free SSL certificates, but we need to configure the encryption mode.

### Step 6.1: Set SSL/TLS Mode

1. In Cloudflare dashboard, go to **SSL/TLS** (left menu)
2. Under **Overview**, set encryption mode to:
   - **"Full (strict)"** ✅

   **Why?** This ensures end-to-end encryption:
   - User → Cloudflare: Encrypted with Cloudflare cert
   - Cloudflare → Railway: Encrypted with Railway cert

3. Cloudflare saves this automatically

### Step 6.2: Enable Always Use HTTPS

1. Go to **SSL/TLS** → **Edge Certificates**
2. Turn on **"Always Use HTTPS"** ✅
   - This redirects all HTTP traffic to HTTPS automatically

3. Turn on **"Automatic HTTPS Rewrites"** ✅
   - This fixes mixed content warnings

4. Turn on **"Certificate Transparency Monitoring"** ✅
   - This monitors your SSL certificate health

### Step 6.3: Enable HSTS (Optional but Recommended)

1. Scroll down to **"HTTP Strict Transport Security (HSTS)"**
2. Click **"Enable HSTS"**
3. Read the warning, then configure:
   - **Max Age**: 6 months (15768000 seconds)
   - **Include subdomains**: ✅ Yes
   - **Preload**: ❌ No (enable this later when stable)
4. Click **"Next"** → **"I understand"**

**Warning:** HSTS is a security feature that forces browsers to only use HTTPS. Don't enable "Preload" until you're 100% sure SSL is working perfectly.

---

## Part 7: Optimize Performance

Let's configure caching and performance features.

### Step 7.1: Enable Auto Minify

1. Go to **Speed** → **Optimization** (left menu)
2. Under **Auto Minify**, check:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML
3. Cloudflare saves automatically

### Step 7.2: Enable Brotli Compression

1. In the same **Speed** → **Optimization** page
2. Turn on **"Brotli"** ✅
   - This compresses your files even more than gzip

### Step 7.3: Set Caching Level

1. Go to **Caching** → **Configuration**
2. Set **Caching Level** to **"Standard"**
3. Set **Browser Cache TTL** to **"Respect Existing Headers"**
   - This lets your backend control cache timing

---

## Part 8: Add Custom Domain to Railway

Now we need to tell Railway about your custom domain.

### Step 8.1: Add Custom Domain in Railway

1. Go to **Railway dashboard**
2. Select your **backend** service
3. Go to **Settings** → **Networking**
4. Under **Custom Domains**, click **"Add Domain"**
5. Enter: `os.blackroad.systems`
6. Click **"Add"**

**Railway will:**
- Automatically provision an SSL certificate (via Let's Encrypt)
- Show a green checkmark when ready (usually takes 1-2 minutes)

### Step 8.2: Repeat for Other Subdomains

Add these custom domains to Railway:
- `api.blackroad.systems`
- `prism.blackroad.systems`

**Note:** Each subdomain that points to Railway needs to be added in Railway's custom domains.

---

## Part 9: Test Everything

Let's verify everything is working!

### Step 9.1: Test HTTPS

Open these URLs in your browser (or on your iPhone):

1. https://blackroad.systems
2. https://www.blackroad.systems (should redirect to above)
3. https://os.blackroad.systems
4. https://api.blackroad.systems/health
5. https://docs.blackroad.systems

**Check for:**
- ✅ Green padlock in browser (🔒)
- ✅ Page loads correctly
- ✅ No certificate warnings

### Step 9.2: Test HTTP → HTTPS Redirect

Try loading without HTTPS:

1. http://blackroad.systems (should redirect to https://)

**Should automatically redirect** to HTTPS version.

### Step 9.3: Test DNS Propagation

Use these tools to verify DNS is working globally:

1. **DNS Checker**: https://dnschecker.org
   - Enter: `blackroad.systems`
   - Should show Cloudflare IPs

2. **Cloudflare DNS Lookup**: https://1.1.1.1/dns/
   - Enter: `os.blackroad.systems`
   - Should resolve correctly

### Step 9.4: Check Cloudflare Analytics

1. Go to Cloudflare → **Analytics & Logs** → **Traffic**
2. You should start seeing traffic data within a few minutes
3. This confirms traffic is flowing through Cloudflare

---

## Part 10: Repeat for Other Domains

Now that you've done `blackroad.systems`, repeat the same process for:

**Phase 1 Domains** (do these now):
- [ ] `blackroad.ai`
- [ ] `blackroad.network`
- [ ] `blackroad.me`

**Phase 2 Domains** (do these later):
- [ ] `lucidia.earth`
- [ ] `aliceqi.com`
- [ ] `blackroadqi.com`
- [ ] `roadwallet.com`
- [ ] `aliceos.io`
- [ ] `blackroadquantum.com`

**For each domain, follow the same steps:**
1. Part 2: Add domain to Cloudflare
2. Part 3: Update nameservers at GoDaddy
3. Part 4: Wait for "Active" status
4. Part 5: Configure DNS records
5. Part 6: Configure SSL/TLS
6. Part 7: Optimize performance
7. Part 8: Add custom domains to Railway (if needed)
8. Part 9: Test

**Pro tip:** You can start the process for multiple domains in parallel (add them all to Cloudflare and change nameservers), then configure them one at a time while DNS propagates.

---

## Troubleshooting

### DNS Not Resolving

**Problem:** Domain doesn't load after changing nameservers

**Solutions:**
1. **Wait longer** - DNS can take up to 48 hours (usually 5-60 minutes)
2. **Clear your browser cache** - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on PC)
3. **Check nameservers** - Go to https://www.whatsmydns.net and enter your domain
4. **Verify at GoDaddy** - Make sure nameservers are saved correctly

### SSL Certificate Error

**Problem:** Browser shows "Not Secure" or certificate warning

**Solutions:**
1. **Check SSL/TLS mode** - Should be "Full (strict)" in Cloudflare
2. **Wait for Railway SSL** - Check Railway dashboard for green checkmark
3. **Check custom domain** - Make sure domain is added in Railway settings
4. **Try incognito mode** - Sometimes browser cache causes issues

### Site Not Loading

**Problem:** Domain resolves but site doesn't load (blank page, 502 error)

**Solutions:**
1. **Check Railway app** - Make sure backend is deployed and healthy
2. **Check Railway logs** - Look for errors: Railway dashboard → Logs
3. **Test Railway URL directly** - Try `your-app.up.railway.app` to isolate issue
4. **Check DNS records** - Make sure CNAME points to correct Railway URL

### Mixed Content Warnings

**Problem:** Page loads but some assets show as insecure (broken padlock)

**Solutions:**
1. **Enable "Automatic HTTPS Rewrites"** - In Cloudflare SSL/TLS settings
2. **Check your code** - Make sure no hard-coded `http://` URLs
3. **Use relative URLs** - In your HTML/JS, use `/api/...` instead of full URLs

### Email Stopped Working

**Problem:** Can't send/receive emails after DNS migration

**Solutions:**
1. **Check MX records** - Make sure they're configured in Cloudflare DNS
2. **MX records must be DNS-only** - Turn OFF proxy (grey cloud) for MX records
3. **Verify SPF/DKIM** - Make sure TXT records for email are present

---

## Getting Help

If you run into issues:

1. **Cloudflare Community**: https://community.cloudflare.com
2. **Railway Discord**: https://discord.gg/railway
3. **Check Cloudflare Status**: https://www.cloudflarestatus.com
4. **Check Railway Status**: https://status.railway.app

**For BlackRoad-specific issues:**
- Open an issue in the repo
- Check `CLAUDE.md` for developer docs
- Review `MASTER_ORCHESTRATION_PLAN.md`

---

## Next Steps

After DNS migration is complete:

- [ ] Set up **Page Rules** for WWW redirects (see Part 11 below)
- [ ] Enable **Web Analytics** in Cloudflare
- [ ] Set up **Firewall Rules** (optional)
- [ ] Configure **Workers** for edge functions (Phase 2)
- [ ] Set up **Cloudflare Access** for zero-trust security (Phase 2)

---

## Part 11: Set Up Page Rules (Optional but Recommended)

Page Rules let you configure special behaviors for specific URLs.

### Step 11.1: Create WWW Redirect Rule

1. Go to Cloudflare → **Rules** → **Page Rules**
2. Click **"Create Page Rule"**
3. Enter URL: `www.blackroad.systems/*`
4. Click **"Add a Setting"** → **"Forwarding URL"**
5. Select **"301 - Permanent Redirect"**
6. Enter destination: `https://blackroad.systems/$1`
7. Click **"Save and Deploy"**

**What this does:** Redirects www.blackroad.systems to blackroad.systems (keeps the path)

### Step 11.2: Bypass API Caching

Create a rule to prevent API responses from being cached:

1. Click **"Create Page Rule"**
2. Enter URL: `*blackroad.systems/api/*`
3. Add settings:
   - **Cache Level** → Bypass
   - **Disable Performance** (optional)
4. Click **"Save and Deploy"**

**What this does:** Ensures API calls always hit your backend (no stale cached data)

---

## Checklist: Migration Complete

Mark these when done:

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at GoDaddy
- [ ] DNS status shows "Active" in Cloudflare
- [ ] DNS records configured (from records.yaml)
- [ ] SSL/TLS set to "Full (strict)"
- [ ] "Always Use HTTPS" enabled
- [ ] Auto Minify enabled
- [ ] Brotli compression enabled
- [ ] Custom domains added to Railway
- [ ] HTTPS works (green padlock 🔒)
- [ ] HTTP → HTTPS redirect works
- [ ] WWW → apex redirect works
- [ ] API endpoint responding
- [ ] Docs subdomain works
- [ ] No console errors in browser
- [ ] Cloudflare Analytics showing traffic

---

## Success! 🎉

You've successfully migrated DNS to Cloudflare! Your domains now benefit from:

- ✅ Free SSL certificates
- ✅ CDN (faster loading worldwide)
- ✅ DDoS protection
- ✅ Better security
- ✅ Advanced features ready for Phase 2

**What's next?**
- Move on to Phase 1 infrastructure tasks
- Set up GitHub Actions secrets
- Configure Railway environment variables
- Deploy your first updates through the new infrastructure

**Where AI meets the open road.** 🛣️
