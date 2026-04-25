---
name: Deployment Checklist
about: Pre/post deployment checklist
title: '[DEPLOY] Release v'
labels: 'type:deployment, priority:p1'
assignees: ''
---

## Release Information

- **Version:** v
- **Target Date:**
- **Environment:** (staging / production)
- **Deployment Window:**

## Pre-Deployment Checklist

### Code & Testing
- [ ] All PRs merged to `main`
- [ ] CI pipeline passes (tests, lint, build)
- [ ] Security scans pass
- [ ] Code review completed
- [ ] Release notes drafted

### Infrastructure
- [ ] Database migrations tested in staging
- [ ] Environment variables updated (if needed)
- [ ] Secrets rotated (if needed)
- [ ] Resource scaling planned (if needed)

### Stakeholder Communication
- [ ] Asana tasks updated with deploy plan
- [ ] Salesforce Project record current
- [ ] #deploys channel notified
- [ ] Customer success team informed (if customer-facing changes)

### Backup & Rollback
- [ ] Database backup created
- [ ] Current version tagged for rollback
- [ ] Rollback procedure documented

## Deployment Steps

1. [ ] Tag release in GitHub
2. [ ] Trigger deploy workflow
3. [ ] Monitor deployment logs
4. [ ] Wait for health checks to pass
5. [ ] Verify backend API responding
6. [ ] Verify frontend loads correctly

## Post-Deployment Checklist

### Verification
- [ ] Health checks passing
- [ ] Critical user flows tested
- [ ] Database migrations applied
- [ ] No errors in application logs
- [ ] No spike in error rates (monitoring)
- [ ] Performance metrics within acceptable range

### Stakeholder Updates
- [ ] Salesforce Project record updated (automated)
- [ ] Asana deploy task marked complete (automated)
- [ ] Slack notification sent (automated)
- [ ] Release notes published

### Monitoring
- [ ] Set up alerts for next 24 hours
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Check user feedback channels

## Rollback Plan

**Trigger Rollback If:**
- Critical functionality broken
- Error rate > 5%
- Performance degradation > 50%
- Database corruption detected

**Rollback Procedure:**
1. Navigate to: https://github.com/$REPO/actions/workflows/rollback.yml
2. Click "Run workflow"
3. Enter previous stable SHA:
4. Enter rollback reason:
5. Monitor rollback completion

## Issues Discovered

<!-- Document any issues found during/after deployment -->

| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
|       |          |        |            |

## Post-Mortem Notes

<!-- After deployment, document lessons learned -->

**What went well:**
-

**What could be improved:**
-

**Action items:**
- [ ]
- [ ]

## Related

- **Release Notes:** [link]
- **Salesforce Project:** [link]
- **Asana Deploy Task:** [link]
