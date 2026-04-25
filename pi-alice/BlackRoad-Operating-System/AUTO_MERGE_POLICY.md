# 🔀 AUTO-MERGE POLICY

> **BlackRoad Operating System — Phase Q**
> **Purpose**: Define when and how PRs automatically merge
> **Owner**: Operator Alexa (Cadillac)
> **Last Updated**: 2025-11-18

---

## Policy Overview

This document defines the **official policy** for automatic PR merging in the BlackRoad GitHub organization.

**Philosophy**: **Automate the safe, delegate the complex, escalate the critical**

---

## Auto-Merge Decision Tree

```
PR Created
    │
    ├─> Has 'do-not-merge' label? ─────> ❌ BLOCK (manual only)
    │
    ├─> Has 'breaking-change' label? ──> ❌ BLOCK (human review required)
    │
    ├─> Has 'security' label? ─────────> ❌ BLOCK (security review required)
    │
    ├─> Has 'wip' label? ──────────────> ❌ BLOCK (work in progress)
    │
    ├─> Docs-only changes? ────────────> ✅ AUTO-MERGE (Tier 1)
    │
    ├─> Tests-only changes? ───────────> ✅ AUTO-MERGE (Tier 2)
    │
    ├─> Scaffold/stub code? ───────────> ✅ AUTO-MERGE (Tier 3)
    │
    ├─> AI-generated + tests pass? ────> ✅ AUTO-MERGE (Tier 4, 5 min soak)
    │
    ├─> Dependency patch/minor? ───────> ✅ AUTO-MERGE (Tier 5, 30 min soak)
    │
    ├─> Infrastructure changes? ───────> ⚠️ MANUAL MERGE REQUIRED
    │
    └─> Other changes ─────────────────> ⚠️ HUMAN REVIEW REQUIRED
```

---

## Auto-Merge Tiers

### Tier 1: Documentation (Immediate Auto-Merge)

**Criteria**:
- ✅ Only files in `docs/`, `*.md` (excluding `SECURITY.md`)
- ✅ Markdown linting passes
- ✅ No `breaking-change` label
- ✅ No `security` label

**Approval**: Automatic (docs-bot)
**Soak Time**: 0 minutes
**Merge Method**: Squash
**Rationale**: Documentation changes are low-risk and high-value

**Example PRs**:
- Fix typo in README
- Add API documentation
- Update architecture diagrams
- Expand user guide

**Blockers**:
- ❌ Changes to `SECURITY.md` (requires human review)
- ❌ Changes to `.github/` workflows (infra, not docs)

---

### Tier 2: Tests (Immediate Auto-Merge)

**Criteria**:
- ✅ Only files in `**/tests/`, `**/*test*.py`, `**/*.test.js`
- ✅ All existing tests pass
- ✅ New tests pass (if added)
- ✅ Code coverage does not decrease
- ✅ No `breaking-change` label

**Approval**: Automatic (test-bot)
**Soak Time**: 0 minutes
**Merge Method**: Squash
**Rationale**: More tests = better quality, hard to break prod with tests

**Example PRs**:
- Add unit tests for auth module
- Add integration tests for API
- Add E2E tests for UI flow
- Improve test coverage

**Blockers**:
- ❌ Tests fail
- ❌ Code coverage decreases
- ❌ Test files + production code (mixed change)

---

### Tier 3: Scaffolding (5-Minute Soak, Auto-Merge)

**Criteria**:
- ✅ New files only (no modifications to existing files)
- ✅ Mostly comments, type stubs, TODOs, or template code
- ✅ Linting/type checking passes
- ✅ Size: < 200 lines
- ✅ No logic errors (syntax errors fail CI)

**Approval**: Automatic (scaffold-bot)
**Soak Time**: 5 minutes
**Merge Method**: Squash
**Rationale**: Scaffolds are placeholders, reviewed during implementation

**Example PRs**:
- Create empty route handlers
- Add type definitions
- Create database model stubs
- Add placeholder components

**Blockers**:
- ❌ Modifies existing files
- ❌ Contains complex logic
- ❌ Size > 200 lines

---

