# System Inventory (Initial)

This file tracks what is **real / partial / broken / missing / duplicated / blocked**.

## Filesystem roots

- `/Applications/BlackRoad` — present (canonical ecosystem root).
- `/Applications/BlackRoad/BlackRoadOS` — present (workspace + hardening logs live here).
- `/Applications/BlackRoad/BlackRoadOS/workspace` — present (apps + hardening artifacts).
- `/Applications/BlackRoadOS` — present but **not** the active workspace root (contains `search_dock.html` only).
- `/Applications/BlackRoadOS/workspace` — **missing** (do not rely on this path; use `/Applications/BlackRoad/BlackRoadOS/workspace`).
- `/Applications/BlackRoadOSInc/cloudflare-worker-home` — present (Cloudflare Worker project powering `/home/` for many root domains).
- `/Applications/BlackRoad/Index.md.rtf` — present (source for numbered focus areas; exported to `hardening/2026-04-24/Index.md.txt`).

## GitHub orgs (authenticated)

Pulled via `gh api user/orgs --paginate` (account `blackboxprogramming`):

- `BlackRoad-OS`, `BlackRoadOS`, `BlackRoad-Products`, `BlackRoad-Agents`, `BlackRoad-Memory`, `BlackRoad-Codex`, `BlackRoad-Network`, `BlackRoad-Studio`, `Blackbox-Enterprises`, plus many more.
- Full list captured in `matrices/ORG_REPO_VERIFICATION.md` notes.

## Live surfaces (quick truth)

- Root domains list (e.g. `blackroad.io`, `blackroad.company`, `roadchain.io`, `roadcoin.io`, etc.) → `/` redirects to `/home/` and renders `200` with `x-blackroad-worker: home` (Cloudflare Worker).
- `os.blackroad.io` renders a black-and-white base surface, but does **not** expose shared JSON registry endpoints (`/api/products`, `/api/sites`) (see `BLOCKERS.md`).
- `roadtrip.blackroad.io` renders, but `GET /api/products` + `/api/sites` fail with a Cloudflare D1 schema error (`visibility` column missing) (see `BLOCKERS.md`).

## Next

- Populate matrices under `matrices/`
- Record blockers under `BLOCKERS.md`
