// BlackRoad OS — Write Launch Queue Report
// Writes queue and plan to generated/ and docs/

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const GENERATED = resolve(__dirname, '../generated');
const DOCS = resolve(ROOT, 'docs');

function ensureDir(dir) { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); }

export function writeQueueReport(tasks, plan) {
  ensureDir(GENERATED);
  ensureDir(DOCS);

  // JSON reports
  writeFileSync(resolve(GENERATED, 'launch-queue.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    tagline: 'Remember the Road. Pave Tomorrow!',
    totalTasks: tasks.length,
    byPriority: {
      p0: tasks.filter(t => t.priority === 0).length,
      p1: tasks.filter(t => t.priority === 1).length,
      p2: tasks.filter(t => t.priority === 2).length,
      p3: tasks.filter(t => t.priority === 3).length
    },
    bySafety: {
      safe: tasks.filter(t => t.safeToAutoPatch).length,
      approval: tasks.filter(t => t.requiresApproval).length
    },
    tasks
  }, null, 2));

  writeFileSync(resolve(GENERATED, 'safe-fix-plan.json'), JSON.stringify(plan, null, 2));

  // Markdown docs
  writeFileSync(resolve(DOCS, 'LAUNCH_QUEUE.md'), generateLaunchQueueMd(tasks));
  writeFileSync(resolve(DOCS, 'SAFE_FIX_PLAN.md'), generateSafeFixPlanMd(plan));

  return {
    queuePath: resolve(GENERATED, 'launch-queue.json'),
    planPath: resolve(GENERATED, 'safe-fix-plan.json'),
    queueDoc: resolve(DOCS, 'LAUNCH_QUEUE.md'),
    planDoc: resolve(DOCS, 'SAFE_FIX_PLAN.md')
  };
}

function generateLaunchQueueMd(tasks) {
  const lines = ['# BlackRoad Launch Queue', ''];
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total tasks: ${tasks.length}`);
  lines.push('');

  const byPriority = [0, 1, 2, 3];
  const labels = { 0: 'Priority 0', 1: 'Priority 1', 2: 'Priority 2', 3: 'Priority 3' };

  for (const p of byPriority) {
    const ptasks = tasks.filter(t => t.priority === p);
    if (ptasks.length === 0) continue;
    lines.push(`## ${labels[p]}`);
    lines.push('');
    for (const t of ptasks) {
      const badge = t.safeToAutoPatch ? '[SAFE]' : t.requiresApproval ? '[APPROVAL]' : '';
      lines.push(`- **${t.title}** ${badge}`);
      if (t.description) lines.push(`  ${t.description}`);
      if (t.verificationCommand) lines.push(`  Verify: \`${t.verificationCommand}\``);
    }
    lines.push('');
  }

  lines.push('## Commit Ritual');
  lines.push('[MEMORY] reviewed');
  lines.push('[CODEX] updated');
  lines.push('[PRODUCTS] reviewed');
  lines.push('[BRTODO] updated');
  lines.push('[COLLAB] updated');
  lines.push('[ROADTRIP] updated');
  lines.push('');
  lines.push('Remember the Road. Pave Tomorrow!');
  return lines.join('\n');
}

function generateSafeFixPlanMd(plan) {
  const lines = ['# BlackRoad Safe Fix Plan', ''];
  lines.push(`Generated: ${plan.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Total: ${plan.summary.total}`);
  lines.push(`- Safe local: ${plan.summary.safeLocal}`);
  lines.push(`- Needs approval: ${plan.summary.needsApproval}`);
  lines.push(`- Needs DNS/SSL: ${plan.summary.needsDNS}`);
  lines.push('');

  for (const [key, lane] of Object.entries(plan.lanes)) {
    const items = lane.tasks || lane.items || [];
    if (items.length === 0) continue;
    lines.push(`## ${lane.label}`);
    for (const item of items) {
      lines.push(`- ${item.title || item.command || ''}`);
    }
    lines.push('');
  }

  lines.push('Remember the Road. Pave Tomorrow!');
  return lines.join('\n');
}
