# BlackRoad OS -- Live Working Version (Private)

This repository is the private live proving ground for BlackRoad OS.

## Role

`BlackRoad-OS-Live-Working-Version-Private` is where live routes, staged integrations, operational app shells, and end-to-end validation come together first. It should absorb mockups, replace dead pages with real app surfaces, and prove the platform in motion before anything is mirrored publicly.

## What Belongs Here

- deployable live/staging app surfaces
- real route wiring for domains and subdomains
- E2E and smoke validation for products, agents, auth, billing, and integrations
- staged connections to Cloudflare, Clerk, Stripe, GitHub, Gitea, Slack, Notion, Linear, Hugging Face, and Pi executors
- migration of mockups and templates into real app shells

## Shared Four-Repo Split

- `BlackRoad-OS-Live-Monorepo-Private` = canonical brain
- `BlackRoad-OS-Live-Working-Version-Private` = live proving ground
- `BlackRoad-OS-Live-Monorepo-Public` = curated public mirror
- `BlackRoad-OS-Live-Working-Version-Public` = polished public live/demo surface

## Execution Rule

Everything here should be driven by the canonical registry from the private monorepo. If a route exists, it should render a real surface. If a button exists, it should do something real.

## Immediate Priorities

1. Replace mock and placeholder routes with real app shells.
2. Wire host-based routing from the canonical domain registry.
3. Validate Clerk auth, Stripe billing, and agent runtime behavior.
4. Connect live integrations and Pi-backed execution paths.
5. Enforce E2E coverage for the priority domains, products, agents, and integrations.

---

Copyright 2026 BlackRoad OS, Inc. All rights reserved. Proprietary and confidential.
