# BlackRoad Device Registry — Master Index
# Generated 2026-03-09 (Exhaustive Deep Scan — All Nodes)
# Every device gets a unique ID (1-255)

```
═══════════════════════════════════════════════════════════════════════════════════
  ID   NAME                    TYPE          LOCATION / IP           STATUS
═══════════════════════════════════════════════════════════════════════════════════

────── CORE INFRASTRUCTURE (1-10) ──────

  1    eero Mesh Router        Gateway       192.168.4.1             ONLINE
       MAC: 44:ac:85:94:37:92  Base MAC: 44:ac:85:94:37:80
       mDNS: eero-0bp4.local  BSSID: 44:AC:85:94:37:87
       WiFi: 5GHz CH100  SSID: asdfghjkl  Subnet: 192.168.4.0/22
       Thread/Matter mesh (_meshcop, _trel), Sleep Proxy

  2    Anastasia               Cloud VPS     174.138.44.45           ONLINE
       DigitalOcean nyc1 | 1 vCPU, 765MB RAM | CentOS 9 Stream
       Kernel: 5.14.0-651.el9.x86_64 | Uptime: 71 days
       Disk: 25GB (67% used = 17GB) — was 94%, cleaned up
       WG hub :51820 | Headscale :8080/:9090 | Ollama (TS only)
       Nginx :80 (blackroad.io) | uvicorn :8000 | Redis :6379
       WebSockets :8765/:8766 | Node :3000/:3001 | PM2
       Cloudflared | fail2ban | lucidia-agent | blackroad-api
       Cron: agent-health.sh every 5m
       Failed: caddy, cockpit
       WG peers: alice(.6)✓ cecilia(.3)✓ octavia(.4)✓ aria(.7)⚠1h gematria(.8)✓
       2 unused: 10.8.0.2, 10.8.0.5

  3    Gematria                Cloud VPS     159.65.43.12            PARTIAL
       DigitalOcean nyc3 | 4 vCPU, 8GB RAM | Ubuntu 22.04
       Disk: 80GB (43GB used) | SSH DOWN but WG alive (10.8.0.8)
       Caddy, Ollama, NATS, Cloudflared, Tailscale

────── COMPUTE NODES (11-20) ──────

  11   Alexandria              Mac           192.168.4.28            ONLINE
       MAC: b0:be:83:66:cc:10 | macOS Darwin 23.5.0
       Tailscale: 100.117.200.23 (idle)

  12   Alice                   Pi 400        192.168.4.49            ONLINE
       MAC: d8:3a:dd:ff:98:87 | BCM2835 Rev c03130
       Serial: 1000000091da3c05 | 4GB RAM (443MB used)
       Kernel: 6.1.21-v8+ (2023-04-03) ⚠️ OLD
       SD: 15GB (77% = 11GB used) | Temp: 38.9°C | Throttle: 0x0
       CPU: ondemand, 1.8GHz (Cortex-A72) | 1926 packages
       PCIe: BCM2711 bridge + VIA VL805 USB 3.0 (Pi 400 arch)
       Timers: blackroad-watchdog (30s), gitops-sync (5m), prism-pull (2m)
       dmesg: brcmf_cfg80211_change_iface errors (WiFi/RoadNet AP conflict)
       DNS: 8.8.8.8, 8.8.4.4, 100.100.100.100, fdbc: (IPv6)
       /etc/hosts: alice listed twice (127.0.1.1)
       Docker: 0 volumes, 0 containers, default networks only
       Git repos: road-deploy, road-control, .lucidia (4 repos)
       42 running services | 4 failed (caddy, dnsmasq, nginx, prism-pull)
       Timers: blackroad-watchdog (30s), prism-pull (2m), gitops-sync (5m)
       Cron (pi): stats-push (15m, PUSH_SECRET in plaintext)
       Pi-hole: FTL active on :53 (UDP+TCP, IPv4+IPv6), blocking enabled
       PostgreSQL 13: "blackroad" DB (0 tables) | Redis: 1 key in db0
       Qdrant: 0 collections | task_watchdog.py monitors Redis worker heartbeats
       /opt/prism/: EMPTY dir (prism-pull timer pulls from empty git repo)
       Git repos: road-deploy (2 dirty), road-control, .lucidia, blackroad-worlds
       Disk: 15GB SD, 77% full (3.2GB free) — tight!
       PM2: road-control (online), road-deploy (stopped), compliance (stopped)
       GitHub Actions Runner: BlackRoad-OS-Inc-blackroad.alice-pi
       Pi-hole DNS :53 | PostgreSQL 13 :5432 | Qdrant :6333/:6334
       Redis :6379 | Cloudflared | Docker | WireGuard (10.8.0.6)
       30 TCP ports | 15 UDP ports | iowait: 15.32% on mmcblk0 (SD stress)
       Python services: agent(:8180), operator(:8001), dashboard(:3000),
         agents-proxy(:4010), status(:8013), task-queue(:8184),
         agents-daemon, blackroad-ops(:8012), world-engine, stats-proxy(:7890)
       Node.js: road-control(:8083), model-server(:8787), prism-agent
       RoadNet AP: uap0 CH1 10.10.1.0/24 | brcmfmac roamoff=0 (causes iface errors)
       max_usb_current=1 in config.txt, sg3-utils installed
       Cron: Pi-hole gravity update (weekly), log flush (daily), sysstat (10m)
       Docker: 0 images, 0 containers (Docker installed but unused)
       ⚠️ hostapd crash loop: "Failed to start Access point" (brcmfmac limitation Pi 400)
       ⚠️ blackroad-status.service missing venv | rclone WebDAV mount failed

  13   Cecilia                 Pi 5          192.168.4.96            ONLINE
       MAC: 88:a2:9e:3b:eb:72 | Rev d04171
       Serial: 98db8e2ec705f7c4 | 8GB RAM (1.3GB used)
       Kernel: 6.12.62+rpt-rpi-2712 (2025-12-18)
       NVMe boot: 457GB (17% = 73GB used) | SD: 238.4GB (backup)
       Temp: 46.8°C (CPU) / 39.8°C (NVMe) / 42.1°C (RP1)
       hwmon: cpu_thermal, nvme, rp1_adc, pwmfan, rpi_volt
       Swap: 2GB (15MB used) | Watchdog: /dev/watchdog0
       RTC: /dev/rtc0 | Timezone: America/Chicago ✅ FIXED (was Europe/London)
       44 enabled services | Docker v29.2.1 (+buildx, compose, model plugins)
       Users (5): root, cecilia, postgres, blackroad, alexa
       Sudo NOPASSWD: cecilia, blackroad
       SSH keys: blackroad=2
       Input: pwr_button, gpio_ir_recv (IR receiver!), 2x HDMI CEC
       Audio: 2x HDMI output (vc4-hdmi-0/1) | Video: 17 /dev/video devices
       Services: cece-api, cece-heartbeat, cece-net-gateway, blackroad-dashboard,
         blackroad-monitor, brnode, stats-proxy, wayvnc, wayvnc-control,
         cloudflared, dnsmasq, docker, hailort, hostapd, influxdb,
         lightdm, minio, nginx, node_exporter, ollama, pironman5,
         postgresql, roadnet, roadnet-failover, rpcbind, nfs-blkmap
       CECE API :3100 | TTS :5001 | Monitor :5002 | Dashboard :3001/:3000
       Model Server :8787/:8788 | Ollama :11434 (13 models) | Proxy :11435
       PostgreSQL 17 :5432 | MinIO :9000/:9001 | InfluxDB :8086/:8088
       Nginx :80/:8080 | VNC :5900 | Cloudflared | Docker | Hailo-8
       WireGuard (10.8.0.3) | Pironman5 :34001 | CUPS :631 | RPC :111
       Port :7890 (stats-proxy) | :8788 (blackroad-api uvicorn)
       30 TCP | 12 UDP
       Firewall: nftables NAT (Docker + RoadNet 10.10.2.0/24 → wlan0/wg0)
       Cron (blackroad): autonomy heartbeat (1m), heal (5m), rclone→gdrive (15m),
         brady-bunch SDL display (@reboot), blackroad-server (@reboot),
         blackroad-api uvicorn :8788 (@reboot), ollama-proxy (@reboot),
         git pull master (5m), stats-push (15m, PUSH_SECRET=34e1aa...),
         github-relay Gitea→GitHub (30m) ⚠️ HARDCODED CREDS: blackroad:BlackRoad2026OS
         ⚠️ Gitea URL in relay still points to .97 (now .100)
       Ollama models (15): cece, cece2, deepseek-r1:1.5b, nomic-embed-text,
         OpenELM-1B/3B, qwen3:8b, llama3:8b, codellama:7b, deepseek-coder:1.3b,
         qwen2.5-coder:3b, llama3.2:1b/3b, tinyllama | CECE actively loaded
       rclone remotes: gdrive:, gdrive-blackroad: (Google Drive backup)
       Brady-bunch: pygame/curses fleet status grid on SDL framebuffer
         ✅ REMOVED: obfuscated /tmp/op.py cron entry (dropper pattern)
       rclone: 3 concurrent instances eating memory!
       RoadNet AP: uap0 CH6 10.10.2.0/24
       Desktop: labwc + Xwayland + wf-panel-pi + pcmanfm
       eth0: direct cable to BliKVM (1Gbps, 0 rx packets)
       Cloudflare Tunnel d67bf4a5 (22 hostnames):
         blackroad.io, www.blackroad.io, blackroadai.com, blackroad.me,
         blackroad.network, blackroad.systems, aliceqi.com, lucidiaqi.com,
         lucidia.earth, lucidia.studio, roadchain.io → nginx :8080
         cecilia.blackroad.io → :3000 | api.blackroad.io → :8788
         gateway.blackroad.io → :8787 | ollama.blackroad.io → :11434
         monitor → :9100 | dashboard → :3001 | agents → :4010
         metrics → :9000 (MinIO) | storage → :9001
       Docker: 0 images, 0 containers (Docker v29.2.1 installed but unused)
       Ollama blobs: 22GB (13 models)
       Hailo params: force_desc_page_size=4096, support_soft_reset=Y
       Cron (/etc/cron.d): nginx @reboot
       ✅ dnsmasq FIXED: bind-interfaces→bind-dynamic + listen 192.168.4.96 (was 0.0.0.0)
       cece-net.conf: custom DNS zones (.cece, .blackroad, .entity, .soul, .dream) → 192.168.4.22
       ⚠️ Voltage: 0.8693V after vcgencmd fix (mknod /dev/vcio c 100 0)
       Unix sockets: hailort_uds.sock, docker.sock, postgresql, cups, wayvnc
       CPU: ondemand, 2.4GHz | 2197 packages | 408 Python packages!
       PCIe: Hailo-8 + Micron/Crucial NVMe (5427) behind ASM1182e + RP1
       Python: torch 2.10.0+cpu, hailo-tappas-core 5.1.0, hailort 4.23.0,
         Flask, FastAPI, celery, redis (full AI/ML stack)
       Node global: wrangler 4.68.0
       GPU: /dev/dri/card0, card1, renderD128
       ⚠️ dmesg: Undervoltage detected! (9+ events — CECILIA ALSO UV!)
       ⚠️ 4 rclone instances now (growing from 3!) — all syncing same gdrive
       ⚠️ vcgencmd broken for non-root (needs: sudo mknod /dev/vcio c 100 0)
       2x wayvnc: desktop + rpi-connect remote access
       /tmp: fleet-telemetry.py (22KB), stats-proxy.py (8KB) — NO op.py found
       30+ git repos in blackroad-source/repos/ (anthropic, canva, openai, aws, etc.)
       Established: 4 rclone→Google Drive (IPv6), SSH→GitHub, InfluxDB

  14   Octavia                 Pi 5          192.168.4.100 (was .97) ONLINE
       MAC: 88:a2:9e:10:0a:3a | Rev d04171
       Serial: a91e903b3e7bfcc4 | 8GB RAM (1.2GB used)
       Kernel: 6.12.62+rpt-rpi-2712 (2025-12-18)
       SD boot: 117GB (66% = 74GB used) | NVMe: 916GB (1% = 3GB used)
       Temp: 38°C (CPU) / 36.8°C (NVMe) / 36.3°C (RP1)
       hwmon: cpu_thermal, nvme, rp1_adc, rpi_volt (NO pwmfan — fan missing/broken?)
       Swap: 2GB (0 used) | Watchdog: /dev/watchdog0
       RTC: /dev/rtc0 | Timezone: America/North_Dakota/Center
       39 enabled services | Docker v29.2.1 (+buildx, compose, model)
       Users (5): root, pi, lucidia, blackroad, alexa
       Sudo NOPASSWD: (default pi via sudoers.d)
       ⚠️ SSH keys: pi=52 (excessive — security concern)
       Input: pwr_button, gpio_ir_recv (IR receiver!), 2x HDMI CEC
       Audio: 2x HDMI playback | Video: 17 /dev/video (pispbe + rpi-hevc-dec)
       Services: blackroad-agent (/opt/blackroad/agent.py as root),
         blackroad-dashboard, blackroad-monitor, blackroad-worker-hailo,
         brnode, cloudflared, docker, github-runner-lucidia, hailort,
         hostapd, influxdb, lightdm, octoprint, ollama, pironman5,
         roadnet, roadnet-failover, stats-proxy, wayvnc-control,
         dnsmasq, cups-browsed, rpcbind, nfs-blkmap, node_exporter
       Docker Swarm LEADER :2377 (alice=Down, aria=Down, octavia=Ready)
         Containers: gitea(:3100/:2222), NATS(:4222/:8222 via ingress),
           ollama, edge-agent(:8082)
       OctoPrint :5000 | InfluxDB :8086/:8088 | Ollama :11434 (9 models)
       Model Server :8787 | Dashboard :3000 | Agent :8080
       Cloudflared | dnsmasq :53 | CUPS :631 | Pironman5 :34001
       WireGuard (10.8.0.4) | 29 TCP | 25 UDP
       Port :7890 (stats-proxy) | :9100 (node_exporter)
       Firewall: nftables Docker Swarm NAT + INGRESS (NATS 4222/8222, edge 8082)
         + RoadNet 10.10.3.0/24 masquerade → wlan0/wg0
       Cron (pi): git pull blackroad-parts (5m), stats-push (15m, same PUSH_SECRET)
       Cron (blackroad): autonomy heartbeat (1m) + heal (5m) — self-healing service checks
       NVMe: /mnt/nvme/blackroad/ (3GB), models/ (26MB), quantum_discoveries/ (2.8MB)
       Hailo-8: /dev/hailo0 ✓ FIXED | hailo_pci module loaded | hailort_uds.sock
       I2C 0x3c: Pironman5 OLED display
       Desktop: labwc + wf-panel-pi + pcmanfm
       RoadNet AP: uap0 CH11 10.10.3.0/24
       USB: no external devices (4 root hubs only)
       CPU: ondemand, 2.6GHz (FASTEST in fleet!) | 2290 packages | 318 Python pkgs
       PCIe: Hailo-8 + Micron/Crucial NVMe (5427) behind ASM1182e + RP1
       Python: Flask, hailort 4.23.0, nats-py, redis (no torch)
       GPU: /dev/dri/card0, card1, renderD128
       Throttle: 0x50000 (historical, NOT currently) | Voltage: 0.8451V ✅ (was 0.750V pre-optimize)
       Docker volumes: "ollama" | 8 networks (2 overlay swarm, 4 bridge, host, none)
       Docker Swarm: 4 nodes (alice=Down v28.5.2, aria=Down v20.10.24, octavia=Leader v29.2.1, old-octavia=Down)
       Swarm services: blackroad-nats (1/1 replicas), my-service (0/4 FAILED)
       Cloudflare Tunnel b7e9f25e (10 hostnames):
         lucidia.blackroad.io → :3000 | api-lucidia → :8000
         monitor-lucidia → :9090 | ssh-lucidia → ssh://22
         git.blackroad.io → :3100 | code.blackroad.systems → :3100
         roadcode.blackroad.systems → :3100
         cloud.blackroad.io → :3200 | cloud.blackroad.systems → :3200
       Docker images (11): gitea 260MB, NATS 22MB, ollama 8.57GB, nginx:alpine 93MB,
         edge-agent 264MB, blackroad.systems 81MB, blackroadai.com 81MB,
         auth-gateway 970MB, metaverse 81MB, ultimate 81MB, octoprint 1.77GB
       Ollama blobs: 15GB (9 models) | ⚠️ qwen manifest corrupted (EOF errors)
       Ollama journal: 500 errors on /api/chat and /api/generate (2min timeouts)
       Hailo params: force_desc_page_size=4096, support_soft_reset=Y
       Claude Time: 2.8GB on NVMe (/mnt/nvme/blackroad/claude/)
       Established: git→GitHub, Runner.Worker→GitHub Actions, cloudflared (100.49.232.196)
       Git repos: quantum/blackroad-os-quantum, actions-runner, Claude config (NVMe)
       OctoPrint requires API key for access

  15   Aria                    Pi 5          192.168.4.98            OFFLINE ⚠️
       MAC: 88:a2:9e:xx:42:07
       8GB RAM | 30GB SD (96% full)
       Last WG handshake: ~1h ago (went down recently)
       Portainer :9443 | Headscale :8090 | Ollama (4 models)
       Pironman5 | Magic Keyboard BT | TONOR mic (intermittent)
       WireGuard (10.8.0.7) | RoadNet AP: uap0 CH1
       NOT PINGABLE — host is down, needs physical check/reboot

  16   Lucidia                 Pi 5          192.168.4.38            ONLINE ⚠️HOT
       MAC: 2c:cf:67:cf:fa:17 | Rev d04171
       Serial: aa088196e6935b14 | 8GB RAM (4.7GB used = 59%!)
       Kernel: 6.12.62+rpt-rpi-2712 (2026-01-19)
       SD: 235GB (41% = 90GB used) | Temp: 57.9°C ✅ FIXED (was 73.8°C) (RP1: 52°C)
       hwmon: cpu_thermal, rp1_adc, pwmfan, rpi_volt (no NVMe — SD-only boot)
       Swap: 8.5GB (437MB used) via dphys-swapfile
       Watchdog: /dev/watchdog0 | RTC: /dev/rtc0 | Timezone: America/Chicago
       Hostname: "octavia" (MISNAMED — Tailscale name "lucidia")
       62 enabled services! (highest in fleet)
       Users (9): root, pi, postgres, deploy, lucidia, nova, octavia, blackroad, alexa
       Sudo NOPASSWD: pi, octavia
       SSH keys: octavia=15
       PipeWire running for blackroad + alexa users
       Input: pwr_button, 2x HDMI CEC, 2x HDMI Jack (no IR receiver)
       Audio: 2x HDMI output | Video: 17 /dev/video devices
       Firewall: UFW (nftables + iptables) — INPUT policy DROP!
         Tailscale (ts-input/ts-forward chains), Docker NAT, mDNS allowed
       Services: actions.runner (GitHub CI), blackroad-agent, blackroad-api,
         blackroad-relay, blackroad-salesforce-agent, btc-compose, cloudflared,
         docker, dphys-swapfile, fail2ban, hostapd, influxdb, java-hello,
         lightdm, llama, lucidia, nginx, node_exporter, ollama, ollama-bridge,
         operator, pironman5, pm2-pi, postgresql, roadnet, roadnet-failover,
         rpi-display-backlight, simpleweb, tailscaled, ufw, wayvnc-control
       Docker: 11 containers running!
         road-pdns-admin :9192 (healthy), road-dns-db (postgres:15-alpine),
         roadapi :4001, roadauth :4002, blackroad-edge-agent :8082/:9090,
         blackroad.systems :3005, blackroadai.com :3006,
         blackroad-auth-gateway, blackroad-metaverse :3109,
         blackroad-os-carpool :3002, pi-my-agent :8080 (healthy)
       Docker images (14): edge-agent 182MB, blackroad.systems 54MB,
         blackroadai.com 54MB, auth-gateway 704MB, metaverse 54MB,
         ultimate 54MB, carpool 819MB, postgres:15-alpine 270MB,
         pi-eps 268MB, pi-my-agent 383MB, node:18-alpine 126MB,
         powerdns/pdns-auth-48 186MB, powerdnsadmin/pda-legacy 222MB,
         ruimarinho/bitcoin-core 145MB
       Tailscale peers: lucidia(self), alexandria(idle), alice(offline 15d),
         aria(offline 15d), cecilia(relay "ord"), octavia(offline 15d),
         codex-infinity(offline 15d), lucidia-operator(offline 33d),
         shellfish(offline 15d)
       Lucidia API :8000 | Ollama :11434 (6 models) | Bridge :3109
       PostgreSQL 17 :5432 | InfluxDB :8086 | Nginx :80 (530+ apps)
       Tailscale :38850 (100.66.235.47) | 2x Cloudflared :20241/:20242
       Node Exporter :9100 | Pironman5 | CUPS :631
       Java Hello World :8888 | simpleweb | socat relay :8011
       Model Server :8787 | stats-proxy | dnsmasq :53
       Ports: 60+ TCP! :3000-:3006, :4001/:4002, :5000-:6300 (15+ Python),
         :8000, :8011, :8080-:8090, :8180/:8182, :8787, :8888-:8889, :9090/:9192
       Cloudflare Tunnel 0447556b (4 hostnames):
         octavia.blackroad.io → :3000 | api-octavia → :8000
         monitor-octavia → :9090 | ssh-octavia → ssh://22
         Note: Lucidia serves "octavia.*" domains — names reflect old hostname confusion
         but routing is CORRECT (each tunnel routes to localhost services on the right box)
       Ollama blobs: 20GB (6 models) | lucidia:8b loaded = 265% CPU
       Ollama-bridge: SSE proxy service
       Lucidia API: /home/pi/lucidia/.venv/bin/uvicorn main:app :8000 (FastAPI)
         Environment: /etc/opt/lucidia.env
       llama.service: /home/pi/llama.cpp/build/bin/llama-server :8080
         Model: /home/pi/models/model.gguf | ConditionPathExists checks
       btc-compose: ruimarinho/bitcoin-core + EPS (docker compose) — FAILED
       /var/www: 6 dirs (blackroad=335 items!, blackroad-cloud, blackroad-console,
         blackroad-data, certbot, html, lucidia) — 530+ static apps
       Nginx sites-enabled: blackroad-cloud, blackroad-domains, blackroad-multi
         blackroad-multi: wildcard map *.blackroad.io → /var/www/blackroad/blackroad-$sub
       Swap: 8.5GB via dphys-swapfile (1.3GB used, growing)
       Cron (octavia): blackroad-agent-startup (5m) — script is EMPTY
       Cron (root): certbot renewal (3am daily) — ⚠️ CERT EXPIRED Oct 2025!
       Disk: /home/blackroad/ = 33GB, /home/alexa/ = 1.8GB
       SuperDrive A1379 on USB (sr0) — CANNOT load disc (OC)
       RoadNet AP: uap0 CH11 10.10.5.0/24
       Desktop: labwc + wayvnc + wf-panel-pi
       Named pipes: .NET debug pipes for GitHub Actions Runner (CLR)
       CPU: ondemand, 2.4GHz | 2208 packages | 339 Python pkgs
       PCIe: RP1 South Bridge ONLY (no NVMe, no Hailo — SD boot)
       Python: Flask, gunicorn, redis (no torch, no hailo)
       Node global: npm, pm2@6.0.14
       PM2 (pi): road-registry-api (40.8MB, online, port :8090)
       GPU: /dev/dri/card0, card1, renderD128
       ✅ Ollama runner FIXED: world-engine.py (alexa user service) was calling /api/generate
          blackroad-world.service disabled, world-engine killed, temp 73.8°C → 57.9°C
       Microservices (14, all Python, under /home/blackroad/):
         :5100 load-balancer/app.py (18MB) | :5200 fleet-monitor/app.py (24MB)
         :5300 notifications/app.py (22MB) | :5400 metrics/app.py (24MB)
         :5500 analytics/app.py (25MB) | :5600 grafana/app.py (16MB)
         :5700 alert-manager/app.py (16MB) | :5800 log-aggregator/app.py (18MB)
         :5900 backup-system/app.py (14MB) | :6000 perf-cache/app.py (17MB)
         :6100 resource-optimizer/app.py (17MB) | :6200 compression-middleware/app.py (17MB)
         :6300 connection-pool/app.py (17MB) | :5002 monitoring/monitor-api.py (24MB)
         Also: :5001 tts-api/app.py (24MB) | :5000 simpleweb gunicorn (12MB x2)
         Total: ~350MB RAM on 21 Python processes + Docker containers
       /var/www/blackroad: 334 static app directories (nginx wildcard multi-site)
         Samples: ai-agent-framework, blockchain-explorer, carbon-tracker, chaos-engineering...
       Alexa user services: blackroad-api (active), blackroad-status (active),
         blackroad-world (disabled), blackroad-git-worker (disabled)
       ⚠️ Leaked GitHub PAT in alexa's blackroad-git-worker.service (gho_Gfu...)
       ⚠️ dmesg: "mmc0: Card stuck being busy!" — SD card degrading!
       ⚠️ dmesg: sr0 "Can't lookup blockdev" + USB error -71 (SuperDrive)
       ⚠️ DNS: Tailscale MagicDNS ONLY (100.100.100.100) — no fallback!
       ⚠️ cmdline: cgroup params duplicated 4x (messy config.txt)
       ⚠️ vcgencmd broken (needs: sudo mknod /dev/vcio c 100 0)
       UFW: deny incoming, allow outgoing, deny routed
         Allow: SSH anywhere, 8000 from LAN, 8080+50001 on tailscale0, 8180 anywhere
       Docker: 3 volumes (caddy_config, caddy_data, pdns-db), 9 networks, 12 containers
       Git repos (10): blackroad-agents, actions_github_pages_* (4x timestamped),
         .nvm, .lucidia, blackroad, untitled-folder
       Established: Alice SSH tunnel, GitHub Actions, Google Drive rclone,
         cloudflared, InfluxDB, Tailscale, Microsoft Azure (Actions infra)
       Last logins: pi autoloads tty1, rebooted 2x on Mar 8, alexa SSH Mar 3
       ⚠️ Failed logins: blikvm, admin, kvmd from Mac (192.168.4.28)
       btc-compose = "Bitcoin Core + EPS (docker compose)" — FAILED
       fail2ban FAILED | certbot FAILED — SSL EXPIRED Oct 2025, no intrusion protection
       Nginx sites: blackroad-cloud, blackroad-domains, blackroad-multi
       SSL: blackroad.io cert (domains: blackroad.io, blackroadinc.us + www variants) EXPIRED
       Timers: brnode-heartbeat (5m), certbot (12h), tls-watch (daily), pins-refresh (weekly)
       GitHub Actions: 21 runner dirs under /home/blackroad/runners/ (19GB total!)
         Repos: blackroad-{agents,api,cli,core,docs,gateway,hardware,infra,math,operator,
         sdk,sf,web}, blackroad-os-{agents,api-gateway,core,docs,helper,mesh,web}, demo-repository
         2 runner processes: blackroad (Runner.Listener) + pi (Runner.Listener via systemd)
       /etc/hosts: 127.0.1.1 → lucidia (correct despite hostname "octavia")

  17   raspberrypi             Pi 5          192.168.50.63           OFFLINE
       MAC: 88:a2:9e:3b:eb:70 | On Alice eth0 secondary subnet
       Powered off

────── AI ACCELERATORS (21-25) ──────

  21   Hailo-8 #1              AI PCIe       Cecilia M.2             ONLINE
       Serial: HLLWM2B233704667 | Part: HM218B1C2FAE
       FW: 4.23.0 (release,app,extended context switch buffer)
       Product: HAILO-8 AI ACC M.2 M KEY MODULE EXT TEMP
       /dev/hailo0 ✓ | hailort.service active
       9 LIVE models: YOLO5Seg, YOLO5Face, YOLO6, YOLO8, etc.
       26 TOPS | PCIe Gen3 x1 via ASM1182e switch

  22   Hailo-8 #2              AI PCIe       Octavia M.2             ONLINE ✓ FIXED!
       Serial: HLLWM2B233704606 | Part: HM218B1C2FAE
       FW: 4.23.0 (release,app,extended context switch buffer)
       Product: HAILO-8 AI ACC M.2 M KEY MODULE EXT TEMP
       /dev/hailo0 ✓ | hailo_pci module loaded | persistent via /etc/modules-load.d/
       Pre-compiled models: resnet_v1_50.hef, yolov5s.hef
       26 TOPS | PCIe Gen2 x1 via ASM1182e switch
       ⚠️ Octavia has undervoltage (0x50005) — PSU may be insufficient for Hailo+NVMe

────── STORAGE DEVICES (26-35) ──────

  26   Alice SD                microSD       Alice                   14.8 GB (77%)
  27   Cecilia NVMe            NVMe SSD      Cecilia PCIe            465.8 GB (17% boot)
       Micron/Crucial Device 5427 | PCIe Gen2 x1 via ASM1182e
  28   Cecilia SD              microSD       Cecilia                 238.4 GB (backup)
  29   Octavia NVMe            NVMe SSD      Octavia PCIe            931.5 GB (1% = 3GB)
       Micron/Crucial Device 5427 | PCIe Gen2 x1 via ASM1182e
  30   Octavia SD              microSD       Octavia                 119.1 GB (66% boot)
  31   Aria SD                 microSD       Aria                    ~30 GB (96% full!)
  32   Lucidia SD              microSD       Lucidia                 238.8 GB (41%)
  33   Anastasia Disk          VPS Disk      Anastasia               25 GB (67%)
  34   Gematria Disk           VPS Disk      Gematria                80 GB (54%)

────── USB DEVICES (36-50) ──────

  36   Alice Keyboard          USB HID       Alice USB 1-1.4         04d9:0007 Holtek     ONLINE
  37   Alice SD Reader         USB Storage   Alice USB 1-1.2         14cd:1212 Super Top  ONLINE (no card)
  38   Alice USB Hub           USB Hub       Alice USB 1-1           2109:3431 VIA Labs   ONLINE
  39   Cecilia CP2102          USB Serial    Cecilia USB 3-2         10c4:ea60 SiLabs     ONLINE (SILENT)
       /dev/ttyUSB0 | 9600 8N1 | Timeout errors (-110)
  40   Cecilia Pixart Mouse    USB HID       Cecilia USB 1-1         —                    MISSING
  41   Cecilia Sipeed M1s      USB Storage   Cecilia USB 3-2         BL808 RISC-V         MISSING
       Triple-core SoC (C906+E907+E902) | WiFi+BLE+Zigbee
       8MB flash | firmware.bin = BL IoT SDK WiFi stack
  42   Lucidia SuperDrive      USB Optical   Lucidia USB 3-2         05ac:1500 Apple      DEGRADED
       /dev/sr0 | Serial: KZAZ9NI1741 | FW: 2.03
       24x/24x writer cd/rw xa/form2 cdda caddy
       USB 2.0 (480M) | bMaxPower: 500mA (actually needs ~1.1A)
       77+ over-current events | Cannot load disc
  43   Aria TONOR Mic          USB Audio     Aria USB                TC-777               MISSING
  44   Aria Magic Keyboard     Bluetooth     Aria BT                 Apple A1644          OFFLINE
  45   Cecilia IR Receiver     GPIO Input    Cecilia gpio_ir_recv    rc0                  ONLINE
       IR remote control receiver on GPIO pin — can receive IR commands
  46   Octavia IR Receiver     GPIO Input    Octavia gpio_ir_recv    rc0                  ONLINE
       IR remote control receiver on GPIO pin — can receive IR commands

────── NETWORK PERIPHERALS (51-55) ──────

  51   BliKVM                  KVM-over-IP   Cecilia eth0            DEAD
       Direct 1Gbps cable | 0 rx packets | No IP either end
       Scanned 169.254.x.x + 192.168.1.x — no response
       HDMI+USB passthrough to Cecilia
  52   Sipeed BL808 SoC        RISC-V MCU    Cecilia USB             MISSING
       (see #41 — same device, listed both as USB and network peripheral)

────── I2C / SPI DEVICES (56-65) ──────

  56   Octavia OLED            I2C Display   Octavia i2c-1 @ 0x3c   ONLINE (Pironman5)
  57   Alice I2C-1             I2C Bus       Alice                   ONLINE
  58   Alice I2C-20            I2C Bus       Alice                   ONLINE
  59   Alice I2C-21            I2C Bus       Alice                   ONLINE
  60   Alice SPI 0.0           SPI           Alice                   ONLINE
  61   Alice SPI 0.1           SPI           Alice                   ONLINE

────── BLUETOOTH RADIOS (66-70) ──────

  66   Alice BT                BT 5.0        Alice hci0              Broadcom    ONLINE
  67   Cecilia BT              BT 5.0        Cecilia hci0            Cypress     ONLINE
  68   Octavia BT              BT 5.0        Octavia hci0            Cypress     ONLINE
  69   Aria BT                 BT 5.0        Aria hci0               Cypress     OFFLINE
  70   Lucidia BT              BT 5.0        Lucidia hci0            Cypress     ONLINE

────── NETWORK INTERFACES — PHYSICAL (71-80) ──────

  71   Alice wlan0             WiFi 5GHz     192.168.4.49            -58 dBm  ONLINE
  72   Alice eth0              Ethernet      192.168.50.1/24         UP (secondary)
  73   Cecilia wlan0           WiFi 5GHz     192.168.4.96            -64 dBm  ONLINE
  74   Cecilia eth0            Ethernet      (→ BliKVM)              1Gbps UP (silent)
  75   Octavia wlan0           WiFi 5GHz     192.168.4.100 (was .97) -63 dBm  ONLINE
  76   Octavia eth0            Ethernet      —                       DOWN
  77   Aria wlan0              WiFi 5GHz     192.168.4.98            OFFLINE
  78   Aria eth0               Ethernet      —                       DOWN
  79   Lucidia wlan0           WiFi 5GHz     192.168.4.38            -62 dBm  ONLINE
  80   Lucidia eth0            Ethernet      —                       DOWN

────── NETWORK INTERFACES — VIRTUAL (86-110) ──────

  86   Alice uap0              RoadNet AP    10.10.1.1 CH1           ONLINE
  87   Cecilia uap0            RoadNet AP    10.10.2.1 CH6           ONLINE
  88   Octavia uap0            RoadNet AP    10.10.3.1 CH11          ONLINE
  89   Aria uap0               RoadNet AP    10.10.4.1 CH1           OFFLINE
  90   Lucidia uap0            RoadNet AP    10.10.5.1 CH11          ONLINE
  91   Alice wg0               WireGuard     10.8.0.6                ONLINE
  92   Cecilia wg0             WireGuard     10.8.0.3                ONLINE
  93   Octavia wg0             WireGuard     10.8.0.4                ONLINE
  94   Aria wg0                WireGuard     10.8.0.7                OFFLINE (~1h)
  95   Anastasia wg0           WireGuard     10.8.0.1 (hub)          ONLINE
  96   Gematria wg0            WireGuard     10.8.0.8                ONLINE
  97   Lucidia tailscale0      Tailscale     100.66.235.47           ONLINE
  98   Alice docker0           Docker        172.17.0.1              ONLINE (linkdown)
  99   Octavia docker0         Docker Swarm  :2377 (leader)          ONLINE
 100   Aria docker0            Docker        172.17.0.1              OFFLINE
 101   Lucidia docker0         Docker        172.17.0.1              ONLINE (12 containers)
 102   Cecilia docker0         Docker        172.17.0.1              ONLINE (linkdown)

────── CLOUDFLARE TUNNELS (111-115) ──────

 111   Alice Tunnel            CF Tunnel     52915859                ONLINE  65+ hostnames
 112   Cecilia Tunnel          CF Tunnel     d67bf4a5                ONLINE  22 hostnames
       Routes: 11 domains→nginx:8080, cecilia→:3000, api→:8788,
       gateway→:8787, ollama→:11434, monitor→:9100, dashboard→:3001,
       agents→:4010, metrics→:9000, storage→:9001
 113   Aria Tunnel             CF Tunnel     93a03772                OFFLINE
 114   Octavia Tunnel          CF Tunnel     b7e9f25e                ONLINE  10 hostnames
       Routes: lucidia→:3000, api-lucidia→:8000, monitor-lucidia→:9090,
       ssh-lucidia→:22, git/code/roadcode→:3100, cloud(x2)→:3200
 115   Lucidia Tunnel          CF Tunnel     0447556b                ONLINE  4 hostnames
       Routes: octavia→:3000, api-octavia→:8000, monitor-octavia→:9090,
       ssh-octavia→:22  ⚠️ NAMES SWAPPED with Octavia!
 116   Anastasia Tunnel        CF Tunnel     (shellfish)             ONLINE

────── LAN DEVICES — NON-BLACKROAD (121-140) ──────

 121   Roku Stick              Streaming     192.168.4.21    cc:08:fa:a4:49:c2    ONLINE
       AirPlay-enabled (_airplay._tcp), Spotify Connect
 122   AltoBeam Device         IoT/TV        192.168.4.22    30:be:29:5b:24:5f    ONLINE
       AltoBeam Inc. (Chinese semiconductor — smart TV chip)
 123   iPhone                  Phone         192.168.4.27    6c:4a:85:32:ae:72    ONLINE
 124   Alexa's Apple TV        Apple TV      192.168.4.33    60:92:c8:11:cf:7c    ONLINE
       AirPlay + AirTunes/377.40.00 :7000 + Companion Link
 125   Funai DVD Player        AV            192.168.4.44    98:17:3c:38:db:78    ONLINE
 126   Private MAC Device      IoT           192.168.4.45    d0:c9:07:50:51:ca    ONLINE
       Randomized MAC, all ports closed — phone or IoT
 127   Unknown Device          IoT           192.168.4.53    98:41:5c:aa:13:f2    DEAD
 128   Unknown Device          IoT           192.168.4.90    a0:4a:5e:2a:db:d2    DEAD
 129   Phone                   Phone         192.168.4.95    f2:ff:5d:9a:f6:63    STALE
 130   Phone                   Phone         192.168.4.99    2e:24:91:6a:af:a3    ONLINE

────── GPIO CONTROLLERS (141-155) ──────

 141   Alice gpiochip0         GPIO          Alice                   ONLINE
 142   Alice gpiochip1         GPIO          Alice                   ONLINE
 143   Cecilia gpiochip0       GPIO          Cecilia                 ONLINE
 144   Cecilia gpiochip4       GPIO          Cecilia                 ONLINE
 145   Cecilia gpiochip10-13   GPIO (4)      Cecilia                 ONLINE
 146   Octavia gpiochip0       GPIO          Octavia                 ONLINE
 147   Octavia gpiochip4       GPIO          Octavia                 ONLINE
 148   Octavia gpiochip10-13   GPIO (4)      Octavia                 ONLINE
 149   Aria gpiochip0          GPIO          Aria                    OFFLINE
 150   Aria gpiochip4          GPIO          Aria                    OFFLINE
 151   Aria gpiochip10-13      GPIO (4)      Aria                    OFFLINE
 152   Lucidia gpiochip0       GPIO          Lucidia                 ONLINE
 153   Lucidia gpiochip4       GPIO          Lucidia                 ONLINE
 154   Lucidia gpiochip10-13   GPIO (4)      Lucidia                 ONLINE

────── SERIAL PORTS (161-170) ──────

 161   Alice ttyAMA0           Serial        Alice                   ONLINE
 162   Alice ttyS0             Serial        Alice                   ONLINE
 163   Cecilia ttyAMA0         Serial        Cecilia                 ONLINE
 164   Cecilia ttyAMA10        Serial        Cecilia                 ONLINE
 165   Cecilia ttyUSB0         Serial USB    Cecilia (CP2102)        ONLINE (SILENT)
 166   Octavia ttyAMA0         Serial        Octavia                 ONLINE
 167   Octavia ttyAMA10        Serial        Octavia                 ONLINE
 168   Lucidia ttyAMA0         Serial        Lucidia                 ONLINE
 169   Lucidia ttyAMA10        Serial        Lucidia                 ONLINE

────── PIRONMAN5 CASES (171-175) ──────

 171   Octavia Pironman5       Case/OLED     Octavia :34001          ONLINE (I2C 0x3c)
 172   Aria Pironman5          Case/OLED     Aria :34001             OFFLINE
 173   Lucidia Pironman5       Case/OLED     Lucidia :34001          ONLINE
 174   Cecilia Pironman5       Case/OLED     Cecilia :34001          ONLINE

────── OLLAMA MODELS (176-199 — logical devices) ──────

 176   Cecilia Ollama          AI Runtime    :11434 (13 models)      ONLINE
       cece, cece2, qwen3:8b, llama3:8b, codellama:7b,
       OpenELM-1B/3B, deepseek-coder:1.3b, qwen2.5-coder:3b,
       llama3.2:1b/3b, tinyllama

 177   Octavia Ollama          AI Runtime    :11434 (9 models)       ONLINE
       codellama:7b, apple-openelm-1B/3B, phi3.5, gemma2:2b,
       llama3.2:1b/3b, qwen2.5:1.5b, tinyllama

 178   Lucidia Ollama          AI Runtime    :11434 (6 models)       ONLINE ⚠️ HOT
       lucidia:8b (LOADED, 265% CPU!), qwen2.5:3b,
       nomic-embed-text, llama3.2:1b, tinyllama, qwen2.5:1.5b

 179   Anastasia Ollama        AI Runtime    :11434 (TS only)        ONLINE

────── TAILSCALE GHOST NODES (181-185) ──────

 181   codex-infinity          Tailscale     100.108.132.8           OFFLINE 15d
       Registered to amundsonalexa@ | linux | Unknown physical host

 182   shellfish               Tailscale     100.94.33.37            OFFLINE 15d
       Registered to amundsonalexa@ | linux | Unknown physical host

 183   lucidia-operator        Tailscale     100.91.90.68            OFFLINE 33d
       Registered to amundsonalexa@ | macOS | Stale — likely old Mac config

 184   alice (TS)              Tailscale     100.77.210.18           OFFLINE 15d
       Should be Alice Pi — Tailscale not running on Alice

 185   aria (TS)               Tailscale     100.109.14.17           OFFLINE 15d
       Should be Aria Pi — node is down

────── RESERVED (200-255) ──────

 200-254  (reserved for future / dynamic DHCP)
 255      Broadcast             192.168.4.255   ff:ff:ff:ff:ff:ff


═══════════════════════════════════════════════════════════════════════════════════
                         FLEET SUMMARY
═══════════════════════════════════════════════════════════════════════════════════

  Total Registered:     ~125 devices (IDs 1-199 allocated)
  ONLINE:               ~80
  OFFLINE/MISSING:      ~25
  DEGRADED:             2 (SuperDrive, Gematria)
  STALE:                5

  ┌───────────────────────────────────────────────────────────────────┐
  │  NODE          KERNEL          TEMP    RAM     DISK    LOAD      │
  ├───────────────────────────────────────────────────────────────────┤
  │  Alice         6.1.21 ⚠️OLD    40°C   443M/4G  77%    2.44      │
  │  Cecilia       6.12.62         40°C   1.3G/8G  17%    0.99      │
  │  Octavia       6.12.62         36°C   1.2G/8G  66%    0.40      │
  │  Aria          —               —      —        96%⚠️  —         │
  │  Lucidia       6.12.62         60°C✅ 3.9G/8G  41%    <1.0      │
  │  Anastasia     5.14.0          —      411M/765M 67%   0.02      │
  └───────────────────────────────────────────────────────────────────┘

  Enabled Services:     42 (Alice) + 44 (Cecilia) + 39 (Octavia) + 62 (Lucidia) + 28 (Anastasia) = 215 total
  Docker Containers:    0 (Alice) + 0 (Cecilia) + 4 (Octavia Swarm) + 11 (Lucidia) + 0 (Anastasia) = 15
  Docker Images:        0 (Alice) + 0 (Cecilia) + 11 (Octavia=11.2GB) + 14 (Lucidia=3.3GB) = 25 images
  Ollama Models:        15 + 9 + 6 + ? = 30+ across fleet
  Ollama Storage:       22GB (Cecilia) + 15GB (Octavia) + 20GB (Lucidia) = 57GB fleet
  GitHub Actions:       4 runners (Alice, Octavia, Lucidia x2)
  TCP Ports Open:       25 + 28 + 22 + 52 = 127 fleet-wide (198 with UDP)
  Port Map:             ~/roadnet/PORT-MAP.md (every port identified)
  WireGuard Peers:      5 active (alice, cecilia, octavia, gematria) + 1 stale (aria)
  Tailscale Nodes:      2 active (lucidia, alexandria) + 7 offline
  Swap Total:           2G (Cecilia) + 2G (Octavia) + 8.5G (Lucidia) = 12.5GB fleet
  Packages:             1926 (Alice) + 2197 (Cecilia) + 2290 (Octavia) + 2208 (Lucidia) = 8621
  Python Packages:      ? (Alice) + 408 (Cecilia) + 318 (Octavia) + 339 (Lucidia) = 1065+
  Git Repos:            4 (Alice) + 30+ (Cecilia) + 4 (Octavia) + 10 (Lucidia) = 48+
  All nodes have: /dev/watchdog0, /dev/rtc0, NTP synced, Docker v29.2.1
  All Pi 5s have: DRM card0+card1+renderD128, conservative governor (optimized)

  Connection Topology (who talks to who):
    Alice → Mac (.28), Lucidia (.38:22 SSH)
    Cecilia → Mac (.28), Google Drive (IPv6 rclone)
    Octavia → Mac (.28), GitHub Actions (20.85.130.105), Cloudflare
    Lucidia → Mac (.28), Alice (.49:44090), GitHub Actions, Cloudflare
  CPU speeds: Alice 1.8GHz, Cecilia 2.4GHz, Octavia 2.6GHz, Lucidia 2.4GHz
  NVMe: Cecilia + Octavia (both Micron/Crucial 5427 behind ASM1182e switch)
  Undervoltage: Cecilia (9+ events) + Octavia (5+ events) — BOTH Hailo nodes!

  ⚠️ ALERTS (Layer 3 Deep Scan):
  - Lucidia (#16) Ollama runner RESPAWNED at 250% CPU / 2.1GB RAM — needs permanent fix
  - Lucidia SD card: dmesg "mmc0: Card stuck being busy!" — SD degradation warning!
  - Lucidia DNS = Tailscale MagicDNS ONLY (100.100.100.100) — no fallback!
  - Lucidia fail2ban FAILED — no intrusion protection despite UFW
  - Lucidia certbot FAILED — no valid SSL certs
  - Lucidia cmdline has cgroup params duplicated 4x — messy config.txt
  - Cecilia ALSO has undervoltage! (9+ dmesg events — both Pi 5s with Hailo!)
  - Cecilia now has 4 rclone instances (was 3!) — growing problem
  - Cecilia vcgencmd broken (needs: sudo mknod /dev/vcio c 100 0)
  - Octavia throttle improved: 0x50000 (was 0x50005) but voltage 0.9923V (low)
  - Alice dmesg: brcmf_cfg80211_change_iface errors — WiFi/RoadNet AP conflict
  - Alice kernel 6.1.21 from 2023 — 3 years old, needs update
  - Aria (#15) DOWN — not pingable, needs physical reboot
  - Aria SD (#31) at 96% — critical storage
  - Cecilia timezone Europe/London — wrong, should be US
  - Cecilia obfuscated /tmp/op.py cron ✅ REMOVED (was dropper pattern: exec from /tmp)
  - Octavia pi user has 52 SSH keys — audit needed
  - SuperDrive (#42) — USB over-current on Pi 5
  - btc-compose.service = "Bitcoin Core + EPS" (failed docker compose)
  - Failed logins on Lucidia: blikvm, admin, kvmd attempted from Mac
  - Tailscale ghosts: codex-infinity, shellfish, lucidia-operator (offline)
  - Octavia Ollama: qwen manifest corrupted (EOF), /api/chat returning 500s (2min timeouts)
  - Octavia/Lucidia CF tunnel hostnames SWAPPED (octavia routes serve lucidia, vice versa)
  - Cecilia dnsmasq crash loop: --bind-interfaces vs --bind-dynamic config conflict
  - Lucidia swap usage growing: 1.3GB/8.5GB (was 437MB earlier in session)
  - Lucidia llama.service: ConditionPathExists on /home/pi/models/model.gguf
  - Alice iowait 15.32% on SD card — I/O bottleneck
  - Lucidia has 14 skeleton Python microservices (:5000-:6300) wasting ~280MB RAM
  - Lucidia Java HelloWorld on :8888 — test service left running
  - Lucidia simpleweb Flask on :5000 — test service left running
  - Octavia OctoPrint broadcasts mDNS on ALL 7 interfaces (Docker bridge leak)
  - Alice Ollama is SSH-tunneled (:11434 → remote), not local
  - Octavia STILL getting undervoltage after OC removal — PSU is the problem, needs 5V/5A
  - Cecilia rpi-connect-wayvnc crash loop ✅ FIXED (masked both system + user service)
  - Cecilia has Wolfram Engine 14.3 installed (4.9GB!)
  - Cecilia has Bitcoin blockchain sync (6.2GB in alexandria-sync/.bitcoin-main)
  - Cecilia Ollama now has 15 models (added deepseek-r1:1.5b + nomic-embed-text post-reboot)
  - Cecilia PostgreSQL: empty (no user DBs, just templates)
  - Alice PostgreSQL "blackroad" DB exists but has 0 tables
  - Alice Qdrant: 0 collections (vector DB installed but unused)
  - Alice Redis: 1 key in db0 (basically empty)
  - Lucidia PostgreSQL: "operator" DB owned by pi
  - Lucidia has 334 static apps in /var/www/blackroad/
  - Lucidia /home/blackroad = 33GB (19GB runners, 4.4GB models, 2GB blackroad)
  - Lucidia Docker stats: PowerDNS Admin 193MB, edge-agent 30MB, auth-gateway 22MB
  - Lucidia 14 microservices (:5100-:6300) are HTML dashboard apps, not APIs
  - Octavia Gitea: 207 repos across 7 orgs, 26 EMPTY repos (all in blackroad-os/roadchain)
    blackroad-os: 127 repos (61MB, 20 empty) | lucidia: 14 (18MB, 1 empty)
    platform: 29 (7MB) | roadchain: 21 (1.2MB, 4 empty) | infrastructure: 8 (1MB, 1 empty)
    tools: 5 (0.6MB) | agents: 3 (0.4MB)
    Largest: blackroad-operator 48MB, lucidia-metaverse 16MB
    All updated 2026-03-09 (github-relay keeps them synced)
  - Octavia NVMe Claude Time: config/ 2.1GB + time/ 800MB = 2.9GB
  - Octavia InfluxDB: _internal + pironman5 (fan/temp data)
  - All nodes InfluxDB: only pironman5 DB (identical)
  - Lucidia 2 cloudflared instances: ports 20241 + 20242
  - Lucidia SSL cert EXPIRED: blackroad.io expired 2025-10-04 (5 months ago!)
    Cert was issued with manual DNS-01 challenge — can't auto-renew
    python3-certbot-dns-cloudflare installed but NOT configured (cloudflare.ini is wrong)
    LOW PRIORITY: Cloudflare tunnels handle TLS termination, nginx has no SSL listeners
  - Cecilia github-relay.sh has HARDCODED Gitea creds (blackroad:BlackRoad2026OS)
  - Cecilia github-relay.sh still points to Octavia .97 (now .100) — relay broken
  - PUSH_SECRET exposed in plaintext crontabs on Alice, Cecilia, Octavia
  - Lucidia has 21 GitHub Actions runner dirs (19GB!) — blackroad + pi users both running
  - Octavia blackroad user has autonomy scripts (heartbeat 1m + heal 5m cron)
  - Cecilia autonomy scripts: same heartbeat+heal pattern, checks stats-proxy+ollama
  - Alice has task_watchdog.py (Python, monitors Redis worker heartbeats)
  - Alice /opt/prism/ is EMPTY (git repo with no files, prism-pull timer pulls nothing)
  - Alice blackroad-watchdog.timer runs every 30s (task queue monitoring)

  🔒 SECURITY SUMMARY:
  ┌───────────────────────────────────────────────────────────────┐
  │  NODE       USERS  SSH_KEYS  NOPASSWD_SUDO   FIREWALL       │
  ├───────────────────────────────────────────────────────────────┤
  │  Alice      6      53(pi)    alice,pi        nftables NAT   │
  │  Cecilia    5      2(br)     cecilia,br      nftables NAT   │
  │  Octavia    5      52(pi)⚠️  pi(default)     nftables NAT   │
  │  Lucidia    9      15(oct)   pi,octavia      UFW+nftables   │
  │  Anastasia  ?      ?         ?               ?              │
  └───────────────────────────────────────────────────────────────┘
  Notes: Lucidia is ONLY node with UFW (INPUT DROP policy)
         Alice+Octavia have 50+ SSH keys on pi user — audit needed
         Same PUSH_SECRET used across multiple nodes in plaintext crontabs
         Cecilia github-relay.sh has hardcoded Gitea creds (blackroad:BlackRoad2026OS)
         ✅ Obfuscated cron on Cecilia REMOVED (was exec from /tmp dropper pattern)
         ✅ Cecilia rpi-connect-wayvnc crash loop MASKED
         ⚠️ Lucidia SSL cert expired Oct 2025 (renewal in progress)

  ✅ FIXED THIS SESSION:
  - Octavia Hailo-8 (#22) — copied module+firmware from Cecilia, /dev/hailo0 now LIVE
  - Lucidia temp — killed runaway Ollama runner (72°C → 66°C, now back to 74°C)
  - Identified all LAN devices: eero router, Apple TV, Roku Stick, AltoBeam chip
  - .53 and .90 confirmed DEAD (removed from active inventory)
  - Cecilia timezone fixed: Europe/London → America/Chicago
  - Cecilia dnsmasq fixed: bind-interfaces→bind-dynamic + listen-address→192.168.4.96 (NOW RUNNING)
  - Cecilia vcgencmd fixed (sudo mknod /dev/vcio c 100 0)
  - Mapped all 4 Cloudflare tunnel configs (Cecilia=22 hostnames, Octavia=10, Lucidia=4)
  - Discovered Octavia/Lucidia tunnel hostname swap (lucidia routes on Octavia, vice versa)
  - Cataloged all Docker images: 25 across fleet (Octavia 11.2GB, Lucidia 3.3GB)
  - Found Octavia Ollama qwen manifest corruption + 500 errors on /api/chat
  - Found Lucidia llama.service (llama.cpp server :8080) + lucidia.service (FastAPI :8000)
  - Mapped Lucidia /var/www: 335 blackroad-* apps via nginx wildcard multi-site config
  - Found Hailo kernel params identical on both nodes: force_desc_page_size=4096, support_soft_reset=Y
  - Lucidia overheating FIXED: killed world-engine.py (alexa user service calling Ollama), disabled blackroad-world.service, 73.8°C → 57.9°C
  - Octavia qwen manifest cleaned (already removed, remnant dir cleared)
  - Found leaked GitHub PAT in Lucidia's alexa user blackroad-git-worker.service (gho_Gfu...)
  - Found Lucidia alexa has 4 user services: blackroad-status, blackroad-api, blackroad-git-worker, blackroad-world (disabled)
  - Tunnel hostname swap confirmed INTENTIONAL — routing is correct despite name confusion

  ⚡ POWER OPTIMIZATION (applied to all 4 nodes):
  - CPU governor: ondemand → conservative (all nodes) — slower ramp = less power spikes
  - Octavia: REMOVED overclock (over_voltage=6 + arm_freq=2600) + gpu_mem 256→16
  - Cecilia: CPU capped 2.4GHz → 2.0GHz (Hailo headroom) + gpu_mem=16
  - Octavia: CPU capped 2.6GHz → 2.0GHz (Hailo headroom) + gpu_mem=16
  - vm.swappiness: 60 → 10 (all nodes) — reduces SD writes
  - vm.dirty_ratio/background: tuned for batch writes (less I/O thrashing)
  - Disabled unused services: lightdm, cups, cups-browsed, rpcbind, nfs-blkmap
  - WiFi power management enabled (saves ~40mA per node)
  - Power monitor deployed: /opt/blackroad/power-monitor.sh (cron */5)
  - vcgencmd persistent fix: udev rule on Cecilia for /dev/vcio
  - Leaked GitHub PAT removed from Lucidia blackroad-git-worker.service (was full repo+delete scope!)
  - blackroad-git-worker.service disabled on Lucidia
  - Cecilia rpi-connect-wayvnc crash loop FIXED (masked system + user service)
  - Cecilia obfuscated /tmp/op.py cron REMOVED (dropper pattern executing from /tmp)
  - Lucidia SSL cert renewal attempted (failed — needs Cloudflare DNS plugin config, LOW PRIORITY)
  - Lucidia 16 skeleton microservices DISABLED (alert-manager, analytics, backup, compression,
    connection-pool, fleet-monitor, grafana, load-balancer, log-aggregator, metrics,
    monitor-api, notifications, perf-cache, resource-optimizer, tts-api, blackroad-web)
    ~350MB RAM freed, 16 fewer Python processes
  - Lucidia Java HelloWorld + simpleweb DISABLED
  - Cecilia github-relay.sh: IP fixed .97→.100, creds moved to ~/.github-relay.env (chmod 600)
  - PUSH_SECRET removed from plaintext crontabs on Alice+Cecilia+Octavia, moved to /opt/blackroad/stats-push.env
  - Gitea: 207 repos analyzed — 181 active, 26 empty (mostly blackroad-os placeholders)
  - ⚠️ xmrig.service reference found on Lucidia (crypto miner unit — file gone but was configured)

═══════════════════════════════════════════════════════════════════════════════════
                    ID ALLOCATION PLAN
═══════════════════════════════════════════════════════════════════════════════════

    1-10     Core infrastructure (router, cloud VPS)
   11-20     Compute nodes (Pis, Mac, future nodes)
   21-25     AI accelerators (Hailo-8, future TPU/GPU)
   26-35     Storage devices (NVMe, SD, VPS disks)
   36-50     USB peripherals (keyboards, mice, drives, serial)
   51-55     Network peripherals (KVM, MCU)
   56-65     I2C / SPI devices and buses
   66-70     Bluetooth radios
   71-85     Physical network interfaces (WiFi, Ethernet)
   86-110    Virtual network interfaces (RoadNet AP, WG, Docker, Tailscale)
  111-120    Cloudflare tunnels
  121-140    LAN devices (non-BlackRoad)
  141-160    GPIO controllers
  161-170    Serial ports
  171-175    Pironman5 cases
  176-180    AI runtimes / Ollama instances
  181-185    Tailscale ghost nodes
  186-199    Reserved (future AI/TS)
  200-254    Reserved (dynamic/DHCP/future)
  255        Broadcast
```
