# BlackRoadOS

This directory is the active BlackRoadOS root used by the `BlackRoadOS` symlink in `/Applications/blackboxprogramming`.

It is organized to match the shared BlackRoad filesystem template in `/Users/alexa/Downloads/BlackRoad-Source/FileSystems/Root/WORKINGFILESYSTEMTEMPLATE` and the code-oriented layout in `/Applications/BlackRoad/01-code/blackroad-os`.

## Top-level layout

- `agents` - agent definitions, roles, and orchestration assets
- `api` - API surfaces and contracts
- `apps` - application roots outside the live workspace
- `archive` - retired or frozen material
- `assets` - shared static assets
- `cli` - command-line tooling
- `config` - environment and configuration files
- `core` - foundational platform logic
- `data` - operational datasets and imports
- `docs` - system documentation
- `examples` - reference examples and starter material
- `infrastructure` - deploy and infrastructure assets
- `integrations` - third-party connectors
- `internal` - non-public internal modules
- `memory` - indexes, journals, and memory assets
- `models` - data and domain models
- `nodes` - node or worker definitions
- `packages` - reusable packages
- `products` - product-specific roots
- `roadmap` - planning artifacts
- `runtime` - runtime support files
- `scripts` - maintenance and automation scripts
- `services` - service implementations
- `system` - OS-level and platform system files
- `tests` - tests and fixtures
- `tools` - utility tooling
- `web` - web-facing surfaces
- `workflows` - workflow definitions
- `workspace` - live working area, including existing hardening logs and app work

## Current note

Existing active content remains under `workspace/`, including `workspace/apps/roadchain` and `workspace/hardening/2026-04-21/`.
