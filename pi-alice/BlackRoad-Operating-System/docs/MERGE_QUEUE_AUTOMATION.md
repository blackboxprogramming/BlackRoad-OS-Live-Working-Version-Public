# Merge Queue Automation

**Intelligent PR merging with safety guarantees**

---

## Overview

The Merge Queue system provides safe, orderly merging of pull requests with automated testing and conflict resolution. Instead of merging PRs one-by-one, the queue batches compatible PRs together, runs tests on the batch, and merges them atomically.

## Benefits

### For Developers
- **No more manual merge conflicts** - Queue handles branch updates automatically
- **Faster merging** - Batch processing increases throughput
- **Zero-click merging** - PRs with auto-merge labels merge automatically
- **Fair ordering** - PRs are processed based on priority, not merge button races

### For the Project
- **Safer merges** - All PRs tested against latest base before merging
- **Higher velocity** - Can merge 20+ PRs per hour vs 5-10 manual
- **Better CI utilization** - Batch testing reduces redundant CI runs
- **Audit trail** - Full history of what was merged when and why

## Architecture

```
┌─────────────────────────────────────────┐
│     Pull Requests (Ready for Merge)    │
│  ✓ All checks passing                   │
│  ✓ Required reviews obtained            │
│  ✓ Branch up-to-date                    │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│          Merge Queue Entry              │
│  - Priority calculation                 │
│  - Auto-merge eligibility check         │
│  - Batch grouping                       │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│          Batch Processing               │
│  1. Create temp merge commit            │
│  2. Run required checks on batch        │
│  3. If pass → merge all                 │
│  4. If fail → bisect to find culprit    │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│             Merged to Main              │
│  - Squash commit created                │
│  - PR closed                            │
│  - Labels synced                        │
│  - Notifications sent                   │
└─────────────────────────────────────────┘
```

## Configuration

### Merge Queue Settings

**File**: `.github/merge_queue.yml`

```yaml
queue:
  required_checks:
    - "Backend Tests"
    - "CI / validate-html"
    - "CI / validate-javascript"

  merge_method: squash
  batch_size: 5
  check_timeout: 30
  auto_update: true
  min_approvals: 0

auto_merge:
  enabled_labels:
    - "claude-auto"
    - "atlas-auto"
    - "docs"
    - "chore"
    - "tests-only"

  require_checks: true
  require_reviews: false
```

### Auto-Merge Labels

PRs with these labels are auto-merged once checks pass:

| Label | Use Case | Examples |
|-------|----------|----------|
| `claude-auto` | Claude AI changes | Generated code, docs, tests |
| `atlas-auto` | Atlas AI changes | Automated refactoring |
| `docs` | Documentation only | README updates, typo fixes |
| `chore` | Maintenance tasks | Dependency updates, formatting |
| `tests-only` | Test changes only | New test cases, test fixes |

### Priority Rules

Higher priority = processed first:

```yaml
priority_rules:
  - label: "hotfix"          # Priority: 100
  - label: "security"        # Priority: 90
  - label: "breaking-change" # Priority: 80
  - label: "claude-auto"     # Priority: 50
  - label: "docs"            # Priority: 30
  - label: "chore"           # Priority: 20
```

## Workflow

### Standard PR Flow

```
1. PR opened by Claude
   ↓
2. CI checks run
   ↓
3. PR auto-labeled based on files changed
   ↓
4. If labeled "claude-auto":
   ↓
5. Added to merge queue (priority: 50)
   ↓
6. Queue updates branch if needed
   ↓
7. Checks re-run on updated branch
   ↓
8. If all checks pass:
   ↓
9. PR merged automatically via queue
   ↓
10. PR closed, labels synced
```

### Batch Merging

When multiple PRs are ready:

```
Queue contains:
- PR #101 (priority: 50, claude-auto)
- PR #102 (priority: 50, claude-auto)
- PR #103 (priority: 30, docs)

Batch 1: PRs #101, #102 (same priority)
  ↓
Create temp merge: main + #101 + #102
  ↓
Run required checks
  ↓
✓ All pass → Merge both PRs
  ↓
Batch 2: PR #103
  ↓
(repeat process)
```

### Failure Handling

If a batch fails, bisect to find the failing PR:

```
Batch: #101 + #102 + #103 fails
  ↓
Test #101 + #102
  ↓
✓ Pass → Merge #101, #102
  ↓
Test #103 alone
  ↓
✗ Fail → Remove #103 from queue
  ↓
Comment on #103: "Removed from merge queue: checks failed"
  ↓
Notify PR author
```

## Integration with Operator Engine

The merge queue integrates with the PR Action Queue:

### Automated Actions

When a PR enters the queue:
1. **Update Branch** - Ensure PR is up-to-date with base
2. **Rerun Checks** - Re-run failed checks if any
3. **Sync Labels** - Auto-label based on file changes
4. **Resolve Conflicts** - Attempt auto-resolution of simple conflicts

### Action Triggers

```python
# When PR labeled "claude-auto"
await queue.enqueue(
    PRActionType.ADD_TO_MERGE_QUEUE,
    owner="blackboxprogramming",
    repo_name="BlackRoad-Operating-System",
    pr_number=123,
    params={},
    priority=PRActionPriority.HIGH,
)

# When checks pass
await queue.enqueue(
    PRActionType.MERGE_PR,
    owner="blackboxprogramming",
    repo_name="BlackRoad-Operating-System",
    pr_number=123,
    params={"merge_method": "squash"},
    priority=PRActionPriority.CRITICAL,
)
```

## Prism Console Integration

