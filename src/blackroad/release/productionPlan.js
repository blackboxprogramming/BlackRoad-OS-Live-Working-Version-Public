// BlackRoad OS — Production Plan
// What would deploy to production (never auto-executes)

import { PRODUCTS } from '../products.js';

export function generateProductionPlan(release, gates, shipStatus) {
  return {
    generatedAt: new Date().toISOString(),
    releaseId: release.releaseId,
    allowed: shipStatus.allowed,
    reason: shipStatus.reason,
    products: PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      domain: p.domain,
      ready: shipStatus.allowed
    })),
    requiredApprovals: [
      { action: 'production-deploy', status: 'pending', risk: 'high' },
      { action: 'dns-verification', status: 'pending', risk: 'medium' }
    ],
    rollbackAvailable: true,
    note: 'Production plan requires explicit human approval. Never auto-deploys.'
  };
}
