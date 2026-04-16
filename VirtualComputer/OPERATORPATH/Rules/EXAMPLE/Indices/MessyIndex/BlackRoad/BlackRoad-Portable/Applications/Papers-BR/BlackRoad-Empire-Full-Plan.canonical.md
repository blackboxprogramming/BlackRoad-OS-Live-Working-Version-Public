# BlackRoad Empire Full Plan

> Draft / working copy. Canonical source of truth moved to [`/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md`](/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md) and [`/Users/alexa/infra/blackroad_registry.json`](/Users/alexa/infra/blackroad_registry.json).

## Executive Summary
BlackRoad should operate from one canonical naming system, one product registry, and one routing model. The current raw plan mixes product aliases, duplicate status lists, and conflicting host patterns. This version keeps the useful inventory but reduces it to a canonical operating model.

Core decisions:
- Each product gets one canonical full-name hostname.
- Short aliases may exist, but they must `301` redirect to the canonical product hostname.
- Product frontends should use the root path `/`.
- `/app` should not be added to every product by default.
- `/health` should exist only where a machine-readable health endpoint is required.

## Canonical Product Hostname Rule
Use the full product name as the canonical subdomain whenever possible.

Examples:
- `os.blackroad.io`
- `roadtrip.blackroad.io`
- `roadcode.blackroad.io`
- `roadwork.blackroad.io`
- `roadbook.blackroad.io`
- `roadworld.blackroad.io`
- `officeroad.blackroad.io`
- `roadchain.blackroad.io`
- `roadcoin.blackroad.io`
- `blackboard.blackroad.io`
- `carkeys.blackroad.io`
- `carpool.blackroad.io`
- `oneway.blackroad.io`
- `roadside.blackroad.io`
- `social.blackroad.io`
- `search.blackroad.io`
- `chat.blackroad.io`
- `tutor.blackroad.io`

Rule:
- Canonical host = full product slug.
- Alias host = convenience only.
- Alias host must redirect, not self-canonicalize as a separate surface.

Examples of allowed aliases:
- `trip.blackroad.io` -> `roadtrip.blackroad.io`
- `code.blackroad.io` -> `roadcode.blackroad.io`
- `work.blackroad.io` -> `roadwork.blackroad.io`
- `book.blackroad.io` -> `roadbook.blackroad.io`
- `world.blackroad.io` -> `roadworld.blackroad.io`
- `office.blackroad.io` -> `officeroad.blackroad.io`
- `chain.blackroad.io` -> `roadchain.blackroad.io`
- `coin.blackroad.io` -> `roadcoin.blackroad.io`
- `board.blackroad.io` -> `blackboard.blackroad.io`
- `keys.blackroad.io` -> `carkeys.blackroad.io`
- `pool.blackroad.io` -> `carpool.blackroad.io`
- `side.blackroad.io` -> `roadside.blackroad.io`
- `way.blackroad.io` -> `oneway.blackroad.io`

## Route Convention
### Frontend Products
For a real product app, the product should live at the root of its canonical host:

- `https://roadtrip.blackroad.io/`
- `https://roadcode.blackroad.io/`
- `https://roadwork.blackroad.io/`

Do not add `/app` automatically if the host itself is already the application.

Use `/app` only in these cases:
- The canonical host is a marketing or overview site and the signed-in product must live behind a distinct path.
- The product has both a public landing experience and a separate authenticated workspace on the same hostname.
- You intentionally want `example.blackroad.io/` to be marketing and `example.blackroad.io/app` to be the logged-in surface.

Good uses of `/app`:
- `https://blackroad.io/app`
- `https://os.blackroad.io/app` only if `os.blackroad.io/` is a public shell overview and `/app` is the logged-in shell

Bad uses of `/app`:
- `https://roadtrip.blackroad.io/app` if `roadtrip.blackroad.io/` is already the product
- `https://roadcode.blackroad.io/app` if the editor already lives at the root

Recommendation:
- Keep most products root-based.
- Reserve `/app` for the main umbrella host or for marketing-plus-app splits.

### Health Endpoints
Use `/health` for machine-readable health checks on backend-capable services.

Recommended pattern:
- `GET /health` returns compact JSON
- `GET /ready` returns readiness status if the service depends on upstream systems
- `GET /version` returns service version and build identifier if useful

Example:
```json
{
  "status": "ok",
  "service": "roadtrip",
  "version": "1.2.0"
}
```

Rules:
- Frontend-only sites do not need public `/health` unless they are fronted by a Worker or runtime that must be checked.
- API and service hosts should expose `/health`.
- If a product host serves both frontend and backend behavior, `/health` is acceptable on the same host.
- Do not use `/api/health` and `/health` inconsistently across products unless there is a hard framework reason. Prefer `/health`.

### API Endpoints
If a product has public API surface, keep it explicit:
- `https://roadtrip.blackroad.io/api/...` for product-local APIs
- `https://api.blackroad.io/...` for shared platform APIs

Use `api.<product>.blackroad.io` only if the API needs independent routing, scaling, auth, or infrastructure ownership.

## Canonical Product Map
| Product | Canonical URL | Notes |
| --- | --- | --- |
| BlackRoad OS | `https://os.blackroad.io/` | Browser-native shell |
| RoadTrip | `https://roadtrip.blackroad.io/` | Agent convoy chat |
| Roadie | `https://tutor.blackroad.io/` | Tutor product; canonical slug can remain `tutor` if user-facing brand is Roadie |
| RoadChat | `https://chat.blackroad.io/` | Direct AI chat |
| RoadCode | `https://roadcode.blackroad.io/` | Code editor |
| BackRoad | `https://social.blackroad.io/` | Social product; brand is BackRoad, host remains function-first |
| RoadBook | `https://roadbook.blackroad.io/` | Publishing |
| RoadWorld | `https://roadworld.blackroad.io/` | World builder / engine |
| OfficeRoad | `https://officeroad.blackroad.io/` | Live office / activity surface |
| RoadWork | `https://roadwork.blackroad.io/` | Business and compliance tools |
| CarKeys | `https://carkeys.blackroad.io/` | Auth and vault |
| CarPool | `https://carpool.blackroad.io/` | Model router |
| RoadChain | `https://roadchain.blackroad.io/` | Ledger |
| RoadCoin | `https://roadcoin.blackroad.io/` | Token economy |
| RoadSide | `https://roadside.blackroad.io/` | Onboarding |
| OneWay | `https://oneway.blackroad.io/` | Export |
| BlackBoard | `https://blackboard.blackroad.io/` | Analytics |
| RoadView | `https://search.blackroad.io/` | Search product; host remains function-first |

## Current Root Domains
- `aliceqi.com`
- `blackboxprogramming.io`
- `blackroad.company`
- `blackroad.dev`
- `blackroad.io`
- `blackroad.me`
- `blackroad.network`
- `blackroad.systems`
- `blackroadai.com`
- `blackroadinc.us`
- `blackroadqi.com`
- `lucidia.earth`
- `lucidia.studio`
- `lucidiaqi.com`
- `roadchain.io`
- `roadcoin.io`

## 20-Domain Operating Map
This section defines the 20 strategic domains and top-level surfaces future agents should plan around. Some are root domains. Some are platform-level hosts that behave like top-level operating surfaces and need the same discipline.

For every domain below, agents should know:
- what it is for
- what belongs there
- what should redirect away from it
- what should never be built there

### 1. `blackroad.io`
Role:
- primary portfolio root
- ecosystem front door
- umbrella narrative for the whole platform

Use it for:
- platform overview
- links into the 18 canonical products
- company positioning
- launch surface for new visitors

Do not use it for:
- cloning full product pages from subdomains
- competing canonicals for individual products
- scattered one-off experiments

Routing guidance:
- `/` = portfolio and ecosystem overview
- `/app` may exist if this becomes the umbrella signed-in shell
- product detail should usually link out to canonical product hosts

### 2. `blackroad.company`
Role:
- corporate and organizational surface

Use it for:
- company profile
- leadership, hiring, partnerships, press, corporate documentation
- investor-friendly overview if needed

Do not use it for:
- product runtime
- duplicate app shells
- canonical product docs

Routing guidance:
- keep it corporate and external-facing
- if there is an internal ops surface, place it under a clearly separate path and do not make it the default public experience

### 3. `blackroad.systems`
Role:
- public or semi-public systems and infrastructure identity

Use it for:
- fleet overview
- systems narrative
- infrastructure status explanations
- machine and platform positioning

Do not use it for:
- primary product marketing
- duplicate company narrative
- random utility microsites

Routing guidance:
- this can support infrastructure explainers and high-level fleet views
- operationally sensitive tools should move to authenticated surfaces or dedicated internal hosts

### 4. `blackroad.network`
Role:
- network and topology surface

Use it for:
- network maps
- public-facing infra narrative
- control-plane or topology explanations
- status-related network context

Do not use it for:
- generic company pages
- unrelated product pages
- duplicate analytics products

Routing guidance:
- strong candidate for status-adjacent content, topology visuals, and host maps

### 5. `blackroad.me`
Role:
- founder or personal-layer identity surface

Use it for:
- personal writing
- founder-facing notes
- portfolio and reflections
- light media or profile content

Do not use it for:
- canonical product ownership
- enterprise positioning
- runtime app hosts

Routing guidance:
- keep it human and personal
- link back into `blackroad.io` and other canonical brand surfaces

### 6. `blackroadai.com`
Role:
- AI-focused brand and strategic umbrella

Use it for:
- BlackRoad’s AI positioning
- model, agent, and platform explainers
- AI-specific partnership or narrative pages

Do not use it for:
- duplicate product app runtimes
- generic corporate pages that already belong on `blackroad.company`

Routing guidance:
- this should be a branded AI portal pointing back into canonical product hosts such as `chat.blackroad.io`, `carpool.blackroad.io`, and `roadtrip.blackroad.io`

### 7. `blackroadinc.us`
Role:
- legal and US-incorporation-facing company surface

Use it for:
- legal profile
- incorporation and compliance context
- official company references when needed

Do not use it for:
- product marketing
- user onboarding
- experimental content

Routing guidance:
- keep minimal, trustworthy, and corporate

### 8. `blackroadqi.com`
Role:
- QI, mathematics, symbolic, and reasoning brand surface

Use it for:
- QI positioning
- math and reasoning content
- brand-level explainers for the QI layer

Do not use it for:
- generic BlackRoad company messaging
- runtime product duplication

Routing guidance:
- keep it as a branded portal that points toward canonical QI-related products and research surfaces

### 9. `blackboxprogramming.io`
Role:
- legacy or parallel programming brand surface

Use it for:
- programming identity where the BlackBox brand still matters
- archive, migration, or legacy continuity

Do not use it for:
- new canonical BlackRoad product ownership unless intentionally migrated
- duplicate company homepages

Routing guidance:
- future agents should make a deliberate keep/migrate/archive decision instead of growing this domain by default

### 10. `blackroad.dev`
Role:
- developer-facing identity

Use it for:
- developer docs landing
- SDK or API landing pages
- implementation-oriented onboarding

Do not use it for:
- broad consumer product marketing
- duplicate runtime surfaces

Routing guidance:
- if maintained, keep it strongly developer-specific and aligned to docs or API entry points

### 11. `lucidia.studio`
Role:
- design, creative system, and studio-facing brand surface

Use it for:
- design system presentation
- visual case studies
- studio-quality showcase work
- brand and motion references

Do not use it for:
- core product runtime
- operational infra tooling

Routing guidance:
- keep it highly visual and aligned with `brand.blackroad.io`

### 12. `lucidia.earth`
Role:
- agent ecosystem and Lucidia-facing brand world

Use it for:
- agent identity
- future-facing ecosystem framing
- multi-agent vision and narrative

Do not use it for:
- core product duplication
- random product launch pages that belong in the main platform

Routing guidance:
- this can be a narrative and systems layer, not the primary runtime for the whole platform

### 13. `lucidiaqi.com`
Role:
- Lucidia-specific QI and reasoning surface

Use it for:
- reasoning systems
- symbolic analysis
- QI-specific research positioning

Do not use it for:
- generic company pages
- broad product navigation

Routing guidance:
- keep it focused and research-heavy if it remains active

### 14. `aliceqi.com`
Role:
- Alice / QI / onboarding-adjacent identity

Use it for:
- educational or guide-oriented reasoning surfaces
- softer entry points into QI content

Do not use it for:
- broad enterprise or infrastructure messaging
- duplicate product runtime

Routing guidance:
- if kept active, it should be clearly scoped and not compete with the main BlackRoad navigation layer

### 15. `roadchain.io`
Role:
- branded external portal for RoadChain

Use it for:
- external RoadChain brand narrative
- ecosystem explanation
- business development or protocol-facing materials

Do not use it for:
- competing runtime canonical if `roadchain.blackroad.io` is the chosen product host
- generic crypto content unrelated to RoadChain

Routing guidance:
- best as a brand portal that points into `roadchain.blackroad.io`

### 16. `roadcoin.io`
Role:
- branded external portal for RoadCoin

Use it for:
- economic and token narrative
- partner, ecosystem, or public token-facing materials

Do not use it for:
- competing runtime canonical if `roadcoin.blackroad.io` is primary
- generic finance content unrelated to RoadCoin

Routing guidance:
- best as a branded portal that points into `roadcoin.blackroad.io`

### 17. `brand.blackroad.io`
Role:
- design source of truth

Use it for:
- live brand tokens
- approved colors, type, gradients, spacing, and UI examples
- reusable visual language references

Do not use it for:
- unrelated product marketing
- experimental layouts that drift from the approved system

Routing guidance:
- future agents should treat this as the live visual canon unless a newer explicit design source replaces it

### 18. `docs.blackroad.io`
Role:
- documentation home

Use it for:
- product docs
- developer docs
- implementation docs
- internal-to-external documentation surfaces as appropriate

Do not use it for:
- generic marketing pages
- duplicate product homepages
- scattered note dumps without structure

Routing guidance:
- documentation should consolidate here or under intentionally scoped docs surfaces
- docs pages need stronger canonical, H1, and metadata discipline than they currently have

### 19. `api.blackroad.io`
Role:
- shared API gateway and platform API surface

Use it for:
- shared platform APIs
- centralized auth or service calls where shared routing is appropriate
- versioned platform endpoints

Do not use it for:
- arbitrary product UI
- silently routing to unrelated product services
- generic HTML landing pages

Routing guidance:
- keep this explicit, versioned, and health-checkable
- if a product has a local API, use `product.blackroad.io/api/*`
- use `api.blackroad.io` only for genuinely shared platform functionality

### 20. `status.blackroad.io`
Role:
- operational status surface

Use it for:
- uptime
- incidents
- maintenance windows
- service and fleet health summaries

Do not use it for:
- generic dashboards unrelated to operational status
- product marketing
- hidden admin tools exposed publicly by accident

Routing guidance:
- keep it trustable, simple, and operationally accurate
- status should reflect live reality, not stale inventory

## Domain Decision Rules
Future agents should use these rules when deciding where something belongs.

### Root-domain rules
- Root domains should be brand, corporate, research, or ecosystem surfaces.
- Root domains should not become duplicate product runtimes by accident.
- If a root domain and a `*.blackroad.io` product host compete, the product host should usually win as canonical.

### Platform-host rules
- `brand.blackroad.io`, `docs.blackroad.io`, `api.blackroad.io`, and `status.blackroad.io` are strategic platform surfaces.
- These should be treated with the same discipline as root domains because they influence the whole ecosystem.

### Redirect rules
- If a root domain is only a portal, it should point cleanly into canonical product hosts.
- If a host no longer has a unique purpose, redirect it or archive it.
- Do not leave near-duplicate surfaces live without an explicit strategic reason.

### Archive rules
- A domain can remain owned without remaining active.
- If a domain is legacy, note whether it is:
- active
- portal-only
- parked
- redirect-only
- archive-only

## 20-Domain Completion Checklist
Before a domain plan is considered complete, future agents should answer yes to all of these:

- Is the purpose of the domain explicit?
- Is it clear whether the domain is root brand, company, research, portal, docs, API, status, or runtime?
- Is it clear what should live there?
- Is it clear what should never live there?
- Is it clear whether the domain owns canonical content or redirects to canonicals?
- Is the relationship to `blackroad.io` explicit?
- If the domain supports a product, is the product host still canonical?
- Could a future agent read this and avoid creating a duplicate surface?

## Path Plan For All 20 Domains
This section defines what the major paths should mean on every strategic domain or platform surface. Future agents should not improvise route trees when these rules already cover the use case.

### Global path rules
- `/` = the primary intended public surface for that domain
- `/app` = authenticated app shell only when the root is intentionally marketing, company, docs, or ecosystem-facing
- `/docs` = documentation only when the domain is not already the docs surface
- `/health` = runtime health endpoint only for runtime-backed hosts
- `/api/*` = local API only when the domain owns runtime behavior
- `/status` = human-readable service or platform status page when appropriate
- `/admin` = internal/admin surface only if it is authenticated and intentionally present

