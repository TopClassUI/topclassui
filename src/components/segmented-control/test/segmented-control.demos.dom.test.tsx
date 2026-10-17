import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What a click on every segment of a demo, in document order, leaves selected: in each track the last live segment; a
 * disabled or read-only track keeps its default, and a disabled segment is never picked. */
const AFTER: Record<string, string[]> = {
  'basic': ['Calendar'],
  'form': ['Calendar'],
  'full-width': ['Month'],
  'long-content': ['Shared with me'],
  'many': ['Notifications'],
  'rtl': ['تقويم'],
  'sizes': ['Off', 'Off', 'Off', 'Off', 'Off'],
  'skeleton': ['Month', 'Month', 'Month', 'Month', 'Month', 'Month'],
  'states': ['Invalid', 'Disabled, selected', 'Live', 'Read-only, selected'],
  'with-icons': ['System'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const selected = () => screen.getAllByRole('radio').filter((one) => one.getAttribute('aria-checked') === 'true').map((one) => one.textContent)

describe('every demo, in the browser, does what its segments name', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a click on each segment selects the live ones, and leaves a disabled or read-only one`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const control of screen.getAllByRole('radio')) await userEvent.click(control)
      expect(selected(), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: view=table, then view=board once Board is pressed', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['view', 'table']])
    await userEvent.click(screen.getByRole('radio', { name: 'Board' }))
    expect(sent()).toEqual([['view', 'board']])
  })
})
