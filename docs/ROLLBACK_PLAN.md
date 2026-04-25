# BlackRoad Rollback Plan

Release: release-1777078392753-1
Version: 0.1.1

## Steps

1. Identify affected products and domains
2. Revert to previous deploy (requires approval)
3. Verify previous version is serving — `npm run doctor -- --write-report`
4. Run release gates on reverted state — `npm run release:gates`
5. Notify via RoadTrip commit room
6. Update BRTODO with rollback incident
7. Post-mortem: what failed and why

## Local Rollback

`npm run patch:rollback` — Restores local files from .blackroad-backups/

## Rule

Rollback never executes automatically. All rollbacks require human decision.

Remember the Road. Pave Tomorrow!
