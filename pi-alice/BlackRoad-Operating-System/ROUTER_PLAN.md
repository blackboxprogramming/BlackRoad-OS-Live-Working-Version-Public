# BlackRoad OS v0 - Router Cleanup Execution Plan

**Generated**: 2025-11-18
**Branch**: `claude/go-cece-go-016Tb6VLbDJmjyvatTkSeZxY`
**Based On**: CORE_ROUTERS.md analysis
**Estimated Time**: 2-3 hours (across 7 phases)

---

## Overview

**Goal**: Reduce backend from 36 routers to 11 core routers for v0.

**Strategy**: Surgical refactor - move routers to organized directories, comment out in main.py, preserve all code for later.

**Outcome**: Clean v0 boundary, reliable Railway deploy, maintainable codebase.

---

## Phase 1: Create Archive Directories (5 min)

### Tasks

1. Create directory structure:
   ```bash
   mkdir -p backend/app/routers/_integrations
   mkdir -p backend/app/routers/_experimental
   ```

2. Create README files:

   **`backend/app/routers/_integrations/README.md`:**
   ```markdown
   # Integration Routers (Parked for Post-v0)

   These routers provide integrations with external services:
   - Railway, Vercel, Stripe, Twilio, Slack, Discord, Sentry
   - GitHub, HuggingFace, DigitalOcean, Cloudflare

   **Status**: Not required for v0. Can be restored when needed.
   **How to restore**: Move router file back to parent directory, uncomment in main.py.
   ```

   **`backend/app/routers/_experimental/README.md`:**
   ```markdown
   # Experimental Routers (Parked for Post-v0)

   These routers are experimental, incomplete, or not yet wired to frontend:
   - browser, games, vscode - Future apps
   - capture, compliance_ops, creator, identity_center, notifications_center, search - Minimal stubs
   - operator_webhooks, webhooks, prism_static - Infrastructure features
   - dashboard, agents, api_health - Potentially useful, not v0-critical

   **Status**: Experimental. Can be restored when needed.
   **How to restore**: Move router file back to parent directory, uncomment in main.py.
   ```

### Success Criteria
- ✅ Directories exist
- ✅ README files in place

---

## Phase 2: Move Integration Routers (10 min)

### Tasks

Move these 11 routers to `_integrations/`:

```bash
cd backend/app/routers

mv railway.py _integrations/
mv vercel.py _integrations/
mv stripe.py _integrations/
mv twilio.py _integrations/
mv slack.py _integrations/
mv discord.py _integrations/
mv sentry.py _integrations/
mv github.py _integrations/
mv huggingface.py _integrations/
mv digitalocean.py _integrations/
mv cloudflare.py _integrations/
```

### Success Criteria
- ✅ 11 files moved to `_integrations/`
- ✅ Original locations empty

---

## Phase 3: Move Experimental Routers (10 min)

### Tasks

Move these 14 routers to `_experimental/`:

```bash
cd backend/app/routers

mv browser.py _experimental/
mv games.py _experimental/
mv vscode.py _experimental/
mv capture.py _experimental/
mv compliance_ops.py _experimental/
mv creator.py _experimental/
mv identity_center.py _experimental/
mv notifications_center.py _experimental/
mv search.py _experimental/
mv operator_webhooks.py _experimental/
mv webhooks.py _experimental/
mv prism_static.py _experimental/
mv dashboard.py _experimental/
mv agents.py _experimental/
mv api_health.py _experimental/
```

### Success Criteria
- ✅ 14 files moved to `_experimental/`
- ✅ Original locations empty

---

## Phase 4: Update main.py Imports (15 min)

### Tasks

**Current `main.py` imports (lines 13-19):**
```python
from app.routers import (
    auth, email, social, video, files, blockchain, ai_chat, devices, miner,
    digitalocean, github, huggingface, vscode, games, browser, dashboard,
    railway, vercel, stripe, twilio, slack, discord, sentry, api_health, agents,
    capture, identity_center, notifications_center, creator, compliance_ops,
    search, cloudflare, system, webhooks
    search, cloudflare, prism_static
)
```

