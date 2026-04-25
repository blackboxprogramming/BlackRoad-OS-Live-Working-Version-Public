// BlackRoad OS — CommandResult
// Renders a command result as a notification or inline response

export function CommandResult({ result }) {
  if (!result) return '';

  const statusClass = result.action === 'error' ? 'br-result--error' : 'br-result--ok';

  return `
    <div class="br-result ${statusClass}" data-command-result>
      <div class="br-result__type">${result.type}</div>
      <div class="br-result__label">${result.label || result.query}</div>
      ${result.message ? `<div class="br-result__message">${result.message}</div>` : ''}
      ${result.url ? `<a href="${result.url}" class="br-result__link">${result.url}</a>` : ''}
    </div>
  `;
}

export const RESULT_CSS = `
.br-result {
  padding: var(--br-gap-md); border-radius: var(--br-radius-sm);
  border: 1px solid var(--br-line); margin: var(--br-gap-sm) 0;
}
.br-result--ok { background: var(--br-panel); }
.br-result--error { background: var(--br-panel); border-color: #333; }
.br-result__type {
  font-family: var(--br-font-mono); font-size: 10px;
  color: var(--br-dim); text-transform: uppercase;
  letter-spacing: 0.08em; margin-bottom: var(--br-gap-xs);
}
.br-result__label { font-size: 14px; color: var(--br-text); margin-bottom: var(--br-gap-xs); }
.br-result__message { font-size: 12px; color: var(--br-muted); margin-bottom: var(--br-gap-xs); }
.br-result__link { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-dim); }
`;
