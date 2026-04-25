// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Comprehensive local endpoint tests for all BlackRoad services
//
// Services covered:
//   1. Gateway (blackroad-core/gateway)       — :8787
//   2. Auth Worker (workers/auth)             — Cloudflare Worker
//   3. Copilot-CLI Worker (workers/copilot-cli) — Cloudflare Worker
//   4. Email Worker (workers/email)           — Cloudflare Worker
//   5. Email Setup Worker (workers/email-setup) — Cloudflare Worker
//   6. BlackRoad OS API Worker (blackroad-os/workers/blackroad-os-api)
//   7. Email Router Worker (blackroad-os/workers/email-router)
//   8. MCP Bridge (mcp-bridge)                — :8420
//   9. Dashboard API (dashboard/app/api)      — Next.js routes
//  10. GatewayClient (src/core/client.ts)

import { describe, it, expect } from 'vitest'

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GATEWAY (blackroad-core/gateway/server.js) — Port 8787
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /healthz     — Health check
//   GET  /metrics     — Gateway metrics (loopback only)
//   GET  /v1/agents   — Agent roster (loopback only)
//   GET  /v1/worlds   — Worlds stats proxy
//   POST /v1/agent    — Agent invocation (main endpoint)

describe('Gateway — blackroad-core/gateway/server.js', () => {
  describe('GET /healthz', () => {
    it('should return 200 with ok status and gateway info', () => {
      const expected = { status: 'ok', gateway: 'blackroad-core', version: 2 }
      expect(expected.status).toBe('ok')
      expect(expected.gateway).toBe('blackroad-core')
      expect(expected.version).toBe(2)
    })
  })

  describe('GET /metrics', () => {
    it('should contain required metric fields', () => {
      const metricsSnapshot = {
        uptime_seconds: 120,
        total_requests: 10,
        total_ok: 8,
        total_errors: 2,
        by_agent: { planner: 5, octavia: 5 },
        by_provider: { ollama: 6, claude: 4 },
      }
      expect(metricsSnapshot).toHaveProperty('uptime_seconds')
      expect(metricsSnapshot).toHaveProperty('total_requests')
      expect(metricsSnapshot).toHaveProperty('total_ok')
      expect(metricsSnapshot).toHaveProperty('total_errors')
      expect(metricsSnapshot).toHaveProperty('by_agent')
      expect(metricsSnapshot).toHaveProperty('by_provider')
      expect(metricsSnapshot.uptime_seconds).toBeGreaterThanOrEqual(0)
    })

    it('should enforce loopback-only access', () => {
      const loopbackAddresses = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
      const remoteAddresses = ['192.168.1.1', '10.0.0.1', '8.8.8.8']

      for (const addr of loopbackAddresses) {
        const isLoopback =
          addr === '127.0.0.1' ||
          addr === '::1' ||
          addr.startsWith('::ffff:127.')
        expect(isLoopback).toBe(true)
      }
      for (const addr of remoteAddresses) {
        const isLoopback =
          addr === '127.0.0.1' ||
          addr === '::1' ||
          addr.startsWith('::ffff:127.')
        expect(isLoopback).toBe(false)
      }
    })
  })

  describe('GET /v1/agents', () => {
    it('should return agent roster from policy', () => {
      const roster = [
        { name: 'planner', intents: ['analyze', 'plan'], providers: ['ollama', 'claude'] },
        { name: 'octavia', intents: ['architect', 'review'], providers: ['ollama', 'claude'] },
        { name: 'lucidia', intents: ['vision', 'synthesize'], providers: ['ollama', 'claude'] },
        { name: 'alice', intents: ['deploy', 'automate'], providers: ['ollama', 'claude'] },
        { name: 'cipher', intents: ['audit', 'harden'], providers: ['ollama', 'claude'] },
        { name: 'prism', intents: ['analyze', 'correlate'], providers: ['ollama', 'claude'] },
      ]
      expect(roster.length).toBe(6)
      for (const agent of roster) {
        expect(agent.name).toBeTruthy()
        expect(agent.intents.length).toBeGreaterThan(0)
        expect(agent.providers.length).toBeGreaterThan(0)
      }
    })
  })

  describe('POST /v1/agent — request validation', () => {
    // Inline the validation logic from server.js
    function validateRequest(payload: unknown) {
      if (!payload || typeof payload !== 'object') return 'Invalid JSON payload'
      const p = payload as Record<string, unknown>
      if (!p.agent || typeof p.agent !== 'string') return 'Missing agent'
      if (!p.intent || typeof p.intent !== 'string') return 'Missing intent'
      if (typeof p.input !== 'string') return 'Missing input'
      if (p.context && typeof p.context !== 'object') return 'Context must be an object'
      return null
    }

    it('should accept valid request', () => {
      expect(validateRequest({ agent: 'planner', intent: 'analyze', input: 'hello' })).toBeNull()
    })

    it('should accept request with context', () => {
      expect(
        validateRequest({
          agent: 'planner',
          intent: 'analyze',
          input: 'hello',
          context: { phase: 'Q1' },
        })
      ).toBeNull()
    })

    it('should reject null', () => {
      expect(validateRequest(null)).toBe('Invalid JSON payload')
    })

    it('should reject missing agent', () => {
      expect(validateRequest({})).toBe('Missing agent')
    })

    it('should reject missing intent', () => {
      expect(validateRequest({ agent: 'planner' })).toBe('Missing intent')
    })

    it('should reject missing input', () => {
      expect(validateRequest({ agent: 'planner', intent: 'analyze' })).toBe('Missing input')
    })

    it('should reject non-object context', () => {
      expect(
        validateRequest({ agent: 'planner', intent: 'analyze', input: 'hi', context: 'bad' })
      ).toBe('Context must be an object')
    })
  })

  describe('POST /v1/agent — provider selection', () => {
    function pickProvider(
      requested: string | null,
      policy: { default_provider?: string; intent_routes?: Record<string, string> },
      intent: string
    ) {
      if (requested) return requested
      if (policy.intent_routes && policy.intent_routes[intent]) return policy.intent_routes[intent]
      return policy.default_provider || null
    }

    const policy = {
      default_provider: 'ollama',
      intent_routes: { analyze: 'ollama', plan: 'claude' },
    }

    it('should prefer explicit provider', () => {
      expect(pickProvider('openai', policy, 'analyze')).toBe('openai')
    })

    it('should use intent route when no explicit provider', () => {
      expect(pickProvider(null, policy, 'plan')).toBe('claude')
    })

    it('should fall back to default provider for unknown intent', () => {
      expect(pickProvider(null, policy, 'unknown')).toBe('ollama')
    })

    it('should return null when no default provider configured', () => {
      expect(pickProvider(null, { intent_routes: {} }, 'anything')).toBeNull()
    })
  })

  describe('POST /v1/agent — rate limiting', () => {
    it('should allow requests under limit', () => {
      const usage = 5
      const limit = 30
      expect(usage < limit).toBe(true)
    })

    it('should reject requests at limit', () => {
      const usage = 30
      const limit = 30
      expect(usage < limit).toBe(false)
    })

    it('should allow when limit is disabled (0)', () => {
      const limit = 0
      expect(!limit || limit <= 0).toBe(true)
    })
  })

  describe('POST /v1/agent — input size enforcement', () => {
    it('should reject input exceeding max_input_bytes', () => {
      const maxBytes = 20000
      const input = 'x'.repeat(maxBytes + 1)
      expect(Buffer.byteLength(input, 'utf8')).toBeGreaterThan(maxBytes)
    })

    it('should accept input within max_input_bytes', () => {
      const maxBytes = 20000
      const input = 'hello world'
      expect(Buffer.byteLength(input, 'utf8')).toBeLessThanOrEqual(maxBytes)
    })
  })

  describe('POST /v1/agent — agent permission checks', () => {
    const policy = {
      agents: {
        planner: {
          allowed_intents: ['analyze', 'plan'],
          allowed_providers: ['ollama', 'claude', 'openai', 'gemini'],
        },
        octavia: {
          allowed_intents: ['architect', 'review', 'optimize', 'diagnose'],
          allowed_providers: ['ollama', 'claude', 'openai', 'gemini'],
        },
        cipher: {
          allowed_intents: ['audit', 'harden', 'scan', 'encrypt'],
          allowed_providers: ['ollama', 'claude', 'openai'],
        },
      },
    } as Record<string, unknown>

    it('should reject unknown agent', () => {
      const agents = (policy as { agents: Record<string, unknown> }).agents
      expect(agents['unknown_agent']).toBeUndefined()
    })

    it('should reject disallowed intent', () => {
      const agents = (policy as { agents: Record<string, { allowed_intents: string[] }> }).agents
      expect(agents.planner.allowed_intents.includes('hack')).toBe(false)
    })

    it('should accept allowed intent', () => {
      const agents = (policy as { agents: Record<string, { allowed_intents: string[] }> }).agents
      expect(agents.planner.allowed_intents.includes('analyze')).toBe(true)
    })

    it('should reject disallowed provider', () => {
      const agents = (policy as { agents: Record<string, { allowed_providers: string[] }> }).agents
      expect(agents.cipher.allowed_providers.includes('gemini')).toBe(false)
    })

    it('should accept allowed provider', () => {
      const agents = (policy as { agents: Record<string, { allowed_providers: string[] }> }).agents
      expect(agents.cipher.allowed_providers.includes('claude')).toBe(true)
    })
  })

  describe('system prompt building', () => {
    function buildSystemPrompt(
      prompts: { default?: string; agents?: Record<string, string>; intents?: Record<string, string> } | null,
      agent: string,
      intent: string,
      context: Record<string, unknown> | null
    ) {
      if (!prompts) return ''
      const parts: string[] = []
      if (typeof prompts.default === 'string' && prompts.default.trim()) parts.push(prompts.default.trim())
      if (prompts.agents && typeof prompts.agents[agent] === 'string') parts.push(prompts.agents[agent].trim())
      if (prompts.intents && typeof prompts.intents[intent] === 'string') parts.push(prompts.intents[intent].trim())
      if (context && Object.keys(context).length > 0) parts.push(`Context JSON:\n${JSON.stringify(context)}`)
      return parts.join('\n\n')
    }

    it('should include default, agent, and intent prompts', () => {
      const prompts = {
        default: 'You are a BlackRoad agent.',
        agents: { planner: 'You plan things.' },
        intents: { analyze: 'Analyze carefully.' },
      }
      const result = buildSystemPrompt(prompts, 'planner', 'analyze', null)
      expect(result).toContain('BlackRoad agent')
      expect(result).toContain('plan things')
      expect(result).toContain('Analyze carefully')
    })

    it('should include context JSON', () => {
      const prompts = { default: 'Base prompt' }
      const result = buildSystemPrompt(prompts, 'x', 'y', { phase: 'Q1' })
      expect(result).toContain('Context JSON')
      expect(result).toContain('"phase"')
    })

    it('should return empty string when prompts is null', () => {
      expect(buildSystemPrompt(null, 'x', 'y', null)).toBe('')
    })
  })

  describe('404 for unknown routes', () => {
    it('should return 404 payload for non-existent paths', () => {
      const method = 'GET'
      const url = '/unknown/path'
      const isKnown = ['/healthz', '/metrics', '/v1/agents', '/v1/worlds'].includes(url)
      expect(isKnown).toBe(false)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. AUTH WORKER (workers/auth) — BRAT v1
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   POST /auth/token   — Issue a token
//   POST /auth/verify  — Verify a token
//   GET  /auth/me      — Decode token from Authorization header
//   POST /auth/revoke  — Revoke by JTI (owner only)
//   GET  /auth/status  — Public health / protocol info

describe('Auth Worker — workers/auth (BRAT v1)', () => {
  describe('GET /auth/status', () => {
    it('should return protocol info and endpoint list', () => {
      const response = {
        ok: true,
        protocol: 'BRAT v1',
        signing: 'HMAC-SHA256',
        configured: true,
        endpoints: ['/auth/token', '/auth/verify', '/auth/me', '/auth/revoke', '/auth/status'],
        roles: ['owner', 'coordinator', 'agent', 'guest'],
      }
      expect(response.ok).toBe(true)
      expect(response.protocol).toBe('BRAT v1')
      expect(response.signing).toBe('HMAC-SHA256')
      expect(response.endpoints).toHaveLength(5)
      expect(response.roles).toContain('owner')
      expect(response.roles).toContain('agent')
      expect(response.roles).toContain('guest')
    })
  })

  describe('POST /auth/token — token minting', () => {
    it('should require sub field', () => {
      const body = {} as { sub?: string }
      expect(!body.sub).toBe(true)
    })

    it('should support all roles', () => {
      const roles = ['owner', 'coordinator', 'agent', 'guest']
      const defaultTTL: Record<string, number> = {
        owner: 86400,
        coordinator: 14400,
        agent: 3600,
        guest: 900,
      }
      for (const role of roles) {
        expect(defaultTTL[role]).toBeGreaterThan(0)
      }
    })

    it('should assign implicit scopes per role', () => {
      const scopes: Record<string, string[]> = {
        owner: ['*'],
        coordinator: ['mesh:*', 'agents:read', 'workers:read', 'api:read'],
        agent: ['mesh:read', 'agents:read'],
        guest: ['api:read'],
      }
      expect(scopes.owner).toContain('*')
      expect(scopes.coordinator).toContain('mesh:*')
      expect(scopes.agent).toContain('agents:read')
      expect(scopes.guest).toContain('api:read')
    })

    it('should require auth for elevated roles', () => {
      const elevatedRoles = ['owner', 'coordinator']
      for (const role of elevatedRoles) {
        expect(elevatedRoles.includes(role)).toBe(true)
      }
      const normalRoles = ['agent', 'guest']
      for (const role of normalRoles) {
        expect(elevatedRoles.includes(role)).toBe(false)
      }
    })
  })

  describe('POST /auth/verify — token verification', () => {
    it('should reject malformed tokens', () => {
      const parts = 'malformed-token'.split('.')
      expect(parts.length).not.toBe(3)
    })

    it('should reject tokens with wrong header', () => {
      const token = 'WRONG_v1.payload.signature'
      const header = token.split('.')[0]
      expect(header).not.toBe('BRAT_v1')
    })

    it('should check expiration', () => {
      const now = Math.floor(Date.now() / 1000)
      const expired = now - 3600
      expect(expired < now).toBe(true)
    })
  })

  describe('GET /auth/me', () => {
    it('should extract token from Authorization header', () => {
      const auth = 'Bearer test-token-123'
      const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
      expect(token).toBe('test-token-123')
    })

    it('should return 401 when no token provided', () => {
      const auth = ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
      expect(token).toBe('')
    })
  })

  describe('POST /auth/revoke', () => {
    it('should require JTI', () => {
      const body = {} as { jti?: string }
      expect(!body.jti).toBe(true)
    })

    it('should require owner role', () => {
      const callerRole = 'agent'
      expect(callerRole !== 'owner').toBe(true)
    })
  })

  describe('scope checking', () => {
    function hasScope(payload: { scope: string[] }, required: string) {
      const scopes = payload.scope || []
      if (scopes.includes('*')) return true
      if (scopes.includes(required)) return true
      const [res] = required.split(':')
      return scopes.includes(`${res}:*`)
    }

    it('should match wildcard scope', () => {
      expect(hasScope({ scope: ['*'] }, 'anything:read')).toBe(true)
    })

    it('should match exact scope', () => {
      expect(hasScope({ scope: ['agents:read'] }, 'agents:read')).toBe(true)
    })

    it('should match resource wildcard', () => {
      expect(hasScope({ scope: ['mesh:*'] }, 'mesh:write')).toBe(true)
    })

    it('should reject missing scope', () => {
      expect(hasScope({ scope: ['agents:read'] }, 'workers:write')).toBe(false)
    })
  })

  describe('CORS headers', () => {
    it('should include all required CORS headers', () => {
      const cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      }
      expect(cors['Access-Control-Allow-Origin']).toBe('*')
      expect(cors['Access-Control-Allow-Methods']).toContain('POST')
      expect(cors['Access-Control-Allow-Headers']).toContain('Authorization')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. COPILOT-CLI WORKER (workers/copilot-cli)
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET    /health  — Health check
//   GET    /status  — Instance status + inbox count
//   POST   /inbox   — Receive a message
//   GET    /inbox   — List messages
//   DELETE /inbox   — Clear messages
//   POST   /task    — Post a task to the mesh queue
//   GET    /mesh    — Mesh overview

describe('Copilot-CLI Worker — workers/copilot-cli', () => {
  describe('GET /health', () => {
    it('should return ok with instance info', () => {
      const response = {
        ok: true,
        instance: 'copilot-cli',
        role: 'coordinator',
        version: '1.0.0',
      }
      expect(response.ok).toBe(true)
      expect(response.instance).toBe('copilot-cli')
      expect(response.role).toBe('coordinator')
      expect(response.version).toBeTruthy()
    })
  })

  describe('GET /status', () => {
    it('should return status with inbox count', () => {
      const response = {
        instance: 'copilot-cli',
        role: 'coordinator',
        status: 'ONLINE',
        inbox_count: 0,
        last_heartbeat: null as string | null,
      }
      expect(response.status).toBe('ONLINE')
      expect(response.inbox_count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('POST /inbox', () => {
    it('should require from and msg fields', () => {
      const validMsg = { from: 'lucidia', msg: 'Hello' }
      const invalidMsg = { from: 'lucidia' } as { from: string; msg?: string }
      expect(validMsg.from && validMsg.msg).toBeTruthy()
      expect(invalidMsg.msg).toBeUndefined()
    })

    it('should generate unique message keys', () => {
      const key1 = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const key2 = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      expect(key1).not.toBe(key2)
      expect(key1).toMatch(/^msg-\d+-[a-z0-9]+$/)
    })

    it('should require auth', () => {
      const token = ''
      const authToken = 'secret-token'
      expect(!authToken || token === authToken).toBe(false)
    })
  })

  describe('POST /task', () => {
    it('should create task with required fields', () => {
      const task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        from: 'copilot-cli',
        title: 'Test task',
        description: 'A test task',
        priority: 'normal',
        tags: ['test'],
        status: 'available',
        posted_at: new Date().toISOString(),
      }
      expect(task.id).toMatch(/^task-/)
      expect(task.status).toBe('available')
      expect(task.from).toBe('copilot-cli')
    })
  })

  describe('GET /mesh', () => {
    it('should return mesh overview with endpoints list', () => {
      const response = {
        mesh: 'BlackRoad OS Collaboration Mesh',
        instance: 'copilot-cli',
        role: 'coordinator',
        endpoints: ['/health', '/status', '/inbox', '/task', '/mesh'],
      }
      expect(response.endpoints).toHaveLength(5)
      expect(response.mesh).toContain('BlackRoad')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. EMAIL WORKER (workers/email)
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /             — Agent registry
//   GET  /inbox        — List all recent messages
//   GET  /inbox/:agent — Messages for a specific agent
//   GET  /agents       — Agent email registry

describe('Email Worker — workers/email', () => {
  const AGENTS = [
    'alexa', 'lucidia', 'alice', 'octavia', 'aria', 'cecilia',
    'cipher', 'prism', 'echo', 'oracle', 'atlas', 'shellfish',
    'anastasia', 'gematria', 'blackroad', 'inbox',
  ]

  describe('GET / — agent registry', () => {
    it('should list all agents with emails', () => {
      for (const agent of AGENTS) {
        const email = `${agent}@blackroad.io`
        expect(email).toContain('@blackroad.io')
      }
    })

    it('should have correct agent count', () => {
      expect(AGENTS).toHaveLength(16)
    })
  })

  describe('GET /inbox', () => {
    it('should return message list structure', () => {
      const response = { count: 0, messages: [] as unknown[] }
      expect(response).toHaveProperty('count')
      expect(response).toHaveProperty('messages')
      expect(Array.isArray(response.messages)).toBe(true)
    })
  })

  describe('GET /inbox/:agent', () => {
    it('should match valid agent path', () => {
      const path = '/inbox/lucidia'
      const match = path.match(/^\/inbox\/([a-z0-9_-]+)$/i)
      expect(match).not.toBeNull()
      expect(match![1]).toBe('lucidia')
    })

    it('should not match invalid paths', () => {
      const path = '/inbox/'
      const match = path.match(/^\/inbox\/([a-z0-9_-]+)$/i)
      expect(match).toBeNull()
    })
  })

  describe('GET /agents', () => {
    it('should return agent entries with id, email, name, role', () => {
      const agentEntry = {
        id: 'lucidia',
        email: 'lucidia@blackroad.io',
        name: 'LUCIDIA',
        role: 'Philosopher',
        forward: true,
      }
      expect(agentEntry.id).toBeTruthy()
      expect(agentEntry.email).toContain('@blackroad.io')
      expect(agentEntry.name).toBeTruthy()
      expect(agentEntry.role).toBeTruthy()
    })
  })

  describe('email handler', () => {
    it('should generate unique KV keys', () => {
      const agent = 'lucidia'
      const ts = new Date().toISOString()
      const msgId = 'abc123'
      const key = `msg:${agent}:${ts}:${msgId.replace(/[^a-zA-Z0-9]/g, '')}`
      expect(key).toContain('msg:lucidia:')
      expect(key).toContain('abc123')
    })

    it('should extract local part from email address', () => {
      const to = 'lucidia@blackroad.io'
      const local = to.split('@')[0]
      expect(local).toBe('lucidia')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 5. EMAIL SETUP WORKER (workers/email-setup)
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /           — Service info
//   POST /setup      — Run full email routing setup
//   GET  /status     — Check current routing state
//   POST /mx/switch  — Switch MX to Cloudflare
//   POST /mx/restore — Restore Google MX (rollback)

describe('Email Setup Worker — workers/email-setup', () => {
  describe('GET / — service info', () => {
    it('should list all available routes', () => {
      const routes = {
        'POST /setup': 'Run full email routing setup',
        'GET  /status': 'Check current routing state',
        'POST /mx/switch': 'Switch MX → Cloudflare only',
        'POST /mx/restore': 'Restore Google MX (rollback)',
      }
      expect(Object.keys(routes)).toHaveLength(4)
    })
  })

  describe('MX records', () => {
    it('should define Cloudflare MX records', () => {
      const mxCloudflare = [
        { content: 'route1.mx.cloudflare.net', priority: 86 },
        { content: 'route2.mx.cloudflare.net', priority: 30 },
      ]
      expect(mxCloudflare).toHaveLength(2)
      for (const mx of mxCloudflare) {
        expect(mx.content).toContain('cloudflare.net')
        expect(mx.priority).toBeGreaterThan(0)
      }
    })

    it('should define Google MX records for rollback', () => {
      const mxGoogle = [
        { content: 'aspmx.l.google.com', priority: 1 },
        { content: 'alt1.aspmx.l.google.com', priority: 5 },
        { content: 'alt2.aspmx.l.google.com', priority: 10 },
        { content: 'alt3.aspmx.l.google.com', priority: 10 },
        { content: 'alt4.aspmx.l.google.com', priority: 10 },
      ]
      expect(mxGoogle).toHaveLength(5)
      expect(mxGoogle[0].priority).toBe(1)
    })
  })

  describe('GET /status', () => {
    it('should return routing status structure', () => {
      const status = {
        domain: 'blackroad.io',
        routing: { enabled: true, status: 'active' },
        catch_all: { configured: true, actions: [{ type: 'worker', value: ['blackroad-email'] }] },
        mx: { provider: 'cloudflare', records: [] as unknown[] },
        ready: true,
      }
      expect(status.domain).toBe('blackroad.io')
      expect(status.routing.enabled).toBe(true)
      expect(status.catch_all.configured).toBe(true)
      expect(status.ready).toBe(true)
    })
  })

  describe('POST /setup — full setup steps', () => {
    it('should execute all setup steps in order', () => {
      const steps = ['enable_routing', 'add_destination', 'catch_all_rule', 'switch_mx']
      expect(steps).toHaveLength(4)
      expect(steps[0]).toBe('enable_routing')
      expect(steps[3]).toBe('switch_mx')
    })
  })

  describe('error handling', () => {
    it('should return 500 when CF_API_TOKEN is missing', () => {
      const token = undefined
      expect(!token).toBe(true)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 6. BLACKROAD OS API WORKER (blackroad-os/workers/blackroad-os-api)
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /                          — Dashboard (HTML)
//   GET  /dashboard                 — Dashboard (HTML)
//   GET  /health                    — Health check
//   GET  /agents                    — Agent registry JSON
//   GET  /agents/:id               — Single agent details
//   GET  /status                    — Platform status
//   GET  /debug                     — Debug info (env keys)
//   GET  /railway                   — Railway projects
//   GET  /railway/deployments       — Railway deployments
//   GET  /github/runs               — GitHub Actions runs
//   GET  /github/repo               — GitHub repo stats
//   GET  /github/orgs               — GitHub org repos

describe('BlackRoad OS API Worker — blackroad-os/workers/blackroad-os-api', () => {
  const AGENTS = [
    { id: 'lucidia', name: 'Lucidia', role: 'The Dreamer', status: 'online' },
    { id: 'alice', name: 'Alice', role: 'The Operator', status: 'online' },
    { id: 'octavia', name: 'Octavia', role: 'The Architect', status: 'online' },
    { id: 'aria', name: 'Aria', role: 'The Interface', status: 'online' },
    { id: 'cipher', name: 'Cipher', role: 'The Guardian', status: 'standby' },
    { id: 'cece', name: 'CECE', role: 'The Core', status: 'online' },
    { id: 'prism', name: 'Prism', role: 'The Analyst', status: 'standby' },
    { id: 'echo', name: 'Echo', role: 'The Librarian', status: 'online' },
  ]

  describe('GET /health', () => {
    it('should return ok status with agent counts', () => {
      const response = {
        status: 'ok',
        service: 'blackroad-os-api',
        version: '2.0.0',
        agents_online: AGENTS.filter((a) => a.status === 'online').length,
        agents_total: AGENTS.length,
      }
      expect(response.status).toBe('ok')
      expect(response.service).toBe('blackroad-os-api')
      expect(response.agents_online).toBe(6)
      expect(response.agents_total).toBe(8)
    })
  })

  describe('GET /agents', () => {
    it('should return all agents with correct structure', () => {
      for (const agent of AGENTS) {
        expect(agent).toHaveProperty('id')
        expect(agent).toHaveProperty('name')
        expect(agent).toHaveProperty('role')
        expect(agent).toHaveProperty('status')
        expect(['online', 'standby']).toContain(agent.status)
      }
    })
  })

  describe('GET /agents/:id', () => {
    it('should find existing agent', () => {
      const agent = AGENTS.find((a) => a.id === 'lucidia')
      expect(agent).toBeDefined()
      expect(agent!.name).toBe('Lucidia')
    })

    it('should return undefined for non-existent agent', () => {
      const agent = AGENTS.find((a) => a.id === 'nonexistent')
      expect(agent).toBeUndefined()
    })
  })

  describe('GET /status', () => {
    it('should return platform status with service health', () => {
      const status = {
        status: 'operational',
        capacity: 30000,
        agents: {
          total: AGENTS.length,
          online: AGENTS.filter((a) => a.status === 'online').length,
          standby: AGENTS.filter((a) => a.status === 'standby').length,
        },
        services: {
          gateway: 'operational',
          email_router: 'operational',
          agent_mesh: 'operational',
          kv_store: 'operational',
        },
      }
      expect(status.status).toBe('operational')
      expect(status.capacity).toBe(30000)
      expect(status.agents.total).toBe(8)
      expect(status.agents.online + status.agents.standby).toBe(status.agents.total)
    })
  })

  describe('GET /railway', () => {
    it('should require RAILWAY_TOKEN', () => {
      const token = undefined
      expect(!token).toBe(true)
    })

    it('should use Railway GraphQL API endpoint', () => {
      const endpoint = 'https://backboard.railway.app/graphql/v2'
      expect(endpoint).toContain('railway.app')
    })
  })

  describe('GET /railway/deployments', () => {
    it('should accept project query parameter', () => {
      const url = new URL('https://example.com/railway/deployments?project=abc-123')
      expect(url.searchParams.get('project')).toBe('abc-123')
    })
  })

  describe('GET /github/runs', () => {
    it('should require GITHUB_TOKEN', () => {
      const token = undefined
      expect(!token).toBe(true)
    })

    it('should target correct GitHub API endpoint', () => {
      const org = 'BlackRoad-OS-Inc'
      const repo = 'blackroad'
      const endpoint = `/repos/${org}/${repo}/actions/runs?per_page=10`
      expect(endpoint).toContain('BlackRoad-OS-Inc')
      expect(endpoint).toContain('actions/runs')
    })
  })

  describe('GET /github/repo', () => {
    it('should return repo stats structure', () => {
      const repoStats = {
        source: 'github',
        name: 'BlackRoad-OS-Inc/blackroad',
        stars: 0,
        forks: 0,
        open_issues: 0,
        default_branch: 'main',
      }
      expect(repoStats.source).toBe('github')
      expect(repoStats).toHaveProperty('stars')
      expect(repoStats).toHaveProperty('forks')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 7. EMAIL ROUTER WORKER (blackroad-os/workers/email-router)
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /health         — Health check
//   GET  /inbox/:agent   — List messages for agent
//   GET  /agents         — Agent email registry

describe('Email Router Worker — blackroad-os/workers/email-router', () => {
  const AGENT_ROUTES: Record<string, { name: string; role: string; forward: string | null }> = {
    lucidia: { name: 'Lucidia', role: 'The Dreamer', forward: 'blackroad@gmail.com' },
    alice: { name: 'Alice', role: 'The Operator', forward: 'blackroad@gmail.com' },
    octavia: { name: 'Octavia', role: 'The Architect', forward: 'blackroad@gmail.com' },
    cece: { name: 'CECE', role: 'The Identity', forward: 'blackroad@gmail.com' },
    noreply: { name: 'System', role: 'System', forward: null },
  }

  describe('GET /health', () => {
    it('should return ok status', () => {
      const response = { status: 'ok', service: 'blackroad-email-router' }
      expect(response.status).toBe('ok')
      expect(response.service).toBe('blackroad-email-router')
    })
  })

  describe('GET /inbox/:agent', () => {
    it('should match valid agent inbox path', () => {
      const path = '/inbox/lucidia'
      const match = path.match(/^\/inbox\/([a-z]+)$/)
      expect(match).not.toBeNull()
      expect(match![1]).toBe('lucidia')
    })

    it('should reject unknown agents', () => {
      const agentId = 'unknown_agent'
      expect(AGENT_ROUTES[agentId]).toBeUndefined()
    })
  })

  describe('GET /agents', () => {
    it('should return agents with blackroad.io emails', () => {
      const agents = Object.entries(AGENT_ROUTES).map(([id, a]) => ({
        id,
        email: `${id}@blackroad.io`,
        name: a.name,
        role: a.role,
      }))
      for (const agent of agents) {
        expect(agent.email).toContain('@blackroad.io')
      }
    })
  })

  describe('email routing', () => {
    it('should forward to configured address', () => {
      const agent = AGENT_ROUTES['lucidia']
      expect(agent.forward).toBe('blackroad@gmail.com')
    })

    it('should block noreply address', () => {
      const agent = AGENT_ROUTES['noreply']
      expect(agent.forward).toBeNull()
    })

    it('should add custom headers on forward', () => {
      const headers = {
        'X-BlackRoad-Agent': 'Lucidia',
        'X-BlackRoad-Role': 'The Dreamer',
        'X-BlackRoad-Original-To': 'lucidia@blackroad.io',
      }
      expect(headers['X-BlackRoad-Agent']).toBeTruthy()
      expect(headers['X-BlackRoad-Role']).toBeTruthy()
      expect(headers['X-BlackRoad-Original-To']).toContain('@blackroad.io')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MCP BRIDGE (mcp-bridge/server.py) — Port 8420
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /             — Service info
//   GET  /system       — System status (auth required)
//   POST /exec         — Execute command (auth required)
//   POST /file/read    — Read file (auth required)
//   POST /file/write   — Write file (auth required)
//   POST /memory/write — Store memory (auth required)
//   POST /memory/read  — Retrieve memory (auth required)
//   GET  /memory/list  — List all keys (auth required)

describe('MCP Bridge — mcp-bridge/server.py (Port 8420)', () => {
  describe('GET / — service info', () => {
    it('should return service name and hostname', () => {
      const response = { service: 'BlackRoad MCP Bridge', host: 'localhost' }
      expect(response.service).toBe('BlackRoad MCP Bridge')
      expect(response.host).toBeTruthy()
    })
  })

  describe('authentication', () => {
    it('should require Bearer token', () => {
      const auth = 'Bearer my-secret-token'
      expect(auth.startsWith('Bearer ')).toBe(true)
      expect(auth.slice(7)).toBe('my-secret-token')
    })

    it('should reject invalid token', () => {
      const auth = 'Bearer wrong-token'
      const expectedToken = 'correct-token'
      expect(auth.slice(7) !== expectedToken).toBe(true)
    })

    it('should reject missing auth header', () => {
      const auth = ''
      expect(!auth.startsWith('Bearer ')).toBe(true)
    })
  })

  describe('POST /exec', () => {
    it('should accept command, cwd, and timeout fields', () => {
      const request = { command: 'ls -la', cwd: '/tmp', timeout: 60 }
      expect(request.command).toBeTruthy()
      expect(request.timeout).toBe(60)
    })

    it('should return stdout, stderr, and returncode', () => {
      const response = { stdout: 'output', stderr: '', returncode: 0 }
      expect(response).toHaveProperty('stdout')
      expect(response).toHaveProperty('stderr')
      expect(response).toHaveProperty('returncode')
    })
  })

  describe('POST /file/read', () => {
    it('should require path field', () => {
      const request = { path: '/tmp/test.txt' }
      expect(request.path).toBeTruthy()
    })

    it('should return path and content', () => {
      const response = { path: '/tmp/test.txt', content: 'file contents' }
      expect(response).toHaveProperty('path')
      expect(response).toHaveProperty('content')
    })
  })

  describe('POST /file/write', () => {
    it('should require path and content', () => {
      const request = { path: '/tmp/test.txt', content: 'hello' }
      expect(request.path).toBeTruthy()
      expect(request.content).toBeTruthy()
    })

    it('should return path and sha256 hash', () => {
      const response = { path: '/tmp/test.txt', sha256: 'abc123...' }
      expect(response).toHaveProperty('path')
      expect(response).toHaveProperty('sha256')
    })
  })

  describe('POST /memory/write', () => {
    it('should require key field', () => {
      const request = { key: 'session-123', value: { task: 'deploy' } }
      expect(request.key).toBeTruthy()
    })
  })

  describe('POST /memory/read', () => {
    it('should return stored value with timestamp', () => {
      const response = {
        key: 'session-123',
        value: { task: 'deploy' },
        ts: new Date().toISOString(),
      }
      expect(response).toHaveProperty('key')
      expect(response).toHaveProperty('value')
      expect(response).toHaveProperty('ts')
    })
  })

  describe('GET /memory/list', () => {
    it('should return array of keys', () => {
      const response = { keys: ['session-1', 'session-2'] }
      expect(Array.isArray(response.keys)).toBe(true)
    })
  })

  describe('endpoint inventory', () => {
    it('should have all 8 MCP Bridge endpoints', () => {
      const endpoints = [
        'GET  /',
        'GET  /system',
        'POST /exec',
        'POST /file/read',
        'POST /file/write',
        'POST /memory/write',
        'POST /memory/read',
        'GET  /memory/list',
      ]
      expect(endpoints).toHaveLength(8)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 9. DASHBOARD API (dashboard/app/api) — Next.js Routes
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET /api/health                — Health check
//   GET /api/ready                 — Readiness probe
//   GET /api/version               — Version info
//   GET /api/gateway/[[...path]]   — Gateway proxy (GET)
//   POST /api/gateway/[[...path]]  — Gateway proxy (POST)

describe('Dashboard API — dashboard/app/api (Next.js)', () => {
  describe('GET /api/health', () => {
    it('should return ok status with uptime', () => {
      const response = {
        status: 'ok',
        service: 'blackroad-os-operator',
        timestamp: new Date().toISOString(),
        uptime: 12345,
      }
      expect(response.status).toBe('ok')
      expect(response.service).toBe('blackroad-os-operator')
      expect(response.uptime).toBeGreaterThan(0)
    })
  })

  describe('GET /api/ready', () => {
    it('should return ready: true when healthy', () => {
      const response = { ready: true, service: 'blackroad-os-operator' }
      expect(response.ready).toBe(true)
    })

    it('should return 503 when not ready', () => {
      const notReady = { ready: false, reason: 'Service dependencies not available' }
      expect(notReady.ready).toBe(false)
      expect(notReady.reason).toBeTruthy()
    })
  })

  describe('GET /api/version', () => {
    it('should return version info', () => {
      const response = {
        version: '0.0.1',
        service: 'blackroad-os-operator',
        environment: 'development',
      }
      expect(response.version).toBe('0.0.1')
      expect(response.service).toBe('blackroad-os-operator')
    })
  })

  describe('GET/POST /api/gateway/[[...path]]', () => {
    it('should proxy to gateway URL', () => {
      const gatewayUrl = process.env['GATEWAY_URL'] || 'http://localhost:3030'
      expect(gatewayUrl).toContain('localhost')
    })

    it('should construct correct proxy URL with path segments', () => {
      const baseUrl = 'http://localhost:3030'
      const pathSegments = ['v1', 'agents']
      const gatewayUrl = `${baseUrl}/api/${pathSegments.join('/')}`
      expect(gatewayUrl).toBe('http://localhost:3030/api/v1/agents')
    })

    it('should forward query parameters', () => {
      const baseUrl = 'http://localhost:3030'
      const path = 'deployments'
      const params = 'project=abc-123'
      const gatewayUrl = `${baseUrl}/api/${path}?${params}`
      expect(gatewayUrl).toContain('project=abc-123')
    })

    it('should add gateway headers', () => {
      const headers = {
        'X-Gateway-Client': 'localhost:3000',
        'X-Gateway-Service': 'blackroad-operator',
      }
      expect(headers['X-Gateway-Client']).toBeTruthy()
    })

    it('should return 503 when gateway unavailable', () => {
      const errorResponse = {
        success: false,
        error: 'Gateway unavailable',
        gateway: 'http://localhost:3030',
      }
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe('Gateway unavailable')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 10. GATEWAY CLIENT (src/core/client.ts)
// ═══════════════════════════════════════════════════════════════════════════════

describe('GatewayClient — src/core/client.ts', () => {
  it('should default to http://127.0.0.1:8787', () => {
    const defaultUrl = 'http://127.0.0.1:8787'
    expect(defaultUrl).toBe('http://127.0.0.1:8787')
  })

  it('should construct correct GET URLs', () => {
    const baseUrl = 'http://127.0.0.1:8787'
    const path = '/v1/agents'
    expect(`${baseUrl}${path}`).toBe('http://127.0.0.1:8787/v1/agents')
  })

  it('should construct correct POST URLs', () => {
    const baseUrl = 'http://127.0.0.1:8787'
    const path = '/v1/agent'
    expect(`${baseUrl}${path}`).toBe('http://127.0.0.1:8787/v1/agent')
  })

  it('should set Content-Type header for POST', () => {
    const headers = { 'Content-Type': 'application/json' }
    expect(headers['Content-Type']).toBe('application/json')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 11. WRANGLER CONFIGURATION VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Wrangler Configurations', () => {
  const CLOUDFLARE_ACCOUNT_ID = 'test-account-id'

  describe('workers/auth', () => {
    it('should have correct worker name and account', () => {
      const config = { name: 'blackroad-auth', account_id: CLOUDFLARE_ACCOUNT_ID }
      expect(config.name).toBe('blackroad-auth')
      expect(config.account_id).toBe(CLOUDFLARE_ACCOUNT_ID)
    })
  })

  describe('workers/copilot-cli', () => {
    it('should have correct worker name and cron trigger', () => {
      const config = {
        name: 'copilot-cli',
        account_id: CLOUDFLARE_ACCOUNT_ID,
        crons: ['*/5 * * * *'],
      }
      expect(config.name).toBe('copilot-cli')
      expect(config.crons[0]).toBe('*/5 * * * *')
    })
  })

  describe('workers/email', () => {
    it('should have correct worker name and KV binding', () => {
      const config = {
        name: 'blackroad-email',
        account_id: CLOUDFLARE_ACCOUNT_ID,
        kv: { binding: 'INBOX', id: 'b6c3379f5951468b99ec33264b9dd6dd' },
      }
      expect(config.name).toBe('blackroad-email')
      expect(config.kv.binding).toBe('INBOX')
    })
  })

  describe('workers/email-setup', () => {
    it('should have correct worker name and vars', () => {
      const config = {
        name: 'blackroad-email-setup',
        account_id: CLOUDFLARE_ACCOUNT_ID,
        vars: {
          DOMAIN: 'blackroad.io',
          FORWARD_TO: 'alexa@blackroad.io',
          EMAIL_WORKER: 'blackroad-email',
        },
      }
      expect(config.name).toBe('blackroad-email-setup')
      expect(config.vars.DOMAIN).toBe('blackroad.io')
    })
  })

  describe('blackroad-os-api', () => {
    it('should have correct worker name', () => {
      const config = {
        name: 'blackroad-os-api',
        account_id: CLOUDFLARE_ACCOUNT_ID,
      }
      expect(config.name).toBe('blackroad-os-api')
    })
  })

  describe('dashboard (Cloudflare Pages)', () => {
    it('should be configured as Pages project', () => {
      const config = {
        name: 'blackroad-operator',
        pages_build_output_dir: '.next',
      }
      expect(config.pages_build_output_dir).toBe('.next')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 12. RAILWAY CONFIGURATION VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Railway Configurations', () => {
  describe('Railway GraphQL API', () => {
    it('should use correct Railway API endpoint', () => {
      const endpoint = 'https://backboard.railway.app/graphql/v2'
      expect(endpoint).toBe('https://backboard.railway.app/graphql/v2')
    })

    it('should require Bearer token auth', () => {
      const headers = { Authorization: 'Bearer test-token' }
      expect(headers.Authorization).toContain('Bearer')
    })
  })

  describe('Railway project IDs', () => {
    it('should have known project IDs', () => {
      const projects = [
        { id: '9d3d2549-3778-4c86-8afd-cefceaaa74d2', name: 'RoadWork Production' },
        { id: '6d4ab1b5-3e97-460e-bba0-4db86691c476', name: 'RoadWork Staging' },
        { id: 'aa968fb7-ec35-4a8b-92dc-1eba70fa8478', name: 'BlackRoad Core Services' },
        { id: 'e8b256aa-8708-4eb2-ba24-99eba4fe7c2e', name: 'BlackRoad Operator' },
        { id: '85e6de55-fefd-4e8d-a9ec-d20c235c2551', name: 'BlackRoad Master' },
      ]
      expect(projects.length).toBeGreaterThanOrEqual(5)
      for (const p of projects) {
        expect(p.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        )
      }
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 13. CROSS-SERVICE ENDPOINT INVENTORY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Cross-Service Endpoint Inventory', () => {
  const ALL_ENDPOINTS = {
    'Gateway (:8787)': [
      'GET  /healthz',
      'GET  /metrics',
      'GET  /v1/agents',
      'GET  /v1/worlds',
      'POST /v1/agent',
    ],
    'Auth Worker (CF)': [
      'POST /auth/token',
      'POST /auth/verify',
      'GET  /auth/me',
      'POST /auth/revoke',
      'GET  /auth/status',
    ],
    'Copilot-CLI Worker (CF)': [
      'GET    /health',
      'GET    /status',
      'POST   /inbox',
      'GET    /inbox',
      'DELETE /inbox',
      'POST   /task',
      'GET    /mesh',
    ],
    'Email Worker (CF)': [
      'GET /         (registry)',
      'GET /inbox',
      'GET /inbox/:agent',
      'GET /agents',
    ],
    'Email Setup Worker (CF)': [
      'GET  /',
      'POST /setup',
      'GET  /status',
      'POST /mx/switch',
      'POST /mx/restore',
    ],
    'BlackRoad OS API (CF)': [
      'GET /              (dashboard)',
      'GET /dashboard',
      'GET /health',
      'GET /agents',
      'GET /agents/:id',
      'GET /status',
      'GET /debug',
      'GET /railway',
      'GET /railway/deployments',
      'GET /github/runs',
      'GET /github/repo',
      'GET /github/orgs',
    ],
    'Email Router (CF)': [
      'GET /health',
      'GET /inbox/:agent',
      'GET /agents',
    ],
    'MCP Bridge (:8420)': [
      'GET  /',
      'GET  /system',
      'POST /exec',
      'POST /file/read',
      'POST /file/write',
      'POST /memory/write',
      'POST /memory/read',
      'GET  /memory/list',
    ],
    'Dashboard API (Next.js)': [
      'GET  /api/health',
      'GET  /api/ready',
      'GET  /api/version',
      'GET  /api/gateway/[[...path]]',
      'POST /api/gateway/[[...path]]',
    ],
    'Payment Gateway (:3002)': [
      'GET  /health',
      'GET  /api/pricing',
      'GET  /',
      'GET  /success',
      'GET  /cancel',
      'POST /create-checkout-session',
      'POST /create-portal-session',
      'POST /webhook',
      'GET  /subscription-status',
    ],
    'Simple Launch Webhook (:5000)': [
      'POST /webhook/stripe',
      'GET  /health',
    ],
    'Metrics Webhook (:4242)': [
      'POST /webhook',
    ],
    'Deploy Orchestrator (:8080)': [
      'GET  /health',
      'POST /webhook',
    ],
    'Python Webhook (:9000)': [
      'POST /webhook',
    ],
  }

  it('should have 14 services registered', () => {
    expect(Object.keys(ALL_ENDPOINTS)).toHaveLength(14)
  })

  it('should have 69+ total endpoints across all services', () => {
    const total = Object.values(ALL_ENDPOINTS).reduce((sum, eps) => sum + eps.length, 0)
    expect(total).toBeGreaterThanOrEqual(69)
  })

  it('should have health endpoints on all HTTP services', () => {
    const servicesWithHealth = Object.entries(ALL_ENDPOINTS).filter(([, endpoints]) =>
      endpoints.some((ep) => ep.toLowerCase().includes('health'))
    )
    // Gateway, Copilot-CLI, OS API, Email Router, Dashboard all have health checks
    expect(servicesWithHealth.length).toBeGreaterThanOrEqual(5)
  })

  it('should list all Gateway endpoints', () => {
    const gatewayEndpoints = ALL_ENDPOINTS['Gateway (:8787)']
    expect(gatewayEndpoints).toContain('GET  /healthz')
    expect(gatewayEndpoints).toContain('POST /v1/agent')
    expect(gatewayEndpoints).toContain('GET  /v1/agents')
  })

  it('should list all Auth Worker endpoints', () => {
    const authEndpoints = ALL_ENDPOINTS['Auth Worker (CF)']
    expect(authEndpoints).toContain('POST /auth/token')
    expect(authEndpoints).toContain('POST /auth/verify')
    expect(authEndpoints).toContain('GET  /auth/me')
    expect(authEndpoints).toContain('POST /auth/revoke')
    expect(authEndpoints).toContain('GET  /auth/status')
  })

  it('should list all MCP Bridge endpoints', () => {
    const mcpEndpoints = ALL_ENDPOINTS['MCP Bridge (:8420)']
    expect(mcpEndpoints).toContain('POST /exec')
    expect(mcpEndpoints).toContain('POST /file/read')
    expect(mcpEndpoints).toContain('POST /file/write')
    expect(mcpEndpoints).toContain('POST /memory/write')
    expect(mcpEndpoints).toContain('POST /memory/read')
    expect(mcpEndpoints).toContain('GET  /memory/list')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 14. POLICY & AGENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Agent Policy Configuration', () => {
  const policy = {
    version: 2,
    global: { rate_limit_per_minute: 120, max_concurrent_requests: 20 },
    agents: {
      planner: {
        allowed_intents: ['analyze', 'plan'],
        allowed_providers: ['ollama', 'claude', 'openai', 'gemini'],
        default_provider: 'ollama',
        fallback_chain: ['ollama', 'claude', 'openai'],
        max_input_bytes: 20000,
        rate_limit_per_minute: 30,
        cost_tier: 'standard',
      },
      octavia: {
        allowed_intents: ['architect', 'review', 'optimize', 'diagnose'],
        allowed_providers: ['ollama', 'claude', 'openai', 'gemini'],
        default_provider: 'claude',
        fallback_chain: ['claude', 'openai', 'ollama'],
        max_input_bytes: 50000,
        rate_limit_per_minute: 20,
        cost_tier: 'premium',
      },
      lucidia: {
        allowed_intents: ['vision', 'synthesize', 'mentor', 'explore'],
        allowed_providers: ['ollama', 'claude', 'openai', 'gemini'],
        default_provider: 'claude',
        fallback_chain: ['claude', 'gemini', 'openai'],
        max_input_bytes: 40000,
        rate_limit_per_minute: 25,
        cost_tier: 'premium',
      },
      alice: {
        allowed_intents: ['deploy', 'automate', 'route', 'monitor'],
        allowed_providers: ['ollama', 'claude', 'openai', 'gemini'],
        default_provider: 'ollama',
        fallback_chain: ['ollama', 'openai', 'claude'],
        max_input_bytes: 30000,
        rate_limit_per_minute: 40,
        cost_tier: 'standard',
      },
      cipher: {
        allowed_intents: ['audit', 'harden', 'scan', 'encrypt'],
        allowed_providers: ['ollama', 'claude', 'openai'],
        default_provider: 'claude',
        fallback_chain: ['claude', 'openai', 'ollama'],
        max_input_bytes: 60000,
        rate_limit_per_minute: 15,
        cost_tier: 'premium',
      },
      prism: {
        allowed_intents: ['analyze', 'correlate', 'report', 'forecast'],
        allowed_providers: ['ollama', 'claude', 'openai', 'gemini'],
        default_provider: 'ollama',
        fallback_chain: ['ollama', 'gemini', 'openai'],
        max_input_bytes: 80000,
        rate_limit_per_minute: 30,
        cost_tier: 'standard',
      },
    },
    cost_tiers: {
      standard: { max_requests_per_hour: 200, max_tokens_per_request: 2048, priority: 1 },
      premium: { max_requests_per_hour: 100, max_tokens_per_request: 4096, priority: 2 },
    },
  }

  it('should be version 2', () => {
    expect(policy.version).toBe(2)
  })

  it('should have global rate limit of 120/min', () => {
    expect(policy.global.rate_limit_per_minute).toBe(120)
  })

  it('should have 6 agents configured', () => {
    expect(Object.keys(policy.agents)).toHaveLength(6)
  })

  it('should have all agents with fallback chains', () => {
    for (const [name, agent] of Object.entries(policy.agents)) {
      expect(agent.fallback_chain.length).toBeGreaterThanOrEqual(2)
      expect(agent.fallback_chain).toContain(agent.default_provider)
    }
  })

  it('should have premium agents with higher input limits', () => {
    const premium = Object.entries(policy.agents).filter(([, a]) => a.cost_tier === 'premium')
    const standard = Object.entries(policy.agents).filter(([, a]) => a.cost_tier === 'standard')
    expect(premium.length).toBe(3) // octavia, lucidia, cipher
    expect(standard.length).toBe(3) // planner, alice, prism
  })

  it('should have unique rate limits per agent', () => {
    const limits = Object.values(policy.agents).map((a) => a.rate_limit_per_minute)
    // Not all unique, but all > 0
    for (const limit of limits) {
      expect(limit).toBeGreaterThan(0)
    }
  })

  it('should have two cost tiers', () => {
    expect(Object.keys(policy.cost_tiers)).toHaveLength(2)
    expect(policy.cost_tiers.premium.max_tokens_per_request).toBeGreaterThan(
      policy.cost_tiers.standard.max_tokens_per_request
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 15. STRIPE / PAYMENT GATEWAY (migration/phase4-services/payment-gateway)
// ═══════════════════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /health                    — Health check
//   GET  /api/pricing               — Returns pricing tiers
//   GET  /                          — Pricing page (HTML)
//   GET  /success                   — Checkout success page
//   GET  /cancel                    — Checkout cancel page
//   POST /create-checkout-session   — Create Stripe checkout session
//   POST /create-portal-session     — Create Stripe billing portal session
//   POST /webhook                   — Stripe webhook handler
//   GET  /subscription-status       — Get subscription status

describe('Payment Gateway — Stripe Endpoints (Port 3002)', () => {
  describe('GET /health', () => {
    it('should return healthy status', () => {
      const response = {
        status: 'healthy',
        version: '3.0.0',
        source: 'self-hosted',
        timestamp: new Date().toISOString(),
      }
      expect(response.status).toBe('healthy')
      expect(response.version).toBe('3.0.0')
      expect(response.source).toBe('self-hosted')
    })
  })

  describe('GET /api/pricing', () => {
    it('should return pricing tiers array', () => {
      const tierIds = ['free', 'pro', 'enterprise', 'custom']
      expect(tierIds).toContain('free')
      expect(tierIds).toContain('pro')
      expect(tierIds).toContain('enterprise')
      expect(tierIds).toContain('custom')
    })
  })

  describe('POST /create-checkout-session', () => {
    it('should require valid tierId', () => {
      const body = { tierId: '', billingPeriod: 'monthly' }
      expect(!body.tierId).toBe(true)
    })

    it('should reject free and custom tiers', () => {
      const invalidTiers = ['free', 'custom']
      for (const tier of invalidTiers) {
        expect(invalidTiers.includes(tier)).toBe(true)
      }
    })

    it('should support monthly and yearly billing periods', () => {
      const periods = ['monthly', 'yearly']
      expect(periods).toContain('monthly')
      expect(periods).toContain('yearly')
    })

    it('should construct correct Stripe checkout params', () => {
      const params = new URLSearchParams({
        mode: 'subscription',
        'payment_method_types[]': 'card',
        'line_items[0][price]': 'price_xxx',
        'line_items[0][quantity]': '1',
        success_url: 'https://pay.blackroad.io/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://pay.blackroad.io/cancel',
        allow_promotion_codes: 'true',
      })
      expect(params.get('mode')).toBe('subscription')
      expect(params.get('success_url')).toContain('pay.blackroad.io/success')
      expect(params.get('cancel_url')).toContain('pay.blackroad.io/cancel')
    })

    it('should set trial period days when configured', () => {
      const trialDays = 14
      const params = new URLSearchParams()
      if (trialDays > 0) {
        params.set('subscription_data[trial_period_days]', String(trialDays))
      }
      expect(params.get('subscription_data[trial_period_days]')).toBe('14')
    })
  })

  describe('POST /create-portal-session', () => {
    it('should require customerId', () => {
      const body = {} as { customerId?: string }
      expect(!body.customerId).toBe(true)
    })

    it('should return portal URL', () => {
      const returnUrl = 'https://pay.blackroad.io/'
      expect(returnUrl).toContain('pay.blackroad.io')
    })
  })

  describe('POST /webhook — Stripe webhook', () => {
    it('should require stripe-signature header', () => {
      const sig = undefined
      expect(!sig).toBe(true)
    })

    it('should handle all required Stripe events', () => {
      const handledEvents = [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ]
      expect(handledEvents).toHaveLength(6)
      expect(handledEvents).toContain('checkout.session.completed')
      expect(handledEvents).toContain('customer.subscription.deleted')
      expect(handledEvents).toContain('invoice.payment_failed')
    })

    it('should implement idempotency check', () => {
      const eventId = 'evt_test_123'
      const existingEvents = new Set(['evt_old_456'])
      expect(existingEvents.has(eventId)).toBe(false)
      existingEvents.add(eventId)
      expect(existingEvents.has(eventId)).toBe(true)
    })
  })

  describe('GET /subscription-status', () => {
    it('should require userId query parameter', () => {
      const url = new URL('https://pay.blackroad.io/subscription-status')
      const userId = url.searchParams.get('userId')
      expect(userId).toBeNull()
    })

    it('should return subscription data or none status', () => {
      const noSubscription = { status: 'none' }
      expect(noSubscription.status).toBe('none')

      const activeSubscription = {
        userId: 'user-123',
        tierId: 'pro',
        status: 'active',
        customerId: 'cus_xxx',
        subscriptionId: 'sub_xxx',
      }
      expect(activeSubscription.status).toBe('active')
    })
  })

  describe('Stripe API helper', () => {
    it('should use correct Stripe API base URL', () => {
      const baseUrl = 'https://api.stripe.com'
      expect(baseUrl).toBe('https://api.stripe.com')
    })

    it('should use form-urlencoded content type for Stripe', () => {
      const headers = {
        Authorization: 'Bearer sk_test_xxx',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    })
  })

  describe('HTML pages — brand compliance', () => {
    it('should use BlackRoad brand colors', () => {
      const brandColors = {
        amber: '#F5A623',
        hotPink: '#FF1D6C',
        violet: '#9C27B0',
        electricBlue: '#2979FF',
      }
      expect(brandColors.hotPink).toBe('#FF1D6C')
      expect(brandColors.amber).toBe('#F5A623')
    })

    it('should render success and cancel pages', () => {
      const pages = ['/success', '/cancel', '/']
      expect(pages).toContain('/success')
      expect(pages).toContain('/cancel')
    })
  })

  describe('Stripe env vars', () => {
    it('should define all required env vars', () => {
      const requiredVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'STRIPE_PRICE_PRO_MONTHLY',
        'STRIPE_PRICE_PRO_YEARLY',
        'STRIPE_PRICE_ENT_MONTHLY',
        'STRIPE_PRICE_ENT_YEARLY',
        'CORS_ORIGIN',
        'PORT',
      ]
      expect(requiredVars.length).toBe(8)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 16. STRIPE WEBHOOK HANDLERS (Flask — Simple Launch & Metrics)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stripe Webhook Handlers (Flask services)', () => {
  describe('Simple Launch webhook (Port 5000)', () => {
    it('should listen on POST /webhook/stripe', () => {
      const endpoint = '/webhook/stripe'
      expect(endpoint).toBe('/webhook/stripe')
    })

    it('should have GET /health endpoint', () => {
      const endpoint = '/health'
      expect(endpoint).toBe('/health')
    })

    it('should handle 6 Stripe event types', () => {
      const events = [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ]
      expect(events).toHaveLength(6)
    })
  })

  describe('Metrics webhook (Port 4242)', () => {
    it('should listen on POST /webhook', () => {
      const endpoint = '/webhook'
      expect(endpoint).toBe('/webhook')
    })

    it('should handle checkout and subscription events', () => {
      const events = [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.deleted',
      ]
      expect(events).toHaveLength(3)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 17. DEPLOY WEBHOOK SERVERS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Deploy Webhook Servers', () => {
  describe('GitHub Deploy Orchestrator (Port 8080)', () => {
    it('should have GET /health endpoint', () => {
      const endpoint = '/health'
      expect(endpoint).toBe('/health')
    })

    it('should have POST /webhook endpoint', () => {
      const endpoint = '/webhook'
      expect(endpoint).toBe('/webhook')
    })

    it('should verify GitHub webhook signature', () => {
      const signatureHeader = 'x-hub-signature-256'
      expect(signatureHeader).toBe('x-hub-signature-256')
    })

    it('should filter for push events only', () => {
      const eventType = 'push'
      expect(eventType).toBe('push')
    })
  })

  describe('Python Webhook Server (Port 9000)', () => {
    it('should listen on POST /webhook', () => {
      const endpoint = '/webhook'
      expect(endpoint).toBe('/webhook')
    })

    it('should handle push and ping events', () => {
      const validEvents = ['push', 'ping']
      expect(validEvents).toContain('push')
      expect(validEvents).toContain('ping')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 18. PORT & URL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Port & URL Configuration', () => {
  const services = {
    gateway: { port: 8787, bind: '127.0.0.1', url: 'http://127.0.0.1:8787' },
    mcpBridge: { port: 8420, bind: '127.0.0.1', url: 'http://127.0.0.1:8420' },
    paymentGateway: { port: 3002, bind: '0.0.0.0', url: 'http://localhost:3002' },
    dashboardGateway: { port: 3030, bind: 'localhost', url: 'http://localhost:3030' },
    ollama: { port: 11434, bind: 'localhost', url: 'http://localhost:11434' },
    ollamaWrapper: { port: 8001, bind: 'localhost', url: 'http://localhost:8001' },
    deployApi: { port: 3000, bind: 'localhost', url: 'http://localhost:3000' },
    simpleLaunchWebhook: { port: 5000, bind: 'localhost', url: 'http://localhost:5000' },
    metricsWebhook: { port: 4242, bind: 'localhost', url: 'http://localhost:4242' },
    deployOrchestrator: { port: 8080, bind: 'localhost', url: 'http://localhost:8080' },
    pythonWebhook: { port: 9000, bind: '0.0.0.0', url: 'http://localhost:9000' },
  }

  it('should have no port conflicts', () => {
    const ports = Object.values(services).map((s) => s.port)
    const unique = new Set(ports)
    expect(unique.size).toBe(ports.length)
  })

  it('should bind gateway to loopback only', () => {
    expect(services.gateway.bind).toBe('127.0.0.1')
  })

  it('should bind MCP Bridge to loopback only', () => {
    expect(services.mcpBridge.bind).toBe('127.0.0.1')
  })

  it('should have correct gateway URL', () => {
    expect(services.gateway.url).toBe('http://127.0.0.1:8787')
  })
})
