import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Component, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { MenuItem } from '#shared/contracts/menu.js'
import { Button } from '#components/button/index.js'
import { DropdownMenu } from '../index.js'
import type { DropdownMenuProps } from '../types.js'

/** How Flight delivers an element built in a Server Component: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

/** A link of a framework, as an app passes it: its own href is a stand-in. */
const LINK = <a data-link="app" rel="next" href="" />

const trigger = () => screen.getByRole('button', { name: 'Account' })
const row = (name: string) => screen.getByRole('menuitem', { name })
const closed = () => waitFor(() => { expect(screen.queryByRole('menu')).toBeNull() })

/** Renders the data-driven menu and opens it by a press on its trigger. */
async function open(items: readonly MenuItem[], props: Partial<DropdownMenuProps> = {}) {
  render(<DropdownMenu trigger={<Button variant="outline">Account</Button>} title="Account" items={items} {...props} />)
  await userEvent.click(trigger())
  return screen.findByRole('menu')
}

describe('the three kinds of item map as written', () => {
  const items = (onSelect = vi.fn(), action = vi.fn()): MenuItem[] => [
    { id: 'profile', label: 'Profile', href: '/profile' },
    { id: 'copy', label: 'Copy link', onSelect },
    { id: 'signout', label: 'Sign out', action },
  ]

  it('an href item is a link item: an anchor with its href and the menuitem role', async () => {
    await open(items())
    expect(row('Profile').tagName).toBe('A')
    expect(row('Profile').getAttribute('href')).toBe('/profile')
    expect(row('Profile').getAttribute('role')).toBe('menuitem')
  })

  it('an onSelect item and an action item are rows that are no anchor and carry no href', async () => {
    await open(items())
    expect([row('Copy link').tagName, row('Sign out').tagName]).toEqual(['DIV', 'DIV'])
    expect([row('Copy link').hasAttribute('href'), row('Sign out').hasAttribute('href')]).toEqual([false, false])
  })

  it('renders the items in the order given, inside one group named by the title', async () => {
    const menu = await open(items())
    const group = screen.getByRole('group', { name: 'Account' })
    expect(group.parentElement).toBe(menu)
    expect([...group.querySelectorAll('[role="menuitem"]')].map((item) => item.textContent)).toEqual(['Profile', 'Copy link', 'Sign out'])
    expect(group.firstElementChild?.textContent).toBe('Account')
  })

  it('a press on an onSelect item calls it once, with no argument, and closes the menu', async () => {
    const onSelect = vi.fn()
    await open(items(onSelect))
    await userEvent.click(row('Copy link'))
    await closed()
    expect(onSelect.mock.calls).toEqual([[]])
  })

  it('a press on an action item calls the action exactly once, with an empty FormData, and closes the menu', async () => {
    const action = vi.fn()
    await open(items(vi.fn(), action))
    await userEvent.click(row('Sign out'))
    await closed()
    expect(action).toHaveBeenCalledTimes(1)
    const [formData] = action.mock.calls[0] as [FormData]
    expect(formData).toBeInstanceOf(FormData)
    expect([...formData.keys()]).toEqual([])
  })

  it('Enter on an action item calls it once too', async () => {
    const action = vi.fn()
    render(<DropdownMenu trigger={<Button>Account</Button>} title="Account" items={items(vi.fn(), action)} />)
    trigger().focus()
    await userEvent.keyboard('{Enter}')
    await screen.findByRole('menu')
    await userEvent.keyboard('{End}{Enter}')
    await closed()
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('a press on a link item runs neither handler: it is the anchor that navigates', async () => {
    const [onSelect, action] = [vi.fn(), vi.fn()]
    await open(items(onSelect, action))
    await userEvent.click(row('Profile'))
    await closed()
    expect(onSelect).not.toHaveBeenCalled()
    expect(action).not.toHaveBeenCalled()
  })
})

/** Catches what a transition throws, as the error boundary of an app does. */
class Boundary extends Component<{ children: ReactNode }, { message: string | null }> {
  override state = { message: null as string | null }
  static getDerivedStateFromError(error: Error) { return { message: error.message } }
  override render() { return this.state.message === null ? this.props.children : <p role="alert">{this.state.message}</p> }
}

describe('a Server Action runs inside a transition', () => {
  it('what an async action rejects with reaches the nearest error boundary, which a bare call would lose', async () => {
    const onError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const action = vi.fn(() => Promise.reject(new Error('The session has already ended')))
    render(
      <Boundary>
        <DropdownMenu trigger={<Button>Account</Button>} title="Account" items={[{ id: 'signout', label: 'Sign out', action }]} />
      </Boundary>,
    )
    await userEvent.click(trigger())
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }))
    expect((await screen.findByRole('alert')).textContent).toBe('The session has already ended')
    expect(action).toHaveBeenCalledTimes(1)
    onError.mockRestore()
  })

  it('an action that resolves leaves the page as it was', async () => {
    const action = vi.fn(() => Promise.resolve())
    render(
      <Boundary>
        <DropdownMenu trigger={<Button>Account</Button>} title="Account" items={[{ id: 'signout', label: 'Sign out', action }]} />
      </Boundary>,
    )
    await userEvent.click(trigger())
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }))
    await closed()
    await act(() => Promise.resolve())
    expect(screen.queryByRole('alert')).toBeNull()
    expect(trigger()).toBeDefined()
  })
})

describe('the link element', () => {
  const items: MenuItem[] = [
    { id: 'profile', label: 'Profile', href: '/profile' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ]

  for (const [form, link] of [['as an element', LINK], ['in the lazy wrapper Flight delivers', lazy(LINK)]] as const) {
    it(`${form}: every href item is that element, with the href of its item in place of the stand-in, and is a menuitem`, async () => {
      await open(items, { link })
      for (const [name, href] of [['Profile', '/profile'], ['Settings', '/settings']] as const) {
        expect(row(name).tagName).toBe('A')
        expect(row(name).getAttribute('data-link')).toBe('app')
        expect(row(name).getAttribute('rel')).toBe('next')
        expect(row(name).getAttribute('href')).toBe(href)
        expect(row(name).getAttribute('role')).toBe('menuitem')
      }
    })

    it(`${form}: the row keeps its label, in the span that truncates it, and its row classes`, async () => {
      await open(items, { link })
      expect(row('Profile').innerHTML).toBe('<span dir="auto" class="truncate min-w-0">Profile</span>')
      expect(row('Profile').className).toContain('min-h-(--tc-row-height)')
    })
  }

  it('with no link element an href item is a plain anchor', async () => {
    await open(items)
    expect(row('Profile').getAttributeNames().includes('data-link')).toBe(false)
    expect(row('Profile').getAttribute('href')).toBe('/profile')
    expect(row('Profile').innerHTML).toBe('<span dir="auto" class="truncate min-w-0">Profile</span>')
  })

  it('a link that is not an element fails by the name of the prop', () => {
    const onError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(
      <DropdownMenu defaultOpen trigger={<Button>Account</Button>} title="Account" items={items} link={'a' as never} />,
    )).toThrow('DropdownMenu: link must be an element, such as link={<Link href="" />}')
    onError.mockRestore()
  })
})
