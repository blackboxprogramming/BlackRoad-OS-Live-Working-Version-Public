# BlackRoad OS v0.2 Design Note

## Pillars
- **Chaos & Neurodivergent Support:** generic CaptureItem model + Chaos Inbox UI to hold loose scraps, clusters, and resurfacing.
- **Unified Identity & Duplication Killer:** UserProfile model + Identity Center app exposes a single canonical record for apps.
- **Attention & Notification Engine:** Notification model/API plus Notification Center focus modes.
- **Unified Search & Knowledge:** lightweight command palette (Ctrl/Cmd+K) that searches apps, captured items, and creator projects; backend search endpoint for future plumbing.
- **Creator Workspace Baseline:** CreativeProject model + Creator Studio to centralize creative work and assets.
- **Enterprise & Compliance Surface:** ComplianceEvent model + Compliance & Ops UI for audits/workflows.
- **Hardware & Pi Ops Visibility:** Pi Ops kept in registry; Chaos clusters track hardware notes; hooks for energy/compute tagging documented.
- **Accessibility & UX:** High-contrast theme, keyboard-friendly palette, ARIA labels for launcher/palette.

## Data Models
- `CaptureItem` + `CaptureCluster` (capture.py) for multi-modal scraps with tags/status.
- `UserProfile` (identity_profile.py) canonical identity, external IDs.
- `Notification` (notification.py) app-level alerts with importance/delivery.
- `CreativeProject` (creator.py) type/status/assets/revenue/notes.
- `ComplianceEvent` (compliance_event.py) actor/action/resource/severity metadata.

## APIs
- Capture: `POST/GET /api/capture/items`, tagging, status, clusters.
- Identity: `GET/PUT /api/identity/profile`, linked accounts, link external IDs.
- Notifications: `POST/GET /api/notifications`, mark read.
- Creator: CRUD under `/api/creator/projects`.
- Compliance: `/api/compliance/events` list.
- Search: `/api/search?q=` unified lookup scaffold.

## Frontend Surfaces
- New apps: Chaos Inbox, Identity Center, Creator Studio, Compliance & Ops.
- Notification Center adds focus modes; command palette overlays globally.
- High-contrast theme added to theme cycle; new CSS for command palette and apps.

## Safety & Next Steps
- All models auto-migrate via SQLAlchemy create_all; endpoints gated by `get_current_active_user`.
- Future work: agent-powered clustering, real notifications toasts->backend, Pi energy telemetry, app SDK hook for identity fetch.
