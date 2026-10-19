import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'grid', 'interactive', 'media', 'paragraphs', 'report', 'rtl', 'skeleton', 'states', 'with-actions']

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
      // Not toContain('<'): an empty div passes that, and a card and its skeleton both wear the box radius.
      expect(await render(file), file).toContain('rounded-box')
    })

    it(`${file}.tsx titles its cards with h2 and no other level, because the harness holds the h1`, async () => {
      const html = await render(file)
      expect(html, file).toContain('<h2>')
      expect(html.match(/<h[13-6][\s>]/g) ?? [], file).toEqual([])
    })
  }
})
