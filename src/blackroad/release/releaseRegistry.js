// BlackRoad OS — Release Registry
// Tracks releases, their statuses, and what's included

import { PRODUCTS } from '../products.js';
import { SITES } from '../sites.js';
import { ALL_SURFACES } from '../surfaces/surfaceRegistry.js';

export const RELEASE_STATUSES = [
  'draft', 'building', 'preview-ready', 'blocked',
  'needs-approval', 'staging-ready', 'production-ready',
  'released', 'rolled-back'
];

let releaseCounter = 0;

export function createRelease(title = 'BlackRoad Release') {
  releaseCounter++;
  return {
    releaseId: `release-${Date.now()}-${releaseCounter}`,
    title,
    version: `0.1.${releaseCounter}`,
    tagline: 'Remember the Road. Pave Tomorrow!',
    createdAt: new Date().toISOString(),
    workingRoot: '/Applications/BlackRoadOS',
    workspace: '/Applications/BlackRoadOS/workspace',
    status: 'draft',
    productsIncluded: PRODUCTS.map(p => ({ id: p.id, name: p.name, domain: p.domain })),
    domainsIncluded: PRODUCTS.map(p => p.domain),
    surfacesIncluded: ALL_SURFACES.map(s => s.id),
    reportsRequired: [
      'blackroad-doctor-report.json', 'command-dock-report.json',
      'launch-queue.json', 'safe-patch-report.json', 'release-gates-report.json'
    ],
    gates: [],
    priorityZero: [],
    approvalsRequired: [],
    previewUrl: 'http://localhost:4173',
    stagingTargets: [],
    productionTargets: PRODUCTS.map(p => p.domain),
    rollbackPlan: '',
    commitRitual: {
      memory: 'reviewed', codex: 'updated', products: 'reviewed',
      brtodo: 'updated', collab: 'updated', roadtrip: 'updated'
    }
  };
}

export function updateReleaseStatus(release, newStatus) {
  return { ...release, status: newStatus, updatedAt: new Date().toISOString() };
}
