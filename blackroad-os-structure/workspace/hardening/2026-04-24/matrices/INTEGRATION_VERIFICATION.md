# Integration Verification Matrix

| Integration | Intended Use | Config Found | Test Path | Result | Status | Notes |
|------------|--------------|--------------|-----------|--------|--------|------|

| GitHub (`gh`) | Org/repo management + automation | Yes (local keyring auth) | `gh auth status` | Logged in as `blackboxprogramming` | working | Token scopes include `admin:org`, `repo`, `workflow` |
| Cloudflare (Home Worker) | Shared `/home/` surface for many domains | Yes (`/Applications/BlackRoadOSInc/cloudflare-worker-home`) | `curl -I https://blackroad.io/home/` | `200` + `x-blackroad-worker: home` | working | Headless screenshot blocked by Cloudflare WAF on some hosts; manual QA needed |
| Vercel (RoadChain) | RoadChain product surface | Partial (local path present) | `curl -I https://roadchain.blackroad.io/` | `200` + valid TLS | working | Deployed via Vercel; deeper features pending |
