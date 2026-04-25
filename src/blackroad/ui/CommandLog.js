// BlackRoad OS — CommandLog
// Terminal-style log of command executions

import { getSessionLog } from '../command/commandTelemetry.js';

export function CommandLog({ limit = 20 }) {
  const log = getSessionLog().slice(-limit);
  if (!log.length) return '<div class="br-mono" style="color:var(--br-dim)">[BlackRoad Command] ready</div>';

  const entries = log.map(e => {
    const time = new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const icon = e.action === 'error' ? 'NO ROUTE' : 'routed';
    return `<div class="br-log-entry"><span class="br-log-time">${time}</span> <span class="br-log-icon">${icon}</span> <span class="br-log-query">${e.query}</span>${e.surfaceId ? ` <span class="br-log-target">-> ${e.surfaceId}</span>` : ''}</div>`;
  }).join('');

  return `<div class="br-command-log">${entries}</div>`;
}

export const LOG_CSS = `
.br-command-log { font-family: var(--br-font-mono); font-size: 11px; line-height: 1.6; }
.br-log-entry { color: var(--br-dim); }
.br-log-time { color: var(--br-dim); }
.br-log-icon { color: var(--br-muted); }
.br-log-query { color: var(--br-text); }
.br-log-target { color: var(--br-dim); }
`;
