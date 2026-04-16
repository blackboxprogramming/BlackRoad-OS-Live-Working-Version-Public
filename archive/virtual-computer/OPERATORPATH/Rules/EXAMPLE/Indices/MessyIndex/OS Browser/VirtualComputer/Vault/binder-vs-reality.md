# Binder vs Reality — 2026-04-13
## The spec says one thing. The code says another. This is the gap.

---

## Product Status (18 canonical products)

| Product | Binder Host | Actual Host | HTTP | App? | Analytics | Auth | Issues |
|---------|-------------|-------------|------|------|-----------|------|--------|
| BlackRoad OS | os.blackroad.io | os.blackroad.io | 200 | REAL | NO | NO | |
| RoadTrip | roadtrip.blackroad.io | roadtrip.blackroad.io | 200 | REAL | YES | YES | |
| Roadie | roadie.blackroad.io | **tutor.blackroad.io** | 200 | REAL | YES | NO | Host mismatch |
| RoadView | roadview.blackroad.io | **search.blackroad.io** | 200 | REAL | NO | NO | Host mismatch |
| RoadChat | chat.blackroad.io | chat.blackroad.io | 200 | REAL | NO | NO | |
| BackRoad | backroad.blackroad.io | **social.blackroad.io** | 301 | LANDING | NO | NO | Host mismatch, just landing |
| RoadCode | roadcode.blackroad.io | roadcode.blackroad.io | 200 | REAL | NO | NO | |
| RoadWork | roadwork.blackroad.io | roadwork.blackroad.io | **500** | DOWN | NO | NO | Server error |
| CarKeys | carkeys.blackroad.io | **auth.blackroad.io** | 200 | REAL | NO | YES | Host mismatch |
| CarPool | carpool.blackroad.io | carpool.blackroad.io | 200 | REAL | NO | NO | |
| OneWay | oneway.blackroad.io | oneway.blackroad.io | 200 | REAL | NO | NO | |
| RoadSide | roadside.blackroad.io | roadside.blackroad.io | 200 | REAL | NO | NO | |
| BlackBoard | blackboard.blackroad.io | blackboard.blackroad.io | 200 | REAL | NO | NO | |
| RoadChain | roadchain.blackroad.io | roadchain.blackroad.io | 200 | REAL | NO | NO | |
| RoadCoin | roadcoin.blackroad.io | roadcoin.blackroad.io | **500** | DOWN | NO | NO | Server error |
| RoadBook | roadbook.blackroad.io | roadbook.blackroad.io | **500** | DOWN | NO | NO | Server error |
| RoadWorld | roadworld.blackroad.io | roadworld.blackroad.io | 200 | LANDING | NO | NO | Just landing |
| OfficeRoad | officeroad.blackroad.io | officeroad.blackroad.io | 200 | REAL | NO | NO | |

### Scorecard
- **12/18** real apps (have API or interactive elements)
- **3/18** down (500 errors): RoadWork, RoadCoin, RoadBook
- **3/18** landing pages only: BackRoad, RoadWorld, (RoadWork when 500)
- **2/18** have analytics
- **2/18** have auth link
- **6/18** served on different host than binder specifies

## Fleet Status (7 nodes, 121 Ollama models)

| Node | IP | Binder Role | Status | Ollama |
|------|-----|------------|--------|--------|
| Alice | 192.168.4.49 | Edge router, nginx, 20 domains | UP | 37 models |
| Cecilia | 192.168.4.96 | Executive operator, orchestration APIs | UP | 38 models |
| Lucidia | 192.168.4.38 | Core intelligence, reasoning node | UP | 37 models |
| Gematria | 159.65.43.12 | Pattern engine, knowledge services | UP | 8 models |
| Anastasia | 174.138.44.45 | Cloud continuity, recovery | UP | 1 model |
| **Octavia** | 192.168.4.101 | Queues, Docker, Gitea | **DOWN** | — |
| **Aria** | 192.168.4.98 | Monitoring, dashboards, Portainer | **DOWN** | — |

### Impact of Octavia DOWN
Binder assigns Octavia to queue management for: CarKeys, RoadCode, RoadTrip.
These products are operating without their queue layer.

### Impact of Aria DOWN
Binder assigns Aria to monitoring for: BackRoad, RoadChat, RoadWork, RoadTrip.
These products have zero operational monitoring.

## Agent Fleet (27 agents, all online via RoadTrip API)
- core: 2 (Roadie, Lucidia)
- operations: 5 (Cecilia, Octavia, Olympia, Silas, Sebastian)
- creative: 6 (Calliope, Aria, Thalia, Lyra, Sapphira, Seraphina)
- knowledge: 4 (Alexandria, Theodosia, Sophia, Gematria)
- governance: 4 (Portia, Atticus, Cicero, Valeria)
- human: 4 (Alice, Celeste, Elias, Ophelia)
- infrastructure: 2 (Gaia, Anastasia)

All 27 report online via API. But 2 physical nodes (Octavia, Aria) are down — agents hosted on those nodes may be running in degraded/cloud-fallback mode.

## Top 6 Gaps to Close

1. **Fix 3 down products** — RoadWork, RoadCoin, RoadBook returning 500
2. **Bring Octavia + Aria online** — 2/7 fleet nodes down, breaks queue + monitoring
3. **Analytics everywhere** — 16/18 products blind (br.js injection script ready, 558 files)
4. **Auth everywhere** — CarKeys should serve all 18 products, only 2 link to it
5. **Resolve hostname mismatches** — 6 products on different hosts than binder. Either update binder or add redirects.
6. **Promote 3 landings to real apps** — BackRoad, RoadWorld need functionality, not just pages
