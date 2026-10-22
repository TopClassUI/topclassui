import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What a press on each box of each demo leaves it at, in document order: a disabled or read-only one stays, a mixed one stays mixed.
 * happy-dom sends a click on a box inside a wrapping label back into the box until the stack overflows, so `labelled` is pressed in
 * e2e/checkbox.spec.ts. */
const AFTER: Record<string, string[] | 'browser'> = {
  'basic': ['false', 'true'],
  'form': ['false', 'true'],
  'labelled': 'browser',
  'playground': ['false'],
  'rtl': ['false', 'true'],
  'sizes': ['false', 'false', 'false', 'false', 'false'],
  'combined': ['true', 'false', 'mixed', 'true', 'false', 'mixed', 'false', 'true', 'true'],
  'stage': ['true', 'false', 'mixed'],
  'states': ['true', 'false', 'mixed', 'true', 'true', 'false'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

describe('every demo, in the browser, does what its boxes name', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names.filter((demo) => AFTER[demo] !== 'browser')) {
    it(`${name}: a click on each box toggles the live ones and leaves a disabled or read-only one`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const control of screen.getAllByRole('checkbox')) await userEvent.click(control)
      expect(screen.getAllByRole('checkbox').map((control) => control.getAttribute('aria-checked')), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: terms=on and news=no, then news=yes once it is ticked and nothing for terms once it is not', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['terms', 'on'], ['news', 'no']])
    for (const control of screen.getAllByRole('checkbox')) await userEvent.click(control)
    expect(sent()).toEqual([['news', 'yes']])
  })
})

describe('labelled', () => {
  it('a click on the label that points at a box presses it once; the wrapping label is a browser test', async () => {
    const Demo = await load('labelled')
    render(<Demo />)
    const name = 'Named by a label that points at it'
    await userEvent.click(screen.getByText(name))
    expect(screen.getByRole('checkbox', { name }).getAttribute('aria-checked')).toBe('true')
  })
})
