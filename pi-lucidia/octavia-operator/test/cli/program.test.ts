// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { program } from '../../src/cli/commands/index.js'

describe('CLI program', () => {
  it('should have name "br"', () => {
    expect(program.name()).toBe('br')
  })

  it('should have version 0.1.0', () => {
    expect(program.version()).toBe('0.1.0')
  })

  it('should have all expected commands registered', () => {
    const commandNames = program.commands.map((c) => c.name())
    expect(commandNames).toContain('status')
    expect(commandNames).toContain('agents')
    expect(commandNames).toContain('deploy')
    expect(commandNames).toContain('logs')
    expect(commandNames).toContain('config')
    expect(commandNames).toContain('gateway')
    expect(commandNames).toContain('invoke')
    expect(commandNames).toContain('init')
  })

  it('should have 9 commands', () => {
    expect(program.commands).toHaveLength(9)
  })

  it('gateway command should have subcommands', () => {
    const gw = program.commands.find((c) => c.name() === 'gateway')
    expect(gw).toBeDefined()
    const subNames = gw!.commands.map((c) => c.name())
    expect(subNames).toContain('health')
    expect(subNames).toContain('url')
  })
})
