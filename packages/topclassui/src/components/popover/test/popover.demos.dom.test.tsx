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
  /** The title the popover is named by. */
  title: string
  /** Every control inside the open popup, by accessible name, in tab order. */
  controls: string[]
}

const PLACES = [
  'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
  'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
]

/** What each trigger of each demo opens, written out. */
const SHOWN: Record<string, Shown[]> = {
  'basic': [{ trigger: 'Share', title: 'Share this page', controls: ['Close', 'Copy link'] }],
  'hover': [{ trigger: 'Billing details', title: 'How billing works', controls: ['Read the guide'] }],
  'long-content': [{ trigger: 'Change log', title: 'Change log', controls: [] }],
  'modal': [{ trigger: 'Delete draft', title: 'Delete this draft?', controls: ['Close', 'Keep it', 'Delete'] }],
  'placements': PLACES.map((place) => ({ trigger: place, title: place, controls: [] })),
  'playground': [{ trigger: 'Share', title: 'Share this page', controls: ['Close', 'Copy link'] }],
  'rtl': [
    { trigger: 'مشاركة', title: 'مشاركة هذه الصفحة', controls: ['إغلاق'] },
    { trigger: 'التفاصيل', title: 'كيف تعمل الفوترة', controls: [] },
    { trigger: 'الإعدادات', title: 'إعدادات الإشعارات', controls: [] },
  ],
  // The open and flipped cells are inert pictures: the closed cell's is the one trigger.
  'states': [{ trigger: 'Share', title: 'Share this page', controls: [] }],
  'with-close': [{ trigger: 'Notifications', title: 'Notifications are paused', controls: ['Close'] }],
  'with-form': [{ trigger: 'Rename', title: 'Rename this project', controls: ['Name', 'Cancel', 'Save'] }],
}

/** What a screen reader announces for a control: its aria-label, its label element, or else its text. */
function nameOf(control: Element): string {
  const labelled = control.getAttribute('aria-label')
  if (labelled !== null) return labelled
  const label = control.id ? document.querySelector(`label[for="${control.id}"]`) : null
  return (label ?? control).textContent
}

/** Opens each popover of a demo in turn from its trigger, reads it, and closes it with Escape. A button
 * of the page that opens nothing, as the modal demo holds beside its trigger, is not one. A popover the
 * states strip draws open is closed by its own trigger's press, so it is opened by the next. */
async function shown(Demo: ComponentType): Promise<Shown[]> {
  render(<Demo />)
  const out: Shown[] = []
  const triggers = screen.getAllByRole('button').filter((button) => button.getAttribute('aria-haspopup') === 'dialog')
  for (const trigger of triggers) {
    if (trigger.getAttribute('aria-expanded') === 'true') await userEvent.click(trigger)
    await waitFor(() => { expect(trigger.getAttribute('aria-expanded')).toBe('false') })
    await userEvent.click(trigger)
    // The popup this trigger controls, by the id Base UI writes on it: never one already open beside it.
    const popup = await waitFor(() => {
      const found = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
      expect(found?.getAttribute('role')).toBe('dialog')
      return found as HTMLElement
    })
    out.push({
      trigger: trigger.textContent,
      title: popup.querySelector('h2')?.textContent ?? '',
      controls: [...popup.querySelectorAll('button, input, a')].map(nameOf),
    })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(popup.isConnected).toBe(false) })
  }
  return out
}

describe('every demo opens the popover its trigger names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(SHOWN).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: each trigger opens its popover, with its title and its controls`, async () => {
      const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
      expect(await shown(loaded.default), name).toEqual(SHOWN[name])
    })
  }
})

