# CLAUDE.md — Lucidia Campus

## Project Overview

Lucidia Campus is the BlackRoad Metaverse Agent Workspace — a Unity 3D environment where 1,000 AI agents live, work, and collaborate. Every building on campus maps to real BlackRoad infrastructure: the Communications Tower visualizes the NATS event bus, the Memory Vault Archive displays Lucidia's PS-SHA-infinity journal, and the K3s Cluster Control room shows live pod health.

**Home organization:** BlackRoad-AI
**Engine:** Unity 3D (URP — Universal Render Pipeline)
**Target:** Q3 2026 v1.0 GA

## Repository Structure

```
lucidia-campus/
├── CLAUDE.md              # This file
├── docs/
│   └── LUCIDIA_CAMPUS.md  # Full product planning document (source of truth)
├── bridge/
│   ├── campus-data-bridge.js   # Node.js WebSocket server (NATS -> Unity)
│   ├── package.json            # Bridge dependencies (ws, nats)
│   └── ecosystem.config.js     # PM2 deployment config for olympia
└── unity/
    └── Assets/
        ├── Scripts/
        │   ├── Bridge/         # WebSocket client (CampusBridgeClient.cs)
        │   ├── Campus/         # Zone management, config (ZoneManager.cs, CampusConfig.cs)
        │   ├── Agents/         # NPC system (AgentNPC.cs, AgentPresenceManager.cs)
        │   ├── Displays/       # Live data displays (FountainCoherenceDisplay.cs, MemoryVaultDisplay.cs)
        │   └── Ambient/        # Day/night, weather (DayNightCycle.cs)
        ├── Scenes/             # Unity scenes (placeholder)
        ├── Prefabs/            # Agent NPC prefabs, building prefabs
        ├── Materials/          # URP materials using brand colors
        ├── Shaders/            # Custom URP shaders
        └── Audio/              # Zone-specific ambient audio
```

## Key Architecture

### Campus Data Bridge
- Node.js WebSocket server on olympia (Pi 4B)
- Subscribes to NATS topics, relays payloads to Unity clients
- Port 9100 (WebSocket), managed by PM2
- Target: < 10MB RAM footprint

### Unity Client
- URP (Universal Render Pipeline) for cross-platform rendering
- NativeWebSocket for bridge connection
- LOD system: full models (< 50 tiles), sprites (50-100), dots (> 100)
- 1,000 agent NPCs with NATS-driven presence updates

### Six Campus Zones
1. Central Plaza — fountain with Z-framework hologram, community board
2. Knowledge Quarter — Research Library (3 floors), Memory Vault Archive (underground)
3. Development District — Labs 1-6, Testing Sandbox
4. Innovation Park — Creative Garden, Pauli Matrix Installation
5. Operations Center — Communications Tower (4 floors), Quarantine Bay, Executive Suite
6. Residential Ring — 30 private agent offices

## Brand Colors (MUST use exactly)

```
Black:          #000000
White:          #FFFFFF
Amber:          #F5A623
Hot Pink:       #FF1D6C (Primary)
Electric Blue:  #2979FF
Violet:         #9C27B0
```

## Commands

```bash
# Bridge (on olympia)
cd bridge && npm install && npm start

# Bridge via PM2
pm2 start bridge/ecosystem.config.js

# Unity
# Open unity/ folder in Unity Hub (2022.3 LTS or later, URP)
```

## Conventions

- All live data flows through NATS -> Campus Data Bridge -> Unity WebSocket
- Agent NPCs use LOD system to maintain performance at 1,000 agents
- Bridge targets use dot notation: `fountain.coherence`, `vault.journal`, `commtower.eventbus`
- Unity C# namespaces: `BlackRoad.LucidiaCampus.<Module>`
- Golden ratio spacing (phi = 1.618): 8, 13, 21, 34, 55 px

## Planning Document

See `docs/LUCIDIA_CAMPUS.md` for the full product planning document including zone specifications, feature priorities, milestones, success metrics, and risk mitigations.

---

**BlackRoad OS, Inc. | Confidential | All Rights Reserved**
