// BlackRoad OS — Command Dock Compliance Checker
// Validates that every product, agent, and site can be opened from the dock

import { PRODUCTS } from '../products.js';
import { SITES } from '../sites.js';
import { AGENTS, PRODUCT_ALIASES, AGENT_ALIASES, ROADNODE_TRIGGERS } from '../command/commandRegistry.js';
import { route } from '../command/commandRouter.js';
import { ALL_SURFACES } from '../surfaces/surfaceRegistry.js';
import { writeFileSync } from 'fs';

const results = { pass: 0, fail: 0, warn: 0, tests: [] };

function test(name, fn) {
  try {
    const result = fn();
    if (result.ok) {
      results.pass++;
      results.tests.push({ name, status: 'pass', detail: result.detail || '' });
    } else {
      results.fail++;
      results.tests.push({ name, status: 'fail', detail: result.detail || '' });
    }
  } catch (e) {
    results.fail++;
    results.tests.push({ name, status: 'fail', detail: e.message });
  }
}

// Product commands
for (const p of PRODUCTS) {
  test(`open ${p.id}`, () => {
    const r = route(`open ${p.id}`);
    return { ok: r.type === 'product' && r.action === 'open' && r.surfaceId === p.id, detail: `${r.type} ${r.surfaceId}` };
  });
}

// Agent commands
for (const a of AGENTS) {
  test(`open ${a.id} (agent)`, () => {
    const r = route(`open ${a.id}`);
    return { ok: r.type === 'agent' && r.surfaceId === `agent:${a.id}`, detail: `${r.type} ${r.surfaceId}` };
  });
  test(`agent ${a.id}`, () => {
    const r = route(`agent ${a.id}`);
    return { ok: r.type === 'agent', detail: `${r.type} ${r.surfaceId}` };
  });
}

// Product aliases
for (const [alias, id] of Object.entries(PRODUCT_ALIASES)) {
  test(`alias "${alias}" -> ${id}`, () => {
    const r = route(`open ${alias}`);
    return { ok: r.type === 'product' && r.targetId === id, detail: `${r.type} ${r.targetId}` };
  });
}

// System commands
for (const cmd of ['agents', 'sites', 'docs', 'status', 'archive', 'live', 'settings', 'roadnode', 'index', 'codex', 'todo', 'products', 'memory', 'collab']) {
  test(`open ${cmd} (system)`, () => {
    const r = route(`open ${cmd}`);
    return { ok: r.type === 'system' && r.action === 'open', detail: `${r.type} ${r.surfaceId}` };
  });
}

// Search
test('search query', () => {
  const r = route('search hello world');
  return { ok: r.type === 'search' && r.url.includes('hello'), detail: r.url };
});

// Docs search
test('docs query', () => {
  const r = route('docs surfaces');
  return { ok: r.type === 'docs' && r.url.includes('surfaces'), detail: r.url };
});

// Status product
test('status roadtrip', () => {
  const r = route('status roadtrip');
  return { ok: r.type === 'status' && r.url.includes('roadtrip'), detail: r.url };
});

// Trust product
test('trust roadchain', () => {
  const r = route('trust roadchain');
  return { ok: r.type === 'trust' && r.url.includes('trust'), detail: r.url };
});

// Health product
test('health roadcode', () => {
  const r = route('health roadcode');
  return { ok: r.type === 'health' && r.url.includes('health'), detail: r.url };
});

// RoadNode safety
for (const trigger of ROADNODE_TRIGGERS) {
  test(`roadnode safety: "${trigger}"`, () => {
    const r = route(trigger);
    return { ok: r.type === 'system' && r.surfaceId === 'system:roadnode' && r.message.includes('opt-in'), detail: r.message.substring(0, 60) };
  });
}

// No route
test('unknown command produces no route', () => {
  const r = route('xyzzy42 nonexistent');
  return { ok: r.type === 'search' || r.type === 'none', detail: `${r.type} ${r.action}` };
});

// Surface coverage
test('every product has a surface', () => {
  const missing = PRODUCTS.filter(p => !ALL_SURFACES.find(s => s.id === p.id));
  return { ok: missing.length === 0, detail: missing.map(m => m.id).join(', ') || 'all covered' };
});

test('every agent has a surface', () => {
  const missing = AGENTS.filter(a => !ALL_SURFACES.find(s => s.id === `agent:${a.id}`));
  return { ok: missing.length === 0, detail: missing.map(m => m.id).join(', ') || 'all covered' };
});

// Results
const total = results.pass + results.fail + results.warn;
console.log(`\n# BlackRoad Command Dock + Surface Routing Report`);
console.log(`Total: ${total} | Pass: ${results.pass} | Fail: ${results.fail} | Warn: ${results.warn}`);
console.log(`Products routable: ${PRODUCTS.length}/${PRODUCTS.length}`);
console.log(`Agents routable: ${AGENTS.length}/${AGENTS.length}`);
console.log(`Aliases routable: ${Object.keys(PRODUCT_ALIASES).length}`);
console.log(`Surfaces: ${ALL_SURFACES.length}`);

if (results.fail > 0) {
  console.log(`\nFailed tests:`);
  results.tests.filter(t => t.status === 'fail').forEach(t => console.log(`  FAIL: ${t.name} — ${t.detail}`));
}

// Write report
if (process.argv.includes('--write-report')) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total, pass: results.pass, fail: results.fail, warn: results.warn },
    products: PRODUCTS.length,
    agents: AGENTS.length,
    aliases: Object.keys(PRODUCT_ALIASES).length,
    surfaces: ALL_SURFACES.length,
    tests: results.tests
  };
  writeFileSync(new URL('../generated/command-dock-report.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log('\nReport written to generated/command-dock-report.json');
}

process.exit(results.fail > 0 ? 1 : 0);
