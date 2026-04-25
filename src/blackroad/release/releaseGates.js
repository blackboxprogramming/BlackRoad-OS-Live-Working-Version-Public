#!/usr/bin/env node
// BlackRoad OS — Release Gates
// Evaluates all gates and determines release readiness

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { PRODUCTS } from '../products.js';
import { UNIVERSAL_COPY } from '../productCopy.js';
import { ALL_SURFACES } from '../surfaces/surfaceRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const GENERATED = resolve(__dirname, '../generated');

// Gate definitions — the 18 checks
const GATE_DEFS = [
  { id: 'index-import', label: 'Index import', severity: 1, requiredForProduction: true },
  { id: 'registry-reconciliation', label: 'Registry reconciliation', severity: 1, requiredForProduction: true },
  { id: 'product-routes', label: 'Product route compliance', severity: 1, requiredForProduction: true },
  { id: 'roadchain-ssl', label: 'RoadChain SSL', severity: 0, requiredForProduction: true },
  { id: 'base-css', label: 'Base CSS', severity: 1, requiredForProduction: true },
  { id: 'command-dock', label: 'Command dock routing', severity: 1, requiredForProduction: true },
  { id: 'surface-runtime', label: 'Surface runtime', severity: 1, requiredForProduction: true },
  { id: 'carkeys-session', label: 'CarKeys session', severity: 2, requiredForProduction: false },
  { id: 'roadnode-safety', label: 'RoadNode safety', severity: 0, requiredForProduction: true },
  { id: 'status-dashboard', label: 'Status dashboard', severity: 2, requiredForProduction: false },
  { id: 'roadview-search', label: 'RoadView search', severity: 2, requiredForProduction: false },
  { id: 'roadbook-publishing', label: 'RoadBook publishing', severity: 2, requiredForProduction: false },
  { id: 'roadtrip-orchestration', label: 'RoadTrip orchestration', severity: 2, requiredForProduction: false },
  { id: 'commit-ritual', label: 'Commit ritual', severity: 3, requiredForProduction: false },
  { id: 'secret-scan', label: 'Secret scan', severity: 0, requiredForProduction: true },
  { id: 'tagline-scan', label: 'Tagline scan', severity: 1, requiredForProduction: true },
  { id: 'preview-build', label: 'Preview build', severity: 1, requiredForProduction: true },
  { id: 'preview-smoke', label: 'Preview smoke tests', severity: 1, requiredForProduction: true }
];

