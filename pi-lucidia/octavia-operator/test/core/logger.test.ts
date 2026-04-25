// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../../src/core/logger.js'

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    delete process.env['DEBUG']
  })

  it('info() writes to console.log', () => {
    logger.info('test message')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0].join(' ')).toContain('test message')
  })

  it('success() writes to console.log', () => {
    logger.success('done')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0].join(' ')).toContain('done')
  })

  it('warn() writes to console.log', () => {
    logger.warn('careful')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0].join(' ')).toContain('careful')
  })

  it('error() writes to console.error', () => {
    logger.error('fail')
    expect(errorSpy).toHaveBeenCalledOnce()
    expect(errorSpy.mock.calls[0].join(' ')).toContain('fail')
  })

  it('debug() is silent when DEBUG is not set', () => {
    logger.debug('hidden')
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('debug() writes to console.log when DEBUG is set', () => {
    process.env['DEBUG'] = '1'
    logger.debug('visible')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0].join(' ')).toContain('visible')
  })
})
