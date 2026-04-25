# Frequently Asked Questions

> Common questions about BlackRoad OS

---

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [Agents](#agents)
- [Memory System](#memory-system)
- [Infrastructure](#infrastructure)
- [Development](#development)
- [Deployment](#deployment)
- [Security](#security)
- [Pricing & Licensing](#pricing--licensing)

---

## General Questions

### What is BlackRoad OS?

BlackRoad OS is a **30,000 agent orchestration platform** that enables sovereign AI infrastructure. It's designed around the philosophy "Your AI. Your Hardware. Your Rules."

Think of it as an operating system for AI agents - providing scheduling, memory, communication, and coordination across thousands of autonomous AI workers.

### Who is BlackRoad for?

- **Developers** building AI-powered applications
- **Enterprises** needing scalable AI infrastructure
- **Researchers** experimenting with multi-agent systems
- **Individuals** wanting to run AI locally with full control

### What makes BlackRoad different?

1. **Sovereignty** - You own and control everything
2. **Scale** - From Raspberry Pi to H100 clusters
3. **Multi-cloud** - Not locked to any provider
4. **Open** - Transparent, community-driven development

### Is BlackRoad open source?

Core components are open source. Some enterprise features and certain forks are maintained privately. See [LICENSE](LICENSE) for details.

---

## Getting Started

### How do I install BlackRoad?

```bash
# Clone the repository
git clone https://github.com/blackboxprogramming/blackroad.git
cd blackroad

# Install dependencies
npm install

# Verify installation
./health.sh
```

See [ONBOARDING.md](ONBOARDING.md) for the complete guide.

### What are the system requirements?

**Minimum:**
- 8GB RAM
- 4 CPU cores
- 20GB disk space
- macOS, Linux, or WSL2

**Recommended:**
- 16GB+ RAM
- 8+ CPU cores
- 100GB+ SSD
- GPU for local inference (optional)

### Do I need a GPU?

No. BlackRoad works with CPU-only inference via Ollama. For production workloads, GPU acceleration (local or cloud) is recommended.

### How do I run my first agent?

```bash
# Ensure Ollama is running
ollama serve &

# Wake an agent
./wake.sh llama3.2 ALICE

# Check status
./status.sh
```

---

## Agents

### What agents are available?

| Agent | Type | Specialty |
|-------|------|-----------|
| **LUCIDIA** | Reasoning | Philosophical analysis |
| **ALICE** | Worker | Task execution |
| **OCTAVIA** | Operations | DevOps, technical |
| **PRISM** | Analysis | Pattern recognition |
| **ECHO** | Memory | Knowledge management |
| **CIPHER** | Security | Protection, scanning |

### Can I create custom agents?

Yes! Define a new agent in JSON:

```json
{
  "name": "MY_AGENT",
  "type": "worker",
  "model": "mistral",
  "system_prompt": "You are a helpful assistant...",
  "capabilities": ["code", "analysis"]
}
```

### How do agents communicate?

Agents use three communication patterns:

1. **Direct messages** - One-to-one via `./whisper.sh`
2. **Broadcast** - One-to-all via `./broadcast.sh`
3. **Pub/Sub** - Topic-based via Redis

### What's the maximum number of agents?

Target: **30,000 concurrent agents**. Current stable: ~5,000. Scaling to 30K planned for Q2 2026.

### How do I assign tasks to agents?

```bash
# Via CLI
./tasks.sh assign ALICE "Review the codebase"

# Via API
curl -X POST "https://api.blackroad.io/v1/tasks" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title": "Review codebase", "agent_id": "agent_alice_001"}'
```

---

## Memory System

### How does memory work?

BlackRoad uses a **hierarchical memory system**:

```
Working Memory (Redis)      - <10ms, 24h TTL
     ↓
Episodic Memory (PostgreSQL) - <50ms, 30d TTL
     ↓
Semantic Memory (Pinecone)   - <100ms, Forever
     ↓
Archival Memory (R2/S3)      - <1s, Forever
```

### What is PS-SHA∞?

**Persistent Secure Hash Algorithm Infinity** - A hash chain that ensures memory integrity. Each memory entry includes the hash of the previous entry, making tampering detectable.

### How do I search memory?

```bash
# CLI
./mem.sh search "deployment guide"

# API
curl -X POST "https://api.blackroad.io/v1/memory/search" \
  -d '{"query": "deployment guide", "limit": 10}'
```

### Can agents share memory?

Yes, through permission levels:
- **Private** - Only the owner
- **Team** - Specific agents
- **Organization** - All agents
- **Public** - Anyone

### How often is memory consolidated?

- **Hourly** - Working → Episodic (>100 memories)
- **Daily** - Episodic → Semantic (>1000 memories)
- **Weekly** - Index optimization
- **Monthly** - Archive old data

---

## Infrastructure

### What cloud providers does BlackRoad support?

| Provider | Use Case |
|----------|----------|
| **Cloudflare** | Edge, Workers, KV, D1, R2 |
| **Railway** | GPU inference, services |
| **Vercel** | Web apps, serverless |
| **DigitalOcean** | VMs, persistent storage |
| **AWS/GCP/Azure** | Enterprise deployments |

### Can I run BlackRoad locally?

Yes! BlackRoad is designed for local-first operation:

```bash
# All components run locally
ollama serve           # LLM inference
./boot.sh             # Start services
./status.sh           # Check status
```

### What about Raspberry Pi support?

Full support for Raspberry Pi 4/5:
- LED matrix displays
- Holographic projections
- Local Ollama inference (Pi 5)
- Edge computing nodes

See `orgs/core/blackroad-pi-ops` for details.

### How do I set up Cloudflare Tunnel?

```bash
# Install cloudflared
brew install cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create blackroad

# Configure
cloudflared tunnel route dns blackroad api.blackroad.io

# Run
cloudflared tunnel run blackroad
```

---

## Development

### What languages does BlackRoad use?

| Component | Language |
|-----------|----------|
| Web App | TypeScript (Next.js) |
| CLI | Rust (planned), Node.js (current) |
| Agents | Python (FastAPI) |
| Workers | TypeScript |
| Tools | Python, Bash |

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

### Where are the tests?

```bash
# Run all tests
npm test        # JavaScript
pytest          # Python

# Run specific tests
pytest tests/unit/test_agent.py
```

See [TESTING.md](TESTING.md) for the complete testing guide.

### How do I add a new agent type?

1. Create agent config in `agents/configs/`
2. Define capabilities and personality
3. Register with the agent service
4. Add tests
5. Document in AGENTS.md

---

## Deployment

### How do I deploy to production?

```bash
# Deploy to Cloudflare
wrangler deploy

# Deploy to Railway
railway up

# Deploy to Vercel
vercel --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guides.

### What's the recommended production setup?

```
                     Cloudflare (Edge)
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
       Railway          Vercel       DigitalOcean
       (GPU/API)        (Web)        (Persistent)
```

### How do I scale to more agents?

1. **Horizontal scaling** - Add more API pods
2. **GPU scaling** - Add H100 nodes
3. **Multi-region** - Deploy globally
4. **Sharding** - Distribute memory

### How do I monitor production?

```bash
# Infrastructure check
./blackroad-mesh.sh

# Service logs
railway logs
vercel logs

# Metrics dashboard
open http://grafana.blackroad.io
```

---

## Security

### How is authentication handled?

- **API Keys** - For service-to-service
- **JWT** - For user sessions
- **OAuth2** - For third-party integrations
- **mTLS** - For agent-to-agent

### Where are secrets stored?

- **Development** - `.env` files (gitignored)
- **Production** - HashiCorp Vault
- **Edge** - Cloudflare Secrets

### How do I report a vulnerability?

**DO NOT** open a public issue. Email security@blackroad.io with:

1. Description of vulnerability
2. Steps to reproduce
3. Potential impact

See [SECURITY.md](SECURITY.md) for full policy.

### Is there a bug bounty?

Coming Q2 2026. Rewards:
- Critical: $1,000 - $5,000
- High: $500 - $1,000
- Medium: $100 - $500
- Low: Recognition

---

## Pricing & Licensing

### Is BlackRoad free?

The core platform is free and open source. Premium features:

| Tier | Price | Agents | Support |
|------|-------|--------|---------|
| Free | $0 | 100 | Community |
| Pro | $49/mo | 5,000 | Email |
| Enterprise | Custom | Unlimited | Dedicated |

### What license does BlackRoad use?

Core components: MIT License
Enterprise features: Proprietary
See [LICENSE](LICENSE) for details.

### Can I use BlackRoad commercially?

Yes! MIT license allows commercial use. Attribution appreciated.

### How do I get enterprise support?

Contact blackroad.systems@gmail.com for:
- Dedicated support
- Custom development
- On-premise deployment
- SLA guarantees

---

## Still Have Questions?

- **Discord**: discord.gg/blackroad
- **GitHub Issues**: Report bugs or request features
- **Email**: blackroad.systems@gmail.com
- **Docs**: docs.blackroad.io

---

*Last updated: 2026-02-05*
