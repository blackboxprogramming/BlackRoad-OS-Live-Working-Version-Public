// BlackRoad OS — SurfaceTabs
// Tab strip for multiple open surfaces

import { getActiveSurfaces, getFocusedId } from '../surfaces/surfaceRuntime.js';

export function SurfaceTabs() {
  const surfaces = getActiveSurfaces();
  const focusedId = getFocusedId();

  if (surfaces.length <= 1) return '';

  const tabs = surfaces.map(s => `
    <button class="br-tab ${s.id === focusedId ? 'br-tab--active' : ''}" data-surface-id="${s.id}">
      ${s.title}
    </button>
  `).join('');

  return `<div class="br-tabs">${tabs}</div>`;
}

export const TABS_CSS = `
.br-tabs {
  display: flex; gap: 1px; border-bottom: 1px solid var(--br-line);
  overflow-x: auto;
}
.br-tab {
  padding: 6px 16px; font-size: 12px; color: var(--br-dim);
  background: none; border: none; cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color var(--br-duration) var(--br-ease);
}
.br-tab:hover { color: var(--br-muted); }
.br-tab--active { color: var(--br-text); border-bottom-color: var(--br-muted); }
`;
