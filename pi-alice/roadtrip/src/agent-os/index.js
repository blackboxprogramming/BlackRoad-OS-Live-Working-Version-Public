// BlackRoad Agent OS — Browser-Native Operating System for AI Agents
// Architecture: workerd isolates + Lunatic supervision + Solace event mesh + seL4 capabilities
//
// This is the unified entry point that integrates the Agent OS kernel with
// the existing RoundTrip worker. Import this module and call boot() to
// initialize the OS layer on top of the existing chat infrastructure.
//
// Usage (in worker.js or serve.js):
//   const { BlackRoadOS } = require('./agent-os');
//   const os = new BlackRoadOS(env.DB, env.ROUNDTRIP_KV);
//   await os.boot();
//   const agent = await os.spawn({ name: 'road', capabilities: ['chat', 'admin'] });

'use strict';

const { AgentKernel, AgentProcess, PriorityMailbox, SupervisionTree, Scheduler } = require('./kernel');
const { AgentMemory, SharedKnowledge, MemoryScorer } = require('./memory');
const { EventMesh, A2AProtocol } = require('./events');
const { CapabilityRegistry, BUILTIN_CAPABILITIES } = require('./capabilities');

const VERSION = '0.1.0';

class BlackRoadOS {
  /**
   * @param {Object} [db] - D1/SQLite-compatible database
   * @param {Object} [kv] - KV namespace (optional, for caching)
   */
  constructor(db, kv) {
    this.kernel = new AgentKernel();
    this.sharedMemory = new SharedKnowledge(db);
    this.events = new EventMesh();
    this.capabilities = new CapabilityRegistry();
    this.db = db || null;
    this.kv = kv || null;
    this.version = VERSION;
    this.bootTime = null;
    this._booted = false;
  }

  /**
   * Boot the Agent OS — initialize DB tables, start the scheduler.
   */
  async boot() {
    if (this._booted) return;

    // Initialize shared knowledge tables
    await this.sharedMemory.init();

    // Initialize agent_memory table (shared init)
    if (this.db) {
      try {
        await this.db.prepare(`CREATE TABLE IF NOT EXISTS agent_memory (
          id TEXT PRIMARY KEY,
          agent_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT,
          scope TEXT DEFAULT 'private',
          importance REAL DEFAULT 0.5,
          created_at TEXT DEFAULT (datetime('now')),
          accessed_at TEXT DEFAULT (datetime('now')),
          access_count INTEGER DEFAULT 0,
          metadata TEXT DEFAULT '{}'
        )`).run();
      } catch { /* table may already exist */ }
    }

    // Start the kernel scheduler
    this.kernel.start(50);

    // Wire kernel events to the event mesh
    this.kernel.on('spawn', (data) => {
      this.events.publish('os.agent.spawn', { from: 'kernel', data });
    });
    this.kernel.on('kill', (data) => {
      this.events.publish('os.agent.kill', { from: 'kernel', data });
    });
    this.kernel.on('crash', (data) => {
      this.events.publish('os.agent.crash', { from: 'kernel', data });
    });
    this.kernel.on('restart', (data) => {
      this.events.publish('os.agent.restart', { from: 'kernel', data });
    });

    this.bootTime = Date.now();
    this._booted = true;
  }

  /**
   * Spawn a new agent with capabilities and memory.
   * @param {Object} config - { name, capabilities?, supervisor?, handler?, metadata? }
   * @returns {Promise<AgentProcess>}
   */
  async spawn(config) {
    if (!this._booted) await this.boot();

    // Spawn the kernel process
    const agent = this.kernel.spawn(config);

    // Grant capabilities
    const caps = config.capabilities || ['chat', 'memory.read', 'memory.write'];
    for (const cap of caps) {
      try {
        this.capabilities.grant(agent.id, cap);
      } catch {
        // Unknown capability — skip rather than crash spawn
      }
    }

    // Attach per-agent memory with shared knowledge reference
    agent.memory = new AgentMemory(agent.id, this.db);
    agent.memory.shared = this.sharedMemory;
    await agent.memory.init();

    return agent;
  }

