# ☁️ BlackRoad OS - Cloudflare DNS Configuration

**Version**: 1.0.0
**Last Updated**: 2025-11-19
**Domain**: blackroad.systems
**Operator**: Atlas

---

## 📋 Complete DNS Table

### Production DNS Records

Copy these records into Cloudflare DNS management:

| Type | Name | Target | Proxy Status | TTL |
|------|------|--------|--------------|-----|
| CNAME | `core` | `blackroad-os-core-production.up.railway.app` | ✅ Proxied | Auto |
| CNAME | `api` | `blackroad-os-api-production.up.railway.app` | ✅ Proxied | Auto |
| CNAME | `operator` | `blackroad-os-operator-production.up.railway.app` | ✅ Proxied | Auto |
| CNAME | `prism` | `blackroad-os-prism-console-production.up.railway.app` | ✅ Proxied | Auto |
| CNAME | `docs` | `blackroad-os-docs-production.up.railway.app` | ✅ Proxied | Auto |
| CNAME | `os` | `prism.blackroad.systems` | ✅ Proxied | Auto |
| CNAME | `@` (root) | `prism.blackroad.systems` | ✅ Proxied | Auto |

**Notes**:
- ✅ Proxied = Orange cloud icon (CDN + DDoS protection)
- TTL: Auto = Cloudflare manages TTL automatically
- All records use CNAME (not A/AAAA) pointing to Railway URLs

---

## 🎯 Service Mapping

### What Each Domain Does

| Domain | Service | Purpose |
|--------|---------|---------|
| `core.blackroad.systems` | Core API | Internal business logic |
| `api.blackroad.systems` | Public API Gateway | External API access |
| `operator.blackroad.systems` | Operator Engine | Job scheduler & agents |
| `prism.blackroad.systems` | Prism Console | Admin dashboard |
| `docs.blackroad.systems` | Documentation | Technical docs |
| `os.blackroad.systems` | Alias to Prism | Alternative access |
| `blackroad.systems` | Root → Prism | Main entry point |

---

## 🔒 SSL/TLS Configuration

### Cloudflare Settings

Navigate to: **SSL/TLS → Overview**

```yaml
Encryption Mode: Full (not Full Strict)
  ↳ Encrypts traffic between Cloudflare and Railway
  ↳ Accepts Railway's self-signed certificates

Always Use HTTPS: ON
  ↳ Redirects all HTTP to HTTPS

Automatic HTTPS Rewrites: ON
  ↳ Fixes mixed content warnings

Minimum TLS Version: TLS 1.2
  ↳ Modern security standard
```

### Edge Certificates

Navigate to: **SSL/TLS → Edge Certificates**

```yaml
Universal SSL: ON
  ↳ Free SSL certificate for blackroad.systems

Auto Minify:
  ✅ JavaScript
  ✅ CSS
  ✅ HTML

Brotli Compression: ON
  ↳ Better compression than gzip
```

---

## 🚀 Performance Settings

### Speed Optimization

Navigate to: **Speed → Optimization**

```yaml
Auto Minify:
  ✅ JavaScript
  ✅ CSS
  ✅ HTML

Rocket Loader: OFF
  ↳ May break some JavaScript apps
  ↳ Test before enabling

Mirage: ON
  ↳ Optimizes images on mobile
```

### Caching

Navigate to: **Caching → Configuration**

```yaml
Caching Level: Standard
  ↳ Caches static resources

Browser Cache TTL: 4 hours
  ↳ How long browsers cache content

Always Online: ON
  ↳ Serves cached version if origin is down
```

---

## 🔐 Security Settings

### Firewall Rules

Navigate to: **Security → WAF**

**Recommended Rules**:

1. **Block Common Threats**
   - Threat Score > 14 → Block
   - Known Bots → Challenge
   - SQL Injection Attempts → Block

2. **Rate Limiting** (optional)
   ```
   Path: /api/*
   Rate: 100 requests per minute per IP
   Action: Challenge
   ```

3. **Geo-Blocking** (if needed)
   ```
   Country NOT IN [US, CA, EU countries] → Challenge
   ```

### Security Level

Navigate to: **Security → Settings**

```yaml
Security Level: Medium
  ↳ Balances security and usability

Challenge Passage: 30 minutes
  ↳ How long a passed challenge lasts

Browser Integrity Check: ON
  ↳ Blocks known malicious browsers
```

---

## 📊 Analytics & Monitoring

### Enable Analytics

Navigate to: **Analytics → Traffic**

Monitor:
- Requests per second
- Bandwidth usage
- Status code distribution (200, 404, 500, etc.)
- Top countries/IPs
- Cache hit ratio

### Create Alerts (Optional)

Navigate to: **Alerts**

**Suggested Alerts**:

1. **High Error Rate**
   ```
   Metric: HTTP 5xx errors
   Threshold: > 10% of requests
   Alert: Email
   ```

2. **Traffic Spike**
   ```
   Metric: Requests per minute
   Threshold: > 1000 (adjust as needed)
   Alert: Email
   ```

3. **SSL Certificate Expiry**
   ```
   Metric: Days until expiry
   Threshold: < 30 days
   Alert: Email
   ```

---

