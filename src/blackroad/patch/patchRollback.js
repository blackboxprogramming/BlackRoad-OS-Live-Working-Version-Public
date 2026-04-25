#!/usr/bin/env node
// BlackRoad OS — Patch Rollback
// Restores files from the latest backup

import { existsSync, readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { getLatestBackup, restoreFromBackup } from './patchBackups.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const GENERATED = resolve(__dirname, '../generated');
const BACKUP_ROOT = resolve(ROOT, '.blackroad-backups');

// Read the latest patch report to find what was changed
const reportPath = resolve(GENERATED, 'safe-patch-report.json');

if (!existsSync(reportPath)) {
  console.log('No patch report found. Nothing to rollback.');
  process.exit(0);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const applied = (report.patches || []).filter(p => p.applied && p.backupPath);

if (applied.length === 0) {
  console.log('No applied patches with backups found. Nothing to rollback.');
  process.exit(0);
}

console.log('');
console.log('PATCH ROLLBACK');
console.log('==============');
console.log(`Found ${applied.length} patches to rollback.`);
console.log('');

let restored = 0;
let failed = 0;

for (const patch of applied) {
  if (existsSync(patch.backupPath)) {
    const ok = restoreFromBackup(patch.backupPath, patch.targetFile);
    if (ok) {
      console.log(`  [RESTORED] ${patch.targetFile}`);
      restored++;
    } else {
      console.log(`  [FAILED]   ${patch.targetFile}`);
      failed++;
    }
  } else {
    console.log(`  [NO BACKUP] ${patch.targetFile} — backup not found at ${patch.backupPath}`);
    failed++;
  }
}

console.log('');
console.log(`Restored: ${restored} | Failed: ${failed}`);
console.log('');
console.log('Remember the Road. Pave Tomorrow!');
