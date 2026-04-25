// BlackRoad OS — SurfaceLauncher
// Quick-launch surfaces from a grid

import { PRODUCTS } from '../products.js';
import { AGENTS } from '../command/commandRegistry.js';

export function SurfaceLauncher({ showAgents = false }) {
  const productItems = PRODUCTS.map(p => `
    <button class="br-surface-launch" data-open="open ${p.id}" title="${p.name}: ${p.oneLine}">
      <span class="br-surface-launch__icon">${p.name.charAt(0)}</span>
      <span class="br-surface-launch__name">${p.name}</span>
    </button>
  `).join('');

  let agentItems = '';
  if (showAgents) {
    agentItems = AGENTS.map(a => `
      <button class="br-surface-launch br-surface-launch--agent" data-open="agent ${a.id}" title="${a.name}: ${a.role}">
        <span class="br-surface-launch__icon">${a.name.charAt(0)}</span>
        <span class="br-surface-launch__name">${a.name}</span>
      </button>
    `).join('');
  }

  return `
    <div class="br-surface-launcher">
      <div class="br-section-title">Products</div>
      <div class="br-surface-launcher__grid">${productItems}</div>
      ${showAgents ? `<div class="br-section-title" style="margin-top:var(--br-gap-lg)">Agents</div><div class="br-surface-launcher__grid">${agentItems}</div>` : ''}
    </div>
  `;
}

export const LAUNCHER_V2_CSS = `
.br-surface-launcher__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: var(--br-gap-sm); }
.br-surface-launch {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--br-gap-sm); background: none; border: 1px solid transparent;
  border-radius: var(--br-radius-sm); cursor: pointer; color: var(--br-muted);
  transition: border-color var(--br-duration) var(--br-ease), background var(--br-duration) var(--br-ease);
}
.br-surface-launch:hover { border-color: var(--br-line); background: var(--br-panel); }
.br-surface-launch__icon {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--br-panel-2); border: 1px solid var(--br-line);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--br-font-heading); font-size: 16px; color: var(--br-text);
}
.br-surface-launch__name { font-size: 10px; text-align: center; }
`;
