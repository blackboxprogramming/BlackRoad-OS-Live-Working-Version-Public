// Agent OS Kernel — BlackRoad
// Process scheduling, lifecycle management, supervision trees.
// Inspired by: Lunatic (WASM supervision), Ractor (priority channels), Tokio (work-stealing)
//
// This is the core runtime that turns RoundTrip from a chat app into
// a browser-native agent operating system. Lightweight process model
// supports 30K+ concurrent agents via cooperative scheduling.

'use strict';

// ─── Priority Mailbox ─────────────────────────────────────────────────────────
// 4-lane priority queue inspired by Ractor's channel model.
// signal > supervision > system > regular

/**
 * @typedef {'signal'|'supervision'|'system'|'regular'} Priority
 */

/**
 * @typedef {Object} MailboxMessage
 * @property {string} id - Unique message ID
 * @property {Priority} priority - Message priority lane
 * @property {string} from - Sender agent ID
 * @property {string} type - Message type identifier
 * @property {*} payload - Message body
 * @property {number} timestamp - Unix ms when enqueued
 */

const PRIORITY_ORDER = ['signal', 'supervision', 'system', 'regular'];

class PriorityMailbox {
  constructor() {
    /** @type {Object<Priority, MailboxMessage[]>} */
    this.lanes = {
      signal: [],
      supervision: [],
      system: [],
      regular: [],
    };
    this._totalReceived = 0;
    this._totalDelivered = 0;
  }

  /**
   * Enqueue a message into the appropriate priority lane.
   * @param {Priority} priority
   * @param {MailboxMessage} message
   */
  push(priority, message) {
    const lane = PRIORITY_ORDER.includes(priority) ? priority : 'regular';
    const envelope = {
      id: message.id || _uid(),
      priority: lane,
      from: message.from || 'kernel',
      type: message.type || 'message',
      payload: message.payload !== undefined ? message.payload : message,
      timestamp: message.timestamp || Date.now(),
    };
    this.lanes[lane].push(envelope);
    this._totalReceived++;
  }

  /**
   * Dequeue the highest-priority message.
   * @returns {MailboxMessage|null}
   */
  pop() {
    for (const lane of PRIORITY_ORDER) {
      if (this.lanes[lane].length > 0) {
        this._totalDelivered++;
        return this.lanes[lane].shift();
      }
    }
    return null;
  }

  /**
   * Peek at the highest-priority message without removing it.
   * @returns {MailboxMessage|null}
   */
  peek() {
    for (const lane of PRIORITY_ORDER) {
      if (this.lanes[lane].length > 0) {
        return this.lanes[lane][0];
      }
    }
    return null;
  }

  /**
   * Total messages across all lanes.
   * @returns {number}
   */
  size() {
    return PRIORITY_ORDER.reduce((sum, lane) => sum + this.lanes[lane].length, 0);
  }

  /**
   * Drain all messages (used during agent shutdown).
   * @returns {MailboxMessage[]}
   */
  drain() {
    const all = [];
    for (const lane of PRIORITY_ORDER) {
      all.push(...this.lanes[lane]);
      this.lanes[lane] = [];
    }
    return all;
  }

  /** @returns {{ queued: number, received: number, delivered: number, byLane: Object }} */
  stats() {
    const byLane = {};
    for (const lane of PRIORITY_ORDER) {
      byLane[lane] = this.lanes[lane].length;
    }
    return {
      queued: this.size(),
      received: this._totalReceived,
      delivered: this._totalDelivered,
      byLane,
    };
  }
}


// ─── Agent Process ────────────────────────────────────────────────────────────
// Lightweight process representing a single AI agent. Holds its own mailbox,
// memory reference, capabilities list, and lifecycle state.

/**
 * @typedef {'init'|'ready'|'running'|'suspended'|'stopped'|'crashed'} AgentStatus
 */

/**
 * @typedef {Object} AgentConfig
 * @property {string} name - Human-readable agent name
 * @property {string[]} [capabilities] - List of capability tokens
 * @property {string|null} [supervisor] - Supervisor agent ID
 * @property {number} [max_restarts] - Max restart attempts before permanent failure
 * @property {Object} [metadata] - Arbitrary metadata
 * @property {Function} [handler] - Message handler function(message, context)
 */

