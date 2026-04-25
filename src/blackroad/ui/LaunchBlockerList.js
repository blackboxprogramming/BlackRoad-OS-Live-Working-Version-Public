// BlackRoad OS — LaunchBlockerList
// Priority 0 blockers that must be resolved before launch

export function LaunchBlockerList({ blockers = [] }) {
  if (!blockers.length) {
    return `<div class="br-blockers br-card"><div class="br-section-title">Priority 0</div><div class="br-mono" style="color:var(--br-muted)">No Priority 0 blockers</div></div>`;
  }

  const items = blockers.map(b => `
    <div class="br-blocker-item">
      <div class="br-blocker-label">[P0] ${b.label}</div>
      <div class="br-blocker-fix">${b.fix}</div>
    </div>
  `).join('');

  return `
    <div class="br-blockers br-card">
      <div class="br-section-title">Priority 0</div>
      ${items}
    </div>
  `;
}

export const BLOCKER_CSS = `
.br-blockers { border-color: var(--br-line); }
.br-blocker-item { padding: var(--br-gap-sm) 0; border-bottom: 1px solid var(--br-line-soft); }
.br-blocker-item:last-child { border-bottom: none; }
.br-blocker-label { font-size: 13px; color: var(--br-text); font-weight: 500; }
.br-blocker-fix { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-dim); margin-top: var(--br-gap-xs); }
`;
