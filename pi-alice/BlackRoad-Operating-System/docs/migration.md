# Migration guide: legacy monorepo to BlackRoad-OS multi-repo

This document maps common areas of the legacy `blackboxprogramming/BlackRoad-Operating-System` monorepo to their new homes in the `BlackRoad-OS/*` ecosystem. Use it to locate historical context while building against the active repositories.

## Repository overview

- [`BlackRoad-OS/blackroad-os-core`](https://github.com/BlackRoad-OS/blackroad-os-core) — core APIs, backend runtime, and shared service contracts.
- [`BlackRoad-OS/blackroad-os-web`](https://github.com/BlackRoad-OS/blackroad-os-web) — marketing/public-facing web experience.
- [`BlackRoad-OS/blackroad-os-docs`](https://github.com/BlackRoad-OS/blackroad-os-docs) — documentation site, specs, and process docs.
- [`BlackRoad-OS/blackroad-os-prism-console`](https://github.com/BlackRoad-OS/blackroad-os-prism-console) — operator console, dashboards, and internal UI.
- [`BlackRoad-OS/blackroad-os-operator`](https://github.com/BlackRoad-OS/blackroad-os-operator) — agent runtime, orchestration engine, and worker graph.
- [`BlackRoad-OS/demo-repository`](https://github.com/BlackRoad-OS/demo-repository) — sample apps, SDK usage, and integration patterns.

## Path-by-path mapping

| Legacy path | Destination | Notes |
| --- | --- | --- |
| `services/core-api/` | [`blackroad-os-core`](https://github.com/BlackRoad-OS/blackroad-os-core) | Core FastAPI/Node services consolidated into the core backend. |
| `services/public-api/` | [`blackroad-os-core`](https://github.com/BlackRoad-OS/blackroad-os-core) | Public/edge API surface now lives with the core backend. |
| `backend/` | [`blackroad-os-core`](https://github.com/BlackRoad-OS/blackroad-os-core) and [`blackroad-os-web`](https://github.com/BlackRoad-OS/blackroad-os-web) | Backend runtime moved to `core`; static assets and UI flows live with the web repo. |
| `apps/prism-console/`, `prism-console/` | [`blackroad-os-prism-console`](https://github.com/BlackRoad-OS/blackroad-os-prism-console) | Operations console split out for independent release cadence. |
| `apps/web/`, `web-client/`, `public/` | [`blackroad-os-web`](https://github.com/BlackRoad-OS/blackroad-os-web) | Public website and marketing UI. |
| `apps/docs/`, `docs/site/`, `docs/` content | [`blackroad-os-docs`](https://github.com/BlackRoad-OS/blackroad-os-docs) | Documentation, specs, and publishing pipeline. |
| `services/operator/`, `operator_engine/`, `blackroad-os-operator/` | [`blackroad-os-operator`](https://github.com/BlackRoad-OS/blackroad-os-operator) | Agent runtime, workflows, and worker management. |
| `sdk/`, `templates/`, `examples/`, `apps/demo/` | [`demo-repository`](https://github.com/BlackRoad-OS/demo-repository) | Reference implementations and starter kits. |
| `infra/`, `deploy/`, `ops/`, `scripts/` | [`blackroad-os-core`](https://github.com/BlackRoad-OS/blackroad-os-core) and service-specific repos | Deployment automation now maintained per service; see repo-specific `/infra` or `/deploy` directories. |
| `os-spec/` | [`blackroad-os-docs`](https://github.com/BlackRoad-OS/blackroad-os-docs) | Machine-readable specs and governance docs now published with the documentation site. |

## Notes for contributors

- Treat this repository as read-only; do not open issues or PRs for active work here.
- When porting legacy code, prefer re-implementing against current interfaces in the target repo instead of copying files verbatim.
- Use commit history here for context, then document changes in the relevant `BlackRoad-OS/*` repository.

For questions about the multi-repo layout or historical references, open a discussion in the corresponding `BlackRoad-OS/*` project.
