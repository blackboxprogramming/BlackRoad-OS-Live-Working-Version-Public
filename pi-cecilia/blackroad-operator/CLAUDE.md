# CLAUDE.md

This file provides guidance to Claude Code when working with the `blackroad-operator` repository.

---

## Project Overview

`blackroad-operator` is the CLI tooling, node bootstrap, and operational control center for BlackRoad OS. It provides two complementary CLI interfaces:

1. **TypeScript CLI** (`src/`) — A modern `commander`-based CLI published as `@blackroad/operator` (the `br` binary via `dist/bin/br.js`)
2. **Shell CLI** (`br` at root) — A 91 KB zsh dispatcher that routes `br <command>` to 90 tool scripts in `tools/`

The repo also contains the MCP bridge server, agent infrastructure, coordination system, and project templates.

**Owner:** BlackRoad OS, Inc. (proprietary, all rights reserved)

---

## Quick Start

```bash
# TypeScript CLI
npm install
npm run build          # Compile TypeScript to dist/
npm run dev            # Watch mode with tsx
npm test               # Run vitest test suite
npm run lint           # Check formatting with prettier
npm run format         # Auto-format with prettier

# Shell CLI
chmod +x br
./br help              # Show all tool commands
```

---

## Repository Structure

```
blackroad-operator/
├── src/                    # TypeScript source (the @blackroad/operator package)
│   ├── bin/br.ts           # Entry point — parses CLI args
│   ├── cli/commands/       # Commander subcommands (8 commands)
│   ├── core/               # Shared utilities (client, config, logger, spinner)
│   ├── formatters/         # Output formatters (brand, json, table)
│   ├── bootstrap/          # Preflight checks & project templates
│   └── index.ts            # Public API exports
├── test/                   # Vitest unit tests (mirrors src/ structure)
├── tests/                  # Shell-based golden tests
├── br                      # Main shell CLI dispatcher (zsh)
├── tools/                  # 90 tool scripts invoked via `br <tool>`
├── lib/                    # Shell libraries (colors, config, db, errors, system, ollama)
├── blackroad-core/         # Tokenless gateway architecture
│   ├── gateway/            # Express.js gateway server + providers
│   ├── agents/             # Agent shell scripts (planner, alice, lucidia, etc.)
│   └── policies/           # Agent permission matrix
├── mcp-bridge/             # FastAPI MCP bridge server (localhost:8420)
├── agents/                 # Agent manifests, registry, active/idle/processing dirs
├── coordination/           # Multi-agent coordination scripts
├── scripts/                # Bootstrap, monitoring, memory system scripts
├── cli-scripts/            # Additional CLI utilities
├── templates/              # Project & integration templates
├── orgs/                   # Organization monorepos (core/, ai/, enterprise/, personal/)
├── shared/                 # Inter-agent messaging (inbox, outbox, signals, mesh)
├── .github/workflows/      # CI/CD (ci.yml, release.yml, autonomous-*.yml)
├── package.json            # Node.js package config
├── tsconfig.json           # TypeScript compiler config
├── vitest.config.ts        # Test runner config
└── .prettierrc             # Code formatter config
```

---

## TypeScript Source (`src/`)

### Architecture

```
src/bin/br.ts  →  src/cli/commands/index.ts  →  individual command files
                                                    ↓
                                              src/core/client.ts (HTTP → gateway)
                                              src/core/config.ts (conf-based settings)
                                              src/core/logger.ts (colored console output)
                                              src/formatters/*   (table, json, brand)
```

### CLI Commands

| Command | File | Status | Description |
|---------|------|--------|-------------|
| `br status` | `cli/commands/status.ts` | Working | Query gateway health + list agents |
| `br agents` | `cli/commands/agents.ts` | Working | List agents (table or `--json`) |
| `br invoke` | `cli/commands/invoke.ts` | Working | Invoke agent with a task |
| `br gateway health` | `cli/commands/gateway.ts` | Working | Check gateway status |
| `br gateway url` | `cli/commands/gateway.ts` | Working | Show gateway URL |
| `br config` | `cli/commands/config.ts` | Working | View/set configuration |
| `br deploy` | `cli/commands/deploy.ts` | Stub | Deployment (not yet implemented) |
| `br init` | `cli/commands/init.ts` | Stub | Project scaffolding (not yet implemented) |
| `br logs` | `cli/commands/logs.ts` | Stub | Log tailing (not yet implemented) |

### Core Modules