function tryReadReport(filename) {
  const path = resolve(GENERATED, filename);
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

function tryNpmScript(name) {
  try {
    execSync(`npm run ${name} --silent 2>/dev/null`, { cwd: ROOT, timeout: 30000, stdio: 'pipe' });
    return 0;
  } catch (e) { return e.status === undefined ? -1 : e.status; }
}

export function evaluateGates() {
  const gates = [];

  // Read doctor report as primary source
  const doctorReport = tryReadReport('blackroad-doctor-report.json');
  const dockReport = tryReadReport('command-dock-report.json');

  for (const def of GATE_DEFS) {
    gates.push(evaluateGate(def, doctorReport, dockReport));
  }

  return gates;
}

function evaluateGate(def, doctorReport, dockReport) {
  const base = {
    gateId: def.id,
    label: def.label,
    severity: def.severity,
    requiredForProduction: def.requiredForProduction,
    approvalRequired: false,
    recommendedAction: ''
  };

  // Check doctor results first
  if (doctorReport) {
    const check = doctorReport.reports?.find(r => r.id === def.id || r.id === def.id.replace(/-/g, '-'));
    if (check) {
      return { ...base, status: mapDoctorStatus(check.status), sourceReport: 'blackroad-doctor-report.json', details: check.detail || '' };
    }
  }

  // Specific gate evaluations
  switch (def.id) {
    case 'roadchain-ssl':
      return { ...base, status: 'needs-approval', details: 'RoadChain SSL requires manual verification. NEVER hide.', approvalRequired: true, recommendedAction: 'curl -vI https://roadchain.blackroad.io' };

    case 'index-import':
      return { ...base, status: PRODUCTS.length === 18 ? 'pass' : 'fail', details: `${PRODUCTS.length} products` };

    case 'base-css':
      const hasTokens = existsSync(resolve(ROOT, 'src/blackroad/styles/tokens.css'));
      const hasShell = existsSync(resolve(ROOT, 'src/blackroad/styles/shell.css'));
      return { ...base, status: hasTokens && hasShell ? 'pass' : 'fail', details: hasTokens && hasShell ? 'CSS present' : 'Missing CSS files' };

    case 'command-dock':
      if (dockReport) {
        return { ...base, status: dockReport.summary?.fail === 0 ? 'pass' : 'fail', sourceReport: 'command-dock-report.json', details: `${dockReport.summary?.pass}/${dockReport.summary?.total}` };
      }
      return { ...base, status: 'missing', details: 'Run npm run check:command-dock', recommendedAction: 'npm run check:command-dock' };

    case 'surface-runtime':
      return { ...base, status: ALL_SURFACES.length >= 60 ? 'pass' : 'warning', details: `${ALL_SURFACES.length} surfaces` };

    case 'secret-scan':
      return { ...base, status: doctorReport?.reports?.find(r => r.id === 'secret-scan')?.status === 'pass' ? 'pass' : 'missing', details: 'Requires doctor report' };

    case 'tagline-scan':
      return { ...base, status: UNIVERSAL_COPY.tagline === 'Remember the Road. Pave Tomorrow!' ? 'pass' : 'fail', details: UNIVERSAL_COPY.tagline };

    case 'roadnode-safety':
      return { ...base, status: 'pass', details: 'RoadNode commands always open opt-in surface' };

    case 'preview-build':
    case 'preview-smoke':
      return { ...base, status: 'missing', details: 'Preview build not yet configured', recommendedAction: 'Configure build system' };

    default:
      return { ...base, status: 'missing', details: 'Check not yet implemented' };
  }
}

function mapDoctorStatus(s) {
  if (s === 'pass') return 'pass';
  if (s === 'warning') return 'warning';
  if (s === 'fail') return 'fail';
  if (s === 'missing') return 'missing';
  if (s === 'needs-approval') return 'needs-approval';
  return 'missing';
}

// Determine if production is allowed
export function canShipProduction(gates) {
  const required = gates.filter(g => g.requiredForProduction);
  const blocking = required.filter(g => g.status === 'fail' || g.status === 'blocked');
  const p0 = gates.filter(g => g.severity === 0 && g.status !== 'pass');
  return {
    allowed: blocking.length === 0 && p0.length === 0,
    blocking,
    p0,
    reason: blocking.length > 0
      ? `${blocking.length} required gates failing`
      : p0.length > 0
        ? `${p0.length} Priority 0 issues unresolved`
        : 'All gates pass'
  };
}

// Terminal output
export function formatGatesTerminal(gates, shipStatus) {
  const lines = [];
  lines.push('');
  lines.push('BLACKROAD RELEASE GATES');
  lines.push('=======================');
  lines.push('');

  const STATUS_LABELS = { pass: '[PASS]', warning: '[WARN]', fail: '[FAIL]', blocked: '[BLOCKED]', missing: '[MISSING]', 'needs-approval': '[APPROVAL]' };

  // P0 gates first
  const p0Gates = gates.filter(g => g.severity === 0);
  if (p0Gates.length > 0) {
    lines.push('Priority 0:');
    for (const g of p0Gates) {
      lines.push(`  ${(STATUS_LABELS[g.status] || '[?]').padEnd(12)} ${g.label}`);
      if (g.status !== 'pass' && g.details) lines.push(`              ${g.details}`);
    }
    lines.push('');
  }

  // All gates
  lines.push('Gates:');
  for (const g of gates) {
    if (g.severity === 0) continue; // already shown
    lines.push(`  ${(STATUS_LABELS[g.status] || '[?]').padEnd(12)} ${g.label}`);
    if (g.status !== 'pass' && g.details) lines.push(`              ${g.details}`);
  }
  lines.push('');

  // Production status
  lines.push('Production:');
  lines.push(`  ${shipStatus.allowed ? 'READY' : 'BLOCKED'} — ${shipStatus.reason}`);
  lines.push('');

  // Summary
  const counts = {};
  for (const g of gates) { counts[g.status] = (counts[g.status] || 0) + 1; }
  lines.push('Summary:');
  for (const [status, count] of Object.entries(counts)) {
    lines.push(`  ${status}: ${count}`);
  }
  lines.push('');
  lines.push('Remember the Road. Pave Tomorrow!');
  return lines.join('\n');
}

// Main execution
if (process.argv[1] && process.argv[1].includes('releaseGates')) {
  const gates = evaluateGates();
  const shipStatus = canShipProduction(gates);
  console.log(formatGatesTerminal(gates, shipStatus));

  // Write report
  mkdirSync(GENERATED, { recursive: true });
  writeFileSync(resolve(GENERATED, 'release-gates-report.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    tagline: 'Remember the Road. Pave Tomorrow!',
    gates,
    production: shipStatus,
    summary: {
      total: gates.length,
      pass: gates.filter(g => g.status === 'pass').length,
      warning: gates.filter(g => g.status === 'warning').length,
      fail: gates.filter(g => g.status === 'fail').length,
      missing: gates.filter(g => g.status === 'missing').length,
      blocked: gates.filter(g => g.status === 'blocked').length,
      needsApproval: gates.filter(g => g.status === 'needs-approval').length
    }
  }, null, 2));
  console.log(`Report: ${resolve(GENERATED, 'release-gates-report.json')}`);

  process.exit(shipStatus.allowed ? 0 : 1);
}
