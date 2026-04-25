// BlackRoad OS — CommandSuggestions
// Dropdown suggestions panel below the dock

import { getSuggestions, formatSuggestion } from '../command/commandSuggestions.js';

export function CommandSuggestions({ query = '' }) {
  const suggestions = getSuggestions(query, 8);
  if (!suggestions.length) return '';

  const items = suggestions.map(s => {
    const f = formatSuggestion(s);
    return `
      <div class="br-suggest-item" data-command="${f.command}" tabindex="0">
        <span class="br-suggest-type">${f.typeLabel}</span>
        <span class="br-suggest-label">${f.label}</span>
        <span class="br-suggest-detail">${f.detail}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="br-suggestions">
      ${items}
    </div>
  `;
}

export const SUGGESTIONS_CSS = `
.br-suggestions {
  position: absolute; bottom: 100%; left: 0; right: 0;
  background: var(--br-panel); border: 1px solid var(--br-line);
  border-radius: var(--br-radius-md); margin-bottom: var(--br-gap-sm);
  max-height: 320px; overflow-y: auto; z-index: 200;
}
.br-suggest-item {
  display: flex; align-items: center; gap: var(--br-gap-md);
  padding: var(--br-gap-sm) var(--br-gap-md); cursor: pointer;
  transition: background var(--br-duration) var(--br-ease);
}
.br-suggest-item:hover, .br-suggest-item:focus {
  background: var(--br-panel-2); outline: none;
}
.br-suggest-type {
  font-family: var(--br-font-mono); font-size: 10px;
  color: var(--br-dim); text-transform: uppercase;
  letter-spacing: 0.08em; min-width: 60px;
}
.br-suggest-label { font-size: 13px; color: var(--br-text); }
.br-suggest-detail { font-size: 12px; color: var(--br-dim); margin-left: auto; }
`;
