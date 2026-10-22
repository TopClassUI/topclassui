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
  /** The trigger's label, which is also its accessible name and the name of its menu. */
  trigger: string
  /** Every row of the open menu as a screen reader names it, in order. */
  rows: string[]
}

const TWO = ['Rename', 'Duplicate']
const PLACES = [
  'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
  'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
]

/** What each menu trigger of each demo opens, written out. */
const SHOWN: Record<string, Shown[]> = {
  'basic': [{ trigger: 'Actions', rows: ['Profile Ctrl P', 'Settings', 'Duplicate', 'Rename', 'Delete Del'] }],
  'danger-item': [{ trigger: 'Project', rows: ['Move to archive', 'Delete project'] }],
  'data-driven': [{ trigger: 'Account', rows: ['Profile Ctrl P', 'Settings', 'Billing', 'Sign out'] }],
  'groups': [{ trigger: 'View', rows: ['Name', 'Last edited', 'Grid', 'Table'] }],
  'in-dialog': [{ trigger: 'Role', rows: ['Viewer', 'Editor', 'Owner'] }],
  'placements': PLACES.map((place) => ({ trigger: place, rows: TWO })),
  'playground': [{ trigger: 'Actions', rows: ['Profile Ctrl P', 'Settings', 'Duplicate', 'Delete Del'] }],
  'rtl': [
    { trigger: 'الإجراءات', rows: ['الملف الشخصي Ctrl P', 'الإعدادات', 'حذف'] },
    { trigger: 'المزيد', rows: ['نسخ الرابط', 'إعادة التسمية'] },
  ],
  'sixty-items': [{ trigger: 'Time zone', rows: Array.from({ length: 60 }, (_, index) => `Zone ${String(index + 1)}`) }],
  // The first press closes the two menus drawn open, as a press outside any menu does; then each opens from its trigger.
  'states': [
    { trigger: 'Actions', rows: ['Profile', 'Settings'] },
    { trigger: 'Actions', rows: ['Edit', 'Delete'] },
    { trigger: 'Actions', rows: ['Edit', 'Delete'] },
    { trigger: 'Actions', rows: ['Edit', 'Delete'] },
  ],
  'with-links': [{ trigger: 'Help', rows: ['Documentation', 'Changelog', 'Contact support', 'Status page'] }],
}

/** The name of a row: the text of each thing it holds, apart, as a browser computes it from boxes of their own. */
const nameOf = (row: Element) => [...row.children].map((child) => child.textContent).filter((text) => text !== '').join(' ')

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const menuTriggers = () => screen.getAllByRole('button', { hidden: true }).filter((button) => button.getAttribute('aria-haspopup') === 'menu')

/** Opens each menu of a demo in turn from its trigger, reads it, and closes it with Escape. */
async function shown(name: string): Promise<Shown[]> {
  const Demo = await load(name)
  render(<Demo />)
  // The menu of the in-dialog demo is inside a dialog, which has to be opened first.
  if (name === 'in-dialog') await userEvent.click(screen.getByRole('button', { name: 'Invite people' }))
  const out: Shown[] = []
  for (const trigger of menuTriggers()) {
    await userEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    out.push({ trigger: trigger.textContent, rows: [...menu.querySelectorAll('[role="menuitem"]')].map(nameOf) })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(screen.queryByRole('menu')).toBeNull() })
  }
  return out
}

describe('every demo opens the menu its trigger names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(SHOWN).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: each trigger opens its menu, with its rows in order`, async () => {
      expect(await shown(name), name).toEqual(SHOWN[name])
    })
  }
})