- **`core/client.ts`** — `GatewayClient` class. Makes HTTP `GET`/`POST` requests to the BlackRoad gateway (default `http://127.0.0.1:8787`). Reads `BLACKROAD_GATEWAY_URL` env var.
- **`core/config.ts`** — Uses `conf` library. Stores `gatewayUrl`, `defaultAgent` (`octavia`), and `logLevel` in `~/.config/blackroad/`.
- **`core/logger.ts`** — Colored console output: `info` (cyan), `success` (green), `warn` (yellow), `error` (red), `debug` (gray, only if `DEBUG` env set).
- **`core/spinner.ts`** — Wraps `ora` for loading indicators (magenta color).

### Formatters

- **`formatters/brand.ts`** — Brand colors: hot pink `#FF1D6C`, amber `#F5A623`, violet `#9C27B0`, electric blue `#2979FF`. Provides `logo()` and `header()` methods.
- **`formatters/json.ts`** — Syntax-highlighted JSON (keys cyan, strings green, numbers yellow, booleans magenta, null gray).
- **`formatters/table.ts`** — ASCII table with auto-width columns and `─`/`│`/`┼` borders.

### Bootstrap

- **`bootstrap/preflight.ts`** — Checks Node.js >= 22 and gateway reachability.
- **`bootstrap/setup.ts`** — Saves gateway URL and default agent to config.
- **`bootstrap/templates.ts`** — Two project templates: `worker` (Cloudflare Worker) and `api` (Hono API service).

### Public API (`index.ts`)

Exports: `GatewayClient`, `loadConfig`, `logger`, `createSpinner`, `formatTable`, `formatJson`, `brand`.

---

## Build & Development

### Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | 5.7+ | Source language |
| Node.js | 22+ | Runtime (required) |
| Commander | 13.x | CLI framework |
| Chalk | 5.x | Terminal colors |
| Conf | 13.x | Config persistence |
| Ora | 8.x | Spinners |
| Vitest | 3.x | Test runner |
| Prettier | 3.x | Code formatting |
| tsx | 4.x | Dev-time TypeScript execution |
| Wrangler | 4.x | Cloudflare Workers (dev dep) |

### Commands

```bash
npm run build        # tsc — compile src/ to dist/
npm run dev          # tsx watch src/bin/br.ts — live reload
npm run typecheck    # tsc --noEmit — type check only
npm test             # vitest run — run all tests
npm run test:watch   # vitest — watch mode
npm run lint         # prettier --check .
npm run format       # prettier --write .
```

### TypeScript Configuration

- **Target:** ES2024
- **Module:** NodeNext (ESM)
- **Strict mode:** enabled
- **Output:** `dist/` directory
- **Source maps & declarations:** enabled

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": false
}
```

---

## Testing

### Vitest (TypeScript)

Test files live in `test/` mirroring the `src/` structure:

```
test/
├── core/
│   ├── client.test.ts     # GatewayClient unit tests
│   └── config.test.ts     # Config defaults test
└── formatters/
    ├── brand.test.ts      # Brand color/logo tests
    └── table.test.ts      # Table formatting tests
```

Run with: `npm test` or `npx vitest run`

Tests use `vi.stubGlobal('fetch', ...)` for mocking HTTP requests.

### Golden Tests (Shell)

`tests/run.sh` runs golden-file comparison tests against the `br` shell script. Compares actual output to expected output in `tests/operator.golden`.

---

## CI/CD

### CI Workflow (`.github/workflows/ci.yml`)

Triggers on push/PR to `main`. Runs on **self-hosted ARM64 runners** (Raspberry Pi fleet — $0 billable minutes).

**Jobs:**
1. **ShellCheck** — Lints all `.sh` files with `--severity=warning` (continue-on-error)
2. **CLI Tests** — `npm install` + `npm test` + `br` syntax validation (continue-on-error)

### Release Workflow (`.github/workflows/release.yml`)

Triggers on version tags (`v*`). Builds, packs (`npm pack`), and publishes `.tgz` to GitHub Releases.

### Autonomous Workflows

| Workflow | Purpose |
|----------|---------|
| `autonomous-orchestrator.yml` | Multi-service orchestration |
| `autonomous-self-healer.yml` | Auto-remediation |
| `autonomous-issue-manager.yml` | Issue automation |
| `autonomous-dependency-manager.yml` | Dependency updates |
| `autonomous-cross-repo.yml` | Cross-repo automation |
| `check-dependencies.yml` | Dependency validation |
| `workflow-index-sync.yml` | Cross-repo workflow indexing |

---

## Shell CLI (`br` dispatcher)

The root `br` script is a 91 KB zsh dispatcher that routes to 90 tool scripts in `tools/`.

### Tool Script Pattern

Each tool lives at `tools/<name>/br-<name>.sh`:

```bash
#!/bin/zsh
# Colors
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

