# Fleet Nodes

> 7 nodes. 52 TOPS. $38/month. Replaces $500+/month in cloud services.

## Raspberry Pis (5 Nodes)

| Node | Name | Role | Key Services |
|------|------|------|-------------|
| Node-1 | Lucidia | Core Intelligence | DNS (PowerDNS), Memory System, RoadTrip Hub (:8094) |
| Node-3 | Alice | AI Compute | Ollama (LLM inference), Hailo-8 (26 TOPS), fine-tuning |
| Node-4 | Cecilia | Storage & Governance | MinIO (object storage), Fleet Health, Pi-hole |
| Node-5 | Octavia | Git & Code | Gitea (273 repos), RoadCode platform |
| Node-6 | Aria | Creative & Performance | Audio pipeline, AeroBand, generative audio |

## DigitalOcean Droplets (2 Nodes)

| Node | Name | Role |
|------|------|------|
| Cloud-1 | Gematria | Analytics, search, public-facing APIs |
| Cloud-2 | Anastasia | Backup, disaster recovery, geographic redundancy |

## Hardware Specifications

| Component | Detail |
|-----------|--------|
| Compute | 5x Raspberry Pi 5, Jetson Orin (GPU inference) |
| AI Accelerator | Hailo-8 -- 26 TOPS dedicated neural network inference |
| Total Compute | 52 TOPS across fleet |
| Storage | OSCOO 512GB NVMe, MinIO distributed object storage |
| Networking | WireGuard (12 tunnels), Headscale mesh, CF Tunnels (QUIC), Meshtastic LoRa |
| Wireless Mesh | NRF24L01+ (8+ modules), LoRa radios (3x), RS485/CAN bus |
| Sensors | LD2410C mmWave radar, Doppler radar, photodiodes, SparkFun ToF + spectral |
| Audio | Bone conduction exciter, 20 vibration motors |
| Location | GPS modules (2x), Si5351A clock generator |
| Microcontrollers | ESP32, ESP32-S3 (5x), RPi Pico (2x), ATTINY88 (3x), Sipeed RISC-V M1s |
| Robots | Freenove hexapod, quadruped, robot dog |
| Power | 88.8Wh solar generator, 21W panel, 18650 batteries |

## Network Topology

```
Internet
  --> Cloudflare (500 Workers, DDoS, TLS, cache)
    --> CF Tunnel (QUIC, encrypted)
      --> Lucidia (DNS, memory, RoadTrip hub)
      --> Alice (Ollama, Hailo-8, inference)
      --> Cecilia (MinIO, monitoring, Pi-hole)
      --> Octavia (Gitea, RoadCode)
      --> Aria (creative, audio)
    --> WireGuard (12 tunnels)
      --> Gematria (DO droplet, analytics)
      --> Anastasia (DO droplet, backup)
    --> Meshtastic LoRa (off-grid mesh)
      --> 3 radios, 9 nodes, 34 connections
    --> Tailscale (management overlay)
      --> all nodes addressable
```

## What Replaces What

| Cloud Service | Monthly Cost | BlackRoad Equivalent | Runs On |
|--------------|-------------|---------------------|---------|
| OpenAI API | $20+ | Ollama + Hailo-8 | Alice |
| GitHub | $21/user | Gitea (273 repos) | Octavia |
| AWS S3 | $23/TB | MinIO | Cecilia |
| Route53 | $0.50/zone | PowerDNS | Lucidia |
| Tailscale | $5/user | WireGuard (12 tunnels) | All |
| ACM + ALB | $$$ | Caddy + Let's Encrypt | Gematria |
| CloudWatch | $$/mo | Fleet Heartbeat | Cecilia |
| Pinecone | $70/mo | Qdrant | RearView |

**Cloud equivalent: $500+/month. BlackRoad: $38/month.**
