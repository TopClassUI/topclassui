import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** The text each trigger's tooltip shows, in tab order, written out; null where none opens. */
const SHOWN: Record<string, (string | null)[]> = {
  'basic': ['Copy link'],
  'delays': ['Copy', 'Delete this row', 'Settings'],
  'disabled': [null],
  'long-label': [
    'Save this document and continue to the next step of the wizard',
    'quarterly-report-final-v2-reviewed-by-legal-and-finance.pdf',
  ],
  'placements': [
    'top-start', 'top', 'top-end',
    'start-top', 'start', 'start-bottom',
    'end-top', 'end', 'end-bottom',
    'bottom-start', 'bottom', 'bottom-end',
  ],
  'playground': ['Copy link'],
  'rtl': ['نسخ الرابط', 'حذف هذا الصف'],
  // The top and bottom cells are inert pictures a reader never meets: the hidden cell's is the one trigger.
  'states': ['Copy link'],
  'with-count': ['Delete 3 rows'],
}

/** What a screen reader announces for the trigger: its aria-label, or else its text. */
const nameOf = (button: HTMLElement) => button.getAttribute('aria-label') ?? button.textContent

/** Tabs to each trigger in turn and reads the open popup it is described by, if any: never one the
 * states strip draws open beside it. */
async function shown(Demo: ComponentType) {
  render(<Demo />)
  const out: { name: string | null; text: string | null }[] = []
  for (const button of screen.getAllByRole('button')) {
    await userEvent.tab()
    expect(document.activeElement).toBe(button)
    const described = document.getElementById(button.getAttribute('aria-describedby') ?? '')
    const open = described?.matches('[data-placement][data-open]') === true ? described : null
    out.push({ name: nameOf(button), text: open?.textContent ?? null })
  }
  return out
}

describe('every trigger in every demo names itself with the text its tooltip shows', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(SHOWN).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: each tooltip opens on focus with its own text`, async () => {
      const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
      const seen = await shown(loaded.default)
      expect(seen.map((s) => s.text), name).toEqual(SHOWN[name])
    })

    it(`${name}: the accessible name of each trigger is the text its tooltip shows`, async () => {
      const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
      for (const { name: label, text } of await shown(loaded.default)) {
        if (text !== null) expect(label, name).toBe(text)
        else expect(label, `${name}: a trigger with no tooltip still needs a name`).toBeTruthy()
      }
    })
  }
})

describe('the states strip, one cell per state the frame draws', () => {
  it('captions each cell by its title, and draws top and bottom as inert pictures of a tip, its arrow under it and over it', async () => {
    const loaded = await import('../dummy/states.js') as { default: ComponentType }
    const { container } = render(<loaded.default />)
    const cells = [...(container.firstElementChild?.children ?? [])]
    expect(cells.map((cell) => cell.getAttribute('title'))).toEqual(['hidden', 'top', 'bottom'])
    expect(screen.queryAllByRole('tooltip')).toHaveLength(0)
    const picture = (cell: Element | undefined) => {
      const tip = cell?.firstElementChild
      return [tip?.getAttribute('aria-hidden'), tip?.hasAttribute('inert'), tip?.textContent, tip?.firstElementChild?.className.includes('-top-1'), cell?.querySelectorAll('button').length]
    }
    expect([picture(cells[1]), picture(cells[2])]).toEqual([['true', true, 'Top', false, 0], ['true', true, 'Bottom', true, 0]])
    expect(screen.getByRole('button', { name: 'Copy link' }).hasAttribute('aria-describedby')).toBe(false)
  })
})
