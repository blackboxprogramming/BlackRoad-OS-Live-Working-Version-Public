#!/usr/bin/env node
// BlackRoad OS — Release Plan
// Generates a full release plan from doctor + gates + queue

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRelease } from './releaseRegistry.js';
import { evaluateGates, canShipProduction, formatGatesTerminal } from './releaseGates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const GENERATED = resolve(__dirname, '../generated');
const DOCS = resolve(ROOT, 'docs');

function tryReadReport(f) {
  const p = resolve(GENERATED, f);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

// Build release plan
const release = createRelease('BlackRoad OS Preview Release');
const gates = evaluateGates();
const shipStatus = canShipProduction(gates);
const doctorReport = tryReadReport('blackroad-doctor-report.json');
const launchQueue = tryReadReport('launch-queue.json');

release.gates = gates;
release.priorityZero = gates.filter(g => g.severity === 0 && g.status !== 'pass').map(g => g.label);
release.approvalsRequired = gates.filter(g => g.approvalRequired).map(g => ({ gateId: g.gateId, label: g.label, details: g.details }));
release.status = shipStatus.allowed ? 'preview-ready' : 'blocked';

// Terminal output
console.log('');
console.log('BLACKROAD RELEASE PLAN');
console.log('======================');
console.log(`Release: ${release.releaseId}`);
console.log(`Version: ${release.version}`);
console.log(`Status:  ${release.status}`);
console.log(`Products: ${release.productsIncluded.length}`);
console.log(`Surfaces: ${release.surfacesIncluded.length}`);
console.log(`Doctor score: ${doctorReport?.score || 'N/A'}`);
console.log(`Launch queue: ${launchQueue?.totalTasks || 'N/A'} tasks`);
console.log('');

console.log(formatGatesTerminal(gates, shipStatus));

// Next actions
const nextActions = [];
for (const g of gates) {
  if (g.status === 'fail') nextActions.push(`Fix: ${g.label} — ${g.details}`);
  if (g.status === 'missing') nextActions.push(`Add: ${g.label} — ${g.recommendedAction || g.details}`);
  if (g.status === 'needs-approval') nextActions.push(`Verify: ${g.label} — ${g.details}`);
}

if (nextActions.length > 0) {
  console.log('Next actions:');
  nextActions.forEach((a, i) => console.log(`  ${i + 1}. ${a}`));
  console.log('');
}

// Write reports
mkdirSync(GENERATED, { recursive: true });
mkdirSync(DOCS, { recursive: true });

writeFileSync(resolve(GENERATED, 'release-plan.json'), JSON.stringify(release, null, 2));

// Markdown docs
writeFileSync(resolve(DOCS, 'RELEASE_PLAN.md'), `# BlackRoad Release Plan

Release: ${release.releaseId}
Version: ${release.version}
Status: ${release.status}
Generated: ${release.createdAt}

## Gates

${gates.map(g => `- [${g.status.toUpperCase()}] ${g.label}${g.details ? ` — ${g.details}` : ''}`).join('\n')}

## Production

${shipStatus.allowed ? 'READY' : 'BLOCKED'} — ${shipStatus.reason}

## Priority 0

${release.priorityZero.length > 0 ? release.priorityZero.map(p => `- ${p}`).join('\n') : 'None'}

## Next Actions

${nextActions.length > 0 ? nextActions.map((a, i) => `${i + 1}. ${a}`).join('\n') : 'None'}

## Commit Ritual

[MEMORY] ${release.commitRitual.memory}
[CODEX] ${release.commitRitual.codex}
[PRODUCTS] ${release.commitRitual.products}
[BRTODO] ${release.commitRitual.brtodo}
[COLLAB] ${release.commitRitual.collab}
[ROADTRIP] ${release.commitRitual.roadtrip}

Remember the Road. Pave Tomorrow!
`);

console.log('Reports written:');
console.log(`  ${resolve(GENERATED, 'release-plan.json')}`);
console.log(`  ${resolve(DOCS, 'RELEASE_PLAN.md')}`);
console.log('');
console.log('Commit ritual:');
Object.entries(release.commitRitual).forEach(([k, v]) => console.log(`  [${k.toUpperCase()}] ${v}`));
console.log('');
console.log('Remember the Road. Pave Tomorrow!');