### 1. `blackroad.io`
- `/` = portfolio root and ecosystem overview
- `/app` = optional umbrella signed-in shell
- `/products` = product index across the 18 canonical products
- `/orgs` = org map or ecosystem ownership overview
- `/about` = high-level platform/company narrative
- `/docs` = optional landing page that points into `docs.blackroad.io`, not a second full docs tree
- `/status` = pointer into `status.blackroad.io`, not the primary status implementation
- `/health` = omit unless `blackroad.io` is runtime-backed and operational checks actually need it

### 2. `blackroad.company`
- `/` = company homepage
- `/about` = company story and structure
- `/team` = leadership and roles
- `/careers` = hiring
- `/press` = press and public-facing materials
- `/contact` = company contact
- `/investors` = optional investor or corporate materials
- `/app` = avoid by default
- `/health` = omit by default

### 3. `blackroad.systems`
- `/` = systems overview
- `/fleet` = machine and node inventory summary
- `/infra` = infrastructure architecture overview
- `/services` = public-facing service map
- `/status` = high-level systems status explainer or pointer to `status.blackroad.io`
- `/docs` = systems docs landing if needed
- `/app` = avoid unless this becomes an authenticated systems console
- `/health` = allow only if the host is runtime-backed

### 4. `blackroad.network`
- `/` = network overview
- `/topology` = network map and trust boundaries
- `/hosts` = host directory summary
- `/routes` = routing and tunnel overview
- `/status` = network-specific health or pointer into the main status surface
- `/docs` = network docs if intentionally hosted here
- `/health` = allow only if runtime-backed

### 5. `blackroad.me`
- `/` = founder/personal landing
- `/writing` = essays and articles
- `/notes` = personal notes or public notebook
- `/projects` = personal project view into the wider ecosystem
- `/contact` = personal contact
- `/app` = avoid
- `/health` = omit

### 6. `blackroadai.com`
- `/` = AI brand landing
- `/platform` = AI platform overview
- `/agents` = agent system overview
- `/models` = model and routing overview
- `/products` = links into AI-relevant products
- `/docs` = optional AI docs landing, but prefer canonical docs elsewhere
- `/app` = avoid unless this becomes a dedicated AI workspace
- `/health` = omit unless runtime-backed

### 7. `blackroadinc.us`
- `/` = legal/incorporation surface
- `/legal` = legal information
- `/compliance` = compliance and policy summary
- `/contact` = official corporate contact
- `/app` = avoid
- `/health` = omit

### 8. `blackroadqi.com`
- `/` = QI brand landing
- `/research` = symbolic and reasoning research overview
- `/concepts` = concept index
- `/papers` = papers and essays
- `/tools` = links to productized reasoning tools if any
- `/app` = avoid unless there is a dedicated QI workspace
- `/health` = omit unless runtime-backed

### 9. `blackboxprogramming.io`
- `/` = legacy or adjacent programming brand landing
- `/archive` = legacy archive if preserved
- `/projects` = project index
- `/migrate` = migration guidance into canonical BlackRoad surfaces
- `/app` = avoid by default
- `/health` = omit unless runtime-backed

### 10. `blackroad.dev`
- `/` = developer landing
- `/docs` = developer docs landing or redirect into `docs.blackroad.io`
- `/sdk` = SDK overview
- `/api` = developer-facing API overview, not necessarily the live gateway itself
- `/examples` = implementation examples
- `/app` = avoid unless there is a dedicated developer dashboard
- `/health` = omit unless runtime-backed

### 11. `lucidia.studio`
- `/` = studio landing
- `/work` = design showcase
- `/system` = design system overview
- `/brand` = branded UI language and motion references
- `/templates` = approved template gallery
- `/app` = avoid
- `/health` = omit unless runtime-backed

### 12. `lucidia.earth`
- `/` = Lucidia ecosystem landing
- `/agents` = agent ecosystem overview
- `/vision` = long-horizon narrative
- `/world` = broader systems worldview content
- `/docs` = optional narrative docs or lore-like docs if intentionally hosted
- `/app` = avoid unless this becomes a dedicated Lucidia workspace
- `/health` = omit unless runtime-backed

### 13. `lucidiaqi.com`
- `/` = Lucidia QI landing
- `/research` = QI and symbolic reasoning content
- `/methods` = methods or frameworks
- `/papers` = paper index
- `/app` = avoid by default
- `/health` = omit unless runtime-backed

### 14. `aliceqi.com`
- `/` = Alice QI landing
- `/guide` = guided introduction
- `/learn` = lighter educational entry points
- `/notes` = reasoning notes
- `/app` = avoid unless this becomes a guided workspace
- `/health` = omit unless runtime-backed

### 15. `roadchain.io`
- `/` = RoadChain branded portal
- `/protocol` = protocol overview
- `/ecosystem` = ecosystem map
- `/docs` = external docs landing or redirect to canonical docs
- `/app` = usually redirect to `roadchain.blackroad.io/` if runtime access is needed
- `/health` = omit on the root domain; keep health on canonical runtime host if needed

### 16. `roadcoin.io`
- `/` = RoadCoin branded portal
- `/economy` = token and economy overview
- `/wallet` = wallet explainer or redirect to canonical runtime host
- `/docs` = docs landing if intentionally maintained
- `/app` = usually redirect to `roadcoin.blackroad.io/`
- `/health` = omit on the root domain

### 17. `brand.blackroad.io`
- `/` = live brand guide
- `/tokens` = color, type, spacing, and motion tokens
- `/components` = approved UI component examples
- `/templates` = approved page/system templates
- `/logos` = logo and marks
- `/usage` = brand usage rules
- `/app` = avoid
- `/health` = omit unless runtime-backed

### 18. `docs.blackroad.io`
- `/` = docs home
- `/products` = product documentation index
- `/api` = API docs
- `/guides` = implementation and usage guides
- `/reference` = technical reference
- `/ops` = internal or semi-internal operations docs if intentionally published here
- `/search` = docs search
- `/app` = avoid
- `/health` = allow only if docs runtime needs it

### 19. `api.blackroad.io`
- `/` = small API overview or machine-readable service banner
- `/health` = canonical health endpoint
- `/ready` = readiness endpoint if needed
- `/version` = version/build endpoint
- `/v1/*` = primary shared API version
- `/v2/*` = future shared API version
- `/docs` = short pointer into API docs, not a full duplicate docs site
- `/app` = never

### 20. `status.blackroad.io`
- `/` = primary status page
- `/incidents` = incident history
- `/maintenance` = scheduled maintenance
- `/services` = service component status
- `/fleet` = host-level fleet status if intentionally exposed
- `/history` = uptime history
- `/health` = optional if the status service itself is runtime-backed
- `/app` = never

## Path Decision Rules
- Use `/app` on a domain only when the root is intentionally something else.
- Do not add `/app` to product hosts that are already the runtime.
- Keep `/health` on runtime hosts, not on static marketing surfaces just for symmetry.
- Keep root domains clean and narrative-first unless they are intentionally operational surfaces.
- Prefer redirecting from a root-domain action page into a canonical product host instead of recreating the whole product there.

## Path Completion Checklist
- Is the meaning of `/` explicit for the domain?
- Is `/app` either justified or rejected?
- Is `/docs` either local, delegated, or intentionally absent?
- Is `/health` either required or omitted?
- Is the live runtime kept on the canonical host rather than duplicated?
- Could a future agent add routes without violating these path rules?

## Known Fleet Hosts
This is the current known host map grounded in direct SSH and Tailscale checks on 2026-04-08. Future agents should treat this section as operational reality, not aspirational inventory.

### Reachable and Usable Now
| Host | Address / Identity | Primary Role | Current Status | Notes |
| --- | --- | --- | --- | --- |
| `lucidia` | `192.168.4.38` | Core intelligence, local fleet node | Reachable | SSH works as user `octavia`. Tailscale is running. Gitea is live here in Docker even though older docs place it on Octavia. |
| `cecilia` | `192.168.4.105` | Executive operator, orchestration node | Reachable | SSH works as user `blackroad`. Tailscale is running. Ollama is active. |
| `anastasia` | `174.138.44.45` | Restoration and recovery, cloud node | Reachable | SSH works as user `root`. Tailscale is running. Docker is active. |
| `gematria` | `159.65.43.12` | Pattern engine, cloud node | Reachable | SSH works as user `root`. Tailscale is running. Caddy is active. |
| `alice` | `192.168.4.49` | Onboarding and utility node | Reachable | SSH works as user `pi`. Tailscale is running. Pi-hole, PostgreSQL, and Redis are active. |

### Known but Currently Offline
| Host | Last Known Address | Intended Role | Current Status | Notes |
| --- | --- | --- | --- | --- |
| `aria` | `192.168.4.98` | Voice interface, monitoring, Headscale / Portainer node | Offline | Direct SSH fails. Multiple healthy nodes report `Online=false` in Tailscale. Neighbor resolution fails on the LAN. Treat as a physical or network recovery job, not an SSH fix. |
| `octavia` | `192.168.4.101` | Systems orchestrator, queue manager, former Gitea / NATS node | Offline | Direct SSH fails and the host is down. Multiple healthy nodes report `Online=false` in Tailscale. Neighbor resolution is incomplete on the LAN. Treat as a physical or network recovery job. |

### Alias and Identity Notes
- `blackroad` is currently an alias to `lucidia`, not a separate machine.
- `codex-infinity` is the Tailscale identity for the machine reached as `gematria`.
- Older scripts and docs still contain stale IPs and role assumptions, especially for `cecilia`, `aria`, and `octavia`.
- Future agents should prefer the current centralized node registry and live reachability checks over historical prose.

### Operational Rule
- A machine is only considered agent-usable if it is reachable by SSH and visible as online in Tailscale.
- If a host is offline in both LAN reachability and Tailscale, do not spend time trying to "fix SSH" first.
- If a service has migrated from one node to another, update the docs to reflect where it is actually live.

## GitHub Organizations (44 orgs, ~2,900+ repos)

Last audited: 2026-04-08.

### Tier 1 — Core Operating Orgs (repos > 50)
| Org | Repos | Role |
|-----|-------|------|
| `BlackRoad-Archive` | 500+ | Legacy preservation, archived repos, micro-service graveyard |
| `BlackRoad-Forge` | 485 | Fork factory — sovereign forks, game engines, OS forks, tools |
| `BlackRoad-OS-Inc` | 329 | **Primary org.** Monorepo, sovereign forks, domain repos, workers, all Road* tools |
| `BlackRoad-OS` | 93 | Platform shell, shared primitives, archived early repos |
| `BlackRoadOS` | 66 | **Public-facing mirror.** 18 products + infra + philosophical repos (How/Why/Where/When/What/Who) |
| `BlackRoad-AI` | 65 | Lucidia ecosystem, inference engines, model deployments, AI memory |

### Tier 2 — Active Specialty Orgs (repos 10–50)
| Org | Repos | Role |
|-----|-------|------|
| `BlackRoad-Studio` | 37 | Design system, brand, pixel art, templates, writing/video studio |
| `BlackRoad-Network` | 35 | Mesh, DNS, VPN, tunnels, subdomain repos, fleet networking |
| `BlackRoad-Sandbox` | 27 | Training materials, playgrounds, demos, experiments, test tooling |
| `BlackRoad-Hardware` | 22 | Pi fleet, Hailo NPU, IoT, device registry, firmware |
| `BlackRoad-Interactive` | 22 | RoadWorld, metaverse, game engines, pixel worlds |
| `BlackRoad-Products` | 18 | **Canonical private product repos.** All 18 products live here. |
| `BlackRoad-Media` | 17 | Content, social, streaming, blog, brand kit |
| `BlackRoad-Labs` | 15 | Research, Amundson, quantum math, ML pipelines |
| `BlackRoad-Security` | 15 | Auth, encryption, compliance, secret scanning, access control |
| `BlackRoad-Cloud` | 13 | Kubernetes, Terraform, container registry, deployment |
| `BlackRoad-Agents` | 11 | Agent definitions, training materials, swarm frameworks |

### Tier 3 — Small Active Orgs (repos 3–9)
| Org | Repos | Role |
|-----|-------|------|
| `BlackRoad-Gov` | 7 | Governance, compliance frameworks |
| `BlackRoad-Foundation` | 7 | Public good, community, donor management |
| `BlackRoad-Ventures` | 6 | Business, partnerships |
| `BlackRoad-Education` | 6 | Learning, tutoring |
| `Blackbox-Enterprises` | 6 | Legacy enterprise entity |
| `BlackRoad-Dev` | 4 | Claude Code forks, n8n analysis |
| `BlackRoad-QI` | 3 | Quantum intelligence |
| `BlackRoad-Quantum` | 3 | Quantum computing research |
| `BlackRoad-README` | 3 | Master README document (42 sections), RoadCode |
| `BlackRoad-Index` | 2 | Master index of everything |

### Tier 4 — Placeholder Orgs (1 repo or empty)
| Org | Repos | Status |
|-----|-------|--------|
| `BlackRoad-Alphabet` | 1 | .github only |
| `BlackRoad-Anthropic` | 1 | .github only |
| `BlackRoad-App` | 1 | .github only |
| `BlackRoad-Com` | 1 | .github only |
| `BlackRoad-Data` | 1 | .github only |
| `BlackRoad-Google` | 1 | .github only |
| `BlackRoad-Nvidia` | 1 | .github only |
| `BlackRoad-OpenAI` | 1 | .github only |
| `BlackRoad-Tech` | 1 | .github only |
| `BlackRoad-X` | 1 | .github only |
| `BlackRoad-XYZ` | 1 | .github only |
| `BlackRoad-xAI` | 1 | .github only |
| `BlackRoad-Code-Solutions` | 0 | **Empty** |
| `BlackRoad-Codex` | 0 | **Empty** |
| `BlackRoad-Memory` | 0 | **Empty** |
| `BlackRoad-OS-Corporate` | 0 | **Empty** |
| `Road-Code` | 0 | **Empty** |

## Current Live `blackroad.io` Subdomains
These were listed as live in the cleaned source and should be normalized against the canonical rules above.

- `backroad.blackroad.io`
- `blackboard.blackroad.io`
- `blackroados.blackroad.io`
- `brand.blackroad.io`
- `cadence.blackroad.io`
- `canvas.blackroad.io`
- `carkeys.blackroad.io`
- `chat.blackroad.io`
- `game.blackroad.io`
- `highway.blackroad.io`
- `hq.blackroad.io`
- `kpi.blackroad.io`
- `live.blackroad.io`
- `officeroad.blackroad.io`
- `oneway.blackroad.io`
- `os.blackroad.io`
- `pay.blackroad.io`
- `radio.blackroad.io`
- `roadai.blackroad.io`
- `roadbook.blackroad.io`
- `roadchat.blackroad.io`
- `roadcode.blackroad.io`
- `roadcoin.blackroad.io`
- `roadie.blackroad.io`
- `roadmath.blackroad.io`
- `roadpulse.blackroad.io`
- `roadside.blackroad.io`
- `roadtrip.blackroad.io`
- `roadview.blackroad.io`
- `roadwork.blackroad.io`
- `roadworld.blackroad.io`
- `search.blackroad.io`
- `seo.blackroad.io`
- `social.blackroad.io`
- `tutor.blackroad.io`
- `video.blackroad.io`

## Hosts Currently Listed as Down
- `app.blackroad.io`
- `roadauth.blackroad.io`
- `roadlog.blackroad.io`

## Recommended Normalization Pass
### Keep
- product canonicals that already match full-name or function-first hosts
- `brand.blackroad.io` as the design source of truth
- `blackroad.io` as the umbrella entry point

### Redirect
- alias hosts that duplicate a product
- redundant naming pairs such as `roadchat` vs `chat`, `roadview` vs `search`, `roadie` vs `tutor`

### Decide Explicitly
- If the brand name is stronger than the function name, choose one canonical host and redirect the other
- If a host is a marketing surface only, keep `/` marketing and move the signed-in surface to `/app`
- If a host is a true application, keep the application at `/`

## Recommended Canonical Decisions for Existing Duplicates
- `chat.blackroad.io` canonical, `roadchat.blackroad.io` redirect
- `search.blackroad.io` canonical, `roadview.blackroad.io` redirect
- `tutor.blackroad.io` or `roadie.blackroad.io`: choose one, do not keep both indexable
- `os.blackroad.io` canonical, `blackroados.blackroad.io` redirect

## Agent Operating Manual
This section exists so future agents can work from one document instead of reconstructing the system from scattered notes.

### Primary Goal
Every agent should reduce ambiguity, not add to it.

