# Manual DNS Update Guide - FAST TRACK

**Goal:** Get all 26 BlackRoad domains showing "Hello from Pi" banner

**Time needed:** 15-20 minutes

---

## The One Thing You Need

**CNAME Target:** `90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com`

Copy this - you'll paste it 26 times.

---

## Quick Process (Per Zone)

1. Go to https://dash.cloudflare.com/
2. Click zone (e.g., "blackroad.io")
3. Click **DNS** → **Records**
4. For each subdomain (console, app, os, desktop):
   - Find existing record (or click **Add record**)
   - **Type:** CNAME
   - **Name:** subdomain (e.g., "console")
   - **Target:** `90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com`
   - **Proxy status:** ☁️ Proxied (orange cloud)
   - **TTL:** Auto
   - Click **Save**

---

## All 9 Zones to Update

### 1. blackroad.io
- [ ] console.blackroad.io
- [ ] app.blackroad.io
- [ ] os.blackroad.io
- [ ] desktop.blackroad.io

### 2. blackroad.systems
- [ ] console.blackroad.systems
- [ ] os.blackroad.systems
- [ ] desktop.blackroad.systems

### 3. blackroad.me
- [ ] console.blackroad.me
- [ ] os.blackroad.me
- [ ] desktop.blackroad.me

### 4. blackroad.network
- [ ] console.blackroad.network
- [ ] os.blackroad.network
- [ ] desktop.blackroad.network

### 5. blackroadai.com
- [ ] console.blackroadai.com
- [ ] os.blackroadai.com
- [ ] desktop.blackroadai.com

### 6. blackroadquantum.com
- [ ] console.blackroadquantum.com
- [ ] os.blackroadquantum.com
- [ ] desktop.blackroadquantum.com

### 7. lucidia.studio
- [ ] console.lucidia.studio
- [ ] os.lucidia.studio
- [ ] desktop.lucidia.studio

### 8. lucidia.earth
- [ ] console.lucidia.earth
- [ ] os.lucidia.earth
- [ ] desktop.lucidia.earth

### 9. blackroadinc.us
- [ ] blackroadinc.us (root domain)

---

## Test After Each Zone

After updating a zone, immediately test:

```bash
curl -s https://console.blackroad.io/ | grep "HELLO FROM PI"
```

If you see the banner text, it's working! ✅

---

## Full Test After All Updates

```bash
cd ~/blackroad-console-deploy
./test-all-domains.sh
```

Should show:
```
✅ Working from Pi: 26
```

---

## Screenshots (What It Should Look Like)

### Adding/Editing a CNAME Record

```
Type: CNAME
Name: console
Target: 90ad32b8-d87b-42ac-9755-9adb952bb78a.cfargotunnel.com
Proxy status: ☁️ Proxied
TTL: Auto
```

### Important Notes

- **Delete old records first** if there's an existing A record or Pages CNAME
- **Keep proxy enabled** (orange cloud ☁️) for Cloudflare protection
- **DNS propagates fast** - usually works within 1-2 minutes

---

## Priority Order

Start with these zones (your main branding):

1. **blackroad.io** (currently broken with 500 errors)
2. **lucidia.earth** (your Lucidia branding)
3. **blackroad.systems** (company domain)

Then do the rest.

---

## Verification

After each domain update:

**Browser test:**
- Open https://console.blackroad.io/
- Should see: "🥧 HELLO FROM PI → Lucidia @ 192.168.4.38 → Cloudflare Tunnel Active" at the top
- Should see: BlackRoad OS Console interface

**Command line test:**
```bash
curl -I https://console.blackroad.io/
# Should return: HTTP/2 200

curl -s https://console.blackroad.io/ | head -20 | grep -i "hello from pi"
# Should match the banner
```

---

## If You Get Stuck

**Still seeing 500 errors?**
- Wait 2-3 minutes for DNS propagation
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check in incognito mode

**Still seeing 403 errors?**
- Verify tunnel is running on Pi:
  ```bash
  ssh pi@192.168.4.38 'sudo systemctl status cloudflared'
  ```
- Should show "active (running)"

**DNS not updating?**
- Make sure you clicked "Save" after each change
- Check you selected "Proxied" (orange cloud)
- Try DNS flush: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` (Mac)

---

## Time Estimate

- Per record: ~30 seconds
- 26 records = ~13 minutes
- Testing: 2-5 minutes
- **Total: 15-20 minutes**

---

**Once you start, I can test domains in real-time and give you immediate feedback!**

Just let me know when you've updated a zone and I'll test it right away.
