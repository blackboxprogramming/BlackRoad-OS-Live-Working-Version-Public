// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GatewayClient } from '../../src/core/client.js'

describe('GatewayClient', () => {
  beforeEach(() => {
    delete process.env['BLACKROAD_GATEWAY_URL']
  })

  it('should use default base URL', () => {
    const client = new GatewayClient()
    expect(client.baseUrl).toBe('http://127.0.0.1:8787')
  })

  it('should accept custom base URL', () => {
    const client = new GatewayClient('http://custom:9999')
    expect(client.baseUrl).toBe('http://custom:9999')
  })

  it('should read BLACKROAD_GATEWAY_URL from env', () => {
    process.env['BLACKROAD_GATEWAY_URL'] = 'http://env:5555'
    const client = new GatewayClient()
    expect(client.baseUrl).toBe('http://env:5555')
  })

  it('should prefer explicit URL over env', () => {
    process.env['BLACKROAD_GATEWAY_URL'] = 'http://env:5555'
    const client = new GatewayClient('http://explicit:1234')
    expect(client.baseUrl).toBe('http://explicit:1234')
  })

  describe('get()', () => {
    it('should throw on non-ok response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Error' }),
      )
      const client = new GatewayClient()
      await expect(client.get('/v1/health')).rejects.toThrow(
        'GET /v1/health failed: 500 Error',
      )
      vi.unstubAllGlobals()
    })

    it('should return parsed JSON on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ status: 'healthy' }),
        }),
      )
      const client = new GatewayClient()
      const result = await client.get<{ status: string }>('/v1/health')
      expect(result.status).toBe('healthy')
      vi.unstubAllGlobals()
    })

    it('should call fetch with the correct URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      vi.stubGlobal('fetch', mockFetch)
      const client = new GatewayClient('http://test:8080')
      await client.get('/v1/agents')
      expect(mockFetch).toHaveBeenCalledWith('http://test:8080/v1/agents')
      vi.unstubAllGlobals()
    })

    it('should throw on 404', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }),
      )
      const client = new GatewayClient()
      await expect(client.get('/v1/missing')).rejects.toThrow(
        'GET /v1/missing failed: 404 Not Found',
      )
      vi.unstubAllGlobals()
    })
  })

  describe('post()', () => {
    it('should send POST with JSON body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      })
      vi.stubGlobal('fetch', mockFetch)
      const client = new GatewayClient('http://test:8080')
      await client.post('/v1/invoke', { agent: 'octavia', task: 'hello' })
      expect(mockFetch).toHaveBeenCalledWith('http://test:8080/v1/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'octavia', task: 'hello' }),
      })
      vi.unstubAllGlobals()
    })

    it('should throw on non-ok POST response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 422, statusText: 'Unprocessable' }),
      )
      const client = new GatewayClient()
      await expect(client.post('/v1/invoke', {})).rejects.toThrow(
        'POST /v1/invoke failed: 422 Unprocessable',
      )
      vi.unstubAllGlobals()
    })

    it('should return parsed JSON on POST success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ content: 'done' }),
        }),
      )
      const client = new GatewayClient()
      const result = await client.post<{ content: string }>('/v1/invoke', {})
      expect(result.content).toBe('done')
      vi.unstubAllGlobals()
    })
  })
})
