// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { brand } from '../../src/formatters/brand.js'

describe('brand', () => {
  it('should have color functions', () => {
    expect(typeof brand.hotPink).toBe('function')
    expect(typeof brand.amber).toBe('function')
    expect(typeof brand.violet).toBe('function')
    expect(typeof brand.electricBlue).toBe('function')
  })

  it('should produce a logo string', () => {
    const logo = brand.logo()
    expect(logo).toBeTruthy()
    expect(typeof logo).toBe('string')
  })

  it('should produce a header string', () => {
    const header = brand.header('Test')
    expect(header).toContain('Test')
  })

  it('should include separator lines in header', () => {
    const header = brand.header('Dashboard')
    expect(header).toContain('━')
    expect(header).toContain('Dashboard')
    // Should have top and bottom separator
    const parts = header.split('\n')
    expect(parts).toHaveLength(3)
  })

  it('color functions should return strings', () => {
    expect(typeof brand.hotPink('text')).toBe('string')
    expect(typeof brand.amber('text')).toBe('string')
    expect(typeof brand.violet('text')).toBe('string')
    expect(typeof brand.electricBlue('text')).toBe('string')
  })

  it('logo should contain BlackRoad and OS', () => {
    const logo = brand.logo()
    // Even with ANSI codes, the words should be present
    expect(logo).toContain('BlackRoad')
    expect(logo).toContain('OS')
  })
})