### Tier 4: AI-Generated (5-Minute Soak, Auto-Merge)

**Criteria**:
- ✅ Label: `claude-auto`, `atlas-auto`, or `codex-auto`
- ✅ **All** CI checks pass (backend, frontend, security, linting)
- ✅ Size: < 500 lines (larger PRs need human review)
- ✅ No `breaking-change` label
- ✅ No `security` label
- ✅ No changes to `.github/workflows/` (workflow changes need review)

**Approval**: Automatic (ai-review-bot) after all checks pass
**Soak Time**: 5 minutes (allows human override)
**Merge Method**: Squash
**Rationale**: AI agents write good code, tests validate correctness

**Example PRs**:
- Claude adds new API endpoint
- Atlas implements UI component
- Codex refactors module
- Agent fixes bug

**Blockers**:
- ❌ Any CI check fails
- ❌ Breaking change detected
- ❌ Security vulnerability found
- ❌ PR size > 500 lines
- ❌ Modifies workflows or infrastructure

**Soak Time Rationale**:
- Gives humans 5 minutes to review PR if they want
- Allows manual merge or changes before auto-merge
- Prevents immediate deployment of potentially risky changes

---

### Tier 5: Dependencies (30-Minute Soak, Auto-Merge)

**Criteria**:
- ✅ Author: `dependabot[bot]`
- ✅ Change type: Patch or minor version bump (not major)
- ✅ Security scan passes (no new vulnerabilities)
- ✅ All tests pass with new dependency version
- ✅ No breaking changes in dependency changelog

**Approval**: Automatic (dependabot-auto-approve) after checks pass
**Soak Time**: 30 minutes (security review window)
**Merge Method**: Squash
**Rationale**: Patch/minor bumps are usually safe, tests catch regressions

**Example PRs**:
- Bump fastapi from 0.104.1 to 0.104.2 (patch)
- Bump pytest from 7.4.3 to 7.5.0 (minor)
- Bump eslint from 8.50.0 to 8.51.0 (minor)

**Blockers**:
- ❌ Major version bump (e.g., 1.0.0 → 2.0.0)
- ❌ Security vulnerability in new version
- ❌ Tests fail with new version
- ❌ Breaking changes in changelog

**Major Version Bumps**:
- Require human review (may have breaking changes)
- Need changelog review
- May require code changes

---

## Manual Merge Required

### Tier 6: Infrastructure (No Auto-Merge)

**Files**:
- `.github/workflows/**`
- `infra/**`
- `ops/**`
- `Dockerfile`, `docker-compose.yml`
- `railway.toml`, `railway.json`
- `.github/CODEOWNERS`

**Approval**: Human required
**Merge**: Human clicks merge button
**Rationale**: Infrastructure changes have high blast radius

**Example PRs**:
- Modify CI/CD pipeline
- Change deployment configuration
- Update Docker image
- Modify branch protection rules

**Exception**:
- Small docs changes in workflow files (e.g., comments) may auto-merge if clearly non-functional

---

### Tier 7: Breaking Changes (No Auto-Merge)

**Indicators**:
- Label: `breaking-change` (manually applied)
- API contract changes
- Database schema migrations (destructive)
- Configuration format changes
- Major dependency version bumps

**Approval**: Human required + stakeholder notification
**Merge**: Human clicks merge button
**Rationale**: Breaking changes need coordination across team/users

**Example PRs**:
- Remove deprecated API endpoint
- Change required environment variables
- Modify database column types
- Rename public functions

**Process**:
1. PR author applies `breaking-change` label
2. PR author documents migration path
3. Stakeholders review and approve
4. Announce to team before merge
5. Human manually merges
6. Monitor for issues post-merge

---

### Tier 8: Security (No Auto-Merge)

**Indicators**:
- Label: `security` (manually applied)
- Security scan detects issues
- Changes to authentication/authorization
- Changes to encryption/secrets handling
- Changes to `SECURITY.md`

**Approval**: Security reviewer required (human)
**Merge**: Human clicks merge button after security review
**Rationale**: Security issues need expert review

**Example PRs**:
- Fix SQL injection vulnerability
- Update JWT secret rotation
- Patch XSS vulnerability
- Change password hashing algorithm