View merge queue status in the Prism Console:

- **Queue Depth** - Number of PRs waiting to merge
- **Currently Processing** - Batch being tested
- **Recent Merges** - Last 10 merged PRs
- **Failed PRs** - PRs removed from queue with reasons
- **Merge Velocity** - PRs merged per hour/day

**Dashboard Metrics**:
```
┌─────────────────────────────────────┐
│  Merge Queue Statistics             │
├─────────────────────────────────────┤
│  In Queue: 3                        │
│  Processing: 2                      │
│  Merged Today: 15                   │
│  Failed Today: 1                    │
│  Avg Time in Queue: 12 min          │
│  Merge Velocity: 18/hour            │
└─────────────────────────────────────┘
```

## Branch Protection Rules

Configure branch protection for `main`:

### Required Settings

- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [ ] Require pull request reviews (disabled for auto-merge)
- [ ] Require signed commits (optional)

### Required Status Checks

- `Backend Tests`
- `CI / validate-html`
- `CI / validate-javascript`
- `CI / security-scan`

## Rate Limiting

Prevent merge queue overload:

```yaml
rate_limiting:
  max_merges_per_hour: 20
  max_queue_size: 50
  failure_cooldown: 5  # minutes
```

## Conflict Resolution

### Auto-Resolvable Conflicts

Simple conflicts are resolved automatically:
- Non-overlapping changes in same file
- Import order differences
- Whitespace/formatting differences

### Manual Resolution Required

Complex conflicts require human intervention:
- Same line changed differently
- Semantic conflicts (e.g., function signature changes)
- Merge conflicts in critical files (config, migrations)

## Notifications

### PR Author Notifications

- **Added to queue** - "Your PR has been added to the merge queue (position: 3)"
- **Merged** - "Your PR has been merged! 🎉"
- **Removed** - "Your PR was removed from the queue: [reason]"

### Team Notifications

- **Batch merged** - "#101, #102, #103 merged (batch 1)"
- **Queue blocked** - "Merge queue blocked: failing PR #104"
- **High queue depth** - "Merge queue depth: 25 (threshold: 20)"

## Monitoring

### Key Metrics

Track these metrics for merge queue health:

| Metric | Target | Alert If |
|--------|--------|----------|
| Merge velocity | 15-20/hour | < 10/hour |
| Queue depth | < 10 | > 20 |
| Time in queue | < 15 min | > 30 min |
| Failure rate | < 10% | > 20% |
| Batch success rate | > 80% | < 60% |

### Alerts

Set up alerts for:
- Queue depth exceeds 20
- No merges in last hour
- Failure rate > 20%
- Webhook failures

## Troubleshooting

### Queue Not Processing

**Symptoms**: PRs stuck in queue, not being merged

**Checks**:
1. Is the queue running? `GET /api/operator/health`
2. Are checks passing? Check GitHub status checks
3. Are there conflicts? Check PR merge state
4. Is rate limit hit? Check queue statistics

**Solutions**:
- Restart queue workers
- Clear stuck PRs manually
- Update branch for conflicted PRs

### PRs Being Removed from Queue

**Symptoms**: PRs keep getting removed

**Common Causes**:
1. **Checks failing** - Fix the failing checks
2. **Conflicts** - Resolve merge conflicts
3. **Branch behind** - Update branch with base
4. **Protected files changed** - Review required

**Solutions**:
- Check PR comments for removal reason
- View action logs in Prism Console
- Manually fix issues and re-add to queue

### Slow Merge Velocity

**Symptoms**: Taking > 30 min to merge PRs

**Possible Causes**:
1. **Large batch size** - Reduce batch size
2. **Slow CI** - Optimize test suite
3. **Many conflicts** - Encourage smaller PRs
4. **High failure rate** - Improve test quality

**Solutions**:
- Reduce `batch_size` to 3
- Enable `auto_update` to prevent branch drift
- Increase `max_workers` for faster processing

## Best Practices

### For AI Agents (Claude, Atlas)

1. **Use conventional commit messages** - `feat:`, `fix:`, `docs:`, `chore:`
2. **Keep PRs focused** - One logical change per PR
3. **Add tests** - Test-only changes auto-merge faster
4. **Update docs** - Documentation changes are low-risk
5. **Use appropriate labels** - Let the system auto-label when possible

### For Human Developers

1. **Review queue regularly** - Check Prism Console daily
2. **Fix failed PRs promptly** - Don't block the queue
3. **Approve auto-merge PRs** - Review, approve, let queue handle merge
4. **Monitor merge velocity** - Optimize if < 10/hour
5. **Keep branch protection rules tight** - Safety over speed

## Security Considerations

### Bypass Prevention

- **No bypass without approval** - Even "hotfix" label requires passing checks
- **Audit log** - All merges logged with who approved
- **Rate limiting** - Prevents mass auto-merge attacks

### Protected Files

Files that require extra scrutiny:
- `.github/workflows/**` - Workflow changes need review
- `backend/app/config.py` - Config changes need review
- `railway.toml`, `railway.json` - Deployment config
- `SECURITY.md` - Security policy

## Future Enhancements

- **ML-based conflict prediction** - Predict conflicts before they occur
- **Smart batch grouping** - Group compatible PRs intelligently
- **Rollback support** - Revert merged batches if issues found
- **Cross-repo dependencies** - Merge coordinated changes across repos
- **Canary merges** - Merge to staging first, then production

---

**Status**: ✅ Production Ready (Phase Q2)
**Maintainer**: @alexa-amundson
**Last Updated**: 2025-11-18
