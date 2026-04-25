// BlackRoad OS — StatsRow
// Row of stat cards

export function StatsRow({ stats = [] }) {
  const cards = stats.map(s => `
    <div class="br-stat-card">
      <div class="br-stat-card__value">${s.value}</div>
      <div class="br-stat-card__label">${s.label}</div>
    </div>
  `).join('');

  return `
    <div class="br-stats-row br-section">
      ${cards}
    </div>
  `;
}

export const DEFAULT_STATS = [
  { value: '18', label: 'Products' },
  { value: '56', label: 'Sites' },
  { value: '27', label: 'Agents' },
  { value: '428', label: 'Routes' }
];

export const STATS_CSS = `
.br-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: var(--br-gap-md); }
`;
