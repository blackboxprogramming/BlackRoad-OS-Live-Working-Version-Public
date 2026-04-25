// BlackRoad OS — Doctor Check Order
// The 17 checks that run in sequence

export const CHECK_ORDER = [
  {
    id: 'index-import',
    name: 'Index import',
    npmScript: 'index:import',
    reportFile: null,
    priority: 'high',
    description: 'Import and validate canonical index'
  },
  {
    id: 'registry-reconciliation',
    name: 'Registry reconciliation',
    npmScript: 'reconcile',
    reportFile: 'reconciliation-report.json',
    priority: 'high',
    description: 'Reconcile products, sites, agents, domains, routes against registries'
  },
  {
    id: 'product-routes',
    name: 'Product route compliance',
    npmScript: 'check:product-routes',
    reportFile: 'product-route-report.json',
    priority: 'high',
    description: 'Verify all 18 products have 10 standard routes'
  },
  {
    id: 'roadchain-ssl',
    name: 'RoadChain SSL Priority 0',
    npmScript: 'ssl:roadchain',
    reportFile: 'ssl-report.json',
    priority: 'p0',
    description: 'Check roadchain.blackroad.io certificate status'
  },
  {
    id: 'base-css',
    name: 'Base CSS rollout',
    npmScript: 'check:base-css',
    reportFile: 'base-css-report.json',
    priority: 'high',
    description: 'Verify tokens.css and shell.css exist and are valid'
  },
  {
    id: 'command-dock',
    name: 'Command dock routing',
    npmScript: 'check:command-dock',
    reportFile: 'command-dock-report.json',
    priority: 'high',
    description: 'Verify all products/agents/sites routable from dock'
  },
  {
    id: 'surfaces',
    name: 'Surface runtime',
    npmScript: 'check:surfaces',
    reportFile: 'surface-runtime-report.json',
    priority: 'high',
    description: 'Verify all surfaces registered and openable'
  },
  {
    id: 'carkeys',
    name: 'CarKeys portable session',
    npmScript: 'check:carkeys',
    reportFile: 'carkeys-session-report.json',
    priority: 'medium',
    description: 'Verify CarKeys session model exists'
  },
  {
    id: 'roadnode',
    name: 'RoadNode opt-in runtime',
    npmScript: 'check:roadnode',
    reportFile: 'roadnode-runtime-report.json',
    priority: 'p0',
    description: 'Verify RoadNode is opt-in only, never auto-enables'
  },
  {
    id: 'status-runtime',
    name: 'Status + health dashboard',
    npmScript: 'check:status-runtime',
    reportFile: 'status-runtime-report.json',
    priority: 'medium',
    description: 'Verify status pages and health endpoints'
  },
  {
    id: 'roadview',
    name: 'RoadView search runtime',
    npmScript: 'check:roadview',
    reportFile: 'roadview-search-report.json',
    priority: 'medium',
    description: 'Verify search indexing and query routing'
  },
  {
    id: 'roadbook',
    name: 'RoadBook publishing runtime',
    npmScript: 'check:roadbook',
    reportFile: 'roadbook-runtime-report.json',
    priority: 'medium',
    description: 'Verify publishing pipeline and document rendering'
  },
  {
    id: 'roadtrip',
    name: 'RoadTrip orchestration runtime',
    npmScript: 'check:roadtrip',
    reportFile: 'roadtrip-report.json',
    priority: 'medium',
    description: 'Verify 27-agent orchestration and chat routing'
  },
  {
    id: 'commit-ritual',
    name: 'Commit ritual automation',
    npmScript: 'ritual:check',
    reportFile: 'commit-ritual-compliance-report.json',
    priority: 'low',
    description: 'Verify MEMORY/CODEX/PRODUCTS/BRTODO/COLLAB/ROADTRIP ritual'
  },
  {
    id: 'secret-scan',
    name: 'Secret scan',
    npmScript: null,
    reportFile: null,
    priority: 'p0',
    description: 'Scan for exposed secrets, tokens, API keys in source'
  },
  {
    id: 'tagline-scan',
    name: 'Tagline scan',
    npmScript: null,
    reportFile: null,
    priority: 'high',
    description: 'Verify canonical tagline: Remember the Road. Pave Tomorrow!'
  },
  {
    id: 'launch-score',
    name: 'Final launch score',
    npmScript: null,
    reportFile: null,
    priority: 'high',
    description: 'Calculate overall launch readiness score'
  }
];

export const TOTAL_CHECKS = CHECK_ORDER.length;
