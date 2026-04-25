// BlackRoad OS — QuickActions
// Quick action card row

export const DEFAULT_QUICK_ACTIONS = [
  { label: 'Agents', url: '/agents' },
  { label: 'Atlas', url: '/atlas' },
  { label: 'Archive', url: '/archive' },
  { label: 'Sites', url: '/archive/sites' },
  { label: 'RoadOS', url: 'https://os.blackroad.io' },
  { label: 'Roadie', url: 'https://roadie.blackroad.me' }
];

export function QuickActions({ actions = DEFAULT_QUICK_ACTIONS }) {
  const cards = actions.map(a => `
    <a href="${a.url}" class="br-quick-card">${a.label}</a>
  `).join('');

  return `
    <div class="br-quick-actions br-section">
      ${cards}
    </div>
  `;
}

export const QUICK_CSS = `
.br-quick-actions { display: flex; gap: var(--br-gap-sm); flex-wrap: wrap; }
`;
