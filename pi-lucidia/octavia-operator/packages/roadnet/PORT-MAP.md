# BlackRoad Fleet — Complete Port Map
# Generated 2026-03-09 (Layer 5 Deep Port Scan)
# Every TCP/UDP port on every node identified

```
═══════════════════════════════════════════════════════════════════════════
  ALICE (192.168.4.49) — Pi 400 — 25 TCP, 15 UDP
═══════════════════════════════════════════════════════════════════════════

TCP:
  :22    sshd                     SSH daemon
  :53    pihole-FTL               Pi-hole DNS (TCP)
  :443   pihole-FTL               Pi-hole HTTPS admin
  :3000  python3                  dashboard-proxy.py (blackroad)
  :4010  python3                  agents-proxy.py (blackroad)
  :5432  postgres                 PostgreSQL 13 (localhost only)
  :6333  qdrant                   Qdrant vector DB (HTTP)
  :6334  qdrant                   Qdrant vector DB (gRPC)
  :6379  redis-server             Redis (localhost only)
  :7890  python3                  stats-proxy.py (/opt/blackroad/)
  :8001  python3/uvicorn          operator_service (blackroad operator)
  :8010  python3                  agents-daemon.py (/opt/blackroad/)
  :8011  python3                  task_queue_v2.py (pi)
  :8012  python3                  blackroad-ops.py (blackroad)
  :8013  python3                  status_service.py (pi)
  :8014  python3                  pi-fleet-dashboard.py (alice)
  :8080  nginx (4 workers)        Reverse proxy / Cloudflare tunnel ingress
  :8083  node/pm2                 road-control (PM2 serve)
  :8180  python3                  BlackRoad Pi Agent (/opt/blackroad/agent.py)
  :8184  python3                  status-server.py (blackroad)
  :8787  node                     prism-agent (agent.js)
  :9000  nginx                    Nginx secondary (metrics proxy)
  :11434 ssh tunnel               Ollama (forwarded from remote)
  :20241 cloudflared              CF tunnel metrics (localhost)

UDP:
  :53    pihole-FTL               Pi-hole DNS
  :68    dhcpcd                   DHCP client
  :123   pihole-FTL               NTP (Pi-hole embedded)
  :5353  avahi-daemon             mDNS/Bonjour
  :*     cloudflared (4 ports)    QUIC tunnels (ephemeral)
  :*     avahi (2 ports)          mDNS ephemeral

═══════════════════════════════════════════════════════════════════════════
  CECILIA (192.168.4.96) — Pi 5 + Hailo-8 — 28 TCP, 15 UDP
═══════════════════════════════════════════════════════════════════════════

TCP:
  :22    sshd                     SSH daemon
  :53    dnsmasq (3 listeners)    DNS: 192.168.4.96, 10.10.2.1, 127.0.0.1
  :80    nginx (4 workers)        HTTP (BlackRoad OS landing + sites)
  :3000  python3                  blackroad-server.py (landing page)
  :3001  python3                  http.server (simple file server)
  :3100  node                     CECE API (server.js) — AI personality engine
  :5001  python3                  TTS API (tts-api/app.py)
  :5002  python3                  Monitor API (monitoring/monitor-api.py)
  :5432  postgres                 PostgreSQL 17 (localhost only)
  :5900  wayvnc                   VNC remote desktop (GPU-accelerated)
  :7890  python3                  stats-proxy.py (/opt/blackroad/)
  :8080  nginx                    HTTP alt (Cloudflare tunnel ingress)
  :8086  influxd                  InfluxDB time-series (all interfaces)
  :8088  influxd                  InfluxDB backup (localhost only)
  :8787  python3                  blackroad-model-server.py (AI gateway)
  :8788  python3/uvicorn          BlackRoad API (app.main:app)
  :9000  minio                    MinIO S3-compatible storage
  :9001  minio                    MinIO console UI
  :9100  python3                  system-monitor.py (node exporter)
  :11434 ollama                   Ollama LLM server (localhost only)
  :11435 python3                  ollama-proxy.py (external access)
  :20241 cloudflared              CF tunnel metrics (localhost)
  :34001 pironman5                Pironman5 case OLED service

UDP:
  :53    dnsmasq (3 listeners)    DNS: 192.168.4.96, 10.10.2.1, 127.0.0.1
  :67    dnsmasq                  DHCP server (RoadNet AP clients)
  :5353  avahi-daemon             mDNS/Bonjour
  :*     cloudflared (4 ports)    QUIC tunnels (ephemeral)

═══════════════════════════════════════════════════════════════════════════
  OCTAVIA (192.168.4.100) — Pi 5 + Hailo-8 — 22 TCP, 22 UDP
═══════════════════════════════════════════════════════════════════════════

TCP:
  :22    sshd                     SSH daemon
  :53    dnsmasq                  DNS (localhost only)
  :631   cupsd                    CUPS printing (localhost only)
  :2222  docker-proxy → gitea     Gitea SSH (→ container :2222)
  :2377  dockerd                  Docker Swarm manager
  :3000  python3                  http.server (simple landing)
  :3100  docker-proxy → gitea     Gitea HTTP (→ container :3100)
  :4222  dockerd → NATS           NATS messaging (Swarm ingress)
  :5000  octoprint                OctoPrint 3D print server
  :7890  python3                  stats-proxy.py (/opt/blackroad/)
  :7946  dockerd                  Docker Swarm gossip
  :8080  python3                  BlackRoad Pi Agent (/opt/blackroad/agent.py)
  :8082  docker-proxy → edge      Edge Agent (→ container :8080)
  :8086  influxd                  InfluxDB time-series
  :8088  influxd                  InfluxDB backup (localhost)
  :8222  dockerd → NATS           NATS HTTP monitor (Swarm ingress)
  :8787  python3                  blackroad-model-server.py (AI gateway)
  :9100  python3                  system-monitor.py (node exporter)
  :11434 ollama                   Ollama LLM server (localhost only)
  :20241 cloudflared              CF tunnel metrics (localhost)
  :34001 pironman5                Pironman5 case OLED service

UDP:
  :53    dnsmasq                  DNS (localhost)
  :67    dnsmasq                  DHCP server (RoadNet AP)
  :1900  octoprint                SSDP/UPnP discovery
  :4789  docker                   VXLAN overlay (Swarm)
  :5353  avahi + octoprint (7!)   mDNS on every interface (leak!)
  :7946  dockerd                  Swarm gossip
  :*     cloudflared (2 ports)    QUIC tunnels

═══════════════════════════════════════════════════════════════════════════
  LUCIDIA (192.168.4.38) — Pi 5 — 52 TCP (34 active after cleanup), 19 UDP
═══════════════════════════════════════════════════════════════════════════

TCP:
  :22    sshd                     SSH daemon
  :53    dnsmasq                  DNS (localhost only)
  :80    nginx (4 workers)        HTTP (530+ blackroad-* apps via wildcard)
  :631   cupsd                    CUPS printing (localhost only)
  :3000  python3                  api-server.py (alexa user service)
  :3002  docker-proxy → carpool   CarPool Next.js app (→ container :3000)
  :3005  docker-proxy → systems   blackroad.systems site (→ container :3000)
  :3006  docker-proxy → ai        blackroadai.com site (→ container :3000)
  :3109  docker-proxy → metaverse blackroad-metaverse (→ container :3000)
  :4001  docker-proxy → roadapi   RoadAPI (→ container :3001)
  :4002  docker-proxy → roadauth  RoadAuth (→ container :3002)
  :4010  node                     ollama-bridge (SSE proxy → Ollama)
  :5000  gunicorn                 simpleweb Flask app ⛔ DISABLED
  :5001  python3                  TTS API (tts-api/app.py) ⛔ DISABLED
  :5002  python3                  Monitor API (monitoring/monitor-api.py) ⛔ DISABLED
  :5100  python3                  load-balancer/app.py ⛔ DISABLED
  :5200  python3                  fleet-monitor/app.py ⛔ DISABLED
  :5300  python3                  notifications/app.py ⛔ DISABLED
  :5400  python3                  metrics/app.py ⛔ DISABLED
  :5500  python3                  analytics/app.py ⛔ DISABLED
  :5600  python3                  grafana/app.py ⛔ DISABLED
  :5700  python3                  alert-manager/app.py ⛔ DISABLED
  :5800  python3                  log-aggregator/app.py ⛔ DISABLED
  :5900  python3                  backup-system/app.py ⛔ DISABLED
  :6000  python3                  perf-cache/app.py ⛔ DISABLED
  :6100  python3                  resource-optimizer/app.py ⛔ DISABLED
  :6200  python3                  compression-middleware/app.py ⛔ DISABLED
  :6300  python3                  connection-pool/app.py ⛔ DISABLED
  :8000  uvicorn                  Lucidia API (FastAPI main:app)
  :8011  socat                    Relay → Alice:8011 (task queue)
  :8080  docker-proxy → agent     pi-my-agent (→ container :8080)
  :8081  nginx                    Nginx alt (blackroad-os static)
  :8082  docker-proxy → edge      Edge Agent (→ container :8080)
  :8086  influxd                  InfluxDB time-series
  :8088  influxd                  InfluxDB backup (localhost)
  :8090  node                     road-registry-api (server.js, PM2)
  :8180  python3                  BlackRoad Pi Agent (/opt/blackroad/agent.py)
  :8182  python3                  status-server.py (alexa user service)
  :8787  python3                  blackroad-model-server.py (AI gateway)
  :8888  java                     Java HelloWorld server ⛔ DISABLED
  :8889  python3                  /opt/blackroad-api/api.py
  :9090  docker-proxy → edge      Edge Agent metrics (→ container :9090)
  :9100  node_exporter            Prometheus node exporter
  :9192  docker-proxy → pdns      PowerDNS Admin (→ container :80)
  :11434 ollama                   Ollama LLM server (localhost only)
  :20241 cloudflared #1           CF tunnel metrics (localhost)
  :20242 cloudflared #2           CF tunnel metrics (2nd instance!)
  :38850 tailscaled               Tailscale (100.66.235.47)
  :38975 ollama runner            Ollama model runner (ephemeral)
  :46193 tailscaled               Tailscale IPv6

UDP:
  :53    dnsmasq                  DNS (localhost)
  :67    dnsmasq                  DHCP server (RoadNet AP)
  :5353  avahi-daemon             mDNS/Bonjour
  :38238 tailscaled               Tailscale WireGuard
  :41641 tailscaled               Tailscale direct (v4+v6)
  :*     cloudflared (8 ports!)   QUIC tunnels (2 instances × 4 each)

═══════════════════════════════════════════════════════════════════════════
                    FLEET PORT SUMMARY
═══════════════════════════════════════════════════════════════════════════

  Total TCP listeners:  25 + 28 + 22 + 52 = 127 fleet-wide
  Total UDP listeners:  15 + 15 + 22 + 19 = 71 fleet-wide
  Grand total:          198 listening sockets

  SHARED SERVICES (same port, all/most nodes):
  ┌──────────────────────────────────────────────────┐
  │  PORT   SERVICE              NODES                │
  ├──────────────────────────────────────────────────┤
  │  :22    SSH                  ALL 4                │
  │  :53    DNS (pihole/dnsmasq) ALL 4                │
  │  :7890  stats-proxy.py       ALL 4                │
  │  :8080  nginx/agent          ALL 4 (varied)       │
  │  :8787  model-server.py      Cec+Oct+Luc          │
  │  :8086  InfluxDB             Cec+Oct+Luc          │
  │  :11434 Ollama               Cec+Oct+Luc          │
  │  :20241 Cloudflared          ALL 4                │
  │  :34001 Pironman5            Cec+Oct              │
  │  :9100  node exporter        Cec+Oct+Luc          │
  │  :8180  blackroad agent      Ali+Luc              │
  │  :5001  TTS API              Cec+Luc              │
  │  :5002  Monitor API          Cec+Luc              │
  └──────────────────────────────────────────────────┘

  UNIQUE SERVICES:
  ┌──────────────────────────────────────────────────┐
  │  Alice:  Pi-hole(:53/:443), Qdrant(:6333/:6334), │
  │          PostgreSQL(:5432), Redis(:6379),         │
  │          operator(:8001), prism-agent(:8787)      │
  │                                                  │
  │  Cecilia: CECE API(:3100), MinIO(:9000/:9001),   │
  │          VNC(:5900), ollama-proxy(:11435),        │
  │          PostgreSQL(:5432)                        │
  │                                                  │
  │  Octavia: Gitea(:3100/:2222), OctoPrint(:5000),  │
  │          NATS(:4222/:8222), Docker Swarm(:2377),  │
  │          CUPS(:631)                              │
  │                                                  │
  │  Lucidia: 14 blackroad microservices(:5000-:6300) │
  │          Lucidia API(:8000), CarPool(:3002),      │
  │          PowerDNS Admin(:9192), ollama-bridge,    │
  │          Java HelloWorld(:8888), socat relay,     │
  │          2x cloudflared, Tailscale(:38850),       │
  │          road-registry-api(:8090), 13 Docker ctrs │
  └──────────────────────────────────────────────────┘

  HTTP HEALTH STATUS (Layer 6 probe):
  ┌──────────────────────────────────────────────────────────────┐
  │  ALICE    :443=000 :3000=000 :4010=503 :6333=200 :7890=000  │
  │           :8001=200✓ :8010=200✓ :8011=200✓ :8012=200✓       │
  │           :8013=200✓ :8014=200✓ :8080=200✓ :8083=200✓       │
  │           :8180=200✓ :8787=401(auth) :9000=403(nginx)       │
  │                                                              │
  │  CECILIA  :80=403 :3000=200✓ :3001=200✓ :3100=200✓(CECE)   │
  │           :5001=200✓(TTS) :5002=200✓ :7890=200✓             │
  │           :8080=200✓ :8787=200✓ :8788=404 :9001=200✓(MinIO) │
  │           :11434=200✓(Ollama) :34001=200✓(Pironman)         │
  │                                                              │
  │  OCTAVIA  :3000=200✓ :3100=200✓(Gitea) :5000=302(OctoPrint)│
  │           :7890=200✓ :8080=200✓ :8787=200✓                  │
  │           :9100=200✓ :11434=200✓ :34001=200✓                │
  │                                                              │
  │  LUCIDIA  :3000=200✓ :3002=200✓(CarPool) :3005=200✓(42KB)  │
  │           :3006=200✓(42KB) :3109=200✓(53KB metaverse)       │
  │           :4001=200✓ :4002=200✓ :5000=200✓ :5001=200✓(TTS) │
  │           :5100-6300=200✓(all 14 microservices)             │
  │           :8000=200✓(Lucidia API) :8081=200✓ :8180=200✓     │
  │           :8787=200✓ :8888=200✓(Java) :9100=200✓            │
  │           :11434=200✓(Ollama)                               │
  └──────────────────────────────────────────────────────────────┘

  DATABASE INVENTORY (Layer 6):
  ┌──────────────────────────────────────────────────────────────┐
  │  Alice     PostgreSQL: "blackroad" DB (0 tables — empty)    │
  │            Redis: db0 = 1 key | Qdrant: 0 collections      │
  │                                                              │
  │  Cecilia   PostgreSQL: templates only (empty)               │
  │            InfluxDB: _internal + pironman5                   │
  │            MinIO: /mnt/minio/data                           │
  │                                                              │
  │  Octavia   InfluxDB: _internal + pironman5                  │
  │            Gitea: 207 repos, 8 orgs                         │
  │                                                              │
  │  Lucidia   PostgreSQL: "operator" DB (owned by pi)          │
  │            InfluxDB: _internal + pironman5                   │
  │            PowerDNS: postgres:15-alpine container            │
  └──────────────────────────────────────────────────────────────┘

  DISK HOGS (Layer 6):
  ┌──────────────────────────────────────────────────────────────┐
  │  Cecilia   Ollama blobs: 24GB | Wolfram Engine: 4.9GB       │
  │            Bitcoin sync: 6.2GB | Alexandria sync total: 6.6G│
  │                                                              │
  │  Octavia   blackroad home: 23GB (runners 19GB!)             │
  │            Ollama: 16GB | Docker: 5.7GB                     │
  │            NVMe Claude: 2.9GB (config 2.1G + time 800M)    │
  │                                                              │
  │  Lucidia   blackroad home: 33GB (runners 19GB, models 4.4G)│
  │            Ollama: 20GB                                     │
  │                                                              │
  │  Alice     alice home: 2.2GB | pi npm cache: 857MB         │
  │            alice/gdrive: 882MB                              │
  └──────────────────────────────────────────────────────────────┘

  ⚠️ FINDINGS:
  - Lucidia has 14 Python microservices (:5000-:6300) — many look like
    skeleton apps (load-balancer, grafana, alert-manager, etc.)
    All running as separate processes = ~14×20MB = 280MB RAM wasted
  - Lucidia has 2 cloudflared instances (2 tunnels or duplicate?)
  - Octavia OctoPrint broadcasts mDNS on ALL 7 interfaces (including Docker bridges)
  - Alice has Ollama forwarded via SSH tunnel (:11434) — not local
  - Lucidia :8888 is literally "java HelloWorld" — test service left running
  - Lucidia :5000 simpleweb is a basic Flask "Hello World" via gunicorn
  - Several services duplicated: TTS API on Cec+Luc, monitor on Cec+Luc
  - socat relay on Lucidia:8011 forwards to Alice:8011 (task queue bridge)
```
