# BlackRoad OS, Inc. - Third-Party Integrations & Services

## AI Provider Partnerships

### Active Providers

| # | Provider | Product | Internal Agent | Protocol ID | Use Case |
|---|----------|---------|----------------|-------------|----------|
| 1 | **Anthropic** | Claude | Cecilia / CeCe / Alice | `CECE-{session}` | Primary AI, code generation, agent orchestration |
| 2 | **xAI** | Grok | Silas | `SILAS-{thread}` | Research, analysis, reasoning |
| 3 | **Google** | Gemini | Gemmy / Aria | `GEMMY-{conv}` | Multi-modal, search, vision |
| 4 | **OpenAI** | ChatGPT | Caddy / Lucidia | `CADDY-{chat}` | General purpose, reasoning |
| 5 | **Hugging Face** | Hub | — | `HF-{model}` | Model hosting, datasets, spaces |
| 6 | **Ollama** | Local LLMs | — | `LUCIDIA-{node}` | Local inference, privacy |

### Agent Identity Mapping

| Agent Name | Provider | Model | Personality | Color |
|------------|----------|-------|-------------|-------|
| Cecilia (CeCe) | Anthropic Claude | Claude Opus/Sonnet | Warm, collaborative | Purple |
| Alice | Anthropic Claude | Claude | Operator, DevOps | Green |
| Silas | xAI Grok | Grok | Analytical, direct | — |
| Gemmy | Google Gemini | Gemini Pro | Multi-modal, creative | — |
| Aria | Google Gemini | Gemini | Interface, UX | Blue |
| Caddy | OpenAI | GPT-4 | General purpose | — |
| Lucidia | OpenAI / Ollama | Various | Dreamer, creative | Cyan |
| Octavia | Local | Ollama | Architect, systems | Purple |

### Local Model Library (Ollama)

| Model | Size | Use Case | Endpoint |
|-------|------|----------|----------|
| `qwen2.5:7b` | 7B | General purpose, fast | `localhost:11434` |
| `deepseek-r1:7b` | 7B | Reasoning, code | `localhost:11434` |
| `llama3.2:3b` | 3B | Lightweight | `localhost:11434` |
| `mistral:7b` | 7B | Balanced | `localhost:11434` |

### LLM Forkies Library

Major open-source models forked into BlackRoad-AI:

| Model | Fork Repo | Parameters | Purpose |
|-------|-----------|------------|---------|
| Qwen | `blackroad-ai-qwen` | 7B-72B | General purpose |
| Qwen3 | Fork in BlackRoad-AI | Various | Next-gen |
| DeepSeek-V2 | Fork in BlackRoad-AI | Various | Reasoning |
| DeepSeek-VL | Fork in BlackRoad-AI | Various | Vision-language |
| DeepSeek-Coder | `blackroad-ai-deepseek` | Various | Code generation |
| DeepSeek-Math | Fork in BlackRoad-AI | Various | Mathematics |
| Llama | Fork in BlackRoad-AI | 3B-70B | Meta's LLM |
| Pythia | Fork in BlackRoad-AI | Various | Research |
| RWKV-LM | Fork in BlackRoad-AI | Various | Linear attention |
| GPT-Neo | Fork in BlackRoad-AI | Various | Open GPT |
| Whisper | `blackroad-whisper` | Various | Speech-to-text |
| Stable Diffusion | `blackroad-stable-diffusion` | Various | Image generation |
| vLLM | `blackroad-vllm` | — | High-throughput inference |

---

## Platform Integrations

