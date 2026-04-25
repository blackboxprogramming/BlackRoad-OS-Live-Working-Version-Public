// BlackRoad OS — Rollback Plan
// Documents how to roll back a release (never auto-executes)

import { PRODUCTS } from '../products.js';

export function generateRollbackPlan(release) {
  return {
    generatedAt: new Date().toISOString(),
    releaseId: release.releaseId,
    version: release.version,
    title: `Rollback plan for ${release.title}`,
    steps: [
      { order: 1, action: 'Identify affected products and domains', products: PRODUCTS.map(p => p.domain) },
      { order: 2, action: 'Revert to previous deploy (requires approval)', approval: 'production-deploy' },
      { order: 3, action: 'Verify previous version is serving', command: 'npm run doctor -- --write-report' },
      { order: 4, action: 'Run release gates on reverted state', command: 'npm run release:gates' },
      { order: 5, action: 'Notify via RoadTrip commit room', approval: 'none' },
      { order: 6, action: 'Update BRTODO with rollback incident', approval: 'none' },
      { order: 7, action: 'Post-mortem: what failed and why', approval: 'none' }
    ],
    localRollback: {
      command: 'npm run patch:rollback',
      description: 'Restores local files from .blackroad-backups/'
    },
    contacts: {
      owner: 'Alexa (founder)',
      note: 'All rollbacks require human decision'
    },
    note: 'This plan is informational. Rollback never executes automatically.'
  };
}