**Process**:
1. PR author applies `security` label
2. Security reviewer audits code
3. Security reviewer approves
4. Human manually merges
5. Security team monitors deployment

---

## Auto-Merge Configuration

### GitHub Actions Workflow

**File**: `.github/workflows/auto-merge.yml`

**Trigger Events**:
```yaml
on:
  pull_request_review:
    types: [submitted]       # When PR is approved
  status: {}                 # When status checks update
  check_run:
    types: [completed]       # When individual check completes
  pull_request:
    types: [labeled]         # When label added (e.g., 'auto-merge')
```

**Merge Logic**:
```yaml
jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: |
      github.event.pull_request.state == 'open' &&
      (
        contains(github.event.pull_request.labels.*.name, 'auto-merge') ||
        contains(github.event.pull_request.labels.*.name, 'claude-auto') ||
        contains(github.event.pull_request.labels.*.name, 'docs-only') ||
        contains(github.event.pull_request.labels.*.name, 'merge-ready')
      ) &&
      !contains(github.event.pull_request.labels.*.name, 'do-not-merge') &&
      !contains(github.event.pull_request.labels.*.name, 'wip') &&
      !contains(github.event.pull_request.labels.*.name, 'breaking-change') &&
      !contains(github.event.pull_request.labels.*.name, 'security')

    steps:
      - name: Check if all checks passed
        uses: actions/github-script@v7
        id: check-status
        with:
          script: |
            const { data: checks } = await github.rest.checks.listForRef({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.payload.pull_request.head.sha
            });
            const allPassed = checks.check_runs.every(check =>
              check.conclusion === 'success' || check.conclusion === 'skipped'
            );
            return allPassed;

      - name: Wait soak time (if AI-generated)
        if: contains(github.event.pull_request.labels.*.name, 'claude-auto')
        run: sleep 300  # 5 minutes

      - name: Wait soak time (if dependency update)
        if: github.actor == 'dependabot[bot]'
        run: sleep 1800  # 30 minutes

      - name: Merge PR
        if: steps.check-status.outputs.result == 'true'
        uses: pascalgn/automerge-action@v0.16.2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MERGE_LABELS: auto-merge,claude-auto,atlas-auto,docs-only,merge-ready
          MERGE_METHOD: squash
          MERGE_COMMIT_MESSAGE: pull-request-title
          MERGE_DELETE_BRANCH: true
          MERGE_RETRIES: 3
          MERGE_RETRY_SLEEP: 60000
```

---

## Safeguards

### Pre-Merge Checks

Before any auto-merge:

1. ✅ **All required status checks pass**
   - Backend tests
   - Frontend validation
   - Security scan
   - Linting

2. ✅ **At least 1 approval** (can be bot)
   - Auto-approval for Tier 1-5
   - Human approval for Tier 6-8

3. ✅ **No blocking labels**
   - No `do-not-merge`
   - No `wip`
   - No `needs-review` (unless auto-approved)

4. ✅ **No merge conflicts**
   - Branch is up to date
   - Or in merge queue (will rebase)

5. ✅ **Conversations resolved**
   - All review comments addressed
   - No outstanding questions

### Post-Merge Actions

After auto-merge:

1. 📝 **Log event** to database
   - PR number, title, author
   - Merge time, merge method
   - Approval source (bot or human)
   - Labels present at merge time

2. 📢 **Notify stakeholders**
   - PR author (GitHub comment)
   - CODEOWNERS (GitHub mention)
   - Operator dashboard (event)

3. 🗑️ **Delete branch**
   - Auto-delete feature branch
   - Keep main/production branches

4. 📊 **Update metrics**
   - Throughput counter
   - Time-to-merge average
   - Auto-merge success rate

---

## Override Mechanisms

### Disabling Auto-Merge

**For a specific PR**:
```bash
# Add blocking label
gh pr edit <PR_NUMBER> --add-label "do-not-merge"

# Remove auto-merge label
gh pr edit <PR_NUMBER> --remove-label "auto-merge"
```

