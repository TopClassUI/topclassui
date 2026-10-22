import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab, so each must render on the server.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const BUTTONS: Record<string, string[]> = {
  'basic': ['Create project'],
  'high-priority': ['Pay now'],
  'long-content': ['One long word', 'Three tall toasts'],
  'many': ['Twenty messages', 'Close all'],
  'over-dialog': ['Open settings'],
  'playground': ['Show a toast'],
  'promise': ['Upload', 'Upload and fail'],
  'rtl': ['دعوة'],
  'states': [],
  'sticky': ['Go offline'],
  'tall-page': ['Go offline', 'Read about Install', 'Read about Usage', 'Read about Theming', 'Read about Questions'],
  'tones': ['Neutral', 'Primary', 'Success', 'Warning', 'Danger', 'Info'],
  'with-action': ['Archive'],
  'with-description': ['Invite'],
}

const load = async (name: string) => ((await import(`../dummy/${name}.tsx`)) as { default: ComponentType }).default

describe('the demos', () => {
  it('are the brief names, and the tall page of R-10.5-3', () => {
    expect(files).toEqual(Object.keys(BUTTONS).sort())
  })

  for (const [name, labels] of Object.entries(BUTTONS)) {
    it(`${name}: renders its buttons on the server, and no toast, which only a press adds`, async () => {
      const Demo = await load(name)
      const html = markup(<Demo />)
      const found = [...html.matchAll(/<span dir="auto" class="truncate min-w-0">([^<]*)<\/span>/g)].map((m) => m[1])
      expect(found).toEqual(labels)
      expect(html).not.toContain('role="region"')
    })
  }
})

describe('the states demo', () => {
  it('is the frame\'s strip: one captioned cell a state, drawn in place and never as a live region', async () => {
    const Demo = await load('states')
    const html = markup(<Demo />)
    expect([...html.matchAll(/<div role="group" aria-label="([^"]+)"/g)].map((m) => m[1]))
      .toEqual(['success', 'error', 'loading', 'stacked', 'entering', 'limited'])
    expect(html).not.toMatch(/role="(region|status|alert|dialog)"/)
  })
})

describe('the playground demo', () => {
  it('is the button alone by default, and with stage the button at the start beside a centred stage, its toast added only once mounted', async () => {
    const Demo = (await import('../dummy/playground.js')).default as ComponentType<{ stage?: boolean }>
    expect(markup(<Demo />)).toMatch(/^<button /)
    const staged = markup(<Demo stage />)
    expect(staged).toMatch(/^<div class="relative grid min-h-67.75 w-full place-items-center"><div class="absolute top-0 inset-s-0"><button /)
    expect(staged).toContain('<div class="relative isolate h-25 w-88 max-w-full">')
    expect(staged).not.toContain('Project created')
  })
})
