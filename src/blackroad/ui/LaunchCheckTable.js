// BlackRoad OS — LaunchCheckTable
// Table of all doctor checks with status labels

const STATUS_LABELS = {
  pass: 'PASS', warning: 'WARN', fail: 'FAIL',
  missing: 'MISSING', blocked: 'BLOCKED',
  'needs-approval': 'APPROVAL', skipped: 'SKIP'
};

export function LaunchCheckTable({ checks = [] }) {
  const rows = checks.map(c => {
    const label = STATUS_LABELS[c.status] || c.status.toUpperCase();
    return `
      <tr class="br-check-row" data-status="${c.status}">
        <td class="br-check-status">${label}</td>
        <td class="br-check-name">${c.name}</td>
        <td class="br-check-detail">${c.detail || ''}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="br-check-table-wrap">
      <div class="br-section-title">Checks</div>
      <table class="br-check-table">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

export const CHECK_TABLE_CSS = `
.br-check-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.br-check-row { border-bottom: 1px solid var(--br-line-soft); }
.br-check-status {
  font-family: var(--br-font-mono); font-size: 11px; padding: var(--br-gap-sm);
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--br-muted);
  white-space: nowrap; width: 80px;
}
.br-check-row[data-status="fail"] .br-check-status { color: var(--br-text); font-weight: 600; }
.br-check-row[data-status="missing"] .br-check-status { color: var(--br-dim); }
.br-check-name { padding: var(--br-gap-sm); color: var(--br-text); }
.br-check-detail { padding: var(--br-gap-sm); color: var(--br-dim); font-family: var(--br-font-mono); font-size: 11px; }
`;