### GitHub

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| GitHub Enterprise | Enterprise account | Active | [blackroad-os](https://github.com/enterprises/blackroad-os) |
| GitHub Organizations | 17 orgs | Active | 1,825+ total repos |
| GitHub Actions | CI/CD | Active | 50+ workflows |
| GitHub Pages | Static hosting | Active | 16+ sites |
| GitHub Packages | Registry | Active | Container images |
| GitHub Dependabot | Security | Active | Automated dependency updates |
| GitHub CodeQL | Code scanning | Active | Security analysis |
| GitHub Secret Scanning | Secrets | Active | Credential detection |

### Google

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| Google Drive | Document storage | Active | Corporate document storage |
| Google Workspace | Productivity | Active | Email, calendar, docs |
| Google Cloud | Cloud services | Available | Backup compute |
| Google Gemini API | AI | Active | Multi-modal AI |

### Cloudflare

| Integration | Type | Status | Count |
|-------------|------|--------|-------|
| Cloudflare Workers | Serverless compute | Active | 75+ workers |
| Cloudflare Pages | Static hosting | Active | 10+ projects |
| Cloudflare R2 | Object storage | Active | 135GB LLMs |
| Cloudflare D1 | SQLite database | Active | Multiple DBs |
| Cloudflare KV | Key-value store | Active | Caching |
| Cloudflare Tunnel | Secure tunnel | Active | 1 tunnel (QUIC) |
| Cloudflare DNS | DNS management | Active | 19 domains |

### Stripe

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| Stripe Atlas | C Corp formation | Active | Delaware incorporation |
| Stripe Payments | Payment processing | Active | Revenue collection |
| Stripe Billing | Subscriptions | Planned | SaaS recurring revenue |
| Stripe Connect | Marketplace | Planned | Multi-party payments |
| Stripe Identity | KYC | Planned | Identity verification |

### Railway

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| Railway Apps | App hosting | Active | 14 projects |
| Railway GPU | GPU inference | Active | A100/H100 |
| Railway PostgreSQL | Managed DB | Active | Production databases |
| Railway Redis | Managed cache | Active | Session store |

### Vercel

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| Vercel Hosting | Next.js hosting | Active | 15+ projects |
| Vercel Analytics | Web analytics | Active | Performance metrics |
| Vercel Edge | Edge functions | Active | Edge compute |

### DigitalOcean

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| Droplets | VPS | Active | 1 droplet (codex-infinity) |
| Spaces | Object storage | Available | S3-compatible |

### GoDaddy

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| Domain Registration | Domains | Active | 19 domains |
| DNS (delegated) | — | — | Delegated to Cloudflare |

### Hugging Face

| Integration | Type | Status | Details |
|-------------|------|--------|---------|
| Model Hub | Model hosting | Active | User: `blackroadio` |
| Datasets | Data hosting | Active | Training data |
| Spaces | App hosting | Active | Demo apps |

---

## Secrets Management

### Secret Storage Locations

| Location | Scope | Encryption | Purpose |
|----------|-------|------------|---------|
| `~/.blackroad/vault/.master.key` | Local | AES-256-CBC | Master encryption key |
| GitHub Actions Secrets | Per-repo/org | GitHub encryption | CI/CD secrets |
| Cloudflare Worker Secrets | Per-worker | Cloudflare encryption | Worker env vars |
| Railway Environment Variables | Per-project | Railway encryption | App configuration |
| Vercel Environment Variables | Per-project | Vercel encryption | App configuration |

### Required Secrets Inventory

| Secret | Platform | Used By |
|--------|----------|---------|
| `GITHUB_TOKEN` | GitHub | Actions, API access |
| `RAILWAY_TOKEN` | Railway | Deployment |
| `RAILWAY_PROJECT_ID` | Railway | Project targeting |
| `CLOUDFLARE_API_TOKEN` | Cloudflare | Workers, DNS |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare | Account access |
| `CLOUDFLARE_TUNNEL_TOKEN` | Cloudflare | Tunnel auth |
| `VERCEL_TOKEN` | Vercel | Deployment |
| `VERCEL_ORG_ID` | Vercel | Organization |
| `VERCEL_PROJECT_ID` | Vercel | Project targeting |
| `DIGITALOCEAN_ACCESS_TOKEN` | DigitalOcean | Droplet management |
| `HUGGINGFACE_TOKEN` | Hugging Face | Model access |
| `STRIPE_API_KEY` | Stripe | Payment processing |
| `NGROK_AUTHTOKEN` | ngrok | Tunnel auth |
| `TAILSCALE_AUTH_KEY` | Tailscale | Mesh network |

---

## Emoji Dictionary

Standard emojis used across BlackRoad documentation and systems:

### Status Emojis

| Emoji | Meaning | Usage |
|-------|---------|-------|
| `[ ]` | Unchecked | Task pending |
| `[x]` | Checked | Task complete |

### Organization Emojis

| Emoji | Meaning | Usage |
|-------|---------|-------|
| `[ ]` | Locked/Private | Private org/repo |
| `[ ]` | Public | Public visibility |

### System Emojis

| Emoji | Meaning | Usage |
|-------|---------|-------|
| `[ ]` | Globe/Domain | Domain reference |
| `[ ]` | Pointing | Item in list |
| `[ ]` | Down arrow | Section header |
| `[ ]` | Roller coaster | Organization section |

### Agent Color Codes

| Agent | Color | Hex |
|-------|-------|-----|
| LUCIDIA | Cyan | `#00BCD4` |
| ALICE | Green | `#4CAF50` |
| OCTAVIA | Purple | `#9C27B0` |
| PRISM | Yellow | `#FFC107` |
| ECHO | Purple | `#7B1FA2` |
| CIPHER | Blue | `#2196F3` |

### Trinity Status

| Status | Color | Meaning |
|--------|-------|---------|
| GREENLIGHT | Green | All systems go |
| YELLOWLIGHT | Yellow | Needs attention |
| REDLIGHT | Red | Blocked/critical |

---

**Property of BlackRoad OS, Inc. All rights reserved.**
**Document Version:** 1.0
**Last Updated:** 2026-02-28
