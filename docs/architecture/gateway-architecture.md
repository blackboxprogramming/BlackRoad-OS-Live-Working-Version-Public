# Gateway Architecture

> 500 Cloudflare Workers are not 500 websites. They are 500 routing rules at the edge.

## The 4-Tier Stack

### Tier 1 -- Cloudflare Workers (Edge Gateway)

- 500 workers available on the current plan
- Each worker is a routing rule, not a page host
- Provides: DDoS protection, TLS termination, caching, global CDN
- Cost: Free
- Role: The public face. Routes requests to origin compute.

### Tier 2 -- Raspberry Pis (Home Origin)

| Node | Name | Role | Key Services |
|------|------|------|-------------|
| Node-1 | Lucidia | Core Intelligence | DNS (PowerDNS), Memory System, RoadTrip Hub (:8094) |
| Node-3 | Alice | AI Compute | Ollama, Hailo-8 (26 TOPS), fine-tuning |
| Node-4 | Cecilia | Storage & Governance | MinIO, Fleet Health, Pi-hole |
| Node-5 | Octavia | Git & Code | Gitea (273 repos), RoadCode |
| Node-6 | Aria | Creative | Audio pipeline, AeroBand integration |

- Connected via Cloudflare Tunnels (QUIC, encrypted, no open ports)
- Cost: Already owned
- Role: The private core. Databases, inference, real services.

### Tier 3 -- Hugging Face Spaces (Free Compute)

- Free Docker containers or static sites
- GPU instances available for inference
- No cost until persistent storage or uptime guarantees needed
- Role: Host public UIs, APIs, and AI inference at zero cost.

### Tier 4 -- DigitalOcean (Expansion)

| Node | Name | Role |
|------|------|------|
| Cloud-1 | Gematria | Analytics, search, public APIs |
| Cloud-2 | Anastasia | Backup, disaster recovery, geographic redundancy |

- Only used when Pis cannot handle the load or geographic presence is needed
- Cost: Pay only when needed
- Role: Burst capacity and redundancy.

## Request Flow

```
User --> CF Worker (free, edge routing)
           --> HF Space (free compute) --> done
           --> CF Tunnel --> Pi (home origin) --> done
           --> DO Droplet (paid expansion) --> only if needed
```

## Recursive Routing

The 500 workers are the first 500 routing layers. Each can route to compute that itself routes further:

```
CF Worker (route)
  --> Agent Tier 1 (27 agents)
       --> Agent Tier 2 (27 x 27 = 729)
            --> Agent Tier 3 (27 x 27 x 27 = 19,683)
                 --> infinite depth
```

Every agent can spawn sub-agents. Every sub-agent can route to further compute. The gateway pattern is fractal -- the same 4-tier stack repeats at every level.

## Design Principles

- Workers never host HTML. They route.
- Pis are the source of truth. Everything else is cache or expansion.
- HF Spaces replace DigitalOcean for most workloads at zero cost.
- The architecture is the same at every scale: route, compute, respond.
