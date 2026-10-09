import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = [
  'custom-size', 'file-row', 'indeterminate', 'labelled', 'rtl', 'sizes', 'tones', 'values',
]

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

/** Every progressbar's opening tag, so each one is checked rather than the first. */
const bars = (html: string) => [...html.matchAll(/<div [^>]*role="progressbar"[^>]*>/g)].map((m) => m[0])

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders a progressbar`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
      // Not toContain('<'): an empty div passes that.
      expect(bars(await render(file)).length, file).toBeGreaterThan(0)
    })

    it(`${file}.tsx names every progressbar, and every aria-labelledby points at text in the demo`, async () => {
      const html = await render(file)
      for (const tag of bars(html)) {
        const label = attr(tag, 'aria-label')
        const by = attr(tag, 'aria-labelledby')
        expect(label !== undefined || by !== undefined, `${file}: ${tag}`).toBe(true)
        if (label !== undefined) expect(label.trim(), file).not.toBe('')
        if (by !== undefined) expect(new RegExp(`id="${by}"[^>]*>[^<]+<`).test(html), `${file}: #${by}`).toBe(true)
      }
    })
  }
})

describe('the demos cover what PLAN 20 asks for', () => {
  const all = async () => (await Promise.all(EXPECTED.map(render))).join('')

  it('shows every size', async () => {
    const html = await all()
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) expect(html, size).toContain(`data-size="${size}"`)
  })

  it('shows every tone', async () => {
    const html = await all()
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info']) {
      expect(html, tone).toContain(`data-tone="${tone}"`)
    }
  })

  it('shows the empty, complete and indeterminate states', async () => {
    const html = await all()
    expect(html).toContain('aria-valuenow="0"')
    expect(html).toContain('data-complete=""')
    expect(html).toContain('data-indeterminate=""')
  })

  it('renders the right-to-left demo inside dir="rtl"', async () => {
    expect(await render('rtl')).toMatch(/^<div dir="rtl" lang="ar"/)
  })
})
