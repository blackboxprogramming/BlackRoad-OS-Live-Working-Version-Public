# Domain Verification Matrix

| Domain | DNS/Route | TLS | Render | Target Product | Status | Notes |
|-------|-----------|-----|--------|----------------|--------|------|

| roadchain.blackroad.io | CNAME to `12ced729a06297dd.vercel-dns-017.com` (Vercel) | OK (LE R13, `notAfter=2026-07-21`) | `200` (Vercel) | RoadChain | working | Deployed minimal production surface; TLS renewed after deployment |
| oneway.blackroad.io | Cloudflare proxied A (Cloudflare IPs) + Worker route | OK | `200` (HTML) + `/health` -> `ok` | OneWay | partial | Worker now serves minimal surface; headless browser screenshot is blocked by Cloudflare |

| blackroad.io | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Root | working | **2026-04-24**: renders “BlackRoad Home | Sovereign Search, Agents, Products, and Archive” (home surface) |
| blackroad.company | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Corporate | working | **2026-04-24**: “BlackRoad OS, Inc. — BlackRoad” |
| blackroad.me | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Identity | working | **2026-04-24**: “BlackRoad Me — BlackRoad” |
| blackroad.network | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Infra | working | **2026-04-24**: “BlackRoad Network — BlackRoad” |
| blackroad.systems | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Fleet | working | **2026-04-24**: “BlackRoad Systems — BlackRoad” |
| blackroadai.com | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | AI | working | **2026-04-24**: “BlackRoad AI — BlackRoad” |
| blackroadinc.us | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Corp | working | **2026-04-24**: “BlackRoad Inc. — BlackRoad” |
| blackroadqi.com | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | QI | working | **2026-04-24**: “BlackRoad QI — BlackRoad” |
| blackroadquantum.com | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Quantum | working | **2026-04-24**: “BlackRoad Quantum — BlackRoad” |
| blackroadquantum.info | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Quantum Docs | working | **2026-04-24**: “BlackRoad Quantum Docs — BlackRoad” |
| blackroadquantum.net | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Quantum Net | working | **2026-04-24**: “BlackRoad Quantum Network — BlackRoad” |
| blackroadquantum.shop | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Quantum Shop | working | **2026-04-24**: “BlackRoad Quantum Shop — BlackRoad” |
| blackroadquantum.store | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Quantum Store | working | **2026-04-24**: “BlackRoad Quantum Store — BlackRoad” |
| blackboxprogramming.io | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | BlackBox | working | **2026-04-24**: “BlackBox Programming — BlackRoad” |
| aliceqi.com | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Alice | working | **2026-04-24**: “Alice — BlackRoad” |
| lucidia.earth | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Lucidia | working | **2026-04-24**: “Lucidia — BlackRoad” |
| lucidia.studio | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Lucidia Studio | working | **2026-04-24**: “Lucidia Studio — BlackRoad” |
| lucidiaqi.com | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | Lucidia QI | working | **2026-04-24**: “Lucidia QI — BlackRoad” |
| roadchain.io | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | RoadChain | working | **2026-04-24**: “RoadChain — BlackRoad” |
| roadcoin.io | Cloudflare proxied A | OK | `/` → `302 /home/` → `200` | RoadCoin | working | **2026-04-24**: “RoadCoin — BlackRoad” |

| roadtrip.blackroad.io | Cloudflare Worker route (`blackroad-grayscale`) | OK | `/` → `302 /home/apps/RoadTrip/` → `200` | RoadTrip | partial | **2026-04-24**: fixed broken `/api/*` by routing RoadTrip domain to registry-backed Worker APIs; real app still pending |

**2026-04-24 verification update**

- Unified `blackroad-grayscale` Worker routes now attach to the full root-domain set (including `.../api/*`), so `/api/health` returns `x-blackroad-rev: 2026-04-24a` and `/api/sites` returns the expanded registry (21 domains) across the listed root domains.
