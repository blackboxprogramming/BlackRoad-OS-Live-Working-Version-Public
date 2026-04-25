# BlackRoad OS

Self-hosted edge AI operating system running 52 TOPS of inference across a 5-node Raspberry Pi cluster.

## What is BlackRoad OS?

BlackRoad OS is a sovereign computing platform that runs AI inference, networking, and automation entirely on hardware you own. No cloud dependencies. No API keys expiring at 2am. Five Raspberry Pi 5 nodes connected by a WireGuard mesh network, accelerated by dual Hailo-8 NPUs, running 44 local models through Ollama.

The fleet self-heals. Cron-driven watchdogs monitor every service, restart what dies, and log what broke. A stats API collects live telemetry from every node every 5 minutes — CPU temp, RAM, disk, services, model counts — and serves it to all BlackRoad websites in real time. Cloudflare tunnels route 48+ domains through the cluster. Docker Swarm orchestrates containers across nodes. Gitea hosts 207 repositories on a 1TB NVMe.

This is infrastructure that runs in a closet and serves production traffic.

## Live Fleet Status

Real-time data from the stats API (updated every 5 minutes):

| Node | Role | Hardware | Key Services |
|------|------|----------|-------------|
| **Alice** | Gateway, DNS, ingress | Pi 400 | Pi-hole, PostgreSQL, Qdrant, Nginx, 65+ tunnel routes |
| **Cecilia** | AI inference, TTS | Pi 5, Hailo-8 (26 TOPS) | 15 Ollama models, CECE API, TTS, MinIO, PostgreSQL |
| **Octavia** | Git, orchestration, AI | Pi 5, Hailo-8 (26 TOPS), 1TB NVMe | 11 Ollama models, Gitea, Docker Swarm, NATS |
| **Aria** | Container management | Pi 5 | 6 Ollama models, Portainer, Headscale |
| **Lucidia** | Apps, CI/CD | Pi 5, 238GB SD | 6 Ollama models, GitHub Actions, FastAPI, CarPool, PowerDNS |

**Network:** WireGuard mesh (10.8.0.x) with Anastasia (DigitalOcean NYC) as hub. RoadNet WiFi overlay (5 APs, dedicated subnets).

## By the Numbers

| Metric | Count |
|--------|-------|
| Edge nodes | 5 Raspberry Pis |
| AI compute | 52 TOPS (2x Hailo-8) |
| Ollama models | 44 across fleet |
| TCP listening ports | 173 |
| Cloudflare tunnels | 18 (100 hostnames) |
| Custom domains | 48+ |
| Pages sites | 95 |
| D1 databases | 8 |
| KV namespaces | 40 |
| R2 buckets | 10 |
| Gitea repos | 207 |
| GitHub repos | 115 (non-fork) |
| SQLite databases | 228 |
| Shell scripts | 92 |
| Cron jobs | 13 automated tasks |

## Stack

| Component | What it does |
|-----------|-------------|
| **Hailo-8** | 52 TOPS combined neural network inference (2x 26 TOPS) |
| **Ollama** | 44 local LLMs including custom CECE models |
| **WireGuard** | Encrypted mesh VPN across all nodes + cloud |
| **Pi-hole** | Fleet-wide DNS filtering (76,456 blocked domains) |
| **Docker Swarm** | Container orchestration across the cluster |
| **Gitea** | Self-hosted Git with 207 repositories across 7 orgs |
| **NATS** | Lightweight messaging between services |
| **RoadC** | Custom programming language with Python-style indentation |
| **Cloudflare** | 18 tunnels, 95 Pages, D1/KV/R2 storage, Workers |
| **Stats API** | Live fleet telemetry via Cloudflare Worker + KV |
| **Analytics** | Sovereign, cookie-free event capture via Worker + D1 |

## Observability

Every BlackRoad website pulls live data from the stats API — no hardcoded numbers. The collector script SSHes into all 5 nodes every 5 minutes and pushes:

- CPU temperature, usage, RAM, disk
- Ollama model counts and service status
- Docker container counts and TCP port inventory
- Service health (SSH, DNS, Ollama, Nginx, PostgreSQL, MinIO, Gitea, NATS, etc.)

Websites auto-refresh every 60 seconds. When a node goes down, every dashboard reflects it within 5 minutes.

## Sites

| Site | Purpose |
|------|---------|
| **[blackroad.io](https://blackroad.io)** | Main platform |
| **[blackroad.network](https://blackroad.network)** | Live mesh topology dashboard |
| **[blackroad.systems](https://blackroad.systems)** | Infrastructure status page |
| **[backlog.blackroad.io](https://backlog.blackroad.io)** | Engineering journal (35 articles) |
| **[git.blackroad.io](https://git.blackroad.io)** | Self-hosted Gitea |

## License

Copyright 2026 BlackRoad OS, Inc. — Alexa Amundson. All rights reserved.

## Related Projects

| Project | Description |
|---------|-------------|
| [Lucidia](https://github.com/blackboxprogramming/lucidia) | Autonomous AI agent with persistent memory |
| [RoadC](https://github.com/blackboxprogramming/roadc) | Custom programming language with indentation-based syntax |
| [Quantum Math Lab](https://github.com/blackboxprogramming/quantum-math-lab) | Mathematical proofs and quantum computing research |
| [Hailo Vision](https://github.com/blackboxprogramming/hailo-vision) | Computer vision with Hailo-8 AI accelerators |
| [Fleet Heartbeat](https://github.com/blackboxprogramming/fleet-heartbeat) | Distributed health monitoring system |
| [BlackRoad API SDKs](https://github.com/blackboxprogramming/blackroad-api-sdks) | Python, Go, TypeScript SDKs for the BlackRoad API |
| [BlackRoad KPIs](https://github.com/blackboxprogramming/blackroad-os-kpis) | Daily fleet metrics collection and reporting |
