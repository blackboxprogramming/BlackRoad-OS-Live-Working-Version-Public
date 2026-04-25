// BlackRoad OS — Staging Plan
// What would deploy to staging (does not execute)

import { PRODUCTS } from '../products.js';

export function generateStagingPlan(release, gates) {
  const passedGates = gates.filter(g => g.status === 'pass');
  const failedGates = gates.filter(g => g.status === 'fail' || g.status === 'blocked');

  return {
    generatedAt: new Date().toISOString(),
    releaseId: release.releaseId,
    status: failedGates.length === 0 ? 'staging-ready' : 'blocked',
    products: PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      domain: p.domain,
      stagingDomain: `staging-${p.id}.blackroad.io`,
      ready: true // All products are always included in staging
    })),
    gatesPassed: passedGates.length,
    gatesFailed: failedGates.length,
    blockers: failedGates.map(g => g.label),
    note: 'Staging plan is informational only. Does not deploy.'
  };
}
