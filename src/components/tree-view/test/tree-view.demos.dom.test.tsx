import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What each tree has selected once Tab, End and Enter have been pressed in it: the last visible row, or nothing for a
 * tree with no rows. Written out, so the demo and the expectation cannot drift. */
const AFTER: Record<string, (string | null)[]> = {
  'basic': ['README.md'],
  'load-more': ['Folder 20'],
  'long-content': ['Item 60'],
  'rtl': ['ملاحظات.txt'],
  'selected': ['next.config.ts'],
  'skeleton': ['README.md'],
  'status': [],
  'ten-thousand': ['File 10000.ts'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const chosen = () => screen.queryAllByRole('tree').flatMap((tree) =>
  [...tree.querySelectorAll('[aria-selected="true"]')].map((row) => row.textContent))

describe('every demo, in the browser, does what its tree names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: Tab reaches the tree, End and Enter select its last visible row`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const tree of screen.queryAllByRole('tree')) {
        if (tree.tabIndex !== 0) continue
        act(() => { tree.focus() })
        await userEvent.keyboard('{End}')
        // happy-dom fires no scroll for a scrollTop set by script: the window moves to the last row on this one.
        act(() => { tree.dispatchEvent(new Event('scroll')) })
        await userEvent.keyboard('{Enter}')
      }
      expect(chosen(), name).toEqual(AFTER[name])
    })
  }
})