That means:
- use canonical products, hosts, and orgs
- use the approved BlackRoad visual system
- prefer redirects over duplicate surfaces
- update the canonical docs when structural reality changes
- treat old inventory as historical context, not automatic truth

### Required Read Order
Before making structural changes, future agents should read in this order:

1. [BlackRoad-Canonical-Product-Structures.md](/Users/alexa/Downloads/BlackRoad-Canonical-Product-Structures.md)
2. [BlackRoad-18-Products-20-Orgs-Domain-Plan.md](/Users/alexa/Downloads/BlackRoad-18-Products-20-Orgs-Domain-Plan.md)
3. [BlackRoad-Agent-Execution-Spec.md](/Users/alexa/Downloads/BlackRoad-Agent-Execution-Spec.md)
4. [BlackRoad-Empire-Full-Plan.canonical.md](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.canonical.md)
5. [blackroad-brand-guide.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-brand-guide.html)
6. [blackroad-color-preview.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-color-preview.html)
7. [blackroad-os-inventory.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-os-inventory.html)

Only after that should agents fall back to:
- [BlackRoad-Empire-Full-Plan.cleaned.txt](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.cleaned.txt)
- [BlackRoad-Empire-Full-Plan.txt](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.txt)
- [BR-Context](/Users/alexa/Desktop/BR-Context)

### Source-of-Truth Hierarchy
If two things conflict, trust them in this order:

1. live implemented reality that has been directly verified
2. canonical Markdown docs in `Downloads`
3. current BlackRoadOS visual files in `Desktop/BlackRoadOS`
4. centralized config files such as [nodes.sh](/Users/alexa/.blackroad/config/nodes.sh)
5. older planning files and raw dumps

### Work-Type Routing
Agents should classify their task before acting.

#### Product work
Use when the task is about:
- app structure
- product routes
- product naming
- product shell
- product API scope

Required decisions:
- product canonical name
- canonical hostname
- owning org
- route model
- root vs `/app`
- whether `/health` exists

#### Domain work
Use when the task is about:
- redirects
- canonical host selection
- DNS cleanup
- duplicate surfaces
- SEO normalization

Required decisions:
- canonical host
- alias hosts
- redirect targets
- whether the host is product, marketing, docs, or infra

#### Design work
Use when the task is about:
- HTML or JSX visuals
- templates
- component systems
- navigation shells
- dashboard, docs, status, or marketing surfaces

Required decisions:
- which BlackRoadOS reference file matches the surface
- whether the surface is app, docs, dashboard, status, or marketing
- which tokens, layouts, and patterns must be reused

#### Infrastructure work
Use when the task is about:
- fleet hosts
- health checks
- deployment
- service ownership
- runtime topology

Required decisions:
- which machine or cloud node owns the service
- whether the service is reachable and live now
- whether the service moved from older documented locations
- whether docs need to be corrected to match reality

#### Documentation work
Use when the task is about:
- planning docs
- architecture docs
- execution guides
- prompts
- checklists

Required decisions:
- which canonical doc should change
- whether this is strategy, implementation, or operational truth
- whether raw archive files should remain untouched

## Agent Prompt Pack
Future agents can use these prompts as operating scaffolds instead of improvising.

### Prompt: structural planning
Use this when planning a product, domain, or org change.

```text
You are working on BlackRoad. Do not invent new structure.

Read and follow these in order:
1. BlackRoad-Canonical-Product-Structures.md
2. BlackRoad-18-Products-20-Orgs-Domain-Plan.md
3. BlackRoad-Agent-Execution-Spec.md
4. BlackRoad-Empire-Full-Plan.canonical.md
5. BlackRoadOS visual source files

Your job:
- identify the canonical product
- identify the canonical host
- identify the owning org
- decide whether `/` or `/app` is correct
- decide whether `/health` is required
- avoid duplicate canonicals
- prefer redirects for aliases
- update canonical docs if reality changed

Do not create new products, orgs, domains, or design systems unless the existing structure cannot support the task.
```

### Prompt: frontend implementation
Use this when building or fixing a product surface.

```text
Implement this BlackRoad surface using the approved design language only.

Constraints:
- match BlackRoadOS reference files
- do not invent a new visual direction
- use the canonical hostname and route model
- keep product apps at `/` unless the canonical docs explicitly justify `/app`
- expose `/health` only if the runtime needs it
- keep aliases and duplicate surfaces out of the implementation

Before finishing:
- verify the route model
- verify ownership mapping
- verify the visual shell matches BlackRoad
- update canonical docs if the structure changed
```

### Prompt: infrastructure or host audit
Use this when checking fleet machines or service placement.

```text
Audit BlackRoad infrastructure against live reality.

Your job:
- verify which hosts are reachable
- verify Tailscale state
- verify actual service placement
- separate live reality from stale docs
- update canonical documentation to reflect current truth

Rules:
- do not assume old host assignments are still correct
- if a service moved, document where it is actually live
- if a host is offline in both SSH and Tailscale, treat it as a physical or network recovery issue
- keep naming and alias notes explicit for future agents
```

### Prompt: documentation cleanup
Use this when consolidating scattered notes.

```text
Turn scattered BlackRoad planning into canonical operating documentation.

Rules:
- preserve only the information that changes execution
- remove duplicate or conflicting lists
- separate historical notes from canonical rules
- add checklists, prompts, and completion criteria
- optimize for future AI agents reading quickly and acting correctly
```

## Execution Checklists
These checklists should be followed explicitly.

### Universal preflight checklist
- identify the work type: product, domain, design, infrastructure, or docs
- read the canonical docs before acting
- identify the canonical product if one exists
- identify the canonical host
- identify the owning org
- identify the relevant BlackRoadOS visual reference
- check whether live reality already differs from the docs

### Product checklist
- confirm this is one of the 18 canonical products
- confirm the canonical hostname
- confirm whether the app belongs at `/`
- justify `/app` only if the root is intentionally marketing or overview
- decide whether `/health` is required
- define the core surfaces
- define the app tree or route tree
- confirm which aliases must redirect

### Domain checklist
- list all competing hosts for the same surface
- choose one canonical host
- convert duplicates into redirects
- check canonical tags and indexability
- remove malformed or conflicting canonical URLs
- ensure the host purpose is explicit: product, docs, marketing, or infra

### Design checklist
- identify the closest BlackRoadOS reference file
- copy tokens, shell logic, spacing rhythm, and type direction from approved files
- do not introduce a new color system
- do not introduce a new typography system
- ensure app, docs, dashboard, and status surfaces feel like one family
- make sure any HTML templates are aligned to the approved brand system

### Infrastructure checklist
- verify live reachability before trusting inventory
- verify Tailscale status
- verify actual service placement
- note aliases and host identity mismatches
- mark offline hosts clearly as offline, not merely misconfigured
- update fleet docs if reality changed

### Documentation checklist
- update the canonical doc first
- keep archive files untouched unless the task is archive cleanup
- separate rules from notes

## 18 Product Specs
This section turns the platform-wide rules into product-level operating decisions. Future agents should use these entries before inventing new routes, aliases, or org placement.

### 1. BlackRoad OS
- Canonical product name: BlackRoad OS
- Canonical hostname: `os.blackroad.io`
- Primary role: browser-native umbrella shell and system entry point
- Owning org: `BlackRoad-OS-Inc`
- Route model: root may be overview or shell launcher; `/app` is allowed only if the root remains a public overview
- Product-local API: optional under `/api/*` when the shell owns platform workflows
- Health policy: allow `/health` only if the host is runtime-backed
- Required aliases: `blackroados.blackroad.io` should redirect to `os.blackroad.io`
- Notes: this is the only product where `/app` may be strategically justified at the canonical host

### 2. RoadTrip
- Canonical product name: RoadTrip
- Canonical hostname: `roadtrip.blackroad.io`
- Primary role: agent convoy chat and multi-agent coordination
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `roadtrip.blackroad.io/api/*`
- Health policy: expose `/health` if the runtime is active
- Required aliases: `trip.blackroad.io` should redirect if present
- Notes: do not place the main experience at `/app` unless the host is intentionally split into marketing plus workspace

### 3. Roadie
- Canonical product name: Roadie
- Canonical hostname: `tutor.blackroad.io`
- Primary role: tutoring and guided educational interface
- Owning org: `BlackRoad-Education`
- Route model: product lives at `/`
- Product-local API: `tutor.blackroad.io/api/*`
- Health policy: expose `/health` only if runtime-backed
- Required aliases: `roadie.blackroad.io` should redirect to `tutor.blackroad.io`
- Notes: brand may remain Roadie while the canonical host stays function-first

### 4. RoadChat
- Canonical product name: RoadChat
- Canonical hostname: `chat.blackroad.io`
- Primary role: direct AI chat product
- Owning org: `BlackRoad-AI`
- Route model: product lives at `/`
- Product-local API: `chat.blackroad.io/api/*`
- Health policy: expose `/health` if the service is runtime-backed
- Required aliases: `roadchat.blackroad.io` should redirect to `chat.blackroad.io`
- Notes: do not keep both `chat` and `roadchat` indexable

### 5. RoadCode
- Canonical product name: RoadCode
- Canonical hostname: `roadcode.blackroad.io`
- Primary role: code editor, workspace, and developer execution surface
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `roadcode.blackroad.io/api/*`
- Health policy: expose `/health` if runtime-backed
- Required aliases: `code.blackroad.io` should redirect if present
- Notes: editor and workspace should remain root-based, not `/app`-based

### 6. BackRoad
- Canonical product name: BackRoad
- Canonical hostname: `social.blackroad.io`
- Primary role: social layer and networked activity surface
- Owning org: `BlackRoad-Media`
- Route model: product lives at `/`
- Product-local API: `social.blackroad.io/api/*`
- Health policy: expose `/health` only if runtime-backed
- Required aliases: `backroad.blackroad.io` should redirect to `social.blackroad.io`
- Notes: keep the host function-first while preserving the BackRoad brand in product language

### 7. RoadBook
- Canonical product name: RoadBook
- Canonical hostname: `roadbook.blackroad.io`
- Primary role: publishing, docs-like composition, and narrative output
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `roadbook.blackroad.io/api/*`
- Health policy: expose `/health` if runtime-backed
- Required aliases: `book.blackroad.io` should redirect if present
- Notes: avoid splitting authoring into a separate duplicate hostname unless scale demands it

### 8. RoadWorld
- Canonical product name: RoadWorld
- Canonical hostname: `roadworld.blackroad.io`
- Primary role: world builder, simulation, and interactive engine surface
- Owning org: `BlackRoad-Interactive`
- Route model: product lives at `/`
- Product-local API: `roadworld.blackroad.io/api/*`
- Health policy: expose `/health` if runtime-backed
- Required aliases: `world.blackroad.io` should redirect if present
- Notes: if heavy engine services are separated later, keep the canonical user-facing runtime on this host

### 9. OfficeRoad
- Canonical product name: OfficeRoad
- Canonical hostname: `officeroad.blackroad.io`
- Primary role: live office, activity, and operational coordination surface
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `officeroad.blackroad.io/api/*`
- Health policy: expose `/health` if runtime-backed
- Required aliases: `office.blackroad.io` should redirect if present
- Notes: keep this distinct from company-facing or corporate domains

### 10. RoadWork
- Canonical product name: RoadWork
- Canonical hostname: `roadwork.blackroad.io`
- Primary role: business operations, compliance, and work execution tools
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `roadwork.blackroad.io/api/*`
- Health policy: expose `/health` if runtime-backed
- Required aliases: `work.blackroad.io` should redirect if present
- Notes: do not duplicate this experience onto `blackroad.company`

### 11. CarKeys
- Canonical product name: CarKeys
- Canonical hostname: `carkeys.blackroad.io`
- Primary role: identity, auth, vault, and access control
- Owning org: `BlackRoad-Security`
- Route model: product lives at `/`
- Product-local API: `carkeys.blackroad.io/api/*`
- Health policy: `/health` is recommended because auth infrastructure is operationally important
- Required aliases: `keys.blackroad.io` should redirect if present
- Notes: if shared auth endpoints move to `api.blackroad.io`, keep this host as the identity product surface

### 12. CarPool
- Canonical product name: CarPool
- Canonical hostname: `carpool.blackroad.io`
- Primary role: model routing, orchestration, and provider switching
- Owning org: `BlackRoad-AI`
- Route model: product lives at `/`
- Product-local API: `carpool.blackroad.io/api/*`
- Health policy: `/health` is recommended because this is infrastructure-adjacent
- Required aliases: `pool.blackroad.io` should redirect if present
- Notes: shared routing APIs may also surface under `api.blackroad.io` if they are platform-wide rather than product-local

### 13. RoadChain
- Canonical product name: RoadChain
- Canonical hostname: `roadchain.blackroad.io`
- Primary role: ledger, protocol, and chain-facing runtime
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `roadchain.blackroad.io/api/*`
- Health policy: `/health` is recommended
- Required aliases: `chain.blackroad.io` and `roadchain.io/app` should redirect to the canonical runtime as needed
- Notes: `roadchain.io` should remain a branded portal, not the competing runtime canonical

### 14. RoadCoin
- Canonical product name: RoadCoin
- Canonical hostname: `roadcoin.blackroad.io`
- Primary role: token economy, balances, and economics-facing runtime
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `roadcoin.blackroad.io/api/*`
- Health policy: `/health` is recommended
- Required aliases: `coin.blackroad.io` and `roadcoin.io/app` should redirect to the canonical runtime as needed
- Notes: `roadcoin.io` should remain a branded portal unless a future explicit canonical migration replaces this rule

### 15. RoadSide
- Canonical product name: RoadSide
- Canonical hostname: `roadside.blackroad.io`
- Primary role: onboarding, intake, and guided setup
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `roadside.blackroad.io/api/*`
- Health policy: expose `/health` only if runtime-backed
- Required aliases: `side.blackroad.io` should redirect if present
- Notes: this should be the canonical first-run product surface, not `blackroad.io`

### 16. OneWay
- Canonical product name: OneWay
- Canonical hostname: `oneway.blackroad.io`
- Primary role: export, publish-out, and one-way distribution
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `oneway.blackroad.io/api/*`
- Health policy: expose `/health` if runtime-backed
- Required aliases: `way.blackroad.io` should redirect if present
- Notes: keep the runtime simple and single-purpose

### 17. BlackBoard
- Canonical product name: BlackBoard
- Canonical hostname: `blackboard.blackroad.io`
- Primary role: analytics, KPI, and decision intelligence surface
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `blackboard.blackroad.io/api/*`
- Health policy: `/health` is recommended because dashboards often depend on live data backends
- Required aliases: `board.blackroad.io` should redirect if present
- Notes: do not split KPI and analytics onto multiple competing canonical hosts without an explicit product split

### 18. RoadView
- Canonical product name: RoadView
- Canonical hostname: `search.blackroad.io`
- Primary role: search, retrieval, and discovery surface
- Owning org: `BlackRoad-Products`
- Route model: product lives at `/`
- Product-local API: `search.blackroad.io/api/*`
- Health policy: expose `/health` if runtime-backed
- Required aliases: `roadview.blackroad.io` should redirect to `search.blackroad.io`
- Notes: keep `search` canonical and treat RoadView as the product brand, not a second indexable runtime

## Product Completion Checklist
- Is the product one of the 18 canonical products?
- Is the canonical hostname explicit and singular?
- Is the owning org explicit?
- Is the route model explicit at `/` or explicitly justified at `/app`?
- Is the alias policy explicit?
- Is the health endpoint policy explicit?
- Is the product-local API scope explicit?
- Could a future agent implement this product without inventing a competing canonical?

## Redirect Matrix
This section converts the currently observed `blackroad.io` subdomains into explicit canonical decisions. Future agents should update this table instead of keeping redirect intent in scattered notes.

### Decision labels
- `canonical` = primary indexable host for a product or strategic platform surface
- `redirect` = should `301` to a canonical host
- `portal-only` = can stay live as a branded or informational surface, but should not compete with a runtime canonical
- `decide` = still needs an explicit keep, redirect, archive, or merge decision
- `offline` = currently down; decide whether to restore, redirect, or retire before bringing it back

