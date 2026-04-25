# Commit Continuity Log

For each meaningful change, record:
- what changed
- what was verified (routes, integrations)
- what is still blocked
- whether visual QA + screenshot review was performed
- links/paths to the updated artifacts:
  - [MEMORY] [CODEX] [PRODUCTS] [BRTODO] [TODO] [COLLAB] [ROADTRIP]

## Entries

- 2026-04-21 — Initialized hardening workspace and claimed focus area 2894.
- 2026-04-21 — Verified RoadChain TLS + origin state.
  - Verified:
    - `roadchain.blackroad.io` serves **expired** `*.blackroad.io` cert (`notAfter=2026-01-15`) and fails TLS validation.
    - With TLS verification disabled (`curl -k`), origin responds `HTTP/2 404` with `server: Vercel` and `x-vercel-error: DEPLOYMENT_NOT_FOUND`.
    - Vercel project `roadchain` exists but has **no deployments** and **no domains**.
  - Recorded:
    - Domain/Product matrices updated
    - Blockers `BR-SSL-001`, `BR-SSL-002` created

- 2026-04-21 — Fixed RoadChain certificate + deployment and performed visual QA.
  - Change:
    - Created and deployed a minimal RoadChain surface from `/Applications/BlackRoadOS/workspace/apps/roadchain`.
  - Verified:
    - TLS now valid: `CN=roadchain.blackroad.io`, `notAfter=Jul 21 02:28:02 2026 GMT`
    - `https://roadchain.blackroad.io/` returns `HTTP/2 200`
    - Visual QA screenshot captured + reviewed:
      - `/Applications/BlackRoadOS/workspace/hardening/2026-04-21/roadchain.blackroad.io.png`
  - Still blocked:
    - `BR-SSL-002` (`*.blackroad.me` routing/522) pending Cloudflare-side changes

- 2026-04-21 — Restored OneWay route with an honest surface (Cloudflare Worker).
  - Change:
    - Deployed Worker `oneway-blackroad` for `oneway.blackroad.io/*` (source path later needs reconciliation).
  - Verified:
    - `https://oneway.blackroad.io/` returns `HTTP/2 200` with `x-br-surface: oneway.blackroad.io v0`
    - `https://oneway.blackroad.io/health` returns `ok`
  - Visual QA:
    - Automated screenshot blocked by Cloudflare (see `BR-VIS-001`), needs manual screenshot review.

- 2026-04-24 — Re-verified agent subdomains under `*.blackroad.me` and updated matrices/blockers.
  - Verified:
    - `https://lyra.blackroad.me/` and `https://sapphira.blackroad.me/` return `302 Location: /home/`
    - `https://<agent>.blackroad.me/home/` returns `200` with `x-blackroad-worker: home` and `x-blackroad-grayscale: 1`
  - Recorded:
    - Updated `matrices/AGENT_STATUS.md`
    - Updated `BLOCKERS.md` (`BR-SSL-002` marked not reproducing; new `BR-AGENT-001`)
    - Corrected local path note in `matrices/ORG_REPO_VERIFICATION.md` for `oneway-blackroad`

- 2026-04-24 — Deployed domain/agent-aware `/home/` rendering for `blackroad-grayscale`.
  - Change:
    - Updated `/Applications/BlackRoadOSInc/cloudflare-worker-home/src/index.ts` to render a domain-aware (and agent-aware) black/white base surface at `/home/`.
    - Deployed with: `cd /Applications/BlackRoadOSInc/cloudflare-worker-home && npx wrangler deploy -c wrangler.blackroad-grayscale.toml`
  - Verified:
    - `https://blackroad.company/` → `302 /home/` → title “BlackRoad OS, Inc. — BlackRoad”
    - `https://lyra.blackroad.me/home/` → title “Lyra — BlackRoad Agent”
  - Visual QA:
    - Screenshots captured + reviewed:
      - `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/output/playwright/blackroad.company-home-2026-04-24.png`
      - `/Applications/BlackRoad/BlackRoadOS/workspace/hardening/2026-04-21/output/playwright/lyra.blackroad.me-home-2026-04-24.png`
