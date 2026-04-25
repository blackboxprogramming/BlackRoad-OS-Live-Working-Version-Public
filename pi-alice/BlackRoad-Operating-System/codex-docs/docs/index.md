# Welcome to BlackRoad OS Codex

> **Version:** 0.1.0 (Phase 2 Scaffold)
> **Last Updated:** 2025-11-18

## What is BlackRoad OS?

BlackRoad OS is a nostalgic Windows 95-inspired web-based operating system that brings together AI orchestration, blockchain technology, social media, video streaming, and gaming into a unified ecosystem.

## Key Features

- **🪟 Windows 95 UI** - Nostalgic desktop experience in your browser
- **🤖 208 AI Agents** - Autonomous agents across 10 categories
- **⛓️ RoadChain** - Tamper-evident blockchain ledger
- **⚡ Prism Console** - Admin and observability dashboard
- **🧠 Lucidia Layer** - Multi-model AI orchestration (Phase 2)
- **🌍 MetaCity** - Virtual worlds and experiences (Phase 3)

## Architecture Overview

BlackRoad OS is built on a 7-layer architecture:

```
Layer 7: User Experience (Domains & Landing Pages)
Layer 6: Application Layer (Pocket OS, Native Apps)
Layer 5: API Gateway & Routing (FastAPI)
Layer 4: Orchestration & Intelligence (Lucidia, Prism, Operator)
Layer 3: Data & State (PostgreSQL, Redis, RoadChain, Vault)
Layer 2: Compute & Infrastructure (Railway, DigitalOcean, Cloudflare Workers)
Layer 1: DNS & CDN (Cloudflare)
```

## Quick Links

- **[Architecture Guide](architecture.md)** - Understand the system design
- **[Components Overview](components.md)** - Explore each module
- **[Getting Started](dev/getting-started.md)** - Start developing
- **[API Reference](api/system.md)** - Explore the API

## Phase 2 Scaffold Status

| Module | Status | Description |
|--------|--------|-------------|
| Backend API | ✅ Complete | FastAPI with system endpoints |
| Core OS Runtime | ✅ Complete | State management and models |
| Operator Engine | ✅ Complete | Job scheduling and orchestration |
| Web Client | ✅ Enhanced | Pocket OS with Core OS client |
| Prism Console | ✅ Complete | Admin dashboard UI |
| Documentation | ✅ Complete | MkDocs-based Codex |

## Repository Structure

```
BlackRoad-Operating-System/
├── backend/              # FastAPI backend
├── core_os/              # Core OS runtime (NEW)
├── operator_engine/      # Operator engine (NEW)
├── prism-console/        # Prism admin UI (NEW)
├── web-client/           # Web client docs (NEW)
├── codex-docs/           # This documentation (NEW)
├── agents/               # 208 AI agents
├── docs/                 # Legacy docs
└── README.md
```

## Next Steps

1. **Explore the Architecture** - Read the [Architecture Guide](architecture.md)
2. **Set Up Locally** - Follow the [Local Setup Guide](dev/local-setup.md)
3. **Review Modules** - Understand each [Component](components.md)
4. **Try the API** - Check out the [API Reference](api/system.md)

## Vision

The ultimate goal is to create a complete AI-powered operating system that enables:

- **Create** - Content, code, and creative works
- **Build** - Infrastructure and applications
- **Operate** - Automated workflows and agents
- **Trade** - Digital assets and tokens
- **Govern** - Decentralized decision-making
- **Dream** - Virtual worlds and experiences
- **Explore** - Research and innovation

## Contributing

See the [Contributing Guide](dev/contributing.md) to learn how to contribute to BlackRoad OS.

## License

BlackRoad Operating System is licensed under the MIT License.

---

**Built with ❤️ by the BlackRoad OS Team**
# BlackRoad OS Codex

**Welcome to the BlackRoad Operating System Documentation**

BlackRoad OS is a Windows 95-inspired web-based operating system that brings together AI orchestration, blockchain technology, and a nostalgic user interface. This is the complete technical documentation for developers, operators, and contributors.

---

## 🚀 Quick Links

<div class="grid cards" markdown>

- **[Quick Start →](guides/quickstart.md)**

    Get up and running with BlackRoad OS in minutes

- **[Architecture Overview →](architecture/overview.md)**

    Understand the system design and components

- **[API Reference →](api/overview.md)**

    Explore the complete API documentation

- **[Deployment Guide →](guides/deployment.md)**

    Deploy BlackRoad OS to production

</div>

---

## 📚 What is BlackRoad OS?

