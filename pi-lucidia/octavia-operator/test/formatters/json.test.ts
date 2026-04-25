// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { formatJson } from '../../src/formatters/json.js'

describe('formatJson', () => {
  it('should return a string', () => {
    const result = formatJson({ key: 'value' })
    expect(typeof result).toBe('string')
  })

  it('should preserve structure of simple objects', () => {
    const result = formatJson({ name: 'alice' })
    // The raw content should still be present (with ANSI color codes)
    expect(result).toContain('name')
    expect(result).toContain('alice')
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
    const result = formatJson({ data: null })
    expect(result).toContain('null')
  })

  it('should handle nested objects', () => {
    const result = formatJson({ outer: { inner: 'value' } })
    expect(result).toContain('outer')
    expect(result).toContain('inner')
    expect(result).toContain('value')
  })

  it('should handle arrays', () => {
    const result = formatJson({ items: [1, 2, 3] })
    expect(result).toContain('items')
    expect(result).toContain('1')
  })

  it('should handle empty object', () => {
    const result = formatJson({})
    expect(result).toBe('{}')
  })
})
