import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['beside-text', 'custom-size', 'media-object', 'playground', 'rows', 'rtl', 'states', 'variants']

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders a hidden, filled skeleton`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      const Demo = loaded.default
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      // Not toContain('<'): an empty div passes that, and every shape or row wears this fill.
      const out = markup(<Demo />)
      expect(out, file).toContain('bg-neutral-soft')
      expect(out, file).toContain('aria-hidden="true"')
    })
  }
})

describe('the demos show what they say', () => {
  it('variants draws all four shapes', async () => {
    const { default: Demo } = await import('../dummy/variants.js')
    const out = markup(<Demo />)
    for (const variant of ['text', 'circle', 'rect', 'card']) {
      expect(out, variant).toContain(`data-variant="${variant}"`)
    }
  })

  it('beside-text keeps each line of real text on one line, so only the Skeleton can mismatch', async () => {
    const { default: Demo } = await import('../dummy/beside-text.js')
    const out = markup(<Demo />)
    expect(out.match(/<span class="block truncate">/g)).toHaveLength(6)
    expect(out).not.toContain('<span class="block">')
  })

  it('rtl sets the direction on its own wrapper', async () => {
    const { default: Demo } = await import('../dummy/rtl.js')
    expect(markup(<Demo />)).toMatch(/^<div dir="rtl" lang="ar"/)
  })
})
