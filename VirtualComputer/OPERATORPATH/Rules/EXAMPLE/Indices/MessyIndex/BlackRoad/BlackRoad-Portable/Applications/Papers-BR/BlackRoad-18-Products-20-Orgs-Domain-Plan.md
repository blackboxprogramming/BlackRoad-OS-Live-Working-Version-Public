# BlackRoad 18 Products / 20 Orgs / Domain Plan

> Draft / working copy. Canonical source of truth moved to [`/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md`](/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md) and [`/Users/alexa/infra/blackroad_registry.json`](/Users/alexa/infra/blackroad_registry.json).

## Goal
This plan reduces the BlackRoad ecosystem to a manageable operating model:
- 18 canonical products
- 20 primary GitHub orgs
- one clear domain and ownership model

This is not a vanity-org plan. It is an execution plan. Each org should own a coherent slice of the platform, not just exist as a label.

## Operating Principles
- Each product has one canonical product hostname.
- Each product has one owning org.
- Shared platform orgs exist only where reuse is real.
- Short aliases redirect to canonical hosts.
- Root domains are portfolio or brand surfaces, not random duplicates.
- The main platform should stay centered on `blackroad.io`.

## The 18 Canonical Products
| Product | Canonical Host | Primary Purpose |
| --- | --- | --- |
| BlackRoad OS | `os.blackroad.io` | Desktop shell and platform entry point |
| RoadTrip | `roadtrip.blackroad.io` | Agent convoy chat |
| Roadie | `tutor.blackroad.io` | Tutor and guided learning |
| RoadChat | `chat.blackroad.io` | Direct AI chat |
| RoadCode | `roadcode.blackroad.io` | Coding environment |
| BackRoad | `social.blackroad.io` | Social and community |
| RoadBook | `roadbook.blackroad.io` | Publishing and writing |
| RoadWorld | `roadworld.blackroad.io` | World builder and engine |
| OfficeRoad | `officeroad.blackroad.io` | Live office and activity |
| RoadWork | `roadwork.blackroad.io` | Business and compliance |
| CarKeys | `carkeys.blackroad.io` | Auth, vault, identity, sessions |
| CarPool | `carpool.blackroad.io` | Model routing and AI infrastructure |
| RoadChain | `roadchain.blackroad.io` | Ledger and provenance |
| RoadCoin | `roadcoin.blackroad.io` | Token and balances |
| RoadSide | `roadside.blackroad.io` | Onboarding and setup |
| OneWay | `oneway.blackroad.io` | Export and portability |
| BlackBoard | `blackboard.blackroad.io` | Analytics and reporting |
| RoadView | `search.blackroad.io` | Search and discovery |

## The 20 Primary Orgs
These are the orgs worth actively operating around the 18 products.

### 1. `BlackRoad-OS`
Owns:
- BlackRoad OS shell
- shared app shell components
- global navigation
- design tokens applied to product shells

Domains:
- `os.blackroad.io`
- `blackroados.blackroad.io` -> redirect only

### 2. `BlackRoad-Agents`
Owns:
- RoadTrip
- agent runtime UX
- agent personas and convoy interaction layer

Domains:
- `roadtrip.blackroad.io`

### 3. `BlackRoad-Education`
Owns:
- Roadie
- curriculum flows
- learning content and tutoring logic

Domains:
- `tutor.blackroad.io`
- `roadie.blackroad.io` -> redirect or alias, not canonical

### 4. `BlackRoad-AI`
Owns:
- RoadChat
- shared prompting patterns
- model-facing chat UX

Domains:
- `chat.blackroad.io`
- `roadchat.blackroad.io` -> redirect only

### 5. `BlackRoad-Code-Solutions`
Owns:
- RoadCode
- editor UX
- project execution and deploy workflows

Domains:
- `roadcode.blackroad.io`
- `code.blackroad.io` -> redirect only if used

### 6. `BlackRoad-Media`
Owns:
- BackRoad
- RoadBook
- content systems
- creator and publishing workflows

Domains:
- `social.blackroad.io`
- `roadbook.blackroad.io`

### 7. `BlackRoad-Interactive`
Owns:
- RoadWorld
- OfficeRoad
- interactive simulations
- visual canvases and live environments

Domains:
- `roadworld.blackroad.io`
- `officeroad.blackroad.io`

### 8. `BlackRoad-Products`
Owns:
- RoadSide
- portfolio-wide onboarding patterns
- product discovery and cross-sell flows

Domains:
- `roadside.blackroad.io`

### 9. `BlackRoad-Foundation`
Owns:
- CarKeys
- shared identity patterns
- permissions and security UX

Domains:
- `carkeys.blackroad.io`

### 10. `BlackRoad-Infrastructure`
Recommended rename target if needed from existing infra-oriented org sprawl.

