// BlackRoad OS — SurfaceDesktop
// The desktop area where surfaces open as windows

import { getActiveSurfaces, getFocusedId, closeSurface, focusSurface } from '../surfaces/surfaceRuntime.js';
import { adaptSurface } from '../surfaces/surfaceAdapters.js';
import { SurfaceFrame } from './SurfaceFrame.js';

export function SurfaceDesktop() {
  const surfaces = getActiveSurfaces();
  const focusedId = getFocusedId();

  if (!surfaces.length) {
    return `
      <div class="br-desktop-empty">
        <div class="br-mono" style="color:var(--br-dim)">No surfaces open</div>
        <div class="br-mono" style="color:var(--br-dim);font-size:11px;margin-top:var(--br-gap-sm)">Type / to open the command dock</div>
      </div>
    `;
  }

  const windows = surfaces.map(s => {
    const adapted = adaptSurface(s);
    const isFocused = s.id === focusedId;

    const actionsHtml = adapted.actions.map(a =>
      a.url
        ? `<a href="${a.url}" class="br-btn ${a.primary ? 'br-btn--primary' : 'br-btn--secondary'}" style="font-size:12px;padding:6px 14px">${a.label}</a>`
        : `<button class="br-btn ${a.primary ? 'br-btn--primary' : 'br-btn--secondary'}" style="font-size:12px;padding:6px 14px">${a.label}</button>`
    ).join('');

    const content = `
      ${adapted.html}
      ${actionsHtml ? `<div style="display:flex;gap:var(--br-gap-sm);flex-wrap:wrap;margin-top:var(--br-gap-lg)">${actionsHtml}</div>` : ''}
    `;

    return `
      <div class="br-desktop-window ${isFocused ? 'br-desktop-window--focused' : ''}" data-surface-id="${s.id}">
        ${SurfaceFrame({ title: s.title, kind: s.kind, route: s.id, status: s.status, children: content })}
      </div>
    `;
  }).join('');

  return `<div class="br-desktop">${windows}</div>`;
}

export const DESKTOP_CSS = `
.br-desktop { display: flex; flex-direction: column; gap: var(--br-gap-lg); }
.br-desktop-window { transition: opacity var(--br-duration) var(--br-ease); }
.br-desktop-window--focused { }
.br-desktop-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 200px;
}
`;
