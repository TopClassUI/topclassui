import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import LongLabel from '../dummy/long-label.js'
import Rtl from '../dummy/rtl.js'
import Sizes from '../dummy/sizes.js'
import Tones from '../dummy/tones.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['custom-size', 'long-label', 'rtl', 'sizes', 'tones', 'topics', 'with-icon']

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      const Demo = loaded.default
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      // Not toContain('<'): an empty div passes that, and only a tag wears data-tone on the chip radius.
      const html = markup(<Demo />)
      expect(html, file).toContain('rounded-chip')
      expect(html, file).toContain('data-tone=')
    })
  }

  it('shows all six tones in the tones demo', () => {
    const html = markup(<Tones />)
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info']) {
      expect(html, tone).toContain(`data-tone="${tone}"`)
    }
  })

  it('shows all five steps in the sizes demo', () => {
    const html = markup(<Sizes />)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(html, size).toContain(`data-size="${size}"`)
    }
  })

  it('puts the long label inside a narrow box, so the e2e pages have something to cut', () => {
    const html = markup(<LongLabel />)
    expect(html).toContain('data-narrow')
    expect(html).toContain('<span class="truncate min-w-0">Infrastructure, platform reliability')
  })

  it('sets the direction on the rtl demo itself', () => {
    expect(markup(<Rtl />)).toMatch(/^<div dir="rtl" lang="ar"/)
  })
})
