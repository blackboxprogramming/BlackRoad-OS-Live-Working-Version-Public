# BlackRoad Canonical Product Structures

> Draft / working copy. Canonical source of truth moved to [`/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md`](/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md) and [`/Users/alexa/infra/blackroad_registry.json`](/Users/alexa/infra/blackroad_registry.json).

## Purpose
This document defines the canonical structure for all 18 BlackRoad products.

It answers four questions for every product:
- What is the canonical hostname?
- Should the product live at `/` or use `/app`?
- Which routes should exist?
- What should the JSX or Next.js `app/` structure look like?

This is written to be implementation-ready for a React or Next.js App Router codebase.

## Global Rules
### Canonical Hostnames
Each product gets one canonical host.

Examples:
- `os.blackroad.io`
- `roadtrip.blackroad.io`
- `roadcode.blackroad.io`
- `officeroad.blackroad.io`
- `blackboard.blackroad.io`

Aliases are allowed only as redirects.

Examples:
- `roadchat.blackroad.io` -> `chat.blackroad.io`
- `roadview.blackroad.io` -> `search.blackroad.io`
- `blackroados.blackroad.io` -> `os.blackroad.io`

### Root vs `/app`
Default rule:
- If the hostname is the product, the product lives at `/`.

Use `/app` only when:
- `/` is a marketing or overview page
- the authenticated workspace needs a separate URL
- the product intentionally combines marketing and application on one host

Do not add `/app` to every product by habit.

### Health Endpoints
Use these machine routes only when the product is runtime-backed:
- `/health`
- `/ready`
- `/version`

Recommended JSON:
```json
{
  "status": "ok",
  "service": "roadtrip",
  "version": "1.0.0"
}
```

Static landing pages do not need public health endpoints.

### Shared App Router Conventions
Use these top-level patterns consistently:

```text
app/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
  api/
  (marketing)/
  (app)/
components/
lib/
styles/
public/
```

### Shared Platform Routes
These can exist across most products when relevant:
- `/`
- `/settings`
- `/help`
- `/pricing`
- `/docs`
- `/api/*`
- `/health`

Do not force every route into every product. Only keep routes that fit the product.

## Platform Route Patterns
### Pattern A: Pure App Product
Use for products where the root is the actual working app.

Structure:
```text
/
/settings
/help
/api/*
/health
```

Recommended for:
- RoadTrip
- RoadChat
- RoadCode
- RoadWork
- CarKeys
- CarPool
- RoadChain
- RoadCoin
- OneWay
- BlackBoard
- RoadView

### Pattern B: Marketing + App Split
Use when the product needs a strong public landing page and a separate authenticated workspace.

Structure:
```text
/
/features
/pricing
/docs
/app
/app/settings
/api/*
/health
```

Recommended for:
- BlackRoad OS
- RoadBook
- RoadWorld
- OfficeRoad
- BackRoad

### Pattern C: Guided Flow Product
Use when the main product is a step-based experience.

Structure:
```text
/
/start
/steps/[step]
/complete
/settings
/api/*
/health
```

Recommended for:
- RoadSide
- Roadie

## Product-by-Product Canonical Structures

## 1. BlackRoad OS
Canonical host:
- `https://os.blackroad.io/`

Recommended model:
- marketing + app split

Canonical routes:
- `/`
- `/about`
- `/features`
- `/agents`
- `/docs`
- `/app`
- `/app/settings`
- `/app/files`
- `/app/desktop`
- `/health`
- `/ready`
- `/version`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  about/page.tsx
  features/page.tsx
  agents/page.tsx
  docs/page.tsx
  app/
    layout.tsx
    page.tsx
    desktop/page.tsx
    files/page.tsx
    settings/page.tsx
  api/
    health/route.ts
    ready/route.ts
    version/route.ts
```

Core JSX surfaces:
- shell layout
- dock
- menubar
- window manager
- launcher
- settings panels

## 2. RoadTrip
Canonical host:
- `https://roadtrip.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/rooms`
- `/agents`
- `/memory`
- `/settings`
- `/health`
- `/api/chat`
- `/api/agents`
- `/api/memory`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  rooms/page.tsx
  agents/page.tsx
  memory/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    chat/route.ts
    agents/route.ts
    memory/route.ts
```

Core JSX surfaces:
- chat thread
- agent roster
- room switcher
- memory panel
- system narration bar

## 3. Roadie
Canonical host:
- `https://tutor.blackroad.io/`

Recommended model:
- guided flow product

Canonical routes:
- `/`
- `/start`
- `/subjects`
- `/challenge/[id]`
- `/history`
- `/settings`
- `/health`
- `/api/solve`
- `/api/hints`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  start/page.tsx
  subjects/page.tsx
  challenge/[id]/page.tsx
  history/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    solve/route.ts
    hints/route.ts
