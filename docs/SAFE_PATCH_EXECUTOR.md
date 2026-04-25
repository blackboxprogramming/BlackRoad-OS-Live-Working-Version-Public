# BlackRoad Safe Patch Executor

Applies safe local patches from the Launch Queue without touching production.

## Pipeline

```bash
npm run doctor -- --write-report   # 1. Find truth
npm run launch:queue               # 2. Order work
npm run patch:preview              # 3. Preview changes
npm run patch:safe                 # 4. Apply safe patches
npm run patch:verify               # 5. Verify results
npm run patch:rollback             # 6. Undo if needed
```

## What it patches (safe)

- Missing product docs from registry
- Missing health.json templates
- Missing site.json templates
- Missing ritual files (MEMORY, CODEX, PRODUCTS, BRTODO, COLLAB, ROADTRIP)
- Official tagline in generated templates
- Base CSS imports in generated templates
- Product shell placeholder pages
- RoadView index entries
- RoadBook document entries
- BRTODO launch queue entries
- RoadTrip commit-room card drafts

## What it refuses (blocked)

- DNS changes
- SSL certificate changes
- Cloudflare changes
- Deployments
- Git commit / push
- Secret rotation
- Billing changes
- File deletion
- Overwriting human-written files
- RoadNode enablement
- Capture/recording enablement
- Private API mutations
- Legal/trust copy changes

## Safety rules

- **Preview first**: `--preview` is the default mode
- **Backup always**: creates `.blackroad-backups/<timestamp>/` before any change
- **Generated blocks**: only replaces content between `BLACKROAD:GENERATED:START/END` markers
- **Human protection**: files without generated markers require approval
- **Verification**: patches aren't marked done until checks pass
- **Rollback**: `npm run patch:rollback` restores from latest backup

## Command dock

```
open safe patches
patch preview
safe patch
patch verify
patch rollback
apply safe fixes
```

## Rule

Patch locally. Preview first. Backup always.
Never mutate production without approval.
Never overwrite human work blindly.
Never mark fixed without verification.

Remember the Road. Pave Tomorrow!
