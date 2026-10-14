import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { MenuItem } from '#shared/contracts/menu.js'
import { Button } from '#components/button/index.js'
import { DropdownMenu } from '../index.js'
import type { DropdownMenuProps } from '../types.js'

/** How Flight delivers an element built in a Server Component: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

const trigger = () => screen.getByRole('button', { name: 'Account' })
const row = (name: string) => screen.getByRole('menuitem', { name })
const closed = () => waitFor(() => { expect(screen.queryByRole('menu')).toBeNull() })

/** Renders the data-driven menu and opens it by a press on its trigger. */
async function open(items: readonly MenuItem[], props: Partial<DropdownMenuProps> = {}) {
  render(<DropdownMenu trigger={<Button variant="outline">Account</Button>} title="Account" items={items} {...props} />)
  await userEvent.click(trigger())
  return screen.findByRole('menu')
}

describe('what an item carries', () => {
  it('the icon before the label and the shortcut after it, on a link as on a row', async () => {
    await open([
      { id: 'profile', label: 'Profile', icon: <svg data-icon="user" />, shortcut: 'Ctrl P', href: '/profile' },
      { id: 'copy', label: 'Copy link', icon: <svg data-icon="copy" />, shortcut: 'Ctrl C', onSelect: vi.fn() },
    ])
    for (const [name, iconName, shortcut] of [['Profile Ctrl P', 'user', 'Ctrl P'], ['Copy link Ctrl C', 'copy', 'Ctrl C']] as const) {
      const children = [...row(name).children]
      expect(children).toHaveLength(3)
      expect(children[0]?.firstElementChild?.getAttribute('data-icon')).toBe(iconName)
      expect(children[2]?.textContent).toBe(shortcut)
    }
  })

  it('tone danger reaches the row, and an item with no tone is neutral', async () => {
    await open([
      { id: 'profile', label: 'Profile', href: '/profile' },
      { id: 'signout', label: 'Sign out', tone: 'danger', action: vi.fn() },
    ])
    expect(row('Profile').getAttribute('data-tone')).toBe('neutral')
    expect(row('Sign out').getAttribute('data-tone')).toBe('danger')
    expect(row('Sign out').className).toContain('text-danger-on-soft')
  })

  it('separatorBefore draws one line, directly above its item and nowhere else', async () => {
    const menu = await open([
      { id: 'profile', label: 'Profile', href: '/profile' },
      { id: 'settings', label: 'Settings', href: '/settings' },
      { id: 'signout', label: 'Sign out', separatorBefore: true, action: vi.fn() },
    ])
    expect(menu.querySelectorAll('[role="separator"]')).toHaveLength(1)
    expect(row('Sign out').previousElementSibling?.getAttribute('role')).toBe('separator')
    expect(row('Settings').previousElementSibling).toBe(row('Profile'))
  })

  it('a label past 100 characters is cut in the row, as the label of any row is', async () => {
    const long = `${'a'.repeat(100)}b`
    await open([{ id: 'one', label: 'One', onSelect: vi.fn() }, { id: 'long', label: long, onSelect: vi.fn() }])
    expect(screen.getAllByRole('menuitem')[1]?.textContent).toBe('a'.repeat(100))
  })
})

describe('a disabled item does nothing', () => {
  const disabled = (onSelect = vi.fn(), action = vi.fn()): MenuItem[] => [
    { id: 'on', label: 'Enabled', onSelect: vi.fn() },
    { id: 'select', label: 'Copy link', disabled: true, onSelect },
    { id: 'action', label: 'Sign out', disabled: true, action },
    { id: 'link', label: 'Billing', disabled: true, href: '/billing' },
  ]

  it('by a press: neither the handler nor the action is called, and the menu stays open', async () => {
    const [onSelect, action] = [vi.fn(), vi.fn()]
    const menu = await open(disabled(onSelect, action))
    for (const name of ['Copy link', 'Sign out', 'Billing']) await userEvent.click(row(name), { pointerEventsCheck: 0 })
    expect(onSelect).not.toHaveBeenCalled()
    expect(action).not.toHaveBeenCalled()
    expect(menu.hasAttribute('data-open')).toBe(true)
  })

  it('by Enter or by Space on each of them', async () => {
    const [onSelect, action] = [vi.fn(), vi.fn()]
    const menu = await open(disabled(onSelect, action))
    // The first arrow lands on the enabled row; each of the next three lands on a disabled one.
    await userEvent.keyboard('{ArrowDown}')
    for (let stop = 0; stop < 3; stop++) await userEvent.keyboard('{ArrowDown}{Enter} ')
    expect(document.activeElement?.textContent).toBe('Billing')
    expect(onSelect).not.toHaveBeenCalled()
    expect(action).not.toHaveBeenCalled()
    expect(menu.hasAttribute('data-open')).toBe(true)
  })

  // Base UI's link item has no disabled, so a disabled href item is not a link at all.
  it('a disabled href item is a row with no href: announced as unavailable, and nothing to follow', async () => {
    await open(disabled())
    expect(row('Billing').tagName).toBe('DIV')
    expect(row('Billing').hasAttribute('href')).toBe(false)
    expect(row('Billing').getAttribute('aria-disabled')).toBe('true')
  })
})

describe('the props beside the items', () => {
  const items: MenuItem[] = [{ id: 'profile', label: 'Profile', href: '/profile' }]

  it('the trigger is the element given, with its label inside', () => {
    render(<DropdownMenu trigger={<Button variant="outline">Account</Button>} title="Account" items={items} />)
    expect(trigger().getAttribute('data-variant')).toBe('outline')
    expect(trigger().innerHTML).toBe('<span class="truncate min-w-0">Account</span>')
  })

  it('a trigger Flight delivered in a lazy wrapper opens the menu just the same', async () => {
    render(<DropdownMenu trigger={lazy(Button({ children: 'Account' }))} title="Account" items={items} />)
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu')
    await userEvent.click(trigger())
    expect((await screen.findByRole('menu')).hasAttribute('data-open')).toBe(true)
  })

  it('placement and className reach the menu: bottom-start unless given', async () => {
    const menu = await open(items, { placement: 'top-end', className: 'max-w-96' })
    expect(menu.getAttribute('data-placement')).toBe('top-end')
    expect(menu.className).toContain('max-w-96')
  })

  it('defaults to bottom-start, the shared placement of a menu', async () => {
    expect((await open(items)).getAttribute('data-placement')).toBe('bottom-start')
  })

  it('defaultOpen opens it with no press, and onOpenChange hears each change', async () => {
    const onOpenChange = vi.fn()
    render(<DropdownMenu defaultOpen onOpenChange={onOpenChange} trigger={<Button>Account</Button>} title="Account" items={items} />)
    await screen.findByRole('menu')
    await userEvent.keyboard('{Escape}')
    await closed()
    expect(onOpenChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([false])
  })

  it('a controlled menu stays as open says', async () => {
    const onOpenChange = vi.fn()
    render(<DropdownMenu open={false} onOpenChange={onOpenChange} trigger={<Button>Account</Button>} title="Account" items={items} />)
    await userEvent.click(trigger())
    expect(onOpenChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([true])
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('with no items it is still a menu that opens: one group, named, and no row', async () => {
    const menu = await open([])
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(0)
    expect(screen.getByRole('group', { name: 'Account' })).toBeDefined()
  })
})
