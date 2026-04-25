// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const exec = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const CLI = resolve(ROOT, 'src/bin/br.ts')

function run(...args: string[]) {
  return exec('npx', ['tsx', CLI, ...args], {
    cwd: ROOT,
    env: { ...process.env, NO_COLOR: '1' },
    timeout: 15_000,
  })
}

function runExpectFail(...args: string[]) {
  return run(...args).then(
    () => {
      throw new Error('Expected command to fail')
    },
    (err: { stdout: string; stderr: string; code: number }) => err,
  )
}

describe('CLI e2e', () => {
  it('should print help with --help', async () => {
    const { stdout } = await run('--help')
    expect(stdout).toContain('BlackRoad OS operator CLI')
    expect(stdout).toContain('status')
    expect(stdout).toContain('agents')
    expect(stdout).toContain('deploy')
    expect(stdout).toContain('logs')
    expect(stdout).toContain('config')
    expect(stdout).toContain('gateway')
    expect(stdout).toContain('invoke')
    expect(stdout).toContain('init')
  })

  it('should print version with --version', async () => {
    const { stdout } = await run('--version')
    expect(stdout.trim()).toBe('0.1.0')
  })

  it('should fail on unknown command', async () => {
    const err = await runExpectFail('nonexistent-command')
    expect(err.stderr).toContain("unknown command 'nonexistent-command'")
  })

  describe('deploy command', () => {
    it('should show deploy message with default service', async () => {
      const { stdout } = await run('deploy')
      expect(stdout).toContain('Deploying all to production')
    })

    it('should accept service and --env flag', async () => {
      const { stdout } = await run('deploy', 'web', '--env', 'staging')
      expect(stdout).toContain('Deploying web to staging')
    })

    it('should show not-implemented warning', async () => {
      const { stdout } = await run('deploy')
      expect(stdout).toContain('not yet implemented')
    })
  })

  describe('logs command', () => {
    it('should show default 50 lines message', async () => {
      const { stdout } = await run('logs')
      expect(stdout).toContain('50')
    })

    it('should accept -n flag', async () => {
      const { stdout } = await run('logs', '-n', '100')
      expect(stdout).toContain('100')
    })

    it('should show not-implemented warning', async () => {
      const { stdout } = await run('logs')
      expect(stdout).toContain('not yet implemented')
    })
  })

  describe('init command', () => {
    it('should show default project name', async () => {
      const { stdout } = await run('init')
      expect(stdout).toContain('blackroad-project')
    })

    it('should accept custom project name', async () => {
      const { stdout } = await run('init', 'my-project')
      expect(stdout).toContain('my-project')
    })

    it('should show not-implemented warning', async () => {
      const { stdout } = await run('init')
      expect(stdout).toContain('not yet implemented')
    })
  })

  describe('gateway url command', () => {
    it('should print the default gateway URL', async () => {
      const { stdout } = await run('gateway', 'url')
      expect(stdout.trim()).toBe('http://127.0.0.1:8787')
    })

    it('should respect BLACKROAD_GATEWAY_URL env var', async () => {
      const { stdout } = await exec('npx', ['tsx', CLI, 'gateway', 'url'], {
        cwd: ROOT,
        env: { ...process.env, BLACKROAD_GATEWAY_URL: 'http://custom:9000', NO_COLOR: '1' },
        timeout: 15_000,
      })
      expect(stdout.trim()).toBe('http://custom:9000')
    })
  })

  describe('gateway help', () => {
    it('should show gateway subcommands', async () => {
      const { stdout } = await run('gateway', '--help')
      expect(stdout).toContain('health')
      expect(stdout).toContain('url')
    })
  })

  describe('deploy help', () => {
    it('should show deploy options', async () => {
      const { stdout } = await run('deploy', '--help')
      expect(stdout).toContain('--env')
      expect(stdout).toContain('environment')
    })
  })

  describe('agents help', () => {
    it('should show agents options', async () => {
      const { stdout } = await run('agents', '--help')
      expect(stdout).toContain('--json')
    })
  })
})
