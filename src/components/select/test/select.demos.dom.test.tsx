import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What each trigger shows once its last option has been clicked: a disabled Select keeps its value, a read-only one
 * too. Written out, so the demo and the expectation cannot drift together. */
const AFTER: Record<string, string[]> = {
  'basic': ['Saudi Arabia'],
  'form': ['Morocco'],
  'four-rows': ['December'],
  'long-content': ['Southern office'],
  'phase-4-form': ['Morocco'],
  'rtl': ['السعودية'],
  'sixty-items': ['Option 60'],
  'sizes': ['Team', 'Team', 'Team', 'Team', 'Team'],
  'skeleton': ['Team', 'Team', 'Team', 'Team', 'Team', 'Team'],
  'states': ['Team', 'Team', 'Pro', 'Team'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const shown = () => screen.getAllByRole('combobox').map((one) => one.textContent)

describe('every demo, in the browser, does what its Select names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a click on each trigger and then on its last option chooses it, except where it is disabled or read-only`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const trigger of screen.getAllByRole('combobox')) {
        if ((trigger as HTMLButtonElement).disabled) continue
        await userEvent.click(trigger)
        const options = await screen.findAllByRole('option')
        await userEvent.click(options.at(-1) as HTMLElement)
        await userEvent.keyboard('{Escape}')
        await waitFor(() => { expect(trigger.getAttribute('aria-expanded')).toBe('false') })
      }
      expect(shown(), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: country=jo, then country=eg once Egypt is chosen', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['country', 'jo']])
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'Egypt' }))
    expect(sent()).toEqual([['country', 'eg']])
  })
})
