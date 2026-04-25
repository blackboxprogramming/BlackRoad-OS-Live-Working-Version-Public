#!/usr/bin/env node
// BlackRoad OS — Preview Checks
// Validates that the generated output is correct without needing a live server

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { PRODUCTS } from '../products.js';
import { UNIVERSAL_COPY } from '../productCopy.js';
import { renderFullPage } from '../ui/SiteShell.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');

const results = [];

function check(name, fn) {
  try {
    const ok = fn();
    results.push({ name, status: ok ? 'pass' : 'fail' });
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}`);
  } catch (e) {
    results.push({ name, status: 'fail', error: e.message });
    console.log(`  [FAIL] ${name} — ${e.message}`);
  }
}

console.log('');
console.log('PREVIEW CHECKS');
console.log('==============');

// Homepage renders
check('Homepage renders', () => {
  const html = renderFullPage({ domain: 'blackroad.io', path: '/', pageType: 'root', site: { title: 'BlackRoad' } });
  return html.includes('<!DOCTYPE html>') && html.includes('br-shell');
});

// RoadOS renders
check('RoadOS renders', () => {
  const html = renderFullPage({ domain: 'os.blackroad.io', path: '/', pageType: 'runtime', site: { title: 'RoadOS' } });
  return html.includes('br-shell');
});

// Product launcher
check('Product launcher renders', () => {
  const html = renderFullPage({ domain: 'blackroad.io', path: '/', pageType: 'root', site: { title: 'BlackRoad' } });
  return html.includes('Products & launchers') && html.includes('br-launcher');
});

// Command dock
check('Command dock renders', () => {
  const html = renderFullPage({ domain: 'blackroad.io', path: '/', pageType: 'root', site: { title: 'BlackRoad' } });
  return html.includes('br-dock') && html.includes('Search apps');
});

// SurfaceFrame
check('SurfaceFrame renders', () => {
  const { SurfaceFrame } = await import('../ui/SurfaceFrame.js');
  const html = SurfaceFrame({ title: 'Test', kind: 'app', route: '/' });
  return html.includes('br-surface');
});

// Base CSS exists
check('Base CSS exists', () => {
  return existsSync(resolve(ROOT, 'src/blackroad/styles/tokens.css')) &&
         existsSync(resolve(ROOT, 'src/blackroad/styles/shell.css'));
});

// Official tagline
check('Official tagline', () => {
  return UNIVERSAL_COPY.tagline === 'Remember the Road. Pave Tomorrow!';
});

// Tagline in rendered HTML
check('Tagline in HTML', () => {
  const html = renderFullPage({ domain: 'blackroad.io', path: '/', pageType: 'root', site: { title: 'BlackRoad' } });
  return html.includes('Pave Tomorrow!');
});

// Generated health files
check('Health files exist', () => {
  return PRODUCTS.every(p =>
    existsSync(resolve(ROOT, `src/blackroad/generated/health/${p.id}.json`))
  );
});

// Generated site files
check('Site files exist', () => {
  return PRODUCTS.every(p =>
    existsSync(resolve(ROOT, `src/blackroad/generated/sites/${p.id}.json`))
  );
});

// Product docs
check('Product docs exist', () => {
  return PRODUCTS.every(p =>
    existsSync(resolve(ROOT, `docs/products/${p.id}.md`))
  );
});

// No old tagline
check('No old tagline variant in copy', () => {
  return UNIVERSAL_COPY.tagline.endsWith('!');
});

// All products have domains
check('All products have domains', () => {
  return PRODUCTS.every(p => p.domain && p.domain.includes('.'));
});

console.log('');
const passed = results.filter(r => r.status === 'pass').length;
console.log(`Preview: ${passed}/${results.length} checks passed`);
console.log('');
console.log('Remember the Road. Pave Tomorrow!');

process.exit(results.some(r => r.status === 'fail') ? 1 : 0);