**For all PRs temporarily**:
```bash
# Disable auto-merge workflow
gh workflow disable auto-merge.yml

# Re-enable later
gh workflow enable auto-merge.yml
```

### Emergency Stop

If auto-merge causes issues:

1. **Immediately disable workflow**:
   ```bash
   gh workflow disable auto-merge.yml
   ```

2. **Revert problematic merge**:
   ```bash
   git revert <commit-sha>
   git push origin main
   ```

3. **Investigate root cause**:
   - Which tier allowed the merge?
   - What checks should have caught it?
   - Update policy to prevent recurrence

4. **Re-enable with updated rules**:
   ```bash
   gh workflow enable auto-merge.yml
   ```

---

## Metrics & KPIs

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Auto-merge success rate** | > 95% | (Successful merges / Total attempts) |
| **False positive rate** | < 2% | (Reverted PRs / Auto-merged PRs) |
| **Time-to-merge (auto)** | < 30 min | From PR open to merge |
| **Time-to-merge (manual)** | < 4 hours | From PR open to merge |
| **Auto-merge adoption** | > 80% | (Auto-merged PRs / Total PRs) |

### Failure Modes

Track reasons for auto-merge failures:
- Merge conflicts
- Check failures
- Queue timeouts
- GitHub API errors

**Action**: Optimize most common failure mode

---

## Policy Evolution

### Review Cadence

**Weekly**:
- Review auto-merged PRs (spot check)
- Check metrics (success rate, time-to-merge)
- Identify issues

**Monthly**:
- Analyze failure modes
- Adjust tier criteria if needed
- Expand auto-merge to new categories (if safe)

**Quarterly**:
- Comprehensive policy review
- Update based on learnings
- Adjust soak times based on data

### Adding New Categories

To add a new auto-merge category:

1. **Propose criteria** (be conservative)
2. **Test with manual approval first** (1 week)
3. **Enable auto-approval with long soak time** (1 week)
4. **Reduce soak time if successful** (gradual)
5. **Document as new tier** (update this doc)

### Removing Categories

If a tier has high false positive rate:

1. **Increase soak time** (give more review window)
2. **Tighten criteria** (make rules more strict)
3. **Require human approval** (disable auto-approval)
4. **Remove from auto-merge** (manual merge only)

---

## Appendix: Auto-Merge Decision Table

| PR Characteristic | Auto-Approve? | Auto-Merge? | Soak Time | Tier |
|-------------------|---------------|-------------|-----------|------|
| Docs only | ✅ Yes | ✅ Yes | 0 min | 1 |
| Tests only | ✅ Yes | ✅ Yes | 0 min | 2 |
| Scaffold/stubs | ✅ Yes | ✅ Yes | 5 min | 3 |
| Claude-generated < 500 lines | ✅ Yes | ✅ Yes | 5 min | 4 |
| Dependabot patch/minor | ✅ Yes | ✅ Yes | 30 min | 5 |
| Infrastructure changes | ❌ No | ❌ No | N/A | 6 |
| Breaking changes | ❌ No | ❌ No | N/A | 7 |
| Security changes | ❌ No | ❌ No | N/A | 8 |
| Has `do-not-merge` label | ❌ No | ❌ No | N/A | N/A |
| Has `wip` label | ❌ No | ❌ No | N/A | N/A |
| Any check fails | ❌ No | ❌ No | N/A | N/A |
| Has merge conflicts | ❌ No | ❌ No | N/A | N/A |

---

## Summary

The **BlackRoad Auto-Merge Policy** enables:

- ✅ **Fast merges** for safe, low-risk changes
- ✅ **Human oversight** for complex, high-risk changes
- ✅ **Gradual escalation** from auto to manual as risk increases
- ✅ **Safeguards** to prevent false positives
- ✅ **Transparency** through logging and notifications
- ✅ **Evolution** based on metrics and learnings

**Result**: **10x PR throughput** without compromising quality or safety.

---

**Last Updated**: 2025-11-18
**Owner**: Operator Alexa (Cadillac)
**Related Docs**: `MERGE_QUEUE_PLAN.md`, `GITHUB_AUTOMATION_RULES.md`
