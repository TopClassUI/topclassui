import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'custom-size', 'range', 'rtl', 'sizes', 'tones']

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

/** Every meter's opening tag, so each one is checked rather than the first. */
const meters = (html: string) => [...html.matchAll(/<div [^>]*role="meter"[^>]*>/g)].map((m) => m[0])

describe('every demo renders on the server', () => {
  it('holds exactly the demos unit-5.md asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders a meter`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
      // Not toContain('<'): an empty div passes that.
      expect(meters(await render(file)).length, file).toBeGreaterThan(0)
    })

    it(`${file}.tsx names every meter, and every aria-labelledby points at text in the demo`, async () => {
      const html = await render(file)
      for (const tag of meters(html)) {
        const label = attr(tag, 'aria-label')
        const by = attr(tag, 'aria-labelledby')
        expect(label !== undefined || by !== undefined, `${file}: ${tag}`).toBe(true)
        if (label !== undefined) expect(label.trim(), file).not.toBe('')
        if (by !== undefined) expect(new RegExp(`id="${by}"[^>]*>[^<]+<`).test(html), `${file}: #${by}`).toBe(true)
      }
    })
  }
})

describe('the demos cover what unit-5.md asks for', () => {
  const all = async () => (await Promise.all(EXPECTED.map(render))).join('')

  it('shows every size and every tone', async () => {
    const html = await all()
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) expect(html, size).toContain(`data-size="${size}"`)
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info']) {
      expect(html, tone).toContain(`data-tone="${tone}"`)
    }
  })

  it('shows 512 of 1024 at half the track, with the reading said in units', async () => {
    const [tag = ''] = meters(await render('range'))
    expect([attr(tag, 'aria-valuemax'), attr(tag, 'aria-valuenow'), attr(tag, 'style'), attr(tag, 'aria-valuetext')])
      .toEqual(['1024', '512', '--tc-meter-value:50%', '512 GB of 1 TB'])
  })

  it('renders the right-to-left demo inside dir="rtl"', async () => {
    expect(await render('rtl')).toMatch(/^<div dir="rtl" lang="ar"/)
  })
})
