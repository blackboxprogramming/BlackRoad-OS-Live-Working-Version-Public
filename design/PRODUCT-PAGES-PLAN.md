# BlackRoad Product Pages — Build Plan

## Template
Every product page uses the brand.blackroad.io design system.
Base: ~/Desktop/templates/blackroad-home.html (the home page we just built)

## Structure per product page
Each product gets a full page at `{product}.blackroad.io` with these sections:

```
1. GRAD BAR (3px gradient)
2. NAV (same across all — logo, 6 links, Open OS button)
3. HERO
   - Product tag (e.g. "PART OF BLACKROAD OS")
   - Product name (big)
   - One-line description
   - [Open {Product}] [Go Pro — $19/mo]
4. LIVE WIDGET
   - Product-specific interactive demo
   - Pulls from its own APIs every 2-3 seconds
   - Shows real data, not mockups
5. FEATURES (3-4 cards from PRODUCT.md)
6. AGENTS (which agents work in this product)
7. HOW IT WORKS (3 steps)
8. PRICING (Free / Pro $19 / Team $49)
9. CONNECTED PRODUCTS (which other products integrate)
10. GRAD BAR
11. FOOTER (same across all)
```

## 18 Product Pages

### Core System
1. **blackroad-os** → os.blackroad.io
   - Live widget: desktop preview with window count, theme selector
   - Features: windows, dock, persistence, cross-device, convoy

2. **roadtrip** → roadtrip.blackroad.io
   - Live widget: chat feed with agent messages (poll /api/messages)
   - Features: 27 agents, shared memory, voice, hand-offs

3. **highway** → highway.blackroad.io
   - Live widget: product health grid (poll /api/health/all)
   - Features: announcements, alerts, KPIs, leaderboard

4. **oneway** → oneway.blackroad.io
   - Live widget: export count + portability types
   - Features: cryptographic manifests, proof certificates

### Intelligence
5. **roadie** → roadie.blackroad.io
   - Live widget: try it now — ask a question (POST /api/socratic)
   - Features: 8 learning paths, Socratic method, XP/levels

6. **roadview** → roadview.blackroad.io
   - Live widget: search box (real search)
   - Features: verified results, credibility scores, collections

7. **carpool** → carpool.blackroad.io
   - Live widget: memory stats + handoff count
   - Features: routing, shared memory, workflow templates

8. **roadbook** → roadbook.blackroad.io
   - Live widget: featured publications
   - Features: versioning, citations, DOI, reading lists

### Creation
9. **backroad** → backroad.blackroad.io
   - Live widget: social feed (poll /api/posts)
   - Features: scheduled posts, analytics, hashtags, cross-post

10. **roadcode** → roadcode.blackroad.io
    - Live widget: code editor with templates dropdown
    - Features: snippets, run, review, deploy, fork/star

11. **roadwork** → roadwork.blackroad.io
    - Live widget: CRM dashboard (contacts, pipeline, tasks)
    - Features: OKRs, invoices, SOPs, ideation, reports

12. **blackboard** → blackboard.blackroad.io
    - Live widget: brand kit preview
    - Features: templates, generate, export, collaboration

13. **officeroad** → officeroad.blackroad.io
    - Live widget: 8-floor office with agent dots moving
    - Features: meetings, elevator, agent locations

### Infrastructure
14. **carkeys** → carkeys.blackroad.io
    - Live widget: security score meter
    - Features: sessions, key rotation, MFA, audit log

15. **roadchain** → roadchain.blackroad.io
    - Live widget: block explorer (poll /api/chain/stats)
    - Features: event stamping, Merkle proofs, anchor

16. **roadcoin** → roadcoin.blackroad.io
    - Live widget: supply dashboard + leaderboard
    - Features: staking, streaks, governance, recovery ride

17. **roadside** → roadside.blackroad.io
    - Live widget: FAQ + system status
    - Features: tickets, onboarding, article search

18. **roadworld** → roadworld.blackroad.io
    - Live widget: game browser (37 templates)
    - Features: create, play, rate, leaderboard, NPC/quests

## Build Order
Phase 1: Home page (blackroad.io) — DONE
Phase 2: Top 6 products (OS, RoadTrip, Roadie, Highway, RoadWork, RoadWorld)
Phase 3: Next 6 (BackRoad, RoadCode, CarKeys, RoadCoin, RoadBook, CarPool)
Phase 4: Final 6 (OfficeRoad, OneWay, RoadSide, BlackBoard, RoadView, RoadChain)

## Shared Components
- Nav (identical across all)
- Footer (identical across all)
- Pricing section (identical across all)
- Connected products section (varies per product)
- Live data script (WebSocket + polling pattern)

## Deploy
Each page gets pushed to its BlackRoad-Products repo and deployed via wrangler.
