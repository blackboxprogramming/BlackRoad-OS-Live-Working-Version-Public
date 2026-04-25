# Blocker Log

| Blocker ID | Area | Description | Exact Failure | Dependency | Owner/Scope | Next Action |
|-----------|------|-------------|---------------|------------|-------------|------------|

| BR-SSL-001 | TLS | `roadchain.blackroad.io` certificate expired | **Resolved 2026-04-21**: now serves `CN=roadchain.blackroad.io` (LE R13) and returns `HTTP/2 200` | Vercel deploy | Vercel project `roadchain` | Keep monitoring expiry; ensure domain remains attached to the intended project |
| BR-SSL-002 | Routing | Agent subdomains `*.blackroad.me` intermittently returned `522` and did not route consistently | **No longer reproducing 2026-04-24**: `lyra.blackroad.me/` and `sapphira.blackroad.me/` return `302 Location: /home/`; `/home/` returns `200` with `x-blackroad-worker: home` | Cloudflare routing/edge behavior | Cloudflare zone `blackroad.me` | Keep monitoring for recurrence; if `522` returns, capture `cf-ray` + specific host and time |
| BR-VIS-001 | Visual QA | Headless browser rendering blocked by Cloudflare on `*.blackroad.io` products | Playwright screenshot of `https://oneway.blackroad.io/` returns “Sorry, you have been blocked” page, while `curl` returns `200` HTML | Cloudflare WAF / Bot Fight Mode | Cloudflare zone `blackroad.io` | Either (a) perform manual browser QA and capture screenshot, or (b) allowlist/adjust bot rules for synthetic monitoring |

| BR-AGENT-001 | Agents | Agent subdomains route and identify, but behavior is still mostly stubbed | `https://<agent>.blackroad.me/` → `302 /home/` → `200` with agent-specific title + heading (derived from subdomain) | Agent app wiring | `*.blackroad.me` surfaces | Next: add real agent actions (auth/chat) or explicit “not yet wired” API endpoints per agent |

| BR-DOMAIN-001 | Domains | Many root domains were routing to a shared home surface, losing product identity | **Resolved 2026-04-24**: `/home/` now renders domain-aware BlackRoad base surfaces (title/headline/subhead vary by domain) while preserving `/atlas` + `/archive` | `blackroad-grayscale` Worker update | root domains list | Keep monitoring for regression; add per-domain deep links as real features come online |
