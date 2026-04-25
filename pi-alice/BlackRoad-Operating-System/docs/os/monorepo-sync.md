# BlackRoad OS Monorepo Sync

BlackRoad-Operating-System is the **single source of truth** for every service, app, and docs site under the BlackRoad OS umbrella. All satellite repositories are read-only mirrors. If it cannot be automated from this monorepo, it does not exist.

## Philosophy
- Edit code **only** in this repository.
- Each satellite repository maps to exactly one directory in the monorepo (see the mapping table below).
- GitHub Actions sync the relevant directory to its target repository after every change—no manual merges.

## Layout and Ownership
- `services/core-api` → `BlackRoad-OS/blackroad-os-core`
- `services/public-api` → `BlackRoad-OS/blackroad-os-api`
- `services/operator` → `BlackRoad-OS/blackroad-os-operator`
- `apps/prism-console` → `BlackRoad-OS/blackroad-os-prism-console`
- `apps/web` → `BlackRoad-OS/blackroad-os-web`
- `docs/site` → `BlackRoad-OS/blackroad-os-docs`

The authoritative mapping is codified in `infra/github/sync-config.yml`.

## How Sync Works
1. A push to `main` that touches a mapped path triggers its sync workflow.
2. The workflow checks out the monorepo, exports only the mapped directory, and clones the target repository using `${{ secrets.BR_OS_SYNC_TOKEN }}`.
3. The target repository is wiped (except `.git`), refreshed with the exported files, committed with the source SHA, and pushed (default is a force-push because the satellite is a mirror).
4. A `sync-status.md` file in the satellite captures the source SHA and workflow URL for traceability.
5. If there are no changes, the workflow exits cleanly.

## Onboarding a New Service
1. Add an entry to `infra/github/sync-config.yml` with `monorepo_path`, `target_repo`, `target_branch`, and optionally `force_push`.
2. Create the corresponding directory (for example `services/new-service/`) and populate it with code.
3. Add a new workflow in `.github/workflows/` (copy an existing sync workflow) that sets `SERVICE_KEY` to the new entry and sets the path filter to the new directory.
4. (Optional) Add a deploy workflow for the service that builds, tests, and deploys to Railway. Reference `infra/railway/ENVIRONMENT_GUIDE.md` for required env vars.

## Troubleshooting
- **Non-fast-forward errors:** set `force_push: true` for the service (default) or configure branch protection to allow the automation user to force-push.
- **Missing secrets:** ensure `${{ secrets.BR_OS_SYNC_TOKEN }}` is available to sync workflows and `${{ secrets.RAILWAY_TOKEN }}` to deploy workflows.
- **Path not syncing:** confirm the workflow `on.push.paths` matches the directory and that the `monorepo_path` in `sync-config.yml` is correct.

## Repository Guards for Mirrors
- Each mirror README should include a “Managed by Monorepo” banner (see `docs/os/satellite-readmes/README.blackroad-os-core.md`).
- Recommended branch protection on mirrors:
  - Require the automation user to be the only actor allowed to force-push to `main`.
  - Optionally block direct pushes and auto-close PRs with a comment pointing contributors to the monorepo path that owns the code.

## See Also
- `infra/github/sync-config.yml` for the canonical mapping.
- `docs/os/satellite-readmes/README.blackroad-os-core.md` for the managed-by-monorepo banner template.
- `infra/railway/ENVIRONMENT_GUIDE.md` for deployment expectations.
