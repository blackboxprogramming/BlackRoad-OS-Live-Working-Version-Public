# /Applications/blackboxprogramming

Local working directory for GitHub orgs/repos (via `gh`).

## Quick start

1. List orgs:
   - `./scripts/list-orgs.sh`
2. Sync (clone/update) all repos for all orgs:
   - `./scripts/sync-all-orgs.sh`
3. Sync only specific orgs:
   - `./scripts/sync-all-orgs.sh BlackRoad-OS BlackRoad-AI`

## Layout

- `orgs/<org>/<repo>/` — cloned repositories
- `scripts/` — utilities to list orgs and sync repos