```

Core JSX surfaces:
- topic picker
- tutoring workspace
- step-by-step reasoning panel
- hints rail
- answer validation

## 4. RoadChat
Canonical host:
- `https://chat.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/models`
- `/history`
- `/settings`
- `/health`
- `/api/chat`
- `/api/models`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  models/page.tsx
  history/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    chat/route.ts
    models/route.ts
```

Core JSX surfaces:
- chat composer
- model switcher
- history list
- system prompt panel

## 5. RoadCode
Canonical host:
- `https://roadcode.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/projects`
- `/editor/[id]`
- `/deployments`
- `/settings`
- `/health`
- `/api/files`
- `/api/run`
- `/api/deploy`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  projects/page.tsx
  editor/[id]/page.tsx
  deployments/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    files/route.ts
    run/route.ts
    deploy/route.ts
```

Core JSX surfaces:
- file tree
- editor pane
- preview pane
- deploy drawer
- console output

## 6. BackRoad
Canonical host:
- `https://social.blackroad.io/`

Recommended model:
- marketing + app split

Canonical routes:
- `/`
- `/features`
- `/community`
- `/app`
- `/app/feed`
- `/app/rooms`
- `/app/profile/[handle]`
- `/settings`
- `/health`
- `/api/feed`
- `/api/post`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  features/page.tsx
  community/page.tsx
  app/
    layout.tsx
    page.tsx
    feed/page.tsx
    rooms/page.tsx
    profile/[handle]/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    feed/route.ts
    post/route.ts
```

Core JSX surfaces:
- feed
- post composer
- rooms list
- profile cards
- moderation controls

## 7. RoadBook
Canonical host:
- `https://roadbook.blackroad.io/`

Recommended model:
- marketing + app split

Canonical routes:
- `/`
- `/discover`
- `/pricing`
- `/docs`
- `/app`
- `/app/write`
- `/app/library`
- `/app/publish`
- `/health`
- `/api/drafts`
- `/api/publish`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  discover/page.tsx
  pricing/page.tsx
  docs/page.tsx
  app/
    layout.tsx
    page.tsx
    write/page.tsx
    library/page.tsx
    publish/page.tsx
  api/
    health/route.ts
    drafts/route.ts
    publish/route.ts
```

Core JSX surfaces:
- writing editor
- article preview
- publication manager
- provenance panel

## 8. RoadWorld
Canonical host:
- `https://roadworld.blackroad.io/`

Recommended model:
- marketing + app split

Canonical routes:
- `/`
- `/gallery`
- `/templates`
- `/docs`
- `/app`
- `/app/worlds`
- `/app/editor/[id]`
- `/app/assets`
- `/health`
- `/api/worlds`
- `/api/assets`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  gallery/page.tsx
  templates/page.tsx
  docs/page.tsx
  app/
    layout.tsx
    page.tsx
    worlds/page.tsx
    editor/[id]/page.tsx
    assets/page.tsx
  api/
    health/route.ts
    worlds/route.ts
    assets/route.ts
```

Core JSX surfaces:
- world gallery
- builder canvas
- asset browser
- simulation controls

## 9. OfficeRoad
Canonical host:
- `https://officeroad.blackroad.io/`

Recommended model:
- marketing + app split

Canonical routes:
- `/`
- `/floors`
- `/agents`
- `/app`
- `/app/live`
- `/app/rooms`
- `/app/agent/[id]`
- `/health`
- `/api/live`
- `/api/rooms`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  floors/page.tsx
  agents/page.tsx
  app/
    layout.tsx
    page.tsx
    live/page.tsx
    rooms/page.tsx
    agent/[id]/page.tsx
  api/
    health/route.ts
    live/route.ts
    rooms/route.ts
```

Core JSX surfaces:
- live office map
- floor switcher
- room booking
- agent presence cards

## 10. RoadWork
Canonical host:
- `https://roadwork.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/entities`
- `/compliance`
- `/filings`
- `/settings`
- `/health`
- `/api/entities`
- `/api/compliance`
- `/api/filings`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  entities/page.tsx
  compliance/page.tsx
  filings/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    entities/route.ts
    compliance/route.ts
    filings/route.ts
```

Core JSX surfaces:
- entity dashboard
- compliance checklist
- filing calendar
- document upload

## 11. CarKeys
Canonical host:
- `https://carkeys.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/vault`
- `/sessions`
- `/permissions`
- `/settings`
- `/health`
- `/api/auth`
- `/api/sessions`
- `/api/permissions`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  vault/page.tsx
  sessions/page.tsx
  permissions/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    auth/route.ts
    sessions/route.ts
    permissions/route.ts
```

Core JSX surfaces:
- auth gate
- session manager
- permission matrix
- vault records

## 12. CarPool
Canonical host:
- `https://carpool.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/models`
- `/routes`
- `/usage`
- `/settings`
- `/health`
- `/api/route`
- `/api/models`
- `/api/usage`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  models/page.tsx
  routes/page.tsx
  usage/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    route/route.ts
    models/route.ts
    usage/route.ts
