import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'
import type { DropdownRootProps } from '../types.js'

/** The drawing: five rows, the fourth disabled, with a button of the page after the menu. */
function Actions({ onPick, ...props }: DropdownRootProps & { onPick?: (name: string) => void }) {
  return (
    <>
      <DropdownRoot {...props}>
        <DropdownTrigger render={<Button variant="outline">Actions</Button>} />
        <DropdownPopup>
          <DropdownItem shortcut="Ctrl P" onClick={() => onPick?.('Profile')}>Profile</DropdownItem>
          <DropdownItem onClick={() => onPick?.('Settings')}>Settings</DropdownItem>
          <DropdownItem onClick={() => onPick?.('Duplicate')}>Duplicate</DropdownItem>
          <DropdownItem disabled onClick={() => onPick?.('Rename')}>Rename</DropdownItem>
          <DropdownSeparator />
          <DropdownItem tone="danger" onClick={() => onPick?.('Delete')}>Delete</DropdownItem>
        </DropdownPopup>
      </DropdownRoot>
      <Button>After</Button>
    </>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Actions' })
const menu = () => screen.queryByRole('menu')
/** The label of the row that holds the focus, without its shortcut. */
const focused = () => document.activeElement?.querySelector('span')?.textContent ?? document.activeElement?.tagName
const closed = () => waitFor(() => { expect(menu()).toBeNull() })

/** Opens the menu from the keyboard, as the menu-button pattern has it, and waits for the row that takes the focus. */
async function open(key = '{Enter}', first = 'Profile') {
  trigger().focus()
  await userEvent.keyboard(key)
  const popup = await screen.findByRole('menu')
  await waitFor(() => { expect(focused()).toBe(first) })
  return popup
}

/** Presses keys one at a time and returns the row focus rests on after each. */
async function walk(keys: string[]) {
  const seen: (string | undefined)[] = []
  for (const key of keys) {
    await userEvent.keyboard(key)
    seen.push(focused())
  }
  return seen
}

describe('a disabled row', () => {
  it('is announced as unavailable, takes the focus from the arrows, and does nothing by Enter or by Space', async () => {
    const onPick = vi.fn()
    render(<Actions onPick={onPick} />)
    const popup = await open()
    expect(await walk(['{ArrowDown}', '{ArrowDown}', '{ArrowDown}'])).toEqual(['Settings', 'Duplicate', 'Rename'])
    expect(document.activeElement?.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement?.hasAttribute('data-disabled')).toBe(true)
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onPick).not.toHaveBeenCalled()
    expect(popup.hasAttribute('data-open')).toBe(true)
  })

  it('does nothing by a press either, and the menu stays open', async () => {
    const onPick = vi.fn()
    render(<Actions onPick={onPick} />)
    const popup = await open()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Rename' }), { pointerEventsCheck: 0 })
    expect(onPick).not.toHaveBeenCalled()
    expect(popup.hasAttribute('data-open')).toBe(true)
  })
})

describe('the pointer', () => {
  it('a press on a row runs it once and closes the menu', async () => {
    const onPick = vi.fn()
    render(<Actions onPick={onPick} />)
    await userEvent.click(trigger())
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Duplicate' }))
    await closed()
    expect(onPick.mock.calls).toEqual([['Duplicate']])
  })

  it('closeOnClick={false} on a row keeps the menu open after it ran', async () => {
    const onPick = vi.fn()
    render(
      <DropdownRoot>
        <DropdownTrigger render={<Button>Actions</Button>} />
        <DropdownPopup><DropdownItem closeOnClick={false} onClick={() => { onPick() }}>Pin</DropdownItem></DropdownPopup>
      </DropdownRoot>,
    )
    await userEvent.click(trigger())
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Pin' }))
    expect(onPick).toHaveBeenCalledTimes(1)
    expect(menu()?.hasAttribute('data-open')).toBe(true)
  })

  it('a press outside closes it', async () => {
    render(<Actions modal={false} />)
    await userEvent.click(trigger())
    await screen.findByRole('menu')
    await userEvent.click(screen.getByRole('button', { name: 'After' }))
    await closed()
  })
})

describe('the root passes its props to Base UI', () => {
  it('defaultOpen opens it with no press', async () => {
    render(<Actions defaultOpen />)
    expect((await screen.findByRole('menu')).hasAttribute('data-open')).toBe(true)
  })

  it('tells onOpenChange each change and why', async () => {
    const onOpenChange = vi.fn()
    render(<Actions onOpenChange={onOpenChange} />)
    await open()
    await userEvent.keyboard('{Escape}')
    await closed()
    const calls = onOpenChange.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason])
    expect(calls).toEqual([[true, 'trigger-press'], [false, 'escape-key']])
  })

  it('a controlled menu stays as open says, and only asks to change', async () => {
    const onOpenChange = vi.fn()
    render(<Actions open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    expect(onOpenChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([true])
    expect(menu()).toBeNull()
  })

  it('is modal unless told otherwise: one layer of Base UI covers the page, and none with modal={false}', async () => {
    const { unmount } = render(<Actions defaultOpen />)
    await screen.findByRole('menu')
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(1)
    unmount()
    render(<Actions defaultOpen modal={false} />)
    await screen.findByRole('menu')
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(0)
  })

  it('the menu is portaled out of the tree that renders it, into the body', async () => {
    const { container } = render(<Actions defaultOpen />)
    const popup = await screen.findByRole('menu')
    expect(container.contains(popup)).toBe(false)
    expect(popup.closest('[data-base-ui-portal]')).not.toBeNull()
  })
})
