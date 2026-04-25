// BlackRoad OS — Safe Fix Planner
// Separates tasks into safe local patches vs approval-required changes

import { classify } from './approvalClassifier.js';

export function planFixes(tasks) {
  const safeLocal = [];
  const needsApproval = [];
  const needsExternal = [];
  const needsSSH = [];
  const needsDNS = [];
  const needsVerification = [];
  const needsDocsUpdate = [];

  for (const task of tasks) {
    // Classify by what's needed
    if (task.safeToAutoPatch) {
      safeLocal.push(task);
    } else if (task.category === 'ssl' || task.category === 'dns') {
      needsDNS.push(task);
    } else if (task.requiresApproval) {
      needsApproval.push(task);
    } else {
      needsExternal.push(task);
    }

    // Everything needs verification
    if (task.verificationCommand) {
      needsVerification.push({ taskId: task.taskId, title: task.title, command: task.verificationCommand });
    }

    // Doc-related tasks
    if (['docs', 'registry'].includes(task.category)) {
      needsDocsUpdate.push(task);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    tagline: 'Remember the Road. Pave Tomorrow!',
    summary: {
      total: tasks.length,
      safeLocal: safeLocal.length,
      needsApproval: needsApproval.length,
      needsExternal: needsExternal.length,
      needsDNS: needsDNS.length,
      needsVerification: needsVerification.length
    },
    lanes: {
      safeLocal: {
        label: '1. Safe local patches (can run now)',
        tasks: safeLocal
      },
      needsApproval: {
        label: '2. Needs human approval',
        tasks: needsApproval
      },
      needsExternal: {
        label: '3. Needs external dashboard/access',
        tasks: needsExternal
      },
      needsSSH: {
        label: '4. Needs SSH to fleet',
        tasks: needsSSH
      },
      needsDNS: {
        label: '5. Needs DNS/Cloudflare/SSL',
        tasks: needsDNS
      },
      needsVerification: {
        label: '6. Verification commands after fix',
        items: needsVerification
      },
      needsDocsUpdate: {
        label: '7. Docs to update after fix',
        tasks: needsDocsUpdate
      }
    }
  };
}

// Format safe fix plan as terminal output
export function formatSafeFixPlan(plan) {
  const lines = [];
  lines.push('');
  lines.push('SAFE FIX PLAN');
  lines.push('=============');
  lines.push(`Total tasks: ${plan.summary.total}`);
  lines.push(`Safe local:  ${plan.summary.safeLocal}`);
  lines.push(`Approval:    ${plan.summary.needsApproval}`);
  lines.push(`External:    ${plan.summary.needsExternal}`);
  lines.push(`DNS/SSL:     ${plan.summary.needsDNS}`);
  lines.push('');

  for (const [key, lane] of Object.entries(plan.lanes)) {
    const items = lane.tasks || lane.items || [];
    if (items.length === 0) continue;
    lines.push(lane.label);
    for (const item of items) {
      const title = item.title || item.command || '';
      const badge = item.safeToAutoPatch ? ' [SAFE]' : item.requiresApproval ? ' [APPROVAL]' : '';
      lines.push(`  - ${title}${badge}`);
    }
    lines.push('');
  }

  lines.push('Remember the Road. Pave Tomorrow!');
  return lines.join('\n');
}