```

Core JSX surfaces:
- model router dashboard
- request logs
- provider status cards
- usage metrics

## 13. RoadChain
Canonical host:
- `https://roadchain.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/blocks`
- `/transactions`
- `/wallets`
- `/settings`
- `/health`
- `/api/blocks`
- `/api/transactions`
- `/api/wallets`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  blocks/page.tsx
  transactions/page.tsx
  wallets/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    blocks/route.ts
    transactions/route.ts
    wallets/route.ts
```

Core JSX surfaces:
- chain explorer
- transaction details
- wallet views
- validator status

## 14. RoadCoin
Canonical host:
- `https://roadcoin.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/wallet`
- `/transfers`
- `/rewards`
- `/settings`
- `/health`
- `/api/wallet`
- `/api/transfers`
- `/api/rewards`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  wallet/page.tsx
  transfers/page.tsx
  rewards/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    wallet/route.ts
    transfers/route.ts
    rewards/route.ts
```

Core JSX surfaces:
- wallet summary
- transfer flow
- rewards ledger
- balances and claims

## 15. RoadSide
Canonical host:
- `https://roadside.blackroad.io/`

Recommended model:
- guided flow product

Canonical routes:
- `/`
- `/start`
- `/steps/profile`
- `/steps/workspace`
- `/steps/agents`
- `/complete`
- `/health`
- `/api/onboarding`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  start/page.tsx
  steps/
    profile/page.tsx
    workspace/page.tsx
    agents/page.tsx
  complete/page.tsx
  api/
    health/route.ts
    onboarding/route.ts
```

Core JSX surfaces:
- onboarding wizard
- progress sidebar
- workspace setup
- completion state

## 16. OneWay
Canonical host:
- `https://oneway.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/exports`
- `/history`
- `/settings`
- `/health`
- `/api/export`
- `/api/history`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  exports/page.tsx
  history/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    export/route.ts
    history/route.ts
```

Core JSX surfaces:
- export builder
- provenance summary
- export history
- destination settings

## 17. BlackBoard
Canonical host:
- `https://blackboard.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/dashboards`
- `/reports`
- `/queries`
- `/settings`
- `/health`
- `/api/dashboards`
- `/api/reports`
- `/api/queries`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  dashboards/page.tsx
  reports/page.tsx
  queries/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    dashboards/route.ts
    reports/route.ts
    queries/route.ts
```

Core JSX surfaces:
- analytics dashboard
- report builder
- chart panels
- query runner

## 18. RoadView
Canonical host:
- `https://search.blackroad.io/`

Recommended model:
- pure app product

Canonical routes:
- `/`
- `/results`
- `/index`
- `/settings`
- `/health`
- `/api/search`
- `/api/suggest`
- `/api/index`

Recommended `app/` tree:
```text
app/
  layout.tsx
  page.tsx
  results/page.tsx
  index/page.tsx
  settings/page.tsx
  api/
    health/route.ts
    search/route.ts
    suggest/route.ts
    index/route.ts
```

Core JSX surfaces:
- search box
- results page
- filters rail
- index status panels

## Shared JSX Implementation Patterns
### Marketing + App Product
Recommended code shape:
```text
app/
  layout.tsx
  page.tsx
  features/page.tsx
  pricing/page.tsx
  docs/page.tsx
  app/
    layout.tsx
    page.tsx
    settings/page.tsx
components/
  marketing/
  shell/
  product/
lib/
  api/
  auth/
  config/
```

### Pure App Product
Recommended code shape:
```text
app/
  layout.tsx
  page.tsx
  settings/page.tsx
  api/
components/
  app-shell/
  panels/
  forms/
  charts/
lib/
  api/
  auth/
  models/
```

### Guided Flow Product
Recommended code shape:
```text
app/
  layout.tsx
  page.tsx
  start/page.tsx
  steps/
  complete/page.tsx
  api/
components/
  wizard/
  forms/
  progress/
lib/
  api/
  flow/
  validation/
```

## Final Decisions
Use these rules across the whole platform:
- Canonical host = one host per product.
- Product app at `/` unless there is a real reason for `/app`.
- `/app` only for marketing-plus-app split products.
- `/health` only for runtime-backed products.
- Short aliases redirect.
- Duplicate brand and function hosts do not stay indexable in parallel.

## Immediate Platform Normalization Targets
- `roadchat.blackroad.io` -> `chat.blackroad.io`
- `roadview.blackroad.io` -> `search.blackroad.io`
- `blackroados.blackroad.io` -> `os.blackroad.io`
- choose one canonical for `roadie.blackroad.io` vs `tutor.blackroad.io`

## Best Default Answer To Your Question
Yes: for all 18 canonical products, define the full product host first.

Use:
- `fullnameproduct.blackroad.io/`
- `fullnameproduct.blackroad.io/health`
- `fullnameproduct.blackroad.io/app` only where the root is not the app itself

Do not use:
- duplicate hosts as canonicals
- `/app` everywhere
- inconsistent health paths
