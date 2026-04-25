// Event Mesh — Solace Agent Mesh inspired
// Pub/sub with topics, A2A protocol, automatic task decomposition.
//
// Decoupled communication layer for agents. Supports:
//   - Topic-based publish/subscribe
//   - Request/reply pattern (with timeout)
//   - Broadcast to all agents
//   - Event sourcing via replay
//   - Dead letter queue for failed deliveries
//   - Agent-to-Agent protocol (discovery, delegation, negotiation)

'use strict';

// ─── Event Mesh ───────────────────────────────────────────────────────────────

/**
 * @typedef {Object} MeshEvent
 * @property {string} id - Unique event ID
 * @property {string} topic - Event topic
 * @property {string} from - Sender agent ID or 'system'
 * @property {*} data - Event payload
 * @property {number} timestamp - Unix ms
 * @property {string} [correlationId] - For request/reply pairing
 * @property {string} [replyTo] - Topic to send replies to
 */

class EventMesh {
  constructor() {
    /** @type {Map<string, Set<Function>>} topic -> Set<handler> */
    this.topics = new Map();
    /** @type {MeshEvent[]} Complete event log for replay/audit */
    this.history = [];
    /** @type {MeshEvent[]} Events that failed delivery */
    this.deadLetterQueue = [];
    /** @type {Map<string, { resolve: Function, reject: Function, timeout: number }>} correlationId -> pending reply */
    this._pendingReplies = new Map();
    /** @type {number} Max history size before pruning */
    this.maxHistory = 10000;
    this._totalPublished = 0;
    this._totalDelivered = 0;
    this._totalFailed = 0;
  }