class AgentProcess {
  /**
   * @param {string} id - Unique process ID
   * @param {AgentConfig} config
   */
  constructor(id, config) {
    this.id = id;
    this.name = config.name;
    /** @type {AgentStatus} */
    this.status = 'init';
    this.capabilities = config.capabilities || [];
    this.mailbox = new PriorityMailbox();
    this.supervisor = config.supervisor || null;
    this.children = [];
    this.metadata = config.metadata || {};
    this.handler = config.handler || null;
    this.created_at = Date.now();
    this.last_active = Date.now();
    this.restart_count = 0;
    this.max_restarts = config.max_restarts !== undefined ? config.max_restarts : 5;
    this._crashReason = null;
  }

  /** Transition to ready state. */
  start() {
    if (this.status === 'stopped' || this.status === 'crashed') {
      throw new Error(`Cannot start agent ${this.id} in ${this.status} state`);
    }
    this.status = 'ready';
    this.last_active = Date.now();
  }

  /** Suspend the agent (pauses message processing but keeps mailbox). */
  suspend() {
    if (this.status !== 'running' && this.status !== 'ready') {
      return; // no-op for agents not actively running
    }
    this.status = 'suspended';
    this.last_active = Date.now();
  }

  /** Resume a suspended agent. */
  resume() {
    if (this.status !== 'suspended') {
      throw new Error(`Cannot resume agent ${this.id} — not suspended (status: ${this.status})`);
    }
    this.status = 'ready';
    this.last_active = Date.now();
  }

  /** Graceful stop — drains mailbox, transitions to stopped. */
  stop() {
    const remaining = this.mailbox.drain();
    this.status = 'stopped';
    this.last_active = Date.now();
    return remaining;
  }

  /**
   * Crash the agent with a reason. Supervisor will be notified.
   * @param {string|Error} reason
   */
  crash(reason) {
    this._crashReason = reason instanceof Error ? reason.message : String(reason);
    this.status = 'crashed';
    this.last_active = Date.now();
  }

  /**
   * Send a message to this agent's mailbox.
   * @param {MailboxMessage} message
   * @param {Priority} [priority='regular']
   */
  send(message, priority = 'regular') {
    this.mailbox.push(priority, message);
  }

  /**
   * Receive (pop) the next message from the mailbox.
   * @returns {MailboxMessage|null}
   */
  receive() {
    const msg = this.mailbox.pop();
    if (msg) {
      this.last_active = Date.now();
    }
    return msg;
  }

  /**
   * Process all pending messages through the handler.
   * @param {Object} context - Kernel-provided context
   * @returns {Promise<number>} Number of messages processed
   */
  async tick(context) {
    if (this.status !== 'ready' && this.status !== 'running') {
      return 0;
    }
    this.status = 'running';
    let processed = 0;
    const maxPerTick = 10; // cooperative scheduling: yield after 10 messages
    while (processed < maxPerTick) {
      const msg = this.receive();
      if (!msg) break;
      if (this.handler) {
        try {
          await this.handler(msg, context);
        } catch (err) {
          this.crash(err);
          return processed;
        }
      }
      processed++;
    }
    if (this.status === 'running') {
      this.status = 'ready';
    }
    return processed;
  }

  /** @returns {boolean} Whether the agent can be restarted. */
  canRestart() {
    return this.restart_count < this.max_restarts;
  }

  /** @returns {Object} Serializable snapshot of this process. */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      capabilities: this.capabilities,
      supervisor: this.supervisor,
      children: this.children,
      mailbox: this.mailbox.stats(),
      created_at: this.created_at,
      last_active: this.last_active,
      restart_count: this.restart_count,
      crash_reason: this._crashReason,
      metadata: this.metadata,
    };
  }
}


// ─── Supervision Tree ─────────────────────────────────────────────────────────
// Erlang-style supervision strategies (from Lunatic).
// one_for_one:  restart only the crashed child
// one_for_all:  restart all children if one crashes
// rest_for_one: restart the crashed child and all children started after it

/**
 * @typedef {'one_for_one'|'one_for_all'|'rest_for_one'} SupervisionStrategy
 */

class SupervisionTree {
  /**
   * @param {SupervisionStrategy} strategy
   * @param {Object} [options]
   * @param {number} [options.maxRestarts=10] - Max restarts within the window
   * @param {number} [options.windowMs=60000] - Time window for restart counting
   */
  constructor(strategy = 'one_for_one', options = {}) {
    if (!['one_for_one', 'one_for_all', 'rest_for_one'].includes(strategy)) {
      throw new Error(`Unknown supervision strategy: ${strategy}`);
    }
    this.strategy = strategy;
    this.children = []; // ordered list of child IDs
    this.maxRestarts = options.maxRestarts || 10;
    this.windowMs = options.windowMs || 60000;
    this._restartLog = []; // timestamps of restarts within the window
  }

