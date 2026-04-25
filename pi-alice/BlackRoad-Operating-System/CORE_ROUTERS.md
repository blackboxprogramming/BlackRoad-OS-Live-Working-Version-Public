# BlackRoad OS v0 - Router Analysis & Categorization

**Generated**: 2025-11-18
**Branch**: `claude/go-cece-go-016Tb6VLbDJmjyvatTkSeZxY`
**Purpose**: Define which routers are KEEP/PARK/CUT for v0 thin vertical slice

---

## Executive Summary

**Total Routers**: 36
**Frontend-Called Routers**: 10
**v0 KEEP Routers**: 11 (10 frontend + 1 health)
**PARK Routers**: 14 (large, not v0-critical)
**CUT Routers**: 11 (small stubs, experimental)

---

## KEEP: Core v0 Routers (11 total)

These routers are **actively called by the frontend** or **critical for v0 operation**.

| Router | Prefix | Lines | Called By | Purpose |
|--------|--------|-------|-----------|---------|
| **auth** | `/api/auth` | ~200 | Frontend | Login, register, logout, session management |
| **blockchain** | `/api/blockchain` | ~450 | Frontend | Wallet, transactions, blocks, mining |
| **miner** | `/api/miner` | ~300 | Frontend | Mining status, control, pool management |
| **devices** | `/api/devices` | 643 | Frontend | Raspberry Pi, IoT device management |
| **email** | `/api/email` | ~250 | Frontend | RoadMail inbox, sent, compose |
| **social** | `/api/social` | ~300 | Frontend | BlackRoad Social feed, posts, likes, comments |
| **video** | `/api/videos` | ~250 | Frontend | BlackStream videos, likes, views |
| **ai_chat** | `/api/ai-chat` | ~350 | Frontend | AI conversations, messages |
| **files** | `/api/files` | ~200 | Frontend | File manager, folders, uploads |
| **system** | `/api/system` | 83 | Frontend | OS version, config, state |
| **`/health`** | `/health` | (in main.py) | Railway, monitoring | Health check for deployment |

**Action**: ✅ **KEEP** - These must remain active for v0.

---

## CONSIDER: Potentially Useful (3 total)

These routers are **substantial** but **not currently called by frontend**. Evaluate case-by-case.

| Router | Prefix | Lines | Purpose | Decision |
|--------|--------|-------|---------|----------|
| **dashboard** | `/api/dashboard` | 519 | Unified services overview, aggregates stats from all apps | **PARK** - Useful but not v0-critical |
| **agents** | `/api/agents` | 347 | Exposes 208-agent library via API | **PARK** - Cool feature, but not v0-critical |
| **api_health** | `/api/health` | 389 | Service health monitoring, uptime tracking | **PARK** - Overlaps with `/health`, not critical |

**Action**: ⚠️ **PARK** - Move to `_archive/`, can restore later.

---

## PARK: Integration Routers (11 total)

These are **API integration routers** for external services. Not needed for v0 core functionality.

| Router | Prefix | Lines | Purpose |
|--------|--------|-------|---------|
| **railway** | `/api/railway` | 395 | Railway deployment management |
| **vercel** | `/api/vercel` | 426 | Vercel project automation |
| **stripe** | `/api/stripe` | ~300 | Payment processing |
| **twilio** | `/api/twilio` | ~200 | SMS/phone messaging |
| **slack** | `/api/slack` | ~250 | Slack workspace automation |
| **discord** | `/api/discord` | ~250 | Discord community integrations |
| **sentry** | `/api/sentry` | 382 | Error monitoring hooks |
| **github** | `/api/github` | 433 | GitHub automation, repos, issues |
| **huggingface** | `/api/huggingface` | ~200 | AI model integrations |
| **digitalocean** | `/api/digitalocean` | ~350 | DigitalOcean droplets, domains |
| **cloudflare** | `/api/cloudflare` | ~300 | Cloudflare DNS, zones, workers |

**Action**: 📦 **PARK** - Move to `backend/app/routers/_integrations/`, comment out in `main.py`.

---

## CUT: Experimental/Stub Routers (11 total)

These are **small routers** (36-150 lines) that are experimental, incomplete, or not wired to frontend.

| Router | Prefix | Lines | Purpose | Status |
|--------|--------|-------|---------|--------|
| **browser** | `/api/browser` | 414 | In-OS browser (not in frontend) | Stub |
| **games** | `/api/games` | 491 | Gaming platform (not in frontend) | Stub |
| **vscode** | `/api/vscode` | ~200 | VSCode integration (not in frontend) | Stub |
| **capture** | `/api/capture` | 150 | Screen/video capture | Minimal |
| **compliance_ops** | `/api/compliance` | 36 | Compliance operations | Minimal stub |
| **creator** | `/api/creator` | 85 | Creator tools | Minimal stub |
| **identity_center** | `/api/identity` | 123 | Identity management | Minimal stub |
| **notifications_center** | `/api/notifications` | 81 | Notification center | Minimal stub |
| **search** | `/api/search` | 88 | Global search | Minimal stub |
| **operator_webhooks** | `/api/operator/webhooks` | 81 | Operator webhooks | Minimal stub |
| **webhooks** | `/api/webhooks` | ~100 | GitHub webhooks (Phase Q) | Experimental |
| **prism_static** | `/prism/*` | 89 | Prism console static files | Separate app |

