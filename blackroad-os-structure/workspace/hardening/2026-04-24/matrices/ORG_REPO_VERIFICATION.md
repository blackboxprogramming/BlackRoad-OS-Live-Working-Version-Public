# Org/Repo Verification Matrix

| Org/Repo | Local Path | Purpose | Build/Deploy Path | Status | Notes |
|---------|------------|---------|-------------------|--------|------|

| Vercel Project `roadchain` (`prj_VS452o7ObLA4O1L0YM0zAAr5nAVt`) | `/Applications/BlackRoad/BlackRoadOS/workspace/apps/roadchain` | RoadChain surface | `vercel deploy --prod` (scope `alexa-amundsons-projects`) | working | Production deployed; domain now serves valid TLS + `200` |
| Cloudflare Worker `oneway-blackroad` | `/Applications/BlackRoad/apps/oneway-blackroad` | OneWay surface | `npx wrangler deploy` | needs-review | Live route responds, but local source directory is currently empty; restore worker source for repeatable deploys |
| Cloudflare Worker `blackroad-grayscale` | `/Applications/BlackRoadOSInc/cloudflare-worker-home` | Shared grayscale home/atlas/archive router | `npx wrangler deploy -c wrangler.blackroad-grayscale.toml` | working | Deployed 2026-04-24; `/home/` now domain-aware via site registry; preserves `/atlas` + `/archive` |
| GitHub org list (account `blackboxprogramming`) | n/a | Ecosystem org inventory | `gh api user/orgs --paginate` | working | Retrieved ~50+ orgs (see notes in `INVENTORY.md`) |
