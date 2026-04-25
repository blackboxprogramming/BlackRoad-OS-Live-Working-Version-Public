// BlackRoad OS — Launch Summary
// Terminal-formatted output for the doctor

import { scoreSummary } from './launchScore.js';

const STATUS_LABELS = {
  pass: '[PASS]',
  warning: '[WARN]',
  fail: '[FAIL]',
  missing: '[MISSING]',
  blocked: '[BLOCKED]',
  'needs-approval': '[APPROVAL]',
  skipped: '[SKIP]'
};

export function formatTerminalOutput(report) {
  const lines = [];

  lines.push('');
  lines.push('BLACKROAD DOCTOR');
  lines.push('================');
  lines.push(`Root:      ${report.workingRoot}`);
  lines.push(`Workspace: ${report.workspace}`);
  lines.push(`Tagline:   ${report.tagline}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');

  // Priority 0
  if (report.priorityZero.length > 0) {
    lines.push('Priority 0:');
    for (const b of report.priorityZero) {
      lines.push(`  - ${b.label}`);
      lines.push(`    Fix: ${b.fix}`);
    }
    lines.push('');
  }

  // Checks
  lines.push('Checks:');
  for (const r of report.reports) {
    const label = STATUS_LABELS[r.status] || `[${r.status.toUpperCase()}]`;
    const pad = ' '.repeat(Math.max(0, 12 - label.length));
    lines.push(`  ${label}${pad}${r.name}`);
    if (r.status !== 'pass' && r.detail) {
      lines.push(`              ${r.detail}`);
    }
  }
  lines.push('');

  // Summary
  lines.push('Summary:');
  lines.push(`  Checks run:     ${report.summary.checksRun}`);
  lines.push(`  Passed:         ${report.summary.passed}`);
  lines.push(`  Warnings:       ${report.summary.warnings}`);
  lines.push(`  Failures:       ${report.summary.failures}`);
  lines.push(`  Missing:        ${report.summary.missing}`);
  lines.push(`  Blocked:        ${report.summary.blocked}`);
  lines.push(`  Needs approval: ${report.summary.needsApproval}`);
  lines.push('');

  // Score
  lines.push('Launch score:');
  lines.push(`  ${scoreSummary(report.score)}`);
  lines.push('');

  // Next actions
  if (report.nextActions.length > 0) {
    lines.push('Next actions:');
    report.nextActions.forEach((a, i) => {
      lines.push(`  ${i + 1}. ${a}`);
    });
    lines.push('');
  }

  // Commit ritual
  lines.push('Commit ritual:');
  for (const [key, val] of Object.entries(report.commitRitual)) {
    lines.push(`  [${key.toUpperCase()}] ${val}`);
  }
  lines.push('');
  lines.push('Remember the Road. Pave Tomorrow!');

  return lines.join('\n');
}
