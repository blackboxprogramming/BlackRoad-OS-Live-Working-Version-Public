// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runPreflight } from '../../src/bootstrap/preflight.js'

describe('runPreflight', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should return true when node version is 22+', async () => {
    // Current test env is Node 22+, gateway will fail but that is a warn, not a failure
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    )
    const result = await runPreflight()
    expect(result).toBe(true)
    vi.unstubAllGlobals()
  })

  it('should succeed even when gateway is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    )
    const result = await runPreflight()
    expect(result).toBe(true)
    vi.unstubAllGlobals()
  })

  it('should succeed when gateway is reachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      }),
    )
    const result = await runPreflight()
    expect(result).toBe(true)
    vi.unstubAllGlobals()
  })
})