  /**
   * Register a child agent under this supervisor.
   * @param {string} agentId
   */
  addChild(agentId) {
    if (!this.children.includes(agentId)) {
      this.children.push(agentId);
    }
  }

  /**
   * Remove a child from supervision.
   * @param {string} agentId
   */
  removeChild(agentId) {
    this.children = this.children.filter(id => id !== agentId);
  }

  /**
   * Determine which children to restart when one crashes.
   * @param {string} crashedId - The ID of the crashed child
   * @returns {{ toRestart: string[], exceeded: boolean }}
   */
  handleCrash(crashedId) {
    // Prune old restart entries
    const now = Date.now();
    this._restartLog = this._restartLog.filter(ts => now - ts < this.windowMs);

    // Check if we exceeded the restart budget
    this._restartLog.push(now);
    if (this._restartLog.length > this.maxRestarts) {
      return { toRestart: [], exceeded: true };
    }

    switch (this.strategy) {
      case 'one_for_one':
        return { toRestart: [crashedId], exceeded: false };

      case 'one_for_all':
        return { toRestart: [...this.children], exceeded: false };

      case 'rest_for_one': {
        const idx = this.children.indexOf(crashedId);
        if (idx === -1) return { toRestart: [], exceeded: false };
        return { toRestart: this.children.slice(idx), exceeded: false };
      }

      default:
        return { toRestart: [crashedId], exceeded: false };
    }
  }

  /** @returns {Object} */
  toJSON() {
    return {
      strategy: this.strategy,
      children: this.children,
      maxRestarts: this.maxRestarts,
      windowMs: this.windowMs,
      recentRestarts: this._restartLog.length,
    };
  }
}


// ─── Scheduler ────────────────────────────────────────────────────────────────
// Cooperative work-stealing scheduler inspired by Tokio and Crossbeam.
// Agents yield after processing a batch of messages per tick.

class Scheduler {
  /**
   * @param {number} [maxConcurrent=100] - Max agents processing simultaneously
   */
  constructor(maxConcurrent = 100) {
    /** @type {string[]} IDs of agents waiting to run */
    this.runQueue = [];
    /** @type {string[]} IDs of agents waiting on I/O or timers */
    this.waitQueue = [];
    /** @type {Map<string, number>} agentId -> tick start timestamp */
    this.running = new Map();
    this.maxConcurrent = maxConcurrent;
    this._totalTicks = 0;
    this._totalMessages = 0;
    this._ticksPerSecond = 0;
    this._lastMeasure = Date.now();
    this._lastTickCount = 0;
  }

  /**
   * Add an agent to the run queue.
   * @param {string} agentId
   */
  schedule(agentId) {
    if (!this.runQueue.includes(agentId) && !this.running.has(agentId)) {
      this.runQueue.push(agentId);
    }
  }

  /**
   * Move an agent to the wait queue (e.g., awaiting I/O).
   * @param {string} agentId
   */
  park(agentId) {
    this.runQueue = this.runQueue.filter(id => id !== agentId);
    this.running.delete(agentId);
    if (!this.waitQueue.includes(agentId)) {
      this.waitQueue.push(agentId);
    }
  }

  /**
   * Wake a parked agent (move from wait to run queue).
   * @param {string} agentId
   */
  wake(agentId) {
    this.waitQueue = this.waitQueue.filter(id => id !== agentId);
    this.schedule(agentId);
  }

  /**
   * Remove an agent from all queues.
   * @param {string} agentId
   */
  deschedule(agentId) {
    this.runQueue = this.runQueue.filter(id => id !== agentId);
    this.waitQueue = this.waitQueue.filter(id => id !== agentId);
    this.running.delete(agentId);
  }

