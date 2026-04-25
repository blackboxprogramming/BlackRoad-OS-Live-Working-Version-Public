// BlackRoad OS — Patch Preview
// Generates a preview of what patches would do without applying anything

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

export function generatePreview(patches) {
  const safe = patches.filter(p => p.safe && !p.requiresApproval);
  const needsApproval = patches.filter(p => p.requiresApproval);
  const blocked = patches.filter(p => !p.safe);

  return {
    generatedAt: new Date().toISOString(),
    tagline: 'Remember the Road. Pave Tomorrow!',
    summary: {
      total: patches.length,
      safe: safe.length,
      needsApproval: needsApproval.length,
      blocked: blocked.length
    },
    safe: safe.map(simplify),
    needsApproval: needsApproval.map(simplify),
    blocked: blocked.map(simplify)
  };
}

function simplify(patch) {
  return {
    patchId: patch.patchId,
    title: patch.title,
    targetFile: patch.targetFile,
    operation: patch.operation,
    safe: patch.safe,
    requiresApproval: patch.requiresApproval,
    reason: patch.reason,
    previewLines: (patch.preview || '').split('\n').length
  };
}

export function writePreview(preview, outputPath) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(preview, null, 2));
}

export function formatPreviewTerminal(preview) {
  const lines = [];
  lines.push('');
  lines.push('SAFE PATCH PREVIEW');
  lines.push('==================');
  lines.push(`Total: ${preview.summary.total} | Safe: ${preview.summary.safe} | Approval: ${preview.summary.needsApproval} | Blocked: ${preview.summary.blocked}`);
  lines.push('');

  if (preview.safe.length > 0) {
    lines.push('Safe patches (will apply):');
    for (const p of preview.safe) {
      lines.push(`  [SAFE] ${p.title}`);
      lines.push(`         ${p.targetFile} (${p.operation}, ${p.previewLines} lines)`);
    }
    lines.push('');
  }

  if (preview.needsApproval.length > 0) {
    lines.push('Needs approval (will skip):');
    for (const p of preview.needsApproval) {
      lines.push(`  [APPROVAL] ${p.title}`);
      lines.push(`             ${p.reason}`);
    }
    lines.push('');
  }

  if (preview.blocked.length > 0) {
    lines.push('Blocked (will not apply):');
    for (const p of preview.blocked) {
      lines.push(`  [BLOCKED] ${p.title}`);
    }
    lines.push('');
  }

  lines.push('Remember the Road. Pave Tomorrow!');
  return lines.join('\n');
}
