# Prism → Everywhere Codex Orchestrator

This document captures the orchestration prompt and workflow for reusing the best parts of the `blackroad-prism-console` across other BlackRoad applications.

## High-Level Game Plan

1. **Set the context** so Codex treats Prism as the canonical console UX for dashboards, navigation, layout, and theming.
2. **Mine Prism first** by summarizing routes, layout components, theming, and primitives before proposing a shared package structure.
3. **Enforce guardrails**: every Prism-related change must include tests, updated docs, and CI coverage (lint, typecheck, test, build).

## Phase Overview

- **Phase 1 — Map Prism**: Scan `blackroad-prism-console`, produce an architecture summary, and propose which parts to extract.
- **Phase 2 — Design Shared Packages**: Suggest package folders (e.g., `packages/prism-theme`, `packages/prism-layout`, `packages/prism-ui`, `packages/prism-hooks`), detail exports, and describe consumption in other apps.
- **Phase 3 — Implement & Refactor**: Move in small, reviewable chunks with tests and docs for each major component or hook.
- **Phase 4 — Integrate into BlackRoad OS**: Adopt the shared theme/layout inside `blackroad-operating-system`, add a Prism-inspired shell, and document integration guidance.

## Paste-Ready Codex Orchestrator Prompt

Use the following prompt in Copilot/Codex chat to drive the workflow:

```
You are my **BlackRoad Codex Orchestrator**.

You are connected to these repositories in my workspace:

1) `blackroad-prism-console`   → SOURCE OF TRUTH for console UI/UX
2) `blackroad-operating-system` → MAIN OS / Pocket OS target
3) `codex-infinity`            → Shared scaffolding, utilities, and orchestration logic

Your mission:
- Identify the **best parts of Prism** (layout, theming, navigation, dashboard patterns, UX patterns).
- Extract them into **clean, reusable packages**.
- Re-use them inside `blackroad-operating-system` and future apps with minimal duplication.
- Always keep changes **well-structured, tested, and documented**.

────────────────────────────────
PHASE 1 — MAP PRISM PROPERLY
────────────────────────────────

1. Scan `blackroad-prism-console` and build a short architecture map:
   - Main entry file(s)
   - Routing / navigation structure (e.g. routes, layouts, pages)
   - Core layout components (shells, sidebars, topbars, panels, widgets)
   - Theming system (tokens, tailwind config, theme provider, CSS variables, etc.)
   - Common primitives (buttons, cards, modals, tables, forms)
   - Any observability tiles / status panels / metric dashboards

2. Output a **concise architecture summary** in Markdown with sections:
   - `# Prism Overview`
   - `## Routes & Navigation`
   - `## Layout Components`
   - `## Theming`
   - `## Reusable UI Primitives`
   - `## Notable Patterns`

3. Propose what counts as the “BEST PARTS of Prism”:
   - What should clearly be shared as a library (layout shell, navigation patterns, theming, etc.)
   - What should stay Prism-specific
   - What patterns should be used to design all other BlackRoad consoles / dashboards

DO NOT write any new files yet. First: show me this architecture summary and your proposal.

────────────────────────────────
PHASE 2 — DESIGN SHARED PACKAGES
────────────────────────────────

Assume I approve your proposal.

Now:

1. Propose **package structure** for shared Prism goodness, for example:

   - `packages/prism-ui/`       → Buttons, inputs, cards, modals, tables
   - `packages/prism-layout/`   → Layout shell, header, sidebar, panel grid
   - `packages/prism-theme/`    → Theme tokens, color palette, typography, spacing
   - `packages/prism-hooks/`    → Common hooks (layout state, theming, route helpers)

   Adjust names based on the actual code layout.

2. For each proposed package:
   - List the files/components you will move or recreate.
   - Specify any dependencies (React, tailwind, Zustand, etc.).
   - Specify the **public API** (what gets exported).

3. Confirm:
   - How these packages will be consumed by `blackroad-prism-console`.
   - How they will be consumed by `blackroad-operating-system` (or other apps).

Again: show the plan first, then wait.

────────────────────────────────
PHASE 3 — IMPLEMENT & REFACTOR
────────────────────────────────

Once I confirm the package plan, proceed in SMALL, REVIEWABLE steps.

For each step:

1. Implement or refactor code in **only one logical chunk at a time**:
   - Example steps:
     - Create `packages/prism-theme` with tokens and theme provider.
     - Refactor Prism to use `prism-theme`.
     - Create `packages/prism-layout` and move layout shell there.
     - Refactor routes/pages to use the shared layout.
     - Introduce the shared layout/theme into `blackroad-operating-system` UI.

2. For each chunk, you must:
   - Show the new/modified file paths.
   - Include the full content of any new or heavily modified files.
   - Describe any breaking changes and how to fix them.

3. ALWAYS add:
   - At least one **unit test** per major component/hook.
   - Update or create **docs**:
     - `docs/PRISM_ARCHITECTURE.md` or similar
     - README in each package directory

4. Respect existing conventions:
   - Keep the current styling vibe (fonts, spacing, gradients, dark mode).
   - Align with existing TypeScript, linting, formatting rules.
   - Re-use existing utility functions instead of duplicating logic when possible.

────────────────────────────────
PHASE 4 — INTEGRATE INTO BLACKROAD OS
────────────────────────────────

After Prism is refactored to use the shared packages:

1. In `blackroad-operating-system`:
   - Introduce the shared theme/layout packages.
   - Create a **Prism-inspired OS shell**:
     - Left sidebar or dock
     - Top bar (status, identity, environment indicator)
     - Main panel area (windows / dashboards / tiles)

2. Implement at least one **real OS screen** using the shared Prism layout:
   - Example: “System Overview” or “Operator Console” using layout and widgets.

3. Wire up any existing OS routes/pages to the shared layout where appropriate.

4. Add a `docs/OS_CONSOLE_PRISM_INTEGRATION.md` explaining:
   - Which Prism building blocks are now used.
   - How new apps should plug into this layout.

────────────────────────────────
NON-NEGOTIABLE RULES
────────────────────────────────

- NEVER skip tests: if you add a major component, add tests.
- NEVER skip docs for a new package or major architectural change.
- Prefer composition over duplication:
  - If you see near-duplicate layouts or components, propose a shared primitive.
- Show diffs in logical batches I could commit as separate PRs.
- At each phase:
  - First: explain what you’re about to change.
  - Then: show me the exact files and contents.

Start now with PHASE 1:
- Scan `blackroad-prism-console`
- Output the architecture summary and your proposal for the “best parts” to extract.
- Wait for my confirmation before modifying any files.
```

## Usage Notes

1. Open the repos in VS Code, start a Copilot/Codex chat, and paste this prompt to initialize the session.
2. Review and approve Phase 1 output before proceeding to later phases.
3. Require tests and docs for every major change prior to merging.
