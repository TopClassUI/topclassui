import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What End on every thumb of a demo, in document order, leaves: a live thumb at max, or at the thumb after it in a
 * range; a disabled slider keeps its default. In RTL End is still the maximum. */
const AFTER: Record<string, string[]> = {
  'basic': ['100'],
  'form': ['100'],
  'range': ['80', '100'],
  'rtl': ['100', '80', '100'],
  'show-value': ['100', '800', '1000'],
  'sizes': ['100', '100', '100', '100', '100'],
  'states': ['100', '100', '40', '70', '100'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const values = () => screen.getAllByRole('slider').map((input) => input.getAttribute('aria-valuenow'))

describe('every demo, hydrated, moves by the keyboard', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: End on each thumb takes the live ones to their end, and leaves a disabled one`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const thumb of screen.getAllByRole('slider')) {
        thumb.focus()
        await userEvent.keyboard('{End}')
      }
      expect(values(), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: volume=60, then volume=65 once ArrowRight is pressed', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['volume', '60']])
    screen.getByRole('slider', { name: 'Volume' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(sent()).toEqual([['volume', '65']])
  })
})
