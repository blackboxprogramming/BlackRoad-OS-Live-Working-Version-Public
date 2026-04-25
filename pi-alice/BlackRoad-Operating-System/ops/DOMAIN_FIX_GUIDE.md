# BlackRoad.systems Domain Fix Guide

## Problem Summary

The `blackroad.systems` domain is currently returning **HTTP 403 Forbidden** with a fallback page ("Status: Nginx API") instead of serving the BlackRoad OS application.

### Root Cause

1. **Domain Configuration**: The domain was configured in "forward" mode to redirect to `os.blackroad.systems`, but this forwarding is not properly set up at the DNS/registrar level
2. **Nginx Misconfiguration**: The web server doesn't have a proper `server_name` directive matching `blackroad.systems`, causing requests to fall through to a default server block
3. **Missing Server Block**: No dedicated Nginx configuration exists for the `blackroad.systems` domain

## Solution Overview

We've updated the domain configuration to serve the application directly at `blackroad.systems` instead of using forwarding. This involves:

1. ✅ **Updated DNS configuration** in `ops/domains.yaml` to point `blackroad.systems` directly to the application server
2. ✅ **Created Nginx server blocks** in `ops/nginx/blackroad.systems.conf` for proper request handling
3. 📋 **Deployment steps** below to apply these changes

---

## Changes Made

### 1. Domain Configuration (`ops/domains.yaml`)

**Before:**
```yaml
- name: "blackroad.systems"
  mode: "forward"
  forward_to: "https://os.blackroad.systems"
```

**After:**
```yaml
- name: "blackroad.systems"
  mode: "dns"
  record:
    type: "CNAME"
    value: "YOUR-PROD-RAILWAY-APP.up.railway.app"
```

**Key Changes:**
- Changed from `forward` mode to `dns` mode
- Domain now points directly to the application server (Railway)
- `www.blackroad.systems` redirects to the apex domain
- Establishes `blackroad.systems` as the canonical domain

### 2. Nginx Configuration (`ops/nginx/blackroad.systems.conf`)

Created a complete Nginx server block configuration that:
- Redirects all HTTP traffic to HTTPS
- Redirects `www.blackroad.systems` to `blackroad.systems`
- Serves the BlackRoad OS application at the apex domain
- Includes proper SSL/TLS configuration
- Implements security headers
- Provides SPA fallback routing with `try_files`
- Configures static asset caching
- Includes health check endpoint at `/healthz`

---

## Deployment Steps

### Prerequisites

