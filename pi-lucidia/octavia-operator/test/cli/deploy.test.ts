// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi } from 'vitest'
import { deployCommand } from '../../src/cli/commands/deploy.js'

describe('deploy command', () => {
  it('should have name "deploy"', () => {
    expect(deployCommand.name()).toBe('deploy')
  })

  it('should have --env option defaulting to production', () => {
    const envOpt = deployCommand.options.find((o) => o.long === '--env')
    expect(envOpt).toBeDefined()
    expect(envOpt!.defaultValue).toBe('production')
  })

  it('should accept a service argument', () => {
    const args = deployCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].name()).toBe('service')
  })

  it('should have description', () => {
    expect(deployCommand.description()).toBe('Trigger a deployment')
  })
})
