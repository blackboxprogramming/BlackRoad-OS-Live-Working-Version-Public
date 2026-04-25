// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { runPreflight } from '../../src/bootstrap/preflight.js'
import { templates } from '../../src/bootstrap/templates.js'

describe('preflight e2e', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should pass Node.js version check on Node 22+', async () => {
    // Gateway will be unreachable but preflight should still return true
    const result = await runPreflight()
    expect(result).toBe(true)
  })

  it('should succeed even when gateway is unreachable', async () => {
    // Simulate gateway being unreachable: fetch rejects with a connection error
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED')),
    )
    const result = await runPreflight()
    expect(result).toBe(true)
  })
})

describe('templates e2e', () => {
  it('should have at least two templates', () => {
    expect(templates.length).toBeGreaterThanOrEqual(2)
  })

  it('should have a worker template', () => {
    const worker = templates.find((t) => t.name === 'worker')
    expect(worker).toBeDefined()
    expect(worker!.description).toContain('Cloudflare Worker')
    expect(worker!.files).toHaveProperty('src/index.ts')
    expect(worker!.files).toHaveProperty('wrangler.toml')
  })

  it('should have an api template', () => {
    const api = templates.find((t) => t.name === 'api')
    expect(api).toBeDefined()
    expect(api!.description).toContain('Hono')
    expect(api!.files).toHaveProperty('src/index.ts')
    expect(api!.files).toHaveProperty('package.json')
  })

  it('should have valid file contents in worker template', () => {
    const worker = templates.find((t) => t.name === 'worker')!
    expect(worker.files['src/index.ts']).toContain('export default')
    expect(worker.files['wrangler.toml']).toContain('name =')
    expect(worker.files['wrangler.toml']).toContain('compatibility_date')
  })

  it('should have valid file contents in api template', () => {
    const api = templates.find((t) => t.name === 'api')!
    expect(api.files['src/index.ts']).toContain('Hono')
    const pkg = JSON.parse(api.files['package.json']) as { dependencies: Record<string, string> }
    expect(pkg.dependencies).toHaveProperty('hono')
  })
})
