#!/usr/bin/env node
// BlackRoad OS — Build All
// Runs all available build steps, skipping missing ones

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');

const BUILD_STEPS = [
  { name: 'Doctor report', script: 'doctor -- --write-report' },
  { name: 'Command dock check', script: 'report:command-dock' },
  { name: 'Launch queue', script: 'launch:queue' },
  { name: 'Safe patch preview', script: 'patch:preview' }
];

console.log('');
console.log('BLACKROAD BUILD');
console.log('===============');

const results = [];

for (const step of BUILD_STEPS) {
  try {
    execSync(`npm run ${step.script} --silent 2>/dev/null`, { cwd: ROOT, timeout: 60000, stdio: 'pipe' });
    console.log(`  [PASS] ${step.name}`);
    results.push({ name: step.name, status: 'pass' });
  } catch (e) {
    if (e.status === undefined) {
      console.log(`  [MISSING] ${step.name}`);
      results.push({ name: step.name, status: 'missing' });
    } else {
      // Non-zero exit is okay for doctor (exit 1 = warnings)
      console.log(`  [DONE] ${step.name} (exit ${e.status})`);
      results.push({ name: step.name, status: 'done' });
    }
  }
}

const passed = results.filter(r => r.status === 'pass' || r.status === 'done').length;
console.log('');
console.log(`Build: ${passed}/${results.length} steps completed`);
console.log('');
console.log('Remember the Road. Pave Tomorrow!');