  /**
   * Publish an event to a topic.
   * @param {string} topic
   * @param {Object} event - { from?, data, correlationId?, replyTo? }
   * @returns {MeshEvent} The published event with ID
   */
  publish(topic, event) {
    const meshEvent = {
      id: _eventId(),
      topic,
      from: event.from || 'system',
      data: event.data !== undefined ? event.data : event,
      timestamp: Date.now(),
      correlationId: event.correlationId || null,
      replyTo: event.replyTo || null,
    };

    // Log to history
    this.history.push(meshEvent);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-Math.floor(this.maxHistory * 0.8));
    }
    this._totalPublished++;

    // Check if this is a reply to a pending request
    if (meshEvent.correlationId && this._pendingReplies.has(meshEvent.correlationId)) {
      const pending = this._pendingReplies.get(meshEvent.correlationId);
      this._pendingReplies.delete(meshEvent.correlationId);
      clearTimeout(pending.timeout);
      pending.resolve(meshEvent);
      this._totalDelivered++;
      return meshEvent;
    }

    // Deliver to topic subscribers
    const handlers = this.topics.get(topic);
    if (!handlers || handlers.size === 0) {
      this.deadLetterQueue.push(meshEvent);
      if (this.deadLetterQueue.length > 1000) {
        this.deadLetterQueue = this.deadLetterQueue.slice(-500);
      }
      this._totalFailed++;
      return meshEvent;
    }

    for (const handler of handlers) {
      try {
        handler(meshEvent);
        this._totalDelivered++;
      } catch (err) {
        this._totalFailed++;
        this.deadLetterQueue.push({
          ...meshEvent,
          _deliveryError: err.message,
          _failedHandler: handler.name || 'anonymous',
        });
      }
    }

    return meshEvent;
  }

  /**
   * Subscribe to a topic.
   * @param {string} topic - Topic name (supports simple prefix matching with *)
   * @param {Function} handler - callback(event)
   * @returns {Function} Unsubscribe function
   */
  subscribe(topic, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }
    if (!this.topics.has(topic)) {
      this.topics.set(topic, new Set());
    }
    this.topics.get(topic).add(handler);

    // Return unsubscribe function for convenience
    return () => this.unsubscribe(topic, handler);
  }

  /**
   * Unsubscribe from a topic.
   * @param {string} topic
   * @param {Function} handler
   */
  unsubscribe(topic, handler) {
    const handlers = this.topics.get(topic);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.topics.delete(topic);
      }
    }
  }

  /**
   * Request/reply pattern — publish a request and wait for a response.
   * @param {string} topic - Topic to send the request on
   * @param {*} data - Request payload
   * @param {number} [timeoutMs=5000] - Timeout in milliseconds
   * @returns {Promise<MeshEvent>} The reply event
   */
  request(topic, data, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const correlationId = _eventId();
      const replyTopic = `_reply.${correlationId}`;

      // Set up timeout
      const timer = setTimeout(() => {
        this._pendingReplies.delete(correlationId);
        this.unsubscribe(replyTopic, replyHandler);
        reject(new Error(`Request to ${topic} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      // Listen for the reply
      const replyHandler = (event) => {
        this._pendingReplies.delete(correlationId);
        clearTimeout(timer);
        resolve(event);
      };
      this.subscribe(replyTopic, replyHandler);

      this._pendingReplies.set(correlationId, { resolve: replyHandler, reject, timeout: timer });

      // Publish the request
      this.publish(topic, {
        from: 'system',
        data,
        correlationId,
        replyTo: replyTopic,
      });
    });
  }

  /**
   * Reply to a request event.
   * @param {MeshEvent} originalEvent - The request event being replied to
   * @param {*} data - Reply payload
   */
  reply(originalEvent, data) {
    if (!originalEvent.replyTo) {
      throw new Error('Cannot reply — original event has no replyTo topic');
    }
    this.publish(originalEvent.replyTo, {
      from: originalEvent.topic,
      data,
      correlationId: originalEvent.correlationId,
    });
  }

  /**
   * Broadcast an event to ALL subscribers across ALL topics.
   * @param {Object} event - { from?, data }
   */
  broadcast(event) {
    const meshEvent = {
      id: _eventId(),
      topic: '_broadcast',
      from: event.from || 'system',
      data: event.data !== undefined ? event.data : event,
      timestamp: Date.now(),
    };

    this.history.push(meshEvent);
    this._totalPublished++;

    for (const [, handlers] of this.topics) {
      for (const handler of handlers) {
        try {
          handler(meshEvent);
          this._totalDelivered++;
        } catch {
          this._totalFailed++;
        }
      }
    }
  }

  /**
   * Replay events from a given timestamp (event sourcing).
   * @param {number} fromTimestamp - Unix ms to replay from
   * @param {string} [topic] - Optional topic filter
   * @returns {MeshEvent[]}
   */
  replay(fromTimestamp, topic) {
    return this.history.filter(event => {
      if (event.timestamp < fromTimestamp) return false;
      if (topic && event.topic !== topic) return false;
      return true;
    });
  }

  /**
   * Get events for a specific correlation chain.
   * @param {string} correlationId
   * @returns {MeshEvent[]}
   */
  getCorrelationChain(correlationId) {
    return this.history.filter(e => e.correlationId === correlationId);
  }

  /** Drain and return the dead letter queue. */
  drainDeadLetters() {
    const letters = [...this.deadLetterQueue];
    this.deadLetterQueue = [];
    return letters;
  }

  /** @returns {Object} */
  stats() {
    return {
      topics: this.topics.size,
      totalSubscribers: Array.from(this.topics.values()).reduce((s, set) => s + set.size, 0),
      historySize: this.history.length,
      deadLetters: this.deadLetterQueue.length,
      pendingReplies: this._pendingReplies.size,
      totalPublished: this._totalPublished,
      totalDelivered: this._totalDelivered,
      totalFailed: this._totalFailed,
    };
  }
}


// ─── A2A Protocol ─────────────────────────────────────────────────────────────
// Agent-to-Agent protocol inspired by Solace Agent Mesh.
// Handles discovery, capability exchange, task delegation, and negotiation.

class A2AProtocol {
  /**
   * Discover agents that match required capabilities.
   * @param {Map<string, Object>} processes - Kernel process map
   * @param {string[]} requiredCapabilities - Capabilities the target must have
   * @returns {Object[]} Matching agents with their capabilities
   */
  static discover(processes, requiredCapabilities) {
    const matches = [];
    for (const [id, agent] of processes) {
      if (agent.status !== 'ready' && agent.status !== 'running') continue;
      const hasAll = requiredCapabilities.every(cap =>
        agent.capabilities.includes(cap)
      );
      if (hasAll) {
        matches.push({
          id,
          name: agent.name,
          capabilities: agent.capabilities,
          status: agent.status,
          mailboxSize: agent.mailbox.size(),
        });
      }
    }
    // Sort by mailbox size (prefer less busy agents)
    return matches.sort((a, b) => a.mailboxSize - b.mailboxSize);
  }

  /**
   * Create a delegation message — ask another agent to handle a task.
   * @param {string} fromAgent - Delegating agent ID
   * @param {string} toAgent - Target agent ID
   * @param {Object} task - { type, description, payload, priority?, deadline? }
   * @returns {Object} Delegation message envelope
   */
  static delegate(fromAgent, toAgent, task) {
    return {
      id: _eventId(),
      type: 'a2a.delegate',
      from: fromAgent,
      to: toAgent,
      task: {
        type: task.type || 'generic',
        description: task.description || '',
        payload: task.payload || {},
        priority: task.priority || 'regular',
        deadline: task.deadline || null,
        delegated_at: Date.now(),
      },
    };
  }

  /**
   * Negotiate task assignment between two agents.
   * Returns a negotiation proposal that the target can accept/reject.
   * @param {Object} agentA - Requesting agent process
   * @param {Object} agentB - Target agent process
   * @param {Object} task - Task to negotiate
   * @returns {Object} Negotiation result
   */
  static negotiate(agentA, agentB, task) {
    // Simple negotiation: check if B has capacity and capabilities
    const bCapable = (task.requiredCapabilities || []).every(cap =>
      agentB.capabilities.includes(cap)
    );
    const bAvailable = agentB.status === 'ready' || agentB.status === 'running';
    const bHasCapacity = agentB.mailbox.size() < 50; // arbitrary threshold

    return {
      id: _eventId(),
      type: 'a2a.negotiate',
      from: agentA.id,
      to: agentB.id,
      task: task.description || task.type || 'unknown',
      result: bCapable && bAvailable && bHasCapacity ? 'accepted' : 'rejected',
      reason: !bCapable ? 'missing_capabilities'
        : !bAvailable ? 'unavailable'
        : !bHasCapacity ? 'at_capacity'
        : 'ok',
      negotiated_at: Date.now(),
    };
  }

  /**
   * Decompose a complex task into subtasks and find agents for each.
   * @param {Map<string, Object>} processes
   * @param {Object} task - { subtasks: [{ type, capabilities, description }] }
   * @returns {Object[]} Assignment plan
   */
  static decompose(processes, task) {
    const subtasks = task.subtasks || [];
    return subtasks.map(sub => {
      const candidates = A2AProtocol.discover(processes, sub.capabilities || []);
      return {
        subtask: sub.description || sub.type,
        capabilities: sub.capabilities || [],
        assignedTo: candidates.length > 0 ? candidates[0].id : null,
        candidateCount: candidates.length,
      };
    });
  }
}


// ─── Utility ──────────────────────────────────────────────────────────────────

function _eventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}


module.exports = {
  EventMesh,
  A2AProtocol,
};
