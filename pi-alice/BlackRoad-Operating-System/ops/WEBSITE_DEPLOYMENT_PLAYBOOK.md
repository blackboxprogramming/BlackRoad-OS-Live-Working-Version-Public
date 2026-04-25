# Website Deployment Playbook

This playbook gives end-to-end steps to push every BlackRoad website live with the correct hosting target and DNS. Follow it when preparing production cutovers or restoring broken sites.

## Scope
- `blackroad.systems` (public marketing site)
- `docs.blackroad.systems` (developer docs)
- `console.blackroad.systems` / `prism.blackroad.systems` (Prism Console frontend)

## Prerequisites
- Vercel access for web + console deployments (production projects already created or ability to create them).
- GitHub access to run Pages workflows for docs.
- Cloudflare access to manage DNS for `blackroad.systems` and related subdomains.
- Healthy Railway backends if the frontend relies on API calls (e.g., console pulling status from the core API).

## Deployment Summary (TL;DR)
| Site | Source Repo/Path | Hosting Target | Domains | Health Check |
| --- | --- | --- | --- | --- |
| Public web | `apps/web` → `BlackRoad-OS/blackroad-os-web` | Vercel project `blackroad-os-web` (prod) | `blackroad.systems`, `www.blackroad.systems` | `curl -I https://blackroad.systems` should return 200/301 |
| Docs | `codex-docs` → `BlackRoad-OS/blackroad-os-docs` | GitHub Pages via `gh-pages` branch | `docs.blackroad.systems` | `curl -I https://docs.blackroad.systems` should return 200 |
| Prism Console | `prism-console` → `BlackRoad-OS/blackroad-os-prism-console` | Vercel project `blackroad-prism-console` (prod) | `console.blackroad.systems`, alias `prism.blackroad.systems` | `curl -I https://console.blackroad.systems` should return 200 |

---

## 1) Public Web (`blackroad.systems`)
1. **Sync code**
   - Ensure latest changes are in `apps/web` and mirrored to `BlackRoad-OS/blackroad-os-web` `main`.
2. **Build locally (sanity check)**
   - If static: `npm ci && npm run build` inside `apps/web`.
   - If Next.js: ensure `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_APP_URL` are set in Vercel.
3. **Deploy to Vercel**
   - Project: `blackroad-os-web`.
   - Framework preset: Next.js or Static depending on the build.
   - Environment: Production.
4. **Attach domains in Vercel**
   - Add `blackroad.systems` (apex) and `www.blackroad.systems`.
   - Verify Vercel shows them as “Verified”.
5. **Update Cloudflare (if needed)**
   - `@` → `cname.vercel-dns.com` (proxied ✅).
   - `www` → `blackroad.systems` (proxied ✅).
6. **Validate**
   - `dig +short blackroad.systems` should resolve to Vercel CNAME target.
   - `curl -I https://blackroad.systems` should return 200/301 and show the live site.

## 2) Docs (`docs.blackroad.systems`)
1. **Build locally**
   - `pip install -r codex-docs/requirements.txt` (or `pip install mkdocs mkdocs-material`).
   - `cd codex-docs && mkdocs build --strict` to ensure no broken links.
2. **Publish via GitHub Actions**
   - Verify the Pages workflow builds `codex-docs` and publishes `./codex-docs/site` to `gh-pages`.
   - Confirm `gh-pages` branch exists and updates on pushes to `main`.
3. **Configure Pages**
   - Repository: `BlackRoad-OS/blackroad-os-docs` → Settings → Pages → Source: `gh-pages`.
   - Custom domain: `docs.blackroad.systems`, enforce HTTPS.
4. **Update Cloudflare (if needed)**
   - `docs` → `blackboxprogramming.github.io` (proxied ✅).
5. **Validate**
   - `dig +short docs.blackroad.systems` should resolve to GitHub Pages.
   - `curl -I https://docs.blackroad.systems` should return 200 and serve the docs homepage.

## 3) Prism Console (`console.blackroad.systems` / `prism.blackroad.systems`)
1. **Sync code**
   - Ensure latest changes in `prism-console` mirror to `BlackRoad-OS/blackroad-os-prism-console` `main`.
2. **Deploy to Vercel**
   - Project: `blackroad-prism-console` (production).
   - Static export is sufficient; ensure build produces `index.html`/`static` assets.
3. **Attach domains in Vercel**
   - Add `console.blackroad.systems` as primary.
   - Add `prism.blackroad.systems` as secondary/alias if you still support the old hostname.
4. **Update Cloudflare**
   - `console` → `blackroad-prism-console.vercel.app` (proxied ✅).
   - `prism` → `blackroad-prism-console.vercel.app` (proxied ✅) if keeping the alias.
5. **Validate**
   - `dig +short console.blackroad.systems` should show the Vercel target.
   - `curl -I https://console.blackroad.systems` should return 200 and load the console UI.

## Cross-Site Smoke Tests
- Confirm each hostname serves distinct content (web vs docs vs console) and no redirect loops.
- Check SSL chain validity using `curl -Iv https://<host>`.
- For console/web, open DevTools → Network to ensure API calls hit the correct backend (`blackroad.systems` or `api.blackroad.systems`).
- Set uptime monitors for all three hostnames after cutover.

---

**Use this playbook anytime you need to bring the sites online or verify their health after infrastructure changes.**