**New `main.py` imports (KEEP only):**
```python
from app.routers import (
    auth, email, social, video, files, blockchain, ai_chat, devices, miner, system
)
```

**Full edit:**

Find this block (lines 13-20):
```python
from app.routers import (
    auth, email, social, video, files, blockchain, ai_chat, devices, miner,
    digitalocean, github, huggingface, vscode, games, browser, dashboard,
    railway, vercel, stripe, twilio, slack, discord, sentry, api_health, agents,
    capture, identity_center, notifications_center, creator, compliance_ops,
    search, cloudflare, system, webhooks
    search, cloudflare, prism_static
)
```

Replace with:
```python
from app.routers import (
    auth, email, social, video, files, blockchain, ai_chat, devices, miner, system
)

# Integrations (parked for post-v0)
# from app.routers._integrations import (
#     railway, vercel, stripe, twilio, slack, discord, sentry,
#     github, huggingface, digitalocean, cloudflare
# )

# Experimental (parked for post-v0)
# from app.routers._experimental import (
#     browser, games, vscode, capture, compliance_ops, creator,
#     identity_center, notifications_center, search, operator_webhooks,
#     webhooks, prism_static, dashboard, agents, api_health
# )
```

**Update router registrations (lines 121-171):**

Comment out all non-KEEP router registrations:

**KEEP these (10 routers):**
```python
app.include_router(auth.router)
app.include_router(email.router)
app.include_router(social.router)
app.include_router(video.router)
app.include_router(files.router)
app.include_router(blockchain.router)
app.include_router(ai_chat.router)
app.include_router(devices.router)
app.include_router(miner.router)
app.include_router(system.router)
```

**COMMENT OUT these (26 routers):**
```python
# Integration routers (parked for post-v0)
# app.include_router(digitalocean.router)
# app.include_router(github.router)
# app.include_router(huggingface.router)
# app.include_router(railway.router)
# app.include_router(vercel.router)
# app.include_router(stripe.router)
# app.include_router(twilio.router)
# app.include_router(slack.router)
# app.include_router(discord.router)
# app.include_router(sentry.router)
# app.include_router(cloudflare.router)

# Experimental routers (parked for post-v0)
# app.include_router(vscode.router)
# app.include_router(games.router)
# app.include_router(browser.router)
# app.include_router(dashboard.router)
# app.include_router(capture.router)
# app.include_router(identity_center.router)
# app.include_router(notifications_center.router)
# app.include_router(creator.router)
# app.include_router(compliance_ops.router)
# app.include_router(search.router)
# app.include_router(api_health.router)
# app.include_router(agents.router)
# app.include_router(webhooks.router)
# app.include_router(prism_static.router)
```

**Also remove Prism static mount (lines 165-171):**
```python
# Prism Console (Phase 2.5) - Parked for post-v0
# prism_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "prism-console")
# if os.path.exists(prism_dir):
#     app.mount("/prism", StaticFiles(directory=prism_dir, html=True), name="prism")
#     print(f"✅ Prism Console mounted at /prism")
```

### Success Criteria
- ✅ Only 10 routers imported
- ✅ Only 10 routers registered
- ✅ 25+ routers commented out with clear labels
- ✅ Prism mount commented out

---

## Phase 5: Test Backend Startup (10 min)

### Tasks

1. **Start backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Check startup output:**
   - No import errors
   - Database tables created successfully
   - Server running message
   - No missing module errors

3. **Test health endpoint:**
   ```bash
   curl http://localhost:8000/health
   ```
   Expected: `{"status":"healthy","timestamp":...}`

4. **Check API docs:**
   - Visit: http://localhost:8000/api/docs
   - Verify only 10 router groups visible:
     - auth, email, social, video, files, blockchain, ai_chat, devices, miner, system
   - No integration/experimental routers visible

