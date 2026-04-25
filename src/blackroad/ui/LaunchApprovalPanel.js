// BlackRoad OS — LaunchApprovalPanel
// Shows pending approvals that require human action

export function LaunchApprovalPanel({ approvals = [] }) {
  if (!approvals.length) return '';

  const items = approvals.map(a => `
    <div class="br-approval-item br-card">
      <div class="br-approval-title">${a.title}</div>
      <div class="br-approval-reason">${a.reason}</div>
      <div class="br-approval-risk">Risk: ${a.risk}</div>
      <div class="br-approval-action">${a.recommendedAction}</div>
      <div class="br-approval-status">${a.status.toUpperCase()}</div>
    </div>
  `).join('');

  return `
    <div class="br-approvals">
      <div class="br-section-title">Approvals Required</div>
      ${items}
    </div>
  `;
}

export const APPROVAL_CSS = `
.br-approvals { display: flex; flex-direction: column; gap: var(--br-gap-md); }
.br-approval-item { padding: var(--br-gap-md); }
.br-approval-title { font-size: 14px; color: var(--br-text); font-weight: 500; margin-bottom: var(--br-gap-xs); }
.br-approval-reason { font-size: 12px; color: var(--br-muted); margin-bottom: var(--br-gap-xs); }
.br-approval-risk { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-dim); }
.br-approval-action { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-muted); margin-top: var(--br-gap-xs); }
.br-approval-status { font-family: var(--br-font-mono); font-size: 10px; color: var(--br-dim); text-transform: uppercase; margin-top: var(--br-gap-sm); }
`;
