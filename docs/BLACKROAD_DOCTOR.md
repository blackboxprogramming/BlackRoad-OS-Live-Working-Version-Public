# BlackRoad Doctor

One command that tells the truth about launch readiness.

## Usage

```bash
npm run doctor                    # Run all checks, terminal output
npm run doctor -- --write-report  # Run + write JSON reports
```

## What it checks (17 checks in order)

| # | Check | Priority |
|---|-------|----------|
| 1 | Index import | high |
| 2 | Registry reconciliation | high |
| 3 | Product route compliance | high |
| 4 | RoadChain SSL Priority 0 | p0 |
| 5 | Base CSS rollout | high |
| 6 | Command dock routing | high |
| 7 | Surface runtime | high |
| 8 | CarKeys portable session | medium |
| 9 | RoadNode opt-in runtime | p0 |
| 10 | Status + health dashboard | medium |
| 11 | RoadView search runtime | medium |
| 12 | RoadBook publishing runtime | medium |
| 13 | RoadTrip orchestration runtime | medium |
| 14 | Commit ritual automation | low |
| 15 | Secret scan | p0 |
| 16 | Tagline scan | high |
| 17 | Final launch score | high |

## Status values

- `PASS` — check verified
- `WARN` — minor issues
- `FAIL` — check failed
- `MISSING` — script not yet implemented
- `BLOCKED` — cannot proceed
- `APPROVAL` — requires human verification
- `SKIP` — not applicable

## Launch score

| Score | Category |
|-------|----------|
| 100 | Launch ready |
| 85-99 | Ship with warnings |
| 70-84 | Internal beta only |
| 50-69 | Demo only |
| 0-49 | Blocked |

## Priority 0 blockers

These cap the score at 49 (blocked):
- roadchain.blackroad.io expired certificate
- Missing RoadOS route
- Broken command dock
- Missing product registry
- Missing base CSS
- Suspected secret in repo
- Old tagline variant
- RoadNode auto-enable path
- Hidden capture/recording path
- RoadCoin investment language

## Command dock

```
open doctor
launch control
ship check
status all
```

## Reports

- `src/blackroad/generated/blackroad-doctor-report.json`
- `src/blackroad/generated/launch-control-report.json`

## Rule

One command should tell the truth. Not vibes. Not "200 means done." Not fake green lights. If it blocks launch, it goes on top.

Remember the Road. Pave Tomorrow!