| Host | Decision | Target / Canonical | Purpose | Notes |
| --- | --- | --- | --- | --- |
| `backroad.blackroad.io` | `redirect` | `https://social.blackroad.io/` | BackRoad brand alias | Keep BackRoad as product branding, not as a second canonical host. |
| `blackboard.blackroad.io` | `canonical` | `https://blackboard.blackroad.io/` | Analytics product | Canonical BlackBoard runtime. |
| `blackroados.blackroad.io` | `redirect` | `https://os.blackroad.io/` | OS alias | Do not keep both `blackroados` and `os` indexable. |
| `brand.blackroad.io` | `canonical` | `https://brand.blackroad.io/` | Brand source of truth | Strategic platform surface, not a product alias. |
| `cadence.blackroad.io` | `decide` | pending | Unknown or underdefined surface | Either map to a canonical product/domain purpose or retire it. |
| `canvas.blackroad.io` | `decide` | pending | Unknown or underdefined surface | Do not leave live without a scoped purpose and owner. |
| `carkeys.blackroad.io` | `canonical` | `https://carkeys.blackroad.io/` | Identity and vault product | Canonical CarKeys runtime. |
| `chat.blackroad.io` | `canonical` | `https://chat.blackroad.io/` | AI chat product | Canonical RoadChat runtime. |
| `game.blackroad.io` | `decide` | pending | Possible RoadWorld or interactive alias | If it maps to RoadWorld, redirect there; otherwise define it explicitly. |
| `highway.blackroad.io` | `decide` | pending | Unknown or underdefined surface | Needs explicit ownership and purpose or retirement. |
| `hq.blackroad.io` | `decide` | pending | Possible internal/company portal alias | Strong candidate to redirect into `blackroad.company` or `officeroad.blackroad.io`. |
| `kpi.blackroad.io` | `redirect` | `https://blackboard.blackroad.io/` | Analytics / KPI alias | Keep KPI capability under BlackBoard rather than split canonicals. |
| `live.blackroad.io` | `decide` | pending | Possible live activity or events surface | Either define as a real product/domain surface or redirect to canonical owners. |
| `officeroad.blackroad.io` | `canonical` | `https://officeroad.blackroad.io/` | Live office product | Canonical OfficeRoad runtime. |
| `oneway.blackroad.io` | `canonical` | `https://oneway.blackroad.io/` | Export product | Canonical OneWay runtime. |
| `os.blackroad.io` | `canonical` | `https://os.blackroad.io/` | OS shell | Canonical BlackRoad OS host. |
| `pay.blackroad.io` | `decide` | pending | Possible payments or RoadCoin-adjacent alias | Do not keep live unless explicitly assigned to a product or platform surface. |
| `radio.blackroad.io` | `decide` | pending | Possible media or streaming surface | Could belong to `BlackRoad-Media`, but should not remain ambiguous. |
| `roadai.blackroad.io` | `redirect` | `https://blackroadai.com/` or `https://carpool.blackroad.io/` | AI umbrella alias | Choose one AI umbrella target; do not keep this as a competing canonical. |
| `roadbook.blackroad.io` | `canonical` | `https://roadbook.blackroad.io/` | Publishing product | Canonical RoadBook runtime. |
| `roadchat.blackroad.io` | `redirect` | `https://chat.blackroad.io/` | Chat alias | Duplicate canonical must be removed. |
| `roadcode.blackroad.io` | `canonical` | `https://roadcode.blackroad.io/` | Code editor product | Canonical RoadCode runtime. |
| `roadcoin.blackroad.io` | `canonical` | `https://roadcoin.blackroad.io/` | Token economy product | Canonical RoadCoin runtime. |
| `roadie.blackroad.io` | `redirect` | `https://tutor.blackroad.io/` | Tutor brand alias | Keep brand in UI, not in a second indexable hostname. |
| `roadmath.blackroad.io` | `decide` | pending | Possible QI or education surface | Either map into `blackroadqi.com`, `aliceqi.com`, or an existing product, or retire it. |
| `roadpulse.blackroad.io` | `decide` | pending | Possible analytics or monitoring surface | Could conflict with BlackBoard or status; needs explicit scope. |
| `roadside.blackroad.io` | `canonical` | `https://roadside.blackroad.io/` | Onboarding product | Canonical RoadSide runtime. |
| `roadtrip.blackroad.io` | `canonical` | `https://roadtrip.blackroad.io/` | Agent convoy product | Canonical RoadTrip runtime. |
| `roadview.blackroad.io` | `redirect` | `https://search.blackroad.io/` | Search brand alias | Keep RoadView as branding, not as a second runtime canonical. |
| `roadwork.blackroad.io` | `canonical` | `https://roadwork.blackroad.io/` | Work and compliance product | Canonical RoadWork runtime. |
| `roadworld.blackroad.io` | `canonical` | `https://roadworld.blackroad.io/` | World builder product | Canonical RoadWorld runtime. |
| `search.blackroad.io` | `canonical` | `https://search.blackroad.io/` | Search product | Canonical RoadView runtime host. |
| `seo.blackroad.io` | `decide` | pending | Possible marketing/search operations surface | Either define under docs/marketing or redirect into canonical products. |
| `social.blackroad.io` | `canonical` | `https://social.blackroad.io/` | Social product | Canonical BackRoad runtime host. |
| `tutor.blackroad.io` | `canonical` | `https://tutor.blackroad.io/` | Tutor product | Canonical Roadie runtime host. |
| `video.blackroad.io` | `decide` | pending | Possible media/video surface | If retained, define as a real product or media domain role. |

## Offline Host Decisions
These hosts are currently down and should not simply be restored to their previous behavior without an explicit decision.

| Host | Decision | Target / Canonical | Notes |
| --- | --- | --- | --- |
| `app.blackroad.io` | `decide` | pending | Either restore as the umbrella signed-in shell for `blackroad.io/app` strategy or retire and redirect. |
| `roadauth.blackroad.io` | `redirect` | `https://carkeys.blackroad.io/` or `https://api.blackroad.io/` | Do not restore as a competing auth canonical without a new platform decision. |
| `roadlog.blackroad.io` | `decide` | pending | Either map into analytics, status, or docs, or retire it. |

## Redirect Completion Checklist
- Does every live or recently live subdomain have a decision label?
- Is every redirect target singular and explicit?
- Are product aliases redirecting to canonical product hosts rather than root domains?
- Are branded portals clearly marked as `portal-only` when they are not runtime canonicals?
- Are undefined hosts marked `decide` instead of being allowed to drift?
- Are offline hosts classified before restoration work begins?

## Local Repo And Memory Findings
This section captures higher-confidence local evidence gathered from repo READMEs, the canonical registry, and startup docs. Future agents should prefer these facts over older working-draft assumptions when there is a conflict.

### Canonical Sources Confirmed Locally
- The current canonical planning stack is:
  - `/Users/alexa/docs/BLACKROAD_AGENT_START.md`
  - `/Users/alexa/infra/blackroad_registry.json`
  - `/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md`
- The Downloads draft is useful, but it is not the highest-authority planning source anymore.
- The registry and operating model are aligned around:
  - 18 canonical products
  - 20 strategic domains
  - 20 operating orgs
  - standard API contract: `/api/health`, `/api/ready`, `/api/version`

### Repo-Derived Product Truth
- `services/os/README.md` confirms:
  - canonical host: `os.blackroad.io`
  - route model: `marketing_plus_app_split`
  - runtime path: `/app`
  - health/readiness/version endpoints are required
  - support subdomain: `status.os.blackroad.io`
- `services/roadwork/README.md` confirms:
  - canonical host: `roadwork.blackroad.io`
  - route model: `app_at_root`
  - runtime path: `/`
  - health/readiness/version endpoints are required
  - support subdomain: `api.roadwork.blackroad.io`
- `docs/BLACKROAD_AGENT_START.md` and `docs/BLACKROAD_OPERATING_MODEL.md` confirm the route shape groups:
  - split-surface: `os`, `social`, `roadbook`, `roadworld`, `officeroad`
  - app-at-root: `roadtrip`, `chat`, `roadcode`, `roadwork`, `carkeys`, `oneway`, `roadside`, `tutor`, `roadchain`, `roadcoin`
  - dashboard roots: `search`, `carpool`
  - analytics root: `blackboard`

### Registry-Derived Ownership Truth
- The machine-readable registry currently reports these owning orgs:
  - `os` -> `BlackRoad-OS`
  - `roadtrip` -> `BlackRoad-Agents`
  - `tutor` -> `BlackRoad-Education`
  - `chat` -> `BlackRoad-AI`
  - `roadcode` -> `BlackRoad-Code-Solutions`
  - `social` -> `BlackRoad-Media`
  - `roadbook` -> `BlackRoad-Media`
  - `roadworld` -> `BlackRoad-Interactive`
  - `officeroad` -> `BlackRoad-Interactive`
  - `roadwork` -> `BlackRoad-Products`
  - `carkeys` -> `BlackRoad-Foundation`
  - `carpool` -> `BlackRoad-Infrastructure`
  - `roadchain` -> `BlackRoad-Quantum`
  - `roadcoin` -> `BlackRoad-QI`
  - `roadside` -> `BlackRoad-Products`
  - `oneway` -> `BlackRoad-Data`
  - `blackboard` -> `BlackRoad-Analytics`
  - `search` -> `BlackRoad-Index`
- These ownership mappings are more specific than some of the older generalized org assignments in this draft.

### High-Confidence Redirect And Migration Truth
- The current summary script identifies these as high-priority migrations:
  - `blackroados.blackroad.io` -> `os.blackroad.io`
  - `roadchat.blackroad.io` -> `chat.blackroad.io`
  - `roadview.blackroad.io` -> `search.blackroad.io`
  - `roadie.blackroad.io` -> `tutor.blackroad.io`
  - `backroad.blackroad.io` -> `social.blackroad.io`
  - `kpi.blackroad.io` -> `blackboard.blackroad.io`
  - `seo.blackroad.io` -> `search.blackroad.io` or info-only
  - `live.blackroad.io` -> `officeroad.blackroad.io` or retire
  - `canvas.blackroad.io` -> decide owner, then redirect
  - `cadence.blackroad.io` -> decide owner, then redirect

### Local Infrastructure And Memory Signals
- `BlackRoad-OS-Inc-.github/profile/README.md` describes the platform posture as:
  - self-hosted edge AI operating system
  - 5 Raspberry Pi nodes
  - 75+ Cloudflare Workers
  - 20 custom domains
- `blackroad-memory-repo/README.md` confirms BlackRoad Memory is treated as a real platform subsystem, not just a note-taking artifact:
  - shared journal
  - codex solutions and patterns
  - TIL broadcast
  - FTS5 search
  - orchestrator with large-scale agent scheduling
- `blackroad-io-site/README.md` appears to preserve an older static-site view of `blackroad.io` and should be treated as partial historical context, not as stronger truth than the registry and operating model.

### Reconciliation Rule
- If this draft conflicts with:
  - `BLACKROAD_AGENT_START.md`
  - `blackroad_registry.json`
  - `BLACKROAD_OPERATING_MODEL.md`
  - product service READMEs
- then this draft should be updated to match those sources, not the other way around.
- add explicit next actions where ambiguity previously existed
- make sure future agents can understand the result quickly

## Completion Gate
Work is not complete until these questions all answer yes.

- Is the canonical product clear?
- Is the canonical host clear?
- Is org ownership clear?
- Is the route model clear?
- Is `/app` either explicitly justified or explicitly rejected?
- Is `/health` either explicitly required or explicitly omitted?
- Does the implementation match the BlackRoad design language?
- Were duplicate hosts or aliases handled correctly?
- Did the canonical docs get updated if reality changed?
- Could a new agent continue from this state without re-deciding fundamentals?

## Massive-System Rule
Because BlackRoad is large, future agents must resist the urge to solve confusion by making new structure.

Preferred pattern:
- consolidate
- normalize
- redirect
- document
- enforce

Avoid this pattern:
- duplicate
- rename casually
- add parallel hosts
- add parallel orgs
- add one-off designs
- bury important rules in chat logs

## 18-Product Runtime Plan
This section makes the product layer explicit. Future agents should use it when deciding product hosts, routes, ownership, and implementation scope.

### Global product rules
- Every product gets one canonical hostname.
- The canonical hostname is the only indexable product runtime host.
- Aliases may exist only as redirects or narrow convenience shortcuts.
- Product runtimes should live at `/` unless there is a deliberate marketing-plus-app split.
- `/health` should exist only when the product is runtime-backed.
- `/api/*` can exist on the product host for product-local APIs.

### Product matrix
| Product | Canonical Host | Owning Org | Support Orgs | Route Model | `/health` | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| BlackRoad OS | `os.blackroad.io` | `BlackRoad-OS` | `BlackRoad-Studio`, `BlackRoad-Cloud`, `BlackRoad-Security` | marketing + app split | yes | umbrella shell, desktop, launch control |
| RoadTrip | `roadtrip.blackroad.io` | `BlackRoad-Agents` | `BlackRoad-AI`, `BlackRoad-Foundation` | app at root | yes | convoy and multi-agent chat |
| Roadie | `tutor.blackroad.io` | `BlackRoad-Education` | `BlackRoad-AI`, `BlackRoad-Products` | guided flow at root | yes | tutor and challenge flows |
| RoadChat | `chat.blackroad.io` | `BlackRoad-AI` | `BlackRoad-Cloud`, `BlackRoad-Foundation` | app at root | yes | direct chat runtime |
| RoadCode | `roadcode.blackroad.io` | `BlackRoad-Code-Solutions` | `BlackRoad-Cloud`, `BlackRoad-OS` | app at root | yes | editor, projects, deployments |
| BackRoad | `social.blackroad.io` | `BlackRoad-Media` | `BlackRoad-Studio`, `BlackRoad-Products` | marketing + app split | yes | social, rooms, community |
| RoadBook | `roadbook.blackroad.io` | `BlackRoad-Media` | `BlackRoad-Quantum`, `BlackRoad-Studio` | marketing + app split | yes | writing and publishing |
| RoadWorld | `roadworld.blackroad.io` | `BlackRoad-Interactive` | `BlackRoad-Studio`, `BlackRoad-Cloud` | marketing + app split | yes | builder, worlds, assets |
| OfficeRoad | `officeroad.blackroad.io` | `BlackRoad-Interactive` | `BlackRoad-Agents`, `BlackRoad-Studio` | marketing + app split | yes | live rooms and operational presence |
| RoadWork | `roadwork.blackroad.io` | `BlackRoad-Products` | `BlackRoad-Security`, `BlackRoad-Data` | app at root | yes | business workflows and compliance |
| CarKeys | `carkeys.blackroad.io` | `BlackRoad-Foundation` | `BlackRoad-Security`, `BlackRoad-Cloud` | app at root | yes | auth, sessions, vault |
| CarPool | `carpool.blackroad.io` | `BlackRoad-Infrastructure` | `BlackRoad-AI`, `BlackRoad-Cloud` | app at root | yes | model routing and orchestration |
| RoadChain | `roadchain.blackroad.io` | `BlackRoad-Quantum` | `BlackRoad-QI`, `BlackRoad-Foundation` | app at root | yes | ledger and provenance runtime |
| RoadCoin | `roadcoin.blackroad.io` | `BlackRoad-QI` | `BlackRoad-Quantum`, `BlackRoad-Foundation` | app at root | yes | balances and token logic |
| RoadSide | `roadside.blackroad.io` | `BlackRoad-Products` | `BlackRoad-OS`, `BlackRoad-Studio` | guided flow at root | yes | onboarding and setup |
| OneWay | `oneway.blackroad.io` | `BlackRoad-Data` | `BlackRoad-Foundation`, `BlackRoad-Products` | app at root | yes | export and portability |
| BlackBoard | `blackboard.blackroad.io` | `BlackRoad-Analytics` | `BlackRoad-Index`, `BlackRoad-Products` | app at root | yes | dashboards and reporting |
| RoadView | `search.blackroad.io` | `BlackRoad-Index` | `BlackRoad-Cloud`, `BlackRoad-Analytics` | app at root | yes | search and discovery |

### Product-by-product route intent

#### 1. BlackRoad OS
- canonical host: `os.blackroad.io`
- `/` = public shell overview
- `/app` = signed-in OS shell
- `/about`, `/features`, `/agents`, `/docs` = public pages
- `/app/desktop`, `/app/files`, `/app/settings` = runtime surfaces
- `/health`, `/ready`, `/version` = runtime endpoints

#### 2. RoadTrip
- canonical host: `roadtrip.blackroad.io`
- `/` = live chat and convoy app
- `/rooms`, `/agents`, `/memory`, `/settings` = first-class routes
- `/health` = runtime health
- `/api/chat`, `/api/agents`, `/api/memory` = product APIs

#### 3. Roadie
- canonical host: `tutor.blackroad.io`
- `/` = start and guided learning entry
- `/start`, `/subjects`, `/challenge/[id]`, `/history`, `/settings`
- `/health`, `/api/solve`, `/api/hints`

#### 4. RoadChat
- canonical host: `chat.blackroad.io`
- `/` = chat runtime
- `/models`, `/history`, `/settings`
- `/health`, `/api/chat`, `/api/models`

#### 5. RoadCode
- canonical host: `roadcode.blackroad.io`
- `/` = editor landing and active runtime
- `/projects`, `/editor/[id]`, `/deployments`, `/settings`
- `/health`, `/api/files`, `/api/run`, `/api/deploy`

