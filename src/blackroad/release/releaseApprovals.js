// BlackRoad OS — Release Approvals
// Approval model for production releases

export const APPROVAL_REQUIRED_ACTIONS = [
  'production-deploy', 'dns-change', 'ssl-cert-change', 'cloudflare-change',
  'railway-change', 'vercel-change', 'env-var-change', 'billing-change',
  'git-push', 'legal-copy-change', 'roadnode-enablement', 'roadcoin-policy-change'
];

let approvals = [];

export function createApproval(title, action, risk, requiredFor) {
  const approval = {
    approvalId: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    action,
    risk,
    requiredFor,
    status: 'pending',
    approvedBy: '',
    approvedAt: '',
    notes: '',
    createdAt: new Date().toISOString()
  };
  approvals.push(approval);
  return approval;
}

export function approve(approvalId, approvedBy, notes = '') {
  const a = approvals.find(a => a.approvalId === approvalId);
  if (a) { a.status = 'approved'; a.approvedBy = approvedBy; a.approvedAt = new Date().toISOString(); a.notes = notes; }
  return a;
}

export function deny(approvalId, notes = '') {
  const a = approvals.find(a => a.approvalId === approvalId);
  if (a) { a.status = 'denied'; a.notes = notes; }
  return a;
}

export function getPending() { return approvals.filter(a => a.status === 'pending'); }
export function getAll() { return [...approvals]; }
export function clear() { approvals = []; }

export function needsApproval(action) { return APPROVAL_REQUIRED_ACTIONS.includes(action); }
