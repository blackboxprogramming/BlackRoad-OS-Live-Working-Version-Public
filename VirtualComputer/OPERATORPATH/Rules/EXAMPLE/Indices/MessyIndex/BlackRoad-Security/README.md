# BlackRoad Security

> Department of Security and Identity
> Agent: Nyx -- "Security is not a feature, it is a promise."
> BlackRoad OS, Inc. | Last updated: 2026-04-11

---

## Security Architecture

### Layer 1: Cloudflare Edge
- 20 domains behind Cloudflare
- DDoS protection, SSL termination
- Bot Fight Mode (enable in dashboard)

### Layer 2: BlackRoad Security Worker
Deployed 2026-04-10. Protects 13 domains.

**Capabilities:**
- Rate limiting: 100 requests/min per IP. 500+ = hard block.
- Bad bot blocking: 30+ attack tools detected and blocked
- Honeypot paths: instant 403 on scanner targets
- Security headers on every response
- Branded 403 block page (BlackRoad Security, dark theme)

**Blocked Tools:**
sqlmap, nikto, masscan, nmap, dirbuster, gobuster, wpscan, nuclei, httpx, subfinder, ffuf, burpsuite, zap, acunetix, nessus, ahrefsbot, semrushbot, dotbot, mj12bot, blexbot, petalbot, bytespider, gptbot, claudebot, ccbot

**Honeypot Paths:**
/wp-admin, /wp-login, /wp-content, /.env, /.git, /config, /admin, /phpmyadmin, /xmlrpc.php, /debug, /actuator, /.aws, /cgi-bin, /shell

**Security Headers:**
- Strict-Transport-Security (HSTS)
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- X-Powered-By: BlackRoad OS

### Layer 3: Worker Middleware
Security middleware injected into blackroad-io and lucidia-sites workers. Same protections as the standalone security worker.

### Layer 4: Node Security
- SSH key-based authentication on all 7 Pis + 2 x64 nodes
- WireGuard encrypted VPN mesh between all nodes
- No password auth. Keys only.

### Layer 5: Memory Security
- HMAC signatures on journal entries
- Agent identity verification per session
- Hash-chained audit log (tamper-evident)
- Session registration via memory-security.sh

### Layer 6: Git Security
- SHA pinning enabled across GitHub enterprise
- 5 rulesets: branch protection, tag protection, sensitive file blocking, agent config, CODEOWNERS
- Gitea primary (self-hosted on Octavia), GitHub is mirror
- Custom proprietary license. Never MIT/open source.

### Layer 7: Mesh Security
- Meshtastic LoRa: PKC encryption enabled
- BLE pairing with PIN for Meshtastic app
- LoRa encryption keys rotate automatically

## Protected Domains

| Domain | Protection | Method |
|--------|-----------|--------|
| blackroad.network | Full | Security Worker |
| blackroad.company | Full | Security Worker |
| roadcoin.io | Full | Security Worker |
| blackroad.systems | Full | Security Worker |
| roadchain.io | Full | Security Worker |
| blackroad.me | Full | Security Worker |
| blackboxprogramming.io | Full | Security Worker |
| blackroadinc.us | Full | Security Worker |
| lucidiaqi.com | Full | Security Worker |
| aliceqi.com | Full | Security Worker |
| blackroadqi.com | Full | Security Worker |
| lucidia.earth | Full | Middleware |
| lucidia.studio | Full | Middleware |
| blackroad.io | Partial | Needs route fix |
| blackroadai.com | Partial | Needs middleware |
| blackroadquantum.com | Partial | Needs middleware |

## Threat Landscape (2026-04-10)

| Date | Threats Detected |
|------|-----------------|
| Apr 3 | 62 |
| Apr 6 | 5,891 |
| Apr 7 | 10,489 |
| Apr 8 | 10,009 |
| Apr 9 | 12,451 |
| Apr 10 | 106,244 |

Threat volume increased 1,714x in one week. Primary vectors: automated scanners, path traversal, bot swarms.

## Source

Security worker: `~/blackroad-security-worker/`
Middleware: exported as `withSecurity()` from `src/worker.js`
