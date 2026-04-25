// Agent Memory — Mem0-inspired hybrid architecture
// Per-agent memory + shared knowledge graph + session context
//
// Each agent has 3 memory tiers:
//   shortTerm — session-scoped Map (cleared on suspend/restart)
//   longTerm  — persisted facts in SQLite/D1
//   shared    — cross-agent knowledge graph (publish/subscribe)
//
// Implements the AUDN cycle: Add, Update, Delete, Noop
// with relevance x importance x recency scoring for retrieval.

'use strict';

// ─── Memory Scorer ────────────────────────────────────────────────────────────
// Scores memories by relevance, importance, and recency for retrieval ranking.

class MemoryScorer {
  /**
   * Score a memory entry against a query.
   * @param {Object} memory - { key, value, importance, created_at, accessed_at, access_count }
   * @param {string} query - Search query
   * @param {Object} [options]
   * @param {number} [options.relevanceWeight=0.5]
   * @param {number} [options.importanceWeight=0.3]
   * @param {number} [options.recencyWeight=0.2]
   * @returns {number} Score between 0 and 1
   */
  static score(memory, query, options = {}) {
    const rw = options.relevanceWeight || 0.5;
    const iw = options.importanceWeight || 0.3;
    const tw = options.recencyWeight || 0.2;

    const relevance = MemoryScorer._textRelevance(memory, query);
    const importance = MemoryScorer._importanceScore(memory);
    const recency = MemoryScorer._recencyScore(memory);

    return (relevance * rw) + (importance * iw) + (recency * tw);
  }

  /**
   * Simple text relevance: keyword overlap between query and memory key+value.
   * @private
   */
  static _textRelevance(memory, query) {
    if (!query) return 0;
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (queryTerms.length === 0) return 0;

    const memText = `${memory.key || ''} ${_stringify(memory.value)}`.toLowerCase();
    let matches = 0;
    for (const term of queryTerms) {
      if (memText.includes(term)) matches++;
    }
    return matches / queryTerms.length;
  }

  /**
   * Importance based on explicit importance field and access count.
   * @private
   */
  static _importanceScore(memory) {
    const explicit = typeof memory.importance === 'number'
      ? Math.min(1, Math.max(0, memory.importance))
      : 0.5;
    const accessBoost = Math.min(1, (memory.access_count || 0) / 20);
    return explicit * 0.7 + accessBoost * 0.3;
  }

  /**
   * Recency: exponential decay based on last access time. Half-life = 1 hour.
   * @private
   */
  static _recencyScore(memory) {
    const lastAccess = memory.accessed_at || memory.created_at || Date.now();
    const ageMs = Date.now() - lastAccess;
    const halfLifeMs = 3600000; // 1 hour
    return Math.exp(-0.693 * ageMs / halfLifeMs);
  }
}


// ─── Agent Memory ─────────────────────────────────────────────────────────────
// Per-agent memory with short-term (session), long-term (persisted), and
// shared (cross-agent) tiers.

class AgentMemory {
  /**
   * @param {string} agentId
   * @param {Object} [db] - D1/SQLite-compatible database (optional)
   */
  constructor(agentId, db) {
    this.agentId = agentId;
    this.db = db || null;
    /** @type {Map<string, *>} Session context — cleared on suspend/restart */
    this.shortTerm = new Map();
    /** @type {Array<Object>} Cached long-term memories (loaded from DB) */
    this.longTerm = [];
    /** @type {SharedKnowledge|null} Reference to shared knowledge graph */
    this.shared = null;
    this._initialized = false;
  }