BlackRoad Operating System is a complete AI-powered ecosystem that includes:

- **🖥️ Pocket OS**: A browser-based operating system with a Windows 95-inspired interface
- **🌌 Prism Console**: Administrative interface for job queue management, event logging, and system metrics
- **🤖 Agent Library**: 200+ autonomous AI agents across 10 categories
- **🔗 RoadChain**: Blockchain-based audit trail and provenance system
- **🔐 PS-SHA∞ Identity**: Sovereign identity system for agents and users
- **☁️ CloudWay**: Infrastructure automation and deployment orchestration

---

## 🎯 Core Philosophy

**Agent-First**
:   Humans orchestrate, agents execute. BlackRoad OS is designed for AI-driven workflows.

**Memory-Conscious**
:   Everything is logged and retrievable. Complete audit trails for compliance and debugging.

**Ledger-Aware**
:   Critical actions are provable and tamper-evident via RoadChain.

**Zero-Dependency Frontend**
:   Vanilla JavaScript with no build process. Fast, simple, and maintainable.

**Cloud-Native**
:   Infrastructure as software. Deployed on Railway with Cloudflare CDN.

---

## 🗺️ Documentation Map

### For Developers

- **[Quick Start Guide](guides/quickstart.md)**: Get started in 5 minutes
- **[Development Setup](guides/development.md)**: Set up your local environment
- **[API Reference](api/overview.md)**: Complete API documentation
- **[Creating Agents](agents/creating-agents.md)**: Build your own agents

### For Operators

- **[Deployment Guide](guides/deployment.md)**: Production deployment steps
- **[Environment Variables](guides/environment-variables.md)**: Configuration reference
- **[Infrastructure & Deployment](architecture/infra-deployment.md)**: Railway + Cloudflare setup

### For Contributors

- **[Contributing Guide](contributing.md)**: How to contribute to BlackRoad OS
- **[Architecture Overview](architecture/overview.md)**: System architecture deep dive

---

## 🏗️ Current Status: Phase 2.5

**Infrastructure Wiring Complete**

BlackRoad OS Phase 2.5 has completed the infrastructure wiring, including:

- ✅ Monorepo as canonical OS home
- ✅ Prism Console served at `/prism`
- ✅ Documentation via GitHub Pages
- ✅ Railway + Cloudflare deployment ready
- ✅ Comprehensive environment variable management

**What's Next: Phase 2.6+**

- 🔄 Full Prism Console functionality (job queue, event log, metrics)
- 🔄 Agent orchestration workflows
- 🔄 RoadChain integration
- 🔄 PS-SHA∞ identity system

See [Phase 2.5 Decisions](architecture/phase2-decisions.md) for details.

---

## 🌟 Key Features

### Prism Console

Administrative interface for managing the entire BlackRoad ecosystem:

- **Job Queue**: Monitor and manage long-running tasks
- **Event Log**: Real-time system event stream
- **Metrics Dashboard**: System health and performance
- **Agent Management**: View and control 200+ AI agents

Access: `https://blackroad.systems/prism`

### Agent Library

200+ autonomous AI agents across 10 categories:

- DevOps (30+ agents)
- Engineering (40+ agents)
- Data Science (25+ agents)
- Security (20+ agents)
- Finance (15+ agents)
- Creative (20+ agents)
- Business (15+ agents)
- Research (15+ agents)
- Web (15+ agents)
- AI/ML (15+ agents)

Learn more: [Agent Overview](agents/overview.md)

### RoadChain

Blockchain-based audit trail:

- Tamper-evident logging
- Provenance tracking
- Compliance-ready
- SHA-256 hashing

API: `/api/blockchain`

---

## 🚀 Production URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Main OS** | https://blackroad.systems | BlackRoad OS desktop interface |
| **Prism Console** | https://blackroad.systems/prism | Administrative console |
| **API Documentation** | https://blackroad.systems/api/docs | OpenAPI/Swagger docs |
| **Codex (this site)** | https://docs.blackroad.systems | Complete documentation |

---

## 🤝 Community & Support

- **GitHub**: [blackboxprogramming/BlackRoad-Operating-System](https://github.com/blackboxprogramming/BlackRoad-Operating-System)
- **Issues**: Report bugs and request features on GitHub Issues
- **Discord**: Coming in Phase 1 Q2 (community hub)

---

## 📄 License

BlackRoad Operating System is proprietary software. See the repository LICENSE file for details.

---

**Where AI meets the open road.** 🛣️

*Built with ❤️ by the BlackRoad team*
