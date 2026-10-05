import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

describe('every demo renders on the server', () => {
  it('finds the demo files, so an empty folder cannot pass', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      const Demo = loaded.default
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      expect(markup(<Demo />), file).toContain('<')
    })
  }
})
