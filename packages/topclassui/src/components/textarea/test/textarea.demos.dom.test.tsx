import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What a typed "x" does to each textarea of each demo, in document order: taken, or refused by disabled, read-only or the cap. */
const AFTER: Record<string, string[]> = {
  'autosize': ['taken', 'taken'],
  'basic': ['taken'],
  'form': ['taken', 'taken'],
  'long-content': ['taken', 'taken', 'taken'],
  'playground': ['taken'],
  'row': ['taken', 'taken', 'taken', 'taken'],
  'rtl': ['taken', 'taken'],
  'show-count': ['taken', 'taken', 'refused', 'taken'],
  'sizes': ['taken', 'taken', 'taken', 'taken', 'taken'],
  'skeleton': ['taken', 'taken', 'taken', 'taken', 'taken', 'taken', 'taken'],
  'states': ['taken', 'taken', 'taken', 'refused', 'refused', 'taken', 'refused'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

describe('every demo, in the browser, does what its textareas name', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: typing reaches each live field and no disabled, read-only or full one`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      const found: string[] = []
      for (const field of screen.getAllByRole<HTMLTextAreaElement>('textbox')) {
        const before = field.value
        // A disabled field takes no pointer and no focus: the key then lands on whatever holds the focus.
        field.focus()
        field.setSelectionRange(before.length, before.length)
        await userEvent.keyboard('x')
        found.push(field.value === `${before}x` ? 'taken' : 'refused')
      }
      expect(found, name).toEqual(AFTER[name])
    })
  }
})
