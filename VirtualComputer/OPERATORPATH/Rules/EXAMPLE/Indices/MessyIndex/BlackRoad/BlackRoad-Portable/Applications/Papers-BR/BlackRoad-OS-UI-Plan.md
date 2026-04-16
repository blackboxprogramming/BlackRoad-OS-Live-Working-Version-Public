# BlackRoad OS — Browser Desktop UI Plan
**Date**: April 10, 2026
**Product**: os.blackroad.io
**Status**: Planning

---

## The Concept

BlackRoad OS is a full operating system that lives in a browser tab. Not a dashboard. Not a portal. An actual computer — with windows, agents, and apps — running at a URL.

Three panels. Always on. Everything accessible. Nothing lost between sessions.

---

## Core Layout — Three-Panel Architecture

```
┌──────────────────┬────────────────────────────┬────────────────────┐
│  ← RoadTrip →   │      ← OfficeRoad →        │  ← Workspace →     │
│                  │                            │                    │
│  Agent roster    │  Animated AI office —      │  Open canvas       │
│  Live chat       │  agents moving around,     │  Any app,          │
│  27 agents       │  working, showing status   │  any window,       │
│  DMs + groups    │  visually                  │  as many as fit    │
│                  │                            │                    │
└──────────────────┴────────────────────────────┴────────────────────┘
```

### Panel 1 — Left: RoadTrip (Agent Communication Hub)
- The 27-agent convoy chat, always live
- Scrollable agent roster with name, avatar, status dot (online / working / idle)
- Click any agent → opens DM or group thread
- Agents post updates, ask questions, report task completions here
- Feels like: a team Slack that never sleeps and always knows what you asked

### Panel 2 — Center: OfficeRoad (Animated AI Office)
- Persistent animated office environment
- Agents are visualized as characters moving around, sitting at desks, in meetings
- Each agent's animation reflects their real status: working = typing, idle = relaxing, completing = celebrating
- Clicking an agent in the office opens their RoadTrip thread in Panel 1
- Feels like: looking through a window at your team — alive, not a dashboard

### Panel 3 — Right: Workspace (Open Canvas)
- Starts blank and ready
- Loads when:
  1. You click an app in the OfficeRoad office
  2. You type a command in the command bar
  3. An agent assigns you something or surfaces a result
- Supports multiple floating windows — drag, resize, stack
- Each window can be any product: RoadView, Roadie, RoadCode, RoadWork, etc.
- Full-screen mode: any window can go full-screen, hiding the other panels
- Windows persist — closing BlackRoad OS and reopening restores your workspace

---

## Themes

User can switch between 4 themes:

| Theme | Feel |
|-------|------|
| **Midnight** | Deep black/charcoal, neon accents — hot pink (#FF1D6C), amber (#F5A623), electric blue (#2979FF) |
| **Clean** | White space, minimal, subtle dark mode, professional |
| **Cinematic** | Immersive full-bleed, game HUD energy, dramatic |
| **Custom** | User-defined accent colors, wallpaper, layout density |

Default on first login: **Midnight** (BlackRoad brand colors)

---

## Command Bar

- Activated by: `Cmd+K` / `Ctrl+K` or clicking the search icon
- Type anything: app name, agent name, task, file, question
- Results: apps to open, agents to message, recent files, actions to take
- Feels like: Spotlight + AI assistant in one bar
- Example inputs:
  - "open roadwork" → loads RoadWork in right panel
  - "ask Valeria about the brand" → opens Valeria DM in RoadTrip
  - "search for my invoice from March" → opens RoadView scoped to files
  - "what is my team working on" → OfficeRoad summary surfaces

---

## Window Behavior (Right Panel)

- **Floating**: drag by title bar, resize from edges, stack freely
- **Full-screen**: any window can maximize to fill the entire browser
- **Tabs**: each open app has a tab — can have 10+ windows open at once
- **Snap**: windows can snap to left/right half or quarter of the panel
- **Persistent**: session is saved — reopen BlackRoad OS and everything is where you left it
- **Multi-monitor aware**: pop any window to a second screen

---

## Boot / Login Screen

- Animated — the road at night, headlights approaching
- Login with CarKeys (BlackRoad auth — passkey-first, no username/password required)
- After login: panels fade in, agents "arrive" in the office one by one
- Greeting: Road agent says something contextual — "Welcome back. You have 3 things waiting."

---

## Mobile Behavior

- Panels collapse — OfficeRoad becomes full screen by default
- Swipe left → RoadTrip
- Swipe right → Workspace
- Bottom nav bar: icons for each panel + command bar trigger
- Agents in OfficeRoad scale down — tap to interact

---

## Product Integration (What Opens in Right Panel)

Every BlackRoad product loads as a window in the right panel:

| App | What it opens as |
|-----|-----------------|
| RoadView | Search interface |
| Roadie | AI tutor chat |
| RoadChat | Standalone AI chat |
| RoadCode | Code editor |
| RoadWork | Business tools dashboard |
| RoadBook | Writing/publishing editor |
| RoadWorld | Game world builder |
| BlackBoard | Creative studio |
| CarKeys | Vault / security manager |
| RoadChain | Ledger / provenance viewer |
| RoadCoin | Token wallet / payments |
| OneWay | Data export manager |

---

## The Feel

When you open BlackRoad OS you should feel like you sat down at a desk that already knows you.

Your team is there. Your agents are working. Your tools are a click away. Nothing forgot anything. The road is always open.

---

*BlackRoad OS, Inc. — Remember the Road. Pave Tomorrow.*
