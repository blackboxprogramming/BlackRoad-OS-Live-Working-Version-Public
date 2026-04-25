# BlackRoad Network Canon - IP & Infrastructure Map

## Network Planes

IPs change. Planes do not. Every device and service is assigned to one or more network planes.

| Plane | Purpose | Range | Example |
|-------|---------|-------|---------|
| **LAN** | Local trust (home/office Wi-Fi) | `192.168.x.x` | `192.168.4.64` |
| **Mesh** | Zero-trust identity (Tailscale) | `100.x.x.x` | `100.66.58.5` |
| **Docker** | Internal container runtime | `172.17.x.x` / `172.18.x.x` | `172.17.0.1` |
| **Public** | Internet-facing (attack surface) | Varies | `159.65.43.12` |
| **IPv6 Global** | Modern internet | `2001:…` | `2001:1960:7000:…` |
| **IPv6 Private** | Internal ULA | `fdxx:…` | `fdbc:b2ba:6fa5:…` |
| **IPv6 Tailscale** | Mesh IPv6 | `fd7a:115c:a1e0:…` | `fd7a:115c:a1e0::…` |
| **Loopback** | Self | `127.0.0.1` | `127.0.0.1` |

---

## Node Inventory

### Node: blackroad-pi (Primary)

| Property | Value |
|----------|-------|
| **Hostname** | blackroad-pi / lucidia.local |
| **Role** | Primary Pi node, Cloudflare tunnel, agent host |
| **OS** | Debian (Raspberry Pi OS) |
| **Capacity** | 7,500 agents |

| Plane | Address | Interface |
|-------|---------|-----------|
| LAN IPv4 | `192.168.4.64` | wlan0 |
| Mesh IPv4 | `100.66.x.x` | tailscale0 |
| Mesh IPv6 | `fd7a:115c:a1e0::x` | tailscale0 |
| Docker Bridge | `172.17.0.1` | docker0 |
| IPv6 ULA | `fdbc:b2ba:6fa5::x` | — |
| IPv6 Global | `2001:1960:7000:9fcd::x` | — |

**Services Running:**
- Cloudflare Tunnel (QUIC, tunnel ID: `52915859-da18-4aa6-add5-7bd9fcac2e0b`)
- Ollama (port 11434)
- Agent runtime
- Memory system

---

### Node: aria64 (Octavia Pi)

| Property | Value |
|----------|-------|
| **Hostname** | aria64 |
| **Role** | Primary agent host (AI accelerator + NVMe) |
| **OS** | Debian (Raspberry Pi OS) |
| **Capacity** | 22,500 agents |

| Plane | Address | Interface |
|-------|---------|-----------|
| LAN IPv4 | `192.168.4.38` | wlan0 |
| Mesh IPv4 | `100.66.58.5` | tailscale0 |

**Services Running:**
- Agent runtime (22,500 agent capacity)
- AI accelerator workloads
- NVMe storage

---

### Node: alice (Tertiary Pi)

| Property | Value |
|----------|-------|
| **Hostname** | alice / raspberrypi.local |
| **Role** | Tertiary Pi node |
| **OS** | Debian (Raspberry Pi OS) |
| **User** | alice |

| Plane | Address | Interface |
|-------|---------|-----------|
| LAN IPv4 | `192.168.4.49` | wlan0 |

---

### Node: lucidia (Alternate)

| Property | Value |
|----------|-------|
| **Hostname** | lucidia |
| **Role** | Alternate/backup Pi instance |
| **OS** | Debian (Raspberry Pi OS) |
| **User** | lucidia |

| Plane | Address | Interface |
|-------|---------|-----------|
| LAN IPv4 | `192.168.4.99` | wlan0 |

---

### Node: codex-infinity (DigitalOcean Droplet)

| Property | Value |
|----------|-------|
| **Hostname** | blackroad os-infinity |
| **Role** | Primary cloud server, failover |
| **Provider** | DigitalOcean |
| **Capacity** | Failover (0 default agents) |

| Plane | Address | Interface |
|-------|---------|-----------|
| Public IPv4 | `159.65.43.12` | eth0 |
| Mesh IPv4 | `100.66.x.x` | tailscale0 |

---

### Node: iPhone Koder (Mobile)

| Property | Value |
|----------|-------|
| **Hostname** | iPhone Koder |
| **Role** | Mobile development |

| Plane | Address | Interface |
|-------|---------|-----------|
| LAN IPv4 | `192.168.4.68` | Wi-Fi |

**Services:** HTTP server on port `8080`

---

## Cloudflare Tunnel

| Property | Value |
|----------|-------|
| Tunnel ID | `52915859-da18-4aa6-add5-7bd9fcac2e0b` |
| Tunnel Name | `blackroad` |
| Status | Active |
| Protocol | QUIC |
| Edge Location | `dfw08` (Dallas) |
| Running On | blackroad-pi (`192.168.4.64`) |

### Tunnel Routes