  /**
   * Execute one scheduler tick: pick agents from the run queue and process them.
   * @param {Map<string, AgentProcess>} processes - All registered processes
   * @param {Object} context - Kernel context passed to agent handlers
   * @returns {Promise<{ processed: number, agents: number }>}
   */
  async tick(processes, context) {
    // Move agents with pending messages into the run queue
    for (const [id, agent] of processes) {
      if (agent.status === 'ready' && agent.mailbox.size() > 0) {
        this.schedule(id);
      }
    }

    const batch = this.runQueue.splice(0, this.maxConcurrent);
    let totalProcessed = 0;

    const promises = batch.map(async (agentId) => {
      const agent = processes.get(agentId);
      if (!agent || agent.status === 'stopped' || agent.status === 'crashed') {
        return 0;
      }
      this.running.set(agentId, Date.now());
      try {
        const count = await agent.tick(context);
        totalProcessed += count;
        return count;
      } finally {
        this.running.delete(agentId);
        // Re-queue if still has messages
        if (agent.status === 'ready' && agent.mailbox.size() > 0) {
          this.schedule(agentId);
        }
      }
    });

    await Promise.all(promises);

    this._totalTicks++;
    this._totalMessages += totalProcessed;

    // Measure throughput every second
    const now = Date.now();
    if (now - this._lastMeasure >= 1000) {
      this._ticksPerSecond = this._totalTicks - this._lastTickCount;
      this._lastTickCount = this._totalTicks;
      this._lastMeasure = now;
    }

    return { processed: totalProcessed, agents: batch.length };
  }

  /**
   * Work-stealing: rebalance the run queue by priority (agents with more messages first).
   * @param {Map<string, AgentProcess>} processes
   */
  rebalance(processes) {
    this.runQueue.sort((a, b) => {
      const pa = processes.get(a);
      const pb = processes.get(b);
      if (!pa || !pb) return 0;
      // Prioritize agents with signal/supervision messages
      const aSignal = pa.mailbox.lanes.signal.length + pa.mailbox.lanes.supervision.length;
      const bSignal = pb.mailbox.lanes.signal.length + pb.mailbox.lanes.supervision.length;
      if (aSignal !== bSignal) return bSignal - aSignal;
      return pb.mailbox.size() - pa.mailbox.size();
    });
  }

  /** @returns {Object} */
  stats() {
    return {
      runQueue: this.runQueue.length,
      waitQueue: this.waitQueue.length,
      running: this.running.size,
      maxConcurrent: this.maxConcurrent,
      totalTicks: this._totalTicks,
      totalMessages: this._totalMessages,
      ticksPerSecond: this._ticksPerSecond,
    };
  }
}


// ─── Agent Kernel ─────────────────────────────────────────────────────────────
// The central coordinator. Manages all agent processes, the scheduler,
// supervision trees, and provides the spawn/kill/lookup API.

class AgentKernel {
  constructor() {
    /** @type {Map<string, AgentProcess>} */
    this.processes = new Map();
    /** @type {Map<string, SupervisionTree>} supervisorId -> tree */
    this.supervisors = new Map();
    this.scheduler = new Scheduler();
    this._nameIndex = new Map(); // name -> id
    this._eventListeners = new Map(); // event -> Set<callback>
    this._running = false;
    this._tickInterval = null;
  }

  /**
   * Spawn a new agent process.
   * @param {AgentConfig} config
   * @returns {AgentProcess}
   */
  spawn(config) {
    if (!config.name) {
      throw new Error('Agent config must include a name');
    }
    const id = _uid();
    const agent = new AgentProcess(id, config);
    this.processes.set(id, agent);
    this._nameIndex.set(config.name.toLowerCase(), id);

    // Register under supervisor if specified
    if (config.supervisor) {
      const tree = this.supervisors.get(config.supervisor);
      if (tree) {
        tree.addChild(id);
        agent.supervisor = config.supervisor;
      }
    }

    agent.start();
    this.scheduler.schedule(id);
    this._emit('spawn', { agentId: id, name: config.name });
    return agent;
  }

  /**
   * Kill (stop) an agent by ID.
   * @param {string} id
   * @returns {MailboxMessage[]} Remaining messages from the agent's mailbox
   */
  kill(id) {
    const agent = this.processes.get(id);
    if (!agent) return [];
    this.scheduler.deschedule(id);
    const remaining = agent.stop();

    // Remove from supervisor
    if (agent.supervisor) {
      const tree = this.supervisors.get(agent.supervisor);
      if (tree) tree.removeChild(id);
    }

    // Kill children recursively
    for (const childId of agent.children) {
      this.kill(childId);
    }

    this._nameIndex.delete(agent.name.toLowerCase());
    this.processes.delete(id);
    this._emit('kill', { agentId: id, name: agent.name });
    return remaining;
  }

  /**
   * Look up an agent by name (case-insensitive).
   * @param {string} name
   * @returns {AgentProcess|null}
   */
  lookup(name) {
    const id = this._nameIndex.get(name.toLowerCase());
    if (!id) return null;
    return this.processes.get(id) || null;
  }

