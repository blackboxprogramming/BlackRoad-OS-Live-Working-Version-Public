// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi } from 'vitest'
import { runSetup } from '../../src/bootstrap/setup.js'

describe('runSetup', () => {
  it('should run without errors when no gatewayUrl provided', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(() => runSetup()).not.toThrow()
  })

  it('should run without errors when gatewayUrl provided', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(() => runSetup('http://custom:9090')).not.toThrow()
  })

  it('should log success and config info', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    runSetup()
    const output = logSpy.mock.calls.flat().join(' ')
    expect(output).toContain('Configuration saved')
    expect(output).toContain('Gateway URL')
    expect(output).toContain('Default agent')
  })
})
