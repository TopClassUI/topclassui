import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What a click on every increase stepper of each demo leaves each field at, in document order: a disabled, a
 * read-only or a field at its max stays. */
const AFTER: Record<string, string[]> = {
  basic: ['3'],
  form: ['3'],
  limits: ['8', '2'],
  playground: ['3'],
  row: ['3', '1'],
  rtl: ['‎-4', '١٬٢٣٥٫٥'],
  sizes: ['13', '13', '13', '13', '13'],
  combined: ['0', '13', '12', '12', '99'],
  states: ['13', '13', '13', '99', '13', '12'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

describe('every demo, in the browser, does what its fields name', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a click on each increase stepper moves the live fields and leaves the others`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      const increase = screen.getAllByRole('button').filter((button) => /^(Increase|زيادة)$/.test(button.getAttribute('aria-label') ?? ''))
      for (const button of increase) await userEvent.click(button)
      expect(screen.getAllByRole('textbox').map((input) => (input as HTMLInputElement).value), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  it('form: guests=2, then guests=3', async () => {
    const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['guests', '2']])
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
    expect(sent()).toEqual([['guests', '3']])
  })
})