# SQLite database
DB_FILE="$HOME/.blackroad/<tool>.db"
init_db() { sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS ..."; }

# Command routing
case "$1" in
    cmd1) ... ;;
    *) show_help ;;
esac
```

### Shell Libraries (`lib/`)

| Library | Purpose |
|---------|---------|
| `colors.sh` | Terminal color definitions |
| `config.sh` | Configuration helpers |
| `db.sh` | SQLite database helpers |
| `errors.sh` | Error handling |
| `system.sh` | System utilities |
| `ollama.sh` | Ollama API integration |
| `services.sh` | Service management |

### Key Tool Categories (90 tools)

| Category | Tools |
|----------|-------|
| **Agents** | agent-gateway, agent-router, agent-runtime, agent-tasks, agents-live |
| **AI** | ai, coding-assistant, context-radar, pair-programming, talk |
| **Git** | git-ai, git-integration |
| **DevOps** | deploy-cmd, deploy-manager, docker-manager, ci-pipeline |
| **Cloud** | cloudflare, vercel-pro, ocean-droplets, worker-bridge |
| **Database** | db-client |
| **Monitoring** | health-check, metrics-dashboard, perf-monitor, web-monitor, status-all |
| **Security** | security-scanner, security-hardening, secrets-vault, compliance-scanner, ssl-manager |
| **Pi** | pi, pi-manager, fleet |
| **Identity** | cece-identity, whoami |
| **Comms** | email, mail, notifications, notify, broadcast |
| **Utils** | search, smart-search, file-finder, snippet-manager, quick-notes, task-manager |

---

## Gateway Architecture

### Tokenless Gateway (`blackroad-core/`)

Agents never embed API keys. All LLM provider communication flows through the gateway:

```
[Agent CLIs] → [Gateway :8787] → [Ollama / Claude / OpenAI / Gemini]
```

**Gateway Providers:** `blackroad-core/gateway/providers/`
- `ollama.js` — Local Ollama models
- `anthropic.js` — Claude
- `openai.js` — OpenAI
- `gemini.js` — Google Gemini

**Agent Permissions:** `blackroad-core/policies/agent-permissions.json`

**Verify no leaked tokens:** `blackroad-core/scripts/verify-tokenless-agents.sh`

### Gateway API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/health` | GET | Health check (status, version, uptime) |
| `/v1/agents` | GET | List registered agents |
| `/v1/invoke` | POST | Invoke agent with task (`{agent, task}`) |

---

## MCP Bridge (`mcp-bridge/`)

FastAPI server for remote AI agent access. Runs on `127.0.0.1:8420`.

```bash
cd mcp-bridge && ./start.sh
```

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Service info |
| `/system` | GET | System status |
| `/exec` | POST | Execute shell command |
| `/file/read` | POST | Read a file |
| `/file/write` | POST | Write a file |
| `/memory/write` | POST | Store key-value |
| `/memory/read` | POST | Retrieve key-value |
| `/memory/list` | GET | List all memory keys |

Requires Bearer token auth (`MCP_BRIDGE_TOKEN` env var).

---

## Agent System

### Core Agents

| Agent | Color | Role |
|-------|-------|------|
| **Octavia** | Purple | The Architect — systems design, strategy |
| **Lucidia** | Cyan | The Dreamer — creative, vision |
| **Alice** | Green | The Operator — DevOps, automation |
| **Aria** | Blue | The Interface — frontend, UX |
| **Shellfish** | Red | The Hacker — security, exploits |

### Agent Infrastructure (`agents/`)

```
agents/
├── manifest.json     # Infrastructure config
├── registry.json     # Active agent registry
├── active/           # Currently running agents
├── idle/             # Available agents
├── processing/       # Agents working on tasks
└── archive/          # Completed runs
```

### Coordination (`coordination/`)

- `send-dm-to-agents.sh` — Broadcast messages to agents
- `collaboration-update.sh` — Update collaboration state
- `blackroad-directory-waterfall.sh` — Hierarchical agent routing

---

## Root-Level Shell Scripts (63 scripts)

