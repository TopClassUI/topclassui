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
  'confirm': [{ trigger: 'Delete project', title: 'Delete this project?', controls: ['Close this dialog', 'Cancel', 'Delete'] }],
  'long-body': [{ trigger: 'Read the terms', title: 'Terms of service', controls: ['Close this dialog', 'Decline', 'Accept'] }],
  'long-content': [{
    trigger: 'Move to the archive',
    title: 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team',
    controls: ['Close this dialog', 'Keep it where it is', 'Move a copy and keep the original', 'Move everything to the archive'],
  }],
  'no-close-button': [{ trigger: 'What is new', title: 'Version 2.4', controls: ['Got it'] }],
  'rtl': [{ trigger: 'نشر', title: 'نشر التغييرات', controls: ['إغلاق هذا الحوار', 'إلغاء', 'انشر الآن'] }],
  'sizes': [
    { trigger: 'xs', title: 'Size xs', controls: ['Close this dialog', 'Done'] },
    { trigger: 'sm', title: 'Size sm', controls: ['Close this dialog', 'Done'] },
    { trigger: 'md', title: 'Size md', controls: ['Close this dialog', 'Done'] },
    { trigger: 'lg', title: 'Size lg', controls: ['Close this dialog', 'Done'] },
    { trigger: 'xl', title: 'Size xl', controls: ['Close this dialog', 'Done'] },
    { trigger: 'custom', title: 'Size custom', controls: ['Close this dialog', 'Done'] },
  ],
  'with-form': [{ trigger: 'Rename', title: 'Rename this project', controls: ['Close this dialog', 'Name', 'Cancel', 'Save'] }],
}

/** What a screen reader announces for a control: its aria-label, its label element, or else its text. */
function nameOf(control: Element): string {
  const labelled = control.getAttribute('aria-label')
  if (labelled !== null) return labelled
  const label = control.id ? document.querySelector(`label[for="${control.id}"]`) : null
  return (label ?? control).textContent
}

/** Opens each dialog of a demo in turn from its trigger, reads it, and closes it with Escape. */
async function shown(Demo: ComponentType): Promise<Shown[]> {
  render(<Demo />)
  const out: Shown[] = []
  const triggers = screen.getAllByRole('button')
  for (const trigger of triggers) {
    await userEvent.click(trigger)
    const popup = await screen.findByRole('dialog')
    out.push({
      trigger: trigger.textContent,
      title: popup.querySelector('h2')?.textContent ?? '',
      controls: [...popup.querySelectorAll('button, input')].map(nameOf),
    })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
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

describe('what the demos show of the props', () => {
  /** Opens the dialog of one trigger of a demo: the first, or the one with that label. */
  const openFirst = async (name: string, trigger?: string) => {
    const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
    render(<loaded.default />)
    await userEvent.click(trigger === undefined ? screen.getAllByRole('button')[0] as HTMLElement : screen.getByRole('button', { name: trigger }))
    return screen.findByRole('dialog')
  }

  it('confirm: a press outside leaves it open, because the root carries disablePointerDismissal', async () => {
    const popup = await openFirst('confirm')
    await userEvent.click(popup.parentElement?.previousElementSibling as Element)
    await new Promise((resolve) => { setTimeout(resolve, 30) })
    expect(popup.hasAttribute('data-open')).toBe(true)
  })

  it('basic: the same press closes it', async () => {
    const popup = await openFirst('basic')
    await userEvent.click(popup.parentElement?.previousElementSibling as Element)
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  })

  it('with-form: the popup stays a div with the dialog role, and one form inside it holds the field and the submit button', async () => {
    const popup = await openFirst('with-form')
    expect(popup.tagName).toBe('DIV')
    const form = popup.querySelector('form')
    expect(form?.parentElement).toBe(popup)
    expect(form?.getAttribute('class')).toBe('contents')
    expect(form?.getAttribute('role')).toBeNull()
    expect(form?.querySelector('input[name="name"]')).not.toBeNull()
    expect(form?.querySelector('button[type="submit"]')?.textContent).toBe('Save')
  })

  it('with-form: the first focus is in the field, not on the x', async () => {
    const popup = await openFirst('with-form')
    await waitFor(() => { expect(document.activeElement).toBe(popup.querySelector('input[name="name"]')) })
  })

  it('long-body: the body can take focus, so a keyboard reaches a text with no control in it', async () => {
    const popup = await openFirst('long-body')
    expect(popup.children[1]?.getAttribute('tabindex')).toBe('0')
    expect(popup.children[1]?.querySelectorAll('p')).toHaveLength(40)
  })

  it('rtl: the popup carries the language its portal would lose, and its viewport the direction', async () => {
    const popup = await openFirst('rtl')
    expect(popup.getAttribute('lang')).toBe('ar')
    expect(popup.parentElement?.getAttribute('dir')).toBe('rtl')
  })

  it('sizes: custom carries the width of its className and no width of ours', async () => {
    const popup = await openFirst('sizes', 'custom')
    expect(popup.getAttribute('data-size')).toBe('custom')
    expect((popup.getAttribute('class') ?? '').split(' ').filter((cls) => cls.startsWith('max-w-'))).toEqual(['max-w-3xl'])
  })
})
