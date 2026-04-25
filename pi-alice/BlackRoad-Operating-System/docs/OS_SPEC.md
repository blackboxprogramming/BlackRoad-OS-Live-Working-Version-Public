# BlackRoad OS Spec

This repository holds the canonical service registry for BlackRoad OS. The machine-readable source of truth lives in [`os-spec/os-spec.json`](../os-spec/os-spec.json) and is designed to be imported by automation, dashboards, and deployment tooling.

## Fields

Each entry under `services` defines one OS component with the following fields:

- **key**: Stable identifier used by tooling.
- **name**: Human-readable service name.
- **repoUrl**: Canonical GitHub repository for the service.
- **railwayUrl**: Production Railway hostname for runtime health checks.
- **cloudflareSubdomain**: Public DNS entry managed through Cloudflare.
- **healthPath**: Path segment appended to the base URL for health monitoring.

New services should extend the JSON file using the same shape so that dashboards and scripts can discover them automatically.
