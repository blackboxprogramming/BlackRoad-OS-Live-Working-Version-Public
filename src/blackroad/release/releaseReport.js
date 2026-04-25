#!/usr/bin/env node
// BlackRoad OS — Release Report
// Generates comprehensive release report with all gates, plans, and docs

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRelease } from './releaseRegistry.js';
import { evaluateGates, canShipProduction } from './releaseGates.js';
import { generateStagingPlan } from './stagingPlan.js';
import { generateProductionPlan } from './productionPlan.js';
import { generateRollbackPlan } from './rollbackPlan.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const GENERATED = resolve(__dirname, '../generated');
const DOCS = resolve(ROOT, 'docs');

const release = createRelease('BlackRoad OS Release');
const gates = evaluateGates();
const shipStatus = canShipProduction(gates);
const staging = generateStagingPlan(release, gates);
const production = generateProductionPlan(release, gates, shipStatus);
const rollback = generateRollbackPlan(release);

release.gates = gates;
release.status = shipStatus.allowed ? 'production-ready' : 'blocked';

// Write all reports
mkdirSync(GENERATED, { recursive: true });
mkdirSync(DOCS, { recursive: true });

writeFileSync(resolve(GENERATED, 'release-plan.json'), JSON.stringify(release, null, 2));
writeFileSync(resolve(GENERATED, 'release-gates-report.json'), JSON.stringify({ gates, production: shipStatus }, null, 2));

// Rollback doc
writeFileSync(resolve(DOCS, 'ROLLBACK_PLAN.md'), `# BlackRoad Rollback Plan

Release: ${release.releaseId}
Version: ${release.version}

## Steps

${rollback.steps.map(s => `${s.order}. ${s.action}${s.command ? ` — \`${s.command}\`` : ''}`).join('\n')}

## Local Rollback

\`${rollback.localRollback.command}\` — ${rollback.localRollback.description}

## Rule

Rollback never executes automatically. All rollbacks require human decision.

Remember the Road. Pave Tomorrow!
`);

// Release gates doc
writeFileSync(resolve(DOCS, 'RELEASE_GATES.md'), `# BlackRoad Release Gates

${gates.map(g => `- [${g.status.toUpperCase()}] ${g.label}${g.details ? ` — ${g.details}` : ''}`).join('\n')}

## Production: ${shipStatus.allowed ? 'READY' : 'BLOCKED'}

${shipStatus.reason}

Remember the Road. Pave Tomorrow!
`);

// Preview deploy doc
writeFileSync(resolve(DOCS, 'PREVIEW_DEPLOY.md'), `# BlackRoad Preview Deploy

## Preview Server

\`npm run preview:server\` starts a local preview at http://localhost:4173

## Preview Checks

\`npm run release:preview\` validates generated output without a live server.

## What it checks

- Homepage renders with SiteShell
- Product launcher grid renders
- Command dock renders and routes
- Base CSS exists
- Official tagline present
- Health.json files exist for all products
- Site.json files exist for all products
- Product docs exist for all products

## Pipeline

1. \`npm run doctor -- --write-report\`
2. \`npm run launch:queue\`
3. \`npm run patch:safe\`
4. \`npm run release:preview\`
5. \`npm run release:gates\`
6. \`npm run release:plan\`

Remember the Road. Pave Tomorrow!
`);

console.log('Release report generated:');
console.log(`  ${resolve(GENERATED, 'release-plan.json')}`);
console.log(`  ${resolve(GENERATED, 'release-gates-report.json')}`);
console.log(`  ${resolve(DOCS, 'RELEASE_PLAN.md')}`);
console.log(`  ${resolve(DOCS, 'RELEASE_GATES.md')}`);
console.log(`  ${resolve(DOCS, 'PREVIEW_DEPLOY.md')}`);
console.log(`  ${resolve(DOCS, 'ROLLBACK_PLAN.md')}`);
