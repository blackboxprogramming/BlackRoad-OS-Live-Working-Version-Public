# 🌍 Deploy to www.lucidia.earth - Complete Guide

## 🎯 Mission: Get BlackRoad Metaverse on www.lucidia.earth!

**Date:** 2026-01-30  
**Target Domain:** www.lucidia.earth  
**Source:** blackroad-metaverse.pages.dev  
**Status:** Configuration Guide Ready ✅

---

## 📋 Prerequisites Check

- ✅ Cloudflare Pages Project: `blackroad-metaverse`
- ✅ Latest Deployment: https://f62efd69.blackroad-metaverse.pages.dev
- ✅ Domain Name: lucidia.earth (needs verification)
- ⏳ DNS Configuration: Pending

---

## 🚀 Step-by-Step Setup Guide

### Option 1: Via Cloudflare Dashboard (Recommended)

#### Step 1: Add Custom Domain
1. Go to **Cloudflare Dashboard**
2. Navigate to: **Workers & Pages** → **blackroad-metaverse**
3. Click **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `www.lucidia.earth`
6. Click **Continue**
7. Cloudflare will provide DNS instructions

#### Step 2: Configure DNS
Cloudflare will automatically add a CNAME record:

```
Type: CNAME
Name: www
Target: blackroad-metaverse.pages.dev
Proxy: ON (Orange Cloud)
```

#### Step 3: Verify
- Wait 1-5 minutes for DNS propagation
- Visit: https://www.lucidia.earth
- You should see the metaverse! 🎉

---

### Option 2: Via Cloudflare API (Automated)

If you have the Cloudflare API token, we can automate this:

```bash
# Set your Cloudflare credentials
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export CLOUDFLARE_API_TOKEN="your_api_token"
export CLOUDFLARE_ZONE_ID="lucidia_earth_zone_id"

# Add custom domain via API
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/blackroad-metaverse/domains" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"www.lucidia.earth"}'

# Add DNS CNAME record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"CNAME",
    "name":"www",
    "content":"blackroad-metaverse.pages.dev",
    "proxied":true
  }'
```

---

## 🔍 Domain Verification Steps

### Check if lucidia.earth is in Cloudflare

```bash
# Check Cloudflare zones
wrangler whoami

# Or via API
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq '.result[] | select(.name=="lucidia.earth")'
```

---

## 🌐 DNS Configuration Details

### Required DNS Records

```
# CNAME for www subdomain
www.lucidia.earth → blackroad-metaverse.pages.dev (Proxied)

# Optional: Redirect apex domain
lucidia.earth → www.lucidia.earth (301 redirect)
```

### Full DNS Setup (If Setting Up New Domain)

```
# Primary Records
Type    Name    Content                             Proxy   TTL
CNAME   www     blackroad-metaverse.pages.dev       ON      Auto
CNAME   @       blackroad-metaverse.pages.dev       ON      Auto

# Optional Subdomains
CNAME   universe   blackroad-metaverse.pages.dev    ON      Auto
CNAME   metaverse  blackroad-metaverse.pages.dev    ON      Auto
```

---

## 📊 Quick DNS Check Commands

```bash
# Check if domain resolves
dig www.lucidia.earth

# Check CNAME record
dig www.lucidia.earth CNAME

# Check with trace
dig +trace www.lucidia.earth

# Test HTTPS
curl -I https://www.lucidia.earth
```

---

## 🎯 Alternative: Deploy to Existing Lucidia Server

If lucidia.earth is pointing to your local Lucidia server (192.168.4.38):

### Option A: Proxy Through Cloudflare
1. Add lucidia.earth to Cloudflare
2. Set up Page Rules to route www → Pages
3. Keep other traffic going to 192.168.4.38

### Option B: Deploy Locally to Lucidia
```bash
# Copy files to Lucidia server
scp -r /Users/alexa/blackroad-metaverse/* pi@192.168.4.38:/var/www/lucidia.earth/

# Set up nginx on Lucidia
ssh pi@192.168.4.38
sudo nano /etc/nginx/sites-available/lucidia.earth

# Add nginx config (see below)
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name www.lucidia.earth lucidia.earth;
    
    root /var/www/lucidia.earth;
    index index.html universe.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/html text/css application/javascript;
}
```

---

## 🔥 Fastest Path to Live

### Immediate Action Plan:

1. **Check Domain Ownership**
   ```bash
   whois lucidia.earth | grep -i registrar
   ```

2. **If domain is in Cloudflare:**
   - Go to Cloudflare Dashboard
   - Add custom domain to Pages project
   - Done in 2 minutes!

3. **If domain is NOT in Cloudflare:**
   - Add domain to Cloudflare (free plan)
   - Update nameservers at registrar
   - Wait 24 hours for propagation
   - Then add custom domain to Pages

4. **If you want it NOW:**
   - Use Cloudflare's automatic subdomain
   - Already live at: blackroad-metaverse.pages.dev
   - Add custom domain later

---

## 🎉 What Happens After Setup

### Immediate Benefits:
- ✅ Clean URL: www.lucidia.earth
- ✅ Automatic HTTPS (Cloudflare SSL)
- ✅ Global CDN (fast everywhere)
- ✅ DDoS protection
- ✅ Caching & optimization

### Users Will Visit:
- https://www.lucidia.earth → Full metaverse experience
- Music plays automatically 🎵
- Performance optimized ⚡
- Beautiful cohesive design 🎨

---

## 🐛 Troubleshooting

### Domain Not Resolving?
```bash
# Clear DNS cache (Mac)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Check DNS propagation
https://dnschecker.org
```

### SSL Certificate Issues?
- Cloudflare auto-generates certificates
- Wait 5 minutes after domain add
- Use "Full (strict)" SSL mode

### 404 Errors?
- Verify domain is added in Pages Dashboard
- Check DNS CNAME target
- Ensure deployment is successful

---

## 📝 Action Items

Choose your path:

### Path 1: Cloudflare Dashboard (5 minutes)
- [ ] Log into Cloudflare Dashboard
- [ ] Go to Workers & Pages → blackroad-metaverse
- [ ] Add custom domain: www.lucidia.earth
- [ ] Wait for DNS propagation
- [ ] Visit www.lucidia.earth 🎉

### Path 2: API Automation (Need credentials)
- [ ] Get Cloudflare API token
- [ ] Get Account ID
- [ ] Get Zone ID for lucidia.earth
- [ ] Run API commands
- [ ] Verify deployment

### Path 3: Local Lucidia Server
- [ ] SSH to Lucidia (192.168.4.38)
- [ ] Copy metaverse files
- [ ] Configure nginx
- [ ] Set up port forwarding
- [ ] Test locally then expose

---

## 🌟 Recommended: Path 1 (Dashboard)

**Fastest and most reliable!**

1. Open: https://dash.cloudflare.com
2. Find: blackroad-metaverse project
3. Add: www.lucidia.earth
4. Wait: 1-5 minutes
5. **DONE!** 🎊

---

## 📞 Need Help?

If you need credentials or have questions:
1. Check if domain is already in Cloudflare
2. Verify you have access to the Cloudflare account
3. Get API token if needed for automation

---

**Ready to make www.lucidia.earth LIVE!** 🚀🌍✨

*Generated: 2026-01-30*  
*Target: www.lucidia.earth*  
*Status: Configuration Ready*
