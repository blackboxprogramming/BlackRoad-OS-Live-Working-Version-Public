// BlackRoad OS — Launch Blockers
// Priority 0 rules that block launch

export const PRIORITY_ZERO_RULES = [
  {
    id: 'roadchain-ssl',
    label: 'roadchain.blackroad.io expired certificate',
    check: (results) => results.find(r => r.id === 'roadchain-ssl')?.status === 'fail',
    fix: 'Renew SSL certificate for roadchain.blackroad.io'
  },
  {
    id: 'missing-roados-route',
    label: 'Missing RoadOS route',
    check: (results) => {
      const r = results.find(r => r.id === 'product-routes');
      return r?.status === 'fail' && r?.detail?.includes('roados');
    },
    fix: 'Ensure os.blackroad.io is routable'
  },
  {
    id: 'broken-command-dock',
    label: 'Broken command dock',
    check: (results) => results.find(r => r.id === 'command-dock')?.status === 'fail',
    fix: 'Fix command dock routing — run npm run check:command-dock'
  },
  {
    id: 'missing-product-registry',
    label: 'Missing product registry',
    check: (results) => results.find(r => r.id === 'index-import')?.status === 'fail',
    fix: 'Restore src/blackroad/products.js'
  },
  {
    id: 'missing-base-css',
    label: 'Missing base CSS',
    check: (results) => results.find(r => r.id === 'base-css')?.status === 'fail',
    fix: 'Restore src/blackroad/styles/tokens.css and shell.css'
  },
  {
    id: 'suspected-secret',
    label: 'Suspected secret in repo',
    check: (results) => results.find(r => r.id === 'secret-scan')?.status === 'fail',
    fix: 'Remove exposed secrets and rotate credentials'
  },
  {
    id: 'old-tagline',
    label: 'Old public tagline variant (missing exclamation point)',
    check: (results) => results.find(r => r.id === 'tagline-scan')?.status === 'fail',
    fix: 'Replace all "Pave Tomorrow." with "Pave Tomorrow!"'
  },
  {
    id: 'roadnode-auto-enable',
    label: 'RoadNode auto-enable path detected',
    check: (results) => {
      const r = results.find(r => r.id === 'roadnode');
      // Only flag if the check ran and specifically found auto-enable, not if script is missing
      return r?.status === 'fail' && r?.detail?.includes('auto-enable');
    },
    fix: 'Ensure RoadNode is always opt-in with explicit consent'
  },
  {
    id: 'hidden-capture',
    label: 'Hidden capture/recording path detected',
    check: (results) => {
      const r = results.find(r => r.id === 'surfaces');
      return r?.detail?.includes('capture-auto');
    },
    fix: 'Ensure capture surfaces require explicit permission'
  },
  {
    id: 'roadcoin-investment-language',
    label: 'RoadCoin investment/security-style language',
    check: () => false, // manual check
    fix: 'Frame RoadCoin as utility credits only, never investment'
  }
];

// Evaluate all P0 blockers against check results
export function evaluateBlockers(checkResults) {
  return PRIORITY_ZERO_RULES
    .filter(rule => {
      try { return rule.check(checkResults); } catch { return false; }
    })
    .map(rule => ({
      id: rule.id,
      label: rule.label,
      fix: rule.fix,
      severity: 'p0'
    }));
}
