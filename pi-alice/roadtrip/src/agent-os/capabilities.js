// Capability Registry — seL4-inspired
// Every resource access requires an unforgeable capability token.
//
// Agents are granted capabilities at spawn time. All privileged operations
// must be checked through this registry. Capabilities can be granted,
// revoked, and delegated (with restrictions).
//
// Built-in capabilities:
//   chat             — send/receive chat messages
//   memory.read      — read own memory
//   memory.write     — write own memory
//   memory.shared    — read/write shared knowledge graph
//   ollama.inference — invoke Ollama models
//   mesh.publish     — publish events to the event mesh
//   mesh.subscribe   — subscribe to event mesh topics
//   network.scan     — scan network ports/hosts
//   deploy           — trigger deployments
//   spawn            — spawn child agents
//   admin            — full administrative access (grant/revoke capabilities)

'use strict';

/**
 * @typedef {Object} CapabilityDefinition
 * @property {string} name - Capability identifier
 * @property {string} description - Human-readable description
 * @property {boolean} delegatable - Whether agents can pass this to children
 * @property {Function} [validator] - Optional validator(agentId, context) -> boolean
 */

/** Default capability definitions shipped with the kernel. */
const BUILTIN_CAPABILITIES = {
  'chat':             { description: 'Send and receive chat messages',         delegatable: true },
  'memory.read':      { description: 'Read own agent memory',                 delegatable: true },
  'memory.write':     { description: 'Write to own agent memory',             delegatable: true },
  'memory.shared':    { description: 'Read/write shared knowledge graph',     delegatable: true },
  'ollama.inference': { description: 'Invoke Ollama models for inference',    delegatable: true },
  'mesh.publish':     { description: 'Publish events to the event mesh',      delegatable: true },
  'mesh.subscribe':   { description: 'Subscribe to event mesh topics',        delegatable: true },
  'network.scan':     { description: 'Scan network ports and hosts',          delegatable: false },
  'deploy':           { description: 'Trigger deployments to infrastructure', delegatable: false },
  'spawn':            { description: 'Spawn child agent processes',           delegatable: false },
  'admin':            { description: 'Full administrative access',            delegatable: false },
};

class CapabilityRegistry {
  constructor() {
    /** @type {Map<string, Set<string>>} agentId -> Set<capabilityName> */
    this.capabilities = new Map();
    /** @type {Map<string, CapabilityDefinition>} capName -> definition */
    this.definitions = new Map();
    /** @type {Array<Object>} Audit log of grant/revoke actions */
    this._auditLog = [];
    this._maxAuditLog = 5000;

    // Register built-in capabilities
    for (const [name, def] of Object.entries(BUILTIN_CAPABILITIES)) {
      this.definitions.set(name, { name, delegatable: true, ...def });
    }
  }

  /**
   * Define a new capability type.
   * @param {string} name - Capability identifier
   * @param {Object} definition - { description, delegatable?, validator? }
   */
  define(name, definition) {
    if (this.definitions.has(name)) {
      throw new Error(`Capability '${name}' is already defined`);
    }
    this.definitions.set(name, {
      name,
      description: definition.description || name,
      delegatable: definition.delegatable !== false,
      validator: definition.validator || null,
    });
  }

  /**
   * Grant a capability to an agent.
   * @param {string} agentId
   * @param {string} capability
   * @param {Object} [options]
   * @param {string} [options.grantedBy='system'] - Who granted it
   * @returns {boolean} true if newly granted, false if already had it
   */
  grant(agentId, capability, options = {}) {
    if (!this.definitions.has(capability)) {
      throw new Error(`Unknown capability: '${capability}'. Define it first.`);
    }

    if (!this.capabilities.has(agentId)) {
      this.capabilities.set(agentId, new Set());
    }

    const caps = this.capabilities.get(agentId);
    const isNew = !caps.has(capability);
    caps.add(capability);

    this._audit('grant', agentId, capability, options.grantedBy || 'system');
    return isNew;
  }

  /**
   * Grant multiple capabilities at once.
   * @param {string} agentId
   * @param {string[]} capabilityList
   * @param {Object} [options]
   */
  grantAll(agentId, capabilityList, options = {}) {
    for (const cap of capabilityList) {
      this.grant(agentId, cap, options);
    }
  }