### Success Criteria
- ✅ Backend starts without errors
- ✅ `/health` returns 200
- ✅ API docs show only 10 router groups
- ✅ No 404s or import errors in console

---

## Phase 6: Test Frontend Integration (15 min)

### Tasks

1. **Load frontend:**
   - Visit: http://localhost:8000/
   - Should see BlackRoad OS desktop

2. **Test authentication:**
   - Click "Register" → Create account → Should succeed
   - Login with new account → Should succeed
   - Desktop should load after login

3. **Test one app (Wallet):**
   - Double-click "Wallet" icon
   - Window should open
   - Should see wallet address, balance (may be 0)
   - No console errors

4. **Check browser console:**
   - Open DevTools → Console tab
   - Should see no 404 errors
   - Should see no "Failed to fetch" errors for core endpoints

5. **Test AI Chat (if OpenAI key set):**
   - Double-click "AI Chat" icon
   - Should see "New Conversation" button
   - Create conversation → Should succeed
   - Send message → Should get response (or clear error if no API key)

### Success Criteria
- ✅ Frontend loads
- ✅ Auth works (register + login)
- ✅ At least one app works end-to-end
- ✅ No console errors for core API calls
- ✅ No 404s for missing routers

---

## Phase 7: Run Backend Tests (15 min)

### Tasks

1. **Run test suite:**
   ```bash
   cd backend
   source .venv-tests/bin/activate  # or create new venv
   pytest -v --maxfail=1
   ```

2. **Check test results:**
   - Tests for KEEP routers should pass:
     - test_auth.py (register, login, logout)
     - test_blockchain.py (wallet, transactions, blocks)
     - test_miner.py (status, control)
   - Tests for PARK/CUT routers may fail (expected - we removed them)

3. **Document failing tests:**
   - If tests fail for PARK/CUT routers, that's OK
   - If tests fail for KEEP routers, investigate

### Success Criteria
- ✅ At least 50% of tests pass
- ✅ No tests fail for KEEP routers
- ✅ Failing tests are only for PARK/CUT routers

---

## Phase 8: Update Documentation (10 min)

### Tasks

1. **Update `CLAUDE.md`:**
   - Add note: "As of 2025-11-18, v0 uses 10 core routers. Integration and experimental routers are parked in `_integrations/` and `_experimental/`."
   - Update router count from "33+ routers" to "10 core routers (25+ parked)"

2. **Update `README.md`:**
   - Add section on v0 scope
   - List active features:
     - Authentication
     - Blockchain & Mining
     - Devices (IoT)
     - Email
     - Social Feed
     - Video Streaming
     - AI Chat
     - File Manager
   - Note: "Additional integrations and features available in post-v0 releases"

3. **Create `CHANGELOG.md` entry:**
   ```markdown
   ## v0.1.0 - 2025-11-18

   ### Changed
   - Reduced backend from 36 routers to 10 core routers for v0 release
   - Moved integration routers (Railway, Vercel, Stripe, etc.) to `_integrations/`
   - Moved experimental routers (browser, games, dashboard, etc.) to `_experimental/`

   ### Core Features (v0)
   - ✅ Authentication (register, login, logout)
   - ✅ Blockchain (wallet, transactions, blocks, mining)
   - ✅ Mining (pool management, status, control)
   - ✅ Devices (Raspberry Pi, IoT device management)
   - ✅ Email (RoadMail inbox, compose, send)
   - ✅ Social (BlackRoad Social feed, posts, likes, comments)
   - ✅ Video (BlackStream videos, likes, views)
   - ✅ AI Chat (conversations with AI assistant)
   - ✅ Files (file manager, folders, uploads)
   - ✅ System (OS version, config, state)

   ### Parked Features (Post-v0)
   - 🅿️ API Integrations (11 services)
   - 🅿️ Experimental Features (14 routers)
   - 🅿️ Prism Console (admin interface)

   ### Technical Improvements
   - Cleaner main.py with organized imports
   - Faster startup (fewer routers to initialize)
   - Smaller API surface area (easier to secure)
   - Clear v0 boundary (easier to extend later)
   ```

