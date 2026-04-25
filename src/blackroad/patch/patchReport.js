// BlackRoad OS — Patch Report
// Generates reports from patch results

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

export function generatePatchReport(patches, preview) {
  const applied = patches.filter(p => p.applied);
  const skipped = patches.filter(p => !p.applied && !p.requiresApproval);
  const approval = patches.filter(p => p.requiresApproval);
  const backups = patches.filter(p => p.backupPath).map(p => ({ file: p.targetFile, backup: p.backupPath }));

  return {
    generatedAt: new Date().toISOString(),
    tagline: 'Remember the Road. Pave Tomorrow!',
    summary: {
      planned: preview?.summary?.total || patches.length,
      applied: applied.length,
      skipped: skipped.length,
      approval: approval.length,
      blocked: patches.filter(p => !p.safe).length,
      backups: backups.length
    },
    patches,
    backups,
    commitRitual: {
      memory: 'reviewed',
      codex: 'updated',
      products: 'reviewed',
      brtodo: 'updated',
      collab: 'updated',
      roadtrip: 'updated'
    }
  };
}

export function writePatchReport(report, outputDir) {
  mkdirSync(outputDir, { recursive: true });
  const reportPath = resolve(outputDir, 'safe-patch-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

export function formatPatchTerminal(report) {
  const lines = [];
  lines.push('');
  lines.push('SAFE PATCH REPORT');
  lines.push('=================');
  lines.push(`Planned:  ${report.summary.planned}`);
  lines.push(`Applied:  ${report.summary.applied}`);
  lines.push(`Skipped:  ${report.summary.skipped}`);
  lines.push(`Approval: ${report.summary.approval}`);
  lines.push(`Blocked:  ${report.summary.blocked}`);
  lines.push(`Backups:  ${report.summary.backups}`);
  lines.push('');

  const applied = report.patches.filter(p => p.applied);
  if (applied.length > 0) {
    lines.push('Applied:');
    for (const p of applied) {
      lines.push(`  [APPLIED] ${p.title}`);
      lines.push(`            ${p.targetFile}`);
    }
    lines.push('');
  }

  const skipped = report.patches.filter(p => !p.applied && p.reason);
  if (skipped.length > 0) {
    lines.push('Skipped:');
    for (const p of skipped) {
      lines.push(`  [SKIPPED] ${p.title} — ${p.reason}`);
    }
    lines.push('');
  }

  lines.push('Commit ritual:');
  for (const [k, v] of Object.entries(report.commitRitual)) {
    lines.push(`  [${k.toUpperCase()}] ${v}`);
  }
  lines.push('');
  lines.push('Remember the Road. Pave Tomorrow!');
  return lines.join('\n');
}
