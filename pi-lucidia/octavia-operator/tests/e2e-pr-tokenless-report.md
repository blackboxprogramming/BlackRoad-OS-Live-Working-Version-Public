# E2E Test Report Template: Open PRs — Tokenless Paths & Cross-Org Connections

> NOTE: This file is a template/example used for tests. Concrete values are populated by CI or test fixtures and should not be treated as a live status report.

**Date:** `<REPORT_DATE>`
**Branch:** `<REPORT_BRANCH>`
**Repository:** `<REPORT_REPOSITORY>`

---

## Executive Summary

Tested all **<TOTAL_PRS_TESTED> open pull requests** against the BlackRoad tokenless gateway architecture.
Found **<CRITICAL_TOKENLESS_VIOLATIONS> critical tokenless violations**, **<PRS_WITH_MERGE_CONFLICTS> merge conflicts**, and **<CREDENTIAL_LEAKS> credential leaks**.

| Metric                     | Result                       |
|----------------------------|------------------------------|
| Total PRs Tested           | `<TOTAL_PRS_TESTED>`         |
| Gateway Unit Tests         | `125/125 PASSED`             |
| Vitest Unit Tests          | `11/11 PASSED`               |
| Tokenless Agent Scan       | `PASSED (main)`              |
| PRs with Merge Conflicts   | `<PRS_WITH_MERGE_CONFLICTS>` |
| PRs with Tokenless Issues  | `<PRS_WITH_TOKENLESS_ISSUES>`|
| Hardcoded Credentials      | `<HARDCODED_CREDENTIALS>`    |
| Direct Provider Bypasses   | `<DIRECT_PROVIDER_BYPASSES>` |

---

## Test Infrastructure

### Gateway Unit Tests (125/125 PASSED)
- `validateRequest` — 7 tests PASSED
- `pickProvider` — 5 tests PASSED
- `buildSystemPrompt` — 7 tests PASSED
- `RateLimiter` — 7 tests PASSED
- `mergeConfig` — 4 tests PASSED
- `Metrics` — 7 tests PASSED
- `Provider registry` — 7 tests PASSED
- `Policy file structure` — 25 tests PASSED
- `System prompts structure` — 28 tests PASSED

### Vitest Unit Tests (11/11 PASSED)
- `test/formatters/table.test.ts` — 3 tests PASSED
- `test/core/client.test.ts` — 4 tests PASSED
- `test/formatters/brand.test.ts` — 3 tests PASSED
- `test/core/config.test.ts` — 1 test PASSED

### Tokenless Agent Verification
```
$ verify-tokenless-agents.sh
OK: agents are tokenless and vendor-agnostic.
```
All 6 core agents (planner, octavia, lucidia, alice, cipher, prism) are clean.

---

## Per-PR Results

### PR #8 — `dependabot/npm_and_yarn/commander-14.0.3`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | `agents/page.tsx` (UI only, clean) |
| Cross-org connections | None |

**Changes:** Bumps `commander` from 13.1.0 to 14.0.3. Also includes shared base branch changes that delete `workers/auth/`, `lib/auth/brat.js`, and `tools/auth/br-auth.sh` (positive — removes auth credential handling from operators).

---

### PR #9 — `dependabot/github_actions/github-actions-6f1c561687`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | None |
| Cross-org connections | Workflow updates only |

**Changes:** Bumps GitHub Actions from v4/v5/v7 to v6/v8:
- `actions/checkout@v4` → `v6`
- `actions/setup-node@v4` → `v6`
- `actions/setup-python@v5` → `v6`
- `actions/github-script@v7` → `v8`

Affects 9 workflow files. All cross-repo references in `autonomous-cross-repo.yml` (targeting `BlackRoad-OS/blackroad-os-web`, `BlackRoad-OS/blackroad-os-docs`, etc.) remain intact and unchanged.

---

### PR #10 — `dependabot/npm_and_yarn/vitest-4.0.18`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | `agents/page.tsx` (UI only, clean) |
| Cross-org connections | None |

**Changes:** Bumps `vitest` from 3.2.4 to 4.0.18. Includes shared base branch changes.

---

### PR #11 — `dependabot/npm_and_yarn/conf-15.1.0`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | `agents/page.tsx` (UI only, clean) |
| Cross-org connections | None |

**Changes:** Bumps `conf` from 13.1.0 to 15.1.0. Includes shared base branch changes.

---

