// BlackRoad OS — LaunchQueuePanel
// Master panel for the launch queue surface

import { LaunchScoreCard } from './LaunchScoreCard.js';
import { LaunchBlockerList } from './LaunchBlockerList.js';

export function LaunchQueuePanel({ tasks = [], plan = null, doctorReport = null }) {
  const p0 = tasks.filter(t => t.priority === 0);
  const p1 = tasks.filter(t => t.priority === 1);
  const p2 = tasks.filter(t => t.priority === 2);
  const p3 = tasks.filter(t => t.priority === 3);
  const safe = tasks.filter(t => t.safeToAutoPatch);
  const approval = tasks.filter(t => t.requiresApproval && !t.safeToAutoPatch);

  return `
    <div class="br-launch-queue">
      <div class="br-eyebrow">Launch Queue</div>
      <h2>Ordered Work</h2>

      <div class="br-launch-summary br-section">
        <div class="br-mono">
          Total: ${tasks.length} | P0: ${p0.length} | P1: ${p1.length} | P2: ${p2.length} | P3: ${p3.length}
          | Safe: ${safe.length} | Approval: ${approval.length}
        </div>
      </div>

      ${p0.length > 0 ? renderLane('Priority 0', p0) : ''}
      ${p1.length > 0 ? renderLane('Priority 1', p1) : ''}
      ${safe.length > 0 ? renderLane('Safe Local Fixes', safe) : ''}
      ${approval.length > 0 ? renderLane('Needs Approval', approval) : ''}
      ${p2.length > 0 ? renderLane('Priority 2', p2) : ''}
      ${p3.length > 0 ? renderLane('Priority 3 — Deferred', p3) : ''}

      <div class="br-mono" style="margin-top:var(--br-gap-xl);color:var(--br-dim)">
        Remember the Road. Pave Tomorrow!
      </div>
    </div>
  `;
}

function renderLane(label, tasks) {
  const cards = tasks.map(t => `
    <div class="br-launch-task br-card">
      <div class="br-launch-task__header">
        <span class="br-launch-task__badge">${t.safeToAutoPatch ? 'SAFE' : t.requiresApproval ? 'APPROVAL' : t.severity.toUpperCase()}</span>
        <span class="br-launch-task__title">${t.title}</span>
      </div>
      ${t.description ? `<div class="br-launch-task__desc">${t.description}</div>` : ''}
      ${t.verificationCommand ? `<div class="br-launch-task__verify">Verify: ${t.verificationCommand}</div>` : ''}
      <div class="br-launch-task__meta">${t.category} · ${t.status}</div>
    </div>
  `).join('');

  return `
    <div class="br-launch-lane br-section">
      <div class="br-section-title">${label}</div>
      ${cards}
    </div>
  `;
}

export const QUEUE_PANEL_CSS = `
.br-launch-queue { padding: var(--br-gap-lg); }
.br-launch-lane { margin-bottom: var(--br-gap-lg); }
.br-launch-task { margin-bottom: var(--br-gap-sm); padding: var(--br-gap-md); }
.br-launch-task__header { display: flex; align-items: center; gap: var(--br-gap-sm); }
.br-launch-task__badge {
  font-family: var(--br-font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--br-dim); padding: 2px 6px;
  border: 1px solid var(--br-line); border-radius: 4px;
}
.br-launch-task__title { font-size: 13px; color: var(--br-text); }
.br-launch-task__desc { font-size: 12px; color: var(--br-muted); margin-top: var(--br-gap-xs); }
.br-launch-task__verify { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-dim); margin-top: var(--br-gap-xs); }
.br-launch-task__meta { font-family: var(--br-font-mono); font-size: 10px; color: var(--br-dim); margin-top: var(--br-gap-xs); }
`;
