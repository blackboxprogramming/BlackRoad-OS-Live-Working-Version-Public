# Product Status Matrix

| Product | URL | Route | Renders | Real Function | Visual QA | Integrations | Status | Notes |
|--------|-----|-------|---------|---------------|-----------|--------------|--------|------|

| RoadChain | https://roadchain.blackroad.io | / | Yes (`200`) | Partial (surface only; deeper features pending) | yes | Vercel | partial | Minimal real surface deployed; TLS fixed; features still to wire |
| OneWay | https://oneway.blackroad.io | / | Yes (`200`) | Partial (surface + honest stubs) | blocked | Cloudflare Workers | partial | Deployed new `oneway-blackroad` Worker; Playwright/headless visual QA blocked by Cloudflare |
| BlackRoad OS | https://os.blackroad.io | / | Yes (`200`) | Partial | no | Unknown | needs-review | Renders black-and-white base surface; shared registry APIs not present (`/api/products` returns `404` HTML) |
| RoadCode | https://roadcode.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| RoadTrip | https://roadtrip.blackroad.io | / → `/home/apps/RoadTrip/` | Yes (`302`→`200`) | Partial (launcher surface; real convoy chat not wired here yet) | blocked | Cloudflare Workers | partial | Fixed: `/api/products` + `/api/sites` now return JSON via `blackroad-grayscale`; root now redirects to black/white base RoadTrip surface |
| Roadie | https://roadie.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| RoadWork | https://roadwork.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| BackRoad | https://backroad.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| CarKeys | https://carkeys.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs auth surface check + honest failure paths |
| RoadBook | https://roadbook.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| RoadWorld | https://roadworld.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| RoadView | https://roadview.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs search surface verification + real routing |
| RoadCoin | https://roadcoin.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Must be framed as utility credits; confirm no “investment” language |
| RoadSide | https://roadside.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Onboarding gateway should connect back to RoadOS |
| OfficeRoad | https://officeroad.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| CarPool | https://carpool.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs collaboration surface verification |
| BlackBoard | https://blackboard.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| RoadBand | https://roadband.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs black-and-white base verification + routing/action audit |
| HighWay | https://highway.blackroad.io | / | Yes (`200`) | Unknown | no | Unknown | needs-review | Needs subscription/backbone surface verification |