### PR #12 — `dependabot/npm_and_yarn/types/node-25.3.0`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | `agents/page.tsx` (UI only, clean) |
| Cross-org connections | None |

**Changes:** Bumps `@types/node` from 22.19.11 to 25.3.0. Includes shared base branch changes.

---

### PR #13 — `dependabot/npm_and_yarn/ora-9.3.0`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | `agents/page.tsx` (UI only, clean) |
| Cross-org connections | None |

**Changes:** Bumps `ora` from 8.2.0 to 9.3.0. Includes shared base branch changes.

---

### PR #14 — `dependabot/npm_and_yarn/blackroad-sf/eslint-plugin-jest-29.15.0`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | Large — emails, registry, templates, websites (all deleted in diff) |
| Cross-org connections | `autonomous-cross-repo.yml` references 7 BlackRoad-OS repos |

**Changes:** Bumps `eslint-plugin-jest` in `/blackroad-sf`. This PR has a non-linear merge base from master → main sync, modifying 229 files. Cross-repo workflow targets `BlackRoad-OS/blackroad-os-web`, `blackroad-os-docs`, `blackroad-cli`, `blackroad-agents`, `blackroad-os-mesh`, `blackroad-os-helper`, `blackroad-os-core`. Agent email templates and registry files are present but all content passes tokenless verification.

---

### PR #15 — `dependabot/npm_and_yarn/blackroad-sf/eslint-10.0.1`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | **YES** — `.github/CODEOWNERS` |
| Agent file changes | Same as PR #14 (shared base) |
| Cross-org connections | Same as PR #14 |

**Changes:** Bumps `eslint` from 9.39.3 to 10.0.1 in `/blackroad-sf`. Same merge base issue as PR #14.

---

### PR #25 — `claude/blackroad-web-core-CdUt2`
| Check | Result |
|-------|--------|
| Tokenless compliance | **PASS** |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | None |
| Agent file changes | None |
| Cross-org connections | None |

**Changes:** Adds `blackroad-web-core/` — Enterprise Web Kernel with HTML pages, CSS, and JS for domains, enterprise, motion, and organizations pages. 52 new files, 5604 insertions. Pure frontend — no backend API calls or credential handling.

---

### PR #27 — `copilot/implement-approved-design-template`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | None |
| Agent file changes | None |
| Cross-org connections | None |

**Changes:** Initial plan commit only — no code changes.

---

### PR #28 — `claude/review-merge-e2e-pr-gamUy`
| Check | Result |
|-------|--------|
| Tokenless compliance | **CRITICAL VIOLATION** |
| Hardcoded credentials | None (uses .env.example with empty values) |
| Direct provider calls | **YES — bypasses gateway** |
| Merge conflicts | None |
| Agent file changes | None |
| Cross-org connections | 30 integration configs |

**CRITICAL FINDINGS:**

1. **`integrations/client.ts` bypasses the tokenless gateway.** The `BlackRoadIntegrations.request()` method makes direct `fetch()` calls to provider API URLs (`api.openai.com/v1`, `api.anthropic.com/v1`) with credentials resolved from `process.env` — completely bypassing the BlackRoad Gateway at `:8787`. This violates the core tokenless architecture principle:
   ```
   [Agent CLIs] ---> [BlackRoad Gateway :8787] ---> [Ollama/Claude/OpenAI]
   ```
   The client routes directly:
   ```
   [Integration Client] ---> [api.openai.com] (with OPENAI_API_KEY from env)
   ```

2. **Direct provider URLs in configs:**
   - `integrations/chatgpt/config.yaml`: `api_base: https://api.openai.com/v1`
   - `integrations/claude/config.yaml`: `api_base: https://api.anthropic.com/v1`
   - `integrations/manifest.json`: Contains direct API base URLs for all AI providers