1. **Railway hostname**: Replace `YOUR-PROD-RAILWAY-APP.up.railway.app` in `ops/domains.yaml` with your actual Railway deployment URL
2. **SSL certificate**: Obtain SSL certificates for `blackroad.systems` (use Let's Encrypt or your provider)
3. **API credentials**: Ensure you have GoDaddy API credentials set as environment variables:
   ```bash
   export GODADDY_API_KEY="your_key_here"
   export GODADDY_API_SECRET="your_secret_here"
   ```

### Step 1: Update Domain DNS Records

Run the domain apply script to update DNS records at GoDaddy:

```bash
cd /path/to/BlackRoad-Operating-System
python3 ops/scripts/apply_domains.py
```

**Expected output:**
```
Updating DNS record for blackroad.systems: CNAME -> YOUR-PROD-RAILWAY-APP.up.railway.app
Updating forwarding for www.blackroad.systems -> https://blackroad.systems
```

**Verification:**
```bash
# Wait 5-10 minutes for DNS propagation, then check:
dig +short blackroad.systems
dig +short www.blackroad.systems
```

Both should resolve to your Railway server IP or CNAME.

### Step 2: Deploy Nginx Configuration

Copy the Nginx configuration to your server:

```bash
# SSH to your web server
ssh user@your-server

# Copy the config file
sudo cp /path/to/ops/nginx/blackroad.systems.conf /etc/nginx/sites-available/

# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/blackroad.systems.conf /etc/nginx/sites-enabled/

# Remove any default server blocks that might conflict
sudo rm /etc/nginx/sites-enabled/default
```

**Update paths in the config:**

Edit `/etc/nginx/sites-available/blackroad.systems.conf` and ensure:

1. **Document root**: Set `root` to your actual deployment directory
   ```nginx
   root /var/www/blackroad/current;  # Adjust this path
   ```

2. **SSL certificates**: Update SSL certificate paths
   ```nginx
   ssl_certificate /etc/ssl/certs/blackroad_systems.fullchain.pem;
   ssl_certificate_key /etc/ssl/private/blackroad_systems.key;
   ```

3. **Backend API proxy** (if needed): Uncomment and configure the `/api/` location block

### Step 3: Obtain SSL Certificates

If you don't have SSL certificates yet, use Let's Encrypt:

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificates for both apex and www
sudo certbot --nginx -d blackroad.systems -d www.blackroad.systems

# Certbot will automatically update your Nginx config
```

### Step 4: Test and Reload Nginx

```bash
# Test Nginx configuration syntax
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### Step 5: Deploy Your Application Build

Ensure your BlackRoad OS application is built and deployed to the document root:

```bash
# Example deployment (adjust to your build process)
cd /var/www/blackroad
git pull origin main
npm install
npm run build
cp -r dist/* current/

# Verify index.html exists
ls -la /var/www/blackroad/current/index.html
```

### Step 6: Verify the Deployment

Test all endpoints:

```bash
# Test HTTP -> HTTPS redirect
curl -I http://blackroad.systems
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://blackroad.systems

# Test www -> apex redirect
curl -I https://www.blackroad.systems
# Should return: HTTP/2 301
# Location: https://blackroad.systems

# Test main site
curl -I https://blackroad.systems
# Should return: HTTP/2 200

# Test health check
curl https://blackroad.systems/healthz
# Should return: ok

# Full response check
curl -s https://blackroad.systems | head -n 20
# Should return your HTML content (not "Status: Nginx API")
```

### Step 7: Purge CDN/Edge Caches (if applicable)

If you're using a CDN or edge cache:

```bash
# Cloudflare example
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Fastly example
curl -X POST "https://api.fastly.com/service/{service_id}/purge_all" \
  -H "Fastly-Key: {token}"
```

---

## Troubleshooting

### Issue: Still seeing 403 Forbidden

**Cause**: Nginx config not properly loaded or file permissions issue

**Solution**:
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify file permissions
sudo chown -R www-data:www-data /var/www/blackroad/current
sudo chmod -R 755 /var/www/blackroad/current

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: DNS not resolving

**Cause**: DNS propagation delay or incorrect CNAME value

**Solution**:
```bash
# Check current DNS records
dig blackroad.systems

# Force refresh DNS
sudo systemd-resolve --flush-caches

# Wait 5-15 minutes for global DNS propagation
```

### Issue: SSL certificate errors

**Cause**: Certificate not covering domain or expired

**Solution**:
```bash
# Check certificate validity
sudo openssl x509 -in /etc/ssl/certs/blackroad_systems.fullchain.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect blackroad.systems:443 -servername blackroad.systems
```

### Issue: 404 on SPA routes

**Cause**: `try_files` directive not working or missing index.html

**Solution**:
```bash
# Verify index.html exists
ls -la /var/www/blackroad/current/index.html

# Test Nginx try_files manually
curl -I https://blackroad.systems/some/spa/route
# Should return 200 and serve index.html
```

---

## Post-Deployment Validation Checklist

- [ ] `http://blackroad.systems` redirects to `https://blackroad.systems`
- [ ] `https://www.blackroad.systems` redirects to `https://blackroad.systems`
- [ ] `https://blackroad.systems` returns HTTP 200 and serves the application
- [ ] `/healthz` endpoint returns "ok"
- [ ] No "Status: Nginx API" fallback page
- [ ] No 403 Forbidden errors
- [ ] SSL certificate is valid and trusted
- [ ] SPA client-side routes work correctly
- [ ] Static assets load with proper caching headers

---

## Architecture Decision

### Why Apex Domain Instead of Subdomain?

Based on the `blackroad-universe/domains/blackroad-systems/DOMAIN_SPEC.md`:

- `blackroad.systems` is defined as the **flagship corporate & OS site**
- It should serve as the primary entry point for enterprise decision-makers
- The domain positioning emphasizes credibility, trust, and professional authority
- Using a subdomain (`os.blackroad.systems`) would dilute the brand and reduce SEO authority

### Domain Hierarchy

```
blackroad.systems (APEX)          → Main application (canonical)
├── www.blackroad.systems         → Redirects to apex
└── os.blackroad.systems          → Alternative alias (serves same app)
```

This establishes `blackroad.systems` as the canonical domain while maintaining backwards compatibility with `os.blackroad.systems`.

---

## Monitoring

Set up monitoring to ensure the domain stays healthy:

```bash
# Uptime monitoring
curl -fsS -m 10 --retry 5 https://blackroad.systems/healthz || echo "Site down!"

# Response time monitoring
curl -w "@curl-format.txt" -o /dev/null -s https://blackroad.systems

# SSL certificate expiration monitoring
echo | openssl s_client -servername blackroad.systems -connect blackroad.systems:443 2>/dev/null | openssl x509 -noout -dates
```

Consider using monitoring services like:
- Uptime Robot
- Pingdom
- StatusCake
- Datadog

---

## Rollback Plan

If issues occur after deployment:

```bash
# Revert DNS (run apply_domains.py with old config)
git checkout HEAD~1 ops/domains.yaml
python3 ops/scripts/apply_domains.py

# Disable new Nginx config
sudo rm /etc/nginx/sites-enabled/blackroad.systems.conf
sudo systemctl reload nginx

# Wait for DNS propagation (5-15 minutes)
```

---

## Next Steps

1. **Replace Railway placeholder**: Update `YOUR-PROD-RAILWAY-APP.up.railway.app` in `domains.yaml` with actual hostname
2. **Obtain SSL certificates**: Use Let's Encrypt or your certificate provider
3. **Deploy application build**: Ensure latest build is in `/var/www/blackroad/current`
4. **Run apply_domains.py**: Update DNS records at GoDaddy
5. **Deploy Nginx config**: Copy and enable the server block
6. **Test thoroughly**: Verify all redirects and endpoints work correctly
7. **Monitor**: Set up uptime and SSL monitoring

---

## Contact

For issues with this deployment:
- Review logs: `/var/log/nginx/error.log` and `/var/log/nginx/access.log`
- Check domain status: `ops/scripts/apply_domains.py`
- Verify DNS: `dig blackroad.systems`
- Test SSL: `openssl s_client -connect blackroad.systems:443`

---

**Status**: Ready for deployment
**Last Updated**: 2025-11-17
