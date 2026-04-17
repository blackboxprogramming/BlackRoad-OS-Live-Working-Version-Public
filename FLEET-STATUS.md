# BlackRoad Fleet Status

> **Last Updated:** 2026-04-17 02:15 CDT
> **Headscale Mesh:** headscale.blackroad.io:8000 (Alice)
> **Mesh Subnet:** 100.64.0.0/10

## Compute Nodes (9 total)

### Raspberry Pi Fleet (7 nodes)

| Node | LAN IP | Mesh IP | MAC | OS | RAM | Disk | Status |
|------|--------|---------|-----|-----|-----|------|--------|
| **Alice** | 192.168.4.49 | 100.64.0.3 | d8:3a:dd:ff:98:87 | Debian Bookworm (arm64) | — | — | Online, Mesh Node 3 |
| **Aria** | 192.168.4.98 | 100.64.0.1 | 88:a2:9e:0d:42:07 | Debian Bookworm (aarch64) | 8GB | 29GB (87% full) | Online, Mesh Node 1 |
| **Cecilia** | 192.168.4.113 | 100.64.0.2 | 88:a2:9e:3b:eb:72 | Debian Bookworm (aarch64) | — | — | Online, Mesh Node 2 |
| **Gaia** | 192.168.4.112 | 100.64.0.4 | 88:a2:9e:37:c1:b1 | Debian Bookworm | — | — | Online, Mesh Node 4 |
| **Lucidia** | 192.168.4.38 | Pending | 2c:cf:67:cf:fa:17 | Debian Bookworm (aarch64) | 8GB | 235GB (37% used) | Online, Mesh Pending |
| **Octavia** | 192.168.4.101 | — | — | — | — | — | Offline |
| **Olympia** | 192.168.4.111 | — | — | — | — | — | Offline (inside Hexabug robot) |

### x86_64 Servers (2 nodes)

| Node | Location | OS | Uptime | Status |
|------|----------|-----|--------|--------|
| **Gematria** | Remote | Ubuntu 22.04 (x86_64) | 95 days | Online (GitHub Runner) |
| **Anastasia** | Remote | RHEL/Rocky 9 (x86_64) | 110 days | Online (GitHub Runner) |

### Workstation

| Node | LAN IP | MAC | Role |
|------|--------|-----|------|
| **Alexandria** | 192.168.4.28 | b0:be:83:66:cc:10 | macOS workstation (primary) |

## Roles

| Node | Primary Role |
|------|-------------|
| Alice | Edge router, nginx (20 domains), Headscale control plane |
| Aria | Compute node (Pi 5, 8GB) |
| Cecilia | Gitea, MinIO (CDN/S3), Hailo-8, Ollama |
| Gaia | KVM, ustreamer |
| Lucidia | Compute node (Pi 5, 8GB, 235GB storage) |
| Octavia | Compute node (offline) |
| Olympia | Hexabug robot controller (offline) |
| Gematria | GitHub Actions self-hosted runner (x64) |
| Anastasia | GitHub Actions self-hosted runner (x64) |

## Headscale Mesh

| ID | Hostname | Mesh IP | User | Connected |
|----|----------|---------|------|-----------|
| 1 | aria | 100.64.0.1 | blackroad | Yes |
| 2 | cecilia | 100.64.0.2 | blackroad | Yes |
| 3 | alice | 100.64.0.3 | blackroad | Yes |
| 4 | gaia | 100.64.0.4 | blackroad | Yes |

## Unidentified Network Devices

| IP | MAC | Likely Identity |
|----|-----|----------------|
| .1 | 44:ac:85:94:37:92 | Router/Gateway |
| .22 | 30:be:29:5b:24:5f | Unknown |
| .27 | 6c:4a:85:32:ae:72 | Unknown |
| .31 | 06:5a:fd:4f:75:80 | Unknown (randomized MAC — Apple device) |
| .44 | 98:17:3c:38:db:78 | Unknown |
| .107 | 9e:4f:85:51:c7:f5 | Unknown (randomized MAC — Apple device) |
| .108 | 76:15:fa:46:bf:9e | Unknown (randomized MAC — Apple device) |

## Monorepo Distribution

| Node | Path | Status |
|------|------|--------|
| Alice | ~/blackroad/monorepo/ | Synced (26,290 files, 289MB) |
| Aria | ~/blackroad/monorepo/ | Synced |
| Cecilia | ~/blackroad/monorepo/ | Synced |
| Gaia | ~/blackroad/monorepo/ | Synced |
| Lucidia | ~/blackroad/monorepo/ | Synced |

## SSH Access

```
ssh alice          # pi@192.168.4.49 (key auth)
ssh blackroad@192.168.4.98   # Aria
ssh blackroad@192.168.4.113  # Cecilia
ssh gaia@192.168.4.112       # Gaia
ssh blackroad@192.168.4.38   # Lucidia
ssh octavia        # blackroad@192.168.4.101 (offline)
ssh gematria       # remote x64 server
ssh anastasia      # remote x64 server
```

---

Copyright 2026 BlackRoad OS, Inc. All rights reserved. Proprietary and confidential.
