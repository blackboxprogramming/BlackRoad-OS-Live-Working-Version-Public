#!/usr/bin/env node
// RoundTrip self-hosted adapter — wraps the CF Worker for standalone Node.js
const http = require('http');
const path = require('path');
const fs = require('fs');

let Database;
try { Database = require('better-sqlite3'); } catch {
  console.log('Installing better-sqlite3...');
  require('child_process').execSync('npm install better-sqlite3', { cwd: __dirname, stdio: 'inherit' });
  Database = require('better-sqlite3');
}

const db = new Database(path.join(__dirname, 'roundtrip.db'));
db.pragma('journal_mode = WAL');

const D1 = {
  prepare(sql) {
    return {
      bind(...args) {
        return {
          async run() { try { return db.prepare(sql).run(...args); } catch(e) { return { error: e.message }; } },
          async all() { try { return { results: db.prepare(sql).all(...args) }; } catch(e) { return { results: [] }; } },
          async first() { try { return db.prepare(sql).get(...args) || null; } catch(e) { return null; } },
        };
      },
      async run() { try { return db.prepare(sql).run(); } catch(e) { return { error: e.message }; } },
      async all() { try { return { results: db.prepare(sql).all() }; } catch(e) { return { results: [] }; } },
    };
  }
};

const kvStore = new Map();
const KV = {
  async get(key) { return kvStore.get(key) || null; },
  async put(key, value) { kvStore.set(key, value); },
  async delete(key) { kvStore.delete(key); },
};

const env = { DB: D1, ROUNDTRIP_KV: KV, MESH_SECRET: 'blackroad-mesh-2026' };

let workerSource = fs.readFileSync(path.join(__dirname, 'src/worker.js'), 'utf-8');
workerSource = workerSource.replace(/^import .* from .*$/gm, '// [removed import]');
workerSource = workerSource.replace('export default {', 'module.exports = {');
const patchedPath = path.join(__dirname, 'src/_worker_patched.js');
fs.writeFileSync(patchedPath, workerSource);

if (!globalThis.crypto?.randomUUID) {
  const { randomUUID } = require('crypto');
  globalThis.crypto = { randomUUID };
}

const worker = require(patchedPath);
const PORT = process.env.PORT || 8094;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost:' + PORT);
    const headers = new Headers(req.headers);
    let body = null;
    if (req.method === 'POST' || req.method === 'PUT') {
      body = await new Promise((resolve) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks).toString()));
      });
    }
    const fetchReq = new Request(url.toString(), { method: req.method, headers, body });
    const response = await worker.fetch(fetchReq, env);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => console.log('RoundTrip v4 self-hosted on :' + PORT));