  /**
   * Initialize the long-term memory table for this agent.
   * Called once per agent lifecycle.
   */
  async init() {
    if (!this.db || this._initialized) return;
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
      await this.db.prepare(
        `CREATE INDEX IF NOT EXISTS idx_agent_memory_agent ON agent_memory(agent_id)`
      ).run();
      await this.db.prepare(
        `CREATE INDEX IF NOT EXISTS idx_agent_memory_key ON agent_memory(agent_id, key)`
      ).run();
      this._initialized = true;
    } catch {
      // Table may already exist — that's fine
      this._initialized = true;
    }
  }

  // ── AUDN Cycle ──

  /**
   * Add a new memory (the "A" in AUDN).
   * @param {string} key
   * @param {*} value
   * @param {Object} [options]
   * @param {'private'|'shared'} [options.scope='private']
   * @param {number} [options.importance=0.5]
   * @returns {Promise<string>} Memory ID
   */
  async add(key, value, options = {}) {
    const scope = options.scope || 'private';
    const importance = options.importance !== undefined ? options.importance : 0.5;
    const id = _memId();

    // Short-term always
    this.shortTerm.set(key, value);

    // Long-term if DB available
    if (this.db) {
      await this.init();
      try {
        await this.db.prepare(
          `INSERT INTO agent_memory (id, agent_id, key, value, scope, importance, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, this.agentId, key, _stringify(value), scope, importance, JSON.stringify(options.metadata || {})).run();
      } catch { /* duplicate or DB error — short-term still has it */ }
    }

    // Publish to shared if scope is shared
    if (scope === 'shared' && this.shared) {
      await this.shared.publish(this.agentId, { key, value, importance });
    }

    return id;
  }

  /**
   * Update an existing memory (the "U" in AUDN).
   * @param {string} key
   * @param {*} value
   * @param {Object} [options]
   */
  async update(key, value, options = {}) {
    this.shortTerm.set(key, value);

    if (this.db) {
      await this.init();
      try {
        await this.db.prepare(
          `UPDATE agent_memory SET value = ?, accessed_at = datetime('now'),
           access_count = access_count + 1 WHERE agent_id = ? AND key = ?`
        ).bind(_stringify(value), this.agentId, key).run();
      } catch { /* no-op on error */ }
    }
  }

  /**
   * Delete a memory (the "D" in AUDN).
   * @param {string} key
   */
  async delete(key) {
    this.shortTerm.delete(key);

    if (this.db) {
      await this.init();
      try {
        await this.db.prepare(
          `DELETE FROM agent_memory WHERE agent_id = ? AND key = ?`
        ).bind(this.agentId, key).run();
      } catch { /* no-op */ }
    }
  }

  /**
   * Remember a value (alias for add with scope support).
   * @param {string} key
   * @param {*} value
   * @param {'private'|'shared'} [scope='private']
   */
  async remember(key, value, scope = 'private') {
    return this.add(key, value, { scope });
  }

  /**
   * Recall a value by key. Checks short-term first, then long-term.
   * @param {string} key
   * @returns {Promise<*>}
   */
  async recall(key) {
    // Short-term first (fastest)
    if (this.shortTerm.has(key)) {
      return this.shortTerm.get(key);
    }

    // Long-term lookup
    if (this.db) {
      await this.init();
      try {
        const row = await this.db.prepare(
          `SELECT value FROM agent_memory WHERE agent_id = ? AND key = ? LIMIT 1`
        ).bind(this.agentId, key).first();
        if (row) {
          // Update access stats
          await this.db.prepare(
            `UPDATE agent_memory SET accessed_at = datetime('now'),
             access_count = access_count + 1 WHERE agent_id = ? AND key = ?`
          ).bind(this.agentId, key).run();
          const parsed = _parse(row.value);
          this.shortTerm.set(key, parsed); // cache in short-term
          return parsed;
        }
      } catch { /* fall through */ }
    }

    return undefined;
  }

  /**
   * Forget a key (alias for delete).
   * @param {string} key
   */
  async forget(key) {
    return this.delete(key);
  }

  /**
   * Search memories by query with relevance scoring.
   * @param {string} query
   * @param {Object} [options]
   * @param {number} [options.limit=10]
   * @param {string} [options.scope] - Filter by scope
   * @returns {Promise<Array<{ key: string, value: *, score: number }>>}
   */
  async search(query, options = {}) {
    const limit = options.limit || 10;
    const results = [];

    // Search short-term
    for (const [key, value] of this.shortTerm) {
      const mem = { key, value, importance: 0.5, accessed_at: Date.now(), access_count: 1 };
      const score = MemoryScorer.score(mem, query);
      if (score > 0.1) {
        results.push({ key, value, score, source: 'shortTerm' });
      }
    }

    // Search long-term
    if (this.db) {
      await this.init();
      try {
        const rows = await this.db.prepare(
          `SELECT key, value, importance, accessed_at, access_count FROM agent_memory
           WHERE agent_id = ? ${options.scope ? "AND scope = '" + options.scope + "'" : ''}
           ORDER BY accessed_at DESC LIMIT 200`
        ).bind(this.agentId).all();
        for (const row of (rows.results || [])) {
          const score = MemoryScorer.score(row, query);
          if (score > 0.1) {
            results.push({ key: row.key, value: _parse(row.value), score, source: 'longTerm' });
          }
        }
      } catch { /* DB error — return short-term results only */ }
    }

    // Sort by score descending, deduplicate by key, limit
    const seen = new Set();
    return results
      .sort((a, b) => b.score - a.score)
      .filter(r => {
        if (seen.has(r.key)) return false;
        seen.add(r.key);
        return true;
      })
      .slice(0, limit);
  }

  /**
   * Get recent context for prompt building.
   * @param {number} [limit=20]
   * @returns {Promise<Array<{ key: string, value: * }>>}
   */
  async getContext(limit = 20) {
    const context = [];

    // Short-term entries (most recent)
    for (const [key, value] of this.shortTerm) {
      context.push({ key, value, source: 'shortTerm' });
      if (context.length >= limit) return context;
    }

    // Fill from long-term
    if (this.db && context.length < limit) {
      await this.init();
      try {
        const rows = await this.db.prepare(
          `SELECT key, value FROM agent_memory WHERE agent_id = ?
           ORDER BY accessed_at DESC LIMIT ?`
        ).bind(this.agentId, limit - context.length).all();
        for (const row of (rows.results || [])) {
          context.push({ key: row.key, value: _parse(row.value), source: 'longTerm' });
        }
      } catch { /* return what we have */ }
    }

    return context;
  }

  /**
   * Prune old long-term memories beyond a max age.
   * @param {number} maxAgeMs - Maximum age in milliseconds
   * @returns {Promise<number>} Number of pruned entries
   */
  async prune(maxAgeMs = 7 * 24 * 3600 * 1000) {
    if (!this.db) return 0;
    await this.init();
    try {
      const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
      const result = await this.db.prepare(
        `DELETE FROM agent_memory WHERE agent_id = ? AND accessed_at < ? AND importance < 0.8`
      ).bind(this.agentId, cutoff).run();
      return result.changes || 0;
    } catch {
      return 0;
    }
  }

  /** Clear short-term memory (called on suspend/restart). */
  clearShortTerm() {
    this.shortTerm.clear();
  }

  /** @returns {Object} Memory statistics. */
  stats() {
    return {
      agentId: this.agentId,
      shortTerm: this.shortTerm.size,
      longTerm: this.longTerm.length,
      hasDb: !!this.db,
      initialized: this._initialized,
    };
  }
}


// ─── Shared Knowledge ─────────────────────────────────────────────────────────
// Cross-agent knowledge graph. When Agent A discovers something, Agent B
// can query it. Backed by D1/SQLite with pub/sub notification.

class SharedKnowledge {
  /**
   * @param {Object} [db] - D1/SQLite-compatible database
   */
  constructor(db) {
    this.db = db || null;
    /** @type {Map<string, Set<Function>>} topic -> subscriber callbacks */
    this.subscribers = new Map();
    this._initialized = false;
  }

  /** Initialize the shared knowledge table. */
  async init() {
    if (!this.db || this._initialized) return;
    try {
      await this.db.prepare(`CREATE TABLE IF NOT EXISTS shared_knowledge (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        importance REAL DEFAULT 0.5,
        created_at TEXT DEFAULT (datetime('now')),
        accessed_at TEXT DEFAULT (datetime('now')),
        access_count INTEGER DEFAULT 0
      )`).run();
      await this.db.prepare(
        `CREATE INDEX IF NOT EXISTS idx_shared_topic ON shared_knowledge(topic)`
      ).run();
      this._initialized = true;
    } catch {
      this._initialized = true;
    }
  }

  /**
   * Publish a fact to the shared knowledge graph.
   * @param {string} agentId - Publishing agent
   * @param {Object} fact - { key, value, topic?, importance? }
   */
  async publish(agentId, fact) {
    const topic = fact.topic || 'general';
    const id = _memId();

    if (this.db) {
      await this.init();
      try {
        await this.db.prepare(
          `INSERT INTO shared_knowledge (id, agent_id, topic, key, value, importance)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, agentId, topic, fact.key, _stringify(fact.value), fact.importance || 0.5).run();
      } catch { /* duplicate or error */ }
    }

    // Notify subscribers
    const subs = this.subscribers.get(topic);
    if (subs) {
      const event = { agentId, topic, key: fact.key, value: fact.value, timestamp: Date.now() };
      for (const cb of subs) {
        try { cb(event); } catch { /* subscriber error */ }
      }
    }
  }

  /**
   * Query the shared knowledge graph.
   * @param {Object} pattern - { topic?, key?, agentId?, query? }
   * @param {Object} [options] - { limit? }
   * @returns {Promise<Array<Object>>}
   */
  async query(pattern, options = {}) {
    if (!this.db) return [];
    await this.init();

    const limit = options.limit || 20;
    let sql = 'SELECT * FROM shared_knowledge WHERE 1=1';
    const binds = [];

    if (pattern.topic) {
      sql += ' AND topic = ?';
      binds.push(pattern.topic);
    }
    if (pattern.key) {
      sql += ' AND key LIKE ?';
      binds.push(`%${pattern.key}%`);
    }
    if (pattern.agentId) {
      sql += ' AND agent_id = ?';
      binds.push(pattern.agentId);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    binds.push(limit);

    try {
      const result = await this.db.prepare(sql).bind(...binds).all();
      return (result.results || []).map(row => ({
        ...row,
        value: _parse(row.value),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to updates on a topic.
   * @param {string} topic
   * @param {Function} callback
   */
  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);
  }

  /**
   * Unsubscribe from a topic.
   * @param {string} topic
   * @param {Function} callback
   */
  unsubscribe(topic, callback) {
    const subs = this.subscribers.get(topic);
    if (subs) subs.delete(callback);
  }

  /** @returns {Object} */
  stats() {
    return {
      topics: this.subscribers.size,
      totalSubscribers: Array.from(this.subscribers.values()).reduce((s, set) => s + set.size, 0),
      hasDb: !!this.db,
    };
  }
}


// ─── Utilities ────────────────────────────────────────────────────────────────

function _memId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'mem-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function _stringify(value) {
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

function _parse(value) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}


module.exports = {
  AgentMemory,
  SharedKnowledge,
  MemoryScorer,
};
