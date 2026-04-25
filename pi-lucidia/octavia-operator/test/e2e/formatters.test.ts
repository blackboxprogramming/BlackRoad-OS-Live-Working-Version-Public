// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { formatJson } from '../../src/formatters/json.js'
import { formatTable } from '../../src/formatters/table.js'
import { brand } from '../../src/formatters/brand.js'

describe('formatJson e2e', () => {
  it('should format a simple object', () => {
    const result = formatJson({ name: 'octavia', role: 'architect' })
    expect(result).toContain('name')
    expect(result).toContain('octavia')
    expect(result).toContain('role')
    expect(result).toContain('architect')
  })

  it('should handle numbers', () => {
    const result = formatJson({ count: 42 })
    expect(result).toContain('count')
    expect(result).toContain('42')
  })

  it('should handle booleans', () => {
    const result = formatJson({ active: true, deleted: false })
    expect(result).toContain('true')
    expect(result).toContain('false')
  })

  it('should handle null values', () => {
    const result = formatJson({ value: null })
    expect(result).toContain('null')
  })

  it('should handle nested objects', () => {
    const result = formatJson({ agent: { name: 'lucidia', status: 'active' } })
    expect(result).toContain('agent')
    expect(result).toContain('lucidia')
    expect(result).toContain('active')
  })

  it('should handle arrays', () => {
    const result = formatJson({ items: ['a', 'b', 'c'] })
    expect(result).toContain('items')
    expect(result).toContain('"a"')
    expect(result).toContain('"b"')
    expect(result).toContain('"c"')
  })

  it('should handle empty object', () => {
    const result = formatJson({})
    expect(result).toBe('{}')
  })
})

describe('formatTable e2e', () => {
  it('should format a multi-column table with correct alignment', () => {
    const result = formatTable(
      ['Agent', 'Status', 'Tasks'],
      [
        ['octavia', 'active', '15'],
        ['lucidia', 'idle', '3'],
        ['alice', 'busy', '42'],
      ],
    )
    const lines = result.split('\n')
    // Header, separator, 3 data rows
    expect(lines).toHaveLength(5)
    // All data rows should be same width
    expect(lines[2].length).toBe(lines[3].length)
    expect(lines[3].length).toBe(lines[4].length)
    // Separator uses ┼ between columns
    expect(lines[1]).toContain('┼')
  })

  it('should handle single column', () => {
    const result = formatTable(['Name'], [['alpha'], ['beta']])
    expect(result).toContain('Name')
    expect(result).toContain('alpha')
    expect(result).toContain('beta')
  })

  it('should handle missing cells gracefully', () => {
    const result = formatTable(['A', 'B', 'C'], [['x']])
    expect(result).toContain('x')
    // Should not throw
  })
})

describe('brand e2e', () => {
  it('should produce a logo containing BlackRoad and OS', () => {
    const logo = brand.logo()
    // The logo includes styled text with BlackRoad and OS
    expect(logo).toContain('BlackRoad')
    expect(logo).toContain('OS')
    expect(logo.length).toBeGreaterThan(0)
  })

  it('should produce a header with the text centered between separators', () => {
    const header = brand.header('Dashboard')
    expect(header).toContain('Dashboard')
    // Should have separator lines (━)
    expect(header).toContain('━')
    const lines = header.split('\n')
    expect(lines.length).toBe(3)
  })

  it('should apply brand colors without throwing', () => {
    expect(() => brand.hotPink('test')).not.toThrow()
    expect(() => brand.amber('test')).not.toThrow()
    expect(() => brand.violet('test')).not.toThrow()
    expect(() => brand.electricBlue('test')).not.toThrow()
  })
})
