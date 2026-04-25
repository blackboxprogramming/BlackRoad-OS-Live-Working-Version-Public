// BlackRoad OS — Patch Apply
// Applies safe patches, creating backups first

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { createBackup } from './patchBackups.js';
import { validatePatch, isGeneratedBlock } from './patchGuards.js';

export function applySafePatches(patches, rootDir) {
  const results = [];

  for (const patch of patches) {
    // Only apply safe, non-approval patches
    if (!patch.safe || patch.requiresApproval) {
      results.push({ ...patch, applied: false, reason: 'Not safe or needs approval' });
      continue;
    }

    // Validate
    const validation = validatePatch(patch);
    if (!validation.valid) {
      results.push({ ...patch, applied: false, reason: validation.errors.join('; ') });
      continue;
    }

    // Apply
    const result = applySinglePatch(patch, rootDir);
    results.push(result);
  }

  return results;
}

function applySinglePatch(patch, rootDir) {
  try {
    const targetDir = dirname(patch.targetFile);
    mkdirSync(targetDir, { recursive: true });

    switch (patch.operation) {
      case 'create': {
        if (existsSync(patch.targetFile)) {
          // Backup existing file
          patch.backupPath = createBackup(patch.targetFile, rootDir) || '';
        }
        writeFileSync(patch.targetFile, patch.preview);
        return { ...patch, applied: true, updatedAt: new Date().toISOString() };
      }

      case 'append': {
        patch.backupPath = createBackup(patch.targetFile, rootDir) || '';
        const existing = existsSync(patch.targetFile) ? readFileSync(patch.targetFile, 'utf8') : '';
        writeFileSync(patch.targetFile, existing + '\n' + patch.preview);
        return { ...patch, applied: true, updatedAt: new Date().toISOString() };
      }

      case 'replace-generated-block': {
        if (!existsSync(patch.targetFile)) {
          // Create with generated block
          writeFileSync(patch.targetFile, patch.preview);
          return { ...patch, applied: true, updatedAt: new Date().toISOString() };
        }

        const content = readFileSync(patch.targetFile, 'utf8');
        if (!isGeneratedBlock(content)) {
          return { ...patch, applied: false, reason: 'No generated block markers found — refusing to overwrite' };
        }

        patch.backupPath = createBackup(patch.targetFile, rootDir) || '';
        const updated = content.replace(
          /<!-- BLACKROAD:GENERATED:START -->[\s\S]*?<!-- BLACKROAD:GENERATED:END -->/,
          `<!-- BLACKROAD:GENERATED:START -->\n${patch.preview}\n<!-- BLACKROAD:GENERATED:END -->`
        );
        writeFileSync(patch.targetFile, updated);
        return { ...patch, applied: true, updatedAt: new Date().toISOString() };
      }

      case 'generate-json':
      case 'generate-md': {
        if (existsSync(patch.targetFile)) {
          patch.backupPath = createBackup(patch.targetFile, rootDir) || '';
        }
        writeFileSync(patch.targetFile, patch.preview);
        return { ...patch, applied: true, updatedAt: new Date().toISOString() };
      }

      case 'add-import': {
        if (!existsSync(patch.targetFile)) {
          return { ...patch, applied: false, reason: 'Target file does not exist for import addition' };
        }
        patch.backupPath = createBackup(patch.targetFile, rootDir) || '';
        const content = readFileSync(patch.targetFile, 'utf8');
        if (content.includes(patch.preview)) {
          return { ...patch, applied: false, reason: 'Import already exists' };
        }
        writeFileSync(patch.targetFile, patch.preview + '\n' + content);
        return { ...patch, applied: true, updatedAt: new Date().toISOString() };
      }

      default:
        return { ...patch, applied: false, reason: `Unknown operation: ${patch.operation}` };
    }
  } catch (err) {
    return { ...patch, applied: false, reason: `Error: ${err.message}` };
  }
}
