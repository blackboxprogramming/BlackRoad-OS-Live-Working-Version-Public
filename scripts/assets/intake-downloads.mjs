#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    downloads: path.join(process.env.HOME || '', 'Downloads'),
    importTarget: null,
    doImport: false,
    maxDepth: 8,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--downloads') args.downloads = argv[++i];
    else if (a === '--import') args.doImport = true;
    else if (a === '--target') args.importTarget = argv[++i];
    else if (a === '--max-depth') args.maxDepth = Number.parseInt(argv[++i], 10);
  }
  return args;
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function findFilesRecursive(root, predicate, maxDepth) {
  const out = [];
  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p, depth + 1);
      else if (ent.isFile() && predicate(ent.name, p)) out.push(p);
    }
  }
  walk(root, 0);
  return out;
}

function classifyLicense(text) {
  if (!text) return { kind: 'unknown', reason: 'no_license_text' };
  const t = text.toLowerCase();

  if (t.includes('non commercial') || t.includes('non-commercial')) {
    return { kind: 'deny_noncommercial', reason: 'noncommercial_restriction' };
  }

  if (t.includes('creativecommons.org/licenses/by/4.0') || t.includes('cc by 4.0') || t.includes('attribution 4.0 international')) {
    return { kind: 'allow_public_with_attribution', reason: 'cc_by_4' };
  }

  if (t.includes('creativecommons.org/publicdomain/zero') || t.includes('cc0') || t.includes('creative commons zero')) {
    return { kind: 'allow_public', reason: 'cc0' };
  }

  if (t.includes('mit license')) {
    return { kind: 'allow_public', reason: 'mit' };
  }

  if (t.includes('apache license')) {
    return { kind: 'allow_public', reason: 'apache' };
  }

  if (t.includes('you are free to') && t.includes('commercial projects') && t.includes('give appropriate credit')) {
    return { kind: 'needs_review', reason: 'custom_license_attribution' };
  }

  return { kind: 'needs_review', reason: 'unrecognized_license' };
}

function sanitizeFolderName(name) {
  return name
    .trim()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase()
    .slice(0, 80) || 'pack';
}

function tryReadArchiveLicense(archivePath) {
  const list = spawnSync('7z', ['l', '-ba', archivePath], { encoding: 'utf8' });
  if (list.status !== 0) return null;
  const lines = String(list.stdout || '').split('\n');
  const candidates = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    // `7z l -ba` typically prints: DATE TIME ATTR SIZE PATH...
    // PATH may contain spaces, so we join the remainder.
    const maybePath = parts.slice(4).join(' ');
    if (!maybePath) continue;
    const lower = maybePath.toLowerCase();
    if (lower.endsWith('license.txt') || lower.endsWith('license') || lower.includes('license') || lower.includes('terms') || lower.includes('readme')) {
      candidates.push(maybePath);
    }
  }
  const best = candidates.find((p) => p.toLowerCase().endsWith('license.txt'))
    ?? candidates.find((p) => p.toLowerCase().includes('license'))
    ?? candidates[0];
  if (!best) return null;
  const out = spawnSync('7z', ['e', '-so', archivePath, best], { encoding: 'utf8' });
  if (out.status !== 0) return null;
  const text = String(out.stdout || '').trim();
  return text.length ? text : null;
}

function detectPack(downloadsDir, name, fullPath, maxDepth) {
  const stat = fs.statSync(fullPath);
  const ext = path.extname(name).toLowerCase();

  if (stat.isFile() && (ext === '.7z' || ext === '.zip')) {
    const licenseText = tryReadArchiveLicense(fullPath);
    const license = classifyLicense(licenseText);
    return {
      name,
      path: fullPath,
      kind: 'archive',
      license,
      licenseFound: Boolean(licenseText),
    };
  }

  if (stat.isDirectory()) {
    const licenseFiles = findFilesRecursive(
      fullPath,
      (fname) => {
        const lower = fname.toLowerCase();
        return lower === 'license' || lower === 'license.txt' || lower.startsWith('license.')
          || lower.startsWith('readme')
          || lower.includes('terms')
          || lower.includes('attribution')
          || lower.includes('credits');
      },
      maxDepth
    );
    const licenseText = licenseFiles.map(readFileSafe).find(Boolean) ?? null;
    const license = classifyLicense(licenseText);
    return {
      name,
      path: fullPath,
      kind: 'folder',
      license,
      licenseFound: licenseFiles.length > 0 && Boolean(licenseText),
      licenseFiles,
    };
  }

  return null;
}

function shouldImport(licenseKind) {
  return licenseKind === 'allow_public' || licenseKind === 'allow_public_with_attribution';
}

function runImport(pack, targetDir) {
  const dest = path.join(targetDir, sanitizeFolderName(pack.name));
  fs.mkdirSync(dest, { recursive: true });

  if (pack.kind === 'folder') {
    // Copy entire folder (conservative: only for licenses we consider public-safe).
    spawnSync('rsync', ['-a', '--delete', `${pack.path}/`, `${dest}/`], { stdio: 'inherit' });
    return dest;
  }

  if (pack.kind === 'archive') {
    const tempOut = path.join('/tmp', `br-assets-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    fs.mkdirSync(tempOut, { recursive: true });
    const x = spawnSync('7z', ['x', '-y', `-o${tempOut}`, pack.path], { stdio: 'inherit' });
    if (x.status !== 0) throw new Error(`7z extract failed: ${pack.name}`);
    spawnSync('rsync', ['-a', '--delete', `${tempOut}/`, `${dest}/`], { stdio: 'inherit' });
    return dest;
  }

  return null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const downloadsDir = path.resolve(args.downloads);
  const entries = fs.readdirSync(downloadsDir);

  const packs = [];
  for (const name of entries) {
    if (name.startsWith('.')) continue;
    const fullPath = path.join(downloadsDir, name);
    let stat = null;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }
    const ext = path.extname(name).toLowerCase();
    const looksLikePack = stat.isDirectory() || ext === '.7z' || ext === '.zip';
    if (!looksLikePack) continue;

    const pack = detectPack(downloadsDir, name, fullPath, args.maxDepth);
    if (pack) packs.push(pack);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    downloadsDir,
    counts: packs.reduce((acc, p) => {
      const k = p.license.kind;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
    packs: packs
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({
        name: p.name,
        kind: p.kind,
        path: p.path,
        licenseKind: p.license.kind,
        licenseReason: p.license.reason,
        licenseFound: p.licenseFound,
      })),
  };

  process.stdout.write(JSON.stringify(report, null, 2) + '\n');

  if (args.doImport) {
    if (!args.importTarget) {
      process.stderr.write('Missing --target for --import\n');
      process.exit(2);
    }
    const targetDir = path.resolve(args.importTarget);
    fs.mkdirSync(targetDir, { recursive: true });
    for (const p of packs) {
      if (!shouldImport(p.license.kind)) continue;
      try {
        const dest = runImport(p, targetDir);
        if (dest) process.stderr.write(`Imported ${p.name} -> ${dest}\n`);
      } catch (err) {
        process.stderr.write(`Failed import ${p.name}: ${err?.message || String(err)}\n`);
      }
    }
  }
}

main();
