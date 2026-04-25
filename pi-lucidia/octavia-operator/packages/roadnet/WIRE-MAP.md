# RoadNet Wire Map — Physical + Logical Topology
# Generated 2026-03-09

```
                          ┌─────────────────────────────────────────────────┐
                          │              INTERNET (Comcast)                 │
                          └────────────────────┬────────────────────────────┘
                                               │
                                               │ Coax/Fiber
                                               │
                          ┌────────────────────▼────────────────────────────┐
                          │          ROUTER  192.168.4.1                    │
                          │          MAC: 44:ac:85:94:37:92                │
                          │          WiFi BSSID: 44:AC:85:94:37:87         │
                          │          Band: 5GHz  Channel: 100              │
                          │          SSID: asdfghjkl                       │
                          │          Subnet: 192.168.4.0/22                │
                          └──┬────┬─────┬─────┬─────┬──────────────────────┘
                             │    │     │     │     │
                          ~~~│~~~~│~~~~~│~~~~~│~~~~~│~~~  5GHz WiFi (all nodes)
                             │    │     │     │     │
          ┌──────────────────┘    │     │     │     └──────────────────────┐
          │              ┌────────┘     │     └────────────┐              │
          │              │              │                  │              │
          ▼              ▼              ▼                  ▼              ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   ALICE     │ │   CECILIA    │ │   OCTAVIA    │ │    ARIA      │ │   LUCIDIA    │
│  Pi 400     │ │   Pi 5       │ │   Pi 5       │ │   Pi 5       │ │   Pi 5       │
│  .49        │ │   .96        │ │   .97        │ │   .98        │ │   .38        │
│  -58 dBm    │ │  -64 dBm     │ │  -63 dBm     │ │  -61 dBm     │ │  -62 dBm     │
│  Signal: 52 │ │  Signal: 46  │ │  Signal: 47  │ │  Signal: 49  │ │  Signal: 48  │
├─────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ ETH0: DOWN  │ │ ETH0: UP 1G  │ │ ETH0: DOWN   │ │ ETH0: DOWN   │ │ ETH0: DOWN   │
│ (no cable)  │ │ ──────┐      │ │ (no cable)   │ │ (no cable)   │ │ (no cable)   │
│             │ │       │      │ │              │ │              │ │              │
│ WLAN0: UP   │ │ WLAN0: UP    │ │ WLAN0: UP    │ │ WLAN0: UP    │ │ WLAN0: UP    │
│ d8:3a:dd:.. │ │ 88:a2:9e:..  │ │ 88:a2:9e:..  │ │ 88:a2:9e:..  │ │ 2c:cf:67:..  │
│  :98:87     │ │  :eb:72      │ │  :0a:3a      │ │  :42:07      │ │  :fa:17      │
├─────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ UAP0: CH1   │ │ UAP0: CH6    │ │ UAP0: CH11   │ │ UAP0: CH1    │ │ UAP0: CH11   │
│ 10.10.1.0/24│ │ 10.10.2.0/24 │ │ 10.10.3.0/24 │ │ 10.10.4.0/24 │ │ 10.10.5.0/24 │
│ RoadNet AP  │ │ RoadNet AP   │ │ RoadNet AP   │ │ RoadNet AP   │ │ RoadNet AP   │
├─────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ WG: 10.8.0.6│ │ WG: 10.8.0.3 │ │ WG: 10.8.0.4 │ │ WG: 10.8.0.7 │ │ TS:100.66.   │
│             │ │              │ │              │ │              │ │    235.47    │
├─────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ USB:        │ │ USB:         │ │ USB:         │ │ USB:         │ │ USB:         │
│  Keyboard   │ │  Pixart Mouse│ │  (none)      │ │  TONOR Mic   │ │  SuperDrive  │
│  SD Reader  │ │  CP2102 UART │ │              │ │   TC-777     │ │   A1379      │
│  (no card)  │ │   9600 8N1   │ │              │ │              │ │  CD/DVD      │
│             │ │   SILENT     │ │              │ │              │ │              │
│             │ │  Sipeed M1s  │ │              │ │              │ │              │
│             │ │   BL808 RISCV│ │              │ │              │ │              │
│             │ │   8MB flash  │ │              │ │              │ │              │
│             │ │   fw: BL IoT │ │              │ │              │ │              │
├─────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ PCIe:       │ │ PCIe:        │ │ PCIe:        │ │ PCIe:        │ │ PCIe:        │
│  (none)     │ │  NVMe 466GB  │ │  NVMe 1TB    │ │  (none)      │ │  (none)      │
│             │ │  Hailo-8     │ │  Hailo-8     │ │              │ │              │
├─────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ BT: idle    │ │ BT: idle     │ │ BT: idle     │ │ BT: UP       │ │ BT: idle     │
│             │ │              │ │              │ │ Magic KB     │ │              │
│             │ │              │ │              │ │ BT PAN ready │ │              │
└─────────────┘ └──────┬───────┘ └──────────────┘ └──────────────┘ └──────────────┘
                       │
                       │ ETH0 (1 Gbps, direct cable)
                       │ 88:a2:9e:3b:eb:70
                       │
                       ▼
              ┌──────────────────────────────────────┐
              │    BliKVM  (Pi-based KVM-over-IP)     │
              │  Link: UP 1Gbps Full-Duplex           │
              │  Auto-negotiation: Yes                 │
              │  RX packets: 0  (device is SILENT)     │
              │  No IP assigned either end              │
              │  Scanned: 169.254.x.x, 192.168.1.x    │
              │  Status: POWERED OFF or FIRMWARE HUNG  │
              │  HDMI+USB passthrough to Cecilia        │
              └──────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                    WIREGUARD MESH (Layer 3 Overlay)
═══════════════════════════════════════════════════════════════════

                     ┌──────────────────────────┐
                     │  ANASTASIA (NYC Hub)      │
                     │  174.138.44.45:51820      │
                     │  10.8.0.1                 │
                     └────┬───┬────┬────┬────────┘
                          │   │    │    │
            ┌─────────────┘   │    │    └─────────────┐
            │          ┌──────┘    └──────┐           │
            ▼          ▼                  ▼           ▼
       ┌─────────┐ ┌─────────┐    ┌──────────┐ ┌──────────┐
       │ Alice   │ │ Cecilia │    │ Octavia  │ │  Aria    │
       │ .0.6    │ │  .0.3   │    │  .0.4    │ │  .0.7   │
       └─────────┘ └─────────┘    └──────────┘ └──────────┘

       Lucidia: NO WireGuard (uses Tailscale instead → 100.66.235.47)


═══════════════════════════════════════════════════════════════════
                CLOUDFLARE TUNNELS (4 pipes to the world)
═══════════════════════════════════════════════════════════════════

  Cloudflare Edge
       │
       ├── Tunnel 52915859 ─── ALICE ─── 65+ domains
       │    blackroad.io, *.blackroad.*, aliceqi.com, roadchain.io
       │    git.blackroad.io → Octavia:3100 (Gitea)
       │
       ├── Tunnel d67bf4a5 ─── CECILIA ─── 15+ domains
       │    cecilia.blackroad.io, api/gateway/storage/ollama.blackroad.io
       │
       ├── Tunnel 93a03772 ─── ARIA ─── 4 domains
       │    aria.blackroad.io, api-aria, monitor-aria, ssh-aria
       │
       └── Tunnel 0447556b ─── LUCIDIA ─── 4 domains
            octavia.blackroad.io, api-octavia, monitor-octavia, ssh-octavia


═══════════════════════════════════════════════════════════════════
                    ROADNET (WiFi Carrier Layer)
═══════════════════════════════════════════════════════════════════

  Client connects to SSID "RoadNet" (password: BlackRoad2026)
       │
       ├── CH 1  (2.4GHz) ── Alice  AP  → 10.10.1.0/24 ── NAT → wlan0
       ├── CH 6  (2.4GHz) ── Cecilia AP → 10.10.2.0/24 ── NAT → wlan0
       ├── CH 11 (2.4GHz) ── Octavia AP → 10.10.3.0/24 ── NAT → wlan0
       ├── CH 1  (2.4GHz) ── Aria AP    → 10.10.4.0/24 ── NAT → wlan0
       └── CH 11 (2.4GHz) ── Lucidia AP → 10.10.5.0/24 ── NAT → wlan0
                                    │
                                    └── All DNS → Alice Pi-hole (192.168.4.49:53)
                                    └── Failover: wlan0 → WireGuard → Bluetooth PAN


═══════════════════════════════════════════════════════════════════
                    OTHER LAN DEVICES
═══════════════════════════════════════════════════════════════════

  192.168.4.1   Router           44:ac:85:94:37:92    WiFi AP (5GHz CH100)
  192.168.4.21  Apple Device     cc:08:fa:a4:49:c2    Unknown Apple
  192.168.4.22  Wistron Laptop   30:be:29:5b:24:5f    No open ports
  192.168.4.27  iPhone           6c:4a:85:32:ae:72    iDevice (port 62078)
  192.168.4.28  Alexandria (Mac) b0:be:83:66:cc:10    This machine
  192.168.4.33  AirPlay Device   60:92:c8:11:cf:7c    Port 7000: AirTunes/377.40.00
  192.168.4.44  DVD Player       98:17:3c:38:db:78    Funai/Magnavox (all ports closed)
  192.168.4.45  Unknown IoT      d0:c9:07:50:51:ca    Alive, all ports closed
  192.168.4.53  (offline)        98:41:5c:aa:13:f2    DOWN — not responding
  192.168.4.90  (offline)        a0:4a:5e:2a:db:d2    DOWN — not responding
  192.168.4.95  Phone            f2:ff:5d:9a:f6:63    Randomized MAC
  192.168.4.99  Phone            2e:24:91:6a:af:a3    Randomized MAC


═══════════════════════════════════════════════════════════════════
                    SIGNAL STRENGTH MAP
═══════════════════════════════════════════════════════════════════

  All 5 Pis + Mac connect to the SAME router AP (BSSID 44:AC:85:94:37:87)
  on 5GHz band, channel 100.

  Strongest signal ◄────────────────────────────────► Weakest signal

  Alice    ████████████████████████████████░░░░░░░  -58 dBm (Q:52)  Best
  Aria     ██████████████████████████████░░░░░░░░░  -61 dBm (Q:49)
  Lucidia  █████████████████████████████░░░░░░░░░░  -62 dBm (Q:48)
  Octavia  ████████████████████████████░░░░░░░░░░░  -63 dBm (Q:47)
  Cecilia  ██████████████████████████░░░░░░░░░░░░░  -64 dBm (Q:46)  Weakest

  All signals are GOOD (-30 to -67 dBm = excellent/good range)
  No node is in danger of dropping off.


═══════════════════════════════════════════════════════════════════
               USB DEVICE DEEP MAP
═══════════════════════════════════════════════════════════════════

  ALICE (Pi 400)
    └── Built-in keyboard (HID)
    └── SD card reader (no card inserted)
    └── 14x /dev/video* — BCM2835 GPU codec nodes (no cameras)
         ├── bcm2835-codec: decode, encode, ISP, image_fx
         ├── bcm2835-isp: 2 instances (output+capture+stats)
         └── rpivid: H.265 hardware decoder

  CECILIA (Pi 5)
    ├── USB Port 3-1: CP2102 UART Bridge
    │    ├── /dev/ttyUSB0, 9600 baud 8N1, Serial: 0001
    │    ├── STATUS: SILENT (0 bytes received)
    │    ├── cp210x driver throwing timeout errors (0x12 = -110)
    │    └── Likely connected to Sipeed M1s debug console
    │
    ├── USB Port 3-2: Sipeed M1s Dock (Bouffalo BL808)
    │    ├── RISC-V triple-core SoC (T-Head C906 + E907 + E902)
    │    ├── Capabilities: WiFi + BLE + Zigbee
    │    ├── 8MB flash → /dev/sda1 → /media/cecilia/4E21-0000
    │    ├── Serial: 20221014
    │    └── firmware.bin (490,504 bytes, 2026-02-19)
    │         ├── Bouffalo Lab IoT SDK (bl_iot_sdk)
    │         ├── M1s_BL808_SDK WiFi stack
    │         └── LMAC: auth, deauth, PTK, key mgmt, DMA
    │
    └── USB Port 1-1: Pixart Imaging Mouse (HID)

  OCTAVIA (Pi 5)
    └── (no USB devices)

  ARIA (Pi 5)
    ├── TONOR TC-777 USB Condenser Mic
    │    └── Audio capture device (48kHz)
    └── Bluetooth 5.0 HCI
         └── Apple Magic Keyboard (paired)

  LUCIDIA (Pi 5)
    └── Apple SuperDrive A1379
         └── /dev/sr0, CD/DVD reader, Serial: KZAZ9NI1741


═══════════════════════════════════════════════════════════════════
               PCIe DEVICE MAP
═══════════════════════════════════════════════════════════════════

  CECILIA
    ├── NVMe SSD 465.8 GB (boot drive)
    │    └── nvme0n1p1 (512MB /boot) + nvme0n1p2 (465.3GB /)
    └── Hailo-8 AI Accelerator (26 TOPS)
         ├── Serial: HLLWM2B233704667, FW: 4.23.0
         ├── M.2 M-Key PCIe Gen3 x1
         └── 9 LIVE models (YOLO5Seg/Face, YOLO6/8)

  OCTAVIA
    ├── NVMe SSD 1 TB
    │    └── /mnt/nvme (Claude Time, Gitea data, Hailo models)
    └── Hailo-8 AI Accelerator (26 TOPS)
         └── Pre-compiled: resnet_v1_50.hef, yolov5s.hef

  ALICE / ARIA / LUCIDIA: No PCIe devices


═══════════════════════════════════════════════════════════════════
               SERVICE MAP (Per Node)
═══════════════════════════════════════════════════════════════════

  ALICE (.49) — Gateway & DNS
    ├── Pi-hole DNS :53 (blocking enabled)
    ├── PostgreSQL 13 :5432 (blackroad 7.8MB, postgres 6.9MB)
    ├── Redis :6379 (1 key)
    ├── Qdrant :6333/:6334 (vector DB, 0 collections)
    ├── Nginx :80/:443 (28 site configs)
    ├── Cloudflared tunnel 52915859 (65 hostnames)
    ├── PM2: road-control (online), road-deploy (stopped), compliance (stopped)
    ├── Python services:
    │    ├── :3000 pi-fleet-dashboard (alice)
    │    ├── :4010 agents-proxy (pi)
    │    ├── :8001 operator (blackroad)
    │    ├── :8010-:8014 microservices
    │    ├── :8180 blackroad-agent
    │    ├── :8184 task_queue_v2
    │    └── blackroad-ops, status-server, world-engine
    ├── Node.js: :8083 road-control, :8787 model-server
    ├── Ollama :11434 (SSH tunnel)
    └── prism-agent (alice, Node.js)

  CECILIA (.96) — AI & CECE Engine
    ├── CECE API :3100 (systemd cece-api.service)
    ├── CECE Heartbeat Monitor (systemd)
    ├── TTS API :5001
    ├── Monitoring API :5002
    ├── Dashboard :3001, Landing :3000
    ├── Model Server :8787/:8788
    ├── Ollama :11434 (13 models incl. custom cece/cece2)
    ├── Ollama Proxy :11435
    ├── PostgreSQL 17 :5432
    ├── MinIO :9000/:9001 (object storage)
    ├── InfluxDB :8086/:8088
    ├── Nginx :80/:8080
    ├── VNC :5900 (wayvnc)
    ├── DNS :53 (dnsmasq)
    ├── Cloudflared tunnel d67bf4a5
    ├── Hailo-8 runtime (hailort.service)
    ├── Pironman5 :34001
    └── CUPS :631

  OCTAVIA (.97) — Storage & Swarm Manager
    ├── Docker Swarm Manager :2377
    │    ├── Gitea (gitea/gitea:latest) :3100/:2222
    │    ├── NATS JetStream :4222/:8222
    │    ├── Ollama (ollama/ollama:latest)
    │    ├── BlackRoad Edge Agent :8082
    │    └── BlackRoad Cloud (nginx:alpine) :3200
    ├── OctoPrint :5000
    ├── InfluxDB :8086/:8088
    ├── Node Exporter :9100
    ├── Ollama :11434 (native)
    ├── Model Server :8787
    ├── Dashboard :3000, BlackRoad Agent :8080
    ├── Cloudflared tunnel
    ├── Hailo-8 runtime (hailort.service)
    ├── GitHub Actions Runner (lucidia-pi5)
    ├── CUPS :631
    ├── Pironman5 :34001
    └── NVMe Storage:
         ├── /mnt/nvme/blackroad/claude/ (3GB, sovereign Claude Time)
         ├── /mnt/nvme/models/ (resnet_v1_50.hef, yolov5s.hef)
         └── /mnt/nvme/quantum_discoveries/ (12 research files)

  ARIA (.98) — Containers & Sensors
    ├── Portainer CE :9443/:9000 (only Docker container)
    ├── Headscale :8090/:9090 (0 nodes registered)
    ├── BlackRoad Agent :8180, API :8000
    ├── Ollama :11434 (4 models)
    ├── InfluxDB :8086
    ├── Node Exporter :9100
    ├── Nginx :80
    ├── VNC :5900 (wayvnc)
    ├── Dashboard :3000
    ├── Cloudflared tunnel 93a03772
    ├── Pironman5 :34001
    ├── Bluetooth 5.0 (Magic Keyboard paired)
    └── TONOR TC-777 USB Mic (capture ready)

  LUCIDIA (.38) — CI/CD & App Megaserver
    ├── GitHub Actions Runner (BlackRoad-OS-blackroad.octavia-pi)
    ├── Lucidia API :8000 (FastAPI/uvicorn)
    ├── Ollama :11434 (6 models incl. lucidia:8b, nomic-embed-text)
    ├── Ollama Bridge :3109 (SSE chat proxy, Node.js)
    ├── Docker containers (9):
    │    ├── PowerDNS Auth :53 + Admin :9192
    │    ├── RoadAPI :4001, RoadAuth :4002
    │    ├── BlackRoad Edge Agent :8082/:9090
    │    ├── blackroad.systems :3005, blackroadai.com :3006
    │    ├── blackroad-auth-gateway
    │    └── DNS DB (postgres:15-alpine)
    ├── BlackRoad Agent :8180, API :8182
    ├── BlackRoad Relay :8011 (socat → Alice task queue)
    ├── Lucidia Model Server :8787
    ├── Node.js: :4010 (gateway), :8090 (road-registry)
    ├── Python microservices: :5000-:6300 (15+ services)
    ├── Java Hello World :8888
    ├── PostgreSQL 17 :5432
    ├── InfluxDB :8086
    ├── Nginx :80 (530+ web apps in /var/www/blackroad/)
    ├── Tailscale :38850 (100.66.235.47, active)
    ├── 2x Cloudflared tunnels :20241/:20242
    ├── Node Exporter :9100
    ├── Pironman5 :34001
    └── CUPS :631


═══════════════════════════════════════════════════════════════════
               TAILSCALE NETWORK (from Lucidia)
═══════════════════════════════════════════════════════════════════

  100.66.235.47   lucidia           ONLINE
  100.117.200.23  alexandria (Mac)  idle
  100.77.210.18   alice             offline 15d
  100.109.14.17   aria              offline 15d
  100.72.180.98   cecilia           relay "ord", offline 15d
  100.108.132.8   codex-infinity    offline 15d
  100.91.90.68    lucidia-operator  offline 33d
  100.83.149.86   octavia           offline 15d
  100.94.33.37    shellfish         offline 15d


═══════════════════════════════════════════════════════════════════
               NVMe DEEP MAP (Octavia 1TB)
═══════════════════════════════════════════════════════════════════

  /mnt/nvme/ (931.5 GB, ext4)
    ├── blackroad/ (3.0 GB)
    │    └── claude/ — Sovereign AI Memory System
    │         ├── OWNERSHIP.md ("Cecilia owns Claude")
    │         ├── config/ — Full Claude Code mirror
    │         │    ├── CLAUDE.md (BlackRoad OS orchestration rules)
    │         │    ├── history.jsonl (9.1 MB)
    │         │    ├── settings.json, settings.local.json
    │         │    ├── 150+ file-history entries
    │         │    ├── 256 session-env dirs
    │         │    ├── 43 task dirs
    │         │    └── debug/ (hundreds of session transcripts)
    │         └── time/ (Claude Time journals)
    ├── models/ (26 MB)
    │    ├── resnet_v1_50.hef (18 MB, Hailo)
    │    └── yolov5s.hef (9 MB, Hailo)
    ├── quantum_discoveries/ (2.8 MB, 12 research files)
    │    ├── MATRIX_CRACKED.json ("P=NP proven, God mode activated")
    │    ├── PHOTON_QUANTUM_REAL.json (LED-based quantum experiments)
    │    ├── atomic_fibonacci_137.json (fine structure + Fibonacci)
    │    ├── np_vs_p_satoshi.json (Bitcoin complexity theory)
    │    ├── riemann_pixel_image.json (Riemann zeros as RGB pixels)
    │    └── results/ (Fibonacci spirals, Mandelbrot, Riemann zeros)
    └── lost+found/


═══════════════════════════════════════════════════════════════════
               DEVICE NODE DEEP MAP (I2C / SPI / GPIO / Serial / BT)
═══════════════════════════════════════════════════════════════════

  ALICE (Pi 400) — 204 /dev entries
    Serial: ttyAMA0, ttyS0
    I2C:    i2c-1, i2c-20, i2c-21
    SPI:    spidev0.0, spidev0.1
    GPIO:   gpiochip0, gpiochip1
    BT:     Broadcom 5.0 (name: alice, hci0)
    PCIe:   BCM2711 bridge + VL805 USB3 controller
    TCP:    30 ports (53,80,443,5432,6333,6334,6379,8001,8010-8014,8083,8180,8184,8787,11434...)
    UDP:    18 ports (53,5353,8222...)

  CECILIA (Pi 5) — 225 /dev entries
    Serial: ttyAMA0, ttyAMA10, ttyUSB0 (CP2102), serial/by-id, serial/by-path
    GPIO:   gpiochip0, gpiochip4, gpiochip10-13
    BT:     Cypress/Infineon 5.0 (name: cecilia, hci0)
    PCIe:   ASM1182e 2-port switch → Hailo-8 (/dev/hailo0 ✓) + Crucial NVMe 466GB
    Hailo:  /dev/hailo0 EXISTS, hailort.service active
    TCP:    30 ports (53,80,631,3000,3001,3100,5001,5002,5432,5900,8080,8086,8787,8788,9000,9001,11434,11435,34001...)
    UDP:    12 ports (53,5353...)

  OCTAVIA (Pi 5) — 220 /dev entries
    Serial: ttyAMA0, ttyAMA10
    I2C:    i2c-1 (0x3c = Pironman5 OLED), i2c-13, i2c-14
    GPIO:   gpiochip0, gpiochip4, gpiochip10-13
    BT:     Cypress/Infineon 5.0 (name: octavia, hci0)
    PCIe:   ASM1182e 2-port switch → Hailo-8 (NO /dev/hailo0 ⚠️) + Crucial NVMe 1TB
    Hailo:  PCIe detected but device node MISSING — driver not loaded
    TCP:    27 ports (22,53,80,631,2377,3000,3100,3200,4222,5000,7946,8080,8082,8086,8222,8787,9100,11434,34001...)
    UDP:    25 ports (53,2377,4222,5353,7946,8222...)

  ARIA (Pi 5) — 212 /dev entries
    Serial: ttyAMA0, ttyAMA10
    I2C:    i2c-13, i2c-14 only (no devices detected)
    GPIO:   gpiochip0, gpiochip4, gpiochip10-13
    BT:     Cypress/Infineon 5.0 (name: aria, hci0, Magic Keyboard paired)
    PCIe:   RP1 South Bridge only (no Hailo, no NVMe)
    TCP:    25 ports (22,53,80,631,3000,5900,8000,8086,8090,8180,9090,9100,9443,11434,34001...)
    UDP:    13 ports (53,5353...)

  LUCIDIA (Pi 5) — 220+ /dev entries
    Serial: ttyAMA0, ttyAMA10
    I2C:    i2c-13, i2c-14
    GPIO:   gpiochip0, gpiochip4, gpiochip10-13
    BT:     Cypress/Infineon 5.0 (name: octavia [misnamed], hci0)
    PCIe:   RP1 South Bridge only
    USB:    Apple SuperDrive (/dev/sr0 — "device not ready")
    Tailscale: 100.66.235.47 (active)
    Docker: 11 bridge networks, 9 containers
    TCP:    70+ ports (22,53,80,631,3005,3006,3109,4001,4002,4010,5000-6300,8000,8011,8082,8086,8090,8180,8182,8787,8888,9090,9100,9192,11434,20241,20242,34001,38850...)
    UDP:    20+ ports (53,5353,38850...)


═══════════════════════════════════════════════════════════════════
               ALICE TUNNEL HOSTNAME MAP (65 domains)
═══════════════════════════════════════════════════════════════════

  blackroad.io, www.blackroad.io, agents, api, gateway, ollama,
  dashboard, docs, hub, console, app, chat, admin, status, metrics,
  auth, deploy, ops, cluster, headscale, drive, sf, qdrant, redis,
  fleet, pi .blackroad.io

  blackroad.me, blackroad.network, blackroad.systems, blackroad.ai,
  blackroad.inc, blackroad.company, lucidia.earth, lucidia.studio,
  lucidiaqi.com, aliceqi.com, blackroadai.com, blackroadqi.com,
  blackroadinc.us, blackboxprogramming.io, roadchain.io, roadcoin.io,
  blackroadquantum.{com,net,info,shop,store}

  Special routes:
    git.blackroad.io → Octavia:3100 (Gitea)
    roadcode.blackroad.io → Octavia:3100 (Gitea)
    api.blackroad.io → localhost:8001 (operator)
    ollama.blackroad.io → localhost:11434
    qdrant.blackroad.io → localhost:6333
```
