#!/usr/bin/env node
// BlackRoad OS — Safe Patch Executor
// Applies safe local patches from the launch queue.
//
// Modes:
//   --preview     Show what would change (default)
//   --apply-safe  Apply only safe patches
//
// BLACKROAD PATCH RULE
// Patch locally. Preview first. Backup always.
// Never mutate production without approval.
// Never overwrite human work blindly.
// Never mark fixed without verification.

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { planPatches } from './patchPlanner.js';
import { generatePreview, writePreview, formatPreviewTerminal } from './patchPreview.js';
import { applySafePatches } from './patchApply.js';
import { generatePatchReport, writePatchReport, formatPatchTerminal } from './patchReport.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const GENERATED = resolve(__dirname, '../generated');

const mode = process.argv.includes('--apply-safe') ? 'apply' : 'preview';

// Read launch queue
const queuePath = resolve(GENERATED, 'launch-queue.json');
let tasks = [];
if (existsSync(queuePath)) {
  const queue = JSON.parse(readFileSync(queuePath, 'utf8'));
  tasks = queue.tasks || [];
} else {
  console.log('No launch queue found. Run: npm run launch:queue');
  console.log('Continuing with ritual file checks only...');
}

// Plan patches
const patches = planPatches(tasks, ROOT);

// Preview
const preview = generatePreview(patches);
writePreview(preview, resolve(GENERATED, 'safe-patch-preview.json'));

if (mode === 'preview') {
  console.log(formatPreviewTerminal(preview));
  console.log(`Preview written: ${resolve(GENERATED, 'safe-patch-preview.json')}`);
  process.exit(0);
}

// Apply safe patches
console.log('');
console.log('APPLYING SAFE PATCHES');
console.log('=====================');

const results = applySafePatches(patches, ROOT);
const report = generatePatchReport(results, preview);
const reportPath = writePatchReport(report, GENERATED);

console.log(formatPatchTerminal(report));
console.log(`Report written: ${reportPath}`);