## 🧪 Testing DNS Configuration

### Verify DNS Resolution

```bash
# Test each subdomain
dig core.blackroad.systems
dig api.blackroad.systems
dig prism.blackroad.systems
dig operator.blackroad.systems
dig docs.blackroad.systems

# Should return CNAME → Railway URL
# Should NOT return A or AAAA records (Cloudflare handles that)
```

### Verify HTTPS/SSL

```bash
# Test SSL certificate
openssl s_client -connect api.blackroad.systems:443 -servername api.blackroad.systems

# Should show:
# - Cloudflare certificate
# - TLS 1.2 or 1.3
# - Valid certificate chain
```

### Verify Service Connectivity

```bash
# Test each service
curl -I https://core.blackroad.systems/health
curl -I https://api.blackroad.systems/health
curl -I https://prism.blackroad.systems/health
curl -I https://operator.blackroad.systems/health

# Expected: HTTP/2 200 OK
```

### Verify Proxy Headers

```bash
# Check Cloudflare headers
curl -I https://api.blackroad.systems/health | grep -i cf-

# Should include:
# cf-ray: <unique-id>
# cf-cache-status: DYNAMIC or HIT
# server: cloudflare
```

---

## 🔄 DNS Propagation

### Expected Propagation Time

- **Cloudflare → Edge Servers**: ~1-5 minutes
- **Global DNS**: ~1-24 hours (usually < 1 hour)

### Check Propagation Status

```bash
# Use multiple DNS servers
dig @1.1.1.1 api.blackroad.systems  # Cloudflare DNS
dig @8.8.8.8 api.blackroad.systems  # Google DNS
dig @8.8.4.4 api.blackroad.systems  # Google DNS (alternate)

# Or use online tool
open https://dnschecker.org
```

---

## 🛠️ Maintenance Tasks

### Weekly

- [ ] Review analytics for anomalies
- [ ] Check cache hit ratio (should be > 80% for static content)
- [ ] Review error logs

### Monthly

- [ ] Update firewall rules based on threat patterns
- [ ] Review and optimize caching rules
- [ ] Check SSL certificate status
- [ ] Audit security settings

### Quarterly

- [ ] Full security audit
- [ ] Review and update rate limiting
- [ ] Optimize page rules for performance
- [ ] Test disaster recovery (Always Online)

---

## 🚨 Troubleshooting

### DNS Not Resolving

**Symptom**: `dig` returns NXDOMAIN or no results

**Solutions**:
1. Verify record exists in Cloudflare DNS dashboard
2. Check record type is CNAME (not A)
3. Ensure proxy status is ON (orange cloud)
4. Wait 5-10 minutes for propagation
5. Flush local DNS cache: `sudo dscacheutil -flushcache` (macOS)

### SSL Certificate Errors

**Symptom**: Browser shows "Not Secure" or certificate warning

**Solutions**:
1. Verify SSL/TLS mode is "Full" (not "Off" or "Flexible")
2. Check Cloudflare SSL certificate is active
3. Ensure "Always Use HTTPS" is ON
4. Wait for certificate provisioning (can take up to 24 hours)

### 502 Bad Gateway

**Symptom**: Cloudflare shows 502 error

**Solutions**:
1. Verify Railway service is running: `railway status`
2. Check Railway logs: `railway logs`
3. Verify target URL is correct in Cloudflare DNS
4. Test direct Railway URL: `curl https://blackroad-os-core-production.up.railway.app/health`
5. Check Railway service health endpoint returns 200

### 521 Origin Down

**Symptom**: Cloudflare shows "Web server is down"

**Solutions**:
1. Check Railway service status
2. Verify health endpoint works directly
3. Check Railway deployment logs
4. Ensure service is not sleeping (Railway free tier)

### CORS Errors

**Symptom**: Browser console shows CORS errors

**Solutions**:
1. Verify `ALLOWED_ORIGINS` includes requesting domain
2. Check service CORS middleware configuration
3. Test CORS headers with curl:
   ```bash
   curl -H "Origin: https://prism.blackroad.systems" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://api.blackroad.systems/health
   ```

---

## 📚 Additional Resources

- **Cloudflare DNS Docs**: https://developers.cloudflare.com/dns
- **Cloudflare SSL/TLS Docs**: https://developers.cloudflare.com/ssl
- **Railway Custom Domains**: https://docs.railway.app/deploy/custom-domains
- **Cloudflare Analytics**: https://developers.cloudflare.com/analytics

---

## ✅ Verification Checklist

- [ ] All 7 DNS records created in Cloudflare
- [ ] All records have Proxy Status = ON (orange cloud)
- [ ] SSL/TLS mode set to "Full"
- [ ] Always Use HTTPS = ON
- [ ] Auto Minify enabled for HTML, CSS, JS
- [ ] DNS propagation complete (dig test passes)
- [ ] All services accessible via HTTPS
- [ ] No SSL certificate warnings
- [ ] Health endpoints return 200 OK
- [ ] Prism Console /status page shows all green

---

**CLOUDFLARE DNS CONFIGURATION COMPLETE**

DNS fully wired. All services accessible via Cloudflare CDN.

**End of Cloudflare DNS Configuration**
