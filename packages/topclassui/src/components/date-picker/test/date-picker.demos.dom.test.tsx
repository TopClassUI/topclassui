import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What each trigger shows once the last day of its month that can be chosen is clicked; a disabled one keeps its day.
 * Written out, so the demo and the expectation cannot drift together. */
const AFTER: Record<string, string[]> = {
  'basic': ['Sep 30, 2026'],
  'playground': ['Sep 30, 2026'],
  'form': ['Oct 31, 2026'],
  'in-field': ['Oct 31, 2026'],
  'limits': ['Oct 31, 2026'],
  'rtl': ['30/09/2026'.replaceAll('/', `${String.fromCodePoint(0x200f)}/`)],
  'sizes': ['Sep 30, 2026', 'Sep 30, 2026', 'Sep 30, 2026', 'Sep 30, 2026', 'Sep 30, 2026'],
  'states': ['Oct 31, 2026', 'Sep 30, 2026', 'Sep 30, 2026', 'Sep 22, 2026'],
  'week-start': ['Sep 30, 2026', 'Sep 30, 2026', '30 Sept 2026'],
}

afterEach(() => { vi.useRealTimers() })

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const triggers = () => screen.getAllByRole('button').filter((button) => button.getAttribute('aria-haspopup') === 'dialog')

describe('every demo, in the browser, does what its DatePicker names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a click on each trigger and then on the last day of its month chooses it, except where it is disabled`, async () => {
      // An empty one opens on today: 15 October 2026 here, whatever day the suite runs on.
      vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 15, 12) })
      const Demo = await load(name)
      render(<Demo />)
      for (const trigger of triggers()) {
        if ((trigger as HTMLButtonElement).disabled) continue
        await userEvent.click(trigger)
        const days = within(await screen.findByRole('grid')).getAllByRole('button')
        await userEvent.click(days.at(-1) as HTMLElement)
        await waitFor(() => { expect(trigger.getAttribute('aria-expanded')).toBe('false') })
      }
      expect(triggers().map((one) => one.querySelector('span[id]')?.textContent), name).toEqual(AFTER[name])
    })
  }
})