| Public Domain | Local Target |
|---------------|--------------|
| `agent.blackroad.ai` | `localhost:8080` |
| `api.blackroad.ai` | `localhost:3000` |

### Tunnel Service (systemd)

```ini
[Service]
Type=simple
User=root
ExecStart=/usr/bin/cloudflared --no-autoupdate tunnel run --token <TOKEN>
Restart=on-failure
RestartSec=5s
```

---

## Port Assignments

### Standard Ports

| Port | Service | Node | Protocol |
|------|---------|------|----------|
| 22 | SSH | All Pis | TCP |
| 80 | HTTP | Workers, Pages | TCP |
| 443 | HTTPS | Workers, Pages | TCP |
| 3000 | API Server | blackroad-pi | TCP |
| 8080 | Agent API / Koder | blackroad-pi, iPhone | TCP |
| 8001 | Ollama Wrapper (with [MEMORY]) | blackroad-pi | TCP |
| 8420 | MCP Bridge | localhost only | TCP |
| 8787 | BlackRoad Gateway | localhost only | TCP |
| 11434 | Ollama | blackroad-pi | TCP |

### Railway Services

| Port | Service | Project |
|------|---------|---------|
| 8080 | Default Railway | All Railway projects |

---

## Agent Distribution Map

| Node | IP (LAN) | IP (Mesh) | Capacity | Role |
|------|----------|-----------|----------|------|
| aria64 | `192.168.4.38` | `100.66.58.5` | 22,500 | PRIMARY |
| blackroad-pi | `192.168.4.64` | `100.66.x.x` | 7,500 | SECONDARY |
| codex-infinity | `159.65.43.12` | `100.66.x.x` | 0 (failover) | FAILOVER |

**Total Agent Capacity: 30,000**

| Task Type | Count | Percentage |
|-----------|-------|------------|
| AI Research | 12,592 | 42% |
| Code Deploy | 8,407 | 28% |
| Infrastructure | 5,401 | 18% |
| Monitoring | 3,600 | 12% |

---

## DNS Configuration

### Nameservers (All Domains)

```
jade.ns.cloudflare.com
chad.ns.cloudflare.com
```

### Cloudflare DNS Records (Primary Zone: blackroad.io)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| A | `blackroad.io` | Cloudflare Pages | Proxied |
| CNAME | `agent` | Tunnel | Proxied |
| CNAME | `api` | Tunnel | Proxied |
| CNAME | `about` | Worker | Proxied |
| CNAME | `admin` | Worker | Proxied |
| CNAME | `agents` | Worker | Proxied |
| CNAME | `ai` | Worker | Proxied |
| CNAME | `dashboard` | Worker | Proxied |
| CNAME | `docs` | Worker | Proxied |
| CNAME | `dev` | Worker | Proxied |
| *(41 subdomain workers total)* | | | |

---

## Network Topology

```
                    INTERNET
                       |
              [Cloudflare Edge]
               /      |       \
     [Workers]   [Pages]   [Tunnel QUIC]
         |          |           |
         |          |    [blackroad-pi :64]
         |          |      /         \
         |          |  [Ollama]   [Agent Runtime]
         |          |      |           |
         |          |  [Memory]    [30K Agents]
         |          |                  |
         |          |         /---------+--------\
         |          |    [aria64 :38]       [lucidia :99]
         |          |    (22,500 agents)    (backup)
         |          |
    [Railway]   [Vercel]
    (14 projects) (15+ projects)
         |
    [DigitalOcean]
    [codex-infinity]
    (159.65.43.12)
```

---

## Network Discovery Script

Run on each node to auto-collect network information:

```bash
#!/usr/bin/env bash
# br-netdump.sh - Collect node network information

echo "=== HOSTNAME ==="
hostname

echo -e "\n=== IPv4 / IPv6 ==="
hostname -I

echo -e "\n=== INTERFACES ==="
ip addr

echo -e "\n=== ROUTES ==="
ip route
ip -6 route

echo -e "\n=== DOCKER NETWORKS ==="
docker network ls 2>/dev/null
docker network inspect bridge 2>/dev/null | head -30

echo -e "\n=== TAILSCALE ==="
tailscale status 2>/dev/null

echo -e "\n=== LISTENING PORTS ==="
ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null

echo -e "\n=== CLOUDFLARED ==="
cloudflared tunnel info blackroad 2>/dev/null
```

---

## Security Notes

- **Public IPs are attack surfaces** - `159.65.43.12` is internet-facing
- **LAN IPs change by network** - do not hardcode, use hostnames or mesh IPs
- **Mesh IPs are identity-grade** - stable within Tailscale mesh
- **Docker IPs are internal-only** - never expose directly
- **Gateway binds to localhost** - `127.0.0.1:8787` by design
- **MCP Bridge requires auth** - Bearer token on all requests
- **Tunnel uses QUIC** - encrypted end-to-end through Cloudflare

---

**Property of BlackRoad OS, Inc. All rights reserved.**
**Document Version:** 1.0
**Last Updated:** 2026-02-28