Owns:
- CarPool
- platform routing
- internal API gateway patterns
- service health conventions

Domains:
- `carpool.blackroad.io`
- `api.blackroad.io`

### 11. `BlackRoad-Quantum`
Owns:
- RoadChain
- provenance systems
- cryptographic registry patterns

Domains:
- `roadchain.blackroad.io`
- `roadchain.io`

### 12. `BlackRoad-QI`
Owns:
- RoadCoin
- economic logic
- token and wallet interfaces

Domains:
- `roadcoin.blackroad.io`
- `roadcoin.io`

### 13. `BlackRoad-Data`
Owns:
- OneWay
- export pipelines
- portability formats
- archive and handoff tools

Domains:
- `oneway.blackroad.io`

### 14. `BlackRoad-Analytics`
Recommended operating org even if current assets are spread.

Owns:
- BlackBoard
- KPI systems
- reporting and dashboards

Domains:
- `blackboard.blackroad.io`
- `kpi.blackroad.io`

### 15. `BlackRoad-Index`
Owns:
- RoadView
- crawling
- indexing
- search experience

Domains:
- `search.blackroad.io`
- `roadview.blackroad.io` -> redirect only
- `seo.blackroad.io`

### 16. `BlackRoad-Cloud`
Owns:
- deployment infra
- workers
- edge services
- internal service templates

Domains:
- `cloud.blackroad.io`
- internal infra hosts

### 17. `BlackRoad-Security`
Owns:
- secure defaults across all 18 products
- auth policy
- audit logging
- incident review

Domains:
- no primary product hostname
- internal ownership across all product health and auth surfaces

### 18. `BlackRoad-Network`
Owns:
- network topology
- system status
- public infra visibility

Domains:
- `blackroad.network`
- `status.blackroad.io`
- `hq.blackroad.io` if used as network/control surface

### 19. `BlackRoad-Studio`
Owns:
- design systems
- brand shell
- shared UI kits
- motion, assets, and visuals

Domains:
- `brand.blackroad.io`
- `lucidia.studio`

### 20. `BlackRoad-Ventures`
Owns:
- portfolio layer
- company-facing rollups
- investor and ecosystem surfaces

Domains:
- `blackroad.io`
- `blackroad.company`
- `blackroadinc.us`
- `blackroad.systems`
- `blackroadai.com`

## Best Org-to-Product Assignment
| Product | Owning Org | Supporting Orgs |
| --- | --- | --- |
| BlackRoad OS | `BlackRoad-OS` | `BlackRoad-Studio`, `BlackRoad-Cloud`, `BlackRoad-Security` |
| RoadTrip | `BlackRoad-Agents` | `BlackRoad-AI`, `BlackRoad-Foundation` |
| Roadie | `BlackRoad-Education` | `BlackRoad-AI`, `BlackRoad-Products` |
| RoadChat | `BlackRoad-AI` | `BlackRoad-Cloud`, `BlackRoad-Foundation` |
| RoadCode | `BlackRoad-Code-Solutions` | `BlackRoad-Cloud`, `BlackRoad-OS` |
| BackRoad | `BlackRoad-Media` | `BlackRoad-Studio`, `BlackRoad-Products` |
| RoadBook | `BlackRoad-Media` | `BlackRoad-Quantum`, `BlackRoad-Studio` |
| RoadWorld | `BlackRoad-Interactive` | `BlackRoad-Studio`, `BlackRoad-Cloud` |
| OfficeRoad | `BlackRoad-Interactive` | `BlackRoad-Agents`, `BlackRoad-Studio` |
| RoadWork | `BlackRoad-Products` | `BlackRoad-Security`, `BlackRoad-Data` |
| CarKeys | `BlackRoad-Foundation` | `BlackRoad-Security`, `BlackRoad-Cloud` |
| CarPool | `BlackRoad-Infrastructure` | `BlackRoad-AI`, `BlackRoad-Cloud` |
| RoadChain | `BlackRoad-Quantum` | `BlackRoad-QI`, `BlackRoad-Foundation` |
| RoadCoin | `BlackRoad-QI` | `BlackRoad-Quantum`, `BlackRoad-Foundation` |
| RoadSide | `BlackRoad-Products` | `BlackRoad-OS`, `BlackRoad-Studio` |
| OneWay | `BlackRoad-Data` | `BlackRoad-Foundation`, `BlackRoad-Products` |
| BlackBoard | `BlackRoad-Analytics` | `BlackRoad-Index`, `BlackRoad-Products` |
| RoadView | `BlackRoad-Index` | `BlackRoad-Cloud`, `BlackRoad-Analytics` |

## Domain Strategy
### 1. Main Portfolio Domain
Primary:
- `blackroad.io`

Use:
- top-level company narrative
- entry into the ecosystem
- links into the 18 products
- portfolio overview

