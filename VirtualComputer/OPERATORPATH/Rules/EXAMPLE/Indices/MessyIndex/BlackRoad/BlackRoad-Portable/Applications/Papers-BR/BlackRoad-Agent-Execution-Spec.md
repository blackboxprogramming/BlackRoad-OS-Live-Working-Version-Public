# BlackRoad Agent Execution Spec

> Draft / working copy. Canonical source of truth moved to [`/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md`](/Users/alexa/docs/BLACKROAD_OPERATING_MODEL.md), [`/Users/alexa/docs/BLACKROAD_AGENT_START.md`](/Users/alexa/docs/BLACKROAD_AGENT_START.md), and [`/Users/alexa/infra/blackroad_registry.json`](/Users/alexa/infra/blackroad_registry.json).

## Purpose
This document is the forever-plan for AI agents working on BlackRoad.

It is designed so that a future agent can:
- understand the ecosystem quickly
- know which folders and files are authoritative
- know what success means
- know how to complete work without improvising random structures
- know how to keep the 18 products, 20 orgs, domains, and design system aligned over time

This is an execution spec, not just strategy prose.

## Mission
BlackRoad is a sovereign operating system and product ecosystem centered on 18 canonical products, one unified brand system, and a platform architecture that can be operated by a solo founder with heavy AI assistance.

Agent work must optimize for:
- coherence
- canonical naming
- actual shipping
- reduced duplication
- reusable structure
- durable context for future agents

## Non-Negotiables
- Do not invent new design languages. Use the approved BlackRoad visual system.
- Do not create duplicate canonical hosts for the same product.
- Do not create new orgs or domains without a structural reason.
- Do not add `/app` to products unless the root is intentionally marketing or overview.
- Do not leave aliases as separately indexable products.
- Do not treat planning files as source of truth if they conflict with implemented canonical specs.

## Primary Canonical Artifacts
These are the files an agent should trust first.

### Product and domain planning
- [BlackRoad-Canonical-Product-Structures.md](/Users/alexa/Downloads/BlackRoad-Canonical-Product-Structures.md)
- [BlackRoad-18-Products-20-Orgs-Domain-Plan.md](/Users/alexa/Downloads/BlackRoad-18-Products-20-Orgs-Domain-Plan.md)
- [BlackRoad-Empire-Full-Plan.canonical.md](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.canonical.md)

### Raw and cleaned source planning material
- [BlackRoad-Empire-Full-Plan.cleaned.txt](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.cleaned.txt)
- [BlackRoad-Empire-Full-Plan.txt](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.txt)

### BlackRoad visual and site blueprint folder
- [BlackRoadOS](/Users/alexa/Desktop/BlackRoadOS)

Key files inside:
- [blackroad-brand-guide.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-brand-guide.html)
- [blackroad-color-preview.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-color-preview.html)
- [blackroad-os-inventory.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-os-inventory.html)
- [blackroad-os.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-os.html)
- [blackroad-io.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-io.html)
- [blackroad-company.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-company.html)
- [blackroad-company-app.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-company-app.html)
- [docs-page.html](/Users/alexa/Desktop/BlackRoadOS/docs-page.html)
- [dashboard.html](/Users/alexa/Desktop/BlackRoadOS/dashboard.html)
- [status-page.html](/Users/alexa/Desktop/BlackRoadOS/status-page.html)

### BlackRoad context and planning memory folder
- [BR-Context](/Users/alexa/Desktop/BR-Context)

Key files inside:
- [1 BlackRoad Master Execution Plan.txt](/Users/alexa/Desktop/BR-Context/1%20BlackRoad%20Master%20Execution%20Plan.txt)
- [BLACKROAD-OS-README.md](/Users/alexa/Desktop/BR-Context/BLACKROAD-OS-README.md)
- [BlackRoad_Master_Infrastructure_Plan_v4.docx.txt](/Users/alexa/Desktop/BR-Context/BlackRoad_Master_Infrastructure_Plan_v4.docx.txt)
- [Complete.txt](/Users/alexa/Desktop/BR-Context/Complete.txt)
- [PLAN_ FINALLY_.txt](/Users/alexa/Desktop/BR-Context/PLAN_%20FINALLY_.txt)
- [Update.txt](/Users/alexa/Desktop/BR-Context/Update.txt)

