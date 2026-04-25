# Visual QA Log

| Date | Surface | Change | Screenshot Path | Reviewed | Notes |
|------|---------|--------|-----------------|----------|------|

| 2026-04-21 | `roadchain.blackroad.io` | Created minimal RoadChain surface (black/white base CSS) | `/Applications/BlackRoadOS/workspace/hardening/2026-04-21/roadchain.blackroad.io.png` | yes | Layout, contrast, and nav look coherent at 1280×720 |
| 2026-04-21 | `oneway.blackroad.io` | Deployed minimal OneWay surface (black/white base CSS) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/oneway.blackroad.io.png` | no | Screenshot capture via Playwright was blocked by Cloudflare; manual QA needed |

| 2026-04-21 | `blackroad.company` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/blackroad.company.png` | yes | Clean black/white surface; nav present |
| 2026-04-21 | `blackroad.me` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/blackroad.me.png` | yes | Clean black/white surface; primary CTA visible |
| 2026-04-21 | `blackroadai.com` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/blackroadai.com.png` | yes | Clean black/white surface; primary CTA visible |
| 2026-04-21 | `blackboxprogramming.io` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/blackboxprogramming.io.png` | yes | Clean black/white surface; primary CTA visible |
| 2026-04-21 | `lucidia.earth` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/lucidia.earth.png` | yes | Clean black/white surface; primary CTA visible |
| 2026-04-21 | `blackroadquantum.com` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/blackroadquantum.com.png` | yes | Clean black/white surface; primary CTA visible |
| 2026-04-21 | `roadchain.io` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/roadchain.io.png` | yes | Clean black/white surface; primary CTA visible |
| 2026-04-21 | `roadcoin.io` | Verified render (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/roadcoin.io.png` | yes | Clean black/white surface; primary CTA visible |
| 2026-04-21 | `blackroad.io` | Visual QA attempt (no changes) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/blackroad.io.png` | no | Cloudflare blocked Playwright (“Sorry, you have been blocked”) while `curl` returns 200 |

| 2026-04-24 | `blackroad.company/home/` | Updated `/home/` to domain-aware BlackRoad base surface (via `blackroad-grayscale` Worker deploy) | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/output/playwright/blackroad.company-home-2026-04-24.png` | yes | Layout/spacing/nav/actions verified via WebKit Playwright CLI |
| 2026-04-24 | `lyra.blackroad.me/home/` | Updated agent `/home/` to display agent identity derived from subdomain | `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/output/playwright/lyra.blackroad.me-home-2026-04-24.png` | yes | Layout/spacing/nav/actions verified via WebKit Playwright CLI |
