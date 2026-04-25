// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http'
import { GatewayClient } from '../../src/core/client.js'

let server: Server
let port: number

function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.url === '/v1/health' && req.method === 'GET') {
    res.end(JSON.stringify({ status: 'healthy', version: '2.0.0', uptime: 12345 }))
    return
  }

  if (req.url === '/v1/agents' && req.method === 'GET') {
    res.end(
      JSON.stringify({
        agents: [
          { name: 'cipher', title: 'The Hacker', role: 'security' },
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
      res.end(JSON.stringify({ content: `${parsed.agent}: ${parsed.task} done` }))
    })
    return
  }

  if (req.url === '/v1/error') {
    res.statusCode = 503
    res.end(JSON.stringify({ error: 'service unavailable' }))
    return
  }

  res.statusCode = 404
  res.end(JSON.stringify({ error: 'not found' }))
}

describe('GatewayClient integration e2e', () => {
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

  it('should GET /v1/health from real HTTP server', async () => {
    const client = new GatewayClient(`http://127.0.0.1:${port}`)
    const result = await client.get<{ status: string; version: string; uptime: number }>('/v1/health')
    expect(result.status).toBe('healthy')
    expect(result.version).toBe('2.0.0')
    expect(result.uptime).toBe(12345)
  })

  it('should GET /v1/agents from real HTTP server', async () => {
    const client = new GatewayClient(`http://127.0.0.1:${port}`)
    const result = await client.get<{ agents: Array<{ name: string }> }>('/v1/agents')
    expect(result.agents).toHaveLength(1)
    expect(result.agents[0].name).toBe('cipher')
  })

  it('should POST /v1/invoke to real HTTP server', async () => {
    const client = new GatewayClient(`http://127.0.0.1:${port}`)
    const result = await client.post<{ content: string }>('/v1/invoke', {
      agent: 'cipher',
      task: 'scan vulnerabilities',
    })
    expect(result.content).toBe('cipher: scan vulnerabilities done')
  })

  it('should throw on error status code from real server', async () => {
    const client = new GatewayClient(`http://127.0.0.1:${port}`)
    await expect(client.get('/v1/error')).rejects.toThrow('GET /v1/error failed: 503')
  })

  it('should throw on 404 from real server', async () => {
    const client = new GatewayClient(`http://127.0.0.1:${port}`)
    await expect(client.get('/v1/nonexistent')).rejects.toThrow('GET /v1/nonexistent failed: 404')
  })

  it('should fail when connecting to unreachable server', async () => {
    const client = new GatewayClient('http://127.0.0.1:1')
    await expect(client.get('/v1/health')).rejects.toThrow()
  })
})