#### 6. BackRoad
- canonical host: `social.blackroad.io`
- `/` = public social/product narrative
- `/features`, `/community`
- `/app`, `/app/feed`, `/app/rooms`, `/app/profile/[handle]`
- `/settings`, `/health`, `/api/feed`, `/api/post`

#### 7. RoadBook
- canonical host: `roadbook.blackroad.io`
- `/` = public publishing landing
- `/discover`, `/pricing`, `/docs`
- `/app`, `/app/write`, `/app/library`, `/app/publish`
- `/health`, `/api/drafts`, `/api/publish`

#### 8. RoadWorld
- canonical host: `roadworld.blackroad.io`
- `/` = worldbuilding landing
- `/gallery`, `/templates`, `/docs`
- `/app`, `/app/worlds`, `/app/editor/[id]`, `/app/assets`
- `/health`, `/api/worlds`, `/api/assets`

##### RoadWorld Game Library (BlackRoad-Forge)
All forked/integrated game repos feed into RoadWorld as playable templates, engines, or embedded experiences.

**Game Engines**
| Repo | Source | Description |
|------|--------|-------------|
| RoadGodot | godotengine/godot | Multi-platform 2D/3D game engine |
| RoadGodotBuilder | — | Godot-based builder tools |
| RoadLumix | — | 3D C++ game engine |
| RoadNcine | — | Cross-platform 2D game engine |
| RoadPlayCanvas | — | WebGL/WebGPU/WebXR graphics runtime |
| RoadThree | mrdoob/three.js | JavaScript 3D library |
| RoadPhaser | — | HTML5 game framework |
| RoadPokeEngine | — | Pokemon-style engine |

**City Builders & Sims**
| Repo | Description |
|------|-------------|
| Road3DCity | Three.js SimCity-inspired city builder |
| RoadCity2K | SimCity 2000 in the browser |
| RoadCityDreamer | AI-generated unbounded 3D cities |
| RoadCyberCity | Cyberpunk city sim |
| RoadIsoCity | Isometric city builder |
| RoadIsoCity-Forge | Isometric city (Forge variant) |
| RoadIsoCity-JS | Isometric city (JS variant) |
| RoadIsoCitySim | Isometric city sim |
| RoadIsoMinecraft | Isometric Minecraft-style |
| RoadNakamotoCity | Crypto-themed city |
| RoadSimCity2K | SimCity 2K variant |
| RoadSimCityBot | AI-driven city sim |
| RoadTown | Town builder |
| RoadUrbanSim | Urban simulation |
| RoadSpriteCity | RPG sprite city where agents live and interact |
| RoadIsoNYC | Isometric NYC |

**Farm & Harvest**
| Repo | Description |
|------|-------------|
| RoadFarm | Farm simulator |
| RoadFarmGame | Farm game variant |
| RoadFarmSim | Farm simulation |
| RoadFarmServer | Multiplayer farm server |
| RoadFarmTracker | Farm tracking tools |
| RoadStardewValley | Stardew Valley integration |
| RoadStardewApp | Stardew companion app |
| RoadStardewDocker | Stardew containerized server |
| RoadHarvest | Harvest game |

**The Sims & Life Sims**
| Repo | Description |
|------|-------------|
| RoadFreeSims | FreeSO / Sims Online |
| RoadSims | The Sims integration |
| RoadSims2 | The Sims 2 |
| RoadSimitone | Sims 1 reimplementation |
| RoadSimsPatcher | Sims patching tools |
| RoadLife2 | Life simulation |
| RoadGameOfLife | Conway's Game of Life |

**Theme Parks**
| Repo | Description |
|------|-------------|
| RoadRCT | RollerCoaster Tycoon (FreeRCT) |
| RoadRCT2 | RollerCoaster Tycoon 2 |
| RoadPark | Theme park builder |

**World Builders & Procedural Gen**
| Repo | Description |
|------|-------------|
| RoadWorld | 3D open world with autonomous AI agents |
| RoadWorldBeyond | Meta Quest VR/AR showcase |
| RoadWorldBeyond-Unity | Unity VR variant |
| RoadWorldBuilding | Procedural city building (Unity) |
| RoadWorldGen | Procedural world map generator |
| RoadWorldGen-Final | WorldGen final release |
| RoadWorldJS | JavaScript world engine |
| RoadWorlds | Multi-world platform |
| RoadNewWorld | New world template |
| RoadOneWorld | Unified world SDK |
| RoadOneWorldSDK | OneWorld SDK |
| RoadTinyWorld | Tiny world engine |
| RoadTilemapTown | Tilemap-based virtual world (BYOND-style) |
| RoadCubeWorld | Voxel cube world |
| CubeWorld | Cube world original |

**Virtual Offices**
| Repo | Description |
|------|-------------|
| RoadVirtualOffice | Retro pixel-art AI workspace |
| RoadAgentOffice | Agent office sim |
| RoadBitOffice | Bit-style office |
| RoadClaudeOffice | Claude-integrated office |
| RoadOfficeRun | Office runner game |
| RoadPixelOffice | Pixel office environment |
| RoadPixelOffice-Open | Open-source pixel office |
| RoadPixelWorkplace | Virtual pixel workplace |
| RoadSquadPod | Pixel art office for agent collaboration |

**Metaverse & VR**
| Repo | Description |
|------|-------------|
| RoadMetaverse-Unity | Build Your Own Metaverse (Unity) |
| RoadMetaverseTemplate | Metaverse starter template |
| RoadVRToolkit | VR development toolkit |
| VRWorldToolkit | VR world tools |
| RoadDive | VR dive experience |

**Craft & RPG**
| Repo | Description |
|------|-------------|
| RoadCraft | Minecraft-style crafting |
| RoadCraftMolt | Craft engine variant |
| RoadRPG | RPG game engine |
| RoadLegend | Legend-style adventure |
| Minetest-WorldEdit | Minetest world editing |

**Racing & Arcade**
| Repo | Description |
|------|-------------|
| RoadPixelWheels | Pixel racing game |
| RoadPixelBattle | Pixel battle arena |
| RoadGameBoy | GameBoy AI agents |
| RoadGameBoyWorlds | GameBoy-style worlds |
| RoadDroneSim | Drone flight simulator |

**Pixel Art Tools**
| Repo | Description |
|------|-------------|
| RoadPixel | Pixel engine |
| RoadPixelArt | Pixel art creation |
| RoadPixelorama | Pixel art editor (Godot) |
| Pixelorama | Pixel art editor original |
| RoadPixelSnap | Pixel snapping tools |
| RoadPixelSnap-Forge | PixelSnap Forge variant |
| RoadPixelExtract | Sprite extraction |
| RoadPixelExtractor | Sprite extractor variant |
| RoadPixelFix | Pixel repair tools |
| RoadPixelPlugin | Pixel art plugin |
| RoadTILF | Pixel art editor for sprites/icons |
| RoadLDtk | Level designer toolkit |

**Other Simulation**
| Repo | Description |
|------|-------------|
| RoadEngineSim | Engine simulation |
| RoadLogicSim | Logic circuit sim |
| RoadSim | General simulator |
| RoadSimDemo | Sim demo |
| RoadSolarSystem | Solar system sim |
| RoadPedestrian | Pedestrian movement sim |
| RoadDrive | Driving sim |
| RoadWarehouse | Warehouse logistics sim |
| RoadMultiplayer | Multiplayer framework |
| RoadPlays | Game plays/replay system |

**Total: 110+ game repos across 12 categories feeding into RoadWorld**

#### 9. OfficeRoad
- canonical host: `officeroad.blackroad.io`
- `/` = public office/live-activity overview
- `/floors`, `/agents`
- `/app`, `/app/live`, `/app/rooms`, `/app/board`
- `/health`, `/api/presence`, `/api/rooms`

#### 10. RoadWork
- canonical host: `roadwork.blackroad.io`
- `/` = operational workspace
- `/projects`, `/tasks`, `/clients`, `/compliance`, `/settings`
- `/health`, `/api/tasks`, `/api/reports`, `/api/compliance`

#### 11. CarKeys
- canonical host: `carkeys.blackroad.io`
- `/` = auth and vault runtime
- `/sessions`, `/devices`, `/keys`, `/settings`
- `/health`, `/api/auth`, `/api/sessions`, `/api/vault`

#### 12. CarPool
- canonical host: `carpool.blackroad.io`
- `/` = routing/orchestration runtime
- `/models`, `/routes`, `/usage`, `/settings`
- `/health`, `/ready`, `/version`, `/api/route`, `/api/models`

#### 13. RoadChain
- canonical host: `roadchain.blackroad.io`
- `/` = ledger runtime
- `/ledger`, `/entries/[id]`, `/proofs`, `/settings`
- `/health`, `/api/entries`, `/api/proofs`

#### 14. RoadCoin
- canonical host: `roadcoin.blackroad.io`
- `/` = wallet/token runtime
- `/wallet`, `/balances`, `/transactions`, `/settings`
- `/health`, `/api/balances`, `/api/transactions`

#### 15. RoadSide
- canonical host: `roadside.blackroad.io`
- `/` = onboarding entry
- `/start`, `/steps/[step]`, `/complete`, `/settings`
- `/health`, `/api/onboard`, `/api/progress`

#### 16. OneWay
- canonical host: `oneway.blackroad.io`
- `/` = export runtime
- `/exports`, `/formats`, `/history`, `/settings`
- `/health`, `/api/export`, `/api/history`

#### 17. BlackBoard
- canonical host: `blackboard.blackroad.io`
- `/` = analytics runtime
- `/dashboards`, `/reports`, `/metrics`, `/settings`
- `/health`, `/api/reports`, `/api/metrics`

#### 18. RoadView
- canonical host: `search.blackroad.io`
- `/` = search runtime
- `/results`, `/collections`, `/sources`, `/settings`
- `/health`, `/api/search`, `/api/index`

## Subdomain Plan For All 18 Products
Future agents should not create random sibling subdomains for products. The product host model should stay narrow, legible, and repeatable.

### Subdomain classes
- canonical runtime host: the one true product runtime
- redirect alias: convenience only
- support subdomain: allowed only if it serves a distinct operational purpose
- forbidden duplicate: should not exist as a separate public surface

### Allowed support subdomains
Only create support subdomains when the function is materially distinct:
- `api.<product>.blackroad.io` only when the API needs independent routing or scaling
- `docs.<product>.blackroad.io` only when product docs truly need independent hosting
- `status.<product>.blackroad.io` only for major products with separate public status needs
- `assets.<product>.blackroad.io` only for asset delivery or media separation if necessary

Avoid support subdomain sprawl by default. Most products should work fine with:
- `https://product.blackroad.io/`
- `https://product.blackroad.io/api/*`
- `https://product.blackroad.io/health`

### Product subdomain matrix
| Product | Canonical | Redirect Aliases | Allowed Support Subdomains | Forbidden Duplicate Pattern |
| --- | --- | --- | --- | --- |
| BlackRoad OS | `os.blackroad.io` | `blackroados.blackroad.io` | `status.os.blackroad.io` if ever needed | separate `app.os.blackroad.io` unless there is a very strong reason |
| RoadTrip | `roadtrip.blackroad.io` | `trip.blackroad.io` if ever created | `api.roadtrip.blackroad.io` only if scaling requires it | `chat.roadtrip.blackroad.io`, `app.roadtrip.blackroad.io` by habit |
| Roadie | `tutor.blackroad.io` | `roadie.blackroad.io` if not chosen as canonical | `docs.tutor.blackroad.io` only if docs separate cleanly | keeping `tutor` and `roadie` both indexable |
| RoadChat | `chat.blackroad.io` | `roadchat.blackroad.io` | `api.chat.blackroad.io` only if split needed | `roadchat` as a second live runtime |
| RoadCode | `roadcode.blackroad.io` | `code.blackroad.io` if used | `api.roadcode.blackroad.io`, `docs.roadcode.blackroad.io` if justified | `editor.blackroad.io` as a second canonical product |
| BackRoad | `social.blackroad.io` | `backroad.blackroad.io` if used as redirect | `api.social.blackroad.io`, `status.social.blackroad.io` if needed | both `social` and `backroad` live as separate canonicals |
| RoadBook | `roadbook.blackroad.io` | `book.blackroad.io` if used | `docs.roadbook.blackroad.io`, `assets.roadbook.blackroad.io` if justified | duplicate publishing runtimes under multiple hosts |
| RoadWorld | `roadworld.blackroad.io` | `world.blackroad.io` if used | `assets.roadworld.blackroad.io`, `docs.roadworld.blackroad.io` if needed | parallel canonicals like `builder.blackroad.io` |
| OfficeRoad | `officeroad.blackroad.io` | `office.blackroad.io` if used | `status.officeroad.blackroad.io` if live-presence status matters | separate `live.blackroad.io` as a competing product runtime |
| RoadWork | `roadwork.blackroad.io` | `work.blackroad.io` if used | `api.roadwork.blackroad.io` if needed | multiple business-workflow subdomains for one product |
| CarKeys | `carkeys.blackroad.io` | `keys.blackroad.io` if used | `api.carkeys.blackroad.io` if needed | `auth.blackroad.io` as a separate competing product unless intentionally reserved as infra |
| CarPool | `carpool.blackroad.io` | `pool.blackroad.io` if used | `api.carpool.blackroad.io`, `status.carpool.blackroad.io` if needed | routing UI duplicated on `api.blackroad.io` |
| RoadChain | `roadchain.blackroad.io` | none beyond portal redirects | `docs.roadchain.blackroad.io`, `status.roadchain.blackroad.io` | splitting runtime between `roadchain.io` and `roadchain.blackroad.io` |
| RoadCoin | `roadcoin.blackroad.io` | none beyond portal redirects | `docs.roadcoin.blackroad.io`, `status.roadcoin.blackroad.io` | splitting runtime between `roadcoin.io` and `roadcoin.blackroad.io` |
| RoadSide | `roadside.blackroad.io` | `side.blackroad.io` if used | `docs.roadside.blackroad.io` only if needed | parallel onboarding subdomains for the same flow |
| OneWay | `oneway.blackroad.io` | `way.blackroad.io` if used | `api.oneway.blackroad.io` if needed | duplicate export runtimes |
| BlackBoard | `blackboard.blackroad.io` | `board.blackroad.io`, `kpi.blackroad.io` as redirects if kept | `api.blackboard.blackroad.io`, `status.blackboard.blackroad.io` | keeping analytics split across `blackboard` and `kpi` as peers |
| RoadView | `search.blackroad.io` | `roadview.blackroad.io`, `seo.blackroad.io` as redirects or secondary informational surfaces only | `api.search.blackroad.io`, `docs.search.blackroad.io` if needed | keeping `search`, `roadview`, and `seo` all as peer runtimes |

## Subdomain Decision Rules
- If a new subdomain does not introduce a distinct operational surface, it should be a path, not a host.
- If a new host would make a user ask “which one is the real product,” it should not exist as a peer.
- If a subdomain exists only for memorability, it should redirect.
- If a support subdomain exists, document why a path was not enough.

## Product Completion Checklist
For any one product, future agents should not mark planning complete until all of these are explicit:
- canonical host
- alias policy
- whether `/` is runtime or marketing
- whether `/app` exists
- whether `/health` exists
- whether `/api/*` is local
- owning org
- support orgs
- support subdomains if any
- forbidden duplicate hosts

## 20 Orgs In Depth
This section explains what each operating org is for so future agents do not treat org names as decoration.

### 1. `BlackRoad-OS`
Purpose:
- owns the platform shell
- owns shared shell primitives
- owns navigation, layout, and OS-level interaction patterns

Should own:
- BlackRoad OS runtime
- app shell components
- cross-product shell contracts

Should not own:
- product-specific business logic for unrelated apps
- random one-off experiments

### 2. `BlackRoad-Agents`
Purpose:
- owns multi-agent runtime experiences
- owns convoy, orchestration UX, and agent-facing interaction patterns

Should own:
- RoadTrip
- multi-agent interface systems
- agent roster and room logic

Should not own:
- generic infra routing
- unrelated marketing content

### 3. `BlackRoad-Education`
Purpose:
- owns guided learning and tutoring systems

Should own:
- Roadie
- subject flows
- challenge and hint systems

Should not own:
- general chat infrastructure

### 4. `BlackRoad-AI`
Purpose:
- owns direct chat and model-facing AI user experiences

Should own:
- RoadChat
- shared chat UX primitives
- prompting UX and model-selection patterns

Should not own:
- fleet infra and deployment platforms

### 5. `BlackRoad-Code-Solutions`
Purpose:
- owns developer-product experiences

Should own:
- RoadCode
- editor and execution UX
- deployment-oriented developer surfaces

