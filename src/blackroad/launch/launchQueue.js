#!/usr/bin/env node
// BlackRoad OS — Launch Queue
// Reads doctor report, generates prioritized task queue + safe fix plan
//
// Usage:
//   npm run launch:queue
//   node src/blackroad/launch/launchQueue.js
//
// BLACKROAD LAUNCH QUEUE RULE
// Doctor finds the truth. Launch Queue orders the work.
// Safe Fix Planner separates local patches from risky changes.
// Approvals guard production. Fix the Road in order.

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { prioritize } from './launchPrioritizer.js';
import { planFixes, formatSafeFixPlan } from './safeFixPlanner.js';
import { writeQueueReport } from './writeLaunchQueueReport.js';
import { createLaunchCard } from './createRoadTripLaunchCard.js';
import { generateTodoEntries } from './updateBRTODOFromLaunchQueue.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED = resolve(__dirname, '../generated');

// Read doctor report
const reportPath = resolve(GENERATED, 'blackroad-doctor-report.json');
if (!existsSync(reportPath)) {
  console.error('No doctor report found. Run: npm run doctor -- --write-report');
  process.exit(1);
}

const doctorReport = JSON.parse(readFileSync(reportPath, 'utf8'));

// Generate prioritized task queue
const tasks = prioritize(doctorReport);

// Generate safe fix plan
const plan = planFixes(tasks);

// Terminal output
console.log('');
console.log('BLACKROAD LAUNCH QUEUE');
console.log('=====================');
console.log(`Doctor score: ${doctorReport.score} / 100 — ${doctorReport.category}`);
console.log(`Tasks: ${tasks.length}`);
console.log(`  P0: ${tasks.filter(t => t.priority === 0).length}`);
console.log(`  P1: ${tasks.filter(t => t.priority === 1).length}`);
console.log(`  P2: ${tasks.filter(t => t.priority === 2).length}`);
console.log(`  P3: ${tasks.filter(t => t.priority === 3).length}`);
console.log(`  Safe local: ${tasks.filter(t => t.safeToAutoPatch).length}`);
console.log(`  Needs approval: ${tasks.filter(t => t.requiresApproval && !t.safeToAutoPatch).length}`);
console.log('');

// Show tasks by priority
for (const p of [0, 1, 2, 3]) {
  const ptasks = tasks.filter(t => t.priority === p);
  if (ptasks.length === 0) continue;
  console.log(`Priority ${p}:`);
  for (const t of ptasks) {
    const badge = t.safeToAutoPatch ? '[SAFE]' : t.requiresApproval ? '[APPROVAL]' : '';
    console.log(`  ${badge.padEnd(12)} ${t.title}`);
  }
  console.log('');
}

// Safe fix plan
console.log(formatSafeFixPlan(plan));

// Write reports
const paths = writeQueueReport(tasks, plan);
console.log('Reports written:');
console.log(`  ${paths.queuePath}`);
console.log(`  ${paths.planPath}`);
console.log(`  ${paths.queueDoc}`);
console.log(`  ${paths.planDoc}`);

// RoadTrip card
const card = createLaunchCard(tasks, doctorReport);
console.log('');
console.log('RoadTrip card:');
console.log(`  Score: ${card.score}`);
console.log(`  P0: ${card.priorityZero.length}`);
console.log(`  Next: ${card.nextTasks.length}`);
console.log(`  Safe: ${card.safeLocalPatches.length}`);
console.log(`  Approval: ${card.approvalRequired.length}`);

// TODO preview
console.log('');
console.log('BRTODO preview:');
const todo = generateTodoEntries(tasks);
const todoLines = todo.split('\n').slice(0, 15);
todoLines.forEach(l => console.log(`  ${l}`));
if (todo.split('\n').length > 15) console.log('  ...');

console.log('');
console.log('Commit ritual:');
console.log('  [MEMORY] reviewed');
console.log('  [CODEX] updated');
console.log('  [PRODUCTS] reviewed');
console.log('  [BRTODO] updated');
console.log('  [COLLAB] updated');
console.log('  [ROADTRIP] updated');
console.log('');
console.log('Remember the Road. Pave Tomorrow!');
