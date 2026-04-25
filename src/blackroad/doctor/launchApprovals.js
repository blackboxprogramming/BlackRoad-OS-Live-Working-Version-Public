// BlackRoad OS — Launch Approvals
// Actions that require human approval before execution

// Actions that are safe to suggest without approval
export const SAFE_ACTIONS = [
  'docs-update', 'registry-update', 'css-update', 'report-generation',
  'lint-fix', 'format-fix', 'type-check'
];

// Actions that require human approval
export const APPROVAL_REQUIRED = [
  'dns-change', 'ssl-cert-change', 'deployment', 'production-config',
  'git-commit', 'git-push', 'roadnode-enablement', 'api-mutation',
  'secret-rotation', 'billing-change', 'domain-change'
];

let pendingApprovals = [];

export function createApproval(title, reason, risk, recommendedAction) {
  const approval = {
    approvalId: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    reason,
    risk,
    recommendedAction,
    requiresHumanApproval: true,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  pendingApprovals.push(approval);
  return approval;
}

export function getPendingApprovals() {
  return [...pendingApprovals];
}

export function approveAction(approvalId) {
  const a = pendingApprovals.find(a => a.approvalId === approvalId);
  if (a) a.status = 'approved';
  return a;
}

export function denyAction(approvalId) {
  const a = pendingApprovals.find(a => a.approvalId === approvalId);
  if (a) a.status = 'denied';
  return a;
}

export function isSafeAction(actionType) {
  return SAFE_ACTIONS.includes(actionType);
}

export function requiresApproval(actionType) {
  return APPROVAL_REQUIRED.includes(actionType);
}

export function clearApprovals() {
  pendingApprovals = [];
}
