// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { formatTable } from '../../src/formatters/table.js'

describe('formatTable', () => {
  it('should format headers and rows', () => {
    const result = formatTable(
      ['Name', 'Role'],
      [
        ['alice', 'ops'],
        ['octavia', 'arch'],
      ],
    )
    expect(result).toContain('Name')
    expect(result).toContain('alice')
    expect(result).toContain('octavia')
    expect(result).toContain('─')
  })

  it('should handle empty rows', () => {
    const result = formatTable(['A', 'B'], [])
    expect(result).toContain('A')
    expect(result).toContain('B')
  })

  it('should pad columns to max width', () => {
    const result = formatTable(['X'], [['short'], ['a much longer value']])
    const lines = result.split('\n')
    expect(lines[2].length).toBe(lines[3].length)
  })

  it('should use box-drawing characters for separators', () => {
    const result = formatTable(['A', 'B'], [['1', '2']])
    expect(result).toContain('┼')
    expect(result).toContain('│')
  })

  it('should handle missing cells gracefully', () => {
    const result = formatTable(['A', 'B', 'C'], [['1']])
    expect(result).toContain('A')
    // Should not throw on undefined cells
  })

  it('should produce correct number of lines', () => {
    const result = formatTable(
      ['H1'],
      [['r1'], ['r2'], ['r3']],
    )
    const lines = result.split('\n')
    // header + separator + 3 rows = 5 lines
    expect(lines).toHaveLength(5)
  })

  it('should handle single column', () => {
    const result = formatTable(['Only'], [['one'], ['two']])
    expect(result).not.toContain('│')
    expect(result).not.toContain('┼')
    expect(result).toContain('Only')
  })
})
