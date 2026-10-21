import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

interface Shown {
  /** The trigger's label, which is also its accessible name. */
  trigger: string
  /** The title the sheet is named by. */
  title: string
  /** Where the sheet stands, as its popup reports it. */
  placement: string
  /** Every control inside the open popup, by accessible name, in tab order. */
  controls: string[]
}

const X = 'Close this panel'
const COUNTRIES = [
  'Jordan', 'Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Lebanon', 'Iraq', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Yemen',
  'Sudan', 'Libya', 'Palestine', 'Syria', 'Mauritania', 'Somalia', 'Djibouti', 'Comoros', 'Turkey', 'Cyprus', 'Greece',
  'Italy',
]

/** What each trigger of each demo opens, written out. Every list ends with the x. */
const SHOWN: Record<string, Shown[]> = {
  'bottom': [{ trigger: 'Country', title: 'Choose a country', placement: 'bottom', controls: [...COUNTRIES, X] }],
  'end': [{ trigger: 'Filters', title: 'Filters', placement: 'end', controls: ['Reset', 'Apply', X] }],
  'long-body': [{ trigger: 'Activity', title: 'Activity', placement: 'end', controls: ['Mark all as read', 'Done', X] }],
  'long-content': [{
    trigger: 'Move to the archive',
    title: 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team',
    placement: 'end',
    controls: ['Keep it where it is', 'Move a copy and keep the original', 'Move everything to the archive', X],
  }],
  'non-modal': [{ trigger: 'Outline', title: 'Outline', placement: 'end', controls: ['Done', X] }],
  'playground': [{ trigger: 'Filters', title: 'Filters', placement: 'end', controls: ['Reset', 'Apply', X] }],
  'rtl': [
    { trigger: 'القائمة', title: 'تصفّح', placement: 'start', controls: ['إغلاق هذه اللوحة'] },
    { trigger: 'التصفية', title: 'عوامل التصفية', placement: 'end', controls: ['إعادة ضبط', 'تطبيق', 'إغلاق هذه اللوحة'] },
  ],
  'sizes': [
    { trigger: 'xs', title: 'Size xs', placement: 'end', controls: ['Done', X] },
    { trigger: 'sm', title: 'Size sm', placement: 'end', controls: ['Done', X] },
    { trigger: 'md', title: 'Size md', placement: 'end', controls: ['Done', X] },
    { trigger: 'lg', title: 'Size lg', placement: 'end', controls: ['Done', X] },
    { trigger: 'xl', title: 'Size xl', placement: 'end', controls: ['Done', X] },
    { trigger: 'custom', title: 'Size custom', placement: 'end', controls: ['Done', X] },
  ],
  'start': [{ trigger: 'Menu', title: 'Browse', placement: 'start', controls: ['Documentation', 'Components', 'Changelog', X] }],
  'top': [{ trigger: 'What is new', title: 'Version 2.4', placement: 'top', controls: ['Got it', X] }],
  'states': [{ trigger: 'Open', title: 'Opened', placement: 'end', controls: ['Done', X] }],
  'trap-focus': [{ trigger: 'Inspect', title: 'Inspector', placement: 'end', controls: ['Done', X] }],
  'with-form': [{ trigger: 'Invite', title: 'Invite a teammate', placement: 'bottom', controls: ['Name', 'Email', 'Cancel', 'Send', X] }],
}

/** What a screen reader announces for a control: its aria-label, its label element, or else its text. */
function nameOf(control: Element): string {
  const labelled = control.getAttribute('aria-label')
  if (labelled !== null) return labelled
  const label = control.id ? document.querySelector(`label[for="${control.id}"]`) : null
  return (label ?? control).textContent
}

/** Opens each sheet of a demo in turn from its trigger, reads it, and closes it with Escape. A button
 * of the page that opens nothing, as two demos hold beside their trigger, is not one; nor is a sheet
 * the states strip draws open in a cell, which is there before any press. */
async function shown(Demo: ComponentType): Promise<Shown[]> {
  render(<Demo />)
  const out: Shown[] = []
  const triggers = screen.getAllByRole('button').filter((button) => button.getAttribute('aria-haspopup') === 'dialog')
  for (const trigger of triggers) {
    await userEvent.click(trigger)
    // The sheet this trigger controls, by the id Base UI writes on it: never one already open beside it.
    const popup = await waitFor(() => {
      const found = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
      expect(found?.getAttribute('role')).toBe('dialog')
      return found as HTMLElement
    })
    out.push({
      trigger: trigger.textContent,
      title: popup.querySelector('h2')?.textContent ?? '',
      placement: popup.getAttribute('data-placement') ?? '',
      controls: [...popup.querySelectorAll('button, input, a')].map(nameOf),
    })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(popup.isConnected).toBe(false) })
  }
  return out
}

describe('every demo opens the sheet its trigger names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(SHOWN).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: each trigger opens its sheet, at its edge, with its title and its controls, the x last`, async () => {
      const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
      expect(await shown(loaded.default), name).toEqual(SHOWN[name])
    })
  }
})

describe('the states strip, one cell per state the frame draws', () => {
  it('captions each cell by its title, and draws the side, bottom, dragging and trapped sheets open inside their own cell', async () => {
    const loaded = await import('../dummy/states.js') as { default: ComponentType }
    const { container } = render(<loaded.default />)
    const cells = [...(container.firstElementChild?.children ?? [])]
    expect(cells.map((cell) => cell.getAttribute('title'))).toEqual(['closed', 'side sheet', 'bottom sheet', 'dragging', 'focus trapped'])
    const dialogs = await screen.findAllByRole('dialog')
    expect(dialogs.map((dialog) => [dialog.querySelector('h2')?.textContent, dialog.getAttribute('data-placement')]))
      .toEqual([['sheet', 'end'], ['sheet', 'bottom'], ['sheet', 'end'], ['sheet', 'end']])
    expect(dialogs.map((dialog) => cells.findIndex((cell) => cell.contains(dialog)))).toEqual([1, 2, 3, 4])
    expect(cells.map((cell) => cell.querySelectorAll(':scope > .bg-overlay').length)).toEqual([0, 1, 1, 1, 1])
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
    expect(dialogs.some((dialog) => dialog.contains(document.activeElement))).toBe(false)
    expect(within(cells[0] as HTMLElement).getByRole('button', { name: 'Open' }).getAttribute('aria-expanded')).toBe('false')
  })
})
