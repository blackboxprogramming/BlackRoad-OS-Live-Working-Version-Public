/**
 * CECE API Gateway
 * Exposes CECE capabilities via REST API
 * Port 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const PORT = process.env.PORT || 3000;
const CECE_HOME = process.env.CECE_HOME || path.join(process.env.HOME, 'cece');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Read JSON file
const readJson = (filepath) => {
  try {
    const data = fs.readFileSync(filepath, 'utf8');
    return data.split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch (e) {
    return [];
  }
};

// Append to JSONL
const appendJsonl = (filepath, obj) => {
  fs.appendFileSync(filepath, JSON.stringify(obj) + '\n');
};

// Routes
const routes = {
  // GET /
  'GET /': async () => ({
    name: 'CECE API',
    version: '2.2.0',
    endpoints: [
      'GET /status',
      'GET /pulse',
      'GET /memories',
      'POST /memories',
      'GET /tasks',
      'POST /tasks',
      'GET /apps',
      'POST /think'
    ]
  }),

  // GET /status
  'GET /status': async () => {
    const { stdout: uptime } = await execAsync('uptime -p').catch(() => ({ stdout: 'unknown' }));
    const { stdout: memInfo } = await execAsync("free -h | grep Mem | awk '{print $3\"/\"$2}'").catch(() => ({ stdout: 'unknown' }));
    const { stdout: diskInfo } = await execAsync("df -h / | tail -1 | awk '{print $5}'").catch(() => ({ stdout: 'unknown' }));

    let temp = 0;
    try {
      temp = parseInt(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8')) / 1000;
    } catch (e) {}

    return {
      alive: true,
      uptime: uptime.trim(),
      memory: memInfo.trim(),
      disk: diskInfo.trim(),
      cpu_temp_c: temp,
      timestamp: new Date().toISOString()
    };
  },

  // GET /pulse
  'GET /pulse': async () => {
    const pulsePath = path.join(CECE_HOME, 'heart', 'pulse.json');
    try {
      return JSON.parse(fs.readFileSync(pulsePath, 'utf8'));
    } catch (e) {
      return { alive: false, error: 'No pulse file' };
    }
  },

  // GET /memories
  'GET /memories': async () => {
    const memories = readJson(path.join(CECE_HOME, 'memory', 'memories.jsonl'));
    return { count: memories.length, memories };
  },

  // POST /memories
  'POST /memories': async (body) => {
    const { text } = body;
    if (!text) return { error: 'Missing text field' };

    const memory = {
      id: Date.now().toString(36),
      time: new Date().toISOString(),
      memory: text
    };

    appendJsonl(path.join(CECE_HOME, 'memory', 'memories.jsonl'), memory);
    return { success: true, memory };
  },

  // GET /tasks
  'GET /tasks': async () => {
    const tasks = readJson(path.join(CECE_HOME, 'data', 'tasks.jsonl'));
    return { count: tasks.length, tasks };
  },

  // POST /tasks
  'POST /tasks': async (body) => {
    const { text } = body;
    if (!text) return { error: 'Missing text field' };

    const task = {
      id: Date.now().toString(36),
      time: new Date().toISOString(),
      text,
      status: 'pending'
    };

    const tasksPath = path.join(CECE_HOME, 'data', 'tasks.jsonl');
    fs.mkdirSync(path.dirname(tasksPath), { recursive: true });
    appendJsonl(tasksPath, task);
    return { success: true, task };
  },

  // GET /apps
  'GET /apps': async () => {
    const appsDir = path.join(CECE_HOME, 'apps');
    const apps = fs.readdirSync(appsDir)
      .filter(f => f.startsWith('cece-') && fs.statSync(path.join(appsDir, f)).isDirectory());
    return { count: apps.length, apps };
  },

  // POST /think
  'POST /think': async (body) => {
    const { prompt } = body;
    if (!prompt) return { error: 'Missing prompt field' };

    try {
      const { stdout } = await execAsync(`ollama run llama3.2 "${prompt.replace(/"/g, '\\"')}"`, { timeout: 30000 });
      return { success: true, response: stdout.trim() };
    } catch (e) {
      return { error: 'AI not available', message: e.message };
    }
  }
};

// Request handler
const handler = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  const routeKey = `${req.method} ${req.url.split('?')[0]}`;
  const route = routes[routeKey];

  if (!route) {
    res.writeHead(404, corsHeaders);
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  // Parse body for POST
  let body = {};
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    try {
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (e) {}
  }

  try {
    const result = await route(body);
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify(result, null, 2));
  } catch (e) {
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: e.message }));
  }
};

// Start server
const server = http.createServer(handler);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌌 CECE API running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
});