| Category | Scripts |
|----------|---------|
| **Launchers** | `hub.sh`, `intro.sh`, `boot.sh`, `menu.sh`, `demo.sh` |
| **Monitoring** | `god.sh`, `mission.sh`, `dash.sh`, `monitor.sh`, `status.sh`, `health.sh`, `spark.sh`, `logs.sh`, `events.sh`, `timeline.sh`, `report.sh` |
| **Network** | `net.sh`, `wire.sh`, `traffic.sh`, `blackroad-mesh.sh` |
| **Agents** | `agent.sh`, `roster.sh`, `inspect.sh`, `soul.sh`, `office.sh`, `bonds.sh`, `skills.sh`, `wake.sh` |
| **Chat (Ollama)** | `chat.sh`, `focus.sh`, `convo.sh`, `broadcast.sh`, `think.sh`, `debate.sh`, `story.sh`, `whisper.sh`, `council.sh`, `thoughts.sh` |
| **System** | `mem.sh`, `tasks.sh`, `queue.sh`, `config.sh`, `alert.sh` |
| **Visual** | `clock.sh`, `pulse.sh`, `matrix.sh`, `saver.sh`, `mood.sh` |

---

## Conventions

### Code Style

- **TypeScript:** ESM (`"type": "module"`), strict mode, single quotes, no semicolons, trailing commas
- **Shell:** zsh scripts, consistent color scheme (`GREEN`/`RED`/`CYAN`/`YELLOW`/`NC`)
- **Copyright header:** Every source file starts with `// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.`
- **Database:** SQLite for all persistent storage, path `~/.blackroad/<feature>.db`

### Brand Colors (mandatory for UI work)

```
Hot Pink:       #FF1D6C  (primary)
Amber:          #F5A623
Violet:         #9C27B0
Electric Blue:  #2979FF
Black:          #000000
White:          #FFFFFF
```

**Forbidden colors (old system):** `#FF9D00`, `#FF6B00`, `#FF0066`, `#FF006B`, `#D600AA`, `#7700FF`, `#0066FF`

### Adding a New CLI Command (TypeScript)

1. Create `src/cli/commands/<name>.ts` exporting a `Command`
2. Import and register in `src/cli/commands/index.ts` via `program.addCommand()`
3. Add tests in `test/<module>/<name>.test.ts`

### Adding a New Tool (Shell)

1. Create `tools/<name>/br-<name>.sh`
2. Add route to the `br` dispatcher (case statement)
3. `chmod +x tools/<name>/br-<name>.sh`

---

## Environment Variables

### Gateway

```bash
BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787   # Gateway endpoint
BLACKROAD_GATEWAY_BIND=127.0.0.1               # Bind address
BLACKROAD_GATEWAY_PORT=8787                     # Port
```

### MCP Bridge

```bash
MCP_BRIDGE_TOKEN=<bearer-token>                # Auth token for bridge API
```

### Debug

```bash
DEBUG=1                                         # Enable debug logging
```

### Configuration (via `br config`)

```bash
gatewayUrl    # Gateway URL (default: http://127.0.0.1:8787)
defaultAgent  # Default agent name (default: octavia)
logLevel      # Log level (default: info)
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "chalk": "^5.4.1",        // Terminal colors
    "commander": "^13.1.0",   // CLI framework
    "conf": "^13.0.1",        // Config persistence
    "ora": "^8.2.0"           // Spinners
  },
  "devDependencies": {
    "typescript": "^5.7.3",   // Compiler
    "vitest": "^3.0.5",       // Test runner
    "tsx": "^4.19.0",         // Dev-time TS execution
    "prettier": "^3.4.2",    // Formatter
    "wrangler": "^4.67.0"    // Cloudflare Workers
  }
}
```

Node.js 22+ is required (`"engines": { "node": ">=22" }`).

---

## Security

- Never commit `.env` files, API keys, or secrets (enforced by `.gitignore`)
- No API tokens in agent code — all provider calls go through the tokenless gateway
- Gateway binds to localhost by default
- MCP bridge requires Bearer token authentication
- All code is proprietary to BlackRoad OS, Inc.
- CODEOWNERS requires review from `@blackboxprogramming` for all changes

---

## Subprojects in This Repo

| Directory | Description |
|-----------|-------------|
| `blackroad-core/` | Tokenless gateway + agent scripts |
| `blackroad-web/` | Next.js web application |
| `blackroad-os/` | Main OS codebase |
| `blackroad-sdk/` | SDK package |
| `blackroad-sf/` | Salesforce LWC project |
| `blackroad-api/` | REST API service |
| `blackroad-docs/` | Documentation site |
| `blackroad-gateway/` | Gateway infrastructure |
| `blackroad-infra/` | IaC & deployment configs |
| `blackroad-hardware/` | Hardware integration |
| `blackroad-math/` | Mathematical utilities |
| `dashboard/` | Next.js dashboard app |
| `workers/` | Cloudflare Workers (auth, email, copilot) |
| `websites/` | Static site deployments |
| `orgs/` | Organization monorepos (core, ai, enterprise, personal) |

---

*All content in this repository is proprietary to BlackRoad OS, Inc. (c) 2024-2026. All rights reserved.*
