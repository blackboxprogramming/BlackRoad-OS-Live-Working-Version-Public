// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { createSpinner } from '../../src/core/spinner.js'

describe('createSpinner', () => {
  it('should return an ora spinner instance', () => {
    const spinner = createSpinner('Loading...')
    expect(spinner).toBeDefined()
    expect(typeof spinner.start).toBe('function')
    expect(typeof spinner.stop).toBe('function')
    expect(typeof spinner.succeed).toBe('function')
    expect(typeof spinner.fail).toBe('function')
  })

  it('should set the text', () => {
    const spinner = createSpinner('Testing')
    expect(spinner.text).toBe('Testing')
  })

  it('should use magenta color', () => {
    const spinner = createSpinner('Colored')
    expect(spinner.color).toBe('magenta')
  })
})
