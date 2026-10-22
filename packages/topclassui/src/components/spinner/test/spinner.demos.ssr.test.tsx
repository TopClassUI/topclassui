import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['custom-size', 'inherit-color', 'playground', 'rtl', 'sizes', 'stage', 'states', 'tones', 'with-text']

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders a spinner`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      const Demo = loaded.default
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      // Not toContain('<'): an empty div passes that, and only a spinner carries this class.
      expect(markup(<Demo />), file).toContain('animate-spin')
    })
  }
})

describe('each demo shows what its comment says', () => {
  const render = async (file: string) => {
    const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
    return markup(<loaded.default />)
  }
  const count = (html: string, needle: string) => html.split(needle).length - 1
  /** Whole class tokens, so forced-colors:text-current is not counted as text-current. */
  const countClass = (html: string, name: string) =>
    [...html.matchAll(/class="([^"]*)"/g)].filter((m) => (m[1] ?? '').split(/\s+/).includes(name)).length

  it('sizes holds the five steps, 16 to 40 px', async () => {
    const html = await render('sizes')
    for (const px of ['16', '20', '24', '32', '40']) expect(html, px).toContain(`width="${px}"`)
  })

  it('tones holds all six on-soft colours', async () => {
    const html = await render('tones')
    for (const tone of ['primary', 'neutral', 'success', 'warning', 'danger', 'info']) {
      expect(html, tone).toContain(`text-${tone}-on-soft`)
    }
  })

  it('custom-size leaves every spinner at 1em', async () => {
    const html = await render('custom-size')
    expect(count(html, 'width="1em"')).toBe(3)
  })

  it('with-text hides the spinner, because its text names the wait', async () => {
    const html = await render('with-text')
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('aria-label')
    expect(html).toContain('Building your preview')
  })

  it('inherit-color replaces the tone with the text colour on both spinners', async () => {
    const html = await render('inherit-color')
    expect(countClass(html, 'text-current')).toBe(2)
    expect(html).not.toContain('text-primary-on-soft')
  })

  it('rtl names three spinners in Arabic and hides the one beside its text', async () => {
    const html = await render('rtl')
    expect(count(html, 'aria-label="جارٍ التحميل"')).toBe(3)
    expect(count(html, 'aria-hidden="true"')).toBe(1)
    expect(html).not.toContain('aria-label="Loading"')
  })
})
