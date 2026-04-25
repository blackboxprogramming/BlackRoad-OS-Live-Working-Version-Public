# [CODEX] — 2026-04-24

Deployed `blackroad-grayscale` Worker with unified routes:

- `npx wrangler deploy -c wrangler.blackroad-grayscale.toml --routes <domain>/* <domain>/api/* ...`

Verification:

- `curl -I https://blackroad.io/api/health` → `x-blackroad-rev: 2026-04-24a`
- `curl https://blackroad.io/api/sites` → 21 site entries (registry expanded)