### Success Criteria
- ✅ CLAUDE.md updated
- ✅ README.md updated with v0 scope
- ✅ CHANGELOG.md entry added

---

## Commit & Push (5 min)

### Tasks

1. **Stage changes:**
   ```bash
   git add backend/app/routers/
   git add backend/app/main.py
   git add CORE_ROUTERS.md ROUTER_PLAN.md
   git add CLAUDE.md README.md CHANGELOG.md
   ```

2. **Commit:**
   ```bash
   git commit -m "$(cat <<'EOF'
   Reorganize routers for v0: Keep 10 core, park 25 integrations/experimental

   - Move 11 integration routers to _integrations/ (Railway, Stripe, etc.)
   - Move 14 experimental routers to _experimental/ (browser, games, dashboard, etc.)
   - Update main.py to import/register only 10 core routers
   - Add CORE_ROUTERS.md with full analysis and categorization
   - Add ROUTER_PLAN.md with execution plan
   - Update documentation (CLAUDE.md, README.md, CHANGELOG.md)

   Core v0 routers:
   - auth, email, social, video, files, blockchain, ai_chat, devices, miner, system

   All parked routers preserved and can be restored later.
   Tests pass for core routers. Frontend integration verified.
   EOF
   )"
   ```

3. **Push:**
   ```bash
   git push -u origin claude/go-cece-go-016Tb6VLbDJmjyvatTkSeZxY
   ```

### Success Criteria
- ✅ All changes committed
- ✅ Clear commit message
- ✅ Pushed to GitHub

---

## Railway Deployment Prep (Phase 9)

### Tasks

**This phase happens AFTER local testing is successful.**

1. **Validate `.env.example`:**
   - Ensure it has all required variables for v0:
     - SECRET_KEY
     - DATABASE_URL
     - REDIS_URL
     - OPENAI_API_KEY (optional)
     - SMTP_* (optional)
     - AWS_* (optional)

2. **Check Railway env vars:**
   - Log into Railway dashboard
   - Verify these are set:
     - `DATABASE_URL` (Railway Postgres)
     - `REDIS_URL` (Railway Redis or external)
     - `SECRET_KEY` (generate if missing)
     - `ENVIRONMENT=production`
     - `DEBUG=False`

3. **Validate `railway.toml`:**
   - Health check path: `/health` ✅ (already correct)
   - Dockerfile path: `backend/Dockerfile` ✅ (already correct)
   - Start command: handled by Dockerfile ✅ (already correct)

4. **Test health check locally:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy","timestamp":...}`

### Success Criteria
- ✅ `.env.example` has all required vars
- ✅ Railway env vars are set
- ✅ `railway.toml` is correct
- ✅ `/health` endpoint works

---

## Railway Deploy (Phase 10)

### Tasks

1. **Trigger deploy:**
   - Push to main branch (or configured branch)
   - Railway auto-deploys
   - Or manual: `railway up`

2. **Monitor build logs:**
   - Check Railway dashboard → Deployments
   - Watch for:
     - Docker build success
     - Python dependencies install
     - App startup
     - Health check pass

3. **Check deploy status:**
   - Railway should show "Healthy" status
   - Health check should pass within 40 seconds

4. **Test deployed endpoints:**
   ```bash
   # Replace with your Railway URL
   RAILWAY_URL="https://blackroad-os-production.up.railway.app"

   curl $RAILWAY_URL/health
   curl $RAILWAY_URL/api
   ```

5. **Test frontend:**
   - Visit Railway URL in browser
   - Should see BlackRoad OS desktop
   - Test auth (register/login)
   - Test one app (Wallet or AI Chat)

### Success Criteria
- ✅ Deploy succeeds
- ✅ Health check passes
- ✅ `/health` returns 200
- ✅ Frontend loads
- ✅ Auth works
- ✅ At least one app works

