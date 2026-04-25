# @BlackRoadBot Product Planning Document

> Autonomous GitHub Routing Matrix | v1.0 | Q1 2026
>
> BlackRoad OS, Inc. | Confidential

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Problem Statement](#problem-statement)
- [Product Vision](#product-vision)
- [Target Users](#target-users)
- [Core Feature: The 10-Layer Scaffold](#core-feature-the-10-layer-scaffold)
- [Routing Matrix](#routing-matrix)
- [Rate Limit Mitigation Strategy](#rate-limit-mitigation-strategy)
- [roadchain: Witnessing Every Action](#roadchain-witnessing-every-action)
- [Technical Architecture](#technical-architecture)
- [Implementation Phases](#implementation-phases)
- [Security Model](#security-model)
- [Related Documents](#related-documents)
- [Milestones & Timeline](#milestones--timeline)
- [Success Metrics](#success-metrics)
- [Risks & Mitigations](#risks--mitigations)
- [Open Questions](#open-questions)
- [Appendix: Organization Quick Reference](#appendix-organization-quick-reference)
- [Appendix: Command Examples](#appendix-command-examples)
- [Change Log](#change-log)

---

## Executive Summary

@BlackRoadBot is the intelligent routing matrix at the center of BlackRoad OS -- a GitHub-native bot that accepts natural language commands in issues and pull requests, then autonomously dispatches work across BlackRoad's 15 GitHub organizations, hardware clusters, cloud providers, and external platforms.

Today this capability exists in documentation and architectural intent. This planning document defines the path to a shipped, production-grade v1.0 -- one that developers, agents, and operators can depend on.

**Product owner:** Alexa Amundson, BlackRoad OS, Inc.
**Target ship:** Q2 2026 (v1.0 GA)
**Classification:** Internal -- Confidential

---

## Problem Statement

### The Core Friction

BlackRoad's infrastructure spans 15 GitHub organizations, 19 domains, 75 Cloudflare Workers, a Pi cluster, two DigitalOcean droplets, and integrations with Salesforce, Hugging Face, Railway, and Google Drive. Coordinating work across this surface today requires manually context-switching between platforms, writing custom scripts per task, and holding routing logic in the architect's head.

This does not scale to 1,000 agents -- let alone 30,000.

### Secondary Frictions

- No single entry point for triggering cross-platform automation from GitHub
- Rate limits on centralized LLM providers (GitHub Copilot, HF Inference) block agentic workflows
- Artifact routing to Drive, Cloudflare DNS, and the website layer requires manual intervention
- No audit trail connecting a GitHub comment to its downstream effect in Salesforce, Cloudflare, or deployed code

---

## Product Vision

A developer or an agent types `@BlackRoadBot [natural language intent]` into any GitHub issue or PR. Within seconds, the intent is parsed, classified, routed to the right organization and platform, executed, and confirmed -- with every state transition witnessed by roadchain and surfaced back in the original thread.

**@BlackRoadBot is the single control plane for the BlackRoad ecosystem.**

---

## Target Users

| User | Context | Primary Use Case |
|------|---------|------------------|
| **Alexa (Founder/Architect)** | Has full mental model of the system | Trigger cross-platform work via single comment; reduce context-switching |
| **BlackRoad Agents (Lucidia, Cecilia, etc.)** | Autonomous agents with GitHub write access | Self-dispatch tasks without human intermediary |
| **Future BlackRoad Contributors** | Developers joining the ecosystem | Onboard to infrastructure without learning every platform |
| **Enterprise Partners** | External integrators via Blackbox-Enterprises | Trigger scoped workflows without credentials to internal systems |

---

## Core Feature: The 10-Layer Scaffold

Every `@BlackRoadBot` invocation passes through a deterministic 10-layer execution scaffold. Each layer is independently testable and observable.

```
@BlackRoadBot "Deploy latest agent-os to octavia"

  Layer 1: Intent Reviewer      --> Parse NL, validate, produce execution plan
  Layer 2: Org Distributor      --> Route to BlackRoad-Hardware
  Layer 3: Team Distributor     --> Route to firmware team; HITL check
  Layer 4: Project Recorder     --> Log to GitHub Projects + Salesforce
  Layer 5: Agent Instantiator   --> Spin up Planner-Executor-Reflector agent
  Layer 6: Repo Distributor     --> Create branch in target repo
  Layer 7: Device Router        --> SSH deploy to octavia (192.168.4.38)
  Layer 8: Drive Distributor    --> Write deployment log to Google Drive
  Layer 9: Cloudflare Executor  --> Update DNS/tunnel if needed
  Layer 10: Website Editor      --> Trigger rebuild if presentation changed
```

### Layer Specification

| Layer | Name | Responsibility | Target System | v1.0? |
|-------|------|----------------|---------------|-------|
| 1 | **Intent Reviewer** | Parse NL intent, validate security + resource constraints, produce execution plan | Lucidia Core (Layer 6) | Yes |
| 2 | **Org Distributor** | Route task to correct BlackRoad organization based on domain classification | GitHub Apps API | Yes |
| 3 | **Team Distributor** | Route to specific team; pause for HITL approval on high-risk ops | GitHub Teams + HITL webhook | Yes |
| 4 | **Project Recorder** | Log task to GitHub Project board; sync metadata to Salesforce | GitHub Projects + Salesforce Data Cloud | v1.1 |
| 5 | **Agent Instantiator** | Spin up or assign specialized agent (Planner-Executor-Reflector pattern) | Local Ollama / HF Inference | Yes |
| 6 | **Repo Distributor** | Create branch in target repo; isolate changes via GitHub Flow | GitHub Contents API | Yes |
| 7 | **Device Router** | Dispatch firmware/infra tasks to Pi cluster, Droplets, or Jetson | Tailscale + doctl + SSH | Yes |
| 8 | **Drive Distributor** | Write artifacts (logs, docs, reports) to Google Drive via GSA | Google Drive API (Service Account) | v1.1 |
| 9 | **Cloudflare Executor** | Apply DNS changes, create/update Tunnels, modify Workers | Cloudflare API | Yes |
| 10 | **Website Editor** | Update headless CMS or trigger Vercel rebuild for presentation changes | Strapi / Vercel / Wix Harmony | v1.2 |

### Layer Dependency Graph

```
              [1 Intent Reviewer]
                     |
            +--------+--------+
            |                 |
    [2 Org Distributor]  [4 Project Recorder]
            |                 |
    [3 Team Distributor]      |
            |                 |
    [5 Agent Instantiator]----+
            |
    +-------+-------+-------+-------+
    |       |       |       |       |
   [6]     [7]     [8]     [9]    [10]
   Repo   Device  Drive    CF    Website
```

---

## Routing Matrix

### Organization Mapping

The bot uses intent classification to determine the target organization. Classification runs locally via the Ollama proxy before any external API calls are made.

| Detected Intent Category | Target Organization | Example Command |
|--------------------------|---------------------|-----------------|
| LLM / Reasoning / Agent dev | BlackRoad-AI | `@BlackRoadBot add memory context for Cecilia re: sprint goals` |
| Infrastructure / IaC | BlackRoad-Cloud | `@BlackRoadBot rebuild the staging droplet` |
| Firmware / Pi / IoT | BlackRoad-Hardware | `@BlackRoadBot deploy latest agent-os to octavia` |
| Security / Crypto / Audit | BlackRoad-Security | `@BlackRoadBot witness this commit hash to roadchain` |
| Frontend / UI | BlackRoad-Interactive | `@BlackRoadBot regenerate the blackroad.io hero section` |
| Tokenomics / Funding | BlackRoad-Ventures | `@BlackRoadBot update roadcoin.io pricing page` |
| R&D / Experimental | BlackRoad-Labs | `@BlackRoadBot run quantum lab sim on pi cluster` |
| Compliance / Policy | BlackRoad-Gov | `@BlackRoadBot log compliance check for Q1 audit` |

### Platform Integration Map

| Platform | Auth Method | Trigger Condition | v1.0 |
|----------|-------------|-------------------|------|
| GitHub (all 15 orgs) | GitHub App (OAuth) | Every invocation -- base routing layer | Yes |
| Raspberry Pi Cluster | Tailscale + SSH key | Any firmware, inference offload, or device task | Yes |
| DigitalOcean | doctl + API token | Droplet create/rebuild/scale commands | Yes |
| Cloudflare | API token (scoped) | DNS, Tunnel, Worker, Pages commands | Yes |
| Ollama (local) | HTTP via Cloudflare Tunnel | Intent classification + inference fallback | Yes |
| Hugging Face | HF_TOKEN rotation | High-compute tasks exceeding Pi capacity | Yes |
| Google Drive | Service Account (GSA) | Log/artifact storage after task completion | v1.1 |
| Salesforce | Apex webhook + OAuth2 | Enterprise task tracking, CRM sync | v1.1 |
| Railway | Railway CLI + token | Ephemeral test environment deploys | v1.1 |
| Vercel | Vercel API token | Frontend rebuild / headless CMS trigger | v1.2 |
| roadchain (internal) | PS-SHA-infinity ledger | Every state transition auto-witnessed | Yes |

### @BLACKROAD Directory Waterfall Integration

@BlackRoadBot leverages the existing directory waterfall for agent dispatch:

```
@BlackRoadBot "deploy vllm model"
  --> Layer 2 classifies: AI/ML
  --> Routes to: @BLACKROAD/BlackRoad-AI/models/vllm
  --> Agent instantiated from /models/vllm pool
```

---

## Rate Limit Mitigation Strategy

Centralized LLM providers impose rate limits that are incompatible with autonomous agent workflows. @BlackRoadBot mitigates this through a tiered local-first inference architecture.

### Local Inference Stack

| Node | Hardware | Role | Models Served |
|------|----------|------|---------------|
| octavia | Pi 5 + Hailo-8 NPU + NVMe | Primary inference node | Llama 3.2 3B, Gemma 2B (INT8 via Hailo) |
| cecilia | Pi 5 + Hailo-8 NPU + NVMe | Secondary inference / failover | TinyLlama, code-focused GGUF models |
| lucidia | Pi 5 (ElectroCookie) | Memory core + orchestration | Lightweight embedding models |
| olympia | Pi 4B | LiteLLM proxy + load balancer | Routing only -- no inference |

### Fallback Chain

| Priority | Provider | Condition for Use |
|----------|----------|-------------------|
| 1 | Local Ollama (Pi cluster via LiteLLM) | All routine classification and code generation tasks |
| 2 | Hugging Face Inference Endpoint | High-compute tasks (>7B param models) or Pi unavailability |
| 3 | Claude API (claude-sonnet-4-6) | Complex reasoning, cross-domain synthesis, HITL escalation |
| 4 | GitHub Copilot (override proxy) | Legacy compatibility; routed to LiteLLM proxy by default |

### Inference Flow

```
                    [Incoming Intent]
                          |
                    [LiteLLM Proxy]
                    (olympia Pi 4B)
                          |
              +-----------+-----------+
              |                       |
        [octavia Pi 5]          [cecilia Pi 5]
        (Primary NPU)          (Secondary NPU)
              |                       |
              +------- FAIL? ---------+
                          |
                  [HF Inference API]
                          |
                     FAIL?
                          |
                  [Claude API]
```

---

## roadchain: Witnessing Every Action

Every state transition triggered by @BlackRoadBot is hashed and appended to the roadchain non-terminating ledger. This creates an immutable, auditable record of cause and effect across the entire ecosystem -- not just code commits, but DNS changes, agent instantiations, Salesforce syncs, and device deployments.

### What Gets Witnessed

- GitHub comment that triggered the invocation (hash of `comment_id + body + actor`)
- Intent classification result and confidence score
- Organization and team routing decision with rationale
- Agent ID assigned to the task, model used, and inference node
- Branch created, files changed, PR opened
- External platform API calls (Cloudflare, DigitalOcean, HF) with response codes
- Final task status: `success`, `partial`, `failed`, `escalated_to_hitl`

### Witnessing Format

Each entry is stored as:

```
SHA-256(previous_hash || timestamp || event_type || payload_json)
```

The genesis block is 64 zeros -- the Trivial Zero from which all BlackRoad system state diverges and ultimately resolves.

### Example roadchain Entry

```json
{
  "block_index": 42,
  "timestamp": "2026-04-15T14:32:07Z",
  "previous_hash": "a3f1...e7b2",
  "event_type": "task_completed",
  "payload": {
    "trigger": "github:issue_comment:BlackRoad-OS/blackroad#1234",
    "intent": "deploy latest agent-os to octavia",
    "classification": { "category": "firmware", "confidence": 0.94 },
    "org_routed": "BlackRoad-Hardware",
    "agent_id": "agent-hw-0042",
    "model": "llama3.2:3b",
    "inference_node": "octavia",
    "actions": [
      { "type": "branch_create", "repo": "BlackRoad-Hardware/agent-os", "branch": "deploy/octavia-2026-04-15" },
      { "type": "ssh_deploy", "target": "192.168.4.38", "status": "success" }
    ],
    "status": "success",
    "duration_ms": 4823
  },
  "hash": "b7c2...f4a1"
}
```

---

## Milestones & Timeline

```
Feb 2026          Mar 2026          Apr 2026          May 2026          Jun 2026
   |                 |                 |                 |                 |
   | M0 Foundation   | M1 Layers 1-3   | M2 Layers 5-7   |                 |
   |                 |                 | M3 Layer 9+RC    | v1.0 GA         |
   |                 |                 |                 |                 | v1.1 Drive+SF
```

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| **M0 -- Foundation** | March 2026 | GitHub App installed across all 15 orgs; Ollama proxy live on Pi cluster; roadchain genesis block committed |
| **M1 -- Scaffold Layers 1-3** | March 2026 | Intent parsing via local LLM; org + team routing; HITL pause for high-risk ops |
| **M2 -- Scaffold Layers 5-7** | April 2026 | Agent instantiation (Planner-Executor-Reflector); repo branching; device routing to Pi cluster + DigitalOcean |
| **M3 -- Scaffold Layer 9 + roadchain** | April 2026 | Cloudflare DNS/Tunnel/Worker automation; every action witnessed to roadchain |
| **v1.0 GA** | May 2026 | Stable routing across 8 of 10 scaffold layers; <5s p95 latency for Layers 1-3; roadchain audit log live |
| **v1.1 -- Drive + Salesforce** | June 2026 | Layers 4 + 8: artifact persistence to Drive; enterprise task tracking in Salesforce |
| **v1.2 -- Website Layer** | Q3 2026 | Layer 10: autonomous headless CMS updates; Vercel rebuild triggers; Wix Harmony integration |
| **v2.0 -- 30k Agents** | Q4 2026 | Kubernetes auto-scaling scaffold; 30,000-agent concurrency; ARM datacenter node support |

---

## Success Metrics

| Metric | v1.0 Target | Measurement Method |
|--------|-------------|-------------------|
| Intent classification accuracy | >90% | Human review of 100 sampled commands |
| Org routing accuracy | >95% | Audit of roadchain routing decisions |
| p95 latency (Layers 1-3) | <5 seconds | roadchain timestamps from comment to routing confirmation |
| Local inference hit rate | >80% | LiteLLM proxy logs (local vs. external calls) |
| HITL escalation rate | <10% | roadchain escalation events / total tasks |
| roadchain integrity | 100% | Hash chain validation on every block |
| Platform coverage (v1.0) | 8/10 layers | Feature flag tracking per scaffold layer |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Pi cluster unavailability breaks inference | Medium | High | Multi-node LiteLLM with auto-failover to HF Inference; health checks every 30s |
| GitHub App token expiry breaks cross-org access | High | High | Automated token refresh via GitHub App installation tokens (valid 1hr); monitored via roadchain |
| Ambiguous NL intent causes wrong org routing | Medium | Medium | Confidence threshold gate: route <75% confidence to HITL before execution |
| Rate limits on external platforms during burst | Medium | Medium | Layer 7 Orchestration queue with exponential backoff; roadchain logs all 429 events |
| Malicious @BlackRoadBot invocation by bad actor | Low | High | GitHub App scope limited to specific repos per org; HITL required for prod/security ops |
| roadchain storage growth at 30k agent scale | Medium | Medium | Bloom filter index + IPFS archival for blocks older than 90 days |

---

## Open Questions

1. **Public vs. Internal?** Should @BlackRoadBot be installable by external GitHub users (public-facing product) or remain internal infrastructure?

2. **Salesforce Object Mapping?** Which Salesforce objects best map to BlackRoad tasks -- Cases, Custom Objects, or Data Cloud streams?

3. **Layer 10 Scope?** Does Layer 10 (website editor) belong in @BlackRoadBot v1.x or as a separate product (@BlackRoadSite)?

4. **HITL Governance?** What is the governance model for HITL approvers as the team scales -- single approver (Alexa) vs. org-level approval roles?

5. **roadchain as Product?** Should roadchain be exposed as a public API (roadchain.io) for enterprise audit compliance, or remain internal only?

---

## Technical Architecture

### GitHub App Configuration

```yaml
# @BlackRoadBot GitHub App
name: BlackRoadBot
description: Autonomous GitHub Routing Matrix for BlackRoad OS

permissions:
  issues: write
  pull_requests: write
  contents: write
  projects: admin
  metadata: read
  members: read

events:
  - issue_comment
  - issues
  - pull_request
  - pull_request_review_comment

installations:
  - BlackRoad-OS-Inc
  - BlackRoad-OS
  - blackboxprogramming
  - BlackRoad-AI
  - BlackRoad-Cloud
  - BlackRoad-Security
  - BlackRoad-Hardware
  - BlackRoad-Interactive
  - BlackRoad-Labs
  - BlackRoad-Ventures
  - BlackRoad-Media
  - BlackRoad-Foundation
  - BlackRoad-Education
  - BlackRoad-Gov
  - Blackbox-Enterprises
```

### Webhook Handler (Cloudflare Worker)

```
POST https://blackroadbot.blackroad.workers.dev/webhook/github
  --> Validate webhook signature (HMAC-SHA256)
  --> Extract @BlackRoadBot mention from comment body
  --> Enqueue to processing queue (Cloudflare Queue)
  --> Return 202 Accepted

Worker: blackroadbot-processor
  --> Dequeue event
  --> Layer 1: Classify intent via LiteLLM proxy
  --> Layer 2-3: Route to org/team
  --> Layer 5-9: Execute scaffold
  --> Post result as GitHub comment on original thread
  --> Witness all transitions to roadchain
```

### Intent Classification Schema

```json
{
  "intent": "deploy latest agent-os to octavia",
  "classification": {
    "category": "firmware",
    "subcategory": "device_deploy",
    "target_org": "BlackRoad-Hardware",
    "target_repo": "agent-os",
    "confidence": 0.94,
    "requires_hitl": false,
    "risk_level": "medium",
    "estimated_layers": [1, 2, 3, 5, 6, 7]
  }
}
```

### Agent Instantiation Pattern (Planner-Executor-Reflector)

```
[Planner Agent]
  Input:  Classified intent + context
  Output: Step-by-step execution plan
  Model:  qwen2.5:7b (local)

        |
        v

[Executor Agent]
  Input:  Execution plan
  Output: Completed actions + artifacts
  Model:  deepseek-r1:7b (local) or claude-sonnet-4-6 (fallback)

        |
        v

[Reflector Agent]
  Input:  Plan + execution result
  Output: Success/failure assessment + lessons learned
  Model:  llama3.2:3b (local)
  Action: Write reflection to [MEMORY], witness to roadchain
```

---

## Implementation Phases

### Phase 0: Foundation (March 2026, Week 1-2)

**Goal:** Infrastructure primitives in place.

- [ ] Register @BlackRoadBot as GitHub App
- [ ] Install across all 15 organizations
- [ ] Deploy `blackroadbot-webhook` Cloudflare Worker
- [ ] Deploy `blackroadbot-processor` Cloudflare Worker
- [ ] Configure Cloudflare Queue between webhook and processor
- [ ] Set up LiteLLM proxy on olympia (Pi 4B)
- [ ] Verify Ollama inference on octavia + cecilia
- [ ] Commit roadchain genesis block (64 zeros)
- [ ] Create `blackroadbot` repo in BlackRoad-OS-Inc

### Phase 1: Layers 1-3 (March 2026, Week 2-4)

**Goal:** Bot can parse intents and route to the correct org.

- [ ] Implement Layer 1 (Intent Reviewer)
  - [ ] Prompt template for intent classification
  - [ ] Security validation (block destructive intents without HITL)
  - [ ] Confidence scoring
- [ ] Implement Layer 2 (Org Distributor)
  - [ ] Organization mapping table
  - [ ] GitHub App installation token rotation
  - [ ] Cross-org issue/PR creation
- [ ] Implement Layer 3 (Team Distributor)
  - [ ] Team mapping within orgs
  - [ ] HITL webhook for high-risk operations
  - [ ] Approval/rejection flow via GitHub reactions
- [ ] Integration tests: 50 sample commands across all org categories
- [ ] roadchain witnessing for Layers 1-3

### Phase 2: Layers 5-7 (April 2026, Week 1-3)

**Goal:** Bot can instantiate agents, create branches, and deploy to devices.

- [ ] Implement Layer 5 (Agent Instantiator)
  - [ ] Planner-Executor-Reflector pattern
  - [ ] Model selection based on task complexity
  - [ ] Agent lifecycle management
- [ ] Implement Layer 6 (Repo Distributor)
  - [ ] Branch creation via GitHub Contents API
  - [ ] File modification and commit
  - [ ] PR creation with structured description
- [ ] Implement Layer 7 (Device Router)
  - [ ] Tailscale mesh connectivity check
  - [ ] SSH command execution on Pi cluster
  - [ ] doctl integration for DigitalOcean droplets
  - [ ] Deployment verification and rollback
- [ ] Integration tests: end-to-end from comment to device deploy

### Phase 3: Layer 9 + roadchain (April 2026, Week 3-4)

**Goal:** Bot can manage Cloudflare resources and all actions are auditable.

- [ ] Implement Layer 9 (Cloudflare Executor)
  - [ ] DNS record CRUD (A, CNAME, TXT)
  - [ ] Tunnel management (create, route, delete)
  - [ ] Worker deployment (wrangler API)
  - [ ] Pages deployment trigger
- [ ] roadchain production hardening
  - [ ] Block validation on read
  - [ ] Hash chain integrity verification endpoint
  - [ ] Bloom filter index for fast lookups
  - [ ] Storage rotation (active + IPFS archive)
- [ ] End-to-end audit trail test: comment -> action -> witness -> verify

### Phase 4: v1.0 GA (May 2026)

**Goal:** Production-ready release.

- [ ] Performance optimization (<5s p95 for Layers 1-3)
- [ ] Error handling and graceful degradation for all layers
- [ ] Rate limiting on bot invocations (per-user, per-org)
- [ ] Documentation: user guide, admin guide, API reference
- [ ] Monitoring dashboard (Grafana)
- [ ] Alerting (PagerDuty/Slack) for bot failures
- [ ] Security audit of all webhook handlers and API integrations
- [ ] Load testing: 100 concurrent invocations

---

## Security Model

### Authentication Chain

```
GitHub Webhook --> HMAC-SHA256 signature validation
  --> Cloudflare Worker (webhook secret in Worker env)
    --> LiteLLM Proxy (internal, Tailscale only)
    --> GitHub API (installation token, auto-refreshed)
    --> Cloudflare API (scoped token, Worker binding)
    --> DigitalOcean (doctl token, env var)
    --> Pi Cluster (SSH key, Tailscale ACL)
```

### Authorization Rules

| Operation Category | Required Approval | HITL Gate? |
|--------------------|-------------------|------------|
| Read-only queries (status, list, info) | None | No |
| Branch creation / PR opening | Bot auto-approve | No |
| Device deployment (non-prod) | Bot auto-approve | No |
| DNS changes | Alexa approval + allowlisted actor | Yes |
| Production deployment | Alexa approval | Yes |
| Security-scoped operations | Alexa approval | Yes |
| Destructive operations (delete, rebuild) | Alexa approval | Yes |
| Cross-org data movement | Alexa approval | Yes |

> DNS-modifying intents are always treated as high-risk. Only explicitly allowlisted actors may approve DNS changes, and this rule MUST be enforced consistently across Layers 1–3 and within the Cloudflare executor (no direct or indirect bypass paths).
### HITL Flow

```
1. Bot detects high-risk operation
2. Bot posts comment: "This requires approval. React with :+1: to proceed or :-1: to cancel."
3. Bot creates roadchain entry: { status: "awaiting_hitl" }
4. Authorized approver reacts
5. Bot reads reaction, proceeds or cancels
6. Bot updates roadchain entry with approval decision
```

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [PLANNING.md](./PLANNING.md) | Overall BlackRoad OS strategic planning |
| [ROADMAP.md](./ROADMAP.md) | Feature roadmap and release timeline |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture diagrams |
| [AGENTS.md](./AGENTS.md) | Agent system deep dive |
| [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) | Infrastructure overview |
| [NETWORKING.md](./NETWORKING.md) | Network topology and tunnels |
| [MEMORY.md](./MEMORY.md) | Memory system (PS-SHA-infinity) |
| [CLAUDE.md](./CLAUDE.md) | AI assistant guidance |

---

## Appendix: Organization Quick Reference

| Organization | Domain | Primary Responsibility |
|--------------|--------|----------------------|
| BlackRoad-OS | blackroad.io | Core CLI kernel |
| BlackRoad-AI | blackroadai.com / lucidia.earth | LLM, reasoning, Lucidia memory core |
| BlackRoad-Cloud | blackroad.network / blackroad.systems | IaC, DigitalOcean, Railway |
| BlackRoad-Hardware | (internal) | Pi firmware, SBC management |
| BlackRoad-Security | roadchain.io | Cryptography, witnessing, audit |
| BlackRoad-Interactive | blackroad.io/ui | Frontend, web |
| BlackRoad-Labs | blackroadquantum.com | Experimental R&D |
| BlackRoad-Studio | lucidia.studio | Creative assets |
| BlackRoad-Ventures | roadcoin.io | Tokenomics, funding |
| BlackRoad-Media | (internal) | Content, PR automation |
| BlackRoad-Gov | blackroadinc.us | Compliance, policy |
| BlackRoad-Education | (internal) | Onboarding, docs |
| BlackRoad-Archive | (internal) | Long-term data persistence |
| BlackRoad-Foundation | (internal) | Governance, protocol standards |
| Blackbox-Enterprises | blackboxprogramming.io | Enterprise integrations |

---

## Appendix: Command Examples

### Basic Commands

```
@BlackRoadBot status
--> Returns: system health across all 15 orgs, Pi cluster, cloud providers

@BlackRoadBot list agents
--> Returns: active agent roster with status and current tasks

@BlackRoadBot deploy latest agent-os to octavia
--> Layers 1,2,3,5,6,7: classify, route to Hardware, instantiate agent, branch, deploy via SSH
```

### Cross-Platform Commands

```
@BlackRoadBot add DNS record api.blackroad.ai pointing to 159.65.43.12
--> Layers 1,2,9: classify, route to Cloud/Security, execute Cloudflare API

@BlackRoadBot create staging droplet s-2vcpu-4gb in nyc3
--> Layers 1,2,7: classify, route to Cloud, execute doctl

@BlackRoadBot witness commit abc123 to roadchain
--> Layers 1,2: classify, route to Security, append to roadchain ledger
```

### Agent-Dispatched Commands

```
@BlackRoadBot run quantum lab sim with qwen2.5:7b on pi cluster
--> Layers 1,2,5,7: classify, route to Labs, instantiate agent, dispatch to Pi

@BlackRoadBot add memory context for Cecilia: "Q1 sprint goals include roadchain v1"
--> Layers 1,2,5: classify, route to AI, instantiate memory-bridge agent
```

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-28 | Claude (Opus 4.6) | Initial product planning document from specification |

---

*This document is proprietary to BlackRoad OS, Inc. All rights reserved.*
*All code, architecture, and systems described herein are the exclusive intellectual property of BlackRoad OS, Inc.*