describe('what the demos show of the props', () => {
  /** Opens the menu of one trigger of a demo: the first, or the one with that label. */
  const openFirst = async (name: string, trigger?: string) => {
    const Demo = await load(name)
    render(<Demo />)
    await userEvent.click(trigger === undefined ? menuTriggers()[0] as HTMLElement : screen.getByRole('button', { name: trigger }))
    return screen.findByRole('menu')
  }
  const row = (name: string) => screen.getByRole('menuitem', { name })

  it('basic: an icon and a shortcut on the first row, a disabled row, one separator, and a danger row after it', async () => {
    const menu = await openFirst('basic')
    expect(row('Profile Ctrl P').querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(row('Rename').getAttribute('aria-disabled')).toBe('true')
    expect(menu.querySelectorAll('[role="separator"]')).toHaveLength(1)
    expect(row('Delete Del').getAttribute('data-tone')).toBe('danger')
    expect(row('Delete Del').previousElementSibling?.getAttribute('role')).toBe('separator')
  })

  it('danger-item: the destructive row says what it does, carries an icon, and sits under a line', async () => {
    await openFirst('danger-item')
    const danger = row('Delete project')
    expect(danger.getAttribute('data-tone')).toBe('danger')
    expect(danger.querySelector('svg')).not.toBeNull()
    expect(danger.previousElementSibling?.getAttribute('role')).toBe('separator')
  })

  it('data-driven: two links cloned from the link element, a disabled link that is no anchor, and an action under a line', async () => {
    const menu = await openFirst('data-driven')
    expect(screen.getByRole('group', { name: 'Account' }).parentElement).toBe(menu)
    for (const [name, href] of [['Profile Ctrl P', '#profile'], ['Settings', '#settings']] as const) {
      expect([row(name).tagName, row(name).getAttribute('href'), row(name).getAttribute('data-link')]).toEqual(['A', href, 'app'])
    }
    expect([row('Billing').tagName, row('Billing').getAttribute('aria-disabled'), row('Billing').hasAttribute('href')]).toEqual(['DIV', 'true', false])
    expect([row('Sign out').tagName, row('Sign out').getAttribute('data-tone')]).toEqual(['DIV', 'danger'])
    expect(row('Sign out').previousElementSibling?.getAttribute('role')).toBe('separator')
  })

  it('with-links: every row is an anchor with its address, one of them the element of render, one in a new tab', async () => {
    const menu = await openFirst('with-links')
    const links = [...menu.querySelectorAll('a')]
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#docs', '#changelog', '#support', 'https://example.com/status'])
    expect(links.map((link) => link.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem'])
    expect(links[2]?.getAttribute('data-link')).toBe('app')
    expect([links[3]?.getAttribute('target'), links[3]?.getAttribute('rel')]).toEqual(['_blank', 'noreferrer'])
  })

  it('groups: two groups, each named by its label, with one line between them', async () => {
    const menu = await openFirst('groups')
    expect(screen.getAllByRole('group').map((group) => group.getAttribute('aria-labelledby') === group.firstElementChild?.id)).toEqual([true, true])
    expect(screen.getByRole('group', { name: 'Sort by' }).querySelectorAll('[role="menuitem"]')).toHaveLength(2)
    expect(screen.getByRole('group', { name: 'Show as' }).querySelectorAll('[role="menuitem"]')).toHaveLength(2)
    expect([...menu.children].map((child) => child.getAttribute('role'))).toEqual(['group', 'separator', 'group'])
  })

  it('placements: each menu reports the placement its trigger is named after', async () => {
    expect((await openFirst('placements', 'end-top')).getAttribute('data-placement')).toBe('end-top')
  })

  it('sixty-items: sixty rows, every one of them mounted, in a menu that writes no tabindex but the one of Base UI', async () => {
    const menu = await openFirst('sixty-items')
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(60)
    expect(menu.getAttribute('tabindex')).toBe('-1')
  })

  it('rtl: the positioner carries the direction and the language its portal would lose, and the menu writes neither', async () => {
    const menu = await openFirst('rtl')
    expect([menu.parentElement?.getAttribute('dir'), menu.parentElement?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
    expect([menu.hasAttribute('dir'), menu.hasAttribute('lang')]).toEqual([false, false])
    expect(menu.getAttribute('data-placement')).toBe('bottom-start')
  })

  it('in-dialog: the menu opens outside the dialog, in a portal of its own, and one Escape leaves the dialog open', async () => {
    const Demo = await load('in-dialog')
    render(<Demo />)
    await userEvent.click(screen.getByRole('button', { name: 'Invite people' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Role' }))
    const menu = await screen.findByRole('menu')
    expect(dialog.contains(menu)).toBe(false)
    expect(menu.getAttribute('data-placement')).toBe('bottom-end')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(screen.queryByRole('menu')).toBeNull() })
    expect(dialog.hasAttribute('data-open')).toBe(true)
  })
})
