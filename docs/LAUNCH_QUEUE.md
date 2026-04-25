# BlackRoad Launch Queue

Generated: 2026-04-24T22:13:24.132Z
Total tasks: 8

## Priority 0

- **Verify: RoadChain SSL Priority 0** [APPROVAL]
  roadchain.blackroad.io SSL certificate status requires manual verification. NEVER hide this check.
  Verify: `Run: curl -vI https://roadchain.blackroad.io 2>&1 | grep expire`

## Priority 2

- **Add: CarKeys portable session** [SAFE]
  Add "check:carkeys" to package.json scripts
  Verify: `npm run check:carkeys`
- **Add: RoadNode opt-in runtime** [SAFE]
  Add "check:roadnode" to package.json scripts
  Verify: `npm run check:roadnode`
- **Add: Status + health dashboard** [SAFE]
  Add "check:status-runtime" to package.json scripts
  Verify: `npm run check:status-runtime`
- **Add: RoadView search runtime** [SAFE]
  Add "check:roadview" to package.json scripts
  Verify: `npm run check:roadview`
- **Add: RoadBook publishing runtime** [SAFE]
  Add "check:roadbook" to package.json scripts
  Verify: `npm run check:roadbook`
- **Add: RoadTrip orchestration runtime** [SAFE]
  Add "check:roadtrip" to package.json scripts
  Verify: `npm run check:roadtrip`
- **Add: Commit ritual automation** [SAFE]
  Add "ritual:check" to package.json scripts
  Verify: `npm run ritual:check`

## Commit Ritual
[MEMORY] reviewed
[CODEX] updated
[PRODUCTS] reviewed
[BRTODO] updated
[COLLAB] updated
[ROADTRIP] updated

Remember the Road. Pave Tomorrow!