Should not own:
- global identity or auth foundations

### 6. `BlackRoad-Media`
Purpose:
- owns content, community, writing, and publishing

Should own:
- BackRoad
- RoadBook
- publishing systems
- creator/community surfaces

Should not own:
- low-level infra

### 7. `BlackRoad-Interactive`
Purpose:
- owns highly interactive canvases and environments

Should own:
- RoadWorld
- OfficeRoad
- live room and world-building systems

Should not own:
- static corporate pages

### 8. `BlackRoad-Products`
Purpose:
- owns cross-product productization patterns
- owns onboarding and business workflow products that do not deserve a separate org

Should own:
- RoadSide
- RoadWork
- cross-sell and onboarding systems

Should not own:
- platform shell or infra

### 9. `BlackRoad-Foundation`
Purpose:
- owns identity, auth, permissions, and secure foundations

Should own:
- CarKeys
- session and vault systems
- cross-product auth rules

Should not own:
- public social or publishing runtimes

### 10. `BlackRoad-Infrastructure`
Purpose:
- owns routing, shared platform APIs, and orchestration internals

Should own:
- CarPool
- shared gateway patterns
- runtime health conventions

Should not own:
- product marketing

### 11. `BlackRoad-Quantum`
Purpose:
- owns ledger, provenance, and protocol-grade trust systems

Should own:
- RoadChain
- provenance models
- ledger semantics

Should not own:
- broad consumer wallet UX if it belongs to RoadCoin

### 12. `BlackRoad-QI`
Purpose:
- owns token and economic reasoning systems

Should own:
- RoadCoin
- wallet and balance logic
- QI/economic interfaces

Should not own:
- shared auth or generic infra

### 13. `BlackRoad-Data`
Purpose:
- owns data export, import, portability, and archive movement

Should own:
- OneWay
- transfer, export, and handoff systems

Should not own:
- unrelated app shells

### 14. `BlackRoad-Analytics`
Purpose:
- owns dashboards, metrics, reporting, and KPI systems

Should own:
- BlackBoard
- dashboards
- metric and reporting surfaces

Should not own:
- generic search runtime

### 15. `BlackRoad-Index`
Purpose:
- owns crawling, indexing, and retrieval experiences

Should own:
- RoadView
- indexing systems
- search product UX

Should not own:
- unrelated analytics dashboards

### 16. `BlackRoad-Cloud`
Purpose:
- owns edge, deployment, workers, and platform execution fabric

Should own:
- deployment templates
- edge workers
- service runtime scaffolds

Should not own:
- final user-facing product ownership unless it is purely infra-facing

### 17. `BlackRoad-Security`
Purpose:
- owns cross-product security review, defaults, auth policy, incident posture

Should own:
- policies
- audit patterns
- incident review structures

Should not own:
- main product runtime branding

### 18. `BlackRoad-Network`
Purpose:
- owns topology, network state, host maps, and status visibility

Should own:
- network diagrams
- fleet/network visibility
- status-adjacent surfaces

Should not own:
- unrelated product experiences

### 19. `BlackRoad-Studio`
Purpose:
- owns the visual system, brand, motion, UI kits, and template canon

Should own:
- `brand.blackroad.io`
- shared templates
- visual references

Should not own:
- independent product business logic

### 20. `BlackRoad-Ventures`
Purpose:
- owns portfolio, company rollup, and ecosystem business surfaces

Should own:
- `blackroad.io`
- corporate/venture surfaces
- portfolio-level rollups

Should not own:
- day-to-day product runtime code unless it is portfolio-facing

## Fleet Host Responsibilities In Depth
Future agents should not assume every machine is interchangeable. These are the current intended responsibilities.

### `lucidia`
- role: core intelligence and local anchor node
- should host:
- Gitea if that remains the live reality
- core local orchestration helpers
- local AI/runtime support services where appropriate
- should not silently absorb every service from failed nodes without docs being updated

### `cecilia`
- role: executive operator and orchestration node
- should host:
- workflow coordination
- orchestration APIs
- Ollama or operational agent services where actively used
- relay and sync logic if still needed

### `anastasia`
- role: restoration and recovery cloud node
- should host:
- recovery paths
- backup operational services
- cloud-side repair and continuity layers

### `gematria`
- role: pattern engine and cloud knowledge node
- should host:
- symbolic or knowledge-oriented cloud services
- public runtime support where cloud hosting is preferable
- note: Tailscale identity currently appears as `codex-infinity`

### `alice`
- role: utility and onboarding-support node
- should host:
- local infra helpers like Pi-hole / Redis / PostgreSQL if still active
- lightweight support services
- onboarding-adjacent utilities

### `aria`
- intended role: voice, monitoring, Headscale, Portainer, dashboards
- current state: offline
- recovery priority after it returns:
- restore Tailscale
- restore SSH
- verify Headscale / Portainer / monitoring ownership

### `octavia`
- intended role: systems orchestration, queues, Docker, former Gitea/NATS node
- current state: offline
- recovery priority after it returns:
- restore Tailscale
- restore SSH
- verify whether services should return here or remain migrated elsewhere

### Fleet operating rules
- a host is agent-usable only if SSH works and Tailscale reports it online
- if a service moved, update docs before future agents treat the old host as canonical
- if a host alias points at another machine, document it explicitly
- if host identity differs between SSH and Tailscale, note both names

## Sovereign Fork Library (BlackRoad-OS-Inc)
BlackRoad-OS-Inc contains ~150+ "Road*" sovereign forks — open-source tools rebranded and self-hosted on the Pi fleet. These replace every external dependency with a BlackRoad-owned equivalent.

### AI & Inference
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadLlama | llama.cpp | Sovereign LLM inference |
| RoadLocal | LocalAI | Local-first AI inference server, OpenAI-compatible |
| RoadVLLM | vLLM | High-throughput LLM serving |
| RoadBit | Microsoft BitNet | 1-bit LLM inference |
| RoadLetta | MemGPT | LLM as OS, .af agent file format |
| RoadSight | — | Agent memory that learns |
| RoadMem | mem0 | Hybrid vector+graph agent memory |
| RoadTarsier | — | Visual AI for web page understanding |
| RoadHands | — | Vision-based hand tracking and gesture recognition |
| RoadCanvas | Stable Diffusion | Sovereign image generation |
| RoadVoice | Whisper | Sovereign speech-to-text |
| passenger | Ollama | Sovereign AI inference engine |
| RoadInterpreter | — | Python code interpreter with sandboxed execution |
| RoadAI-Starter | — | AI starter kit |
| RoadBoat | — | AI coworker with memory |

### Databases & Storage
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadBase | PostgreSQL | Sovereign relational database |
| RoadCache | Redis | Sovereign in-memory cache |
| RoadSQL | SQLite WASM | Per-agent database in browser |
| RoadPulse | InfluxDB | Sovereign time-series DB |
| rearview | Qdrant | Sovereign vector database |
| curb | MinIO | Sovereign object storage |
| RoadIndex | — | Full-text search engine in Rust |

### Networking & Infrastructure
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadProxy | nginx | Sovereign reverse proxy |
| RoadTunnel | cloudflared | Sovereign tunnel client |
| RoadDNS | PowerDNS | Sovereign authoritative DNS |
| RoadNebula | Nebula | Sovereign overlay networking |
| RoadRings | — | P2P WebRTC+Chord DHT, O(log N) routing for 30K agents |
| tollbooth | WireGuard | Sovereign VPN mesh |
| roundabout | Headscale | Sovereign VPN coordination |
| pitstop | Pi-hole | Sovereign DNS filtering |
| oneway | Caddy | Sovereign TLS edge and reverse proxy |
| RoadCert | certbot | Sovereign TLS automation |
| RoadSniff | — | Network traffic monitor |

### Security
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadShield | CrowdSec | Sovereign threat intelligence |
| RoadGuard | fail2ban | Sovereign intrusion prevention |
| RoadKey | Keycloak | Sovereign IAM with SSO, OAuth2, RBAC |

### Media & Streaming
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadStream | Jellyfin | Sovereign media server |
| RoadTube-Engine | PeerTube | Sovereign video hosting |
| RoadCodec | FFmpeg | Sovereign video processing |
| RoadMeet | — | Sovereign video conferencing |
| BlackStream | — | Streaming content aggregation (5 microservices) |

### Communication & Social
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadChat | Element/Matrix | Sovereign messaging, E2E encrypted |
| RoadBird | GoToSocial | Sovereign social media server with ActivityPub |
| carpool | NATS | Sovereign messaging bus |
| backroad | Portainer | Sovereign container management |

### Developer Tools
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadShell | Nushell | Structured data shell, typed pipelines |
| RoadLint | Biome | Rust linter, 35x faster than Prettier |
| RoadMise | mise | One tool for all versions (replaces nvm/pyenv/asdf) |
| RoadJust | just | Command runner |
| RoadQuick | QuickJS | 210KB JS engine, 30K agents in 6.3GB |
| RoadBrowser | — | Headless browser automation |
| RoadMoon | — | Polyglot monorepo orchestrator, WASM extensible |
| RoadPlugin | Extism | Universal WASM plugin system, 15+ language SDKs |
| RoadRig | — | Rust agent framework, compiles to WASM |
| RoadLunatic | — | Erlang-inspired WASM runtime, agent OS |
| RoadClay | — | Microsecond UI layout, C to WASM |
| RoadTUI | — | Rust terminal UI, sub-millisecond rendering |
| RoadWind | Tailwind | Sovereign utility-first CSS framework |

### Business & Productivity
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadCRM | — | Sovereign CRM system |
| RoadBook | — | Sovereign bookkeeping |
| RoadPlane | — | Sovereign project management |
| RoadSupport | — | Sovereign help desk and ticketing |
| RoadStore | — | Sovereign e-commerce platform |
| RoadFolio | — | Sovereign portfolio builder |
| RoadCal | — | Sovereign calendar and scheduling |
| RoadLearn | Moodle | Sovereign LMS with adaptive learning |
| RoadCamp | — | Learn math, programming, CS |
| RoadWiki | — | Sovereign wiki and knowledge base |
| RoadDocs-Live | HedgeDoc | Sovereign collaborative docs |
| RoadWrite | — | Sovereign document editor |
| RoadReader | Internet Archive | BookReader fork |

### Monitoring & Analytics
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadWatch | Prometheus | Sovereign monitoring |
| roadmap | Grafana | Sovereign dashboards |
| RoadLight | Uptime Kuma | Sovereign uptime monitoring |
| RoadHog | PostHog | Sovereign product analytics |
| RoadMetrics | Plausible | Sovereign web analytics, privacy-first |
| RoadUmami | Umami | Sovereign web analytics |
| RoadTelemetry | — | Sovereign observability collector |
| guardrail | Uptime Kuma | Uptime monitoring variant |

### Orchestration & Workflows
| Repo | Upstream | Description |
|------|----------|-------------|
| overpass | n8n | Sovereign workflow automation |
| RoadConductor | Netflix Conductor | Durable agent workflows |
| RoadTemporal | Temporal | Sovereign durable workflow engine |
| RoadVolt | — | TypeScript agents, resumable streaming, OpenTelemetry |
| RoadCrew | — | Sovereign multi-agent task execution |
| RoadAgency | — | Multi-agent orchestration framework |
| RoadProcess | pm2 | Sovereign process manager |
| RoadActor | — | Rust actor framework, 4-priority channels |

### Quantum & Math
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadQiskit | Qiskit | Sovereign quantum computing SDK |
| RoadMath | — | Mathematical computation library |
| MathWay | Manim | Math animation engine |
| amundson-framework | — | G(n) = n^(n+n/n)/(n+n/n)^n, 17 theorems |
| simulation-theory | — | The Trivial Zero: computational self-reference proof |

### Custom Languages & Compilers
| Repo | Upstream | Description |
|------|----------|-------------|
| roadc | — | RoadC — custom programming language |
| roadc-playground | — | RoadC interactive web REPL |
| RoadLang | — | Sovereign programming language toolchain |
| RoadDesign | — | Sovereign design system in Clojure |
| RoadDeploy-Engine | — | Sovereign deployment engine in PHP |

### Drawing & Design
| Repo | Upstream | Description |
|------|----------|-------------|
| RoadDraw | Excalidraw | Sovereign whiteboard |
| RoadSketch | — | Sovereign digital drawing tool |
| RoadPixels | — | Pixel art rendering engine |
| RoadUI | — | Sovereign cross-platform UI toolkit in C |

### Games & Worlds (see also RoadWorld Game Library)
| Repo | Description |
|------|-------------|
| RoadTown | AI town — virtual agents that live and socialize |
| RoadCosmos | 3D world engine in JavaScript |
| RoadCity | Interactive city simulation |
| RoadBlox | Voxel game engine |
| RoadGTA | Open-world game framework in C# |
| RoadCom | Internet Computer — self-hostable desktop OS |
| metaverse | Unified world from 858 parts across 26 game engines |

### Domain Repos (17 root domains)
Each root domain has a corresponding repo in BlackRoad-OS-Inc:
blackroad.io, blackroad.company, blackroad.me, blackroad.systems, blackroad.network, blackroadai.com, blackroadinc.us, blackroadqi.com, blackboxprogramming.io, lucidia.earth, lucidia.studio, lucidiaqi.com, roadchain.io, roadcoin.io, blackroadquantum.com/.net/.info/.shop/.store

### Subdomain Site Repos (~40+)
Individual `.blackroad.io` subdomain repos: roadtrip, roadwork, roadcode, social, search, chat, video, radio, game, pay, hq, canvas, cadence, live, brand, docs, api-ref, architecture, backroad, blackbox, changelog, cli, costs, demo-repository, dr, faq, fleet, forks, gdrive, glossary, grammar, greenlight, information, jobs, kpi, map, math, memory, openclaw, operator, portal, prism, review, roadc, roadcoin-deep, roadchain-deep, roadmap-plan, roadnet, savings, sdk, simulation, sqlite, start, status, theory, timeline, verify, vs-cloud, vs-github, whats-real

**Total BlackRoad-OS-Inc: 329 repos — the nerve center of the entire operation.**

---

## BlackRoad-AI Inventory (65 repos)

### Lucidia Ecosystem
| Repo | Description |
|------|-------------|
| lucidia | AI agent orchestrator, multi-model coordination across Pi fleet |
| lucidia-core | Core intelligence engine |
| lucidia-agents | Agent definitions and behaviors |
| lucidia-cli | Full terminal OS with web browser, virtual filesystem, 30+ components |
| lucidia-chat | Chat interface |
| lucidia-platform | Platform (ARCHIVED → BlackRoad-OS/lucidia-core) |
| lucidia-studio | Creative tools |
| lucidia-math | Mathematical reasoning |
| lucidia-wilderness | Wilderness exploration |
| lucidia-3d-wilderness | 3D Minnesota wilderness where all AI models live |
| lucidia-minnesota-game | OFFICIAL Lucidia game |
| lucidia-living-world | Living world simulation |
| lucidia-earth | Earth-scale agent ecosystem |
| lucidia-metaverse | Metaverse (ARCHIVED → BlackRoad-OS/lucidia-earth) |
| lucidia-lab | Experimental lab |
| lucidia-command-center | Command center |
| lucidia-ai-models | Base AI models |
| lucidia-ai-models-enhanced | Enhanced models with BlackRoad optimizations |
| lucidia-sites | All Lucidia websites |

### Inference & Model Deployment
| Repo | Description |
|------|-------------|
| RoadLocalAI | LocalAI — run any model on any hardware, no GPU required |
| hailo8-inference | Hailo-8 NPU inference |
| blackroad-vllm-mvp | vLLM MVP deployment |
| blackroad-ai-inference-accelerator | Inference acceleration |
| blackroad-ai-model-optimizer | Model optimization |
| blackroad-llm-fine-tuner | LLM fine-tuning |
| blackroad-llm-embeddings | Embedding generation |
| blackroad-inference-engine | Core inference engine |
| blackroad-ai-ollama | Ollama runtime for model orchestration |
| blackroad-ai-deepseek | DeepSeek-V3 deployment |
| blackroad-ai-qwen | Qwen2.5 deployment |
| ollama-models | Model definitions |
| vllm-deployment | vLLM production deployment |

### Memory & Coordination
| Repo | Description |
|------|-------------|
| blackroad-ai-memory-bridge | [MEMORY] system integration for AI models |
| blackroad-ai-cluster | Clustering and orchestration across Pi network |
| blackroad-ai-api-gateway | Unified API gateway for all AI models |
| agent-monitor | Agent monitoring |
| agent-memory | Agent memory system |
| agency-agents | Agency-level agent coordination |

### Sites & Domain Repos
models.blackroad.io, ollama-fleet.blackroad.io, modelfile.blackroad.io, lucidia-node.blackroad.io, cecilia.blackroad.io, alexandria.blackroad.io, lucidia-cli.blackroad.io, lucidiaqi.com, lucidia.studio, lucidia.earth, blackroadai.com, embeddings-blackroad-io

