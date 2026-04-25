// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const exec = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const CLI = resolve(ROOT, 'src/bin/br.ts')

let server: Server
let port: number

function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.url === '/v1/health') {
    res.end(JSON.stringify({ status: 'healthy', version: '1.2.3', uptime: 9876 }))
    return
  }

  if (req.url === '/v1/agents') {
    res.end(
      JSON.stringify({
        agents: [
          { name: 'octavia', title: 'The Architect', role: 'systems' },
          { name: 'lucidia', title: 'The Dreamer', role: 'creative' },
          { name: 'alice', title: 'The Operator', role: 'devops' },
        ],
      }),
    )
    return
  }

  if (req.url === '/v1/invoke' && req.method === 'POST') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      const parsed = JSON.parse(body) as { agent: string; task: string }
      res.end(JSON.stringify({ content: `Agent ${parsed.agent} completed: ${parsed.task}` }))
    })
    return
  }

  res.statusCode = 404
  res.end(JSON.stringify({ error: 'not found' }))
}

function run(...args: string[]) {
  return exec('npx', ['tsx', CLI, ...args], {
    cwd: ROOT,
    env: { ...process.env, BLACKROAD_GATEWAY_URL: `http://127.0.0.1:${port}`, NO_COLOR: '1' },
    timeout: 15_000,
  })
}

describe('Gateway integration e2e', () => {
  beforeAll(async () => {
    server = createServer(handler)
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address()
        port = typeof addr === 'object' && addr ? addr.port : 0
        resolve()
      })
    })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  describe('status command', () => {
    it('should display gateway health and agent count', async () => {
      const { stdout } = await run('status')
      expect(stdout).toContain('healthy')
      expect(stdout).toContain('1.2.3')
      expect(stdout).toContain('9876')
      expect(stdout).toContain('3 registered')
    })
  })

  describe('agents command', () => {
    it('should display agents in table format', async () => {
      const { stdout } = await run('agents')
      expect(stdout).toContain('octavia')
      expect(stdout).toContain('lucidia')
      expect(stdout).toContain('alice')
      expect(stdout).toContain('The Architect')
      expect(stdout).toContain('The Dreamer')
      expect(stdout).toContain('The Operator')
    })

    it('should output JSON with --json flag', async () => {
      const { stdout } = await run('agents', '--json')
      const agents = JSON.parse(stdout) as Array<{ name: string }>
      expect(agents).toHaveLength(3)
      expect(agents[0].name).toBe('octavia')
      expect(agents[1].name).toBe('lucidia')
      expect(agents[2].name).toBe('alice')
    })
  })

  describe('invoke command', () => {
    it('should invoke an agent with a task', async () => {
      const { stdout } = await run('invoke', 'octavia', 'deploy the API')
      expect(stdout).toContain('Agent octavia completed: deploy the API')
    })
  })

  describe('gateway health command', () => {
    it('should show gateway is healthy', async () => {
      const { stdout } = await run('gateway', 'health')
      expect(stdout).toContain('healthy')
      expect(stdout).toContain('1.2.3')
    })
  })

  describe('gateway url command with mock', () => {
    it('should reflect the mock URL', async () => {
      const { stdout } = await run('gateway', 'url')
      expect(stdout.trim()).toBe(`http://127.0.0.1:${port}`)
    })
  })
})
