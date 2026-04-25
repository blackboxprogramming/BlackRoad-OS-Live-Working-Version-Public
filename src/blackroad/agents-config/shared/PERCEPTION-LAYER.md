# BlackRoad Perception Layer
# Hailo-8 NPU as the sensory nervous system for all agents
# "Remember the Road. Pave Tomorrow."

## The Idea

Every input to BlackRoad passes through Hailo before any agent sees it.
26 TOPS of perception. Not generation. Understanding.

The agents don't need faster text. They need eyes.

No cameras. Everything else.

---

## What Hailo Perceives (no cameras)

### Screenshots
Your Mac screen → screenshot → Hailo classifies:
- What app is open
- What state it's in (error, success, loading, editing)
- What text is visible (OCR)
- What UI elements are present (buttons, forms, terminals)
- Whether the design matches BlackRoad grayscale system

**Use case:** You screenshot an error. Before you paste it, Hailo already read it,
classified it as a deploy failure, extracted the error message, and routed it to
Gematria. By the time you type "fix this," she already knows what's broken.

### Uploaded Images
Any image entering BackRoad, RoadBook, BlackBoard, or any product:
- Auto-tag (what's in the image)
- Auto-describe (alt text generation)
- Content moderation (flag inappropriate)
- Brand compliance (does it match grayscale? wrong colors?)
- Duplicate detection (seen this image before?)
- Text extraction (OCR on any text in the image)

**Use case:** Someone uploads a logo to BlackBoard. Hailo instantly checks:
brand colors correct? Resolution sufficient? Similar to existing assets?
Routes feedback to Sapphira before the user even clicks save.

### Documents (PDF, DOCX, images of paper)
- Layout detection (headers, paragraphs, tables, lists, code blocks)
- Structure extraction (table of contents, sections, hierarchy)
- Text extraction (OCR for scanned documents)
- Classification (legal doc? research paper? invoice? code? notes?)
- Entity extraction (names, dates, amounts, URLs, emails)
- Route to correct agent based on content type

**Use case:** Drop a PDF into the ingest pipeline. Hailo reads it in <100ms,
classifies it as a research paper about quantum computing, extracts the abstract,
tags it with "amundson, quantum, mathematics," and routes it to Alexandria's
research index. No manual filing ever.

### Code Screenshots / Terminal Output
- Language detection (Python? JS? Bash? Error log?)
- Error detection (red text, stack traces, exception patterns)
- Diff detection (what changed between two screenshots)
- UI state detection (is this a passing test? failing build? deploy log?)

**Use case:** You screenshot your terminal showing a failed deploy. Hailo reads
the error in <50ms: "wrangler deploy failed: route conflict with blackroad-alfred."
Sends to Gematria who already knows the fix.

### Design Mockups / UI Screenshots
- Layout analysis (grid? sidebar? cards? nav?)
- Color extraction (what colors are used? brand compliant?)
- Component detection (buttons, inputs, modals, tables)
- Comparison (does this match the approved mockup?)
- Accessibility flags (contrast too low? text too small?)
- Spacing analysis (consistent margins? aligned elements?)

**Use case:** You take a screenshot of roadwork.blackroad.io. Hailo compares it
to the design system spec. "Header is 4px too tall. Border color is #1e1e1e,
should be #1a1a1a. Missing gradient bar." Sends to Athena for quality review.

### Diagrams / Whiteboard Photos / Handwritten Notes
- Shape detection (boxes, arrows, circles, lines)
- Relationship extraction (A connects to B, C contains D)
- Text extraction (handwritten or typed)
- Diagram type classification (flowchart, architecture, wireframe, mind map)
- Convert to structured data (mermaid diagram, JSON graph)

**Use case:** Photo of a whiteboard with architecture boxes and arrows.
Hailo extracts the graph: "Frontend → API Gateway → Backend → D1 Database."
Cecilia gets a structured architecture diagram without anyone drawing it digitally.

### Clipboard Content
- Image in clipboard → auto-classify and describe
- Screenshot pasted → OCR + context detection
- Chart/graph pasted → data extraction

**Use case:** Cmd+Shift+4 on Mac, paste into Lucidia. She sees it before
you describe it. "That's a Cloudflare dashboard showing 502 errors on
roadchain.blackroad.io. Checking now."

### File Thumbnails / Icons
- File type detection from visual appearance
- Batch classification of file grids (Finder screenshots)
- Folder structure understanding from visual tree screenshots

**Use case:** Screenshot your Finder window. Hailo reads every filename,
folder structure, and file type icon. "You have 14 unsorted files on Desktop.
3 are PDFs, 5 are screenshots, 2 are Word docs, 4 are folders."

### Product Screenshots (competitor analysis)
- UI pattern recognition (what product is this? what features visible?)
- Comparison to BlackRoad equivalents
- Feature gap detection
- Design pattern extraction

**Use case:** Screenshot of Notion. Hailo: "Notion showing kanban board with
5 columns, 23 cards, sidebar navigation, team avatars. BlackRoad equivalent:
OfficeRoad task board. Missing features: drag reorder, avatar display."

### Charts / Graphs / Data Visualizations
- Chart type detection (bar, line, pie, scatter, heatmap)
- Axis label reading
- Data point extraction
- Trend detection (going up? down? anomaly?)

**Use case:** Screenshot of a Cloudflare analytics dashboard. Hailo extracts:
"Traffic: 1,247 requests/day, 98.2% cache hit rate, top country: US."
Gematria gets structured metrics without anyone typing them.

### Email / Message Screenshots
- Sender/recipient extraction
- Subject/content OCR
- Sentiment detection
- Action item extraction
- Priority classification

**Use case:** Screenshot of an important email. Hailo reads it, extracts:
"From: investor@fund.com, Subject: Seed round interest, Sentiment: positive,
Action: schedule meeting." Routes to Cordelia for follow-up.

---

## Architecture

```
INPUT (any image/screenshot/document)
  │
  ▼
HAILO-8 NPU (26 TOPS, <100ms per frame)
  │
  ├── Classify (what type of content?)
  ├── Extract (what text/data/structure?)
  ├── Detect (what objects/patterns/anomalies?)
  └── Compare (does it match expectations?)
  │
  ▼
PERCEPTION EVENT
  {
    source: "screenshot" | "upload" | "clipboard" | "document" | "paste",
    type: "terminal" | "code" | "design" | "document" | "chart" | "email" | "ui",
    extracted_text: "...",
    classifications: [...],
    entities: [...],
    anomalies: [...],
    confidence: 0.95,
    timestamp: "2026-04-21T...",
    route_to: "gematria" | "athena" | "alexandria" | ...
  }
  │
  ▼
AGENT ROUTING
  │
  ├── Error detected → Gematria (fix/deploy)
  ├── Document detected → Alexandria (index/catalog)
  ├── Design issue → Athena (quality review)
  ├── Architecture diagram → Cecilia (plan/design)
  ├── Research paper → Alexandria (research index)
  ├── Code screenshot → Roadie (build/fix)
  ├── Message/email → Cordelia (communicate)
  └── Unknown → Lucidia (orchestrate)
```

## Where Hailo Lives

- **Cecilia** (192.168.4.113) — Hailo-8, /dev/hailo0, hailort 4.23.0, Python API ready
- Processing pipeline: image → Hailo NPU → structured perception event → agent inbox
- All processing local. No cloud. No API calls. Sovereign perception.

## What This Enables

1. **Paste-to-understand** — paste any image, Lucidia sees it instantly
2. **Auto-filing** — documents classify and route themselves
3. **Design enforcement** — every UI screenshot checked against brand rules
4. **Error interception** — terminal errors caught before you report them
5. **Research ingestion** — papers and docs auto-indexed from images
6. **Competitive intelligence** — competitor screenshots auto-analyzed
7. **Accessibility auditing** — every UI checked for contrast/spacing
8. **Data extraction** — charts and dashboards become structured data

## 26 TOPS In Context

- 26,000,000,000,000 operations per second
- At 30fps equivalent: 866 billion operations per "frame"
- A single screenshot analysis: ~100ms
- Batch processing 100 documents: ~10 seconds
- Real-time clipboard monitoring: continuous, zero-latency feel
- Power consumption: 2.5 watts

One chip. On one Pi. Making every agent aware of everything visual
that enters the system. Before you describe it. Before you file it.
Before you even finish pasting it.

The agents don't just process text. They see.

---

*Remember the Road. Pave Tomorrow.*
*BlackRoad OS, Inc. — 2025-2026*