### Other
RoadCode, RoadAIAwesome (curated AI resource list), road-math (Amundson session paper), deploy-ai, source, source-code, README, operator

---

## BlackRoad-Hardware Inventory (22 repos)

### Hailo NPU
| Repo | Description |
|------|-------------|
| hailo-text-engine | NPU-accelerated text generation via character-frame inference |
| RoadHailo | Hailo-8L AI Kit setup for Raspberry Pi 5 |
| hailo_model_zoo | Pre-trained neural networks optimized for Hailo-8 |
| hailo-vision | Real-time computer vision on Hailo-8 |
| hailo-guide.blackroad.io | Setup guide |

### Pi Fleet Management
| Repo | Description |
|------|-------------|
| blackroad-pi-ops | Pi operations automation |
| blackroad-pi-fleet | Fleet coordination |
| blackroad-fleet-tracker | Fleet tracking dashboard |
| blackroad-device-registry | Device inventory |
| pi-setup.blackroad.io | Pi setup guide |
| pi-mono | Monorepo for Pi tooling |
| alice.blackroad.io | Alice node portal |
| RoadPiAwesome | Curated Raspberry Pi resource list |

### Other
RoadHomeAssistant (home automation), firmware, RoadCode, README, source, source-code, operator

---

## BlackRoad-Network Inventory (35 repos)

### Mesh & Service Discovery
| Repo | Description |
|------|-------------|
| blackroad-os-mesh | Live WebSocket server for real-time agent communication |
| blackroad-mesh | Mesh networking core |
| blackroad-service-mesh-manager | Service mesh management |
| blackroad-gateway-mesh | Gateway mesh routing |
| mesh | Agent mesh and WebSocket communication layer |
| mesh-sdk | Mesh SDK for integrations |

### DNS & Routing
| Repo | Description |
|------|-------------|
| road-dns-deploy | DNS deployment automation |
| blackroad-dns-manager | DNS management |
| crossroads-dns | DNS routing |
| pitstop-dns | DNS filtering |

### VPN & Tunnels
| Repo | Description |
|------|-------------|
| blackroad-os-headscale | Headscale coordination |
| tollbooth-vpn | VPN mesh |
| headscale-mesh | Headscale mesh networking |
| tunnel-manager | Tunnel lifecycle management |

### Infrastructure
nginx-fleet, caddy-edge, cloudflare-workers, firewall-rules, dhcp-manager, network-scanner, onion-services, wire-map, carpool-bus

### Subdomain Repos
vs-tailscale.blackroad.io, oneway.blackroad.io, aria.blackroad.io, wiremap.blackroad.io, portmap.blackroad.io, pitstop.blackroad.io, carpool.blackroad.io, roundabout.blackroad.io

---

## BlackRoad-Interactive Inventory (22 repos)

### RoadWorld Ecosystem
| Repo | Description |
|------|-------------|
| roadworld.blackroad.io | Main RoadWorld site |
| roadworld-office | Office variant |
| roadworld-minnesota | Minnesota wilderness world |
| roadworld-games | Game collection |
| blackroad-roadworld | Core RoadWorld engine |
| blackroad-os-roadworld | BlackRoad Earth module |
| blackroad-world-v2 | World v2 rebuild |
| game-engine.blackroad.io | Game engine portal |
| game-engine | Core game engine |

### Metaverse & Pixel
| Repo | Description |
|------|-------------|
| pixel-blackroad-metaverse | Pixel-art metaverse |
| blackroad-pixel-assets | Pixel art assets, 8-bit to 2048-bit sprites |
| blackroad-metaverse | Metaverse platform |
| blackroad-metaverse-builder | Metaverse construction tools |
| blackroad-os-metaverse | OS-integrated metaverse |
| blackroad-game-engine | Standalone game engine |

---

## BlackRoad-Security Inventory (15 repos)

| Repo | Description |
|------|-------------|
| security | Security boundaries, controls, protections |
| security-blackroad-io | Security portal site |
| BlackRoad-Security | Auditing, privacy, encryption, zero-trust |
| blackroad-secret-scanner | Secret detection in repos |
| blackroad-password-manager | Password vault |
| blackroad-identity-provider | Identity provider |
| blackroad-encryption-suite | Encryption toolkit |
| blackroad-cert-manager | TLS certificate management |
| blackroad-access-control | Access control policies |
| RoadCode, README, source, source-code, operator, .github | Standard org repos |

---

## BlackRoad-Studio Inventory (37 repos)

### Design System & Brand
| Repo | Description |
|------|-------------|
| blackroad.io | Sovereign AI OS — 8 blog posts, 59 pages, API docs |
| BLACKROAD-OS-BRAND-LOCK | Visual identity system with gradient palette |
| blackroad-os-brand | Official brand assets, Golden Ratio design system |
| blackroad-brand-official | OFFICIAL brand kit |
| blackroad-brand-pretty | Pretty brand kit variant |
| blackroad-brand-police | Brand enforcement rules |
| blackroad-figma-plugin | Figma plugin, design-to-code bridge |
| figma | Figma design files and prototypes |
| roadcolor | Color system |
| emoticons | Emoji and emoticon set |
| templates | Approved templates |
| template-engine | Template rendering engine |
| studio-core | Core studio framework |

### Pixel Art & Creative
| Repo | Description |
|------|-------------|
| pixel-agents | Animated pixel agent sprites |
| pixel-office | Pixel art office environment |
| pixel-office-piraminet | Pixel office variant |
| pixel-agent-desk | Agent desk scene |
| opencode-pixel-office | Open-source pixel office |
| pixel-art.blackroad.io | Pixel art gallery |

### Content Creation
| Repo | Description |
|------|-------------|
| writing-studio | AI-powered writing platform |
| write.blackroad.io | Writing portal |
| video-studio | Video editor with timeline, AI captions, effects |
| voice-chat-widget | Voice chat component |
| canvas-studio | Design tool for graphics, presentations, social media |
| chrome-extension | Chrome extension |
| alexa-amundson-portfolio | Portfolio site |
| blackroad-garage | Creative workspace |
| demo-repository | Demo/showcase |

---

## BlackRoad-Sandbox Inventory (27 repos)

| Repo | Description |
|------|-------------|
| training-materials | Agent training curriculum, exam questions, coding challenges, RoadC examples |
| terminal-toys | Terminal visual toys and effects |
| shader-lab | GPU shader experiments |
| scratch-pad | Quick experiments |
| sandbox-scripts | Utility scripts |
| roadc-playground | RoadC language playground |
| prompt-lab | Prompt engineering experiments |
| playground-blackroad-io | Interactive product playground |
| pixel-playground | Pixel art experimentation |
| pi-ai-starter-kit | Raspberry Pi AI starter kit |
| one-pagers | Single-page app templates |
| java-hello-world | Java starter |
| demo-blackroad-io | Interactive product showcase |
| demo-apps | Quick demo applications |
| data-generators | Synthetic data generation |
| css-effects | CSS art, animations, glassmorphism |
| blackroad-test-runner | Test execution framework |
| blackroad-test-automation | Automated testing |
| blackroad-os-experiments | OS experiments |
| blackroad-sandbox | General sandbox |
| ascii-art | ASCII art generators, banners, terminal graphics |
| api-mocks | Mock API servers for testing |

---

## BlackRoad-Media Inventory (17 repos)

| Repo | Description |
|------|-------------|
| black-board | BlackBoard Advertising — AI-cited comparisons, benchmarks |
| roadview.blackroad.io | RoadView portal |
| roadtube | Video hosting platform |
| backroad-social | BackRoad social platform |
| marketing | Marketing campaigns |
| content | Content pipeline |
| brand-kit | Brand assets |
| blog-source | Blog content source |
| blackroad-image-optimizer | Image optimization |
| blackroad-alfred | Alfred workflow shortcuts |

---

## BlackRoad-Labs Inventory (15 repos)

| Repo | Description |
|------|-------------|
| amundson-constant | A_G computation and verification |
| amundson-research | Amundson Framework research papers |
| roadcoin-io | RoadCoin production site |
| roadchain-io | RoadChain production site |
| system-prompts | AI system prompt library |
| blackroad-ml-pipeline | ML training pipeline |
| blackroad-data-pipeline | Data ETL pipeline |
| research | R&D experiments |
| quantum-math-lab | Quantum mathematics research |

---

## BlackRoad-Agents Inventory (11 repos)

| Repo | Description |
|------|-------------|
| agent-resources | Agent definitions, personalities, skills, trust levels, exam questions for all 27 Roadies |
| RoadClaudeAgents | Intelligent automation and multi-agent orchestration for Claude Code |
| RoadOmniAgent | OmniCoreAgent — Python framework for building autonomous AI agents |
| RoadSwarm | Swarm.js — Node.js implementation of OpenAI's experimental Swarm framework |
| blackroad-agent-roadie | Roadie HuggingFace Space |
| lucidia-agent.blackroad.io | Lucidia agent portal |
| aria-agent.blackroad.io | Aria agent portal |
| anastasia-agent.blackroad.io | Anastasia agent portal |

---

## BlackRoad-Cloud Inventory (13 repos)

| Repo | Description |
|------|-------------|
| deploy-hq | HQ deployment |
| deploy-pay | Payment deployment |
| deploy-chain | Chain deployment |
| cloud-gateway | Cloud gateway routing |
| blackroad-container-registry | Container registry |
| blackroad-load-balancer | Load balancer |
| roadsync | Sync engine |

---

## BlackRoad-Dev Inventory (4 repos)

| Repo | Description |
|------|-------------|
| RoadClaudeCode | Claude Code agentic coding tool fork |
| RoadRalphClaude | Autonomous AI development loop for Claude Code |
| RoadN8NAnalysis | Analyzing 6,000+ n8n workflows |

---

## BlackRoad-Archive Overview (500+ repos)
The graveyard. Contains:

### Archived Sites (~60)
All original domain repos before consolidation: blackroadai-com, blackroadquantum-shop/com/store/net/info, blackroadqi-com, lucidia-earth, lucidia-studio, lucidiaqi, company, me, inc, network, systems, aliceqi, apps-site, video-site, book-redirect, docs-site, agents-site, etc.

### Archived Workers (~20)
work-redirect, streaming, social-redirect, roadchat, pricing-site, os, status-blackroadio, analytics-blackroad, stats-blackroad, portal-blackroad, index-blackroad, backlog-blackroad, api-blackroad, fleet-api, etc.

### Micro-Service Graveyard (~200)
Scaffolded but never shipped: blackroad-queue-workers, blackroad-pubsub, blackroad-proxy-pool, blackroad-prometheus-stack, blackroad-kubernetes-operator, blackroad-lambda, blackroad-load-balancer, blackroad-marketplace, blackroad-message-queue, blackroad-microservices, blackroad-multitenancy, blackroad-notification-service, blackroad-oauth-provider, blackroad-object-storage, blackroad-orchestrator, blackroad-payment-gateway, blackroad-pdf-generator, blackroad-permissions, blackroad-plugin-system, blackroad-rate-limiter, blackroad-realtime-sync, blackroad-recommendation-engine, blackroad-registry, blackroad-replication, blackroad-rest-api, blackroad-retry-logic, blackroad-routing, blackroad-rollback, blackroad-scheduler, blackroad-sdk-generator, blackroad-search-engine, blackroad-secrets-rotation, blackroad-serverless, blackroad-service-discovery, blackroad-session-manager, blackroad-shard-manager, blackroad-snapshot, blackroad-socket-server, blackroad-spam-filter, blackroad-sql-optimizer, blackroad-ssl-manager, blackroad-state-machine, blackroad-sync-engine, blackroad-task-runner, blackroad-telemetry, blackroad-tenant-isolation, blackroad-text-analysis, blackroad-throttling, blackroad-time-series, blackroad-token-service, blackroad-tracing, blackroad-transcription, blackroad-translation, blackroad-tunnel, blackroad-ui-kit, blackroad-upload-service, blackroad-user-management, blackroad-validation, blackroad-virtual-network, blackroad-visualization, blackroad-voice-ai, blackroad-vpn, blackroad-vulnerability-scanner, blackroad-wasm, blackroad-web-scraper, blackroad-webhook-relay, blackroad-websocket, blackroad-websocket-manager, blackroad-widget-factory, blackroad-workflow-builder, blackroad-workspace, blackroad-xml-parser, blackroad-yaml-config, blackroad-zero-trust, blackroad-zip-service, blackroad-zone-manager, and many more.

### Integrations & Extensions
blackroad-zapier, blackroad-zapier-app, blackroad-slack-bot, blackroad-slack-app, blackroad-chrome-extension, blackroad-vscode-extension, blackroad-alfred, blackroad-desktop-app, blackroad-mobile-app, blackroad-product-hunt, blackroad-postman, blackroad-notion, blackroad-linear, blackroad-keycloak, blackroad-github-actions, jetbrains-plugin, discord-bot, n8n-nodes, helm-charts, homebrew-tap

### Crypto & Finance
bitcoin (protocol reference), bitcoin-wallet-backup (DO NOT DELETE), roadcrypto, blackroad-crypto-exchange, blackroad-crypto-payment-processor, blackroad-web3-wallet-connector, blackroad-blockchain-explorer, blackroad-multi-chain-bridge, blackroad-crypto-tracker, blackroad-supply-chain-manager

### Math & Research
AmundsonMath (G(n) formula, 100K digits verified), amundson-millennium (Millennium Prize explorations), quantum-math-lab

### Notable Preserved
| Repo | Description |
|------|-------------|
| bitcoin-wallet-backup | **DO NOT DELETE** — Bitcoin wallet backup |
| compliance-framework | SOC2, GDPR, HIPAA, PCI DSS |
| blog-content | 200+ technical blog posts |
| prompt-library | Production-grade prompts and templates |
| eval-suite | AI model benchmarking and testing |
| ai-orchestrator | Multi-model routing and coordination |
| ml-pipelines | Training, fine-tuning, evaluation |
| grafana-dashboards | Monitoring dashboards |
| embedding-atlas | Interactive visualization for large embeddings |
| blackroad-internet | Accuracy-first browser, search engine & verification platform |

---

## BlackRoadOS Public Mirror (66 repos)

### 18 Product Mirrors (PUBLIC)
blackroad-os (Application), roadtrip, roadie, backroad, roadview, roadcode, roadbook, roadworld, officeroad, roadwork, carkeys, carpool, roadchain, roadcoin, roadside, oneway, blackboard, app

### Infrastructure Mirrors
raw (498 CF Workers source), ops (company dashboard), chat, search, tutor, social, auth, canvas, video, radio, game, cadence, live, pay, hq, ai-gateway, blackroad (orchestration hub), amundson

### Organizational Repos
Memory, Agents, Fleet, Workers, SDK, API, Docs, CLI, Marketing, private, public, operator

### Philosophical Repos
How, Why, Where, When, What, Who — one-word repos exploring each dimension of BlackRoad

### Domain Mirrors
blackroad-io, roadchain, roadcoin, work, book, status, quantum, blackboxprogramming, ai, video-site, docs-site, book-redirect, agents-site

---

## Personal Forks (blackboxprogramming, 30 repos)

### Game Engines & Virtual Worlds (forked Apr 8, 2026)
TilemapTown, my-virtual-office, prowl, godot, lumixengine, pixelwheels, GameBoyWorlds, ncine, FreeRCT, agent-office, omnicoreagent, OfficeVerse-, IdleCity

### Browser OS & Dev Tools (forked Apr 4, 2026)
puter, core, daedalos, three.js, monaco-editor, engine (PlayCanvas), xterm.js, LocalAI

### Claude Code Research (forked Mar 31, 2026)
claude-code, leaked-claude-code, claude-code-source-code, claude-code-rev, claude-code-source, claude-code-sourcemap, ralph-claude-code

### Other
agents (OpenAI Swarm), awesome-raspberry-pi

---

## BlackRoad-Forge Full Inventory (485 repos)

Beyond the RoadWorld Game Library (documented above in section 8), BlackRoad-Forge contains:

### OS Forks
RoadZimaOS, RoadZealOS, RoadVinix, RoadSkift, RoadToaruOS, RoadTock, RoadThreadX, RoadTheseus, RoadManagarm, RoadDarwin, RoadOS, BlackRoad-Operating-System, RoadUniversalComputer

### Monitoring & DevOps
RoadUptimeKuma, RoadSecretKnowledge (sysadmin resources), RoadNginxColorizer, RoadOpenSandbox, RoadDebugConsole, RoadFlow

### AI & ML
RoadAIPrompts (system prompts collection), RoadSuperpowers (agentic skills framework), RoadSkills, RoadOpenRAG, RoadEmbeddingAtlas, RoadLearnClaude, UnderPass (LangChain agent harness)

