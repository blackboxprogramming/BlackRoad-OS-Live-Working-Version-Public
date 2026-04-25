# Cloudflare DNS Setup for Pi Tunnel

## Tunnel Information

**Tunnel ID:** `90ad32b8-d87b-42ac-9755-9adb952bb78a`
**Tunnel Name:** `blackroad-tunnel`
**CNAME Target:** `90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com`
**Status:** Active with 4 connections (ord02, ord06, ord08, ord11)

## Current Tunnel Configuration

The tunnel on Lucidia Pi is configured to serve these domains:
- console.blackroad.io
- **app.blackroad.io** (newly added)
- os.blackroad.io
- desktop.blackroad.io
- console.blackroad.systems
- os.blackroad.systems
- desktop.blackroad.systems
- console.blackroad.me
- os.blackroad.me
- desktop.blackroad.me
- console.blackroad.network
- os.blackroad.network
- desktop.blackroad.network
- console.blackroadai.com
- os.blackroadai.com
- desktop.blackroadai.com
- console.blackroadquantum.com
- os.blackroadquantum.com
- desktop.blackroadquantum.com
- console.lucidia.studio
- os.lucidia.studio
- desktop.lucidia.studio
- console.lucidia.earth
- os.lucidia.earth
- desktop.lucidia.earth
- blackroadinc.us

All are configured to route to `http://localhost:80` (Caddy reverse proxy on the Pi).

## DNS Records to Update

For each domain listed above, you need to:

### 1. Log into Cloudflare Dashboard
https://dash.cloudflare.com/

### 2. Select the appropriate zone
- blackroad.io
- blackroad.systems
- blackroad.me
- blackroad.network
- blackroadai.com
- blackroadquantum.com
- lucidia.studio
- lucidia.earth
- blackroadinc.us

### 3. Go to DNS → Records

### 4. For each subdomain, either create or update the record:

**Record Type:** CNAME
**Name:** `console` (or `app`, `os`, `desktop`)
**Target:** `90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com`
**Proxy status:** Proxied (orange cloud) ✅
**TTL:** Auto

**Example for console.blackroad.io:**
```
Type: CNAME
Name: console
Target: 90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com
Proxied: Yes (orange cloud)
```

**Example for app.blackroad.io:**
```
Type: CNAME
Name: app
Target: 90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com
Proxied: Yes (orange cloud)
```

### 5. Delete any conflicting records
- If there's an existing A record or CNAME pointing to Pages (172.67.211.99, 104.21.91.74), delete it
- The tunnel CNAME will replace it

## Quick Copy-Paste Values

**CNAME Target (use this for all domains):**
```
90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com
```

## Verification After DNS Update

After updating DNS records, test each domain:

```bash
# Test DNS resolution
dig console.blackroad.io +short
# Should show Cloudflare IPs (104.x.x.x or 172.x.x.x)

# Test HTTPS access
curl -I https://console.blackroad.io/
# Should return HTTP/2 200 with the Pi banner

# In browser
# Should see: "🥧 HELLO FROM PI → Lucidia @ 192.168.4.38 → Cloudflare Tunnel Active"
```

## Domains Organized by Zone

### blackroad.io
- [ ] console.blackroad.io
- [ ] app.blackroad.io
- [ ] os.blackroad.io
- [ ] desktop.blackroad.io

### blackroad.systems
- [ ] console.blackroad.systems
- [ ] os.blackroad.systems
- [ ] desktop.blackroad.systems

### blackroad.me
- [ ] console.blackroad.me
- [ ] os.blackroad.me
- [ ] desktop.blackroad.me

### blackroad.network
- [ ] console.blackroad.network
- [ ] os.blackroad.network
- [ ] desktop.blackroad.network

### blackroadai.com
- [ ] console.blackroadai.com
- [ ] os.blackroadai.com
- [ ] desktop.blackroadai.com

### blackroadquantum.com
- [ ] console.blackroadquantum.com
- [ ] os.blackroadquantum.com
- [ ] desktop.blackroadquantum.com

### lucidia.studio
- [ ] console.lucidia.studio
- [ ] os.lucidia.studio
- [ ] desktop.lucidia.studio

### lucidia.earth
- [ ] console.lucidia.earth
- [ ] os.lucidia.earth
- [ ] desktop.lucidia.earth

### blackroadinc.us
- [ ] blackroadinc.us (root domain)

## Testing Script

Once DNS is updated, run this to test all domains:

```bash
#!/bin/bash
# Save as test-all-domains.sh

DOMAINS=(
  "console.blackroad.io"
  "app.blackroad.io"
  "os.blackroad.io"
  "desktop.blackroad.io"
  "console.blackroad.systems"
  "os.blackroad.systems"
  "desktop.blackroad.systems"
  "console.blackroad.me"
  "os.blackroad.me"
  "desktop.blackroad.me"
  "console.blackroad.network"
  "os.blackroad.network"
  "desktop.blackroad.network"
  "console.blackroadai.com"
  "os.blackroadai.com"
  "desktop.blackroadai.com"
  "console.blackroadquantum.com"
  "os.blackroadquantum.com"
  "desktop.blackroadquantum.com"
  "console.lucidia.studio"
  "os.lucidia.studio"
  "desktop.lucidia.studio"
  "console.lucidia.earth"
  "os.lucidia.earth"
  "desktop.lucidia.earth"
  "blackroadinc.us"
)

echo "Testing all BlackRoad domains..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for domain in "${DOMAINS[@]}"; do
  echo -n "Testing $domain... "
  status=$(curl -s -o /dev/null -w "%{http_code}" https://$domain/ --connect-timeout 5 --max-time 10)
  if [[ "$status" == "200" ]]; then
    # Check for Pi banner
    if curl -s https://$domain/ | grep -q "HELLO FROM PI"; then
      echo "✅ OK (Pi banner detected)"
    else
      echo "⚠️  200 but no Pi banner"
    fi
  else
    echo "❌ HTTP $status"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Alternative: Using Cloudflare API

If you prefer to update DNS via API, here's a script template:

```bash
#!/bin/bash
# Requires: CLOUDFLARE_API_TOKEN env variable

TUNNEL_TARGET="90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com"
ZONE_ID="<your-zone-id>"  # Get from Cloudflare dashboard

# Example: Update console.blackroad.io
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/<record-id>" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "console",
    "content": "'$TUNNEL_TARGET'",
    "proxied": true,
    "ttl": 1
  }'
```

## Troubleshooting

### Domain still shows 500 error
- DNS hasn't propagated yet (can take up to 48 hours, usually < 5 minutes)
- Check `dig <domain> +short` to verify CNAME is updated
- Clear browser cache / try incognito mode

### Domain shows different content
- Old Cloudflare Pages deployment is still active
- Go to Workers & Pages → delete the old deployment
- Or change DNS record to tunnel CNAME

### Tunnel not connected
```bash
ssh pi@192.168.4.38 'sudo systemctl status cloudflared'
# Should show "active (running)"

ssh pi@192.168.4.38 'cloudflared tunnel info blackroad-tunnel'
# Should show 4 active connections
```

### Console not loading on Pi
```bash
# Test locally first
curl http://192.168.4.38/
# Should return HTML with Pi banner

# Check Docker containers
ssh pi@192.168.4.38 'cd ~/blackroad-console && docker compose ps'
# All should be Up and healthy
```

---

**Last Updated:** December 21, 2025
**Tunnel Status:** Active ✅
**Console Status:** Deployed ✅
**DNS Update Status:** Pending manual update in Cloudflare dashboard
