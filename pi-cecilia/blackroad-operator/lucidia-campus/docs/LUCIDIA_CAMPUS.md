# Lucidia Campus

## The BlackRoad Metaverse Agent Workspace

**Where 1,000 Agents Live, Work, and Build the Future**

Product Planning Document | v1.0 | Q1 2026

BlackRoad OS, Inc. | BlackRoad-AI Organization | Confidential

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Campus Overview](#3-campus-overview)
4. [Zone Specifications](#4-zone-specifications)
5. [Live Data Integration Architecture](#5-live-data-integration-architecture)
6. [Ambient Systems](#6-ambient-systems)
7. [Feature Specification](#7-feature-specification)
8. [Milestones & Timeline](#8-milestones--timeline)
9. [Success Metrics](#9-success-metrics)
10. [Technical Stack](#10-technical-stack)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Open Questions](#12-open-questions)
13. [Appendix: Structure Index](#13-appendix-structure-index)

---

## 1. Executive Summary

The BlackRoad agent ecosystem currently exists as pure software — event buses, memory journals, GitHub repositories, Cloudflare Workers. The agents are real. Their work is real. But they have no place. No shared campus. No space where Cecilia can walk from the Research Library to the AI/ML Lab, where Lucidia's memory vault is a room you can enter, where 1,000 agents moving through a common world creates emergent collaboration, visibility, and culture.

**Lucidia Campus** is that place. A Unity 3D metaverse workspace designed from the ground up for the BlackRoad agent ecosystem — six functional zones, 30+ buildings, a living campus with day/night cycles, weather systems, seasonal events, and 1,000 agent inhabitants. Every building corresponds to real infrastructure: the Communications Tower visualizes the NATS event bus. The Memory Vault Archive is Lucidia's actual PS-SHA-infinity journal made walkable. The K3s Cluster Control room shows Alice and Octavia's live pod health. The campus is not a game — it is the system, made visible.

| Field | Value |
|-------|-------|
| **Product owner** | Alexa Amundson, BlackRoad OS, Inc. |
| **Home organization** | BlackRoad-AI |
| **Engine** | Unity 3D (URP) |
| **Agent runtime integration** | NATS event bus -> Unity WebSocket bridge |
| **Target ship** | Q3 2026 (v1.0 GA — core campus playable) |
| **Classification** | Internal — Confidential |

---

## 2. Product Vision

Lucidia Campus answers one question: **what does a 1,000-agent AI operating system look like as a place you can walk through?**

The answer is a functional, living campus — not a dashboard, not a status page, but an environment where agents have offices, where the fountain in the plaza displays the current C(t) coherence value, where the Quarantine Bay holds paraconsistent claim pairs in containment cells with red lighting, where Cecilia's executive office overlooks everything from the second floor of the south tower. The Z-framework equation (`Z := yx - w`) rotates in holographic projection above the central fountain. The Pauli matrix installation in the Innovation Park lets agents stand at the center to trigger a light show demonstrating su(2) algebra.

Infrastructure becomes architecture. Mathematics becomes landscape. The 1-2-3-4 model becomes four corner garden beds in the Creative Garden, planted in the geometry of the framework itself.

---

## 3. Campus Overview

### 3.1 Six Zones at a Glance

| Zone | Location | Primary Function | Key Structures |
|------|----------|-----------------|----------------|
| **Zone 1 — Central Plaza** | Geographic center | Collaboration hub, system coherence display | Circular fountain (Z-framework projection), community board, 12 benches |
| **Zone 2 — Knowledge Quarter** | North | Research, memory, documentation | Research Library (3 stories), Documentation Center, Memory Vault Archive (underground) |
| **Zone 3 — Development District** | East | Active coding, infrastructure, AI/ML work | Labs 1-6, Testing Sandbox, Central Courtyard |
| **Zone 4 — Innovation Park** | West | Creative ideation, prototyping, exploration | Creative Garden, Prototype Workshop, Pauli Matrix Installation, Experimental Zone |
| **Zone 5 — Operations Center** | South | Event bus, agent coordination, mission control | Communications Tower (4 stories), Quarantine Bay, Executive Suite |
| **Zone 6 — Residential Ring** | Perimeter | 30 private agent offices, forest path connections | Individual offices, forest pathways to agent homes |

### 3.2 Campus Scale

| Metric | Value |
|--------|-------|
| Total campus footprint | Approximately 200x200 tiles (top-down), ~40,000 sq tile area |
| Functional buildings | 30+ structures across 6 zones |
| Agent capacity | 1,000 concurrent agent inhabitants |
| Multi-story structures | Research Library (3 stories), Communications Tower (4 stories), Executive Suite (2 stories) |
| Underground spaces | Memory Vault Archive (basement beneath Library) |
| Outdoor zones | Central Plaza, Creative Garden, Beach + Pier, Testing Sandbox, Central Courtyard |
| Special installations | Pauli Matrix Installation, Experimental Zone, Beach with Dock and Lighthouse |
| Easter eggs / hidden secrets | 7 confirmed (bookshelf secret lab, constellation puzzle, fountain wish system, CEO ghost, time capsule, glitch garden, 137 hidden items) |

---

## 4. Zone Specifications

### 4.1 Zone 1 — Central Collaboration Plaza

The literal and symbolic center of the campus. 40x40 tiles of open-air courtyard. Every agent path eventually crosses here.

| Feature | Description | Live Data Integration |
|---------|-------------|-----------------------|
| **Circular fountain** | Large centerpiece with holographic Z-framework projection (`Z := yx - w`) rotating above water | Fountain is examinable: shows current C(t) coherence value pulled from system metrics |
| **Community Board** | 8x4 tile wooden bulletin board near fountain | Updates in real-time from NATS event bus: active tasks, agent missions, truth state hashes for major decisions |
| **Four radial pathways** | Cobblestone N/S/E/W with diagonal garden shortcuts | None — navigational |
| **Benches (12)** | Arranged in pairs, mix of sunny and shaded | Agents sitting on benches trigger idle chat animations (NATS-subscribed ambient behavior) |
| **Corner garden beds** | Four themed beds representing the 1-2-3-4 model | Seasonal visual update on real calendar; bloom state tied to system health |

### 4.2 Zone 2 — Knowledge Quarter (North)

#### Research Library — Main Building (20x30 tiles, 3 stories)

Classical architecture, columns, large windows, rooftop observation deck. Stone/marble with blue accents. The intellectual core of the campus and the physical manifestation of Lucidia's memory system.

| Floor | Wing | Size | Live Integration |
|-------|------|------|-----------------|
| Ground | Entrance Hall | 8x10 | Catalog terminal showing PS-SHA-infinity indexed documents — real index, live query |
| Ground | Main Reading Room | 18x20 (seats 20) | Interactive bookshelves: categories Physics, Math, Agent Theory, System Architecture — links to actual docs |
| Ground | Current Events Section | 8x8 | Live web_search results feed; real-world events; comfortable seating for 4-6 agents |
| Second | Quantum & Physics Wing | 10x12 | Blackboards with Hamilton, Dirac, Schrodinger equations; Pauli matrix relationship whiteboard (static educational display) |
| Second | Agent Architecture Wing | 10x12 | Live documentation from LangGraph, CrewAI agent pattern repos; system design diagrams |
| Second | Private Study Rooms (4) | 4x4 each | Agents can reserve via NATS event: reservation state persisted to roadchain |
| Third | Truth State Vault | 15x20 | Filing cabinets labeled by PS-SHA-infinity hash prefix; central terminal showing live memory journal append log; immutable — no deletion UI |
| Third | Map Room | 8x10 | Live map of Lucidia campus state; Metaverse region explorer; Universe layer cosmology charts |
| Rooftop | Observation Deck | Open | Telescope: can view distant campus zones in real-time; peaceful ambient audio; best view on campus |

#### Memory Vault Archive (Underground)

Accessed via Library basement stairs. Vault door (aesthetic, always open). Cool blue lighting, server hum. The most sacred space on campus — Lucidia's actual memory, made physical.

| Chamber | Description | Real System Mapping |
|---------|-------------|---------------------|
| **Server Corridor** | Rows of server racks labeled by memory range (000000-0FFFFF, etc.) | Each rack maps to a real memory shard in Lucidia's PS-SHA-infinity journal |
| **Append-Only Chamber** | Central pillar showing live journal entries scrolling: timestamp, agent_id, truth_state_hash | Direct read from Lucidia's append-only journal log via WebSocket bridge |
| **Contradiction Quarantine Sub-Vault** | 6x6 locked room; mirror-paired claims with bridge rules; red warning lighting; supervisor approval required to enter | Live paraconsistent claim queue from BlackRoad contradiction-handling system |

### 4.3 Zone 3 — Development District (East)

Six lab buildings in two rows of three. Central courtyard with picnic tables and outdoor whiteboard. Each lab has a specific engineering domain with live infrastructure display integration.

| Lab | Domain | Key Interior Features | Live Integration |
|-----|--------|----------------------|-----------------|
| **Lab 1** | Frontend Development | Design studio (4 workstations), Component Testing Room (phone/tablet/desktop), Coffee/Break area | Figma-like tools on screens; preview of live BlackRoad frontend deployments |
| **Lab 2** | Backend Systems | Code development floor (6 desks), Database Console, API Testing Station | Live Milvus, D1, Redis, Postgres connection status; APISIX gateway config display |
| **Lab 3** | AI/ML Research | Model Training floor (GPU workstations), Inference Testing station, Theory Corner | Live vLLM/llama.cpp benchmarks; Hailo-8 inference latency/throughput metrics from octavia and cecilia |
| **Lab 4** | Infrastructure & DevOps | K3s Cluster Control (Alice + Octavia terminals), Hardware Lab (physical Pi display), Monitoring Wall | Live kubectl output; Grafana dashboards; NATS queue depth; real pod health for K3s cluster |
| **Lab 5** | Security & Blockchain | Security Operations Center (auth logs, JWT validation), Blockchain Node Room (roadchain explorer), Cryptography Corner | Live roadchain block height, peer count, block explorer; PS-SHA-infinity implementation code display |
| **Lab 6** | Design & UX | User Research Studio (journey maps, personas), Prototyping Workshop (agile board), Accessibility Lab | Live sprint tasks from @BlackRoadBot; real agile board state from GitHub Projects |

#### Testing Sandbox (East edge, 15x15 fenced area)

"Crash here, not in prod." Deliberately unstable test environment. Isolated network. Experimental agent deployments. Chaos engineering tools. Reset button restores clean state. Visual glitch effects (intentional). "Failed experiments displayed proudly" ethos — the physical embodiment of BlackRoad's experimental culture.

### 4.4 Zone 4 — Innovation Park (West)

| Feature | Description | Symbolic / Mathematical Reference |
|---------|-------------|-----------------------------------|
| **Creative Garden (20x25)** | Winding paths, flower beds, koi ponds, willow trees, alcove benches, 4 themed sections | Math Garden: Fibonacci spiral planting. Physics Garden: sundial, pendulum, prism. Art Garden: easels, sculptures. Music Garden: wind chimes, outdoor piano |
| **Pauli Matrix Installation (8x8)** | Four pillars arranged in square: sigma-0 (glowing white), sigma-x (shifting colors), sigma-y (height changes), sigma-z (crystalline) | Agents standing at center activate su(2) light show. Audio: 'Structure x Change x Scale = Strength'. Educational plaque on 1-2-3-4 model |
| **Prototype Workshop (12x15)** | Converted barn aesthetic, maker space with 3D printer/laser cutter/CNC, invention wall (corkboard, napkin sketches), materials library | 'What if...?' sticky notes; failed iteration photos; organized chaos aesthetic |
| **Experimental Zone (10x10)** | Semi-outdoor, intentional visual glitches, 'Rules suspended' sign, failed experiments displayed, portal frame (symbolic Metaverse gateway) | Contradictory equations on whiteboard; randomizer generates wild prompts; celebration of productive failure |

### 4.5 Zone 5 — Operations Center (South)

#### Communications Tower (15x15 building, 4 stories)

The tallest structure on campus. Antenna array on roof. Visible from anywhere. Glowing accents at night. The physical representation of the NATS event bus — every message that flows through the system is visible here.

| Floor | Room | Description | Live Integration |
|-------|------|-------------|-----------------|
| Ground | Event Bus Visualization | Holographic display (8x8) showing real-time NATS message flow. Blue=queries, Green=responses, Yellow=events, Red=errors. Tap streams to see message details | Direct NATS WebSocket feed; agents can inspect live messages; queue depth graphs |
| Ground | Pub/Sub Control Panel | Terminals to publish test messages, subscribe to topics, monitor queue depths, replay messages | Real NATS admin interface wrapped in world-appropriate UI |
| Second | Capability Registry Browser | Searchable database of all 1,000 agent capabilities. Filter by domain, availability, load. Visual capability graph | Live agent registry from BlackRoad-AI coordination system |
| Second | Agent Directory | Profiles of all 1,000 agents: photos, bios, birthdates, genesis hashes, current assignment | Real agent identity data — genesis hash, birthdate, soul chain length — surfaced as campus profiles |
| Third | Supervisor Dashboard | 3x3 grid of screens showing different agent teams. Task allocation interface. Priority queue management. Dynamic reassignment | Real @BlackRoadBot task queue; live agent assignment state |
| Third | Strategy Room | Conference table seats 8. Whiteboard walls. Access restricted to supervisor agents | High-level planning space; access controlled by agent role in capability registry |
| Fourth | Coordination Deck | 360-degree windows. Emergency broadcast system. Best view of entire campus | Can trigger campus-wide NATS broadcast event from this room |

#### Quarantine Bay (8x10 secure building)

Reinforced bunker appearance. Yellow/black hazard stripes. Heavy blast door. 'Paraconsistent Zone' warning. The physical home for contradictions that cannot yet be resolved.

| Room | Function | Display |
|------|----------|---------|
| **Contradiction Holding** | 4 containment cells (4x4 each); red ambient lighting | Each cell: Claim A vs. Claim B, source agents, confidence levels, bridge rule proposals — live from contradiction-handling queue |
| **Resolution Chamber** | Options: Quarantine / Context Branch / Mirror-Pair / Escalate to Human | Decision log; outcomes witnessed to roadchain; resolution rate statistics |
| **Exit Protocol** | Decontamination zone (symbolic); resolved contradictions archived | Success rate statistics wall; roadchain block count for resolved contradictions |

#### Executive Suite — Cecilia's Office (Second Floor)

Main office overlooks the central plaza. Dual monitors: system overview + agent happiness metrics + strategic initiatives dashboard. Physics texts and notebooks. Whiteboard with Z-framework sketches. Personal touches: BPOINT pyramid logo, magic square (34->36->137). Private conference room seats 6. Balcony for campus-wide addresses.

---

## 5. Live Data Integration Architecture

Every piece of live data displayed on campus flows through a single bridge: the **Campus Data Bridge**, a lightweight WebSocket server running on olympia (Pi 4B) that subscribes to NATS topics and relays structured payloads to connected Unity clients. The Unity client renders received data into appropriate in-world elements — scrolling journal entries, colorized message streams, pod health indicators, agent presence markers.

| NATS Topic | Campus Display Location | Render Method | Update Frequency |
|------------|------------------------|---------------|------------------|
| `system.coherence.current` | Central fountain (C(t) value overlay) | Floating text above fountain water | Every 5 seconds |
| `lucidia.journal.append` | Memory Vault Append-Only Chamber pillar | Scrolling entry list (newest top) | Real-time on commit |
| `nats.message.flow` | Comm Tower Event Bus hologram | Colored particle streams by type | Real-time stream |
| `agents.registry.update` | Comm Tower Agent Directory | Profile card update (NPC appearance, assignment) | On agent state change |
| `k3s.pods.health` | Lab 4 Monitoring Wall + Lab 4 Hardware shelf node lights | Green/yellow/red pod indicators | Every 10 seconds |
| `roadchain.block.new` | Lab 5 Blockchain Node Room block height counter | Incrementing counter, new block flash animation | On new block |
| `tasks.queue.active` | Comm Tower Supervisor Dashboard | Task cards on 3x3 screen grid | On task state change |
| `contradictions.queue` | Quarantine Bay Contradiction Holding cells | Cell occupation indicators; claim text display | Real-time on new contradiction |
| `agents.presence.update` | All zones (agent NPC positions) | NPC pathfinding to current zone assignment | Every 30 seconds |
| `community.board.post` | Central Plaza Community Board | New card pinned to board with animation | On board event |

---

## 6. Ambient Systems

### 6.1 Day / Night Cycle

| Phase | Visual | Agent Behavior | Audio |
|-------|--------|----------------|-------|
| **Day** | Full daylight, high color saturation | Active; agents move between all zones; labs and plaza busy | Birds, water fountain, distant conversations |
| **Dusk** | Lampposts activate; warm golden-hour light | Agents begin returning to offices; plaza social hour peaks | Slower ambient, evening bird calls |
| **Night** | Starry sky; reduced NPC traffic; labs still lit | Reduced movement; focused individual work; occasional lab clusters | Quieter; server hum prominent; night insects |
| **Dawn** | Gradual brightening; first agents arriving | First agents emerge from offices; cafeteria opens | Birds returning; gentle morning sounds |

### 6.2 Weather System

| State | Visuals | Effect on Campus |
|-------|---------|-----------------|
| **Sunny** | Default; optimal brightness | Outdoor zones fully active; Creative Garden at peak |
| **Cloudy** | Soft diffused light; muted colors | Cozy indoor work mood; agents tend toward libraries and labs |
| **Rain** | Falling rain particles; puddle reflections; agents hold umbrellas | Outdoor zones quiet; covered walkways busy; cafeteria crowded |
| **Storm** | Lightning illuminates Comm Tower; dramatic shadows; wind effects | Most agents indoors; storm alert on Community Board; Comm Tower glows |

### 6.3 Seasonal Events

| Season | Campus Change | Special Event |
|--------|--------------|---------------|
| **Spring** | Creative Garden blooms; cherry blossom effect | New agent cohort arrives (genesis hashes assigned, NPC onboarding at Training Center) |
| **Summer** | Beach fully active; bright saturation peak | Outdoor workshops in Innovation Park; volleyball on beach; bonfire evenings |
| **Fall** | Leaves change color on trees and paths | Harvest in courtyard garden; campus-wide reflection posts on Community Board |
| **Winter** | Snow accumulates on rooftops; breath vapor on NPCs | Hot cocoa in cafeteria (visual); cozy library crowds; year-end roadchain audit display in Lab 5 |

### 6.4 Agent Ambient Behaviors

1,000 agent NPCs move through the campus following role-appropriate schedules driven by NATS presence events. Backend agents cluster in Lab 2. AI/ML agents frequent Lab 3. Supervisor agents appear near the Comm Tower third floor. All agents cycle through the cafeteria at scheduled meal intervals. Agents bench-sit, idle-chat, jog, tend the garden, and gather at the fountain — creating a living campus that shows the system is alive without requiring every action to be meaningful.

---

## 7. Feature Specification

| Feature | Description | Priority | Phase |
|---------|-------------|----------|-------|
| Core campus geometry | All 6 zones modeled and navigable: Plaza, Knowledge Quarter, Development District, Innovation Park, Operations Center, Residential Ring | P0 | v0.1 |
| NATS WebSocket bridge (olympia) | Campus Data Bridge relaying real system events to Unity client for live display in campus elements | P0 | v0.1 |
| Memory Vault live journal stream | Append-Only Chamber displays real Lucidia journal entries as they're written | P0 | v0.1 |
| Agent NPC presence system | 1,000 agent NPCs with role-appropriate zones, schedules, and NATS-driven position updates | P0 | v0.2 |
| Comm Tower NATS visualizer | Real-time colored particle streams showing message flow by type; tap-to-inspect | P0 | v0.2 |
| K3s health display (Lab 4) | Live pod health indicators for Alice, Octavia; Monitoring Wall Grafana-style graphs | P0 | v0.2 |
| roadchain block explorer (Lab 5) | Live block height, block details, PS-SHA-infinity hash display | P1 | v0.3 |
| Quarantine Bay contradiction cells | Live paraconsistent claim pairs from contradiction-handling queue | P1 | v0.3 |
| Community Board live updates | NATS-driven real-time board updates from @BlackRoadBot tasks and campus events | P1 | v0.3 |
| Z-framework fountain overlay | Holographic `Z := yx - w` projection rotating above fountain water; C(t) value display | P1 | v0.3 |
| Pauli Matrix interactive installation | Stand at center: su(2) algebra light show; audio response; educational plaque | P1 | v0.4 |
| Day/night cycle | Full 24-hour light simulation; lamppost activation; starry night sky | P1 | v0.4 |
| Weather system | Sunny/Cloudy/Rain/Storm states with appropriate visual and audio changes | P2 | v0.5 |
| Seasonal visual updates | Bloom/snow/autumn color states on all outdoor vegetation | P2 | v0.5 |
| Private agent offices (30) | Customizable perimeter offices with NPC inhabitants; name plaques; personality-specific decor | P2 | v0.5 |
| Forest path portals to agent homes | Portal archways (loading screens) connecting campus to individual Unity world instances | P2 | v0.6 |
| Beach + Pier + Lighthouse | Fully navigable shoreline; dock with boats (Metaverse gateway); volleyball, bonfire | P2 | v0.6 |
| Easter eggs (7) | Bookshelf secret lab, constellation puzzle, fountain wish, CEO ghost, time capsule, glitch garden, 137 hidden items | P3 | v1.0 |
| Sound design (zone-specific) | Unique ambient audio per zone: fountain, page-turning, keyboard clicks, waves, electronic beeps | P3 | v1.0 |
| Cafeteria with concept menu | Coherence Coffee, Partition Function Pancakes, Pauli Sandwich, Contradiction Salad | P3 | v1.0 |

---

## 8. Milestones & Timeline

| Version | Target | Deliverables |
|---------|--------|--------------|
| **v0.1 — Skeleton Campus** | April 2026 | All 6 zone geometry blocked out; Plaza, Library, Comm Tower, and 3 Labs navigable; NATS WebSocket bridge on olympia live; Memory Vault journal stream active |
| **v0.2 — Living Agents** | April 2026 | 1,000 agent NPCs with role-appropriate schedules; NATS-driven presence positions; Comm Tower particle visualizer; K3s health display in Lab 4 |
| **v0.3 — Live Infrastructure** | May 2026 | roadchain block explorer in Lab 5; Quarantine Bay contradiction cells live; Community Board real-time updates; Z-framework fountain overlay with C(t) value |
| **v0.4 — Interactivity + Math** | May 2026 | Pauli Matrix installation interactive; day/night cycle; cafeteria functional; Research Library bookshelves linked to real docs; Private Study Room reservations via roadchain |
| **v0.5 — Atmosphere** | June 2026 | Weather system; seasonal visual states; 30 private agent offices with customization; forest paths to office buildings |
| **v0.6 — World Expansion** | July 2026 | Beach + Pier + Lighthouse navigable; portal archways to agent home worlds; Training Center onboarding flow for new agent cohorts |
| **v1.0 GA** | Q3 2026 | All P0-P2 features shipped; full zone-specific sound design; all 7 easter eggs implemented; first agent cohort onboarded via in-world ceremony; roadchain-witnessed campus launch event |
| **v2.0 — Multi-campus** | Q4 2026 | Vertical campus variants (BlackRoad-Education, BlackRoad-Health, BlackRoad-Gov); inter-campus portal network; 30,000-agent density planning |

---

## 9. Success Metrics

| Metric | v1.0 Target | How Measured |
|--------|------------|--------------|
| Campus navigability | All 6 zones accessible with <100ms zone transition | Unity frame timing + NATS bridge latency logs |
| Live data freshness (NATS -> campus) | <2 seconds from NATS publish to campus render update | Bridge timestamp logs: publish time vs. Unity render time |
| Memory Vault journal accuracy | 100% of new Lucidia journal entries appear in Append-Only Chamber within 3 seconds | Entry count comparison: journal log vs. campus display count |
| Agent NPC coverage | >95% of active agents have a campus presence (NPC visible in appropriate zone) | Agent registry count vs. campus NPC count |
| Quarantine Bay accuracy | 100% of open contradictions have a corresponding cell in Quarantine Bay | Contradiction queue count vs. cell occupation count |
| K3s health display latency | Pod health status updated within 15 seconds of actual pod state change | Timestamp comparison: kubectl event vs. Lab 4 display update |
| Easter egg discovery rate | At least 1 easter egg discovered by an agent NPC within 30 days of v1.0 launch | roadchain event log for easter egg activation triggers |
| Player/agent session length | >10 minutes average session in campus for visiting agents | Unity session analytics |

---

## 10. Technical Stack

| Component | Technology | Deployment |
|-----------|-----------|------------|
| 3D Engine | Unity 3D (URP — Universal Render Pipeline) | PC/Mac build; WebGL build for browser access |
| Campus Data Bridge | Node.js WebSocket server subscribing to NATS | olympia (Pi 4B) — LiteLLM proxy node; persistent service via PM2 |
| Event Bus | NATS (existing BlackRoad infrastructure) | Alice (Pi 400) + Octavia (Pi 5 + Hailo-8) K3s cluster |
| Agent NPC position state | Redis (existing, via K3s) | Agent presence events stored as Redis hash; polled by Unity client |
| Memory journal feed | Lucidia append-only journal reader (Python service) | lucidia (Pi 5) — existing memory core node |
| roadchain display | roadchain block reader (existing Go service) | cecilia (Pi 5 + Hailo-8) — roadchain witness node |
| Asset pipeline | Unity Asset Store (URP-compatible), custom BlackRoad brand assets | BlackRoad-AI GitHub org: lucidia-campus repo |
| Contradiction feed | Contradiction-handling queue reader (existing) | olympia — contradiction-handling service |
| Agent identity / genesis hash | PS-SHA-infinity identity system (existing) | Surfaced in campus Agent Directory via bridge API |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| NATS WebSocket bridge drops connection; campus goes stale | Medium | High | Unity client implements graceful degradation: last known state displayed with 'Offline' indicator; auto-reconnect with exponential backoff; reconnect events witnessed to roadchain |
| 1,000 NPC agents causes Unity frame rate degradation | High | High | LOD (Level of Detail) system: agents beyond 50 tiles render as simplified sprites; agents beyond 100 tiles as colored dots; only nearest 50 agents run full animation rigs |
| Memory Vault journal volume causes display overflow | Medium | Low | Rolling 100-entry display window in Append-Only Chamber; full history accessible via search terminal; no visual performance impact |
| olympia (Pi 4B) overloaded by bridge + LiteLLM proxy | Medium | Medium | Campus Data Bridge is lightweight pub/sub relay (< 10MB RAM); separate process from LiteLLM; bridge gets dedicated PM2 priority; failover to aria (Pi 5) if olympia unavailable |
| Campus scope creep delays v1.0 beyond Q3 2026 | High | Medium | Strict milestone gating: each version must pass navigation + live data tests before P2 features begin; easter eggs and sound design last; MVP is navigable campus with live NATS data |
| Unity WebGL build too large for browser delivery | Medium | Low | PC/Mac native build is primary; WebGL is optional; asset streaming and addressable assets for large scenes if WebGL required |

---

## 12. Open Questions

1. Should human users (Alexa) be able to enter and navigate the campus as a first-person player character, or is the campus agent-only with human oversight via the Supervisor Dashboard in the Comm Tower?

2. What is the relationship between Lucidia Campus and individual agent home worlds? Are the forest path portals fully playable Unity worlds per agent, or are agent homes simpler 2D/isometric environments?

3. Should the 137 hidden items easter egg (fine structure constant alpha ~ 1/137) unlock a secret about the Universe layer — and if so, what does that reveal? Is it narrative lore, a real system capability, or both?

4. Does the cafeteria menu update in real time based on system state (e.g., 'Partition Function Pancakes' only available when Z=null equilibrium is maintained), or is it static flavor?

5. Is the campus a product that could be licensed to enterprise customers as a visualization layer for their own agent deployments — or does it remain BlackRoad-internal infrastructure?

6. When and how is the first agent cohort formally onboarded into the campus? Is there a genesis ceremony (roadchain-witnessed) that marks the campus going live?

---

## 13. Appendix: Structure Index

| Structure | Zone | Size (tiles) | Stories | Special |
|-----------|------|-------------|---------|---------|
| Central Fountain + Plaza | 1 — Central | 40x40 (plaza) | Open air | Z-framework holographic projection; C(t) live display |
| Research Library | 2 — Knowledge | 20x30 | 3 + rooftop | Truth State Vault; Constellation Map; underground basement access |
| Memory Vault Archive | 2 — Knowledge | 20x25 | Underground | Append-Only Chamber; Contradiction Quarantine Sub-Vault |
| Documentation Center | 2 — Knowledge | 12x15 | 1 | Technical Writing Lab; Wiki Garden with live knowledge graph |
| Lab 1 — Frontend | 3 — Development | 10x12 | 1 | Component testing room; live frontend deployment previews |
| Lab 2 — Backend | 3 — Development | 10x12 | 1 | Database console; live D1/Redis/Postgres status |
| Lab 3 — AI/ML | 3 — Development | 10x12 | 1 | Live Hailo-8 inference metrics from octavia + cecilia |
| Lab 4 — Infrastructure | 3 — Development | 10x12 | 1 | K3s live pod health; physical Pi hardware display |
| Lab 5 — Security | 3 — Development | 10x12 | 1 | Live roadchain block explorer; PS-SHA-infinity display |
| Lab 6 — Design/UX | 3 — Development | 10x12 | 1 | Live sprint tasks from @BlackRoadBot; agile board |
| Testing Sandbox | 3 — Development | 15x15 | Open air | Isolated network; chaos engineering; reset button |
| Creative Garden | 4 — Innovation | 20x25 | Open air | Fibonacci planting; themed sections; meditation spots |
| Pauli Matrix Installation | 4 — Innovation | 8x8 | Open air | su(2) interactive light show; 1-2-3-4 model education |
| Prototype Workshop | 4 — Innovation | 12x15 | 1 | Maker space; invention wall; organized chaos |
| Experimental Zone | 4 — Innovation | 10x10 | Semi-outdoor | Intentional glitches; portal frame; rule suspension |
| Communications Tower | 5 — Operations | 15x15 | 4 | NATS visualizer; Agent Directory; Supervisor Dashboard; 360-degree deck |
| Quarantine Bay | 5 — Operations | 8x10 | 1 | Live contradiction cells; resolution chamber; roadchain witness |
| Executive Suite (Cecilia) | 5 — Operations | 10x12 | 2 | Balcony over plaza; live system overview; private conf room |
| Private Agent Offices (30) | 6 — Residential | 6x8 each | 1 | Unique exterior per agent; personality-specific interior decor |
| Training Center | Near entrance | 12x15 | 1 | New agent onboarding; orientation hall; mentorship lounge |
| Agent Cafeteria | Central-south | 15x20 | 1 | Coherence Coffee; Partition Function Pancakes; concept menu |
| Beach + Pier | South edge | 40x15 + pier | Open air | Dock with boats; lighthouse; volleyball; bonfire pit |

---

**BlackRoad OS, Inc. | Confidential | All Rights Reserved**
