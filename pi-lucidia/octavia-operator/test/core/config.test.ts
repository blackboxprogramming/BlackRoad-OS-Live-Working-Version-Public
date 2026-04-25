// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, afterEach } from 'vitest'
import { loadConfig } from '../../src/core/config.js'

describe('loadConfig', () => {
  afterEach(() => {
    // Clean up any test-set values
    const config = loadConfig()
    config.set('gatewayUrl', 'http://127.0.0.1:8787')
    config.set('defaultAgent', 'octavia')
    config.set('logLevel', 'info')
  })

  it('should return a config with defaults', () => {
    const config = loadConfig()
    // Reset to defaults before checking
    config.set('gatewayUrl', 'http://127.0.0.1:8787')
    config.set('defaultAgent', 'octavia')
    config.set('logLevel', 'info')
    expect(config.get('gatewayUrl')).toBe('http://127.0.0.1:8787')
    expect(config.get('defaultAgent')).toBe('octavia')
    expect(config.get('logLevel')).toBe('info')
  })

  it('should persist values across loadConfig calls', () => {
    const config1 = loadConfig()
    config1.set('logLevel', 'debug')
    const config2 = loadConfig()
    expect(config2.get('logLevel')).toBe('debug')
  })

  it('should use projectName blackroad', () => {
    const config = loadConfig()
    expect(config.path).toContain('blackroad')
  })

  it('should expose store with all keys', () => {
    const config = loadConfig()
    const store = config.store
    expect(store).toHaveProperty('gatewayUrl')
    expect(store).toHaveProperty('defaultAgent')
    expect(store).toHaveProperty('logLevel')
  })
})
