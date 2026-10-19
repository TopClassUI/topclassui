import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

interface Shown {
  /** The trigger's label, which is also its accessible name. */
  trigger: string
  /** The title the dialog is named by. */
  title: string
  /** Every control inside the open popup, by accessible name, in tab order. */
  controls: string[]
}

/** What each trigger of each demo opens, written out. */
const SHOWN: Record<string, Shown[]> = {
  'basic': [{ trigger: 'Publish', title: 'Publish changes', controls: ['Close this dialog', 'Cancel', 'Publish now'] }],
  'close-on-success': [{ trigger: 'Rename and close', title: 'Rename this project', controls: ['Close this dialog', 'Name', 'Cancel', 'Save'] }],
  'confirm': [{ trigger: 'Delete project', title: 'Delete this project?', controls: ['Close this dialog', 'Cancel', 'Delete'] }],
  'long-body': [{ trigger: 'Read the terms', title: 'Terms of service', controls: ['Close this dialog', 'Decline', 'Accept'] }],
  'long-content': [{
    trigger: 'Move to the archive',
    title: 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team',
    controls: ['Close this dialog', 'Keep it where it is', 'Move a copy and keep the original', 'Move everything to the archive'],
  }],
  'no-close-button': [{ trigger: 'What is new', title: 'Version 2.4', controls: ['Got it'] }],
  'non-modal': [{ trigger: 'Find and replace', title: 'Find and replace', controls: ['Close this dialog', 'Done'] }],
  'playground': [{ trigger: 'Publish', title: 'Publish changes', controls: ['Close this dialog', 'Cancel', 'Publish now'] }],
  'rtl': [{ trigger: 'نشر', title: 'نشر التغييرات', controls: ['إغلاق هذا الحوار', 'إلغاء', 'انشر الآن'] }],
  'sizes': [
    { trigger: 'xs', title: 'Size xs', controls: ['Close this dialog', 'Done'] },
    { trigger: 'sm', title: 'Size sm', controls: ['Close this dialog', 'Done'] },
    { trigger: 'md', title: 'Size md', controls: ['Close this dialog', 'Done'] },
    { trigger: 'lg', title: 'Size lg', controls: ['Close this dialog', 'Done'] },
    { trigger: 'xl', title: 'Size xl', controls: ['Close this dialog', 'Done'] },
    { trigger: 'custom', title: 'Size custom', controls: ['Close this dialog', 'Done'] },
  ],
  // The one trigger is the closed cell's: the other cells draw their dialogs open, with no trigger (dialog.states.dom.test).
  'states': [{ trigger: 'Open', title: 'Open', controls: ['Close this dialog', 'Done'] }],
  'trap-focus': [{ trigger: 'Inspect', title: 'Inspector', controls: ['Close this dialog', 'Done'] }],
  'with-form': [{ trigger: 'Rename', title: 'Rename this project', controls: ['Close this dialog', 'Name', 'Cancel', 'Save'] }],
  'with-tooltip': [{ trigger: 'Share', title: 'Share this project', controls: ['Close this dialog', 'Link', 'Copy link', 'Done'] }],
}

/** What a screen reader announces for a control: its aria-label, its label element, or else its text. */
function nameOf(control: Element): string {
  const labelled = control.getAttribute('aria-label')
  if (labelled !== null) return labelled
  const label = control.id ? document.querySelector(`label[for="${control.id}"]`) : null
  return (label ?? control).textContent
}

/** Opens each dialog of a demo in turn from its trigger, reads it, and closes it with Escape. A button
 * of the page that opens nothing, as two demos hold beside their trigger, is not one. */
async function shown(Demo: ComponentType): Promise<Shown[]> {
  render(<Demo />)
  const out: Shown[] = []
  const triggers = screen.getAllByRole('button').filter((button) => button.getAttribute('aria-haspopup') === 'dialog')
  for (const trigger of triggers) {
    await userEvent.click(trigger)
    const popup = await screen.findByRole('dialog')
    out.push({
      trigger: trigger.textContent,
      title: popup.querySelector('h2')?.textContent ?? '',
      controls: [...popup.querySelectorAll('button, input')].map(nameOf),
    })
    await userEvent.keyboard('{Escape}')
    // That dialog, not every one: the states demo draws three more open beside its trigger.
    await waitFor(() => { expect(popup.isConnected).toBe(false) })
  }
  return out
}

describe('every demo opens the dialog its trigger names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(SHOWN).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: each trigger opens its dialog, with its title and its controls`, async () => {
      const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
      expect(await shown(loaded.default), name).toEqual(SHOWN[name])
    })
  }
})
