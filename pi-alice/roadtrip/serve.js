#!/usr/bin/env node
// RoundTrip self-hosted adapter — wraps the CF Worker for standalone Node.js
const http = require('http')
const os = require('os')
const path = require('path')
const fs = require('fs')

// Minimal D1-compatible SQLite adapter
let Database
try {
  Database = require('better-sqlite3')
} catch {
  // Fallback: use node built-in sqlite if available (node 22+)
  try {
    Database = require('node:sqlite').DatabaseSync
  } catch {
    try {
      console.log('Installing better-sqlite3...')
      require('child_process').execSync('npm install better-sqlite3', { cwd: __dirname, stdio: 'inherit' })
      Database = require('better-sqlite3')
    } catch {
      Database = null
    }
  }
}

let db = null
if (Database) {
  try {
    db = new Database(path.join(__dirname, 'roundtrip.db'))
    if (db?.pragma) db.pragma('journal_mode = WAL')
  } catch {
    db = null
  }
}

// D1-compatible wrapper
const D1 = {
  prepare(sql) {
    if (!db) {
      return {
        bind() {
          return {
            async run() {
              return { error: 'sqlite unavailable' }
            },
            async all() {
              return { results: [] }
            },
            async first() {
              return null
            },
          }
        },
        async run() {
          return { error: 'sqlite unavailable' }
        },
        async all() {
          return { results: [] }
        },
      }
    }

    return {
      bind(...args) {
        return {
          async run() {
            try {
              return db.prepare(sql).run(...args)
            } catch (e) {
              return { error: e.message }
            }
          },
          async all() {
            try {
              return { results: db.prepare(sql).all(...args) }
            } catch (e) {
              return { results: [] }
            }
          },
          async first() {
            try {
              return db.prepare(sql).get(...args)
            } catch {
              return null
            }
          },
        }
      },
      async run() {
        try {
          return db.prepare(sql).run()
        } catch (e) {
          return { error: e.message }
        }
      },
      async all() {
        try {
          return { results: db.prepare(sql).all() }
        } catch {
          return { results: [] }
        }
      },
    }
  },
}

// KV-compatible wrapper (in-memory)
const kvStore = new Map()
const KV = {
  async get(key) {
    return kvStore.get(key) || null
  },
  async put(key, value) {
    kvStore.set(key, value)
  },
  async delete(key) {
    kvStore.delete(key)
  },
}

// Mock env
const env = {
  DB: D1,
  ROUNDTRIP_KV: KV,
  MESH_SECRET: process.env.MESH_SECRET || 'blackroad-mesh-2026',
  SLACK_HUB_URL: process.env.SLACK_HUB_URL || '',
  GITEA_TOKEN: process.env.GITEA_TOKEN || '',
}

// Load the worker module
// We need to patch it slightly for Node compatibility
let workerSource = fs.readFileSync(path.join(__dirname, 'src/worker.js'), 'utf-8')

// Remove any ESM import lines
workerSource = workerSource.replace(/^import .* from .*$/gm, '// [removed import for self-hosted]')

// Replace export default with CommonJS export
workerSource = workerSource.replace('export default {', 'module.exports = {')

// SOVEREIGN: Point to local Ollama
const ROADIES_URL = process.env.ROADIES_URL || 'http://127.0.0.1:11434'
workerSource = workerSource.replace(/https:\/\/ollama-internal\.blackroad\.io/g, ROADIES_URL)
// Also replace any legacy localhost:11434 references in OLLAMA_NODES
workerSource = workerSource.replace(/http:\/\/localhost:11434/g, ROADIES_URL)

// Write patched version
const patchedPath = path.join(__dirname, 'src/_worker_patched.js')
fs.writeFileSync(patchedPath, workerSource)

// Provide crypto.randomUUID if not available
if (!globalThis.crypto?.randomUUID) {
  const { randomUUID } = require('crypto')
  globalThis.crypto = { randomUUID }
}

const worker = require(patchedPath)

const PORT = process.env.PORT || 8094
const CLOUD_URL = (process.env.ROUNDTRIP_CLOUD_URL || 'https://roundtrip.blackroad.io').replace(/\/$/, '')
const NODE_NAME = process.env.ROUNDTRIP_NODE_NAME || os.hostname().split('.')[0]
const NODE_ROLE = process.env.ROUNDTRIP_NODE_ROLE || 'pi'
const VERSION = process.env.ROUNDTRIP_VERSION || '4.1.0-selfhosted'
const LOCAL_URL = process.env.ROUNDTRIP_LOCAL_URL || `http://${NODE_NAME}.local:${PORT}`
const AUTONOMY_DISABLED = process.env.ROUNDTRIP_DISABLE_AUTONOMY === '1'

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response
}

