// BlackRoad OS — Approval Classifier
// Determines what's safe to auto-patch vs what needs human approval

// Safe to auto-patch locally — no production risk
const SAFE_AUTO_PATCH = [
  'generate-docs',          // generate missing docs from registry
  'generate-report-md',     // generate missing report markdown
  'create-health-json',     // placeholder health.json in local code
  'create-site-json',       // placeholder site.json in local code
  'add-tagline',            // add official tagline to local templates
  'add-base-css-import',    // add base CSS import to local templates
  'create-todo-entry',      // create TODO entries
  'create-roadtrip-card',   // create RoadTrip launch cards
  'create-roadbook-doc',    // create RoadBook draft docs
  'generate-llms-txt',      // generate llms.txt
  'generate-sitemap',       // generate sitemap.xml
  'generate-schema-json',   // generate schema.org JSON
  'generate-manifest',      // generate manifest.json
  'generate-robots-txt'     // generate robots.txt
];

// Requires human approval — production risk
const APPROVAL_REQUIRED = [
  'dns-change',             'ssl-cert-change',
  'cloudflare-change',      'deployment-change',
  'production-config',      'git-commit',
  'git-push',               'secret-rotation',
  'billing-change',         'roadnode-enablement',
  'destructive-file-op',    'api-mutation',
  'public-legal-copy',      'domain-change'
];

export function classify(actionType) {
  if (SAFE_AUTO_PATCH.includes(actionType)) {
    return { safe: true, requiresApproval: false, reason: 'Local-only operation, no production risk' };
  }
  if (APPROVAL_REQUIRED.includes(actionType)) {
    return { safe: false, requiresApproval: true, reason: `"${actionType}" modifies production or external systems` };
  }
  // Default: require approval for unknown actions
  return { safe: false, requiresApproval: true, reason: 'Unknown action type — defaulting to approval required' };
}

export function isSafe(actionType) { return SAFE_AUTO_PATCH.includes(actionType); }
export function needsApproval(actionType) { return !isSafe(actionType); }

export { SAFE_AUTO_PATCH, APPROVAL_REQUIRED };