## Folder Roles
### `Desktop/BlackRoadOS`
Purpose:
- visual source of truth
- marketing/site blueprint
- brand and interface references
- portfolio and org-facing HTML artifacts

What agents should use it for:
- matching layouts and visuals
- extracting approved colors, type, spacing, and shell structure
- understanding how company, product, docs, and status surfaces should look

What agents should not use it for:
- inventing product architecture
- overriding canonical route and domain rules

### `Desktop/BR-Context`
Purpose:
- founder context
- high-level roadmap
- system rationale
- long-horizon planning
- memory and execution framing

What agents should use it for:
- understanding intent
- understanding platform pillars
- understanding the execution horizon
- understanding what matters strategically

What agents should not use it for:
- blindly copying old org/domain sprawl
- treating every listed subdomain as still-canonical

## The 18 Canonical Products
- BlackRoad OS
- RoadTrip
- Roadie
- RoadChat
- RoadCode
- BackRoad
- RoadBook
- RoadWorld
- OfficeRoad
- RoadWork
- CarKeys
- CarPool
- RoadChain
- RoadCoin
- RoadSide
- OneWay
- BlackBoard
- RoadView

## The 20 Operating Orgs
- `BlackRoad-OS`
- `BlackRoad-Agents`
- `BlackRoad-Education`
- `BlackRoad-AI`
- `BlackRoad-Code-Solutions`
- `BlackRoad-Media`
- `BlackRoad-Interactive`
- `BlackRoad-Products`
- `BlackRoad-Foundation`
- `BlackRoad-Infrastructure`
- `BlackRoad-Quantum`
- `BlackRoad-QI`
- `BlackRoad-Data`
- `BlackRoad-Analytics`
- `BlackRoad-Index`
- `BlackRoad-Cloud`
- `BlackRoad-Security`
- `BlackRoad-Network`
- `BlackRoad-Studio`
- `BlackRoad-Ventures`

## What Success Is
Success is not “more files” or “more subdomains.”

Success means:
- every one of the 18 products has one canonical hostname
- every product has one owning org
- every product has an explicit route model
- every product has a clear app structure
- aliases redirect instead of competing
- design across products matches the BlackRoad source-of-truth visual system
- backend products expose consistent health endpoints
- marketing surfaces and app surfaces are intentionally separated
- future agents can update the system without re-deciding fundamentals

## What Completion Looks Like
A piece of work is complete only when all of these are true:

### Naming complete
- the product has one canonical name
- the host is settled
- aliases are documented
- redirects are defined if needed

### Routing complete
- `/` behavior is defined
- `/app` is either explicitly used or explicitly rejected
- `/health` is either explicitly required or explicitly omitted
- `/api/*` scope is defined

### Structure complete
- the JSX or Next.js `app/` tree is defined
- core surfaces are listed
- ownership is mapped to an org

### Design complete
- visual implementation references BlackRoad brand files
- typography, colors, nav, buttons, cards, and shell match approved templates

### Operational complete
- success criteria are written
- dependencies are named
- next implementation step is obvious

## Agent Read Order
Every future AI agent should read in this order before making major structural decisions.

### Tier 1: Immediate canonical rules
1. [BlackRoad-Canonical-Product-Structures.md](/Users/alexa/Downloads/BlackRoad-Canonical-Product-Structures.md)
2. [BlackRoad-18-Products-20-Orgs-Domain-Plan.md](/Users/alexa/Downloads/BlackRoad-18-Products-20-Orgs-Domain-Plan.md)
3. [BlackRoad-Empire-Full-Plan.canonical.md](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.canonical.md)

### Tier 2: visual truth
4. [blackroad-brand-guide.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-brand-guide.html)
5. [blackroad-color-preview.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-color-preview.html)
6. [blackroad-os-inventory.html](/Users/alexa/Desktop/BlackRoadOS/blackroad-os-inventory.html)

