# [MEMORY] — 2026-04-24

- Single source-of-truth registries now exist in `cloudflare-worker-home`:
  - Products: `GET /api/products`
  - Sites/domains: `GET /api/sites`
- Root domains listed in the mission now route to the same black/white `/home/` surface and can derive domain identity from `/api/sites`.
- Visual QA is still partially blocked by Cloudflare WAF for headless tools; record manual QA when completed.

References:
- `BLOCKERS.md`
- `matrices/DOMAIN_VERIFICATION.md`
- `matrices/PRODUCT_STATUS.md`