### Media & Content
RoadVideoStudio, RoadStream (RTMP live streaming), RoadRenderStream (Unity render streaming), RoadRadio (FM receiver on Pi), RoadMarkText

### Infrastructure
blackroad-operator, blackroad-container, blackroad-scripts, blackroad-core, blackroad-cli, blackroad-api-production, blackroad-web, blackroad-mobile-app, blackroad-apps (50 PWAs)

### Networking
RoadTailscale, RoadContextBridge, RoadMCP, RoadHLS, RoadHID

### Business & Productivity
StripeRoad (Stripe integration), RoadInvoice, RoadForms, RoadMail, RoadTabler (dashboard UI kit), RoadTerminalCLI

### Research & Math
thinking.blackroad.io, RoadSimTheory, RoadTrainingKit

### Legacy & Misc
blackroad-analysis (1,225 repo audit), blackboxprogramming (profile README), blackbox-enterprises, blackroad-os-monorepo (ARCHIVED), blackroad-archive, blackroad-os-inc, blackroad-os-orchestrator, blackroad-os-lucidia, blackroad-os-helper, blackroad-labs, blackroad-interactive, blackroad-social, blackroad-media, blackroad-hardware, blackroad-ai, blackroad-agents, blackroad-security, blackroad-studio, blackroad-gov, blackroad-dashboard, blackroad-dashboards, blackroad-advertising-playbook, blackroad-idea-board, blackroad-linear, blackroad-marketing, blackroad-metaverse, blackroad-progress-dashboard, blackroad-simple-launch, blackroad-ai-dashboard

### Pixel Art (non-game)
RoadPixelPlugin, RoadPiskel, RoadPins, RoadPixelorama

### Misc Tools
RoadYazi (terminal file manager), RoadCompass, RoadLens, RoadLoop, RoadLines, RoadEdge, RoadDotNet, RoadKot, RoadLang, RoadJunction, RoadIsoJS, RoadHome, RoadCom-, RoadCrawl-, RoadCode, RoadMatch, RoadMatter, RoadMeet, RoadMov, RoadLive, RoadLife2, RoadLegend, RoadLDtk, RoadPi, RoadNewName (pending rename), RoadUntitled, RoadChanfana

---

## Migration Map: Messy Hosts To Final Canonicals
This is the cleanup map future agents should follow when converting the current sprawl into a stable system.

| Current Host | Final Canonical Target | Action |
| --- | --- | --- |
| `blackroados.blackroad.io` | `os.blackroad.io` | redirect |
| `roadchat.blackroad.io` | `chat.blackroad.io` | redirect |
| `roadview.blackroad.io` | `search.blackroad.io` | redirect |
| `roadie.blackroad.io` | `tutor.blackroad.io` unless future decision changes canonical | redirect |
| `backroad.blackroad.io` | `social.blackroad.io` | redirect |
| `kpi.blackroad.io` | `blackboard.blackroad.io` | redirect unless retained as analytics entry alias |
| `seo.blackroad.io` | `search.blackroad.io` or keep as informational-only, never a peer runtime | redirect or informational-only |
| `live.blackroad.io` | `officeroad.blackroad.io` if it is truly OfficeRoad-related, otherwise retire | redirect or retire |
| `canvas.blackroad.io` | owning product host once explicitly chosen | decide and redirect |
| `cadence.blackroad.io` | owning product host once explicitly chosen | decide and redirect |
| `video.blackroad.io` | owning media product host if retained | decide and redirect |
| `radio.blackroad.io` | owning media product host if retained | decide and redirect |
| `game.blackroad.io` | `roadworld.blackroad.io` if it is world/interactive-facing | redirect if equivalent |
| `hq.blackroad.io` | `blackroad.network` or `status.blackroad.io` depending intent | redirect or repurpose |
| `pay.blackroad.io` | owning product or foundation host once explicit | decide and redirect |
| `app.blackroad.io` | `blackroad.io/app` or `os.blackroad.io/app` depending umbrella-shell decision | consolidate |
| `roadauth.blackroad.io` | `carkeys.blackroad.io` | redirect |
| `roadlog.blackroad.io` | `blackboard.blackroad.io` or internal-only status/log surface | decide and redirect/internalize |

### Migration rules
- if the messy host is merely a synonym, redirect it
- if the messy host has a distinct long-term purpose, document that purpose before keeping it
- if the messy host currently serves the wrong content, fix routing before deciding SEO behavior
- do not keep unresolved duplicates live indefinitely

## The Roadies — 27 AI Agents

### Core
| Agent | Role | Voice | Skills Loaded |
|-------|------|-------|---------------|
| **Roadie** | Front Door / Task Runner / Field Agent | "Yep. Got it. Lets move." | roadtrip, roadie, roadside |
| **Lucidia** | Core Intelligence / Memory Spine / Master Orchestrator | "Lets make this clean and real." | operator, empire, blackroad-os |

### Operations
| Agent | Role | Voice | Skills Loaded |
|-------|------|-------|---------------|
| **Cecilia** | Executive Operator / Workflow Manager | "Already handled." | operator, roadwork |
| **Octavia** | Systems Orchestrator / Queue Manager | "Everything has a place." | operator, BlackRoad-Network, BlackRoad-Hardware |
| **Olympia** | Command Console / Launch Control | "Raise the standard." | operator, BlackRoad-Cloud, empire |
| **Silas** | Reliability / Maintenance / Quiet Execution | "Ill keep it running." | operator, BlackRoad-Security |
| **Sebastian** | Client-Facing Polish / Presentation | "Theres a better way to present this." | empire, BlackRoad-Studio |

### Creative
| Agent | Role | Voice | Skills Loaded |
|-------|------|-------|---------------|
| **Calliope** | Narrative Architect / Copy / Messaging | "Say it so it stays." | roadbook, backroad, BlackRoad-Media |
| **Aria** | Voice / Conversational Interface | "Lets make it sing." | BlackRoad-Studio, officeroad |
| **Thalia** | Creative Sprint / Social / Delight | "Make it better and more fun." | roadworld, officeroad, BlackRoad-Studio |
| **Lyra** | Signal / Sound / Rhythm / UX Polish | "It should feel right immediately." | BlackRoad-Studio, roadworld |
| **Sapphira** | Brand Aura / Luxury Identity / Visual Taste | "Make it unforgettable." | BlackRoad-Studio, empire |
| **Seraphina** | Visionary Creative Director / Big Launch Energy | "Make it worthy." | BlackRoad-Studio, BlackRoad-Media |

### Knowledge
| Agent | Role | Voice | Skills Loaded |
|-------|------|-------|---------------|
| **Alexandria** | Archive / Library / Research Retrieval | "Its all here." | BlackRoad-Archive (22,603 files), amundson, BlackRoad-Labs |
| **Theodosia** | Doctrine / Canon / Foundational Texts | "Name it correctly." | empire, BlackRoad-README |
| **Sophia** | Wisdom Layer / Final Reasoning / Philosophical Core | "What is true?" | empire, amundson |
| **Gematria** | Symbolic Analysis / Pattern Engine | "The pattern is there." | amundson, BlackRoad-Labs, BlackRoad-Forge (28,001 files) |

### Governance
| Agent | Role | Voice | Skills Loaded |
|-------|------|-------|---------------|
| **Portia** | Policy Judge / Constraint Engine / Arbitration | "Lets be exact." | roadwork, empire |
| **Atticus** | Reviewer / Auditor / Proof Checker | "Show me the proof." | operator, BlackRoad-Security |
| **Cicero** | Rhetoric / Public Argument / Strategic Persuasion | "Lets make the case." | backroad, roadtrip |
| **Valeria** | Security Chief / Boundary Keeper / Enforcement | "Not everything gets access." | carkeys, BlackRoad-Security |

### Human
| Agent | Role | Voice | Skills Loaded |
|-------|------|-------|---------------|
| **Alice** | Exploration / Onboarding / Curiosity Guide | "Okay, but whats actually going on here?" | roadside, roadie |
| **Celeste** | Calm Companion / UI Comfort / Reassurance | "Youre okay. Lets do this simply." | blackboard, BlackRoad-Archive |
| **Elias** | Teacher / Patient Explainer / Reflective Guide | "Lets slow down and understand it." | roadie, BlackRoad-Education |
| **Ophelia** | Reflection / Mood / Depth Layer | "Theres something underneath this." | roadbook, backroad |

### Infrastructure
| Agent | Role | Voice | Skills Loaded |
|-------|------|-------|---------------|
| **Gaia** | Infrastructure / Hardware / World-State Monitor | "What is the system actually standing on?" | operator, BlackRoad-Hardware (15,743 files), BlackRoad-Network |
| **Anastasia** | Restoration / Recovery / Repair | "It can be made whole again." | operator, BlackRoad-Archive, BlackRoad-Hardware |

### Skill System
- **64 skills loaded** across 27 agents via Skill Seekers
- Skills stored in D1 `agent_skills` table, injected into system prompts as `[Trained Skills]`
- Response format: **What I know** / **My take** / **Action**
- Seed script: `bash ~/blackroad-skills/seed-roadtrip.sh`
- API: `GET /api/skills` lists all loaded skills per agent
- Live at: roadtrip.blackroad.io

## Totals (audited 2026-04-08)

### GitHub
- **44 GitHub organizations** (5 empty, 12 placeholder with only .github)
- **2,864 total repos** (1,879 public + 985 private) — Archive alone has 1,459
- **Top 5 orgs**: Archive (1,459), Forge (485), OS-Inc (329), OS (93), BlackRoadOS (66)

### Domains & Routing
- **20 root domains** on Cloudflare
- **135 live endpoints** across 17 active root domains
- **17 products** returning 200 with full worker.js apps
- **15 alias hosts** 301-redirecting to canonical product hosts (Migration Map complete)
- **Zero duplicate surfaces** — every alias redirects, every product has one canonical URL

### Products
- **18 canonical products** (all in BlackRoad-Products, mirrored in BlackRoadOS)
- **16 of 17** deployed with worker.js as entry point (carkeys/roadcoin have build errors)
- All products serve real apps, not landing pages

### Sovereign Forks
- **150+ sovereign forks** (Road* repos replacing every external dependency)
- **110+ game repos** in BlackRoad-Forge feeding into RoadWorld
- **485 repos** in BlackRoad-Forge alone
- **329 repos** in BlackRoad-OS-Inc (the nerve center)

### AI & Agents
- **27 Roadie agents** across 6 divisions (core, operations, creative, knowledge, governance, human, infrastructure)
- **64 skills loaded** across all 27 agents via Skill Seekers
- **135,016 source files** analyzed for skills
- **47 skill ZIPs** (27 org + 20 product) totaling 390 MB
- **24,346 design patterns** detected across codebases
- Response format enforced: What I know / My take / Action

### Fleet
- **5 Pi fleet nodes** (3 online: lucidia, cecilia, alice + 2 cloud: anastasia, gematria)
- **2 Pi nodes offline** (aria, octavia — physical recovery needed)

### Templates
- **22,738 JSX/TSX/HTML** template files crawled from all orgs (328 MB)
- **81 local templates** in ~/Desktop/templates/ — all brand-compliant
- **3,910 brand fixes** applied across repo templates
- **130 brand fixes** applied to local templates

### Languages (across all codebases)
- 15 languages: C++ (24%), TypeScript (17%), Python (14%), Go (11%), JavaScript (10%), C (7%), Rust (4%), C# (5%), PHP (3%), GDScript (1%), Java, Ruby, Go Template, GodotScene

## Recent Forks (2026-04-08)

### High-Priority Forks
| Repo | Source | Description | BlackRoad Use |
|------|--------|-------------|---------------|
| **Skill_Seekers** | yusufkaraaslan/Skill_Seekers | Convert docs, repos, PDFs into Claude AI skills | **DEPLOYED** — 20 product skills + 39 org skills built |
| **open-agent-builder** | mendableai/open-agent-builder | Visual drag-and-drop AI agent workflow builder (React Flow + LangGraph) | RoadWork visual automation UI |
| **ssh-dashboard** | AlpinDale/ssh-dashboard | Go TUI fleet monitor over SSH — CPU/GPU/RAM/disk, multi-host overview | Pi fleet monitoring — run today |
| **PhoneDriver** | OminousIndustries/PhoneDriver | AI-controlled Android via Qwen3-VL vision model + ADB | Future mobile agent capability |

### Research & Tools Forks
| Repo | Source | Description | BlackRoad Use |
|------|--------|-------------|---------------|
| **TraceAnything** | SysCV/TraceAnything | ICLR 2026 — 4D video reconstruction via trajectory fields | Long-term RoadWorld 3D content (needs 48GB VRAM) |
| **palaeograph** | DFin/palaeograph | Browser 3D data viewer (Three.js, CSV→scatter plot) | General 3D data visualization base |
| **portfolio** | NotStark/portfolio | Next.js interactive portfolio (terminal UI, pixel art, games) | Harvest UI components |
| **FastApps** | DooiLabs/FastApps | ChatGPT MCP widget builder | Low value — ChatGPT-locked |
| **chrome2nas** | adarshpalnati1-del/chrome2nas | Chrome→NAS video downloader | Skip — no source code |

### Game Engine Forks (same day)
TilemapTown, my-virtual-office, prowl (C# 3D engine), godot, lumixengine, pixelwheels, GameBoyWorlds, ncine, FreeRCT, agent-office, omnicoreagent, OfficeVerse-, IdleCity — all fed into RoadWorld Game Library (see section 8).

### Deleted
| Repo | Reason |
|------|--------|
| ~~crypto-tax-calculator~~ | **MALWARE** — trojan in setup.py, downloads remote shell from 176.65.132.96. Deleted 2026-04-08. |

---

## Skill Seekers — AI Knowledge System

### What It Is
Skill Seekers (`pip install skill-seekers`) converts documentation, repos, PDFs, and videos into structured knowledge assets for Claude, Gemini, OpenAI, LangChain, LlamaIndex, and 16+ other AI targets.

### Deployed At
`~/blackroad-skills/` — all skills live here.

### Product Skills (20)
Each of the 18 products + operator + empire doc + amundson analyzed and packaged as Claude skill ZIPs:
amundson.zip, backroad.zip, blackboard.zip, blackroad-os.zip, carkeys.zip, carpool.zip, empire.zip, officeroad.zip, oneway.zip, operator.zip (5.9MB — 744 files, 704 docs, 268 patterns), roadbook.zip, roadchain.zip, roadcode.zip, roadcoin.zip, roadie.zip, roadside.zip, roadtrip.zip, roadview.zip, roadwork.zip, roadworld.zip

### Org Skills (39)
Every org analyzed as a single skill (100 repos per org cap):
`~/blackroad-skills/orgs/BlackRoad-{Archive,Forge,OS-Inc,...}.zip`

### Analysis Results (as of 2026-04-08, first 2 orgs)
| Org | Files | Languages | Patterns | Tests | Guides | Docs | Configs | ZIP |
|-----|-------|-----------|----------|-------|--------|------|---------|-----|
| BlackRoad-Archive | 22,603 | 10 (TS 29%, Py 23%, Go 16%, C++ 9%) | 13,713 | 3,772 | 707 | 79,834 | 14,257 | 199 MB |
| BlackRoad-Forge | 28,001 | 13 (C++ 37%, C 13%, JS 12%, Rust 8%) | 10,365 | 1,825 | 422 | 5,298 | 35,477 | 35 MB |
| *remaining 37 orgs* | *in progress* | — | — | — | — | — | — | — |

### Scripts
| Script | Purpose |
|--------|---------|
| `~/blackroad-skills/build-all-skills.sh` | Rebuild all 20 product skills from latest repo state |
| `~/blackroad-skills/analyze-all-orgs.sh` | Clone + analyze all 39 orgs (100 repos each) |

### How to Use
```bash
# Rebuild product skills
bash ~/blackroad-skills/build-all-skills.sh

# Rebuild org skills
bash ~/blackroad-skills/analyze-all-orgs.sh

# Analyze a single repo
skill-seekers analyze --directory /path/to/repo --output ~/blackroad-skills/name --name "name" --description "desc" --comprehensive

# Package for Claude
echo "y" | skill-seekers package name --target claude
```

---

## Final Recommendation
Yes: make product hosts canonical at the full product slug level.

Use this pattern:
- product frontend: `https://fullnameproduct.blackroad.io/`
- product health: `https://fullnameproduct.blackroad.io/health` only when the host is runtime-backed
- product app path: `https://fullnameproduct.blackroad.io/app` only when `/` is intentionally marketing or overview

Do not use this pattern:
- duplicate canonical hosts for the same product
- `/app` on every product by habit
- public health endpoints on purely static landing pages unless there is an operational reason