**Action**: ✂️ **CUT** - Comment out in `main.py`, move to `backend/app/routers/_experimental/` or delete.

---

## Frontend API Call Map

**All API calls found in `backend/static/js/` (extracted from api-client.js + apps.js + auth.js + core-os-client.js):**

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Blockchain
- `GET /api/blockchain/wallet`
- `GET /api/blockchain/balance`
- `GET /api/blockchain/transactions`
- `GET /api/blockchain/transactions/{txHash}`
- `POST /api/blockchain/transactions`
- `GET /api/blockchain/blocks`
- `GET /api/blockchain/blocks/{blockId}`
- `POST /api/blockchain/mine`
- `GET /api/blockchain/stats`

### Miner
- `GET /api/miner/status`
- `GET /api/miner/stats`
- `GET /api/miner/blocks`
- `POST /api/miner/control`
- `GET /api/miner/pool/info`

### Devices
- `GET /api/devices/`
- `GET /api/devices/stats`
- `GET /api/devices/{deviceId}`
- `POST /api/devices/`
- `PUT /api/devices/{deviceId}`
- `DELETE /api/devices/{deviceId}`

### Email
- `GET /api/email/folders`
- `GET /api/email/inbox`
- `GET /api/email/sent`
- `GET /api/email/{emailId}`
- `POST /api/email/send`
- `DELETE /api/email/{emailId}`

### Social
- `GET /api/social/feed`
- `POST /api/social/posts`
- `POST /api/social/posts/{postId}/like`
- `GET /api/social/posts/{postId}/comments`
- `POST /api/social/posts/{postId}/comments`
- `POST /api/social/users/{userId}/follow`

### Video
- `GET /api/videos`
- `GET /api/videos/{videoId}`
- `POST /api/videos/{videoId}/like`

### AI Chat
- `GET /api/ai-chat/conversations`
- `POST /api/ai-chat/conversations`
- `GET /api/ai-chat/conversations/{conversationId}`
- `GET /api/ai-chat/conversations/{conversationId}/messages`
- `POST /api/ai-chat/conversations/{conversationId}/messages`
- `DELETE /api/ai-chat/conversations/{conversationId}`

### Files
- `GET /api/files/folders`
- `GET /api/files`
- `GET /api/files/{fileId}`
- `DELETE /api/files/{fileId}`

### System
- `GET /api/system/version`
- `GET /api/system/config/public`
- `GET /api/system/os/state`

### Health
- `GET /health` (core endpoint, not in a router)

---

## Routers NOT Called by Frontend

**These 25 routers exist but are not called by current frontend:**

agents, api_health, browser, capture, cloudflare, compliance_ops, creator, dashboard, digitalocean, discord, games, github, huggingface, identity_center, notifications_center, operator_webhooks, prism_static, railway, search, sentry, slack, stripe, twilio, vercel, vscode, webhooks

---

## Recommendations for v0

### Immediate Actions

1. **Keep these 11 routers active:**
   - auth, blockchain, miner, devices, email, social, video, ai_chat, files, system
   - Plus `/health` endpoint in `main.py`

2. **Move integrations to `_integrations/`:**
   - Create `backend/app/routers/_integrations/`
   - Move: railway, vercel, stripe, twilio, slack, discord, sentry, github, huggingface, digitalocean, cloudflare
   - Comment out in `main.py`

3. **Move experimental to `_experimental/`:**
   - Create `backend/app/routers/_experimental/`
   - Move: browser, games, vscode, capture, compliance_ops, creator, identity_center, notifications_center, search, operator_webhooks, webhooks, prism_static
   - Comment out in `main.py`

4. **Park potentially useful routers:**
   - Move dashboard, agents, api_health to `_experimental/` for now
   - Can restore later when frontend needs them

### Database Dependencies

**Check these models are needed for KEEP routers:**
- User (auth)
- Block, Transaction, Wallet (blockchain)
- Device (devices)
- Email (email)
- Post, Like, Comment (social)
- Video (video)
- Conversation, Message (ai_chat)
- File, Folder (files)

**Models for PARK/CUT routers can be left in place** (no harm, just unused).

### Environment Variables

**Required for v0 KEEP routers:**
- `SECRET_KEY` (auth)
- `DATABASE_URL` (all routers)
- `REDIS_URL` (sessions, caching)
- `OPENAI_API_KEY` (ai_chat)
- `SMTP_*` variables (email - optional if email is stub)
- `AWS_*` variables (files - optional if files is stub)

**Not required for v0:**
- `STRIPE_*`, `TWILIO_*`, `SLACK_*`, `DISCORD_*`, `GITHUB_*`, etc. (all integration routers)

---

## Testing Strategy

**After reorganization, test:**

1. **Start backend**: `uvicorn app.main:app --reload`
2. **Check startup logs**: No import errors for moved routers
3. **Hit `/health`**: Returns `{"status": "healthy"}`
4. **Load frontend**: `http://localhost:8000/`
5. **Test auth**: Register/login works
6. **Test one app**: e.g., Wallet or AI Chat
7. **Check browser console**: No 404 errors for API calls

---

## Next Steps

See `ROUTER_PLAN.md` for detailed execution plan.

---

**End of Router Analysis**