  /**
   * Graceful shutdown — suspend all agents, flush memory, stop scheduler.
   */
  async shutdown() {
    // Broadcast shutdown signal
    this.kernel.broadcast(
      { type: 'shutdown', from: 'kernel', payload: { reason: 'os_shutdown' } },
      'signal'
    );

    // Stop the scheduler
    this.kernel.stop();

    this._booted = false;
  }

  /**
   * Get OS statistics.
   * @returns {Object}
   */
  stats() {
    return {
      version: this.version,
      booted: this._booted,
      bootTime: this.bootTime,
      uptime: this.bootTime ? Date.now() - this.bootTime : 0,
      kernel: this.kernel.stats(),
      events: this.events.stats(),
      capabilities: this.capabilities.stats(),
      sharedMemory: this.sharedMemory.stats(),
    };
  }

  /**
   * Handle HTTP requests for /api/os/* routes.
   * Integrates with the existing RoundTrip worker router.
   * @param {Request} request
   * @returns {Response|null} Response if handled, null if not an OS route
   */
  async handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (!path.startsWith('/api/os')) return null;

    const route = path.replace('/api/os', '') || '/';
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

    try {
      // GET /api/os/stats — OS statistics
      if (route === '/stats' && request.method === 'GET') {
        return json(this.stats());
      }

      // GET /api/os/agents — list all agents
      if (route === '/agents' && request.method === 'GET') {
        const agents = [];
        for (const [, agent] of this.kernel.processes) {
          agents.push(agent.toJSON());
        }
        return json({ agents, count: agents.length });
      }

      // POST /api/os/spawn — spawn a new agent
      if (route === '/spawn' && request.method === 'POST') {
        const body = await request.json();
        const agent = await this.spawn(body);
        return json({ spawned: agent.toJSON() });
      }

      // POST /api/os/kill — kill an agent
      if (route === '/kill' && request.method === 'POST') {
        const body = await request.json();
        const id = body.id || body.agentId;
        const remaining = this.kernel.kill(id);
        return json({ killed: id, remainingMessages: remaining.length });
      }

      // POST /api/os/send — send a message to an agent
      if (route === '/send' && request.method === 'POST') {
        const body = await request.json();
        const agent = body.name ? this.kernel.lookup(body.name) : this.kernel.processes.get(body.id);
        if (!agent) return json({ error: 'Agent not found' }, 404);
        agent.send(body.message || body, body.priority || 'regular');
        return json({ sent: true, mailboxSize: agent.mailbox.size() });
      }

      // POST /api/os/events/publish — publish to event mesh
      if (route === '/events/publish' && request.method === 'POST') {
        const body = await request.json();
        const event = this.events.publish(body.topic, body);
        return json({ published: event.id, topic: body.topic });
      }

      // GET /api/os/events/history — event history
      if (route === '/events/history' && request.method === 'GET') {
        const since = parseInt(url.searchParams.get('since') || '0');
        const topic = url.searchParams.get('topic');
        const events = this.events.replay(since, topic || undefined);
        return json({ events: events.slice(-100), count: events.length });
      }

      // GET /api/os/capabilities/:agentId
      if (route.startsWith('/capabilities/') && request.method === 'GET') {
        const agentId = route.replace('/capabilities/', '');
        const caps = this.capabilities.listForAgent(agentId);
        return json({ agentId, capabilities: caps });
      }

      return json({ error: 'Unknown OS route', route }, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
}


module.exports = {
  BlackRoadOS,
  AgentKernel,
  AgentProcess,
  PriorityMailbox,
  SupervisionTree,
  Scheduler,
  AgentMemory,
  SharedKnowledge,
  MemoryScorer,
  EventMesh,
  A2AProtocol,
  CapabilityRegistry,
  BUILTIN_CAPABILITIES,
  VERSION,
};
