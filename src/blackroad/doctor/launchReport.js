// BlackRoad OS — Launch Report
// Generates the full launch control report

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { PRODUCTS } from '../products.js';
import { SITES } from '../sites.js';
import { AGENTS } from '../command/commandRegistry.js';
import { ALL_SURFACES } from '../surfaces/surfaceRegistry.js';
import { calculateScore, getCategory, scoreSummary } from './launchScore.js';
import { evaluateBlockers } from './launchBlockers.js';
import { getPendingApprovals } from './launchApprovals.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED = resolve(__dirname, '../generated');

export function generateReport(checkResults) {
  const blockers = evaluateBlockers(checkResults);
  const score = calculateScore(checkResults, blockers);
  const category = getCategory(score);
  const approvals = getPendingApprovals();

  const summary = {
    checksRun: checkResults.length,
    passed: checkResults.filter(r => r.status === 'pass').length,
    warnings: checkResults.filter(r => r.status === 'warning').length,
    failures: checkResults.filter(r => r.status === 'fail').length,
    missing: checkResults.filter(r => r.status === 'missing').length,
    blocked: checkResults.filter(r => r.status === 'blocked').length,
    needsApproval: checkResults.filter(r => r.status === 'needs-approval').length
  };

  const nextActions = [];
  for (const r of checkResults) {
    if (r.status === 'fail') nextActions.push(`Fix: ${r.name} — ${r.detail}`);
    if (r.status === 'missing') nextActions.push(`Add: ${r.suggestion || r.name}`);
  }
  for (const b of blockers) {
    nextActions.unshift(`P0: ${b.fix}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    tagline: 'Remember the Road. Pave Tomorrow!',
    workingRoot: '/Applications/BlackRoadOS',
    workspace: '/Applications/BlackRoadOS/workspace',
    score,
    category,
    priorityZero: blockers,
    summary,
    products: PRODUCTS.map(p => ({ id: p.id, name: p.name, domain: p.domain })),
    domains: PRODUCTS.map(p => p.domain),
    agents: AGENTS.map(a => ({ id: a.id, name: a.name, role: a.role })),
    surfaces: ALL_SURFACES.map(s => ({ id: s.id, kind: s.kind, title: s.title })),
    reports: checkResults,
    approvals,
    nextActions,
    commitRitual: {
      memory: 'reviewed',
      codex: 'updated',
      products: 'reviewed',
      brtodo: nextActions.length > 0 ? 'updated' : 'not-needed',
      collab: 'updated',
      roadtrip: 'updated'
    }
  };

  return report;
}

export function writeReport(report) {
  const reportPath = resolve(GENERATED, 'blackroad-doctor-report.json');
  const launchPath = resolve(GENERATED, 'launch-control-report.json');

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  writeFileSync(launchPath, JSON.stringify({
    score: report.score,
    category: report.category,
    priorityZero: report.priorityZero,
    summary: report.summary,
    nextActions: report.nextActions,
    generatedAt: report.generatedAt
  }, null, 2));

  return { reportPath, launchPath };
}