  /**
   * Register a supervision tree for an agent.
   * @param {string} supervisorId - The agent ID that acts as supervisor
   * @param {SupervisionStrategy} strategy
   * @param {Object} [options]
   * @returns {SupervisionTree}
   */
  supervise(supervisorId, strategy = 'one_for_one', options = {}) {
    const tree = new SupervisionTree(strategy, options);
    this.supervisors.set(supervisorId, tree);
    return tree;
  }

  /**
   * Handle a crashed agent — invoke its supervisor's strategy.
   * @param {string} agentId
   */
  async handleCrash(agentId) {
    const agent = this.processes.get(agentId);
    if (!agent) return;

    this._emit('crash', { agentId, name: agent.name, reason: agent._crashReason });

    if (!agent.supervisor) {
      // No supervisor — just leave it crashed
      this.scheduler.deschedule(agentId);
      return;
    }

    const tree = this.supervisors.get(agent.supervisor);
    if (!tree) {
      this.scheduler.deschedule(agentId);
      return;
    }

    const { toRestart, exceeded } = tree.handleCrash(agentId);

    if (exceeded) {
      // Too many restarts — escalate: crash the supervisor too
      this._emit('escalate', { supervisorId: agent.supervisor, childId: agentId });
      const sup = this.processes.get(agent.supervisor);
      if (sup) {
        sup.crash(`Child ${agentId} exceeded restart limit`);
        await this.handleCrash(agent.supervisor);
      }
      return;
    }

    for (const restartId of toRestart) {
      const child = this.processes.get(restartId);
      if (!child) continue;
      if (!child.canRestart()) {
        this.scheduler.deschedule(restartId);
        continue;
      }
      // Reset agent state for restart
      child.status = 'init';
      child._crashReason = null;
      child.restart_count++;
      child.mailbox = new PriorityMailbox(); // fresh mailbox
      child.start();
      this.scheduler.schedule(restartId);
      this._emit('restart', { agentId: restartId, name: child.name, count: child.restart_count });
    }
  }

  /**
   * Broadcast a message to all running agents.
   * @param {Object} event
   * @param {Priority} [priority='system']
   */
  broadcast(event, priority = 'system') {
    for (const [, agent] of this.processes) {
      if (agent.status === 'ready' || agent.status === 'running') {
        agent.send(event, priority);
      }
    }
  }

  /**
   * Run one scheduler tick — process pending messages across all agents.
   * @returns {Promise<{ processed: number, agents: number }>}
   */
  async tick() {
    const context = {
      kernel: this,
      send: (toName, msg, priority) => {
        const target = this.lookup(toName);
        if (target) target.send(msg, priority);
      },
      broadcast: (msg, priority) => this.broadcast(msg, priority),
    };

    const result = await this.scheduler.tick(this.processes, context);

    // Check for crashed agents and invoke supervision
    for (const [id, agent] of this.processes) {
      if (agent.status === 'crashed') {
        await this.handleCrash(id);
      }
    }

    return result;
  }

  /**
   * Start the kernel tick loop.
   * @param {number} [intervalMs=50] - Tick interval
   */
  start(intervalMs = 50) {
    if (this._running) return;
    this._running = true;
    this._tickInterval = setInterval(() => this.tick().catch(() => {}), intervalMs);
    this._emit('boot', { timestamp: Date.now() });
  }

  /** Stop the kernel tick loop. */
  stop() {
    this._running = false;
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
      this._tickInterval = null;
    }
    this._emit('shutdown', { timestamp: Date.now() });
  }

  /**
   * Register an event listener.
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }
    this._eventListeners.get(event).add(callback);
  }

  /**
   * Remove an event listener.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const listeners = this._eventListeners.get(event);
    if (listeners) listeners.delete(callback);
  }

  /** @private */
  _emit(event, data) {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      for (const cb of listeners) {
        try { cb(data); } catch { /* listener errors don't crash the kernel */ }
      }
    }
  }

  /** @returns {Object} Kernel statistics snapshot. */
  stats() {
    const byStatus = {};
    for (const [, agent] of this.processes) {
      byStatus[agent.status] = (byStatus[agent.status] || 0) + 1;
    }
    return {
      processes: this.processes.size,
      byStatus,
      supervisors: this.supervisors.size,
      scheduler: this.scheduler.stats(),
      running: this._running,
    };
  }
}


// ─── Utility ──────────────────────────────────────────────────────────────────

/** Generate a short unique ID. */
function _uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}


module.exports = {
  AgentProcess,
  PriorityMailbox,
  SupervisionTree,
  Scheduler,
  AgentKernel,
  PRIORITY_ORDER,
};