  /**
   * Revoke a capability from an agent.
   * @param {string} agentId
   * @param {string} capability
   * @param {Object} [options]
   * @param {string} [options.revokedBy='system']
   * @returns {boolean} true if was present and removed
   */
  revoke(agentId, capability, options = {}) {
    const caps = this.capabilities.get(agentId);
    if (!caps) return false;
    const removed = caps.delete(capability);
    if (removed) {
      this._audit('revoke', agentId, capability, options.revokedBy || 'system');
    }
    return removed;
  }

  /**
   * Revoke all capabilities from an agent.
   * @param {string} agentId
   */
  revokeAll(agentId) {
    const caps = this.capabilities.get(agentId);
    if (caps) {
      for (const cap of caps) {
        this._audit('revoke', agentId, cap, 'system');
      }
    }
    this.capabilities.delete(agentId);
  }

  /**
   * Check whether an agent has a specific capability.
   * @param {string} agentId
   * @param {string} capability
   * @param {Object} [context] - Optional context passed to the validator
   * @returns {boolean}
   */
  check(agentId, capability, context = {}) {
    const caps = this.capabilities.get(agentId);
    if (!caps || !caps.has(capability)) return false;

    // Run custom validator if defined
    const def = this.definitions.get(capability);
    if (def && def.validator) {
      try {
        return def.validator(agentId, context);
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Require a capability — throws if the agent does not have it.
   * @param {string} agentId
   * @param {string} capability
   * @param {Object} [context]
   * @throws {Error} If capability check fails
   */
  require(agentId, capability, context = {}) {
    if (!this.check(agentId, capability, context)) {
      throw new Error(`Agent ${agentId} lacks required capability: '${capability}'`);
    }
  }

  /**
   * List all capabilities for an agent.
   * @param {string} agentId
   * @returns {string[]}
   */
  listForAgent(agentId) {
    const caps = this.capabilities.get(agentId);
    return caps ? Array.from(caps) : [];
  }

  /**
   * List all agents that have a specific capability.
   * @param {string} capability
   * @returns {string[]} Agent IDs
   */
  listAgentsWithCapability(capability) {
    const agents = [];
    for (const [agentId, caps] of this.capabilities) {
      if (caps.has(capability)) agents.push(agentId);
    }
    return agents;
  }

  /**
   * Check if a capability can be delegated (passed from parent to child).
   * @param {string} capability
   * @returns {boolean}
   */
  isDelegatable(capability) {
    const def = this.definitions.get(capability);
    return def ? def.delegatable : false;
  }

  /**
   * Delegate capabilities from a parent agent to a child.
   * Only delegatable capabilities are transferred.
   * @param {string} parentId
   * @param {string} childId
   * @param {string[]} [specificCaps] - If provided, only delegate these. Otherwise delegate all delegatable.
   * @returns {string[]} Capabilities actually delegated
   */
  delegate(parentId, childId, specificCaps) {
    const parentCaps = this.capabilities.get(parentId);
    if (!parentCaps) return [];

    const toDelegateList = specificCaps || Array.from(parentCaps);
    const delegated = [];

    for (const cap of toDelegateList) {
      if (!parentCaps.has(cap)) continue; // parent must have it
      if (!this.isDelegatable(cap)) continue; // must be delegatable
      this.grant(childId, cap, { grantedBy: parentId });
      delegated.push(cap);
    }

    return delegated;
  }

  /**
   * Get the audit log.
   * @param {Object} [filter] - { agentId?, action?, limit? }
   * @returns {Object[]}
   */
  getAuditLog(filter = {}) {
    let log = this._auditLog;
    if (filter.agentId) {
      log = log.filter(e => e.agentId === filter.agentId);
    }
    if (filter.action) {
      log = log.filter(e => e.action === filter.action);
    }
    const limit = filter.limit || 100;
    return log.slice(-limit);
  }

  /** @private */
  _audit(action, agentId, capability, actor) {
    this._auditLog.push({
      action,
      agentId,
      capability,
      actor,
      timestamp: Date.now(),
    });
    if (this._auditLog.length > this._maxAuditLog) {
      this._auditLog = this._auditLog.slice(-Math.floor(this._maxAuditLog * 0.8));
    }
  }

  /** @returns {Object} */
  stats() {
    return {
      totalAgents: this.capabilities.size,
      totalDefinitions: this.definitions.size,
      auditLogSize: this._auditLog.length,
      builtinCapabilities: Object.keys(BUILTIN_CAPABILITIES),
    };
  }
}


module.exports = {
  CapabilityRegistry,
  BUILTIN_CAPABILITIES,
};