### Tier 3: strategic context
7. [1 BlackRoad Master Execution Plan.txt](/Users/alexa/Desktop/BR-Context/1%20BlackRoad%20Master%20Execution%20Plan.txt)
8. [BLACKROAD-OS-README.md](/Users/alexa/Desktop/BR-Context/BLACKROAD-OS-README.md)
9. [BlackRoad_Master_Infrastructure_Plan_v4.docx.txt](/Users/alexa/Desktop/BR-Context/BlackRoad_Master_Infrastructure_Plan_v4.docx.txt)

### Tier 4: raw legacy material only if needed
10. [BlackRoad-Empire-Full-Plan.cleaned.txt](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.cleaned.txt)
11. [BlackRoad-Empire-Full-Plan.txt](/Users/alexa/Downloads/BlackRoad-Empire-Full-Plan.txt)

## Agent Decision Rules
### If working on a product app
- read the canonical product structures first
- use the defined canonical hostname
- use the listed route model
- do not create a second product shell

### If working on design
- read from `Desktop/BlackRoadOS`
- match the approved brand language
- do not invent a new visual direction

### If working on domains or infra
- read the 20-org domain plan
- keep one owner per product
- convert duplicates into redirects

### If working on docs or plans
- update the canonical Markdown docs first
- leave raw archive files as archive material

## Forever Maintenance Loop
Agents should follow this loop repeatedly.

### Step 1: identify the target
Classify the work as one of:
- product
- domain
- org
- design
- infra
- docs

### Step 2: resolve the canonical owner
Determine:
- canonical product
- canonical host
- owning org
- supporting orgs

### Step 3: resolve the route model
Determine:
- app at `/` or split with `/app`
- whether `/health` exists
- whether APIs are local or shared

### Step 4: resolve the visual model
Determine:
- which BlackRoadOS reference file matches the intended surface
- whether this is app shell, marketing, docs, dashboard, or status

### Step 5: implement without drift
Rules:
- reuse the brand shell
- reuse the canonical route patterns
- reuse org ownership rules
- avoid new aliases unless explicitly approved

### Step 6: document the outcome
Every meaningful structural change should update:
- canonical plan doc if the rule changed
- registry or mapping doc if ownership changed
- product structure doc if routes changed

## Product Success Criteria
For any one of the 18 products, success means:
- the product host resolves correctly
- the visual shell matches BlackRoad
- the route model is consistent
- the product’s core flow works
- health is exposed if the runtime requires it
- aliases redirect cleanly
- the owning org is obvious from the plan

## Ecosystem Success Criteria
For the whole system, success means:
- 18 canonical products remain stable
- 20 operating orgs are enough and do not sprawl
- `blackroad.io` remains the portfolio root
- product hosts remain product-first
- context is readable by new agents in under 15 minutes

## When To Create Something New
Create a new:

### Product
Only when:
- it is a truly separate user-facing workflow
- it cannot fit inside an existing product cleanly
- it deserves its own canonical host and org owner

### Domain
Only when:
- it represents a true portfolio, corporate, or major brand surface
- it is not just a duplicate of an existing canonical product

### Org
Only when:
- ownership boundaries are real
- code, team, or governance needs are distinct
- it maps to either one of the 18 products or a shared platform layer

## What Not To Do
- do not treat every old subdomain as canonical
- do not create multiple app shells for the same product
- do not mix design systems
- do not make aliases indexable
- do not create health endpoints on static sites just for symmetry
- do not use planning docs as excuses to avoid implementation structure

## Implementation Backbone
Agents should assume the implementation target is JSX-first and App Router-friendly.

Default repo/application shape:
```text
app/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
  settings/
  api/
components/
  shell/
  product/
  marketing/
lib/
  api/
  auth/
  config/
styles/
public/
```

## Completion Checklist For Any Agent
Before calling work complete, check:
- Did I use the canonical host?
- Did I preserve the approved BlackRoad design language?
- Did I avoid creating a duplicate route or alias?
- Did I define `/app` intentionally rather than reflexively?
- Did I define `/health` only if the runtime needs it?
- Did I keep ownership aligned with the 20-org plan?
- Did I update the canonical docs if the structure changed?

If any answer is no, the work is not complete.

## Final Rule
BlackRoad should become easier for every future agent to operate, not harder.

Every structural decision must reduce ambiguity for the next AI.
