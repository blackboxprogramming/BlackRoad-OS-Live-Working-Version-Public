# /Applications/BlackRoad/ — BlackRoad OS
## The Operating System Filesystem

| Layer | Contents | Purpose |
|-------|----------|---------|
| Backend/ | 9 worker sources + D1 inventory | Server-side code |
| FrontEnd/ | 25 DESIGNTEMPLATES | UI templates |
| Endpoints/ | Route maps, worker list, gap analysis | API surface |
| Scripts/ | br-workers, br-system, scrapers | CLI tools |
| Memory/ | Audit, KPI, D1, binder, browser state | Institutional memory |
| Public Layer/ | Static sites | What the world sees |
| Private Layer/ | Operator tools | Internal ops |
| ExampleApps/ | 125 BR-*.app files | Desktop apps |
| Website-MockUps/ | 88 HTML mockups | Product prototypes |

## Live Infrastructure
- 496 Cloudflare Workers
- 53 D1 Databases (30,303+ rows)
- 27 Agents (157,575 memories, 12,021 messages)
- 121 Ollama models across 5 fleet nodes
- 20 domains, 18 products, all UP

## Updated: 2026-04-13
