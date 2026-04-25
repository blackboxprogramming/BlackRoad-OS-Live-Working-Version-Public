// BlackRoad OS — LaunchScoreCard
// Displays the launch readiness score

export function LaunchScoreCard({ score = 0, category = 'blocked' }) {
  return `
    <div class="br-launch-score br-card">
      <div class="br-section-title">Launch Score</div>
      <div class="br-launch-score__value">${score}</div>
      <div class="br-launch-score__max">/ 100</div>
      <div class="br-launch-score__category">${category}</div>
    </div>
  `;
}

export const SCORE_CSS = `
.br-launch-score { text-align: center; padding: var(--br-gap-xl); }
.br-launch-score__value { font-family: var(--br-font-heading); font-size: 64px; color: var(--br-text); line-height: 1; }
.br-launch-score__max { font-family: var(--br-font-mono); font-size: 16px; color: var(--br-dim); margin-top: var(--br-gap-xs); }
.br-launch-score__category { font-family: var(--br-font-mono); font-size: 13px; color: var(--br-muted); margin-top: var(--br-gap-md); text-transform: uppercase; letter-spacing: 0.08em; }
`;