async function registerNode() {
  return postJson(CLOUD_URL + '/api/autonomy/register', {
    node_name: NODE_NAME,
    host: os.hostname(),
    role: NODE_ROLE,
    local_url: LOCAL_URL,
    status: 'online',
    version: VERSION,
    capabilities: ['memory', 'chat', 'collab', 'background-tasks', 'roadcode', 'roadies'],
    services: [{ name: 'roundtrip', port: PORT, health: '/api/health' }],
    metadata: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus()?.length || 0,
      hostname: os.hostname(),
    },
  })
}

async function heartbeatNode() {
  return postJson(CLOUD_URL + '/api/autonomy/heartbeat', {
    node_name: NODE_NAME,
    host: os.hostname(),
    role: NODE_ROLE,
    local_url: LOCAL_URL,
    status: 'online',
    version: VERSION,
    capabilities: ['memory', 'chat', 'collab', 'background-tasks', 'roadcode', 'roadies'],
    services: [{ name: 'roundtrip', port: PORT, health: '/api/health' }],
    metadata: {
      uptime: Math.round(os.uptime()),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
    },
  })
}

async function callLocalWorker(pathname, body) {
  const request = new Request(`http://127.0.0.1:${PORT}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const response = await worker.fetch(request, env)
  const text = await response.text()
  let data = null
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }
  if (!response.ok) {
    throw new Error(data?.error || `local ${pathname} failed`)
  }
  return data
}

async function runBackgroundTask(task) {
  const payload = task.payload || {}
  if (task.task_type === 'chat') {
    return callLocalWorker('/api/chat', {
      agent: task.assigned_agent || payload.agent || 'road',
      message: payload.message || payload.prompt || task.title,
      channel: payload.channel || 'ops',
      notify_slack: payload.notify_slack || '',
    })
  }
  if (task.task_type === 'action') {
    return callLocalWorker('/api/action', {
      action: payload.action || 'fleet-health',
      params: payload.params || {},
      agent: task.assigned_agent || payload.agent || 'road',
    })
  }
  if (task.task_type === 'group-chat') {
    return callLocalWorker('/api/group-chat', {
      topic: payload.topic || task.title,
      agents: payload.agents || ['alice', 'octavia', 'road'],
      channel: payload.channel || 'ops',
    })
  }
  throw new Error(`unsupported task_type: ${task.task_type}`)
}

let taskPollInFlight = false
async function pollBackgroundTasks() {
  if (taskPollInFlight) return
  taskPollInFlight = true
  try {
    const response = await fetch(`${CLOUD_URL}/api/background/tasks?status=queued&node=${encodeURIComponent(NODE_NAME)}&limit=3`)
    const data = await response.json()
    const tasks = data.tasks || []
    for (const task of tasks) {
      const claim = await postJson(CLOUD_URL + '/api/background/tasks/claim', {
        id: task.id,
        node_name: NODE_NAME,
      })
      if (!claim.ok) continue
      try {
        const result = await runBackgroundTask(task)
        await postJson(CLOUD_URL + '/api/background/tasks/complete', {
          id: task.id,
          node_name: NODE_NAME,
          status: 'done',
          result,
        })
      } catch (error) {
        await postJson(CLOUD_URL + '/api/background/tasks/complete', {
          id: task.id,
          node_name: NODE_NAME,
          status: 'failed',
          result: { error: error.message },
        })
      }
    }
  } catch {}
  taskPollInFlight = false
}

// Voice-first HTML (served from public/index.html)
let VOICE_HTML = ''
try { VOICE_HTML = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf-8') } catch { VOICE_HTML = '<h1>RoundTrip</h1>' }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost:' + PORT)

    // Serve voice-first HTML for browser requests to /
    if (url.pathname === '/' && req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
      res.end(VOICE_HTML)
      return
    }

    const headers = new Headers(req.headers)

    let body = null
    if (req.method === 'POST' || req.method === 'PUT') {
      body = await new Promise((resolve) => {
        const chunks = []
        req.on('data', c => chunks.push(c))
        req.on('end', () => resolve(Buffer.concat(chunks).toString()))
      })
    }

    // Roadies proxy — CF Worker calls this to reach local Roadies (Ollama fork on 11436)
    if (url.pathname.startsWith('/ollama/')) {
      const ollamaPath = url.pathname.replace('/ollama', '')
      const ollamaRes = await fetch(ROADIES_URL + ollamaPath, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(25000),
      })
      res.writeHead(ollamaRes.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(await ollamaRes.text())
      return
    }

    const fetchReq = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    })

    const response = await worker.fetch(fetchReq, env)

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()))
    const responseBody = await response.text()
    res.end(responseBody)
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message, stack: e.stack?.split('\n').slice(0, 3) }))
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log('RoundTrip v4 self-hosted on :' + PORT)
  if (!AUTONOMY_DISABLED) {
    registerNode().catch(() => {})
    heartbeatNode().catch(() => {})
    pollBackgroundTasks().catch(() => {})
    setInterval(() => { heartbeatNode().catch(() => {}) }, 60 * 1000)
    setInterval(() => { pollBackgroundTasks().catch(() => {}) }, 90 * 1000)
  }
})
