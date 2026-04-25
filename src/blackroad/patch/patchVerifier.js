#!/usr/bin/env node
// BlackRoad OS — Patch Verifier
// Runs verification checks after patches are applied

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const GENERATED = resolve(__dirname, '../generated');

const CHECKS = [
  'check:command-dock',
  'check:base-css',
  'doctor'
];

console.log('');
console.log('PATCH VERIFICATION');
console.log('==================');

const results = [];

for (const script of CHECKS) {
  try {
    execSync(`npm run ${script} --silent 2>/dev/null`, { cwd: ROOT, timeout: 30000, stdio: 'pipe' });
    console.log(`  [PASS] npm run ${script}`);
    results.push({ script, status: 'pass' });
  } catch (e) {
    if (e.status === undefined) {
      console.log(`  [MISSING] npm run ${script}`);
      results.push({ script, status: 'missing' });
    } else {
      console.log(`  [FAIL] npm run ${script} (exit ${e.status})`);
      results.push({ script, status: 'fail' });
    }
  }
}

// Check that applied patches created their target files
const reportPath = resolve(GENERATED, 'safe-patch-report.json');
if (existsSync(reportPath)) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const applied = (report.patches || []).filter(p => p.applied);
  let verified = 0;
  let missing = 0;

  for (const patch of applied) {
    if (existsSync(patch.targetFile)) {
      verified++;
    } else {
      console.log(`  [MISSING] ${patch.targetFile} — patch applied but file not found`);
      missing++;
    }
  }

  console.log('');
  console.log(`Patch files: ${verified} verified, ${missing} missing`);
}

const passed = results.filter(r => r.status === 'pass').length;
const total = results.length;
console.log('');
console.log(`Checks: ${passed}/${total} passed`);
console.log('');
console.log('Remember the Road. Pave Tomorrow!');

process.exit(results.some(r => r.status === 'fail') ? 1 : 0);