3. **Credential references (not leaked but referenced):**
   - `.env.example` lists `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `CLOUDFLARE_API_TOKEN`, etc.
   - `manifest.json` lists env_var names for all 30 integrations
   - Each config YAML defines auth env var names

4. **Mitigating factors:**
   - `.env.example` has **empty values** (no actual credentials leaked)
   - Each config includes a `gateway_route` field suggesting gateway routing was intended
   - The `client.ts` comment says "Routes requests through the tokenless gateway or directly to providers" — the "directly" path exists but should be removed or gated

**Recommendation:** PR #28 should NOT be merged without refactoring `client.ts` to route all AI provider requests through the BlackRoad Gateway. The `api_base` fields in configs should reference gateway routes, not direct provider URLs.

---

### PR #29 — `claude/build-blog-post-template-ktsvK`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | None |
| Agent file changes | None |
| Cross-org connections | None |

**Changes:** Adds blog post template system with modular components (header, body, sidebar, nav). Pure HTML/CSS — 7 files, 1760 insertions.

---

### PR #30 — `claude/mobile-skill-install-docs-HBzLg`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | None |
| Agent file changes | None |
| Cross-org connections | None |

**Changes:** Adds `MOBILE_SKILL_INSTALL.md` guide and updates `SKILLS.md` with mobile install link. Pure documentation — 2 files, 201 insertions.

---

### PR #31 — `copilot/verify-e2e-tests-and-merge`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | None |
| Agent file changes | None |
| Cross-org connections | None |

**Changes:** Initial plan commit only — no code changes.

---

### PR #32 — `claude/add-claude-documentation-DSe5h`
| Check | Result |
|-------|--------|
| Tokenless compliance | PASS |
| Hardcoded credentials | None |
| Direct provider calls | None |
| Merge conflicts | None |
| Agent file changes | None |
| Cross-org connections | None |

**Changes:** Rewrites `CLAUDE.md` to reflect actual blackroad-operator codebase. 1 file, 340 insertions, 2536 deletions.

---

## Cross-Org Connection Map

### Workflow Cross-Repo Targets (PRs #14, #15)
`autonomous-cross-repo.yml` dispatches to these BlackRoad-OS repos:
- `BlackRoad-OS/blackroad-os-web`
- `BlackRoad-OS/blackroad-os-docs`
- `BlackRoad-OS/blackroad-cli`
- `BlackRoad-OS/blackroad-agents`
- `BlackRoad-OS/blackroad-os-mesh`
- `BlackRoad-OS/blackroad-os-helper`
- `BlackRoad-OS/blackroad-os-core`

### Integration Cross-Org References (PR #28)
30 integrations referencing external services:
- **AI Providers:** Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), Grok (xAI), HuggingFace
- **Cloud Deploy:** Cloudflare, Railway, Vercel, DigitalOcean
- **Project Mgmt:** Notion, Linear, Jira
- **CRM:** Salesforce
- **Communication:** Slack, SendGrid, Instagram
- **Auth:** Clerk, Enclave
- **Banking:** Mercury
- **Payments:** Stripe
- **Infrastructure:** Tailscale, Raspberry Pi fleet
- **Mobile:** iSH, Working Copy, Termius
- **Storage:** Google Drive

---

## Summary of Issues Requiring Action

### CRITICAL (Block Merge)
1. **PR #28** — `integrations/client.ts` bypasses tokenless gateway with direct `fetch()` to `api.openai.com` and `api.anthropic.com`. Must be refactored to route through the gateway.

### HIGH (Resolve Before Merge)
2. **PRs #8–15** — All 8 dependabot/legacy PRs have merge conflicts in `.github/CODEOWNERS`. Resolve the CODEOWNERS conflict (choose between `@blackboxprogramming` and `@BlackRoad-OS-Inc/core-team` patterns).

### MEDIUM (Advisory)
3. **PRs #14, #15** — Have non-linear merge bases from master→main sync, causing 229+ file diffs. Consider rebasing onto current main.
4. **PR #28** — `.env.example` includes hardcoded `CLOUDFLARE_ACCOUNT_ID` value (`848cf0b18d51e0170e0d1537aec3505a`). While not a secret, it should be kept as a placeholder.

### LOW (No Action Required)
5. **PRs #25, #27, #29, #30, #31, #32** — All clean, no issues found.

---

## Tokenless Architecture Verification

The BlackRoad tokenless gateway architecture is **intact on main** and correctly enforced:

| Layer | Status |
|-------|--------|
| Code Analysis (`verify-tokenless-agents.sh`) | PASS — 0 forbidden patterns in agents/ |
| Runtime Environment Check (per-agent) | PASS — all 6 agents check for `*_API_KEY`/`*_TOKEN` |
| Gateway Isolation (`server.js`) | PASS — 125/125 tests pass |
| Provider Registry | PASS — 5 providers registered (ollama, openai, anthropic, gemini, claude alias) |
| Policy Enforcement | PASS — 6 agents with proper permissions, fallback chains, rate limits |
| System Prompts | PASS — 21 intent prompts, 6 agent prompts |

**Only PR #28 introduces a path that would violate this architecture.**
