// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { templates } from '../../src/bootstrap/templates.js'
import type { ProjectTemplate } from '../../src/bootstrap/templates.js'

describe('templates', () => {
  it('should export an array of templates', () => {
    expect(Array.isArray(templates)).toBe(true)
    expect(templates.length).toBeGreaterThan(0)
  })

  it('each template should have name, description, and files', () => {
    for (const t of templates) {
      expect(t.name).toBeTruthy()
      expect(t.description).toBeTruthy()
      expect(typeof t.files).toBe('object')
      expect(Object.keys(t.files).length).toBeGreaterThan(0)
    }
  })

  it('should include a worker template', () => {
    const worker = templates.find((t: ProjectTemplate) => t.name === 'worker')
    expect(worker).toBeDefined()
    expect(worker!.files['src/index.ts']).toBeDefined()
    expect(worker!.files['wrangler.toml']).toBeDefined()
  })

  it('should include an api template', () => {
    const api = templates.find((t: ProjectTemplate) => t.name === 'api')
    expect(api).toBeDefined()
    expect(api!.files['src/index.ts']).toContain('Hono')
  })

  it('all template files should contain copyright', () => {
    for (const t of templates) {
      for (const [filename, content] of Object.entries(t.files)) {
        if (filename.endsWith('.ts')) {
          expect(content).toContain('Copyright')
        }
      }
    }
  })
})
