// BlackRoad OS — SurfaceTaskbar
// Shows active surfaces as tabs above the dock

import { getActiveSurfaces, getFocusedId } from '../surfaces/surfaceRuntime.js';

export function SurfaceTaskbar() {
  const surfaces = getActiveSurfaces();
  const focusedId = getFocusedId();

  if (!surfaces.length) return '';

  const tabs = surfaces.map(s => {
    const isActive = s.id === focusedId;
    return `
      <div class="br-taskbar-tab ${isActive ? 'br-taskbar-tab--active' : ''}" data-surface-id="${s.id}">
        <span class="br-taskbar-dot" data-status="${s.status || 'active'}"></span>
        <span class="br-taskbar-label">${s.title}</span>
        <span class="br-taskbar-kind">${s.kind}</span>
      </div>
    `;
  }).join('');

  return `<div class="br-taskbar">${tabs}</div>`;
}

export const TASKBAR_CSS = `
.br-taskbar {
  display: flex; gap: var(--br-gap-xs); padding: var(--br-gap-xs) var(--br-gap-lg);
  border-bottom: 1px solid var(--br-line-soft); overflow-x: auto;
}
.br-taskbar-tab {
  display: flex; align-items: center; gap: var(--br-gap-xs);
  padding: 4px 10px; border-radius: 6px; cursor: pointer;
  font-size: 12px; color: var(--br-dim);
  transition: background var(--br-duration) var(--br-ease), color var(--br-duration) var(--br-ease);
}
.br-taskbar-tab:hover { background: var(--br-panel); color: var(--br-muted); }
.br-taskbar-tab--active { background: var(--br-panel-2); color: var(--br-text); }
.br-taskbar-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--br-dim); }
.br-taskbar-dot[data-status="active"] { background: #5a5a5a; }
.br-taskbar-kind { font-family: var(--br-font-mono); font-size: 9px; color: var(--br-dim); text-transform: uppercase; }
.br-taskbar-label { white-space: nowrap; }
`;
