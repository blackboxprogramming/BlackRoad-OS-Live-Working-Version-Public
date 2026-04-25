// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { initCommand } from '../../src/cli/commands/init.js'

describe('init command', () => {
  it('should have name "init"', () => {
    expect(initCommand.name()).toBe('init')
  })

  it('should accept an optional name argument', () => {
    const args = initCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(false)
  })

  it('should have description', () => {
    expect(initCommand.description()).toBe('Initialize a new BlackRoad project')
  })

  it('should have optional name argument called "name"', () => {
    expect(initCommand.registeredArguments[0].name()).toBe('name')
  })
})
