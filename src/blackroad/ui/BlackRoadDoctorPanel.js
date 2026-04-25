// BlackRoad OS — BlackRoadDoctorPanel
// Master panel combining all doctor UI components

import { LaunchScoreCard, SCORE_CSS } from './LaunchScoreCard.js';
import { LaunchBlockerList, BLOCKER_CSS } from './LaunchBlockerList.js';
import { LaunchCheckTable, CHECK_TABLE_CSS } from './LaunchCheckTable.js';
import { LaunchApprovalPanel, APPROVAL_CSS } from './LaunchApprovalPanel.js';
import { DoctorTerminalLog, TERMINAL_CSS } from './DoctorTerminalLog.js';

export function BlackRoadDoctorPanel({ report = null, terminalText = '' }) {
  if (!report) {
    return `
      <div class="br-doctor-panel">
        <div class="br-eyebrow">BlackRoad Doctor</div>
        <h2>No report available</h2>
        <p style="color:var(--br-muted)">Run: npm run doctor --write-report</p>
      </div>
    `;
  }

  return `
    <div class="br-doctor-panel">
      <div class="br-eyebrow">BlackRoad Doctor</div>
      <h2>Launch Control</h2>

      <div class="br-doctor-grid">
        <div class="br-doctor-col">
          ${LaunchScoreCard({ score: report.score, category: report.category })}
          ${LaunchBlockerList({ blockers: report.priorityZero })}
          ${LaunchApprovalPanel({ approvals: report.approvals })}
        </div>
        <div class="br-doctor-col">
          ${LaunchCheckTable({ checks: report.reports })}
        </div>
      </div>

      ${report.nextActions.length > 0 ? `
        <div class="br-section" style="margin-top:var(--br-gap-xl)">
          <div class="br-section-title">Next Actions</div>
          ${report.nextActions.map((a, i) => `<div class="br-mono" style="color:var(--br-muted);margin-bottom:var(--br-gap-xs)">${i + 1}. ${a}</div>`).join('')}
        </div>
      ` : ''}

      ${terminalText ? `
        <div class="br-section" style="margin-top:var(--br-gap-xl)">
          ${DoctorTerminalLog({ terminalText })}
        </div>
      ` : ''}

      <div class="br-section" style="margin-top:var(--br-gap-xl)">
        <div class="br-section-title">Commit Ritual</div>
        ${Object.entries(report.commitRitual).map(([k, v]) => `<div class="br-mono" style="color:var(--br-dim)">[${k.toUpperCase()}] ${v}</div>`).join('')}
      </div>

      <div class="br-mono" style="margin-top:var(--br-gap-xl);color:var(--br-dim)">
        Remember the Road. Pave Tomorrow!
      </div>
    </div>
  `;
}

export const DOCTOR_PANEL_CSS = `
.br-doctor-panel { padding: var(--br-gap-lg); }
.br-doctor-grid { display: grid; grid-template-columns: 300px 1fr; gap: var(--br-gap-lg); margin-top: var(--br-gap-lg); }
@media (max-width: 768px) { .br-doctor-grid { grid-template-columns: 1fr; } }
${SCORE_CSS}
${BLOCKER_CSS}
${CHECK_TABLE_CSS}
${APPROVAL_CSS}
${TERMINAL_CSS}
`;