describe('what the demos show of the props', () => {
  /** Opens the popover of one trigger of a demo: the first, or the one with that label. */
  const openFirst = async (name: string, trigger?: string) => {
    const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
    render(<loaded.default />)
    await userEvent.click(trigger === undefined ? screen.getAllByRole('button')[0] as HTMLElement : screen.getByRole('button', { name: trigger }))
    return screen.findByRole('dialog')
  }

  it('long-content: sixty lines in one list, in a popup that writes no tabindex but its own', async () => {
    const popup = await openFirst('long-content')
    expect(popup.querySelectorAll('li')).toHaveLength(60)
    expect(popup.querySelector('li:last-child')?.textContent).toBe('Change 60: a fix that shipped this week.')
  })

  it('with-form: the popup stays a div with the dialog role, and one form inside it holds the field and the submit button', async () => {
    const popup = await openFirst('with-form')
    expect(popup.tagName).toBe('DIV')
    const form = popup.querySelector('form')
    expect(form?.parentElement).toBe(popup)
    expect(form?.getAttribute('role')).toBeNull()
    expect(form?.querySelector('input[name="name"]')).not.toBeNull()
    expect(form?.querySelector('button[type="submit"]')?.textContent).toBe('Save')
  })

  it('with-form: the first focus is in the field', async () => {
    const popup = await openFirst('with-form')
    await waitFor(() => { expect(document.activeElement).toBe(popup.querySelector('input[name="name"]')) })
  })

  // POPOVER-1. A submit nothing prevents is the browser's own: it reloads the page with ?name= on it.
  it('with-form: Save is handled by the form, which closes the popover instead of sending the page', async () => {
    const popup = await openFirst('with-form')
    const sent: boolean[] = []
    window.addEventListener('submit', (event) => { sent.push(event.defaultPrevented) }, { once: true })
    await userEvent.click(within(popup).getByRole('button', { name: 'Save' }))
    expect(sent).toEqual([true])
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  })

  it('with-close: the x sits in a row with the title, after it', async () => {
    const popup = await openFirst('with-close')
    const row = popup.firstElementChild
    expect([...(row?.children ?? [])].map((child) => child.tagName)).toEqual(['H2', 'BUTTON'])
    expect(row?.getAttribute('class')).toBe('flex items-start justify-between gap-2')
  })

  it('modal: its root is modal and it holds a close, the two things Base UI needs to keep the focus in', async () => {
    const popup = await openFirst('modal')
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(1)
    expect(popup.querySelectorAll('button[aria-label="Close"]')).toHaveLength(1)
  })

  it('basic: it is not modal, so no layer of Base UI covers the page', async () => {
    await openFirst('basic')
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
  })

  it('hover: its link is a Button rendered as an anchor, with the address it was given', async () => {
    const popup = await openFirst('hover')
    const link = popup.querySelector('a')
    expect(link?.getAttribute('href')).toBe('#billing')
    expect(link?.getAttribute('data-variant')).toBe('link')
  })

  it('placements: each popover reports the placement its trigger is named after', async () => {
    const popup = await openFirst('placements', 'end-top')
    expect(popup.getAttribute('data-placement')).toBe('end-top')
  })

  it('rtl: the positioner carries the direction and the language its portal would lose, and the popup writes neither', async () => {
    const popup = await openFirst('rtl')
    expect([popup.parentElement?.getAttribute('dir'), popup.parentElement?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
    expect([popup.hasAttribute('dir'), popup.hasAttribute('lang')]).toEqual([false, false])
    expect(popup.getAttribute('data-placement')).toBe('start')
  })
})

describe('the states strip, one cell per state the frame draws', () => {
  it('captions each cell by its title, and draws open and flipped as inert pictures, the panel below and above its trigger', async () => {
    const loaded = await import('../dummy/states.js') as { default: ComponentType }
    const { container } = render(<loaded.default />)
    const cells = [...(container.firstElementChild?.children ?? [])]
    expect(cells.map((cell) => cell.getAttribute('title'))).toEqual(['closed', 'open', 'flipped'])
    expect(screen.queryAllByRole('dialog')).toHaveLength(0)
    expect(cells[0]?.querySelector('button')?.getAttribute('aria-expanded')).toBe('false')
    const picture = (cell: Element | undefined) => {
      const box = cell?.firstElementChild
      return [box?.getAttribute('aria-hidden'), box?.hasAttribute('inert'), [...(box?.children ?? [])].map((part) => part.textContent), box?.className.includes('flex-col-reverse')]
    }
    expect([picture(cells[1]), picture(cells[2])]).toEqual([['true', true, ['Open', 'panel'], false], ['true', true, ['Open', 'panel'], true]])
  })
})