Do not use it to duplicate every product page.

### 2. Product Domain Layer
Every product should have its own canonical product host under `blackroad.io`.

Pattern:
- `product.blackroad.io`

Examples:
- `roadtrip.blackroad.io`
- `roadcode.blackroad.io`
- `roadwork.blackroad.io`

### 3. Brand and Company Layer
These should exist as portfolio or brand surfaces, not parallel product canonicals:
- `blackroad.company`
- `blackroad.systems`
- `blackroad.me`
- `blackroadai.com`
- `blackroadinc.us`

Use them for:
- company profile
- hiring
- press
- ecosystem overview
- investor or corporate information

### 4. Specialist Root Domains
These should be kept only where the product is big enough to deserve an external brand surface:
- `roadchain.io`
- `roadcoin.io`
- `lucidia.studio`
- `lucidia.earth`
- `aliceqi.com`

Recommendation:
- keep them as branded portals that point back into the core `blackroad.io` platform
- avoid making them the main product runtime unless there is a clear business reason

## Product Domain Matrix
| Product | Canonical Host | Alias Policy | Extra Root Domain |
| --- | --- | --- | --- |
| BlackRoad OS | `os.blackroad.io` | redirect `blackroados.blackroad.io` | none |
| RoadTrip | `roadtrip.blackroad.io` | redirect `trip.blackroad.io` if used | none |
| Roadie | `tutor.blackroad.io` | choose one canonical vs `roadie.blackroad.io` | none |
| RoadChat | `chat.blackroad.io` | redirect `roadchat.blackroad.io` | none |
| RoadCode | `roadcode.blackroad.io` | redirect `code.blackroad.io` if used | none |
| BackRoad | `social.blackroad.io` | redirect `backroad.blackroad.io` if desired | none |
| RoadBook | `roadbook.blackroad.io` | redirect `book.blackroad.io` if used | none |
| RoadWorld | `roadworld.blackroad.io` | redirect `world.blackroad.io` if used | none |
| OfficeRoad | `officeroad.blackroad.io` | redirect `office.blackroad.io` if used | none |
| RoadWork | `roadwork.blackroad.io` | redirect `work.blackroad.io` if used | none |
| CarKeys | `carkeys.blackroad.io` | redirect `keys.blackroad.io` if used | none |
| CarPool | `carpool.blackroad.io` | redirect `pool.blackroad.io` if used | none |
| RoadChain | `roadchain.blackroad.io` | redirect aliases | `roadchain.io` |
| RoadCoin | `roadcoin.blackroad.io` | redirect aliases | `roadcoin.io` |
| RoadSide | `roadside.blackroad.io` | redirect `side.blackroad.io` if used | none |
| OneWay | `oneway.blackroad.io` | redirect `way.blackroad.io` if used | none |
| BlackBoard | `blackboard.blackroad.io` | redirect `board.blackroad.io` if used | none |
| RoadView | `search.blackroad.io` | redirect `roadview.blackroad.io` | none |

## What Each Product Should Actually Need
### Product Runtime
Every product should have:
- one canonical host
- one owning org
- one main repo or monorepo package
- one route model
- one health model

### Product Route Model
Default:
- `https://product.blackroad.io/`
- `https://product.blackroad.io/health` if runtime-backed
- `https://product.blackroad.io/api/*` if it owns local APIs

Use `/app` only when:
- `/` is a marketing surface
- the signed-in app is intentionally separate

### Product Repo Model
Recommended:
- one primary runtime repo per product
- one optional marketing repo only if necessary
- shared UI and platform code pulled from common orgs instead of copy/paste forks

## Recommended Org Reduction
You do not need all 44 orgs as first-class operators. The 20 above are enough to center the ecosystem around the 18 products.

If you want to simplify further later, these 20 could collapse into 8 operating groups:
- Platform
- AI
- Product
- Media
- Interactive
- Security
- Infrastructure
- Ventures

But right now 20 is still manageable while preserving your current naming language.

## Immediate Next Moves
1. Lock the 18 canonical product hosts.
2. Assign one owning org per product.
3. Turn duplicate hosts into redirects.
4. Decide the one unresolved canonical naming pair:
   `tutor.blackroad.io` vs `roadie.blackroad.io`
5. Put all shared shell and design work under `BlackRoad-OS` and `BlackRoad-Studio`.
6. Put all health, routing, and infra standards under `BlackRoad-Infrastructure` and `BlackRoad-Cloud`.
7. Stop creating new orgs unless they map to a real product or shared platform layer.

## Final Recommendation
Center the BlackRoad empire on:
- 18 canonical products
- 20 operating orgs
- `blackroad.io` as the portfolio root
- one canonical subdomain per product

That gives you enough structure to scale without turning the ecosystem into naming noise.
