// BlackRoad OS — ProductLauncherGrid
// Grid of product icons that open as Surfaces in RoadOS

import { PRODUCTS } from '../products.js';

export function ProductLauncherGrid({ products = PRODUCTS }) {
  const items = products.map(p => `
    <a href="https://os.blackroad.io/open/${p.id}" class="br-launcher-item" title="${p.name}: ${p.oneLine}">
      <div class="br-launcher-icon">
        <span class="br-launcher-icon__letter">${p.name.charAt(0)}</span>
      </div>
      <span class="br-launcher-label">${p.name}</span>
    </a>
  `).join('');

  return `
    <section class="br-section">
      <div class="br-section-title">Products & launchers</div>
      <div class="br-launcher-hint">click an icon → open &bull; / focuses search</div>
      <div class="br-launcher-grid">
        ${items}
      </div>
    </section>
  `;
}

export const LAUNCHER_CSS = `
.br-launcher-hint { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-dim); margin-bottom: var(--br-gap-md); }
.br-launcher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: var(--br-gap-md); }
.br-launcher-item { display: flex; flex-direction: column; align-items: center; gap: var(--br-gap-xs); text-decoration: none; border: none; cursor: pointer; }
.br-launcher-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--br-panel); border: 1px solid var(--br-line);
  display: flex; align-items: center; justify-content: center;
  transition: border-color var(--br-duration) var(--br-ease), background var(--br-duration) var(--br-ease);
}
.br-launcher-item:hover .br-launcher-icon { border-color: var(--br-muted); background: var(--br-panel-2); }
.br-launcher-icon__letter { font-family: var(--br-font-heading); font-size: 18px; color: var(--br-text); }
.br-launcher-label { font-size: 11px; color: var(--br-muted); text-align: center; }
`;
