import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = [
  'basic', 'custom-icon', 'live-region', 'long-text', 'minimal', 'rich-content', 'rtl', 'tones',
  'variants', 'with-actions',
]

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders an alert`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      const Demo = loaded.default
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      // Not toContain('<'): an empty div passes that, and every alert carries data-variant.
      expect(markup(<Demo />), file).toMatch(/<div data-variant="(soft|solid|outline)" data-tone="/)
    })
  }

  it('shows all eighteen variant and tone cells in the tones demo', async () => {
    const { default: Demo } = await import('../dummy/tones.js') as { default: ComponentType }
    const cells = [...markup(<Demo />).matchAll(/data-variant="(\w+)" data-tone="(\w+)"/g)].map((m) => `${m[1] ?? ''}/${m[2] ?? ''}`)
    expect(cells).toEqual([
      'soft/primary', 'soft/neutral', 'soft/success', 'soft/warning', 'soft/danger', 'soft/info',
      'solid/primary', 'solid/neutral', 'solid/success', 'solid/warning', 'solid/danger', 'solid/info',
      'outline/primary', 'outline/neutral', 'outline/success', 'outline/warning', 'outline/danger', 'outline/info',
    ])
  })

  it('puts the actions only on soft alerts, where an unfilled Button keeps 4.5:1', async () => {
    for (const file of ['with-actions', 'rtl']) {
      const { default: Demo } = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
      const alerts = markup(<Demo />).split('<div data-variant=').slice(1)
      const withActions = alerts.filter((a) => a.includes('<div class="flex flex-wrap gap-2 pt-1">'))
      expect(withActions.length, file).toBeGreaterThan(0)
      expect(withActions.filter((a) => !a.startsWith('"soft"')), file).toEqual([])
    }
  })
})
