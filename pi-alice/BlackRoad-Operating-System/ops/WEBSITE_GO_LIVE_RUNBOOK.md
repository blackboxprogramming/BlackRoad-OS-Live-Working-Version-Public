# Website Go-Live Runbook Across All Domains

This runbook provides a step-by-step checklist to bring every BlackRoad-owned domain online with the correct website and SSL settings. Use it when activating or restoring service availability.

## Prerequisites
- Cloudflare access with permissions to manage DNS and SSL settings for all zones.
- Railway and Vercel access for service URLs listed in `CLOUDFLARE_DNS_BLUEPRINT.md`.
- Latest deployments of relevant repositories (e.g., `blackroad.io`, `blackroad-prism-console`, `blackroad-os-core`).
- Health checks for each Railway service are green.

## Global Activation Steps
1. **Confirm DNS Zones**
   - Verify each domain is present in Cloudflare and nameservers are set to Cloudflare at the registrar.
   - Confirm SSL mode is **Full (strict)** and Universal SSL is enabled.

2. **Verify Origin Targets**
   - For Vercel sites, ensure the production deployment is healthy and the domain is added in Vercel.
   - For Railway services, ensure the `*-production.up.railway.app` endpoints are reachable and returning HTTP 200 on their health check paths.

3. **Apply DNS Records** (per domain below)
   - Create/verify CNAME records pointing to the correct Vercel or Railway target.
   - Enable the Cloudflare orange-cloud proxy unless a record is marked as ❌ (grey-cloud/off for internal services).
   - Set TTL to `Auto` unless otherwise noted.

4. **Propagation & Validation**
   - Use `dig +short <record>` to confirm resolution to the expected target.
   - Test HTTPS for each hostname; confirm valid certificates and no redirect loops.
   - Validate content matches the intended site (corporate, OS, docs, console, etc.).

5. **Post-Go-Live Monitoring**
   - Enable Cloudflare Analytics and set uptime checks per hostname.
   - Set status alerts for 4xx/5xx spikes and SSL errors.

## Domain Checklists
Follow these per-domain checklists to bring sites up.

### Primary Domains (Phase 1)
- **blackroad.systems**
  - `@` → `cname.vercel-dns.com` (proxy ✅) — corporate site (repo `blackroad.io`).
  - `www` → `blackroad.systems` (proxy ✅) — www redirect.
  - `os` → `blackroad-os-production.up.railway.app` (proxy ✅) — OS interface (repo `blackroad-os-core`).
  - `api` → `blackroad-api-production.up.railway.app` (proxy ✅) — API gateway.
  - `console` → `blackroad-prism-console.vercel.app` (proxy ✅) — Prism Console frontend (public UI).
  - `prism` → `blackroad-prism-console.vercel.app` (proxy ✅) — Prism Console (repo `blackroad-prism-console`).
  - `operator` → `blackroad-operator.up.railway.app` (proxy ❌) — internal operator (no proxy).
  - `lucidia` → `lucidia-api.up.railway.app` (proxy ✅) — Lucidia API.
  - `docs` → `blackboxprogramming.github.io` (proxy ✅) — developer docs.
  - Verify MX/TXT records for email remain unchanged.

- **blackroad.ai**
  - CNAME `@` → `blackroad.systems` (proxy ✅) — primary alias to OS.

- **blackroad.network**
  - CNAME `@` → `blackroad.systems` (proxy ✅) — developer docs alias.

- **blackroad.me**
  - CNAME `@` → `blackroad.systems` (proxy ✅) — personal identity alias.

### Secondary Domains (Phase 2)
- **aliceqi.com** — point to `lucidia-api.up.railway.app` (or current ALICE QI target) with proxy ✅ once service is live.
- **blackroadqi.com** — point to `blackroad-api-production.up.railway.app` (proxy ✅) when QI module ships.
- **lucidia.earth** — point to `lucidia-api.up.railway.app` (proxy ✅) for narrative experiences.
- **blackroadquantum.com** — point to the quantum hub service when ready; keep placeholder 301 to `blackroad.systems` until then.

### Tertiary Domains (Phase 3)
- **roadwallet.com**, **aliceos.io** — CNAME to `blackroad.systems` (proxy ✅) as aliases until dedicated services exist.
- **blackroadquantum.net**, **blackroadquantum.info**, **blackroadquantum.store** — hold with 301 to `blackroad.systems` until respective services launch; set proxy ✅.
- **lucidia.studio** — CNAME to `lucidia-api.up.railway.app` (proxy ✅) once creative stack is live.
- **blackroad.store** — configure to e-commerce service when defined; until then, 301 to `blackroad.systems` with proxy ✅.

## Validation Commands
Use these commands during rollout:
- `dig +short os.blackroad.systems`
- `curl -I https://os.blackroad.systems/health`
- `curl -I https://prism.blackroad.systems`
- `curl -I https://docs.blackroad.systems`
- Replace hostnames per domain/record to confirm 200s and TLS.

## Rollback
- Disable proxy or revert CNAMEs to previous targets in Cloudflare.
- If SSL issues arise, temporarily set SSL mode to **Full** (not strict) while renewing origin certificates, then restore **Full (strict)**.
- Document any rollback actions in the deployment log.