---

## Rollback Plan

**If something breaks during cleanup:**

1. **Revert main.py changes:**
   ```bash
   git checkout HEAD~1 backend/app/main.py
   ```

2. **Move routers back:**
   ```bash
   mv backend/app/routers/_integrations/* backend/app/routers/
   mv backend/app/routers/_experimental/* backend/app/routers/
   ```

3. **Restart backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Test:**
   - Should be back to 36 routers
   - All endpoints restored

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Import errors after move** | Medium | High | Test locally first, use try/except if needed |
| **Frontend 404s** | Low | Medium | Frontend only calls 10 core routers, verified in Phase 1 |
| **Database migration fails** | Low | High | Not changing DB schema, just router organization |
| **Railway deploy fails** | Medium | High | Test locally first, validate env vars, check health endpoint |
| **Missing env var** | Medium | Medium | Validate `.env.example` vs `config.py` defaults |
| **Redis not available** | Low | Medium | Check Railway services, app has Redis URL default |

---

## Definition of Done

**v0 is ready when:**

- ✅ Backend has 10 core routers only
- ✅ 25 routers moved to `_integrations/` and `_experimental/`
- ✅ Backend starts without errors locally
- ✅ `/health` returns 200
- ✅ Frontend loads at `/`
- ✅ Auth works (register + login)
- ✅ At least 3 apps work (Wallet, AI Chat, Social)
- ✅ No console errors for core API calls
- ✅ Railway deploy succeeds
- ✅ Railway health check passes
- ✅ Documentation updated (CLAUDE.md, README.md, CHANGELOG.md)
- ✅ Changes committed and pushed to GitHub

---

## Next Steps After v0

**Future roadmap (post-v0):**

1. **Restore integrations one-by-one:**
   - Move router back from `_integrations/`
   - Uncomment in `main.py`
   - Add env vars
   - Test integration
   - Document in README

2. **Complete experimental features:**
   - Browser, Games, VSCode apps
   - Dashboard aggregation
   - Agent API exposure
   - Prism Console

3. **Add missing tests:**
   - Increase coverage for core routers
   - Add integration tests
   - Add E2E tests

4. **Database migration cleanup:**
   - Remove `Base.metadata.create_all()` from startup
   - Use Alembic only (as flagged in CLAUDE.md)
   - Add migration validation to CI

5. **Frontend enhancements:**
   - Add error boundaries
   - Add loading states
   - Add offline support
   - Add PWA manifest

---

## Total Time Estimate

| Phase | Time | Cumulative |
|-------|------|------------|
| 1. Create directories | 5 min | 5 min |
| 2. Move integrations | 10 min | 15 min |
| 3. Move experimental | 10 min | 25 min |
| 4. Update main.py | 15 min | 40 min |
| 5. Test backend | 10 min | 50 min |
| 6. Test frontend | 15 min | 65 min |
| 7. Run tests | 15 min | 80 min |
| 8. Update docs | 10 min | 90 min |
| 9. Commit & push | 5 min | 95 min |
| 10. Railway prep | 10 min | 105 min |
| 11. Railway deploy | 15 min | 120 min |

**Total: ~2 hours** (can be done in phases, doesn't need to be continuous)

---

## Phone-Friendly Summary

**For quick reference on iPhone:**

1. ✅ Move 11 integrations to `_integrations/`
2. ✅ Move 14 experimental to `_experimental/`
3. ✅ Update `main.py` to import only 10 core routers
4. ✅ Test locally (backend + frontend)
5. ✅ Run tests
6. ✅ Update docs
7. ✅ Commit + push
8. ✅ Validate Railway env vars
9. ✅ Deploy to Railway
10. ✅ Test production deploy

**Core routers to keep:**
auth, email, social, video, files, blockchain, ai_chat, devices, miner, system

**Everything else goes to `_integrations/` or `_experimental/`**

---

**End of Execution Plan**
