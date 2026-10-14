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
  'promise': ['Upload', 'Upload and fail'],
  'rtl': ['دعوة'],
  'sticky': ['Go offline'],
  'tones': ['Neutral', 'Primary', 'Success', 'Warning', 'Danger', 'Info'],
  'with-action': ['Archive'],
  'with-description': ['Invite'],
}

const load = async (name: string) => ((await import(`../dummy/${name}.tsx`)) as { default: ComponentType }).default

describe('the demos', () => {
  it('are the eleven the brief names', () => {
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
