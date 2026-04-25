// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { logsCommand } from '../../src/cli/commands/logs.js'

describe('logs command', () => {
  it('should have name "logs"', () => {
    expect(logsCommand.name()).toBe('logs')
  })

  it('should have -n option defaulting to 50', () => {
    const nOpt = logsCommand.options.find((o) => o.short === '-n')
    expect(nOpt).toBeDefined()
    expect(nOpt!.defaultValue).toBe('50')
  })

  it('should have description', () => {
    expect(logsCommand.description()).toBe('Tail gateway logs')
  })
})
