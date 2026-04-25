# Domain Management Overview

This repository includes a **universal domain orchestrator** that allows you to declare all of your domains in a single YAML file and sync them to your DNS providers automatically. The goal is to avoid manual updates in registrar dashboards by defining a clear desired state and letting automation converge on it.

## Configuration File (`ops/domains.yaml`)

The `ops/domains.yaml` file lists each domain or subdomain with the following fields:

- **name**: The fully qualified domain or subdomain (e.g. `blackroad.systems`, `os.blackroad.systems`).
- **type**: `"root"` for an apex domain or `"subdomain"` for a subdomain.
- **provider**: Which registrar/DNS provider the domain lives in (`godaddy` or `cloudflare`).
- **mode**:
  - `forward` – perform a 301 (permanent) redirect to another URL.
  - `dns` – create or update a DNS record (CNAME or A).
- **forward_to** (only for `forward`): The destination URL to forward to.
- **forwarding_type** (optional): HTTP status code for forwarding (301 by default).
- **record** (only for `dns`): A mapping with `type` (`CNAME` or `A`) and `value` (target hostname or IP).
- **healthcheck** (optional): Set to `true` to enable periodic health checks in the optional workflow.

Add as many entries as needed; the script processes them sequentially.

## Domain Sync Script (`ops/scripts/apply_domains.py`)

This Python script:

1. Parses `ops/domains.yaml`.
2. For GoDaddy domains:
   - Uses the GoDaddy API to set forwarding rules or DNS records.
   - A permanent 301 redirect tells search engines to treat the destination as the canonical URL.
3. For Cloudflare domains:
   - Finds the zone ID for the root domain.
   - Creates or updates DNS records using the Cloudflare API, which supports PUT/PATCH requests to overwrite DNS entries.
4. Prints a summary of actions taken; if nothing changed, it reports that the record is up to date.

All credentials (GoDaddy key/secret and Cloudflare token) are read from environment variables. **Never hard‑code secrets.** Set them as GitHub repository secrets (Settings → Secrets and variables → Actions).

## GitHub Actions Workflows

### `sync-domains.yml`

- Runs on pushes to `main` where `ops/domains.yaml` changes, or via manual trigger.
- Checks out the repo, installs Python dependencies, and runs the sync script.
- Uses secrets to authenticate to GoDaddy and Cloudflare.
- Annotates logs with changes so you can see which domains were updated.

### `domain-health.yml` (optional)

- Runs every six hours (or manually).
- Reads `ops/domains.yaml` and performs an HTTP GET against any domain marked `healthcheck: true`.
- Logs whether the domain is reachable; you can extend it to open GitHub Issues on repeated failures.

## How To Add or Modify Domains

1. Open `ops/domains.yaml` and add a new entry for each domain or subdomain you own.
2. Specify its `provider`, `mode`, and either `forward_to` or a DNS `record`.
3. Commit and push your changes to `main`.
4. Ensure the following secrets are configured in GitHub:
   - `GODADDY_API_KEY`, `GODADDY_API_SECRET`
   - `CLOUDFLARE_TOKEN`
5. Run the **Sync Domains** workflow manually (Actions → Sync Domains → Run workflow) or wait for the push trigger.
6. Verify your DNS or forwarding settings with `dig` or by visiting the domains.

By following this process, you maintain a single source of truth for all of your domains and eliminate the need to log into registrar dashboards for each change.
