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

// Where the menu lands, what scrolls and what a real Tab does are measured in e2e/dropdown.spec.ts.
describe('the trigger', () => {
  it('says it opens a menu and that it is closed', () => {
    render(<Actions />)
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(menu()).toBeNull()
  })

  it('opens the menu on a press, says so, and the menu is named by it', async () => {
    render(<Actions />)
    await userEvent.click(trigger())
    const popup = await screen.findByRole('menu')
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().hasAttribute('data-popup-open')).toBe(true)
    expect(popup.getAttribute('aria-labelledby')).toBe(trigger().id)
    expect(screen.getByRole('menu', { name: 'Actions' })).toBe(popup)
  })

  it('stays shut when it is disabled, and is disabled natively', async () => {
    render(
      <DropdownRoot>
        <DropdownTrigger disabled render={<Button>Actions</Button>} />
        <DropdownPopup><DropdownItem>Rename</DropdownItem></DropdownPopup>
      </DropdownRoot>,
    )
    expect((trigger() as HTMLButtonElement).disabled).toBe(true)
    await userEvent.click(trigger())
    expect(menu()).toBeNull()
  })
})

// The menu-button pattern of the ARIA Authoring Practices, key by key.
describe('the keyboard', () => {
  it('Enter, Space and ArrowDown on the trigger open the menu with the focus on its first row', async () => {
    render(<Actions />)
    for (const key of ['{Enter}', ' ', '{ArrowDown}']) {
      await open(key)
      await userEvent.keyboard('{Escape}')
      await closed()
    }
  })

  it('ArrowUp on the trigger opens it with the focus on its last row', async () => {
    render(<Actions />)
    await open('{ArrowUp}', 'Delete')
  })

  it('ArrowDown moves down row by row, stops on a disabled row too, and loops from the last to the first', async () => {
    render(<Actions />)
    await open()
    expect(await walk(['{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{ArrowDown}']))
      .toEqual(['Settings', 'Duplicate', 'Rename', 'Delete', 'Profile'])
  })

  it('ArrowUp moves up and loops from the first row to the last', async () => {
    render(<Actions />)
    await open()
    expect(await walk(['{ArrowUp}', '{ArrowUp}', '{ArrowUp}'])).toEqual(['Delete', 'Rename', 'Duplicate'])
  })

  it('End goes to the last row and Home to the first', async () => {
    render(<Actions />)
    await open()
    expect(await walk(['{End}', '{Home}'])).toEqual(['Delete', 'Profile'])
  })

  it('a letter goes to the next row that starts with it, and two letters typed together to the row that starts with both', async () => {
    render(<Actions />)
    await open()
    expect(await walk(['d', 'e'])).toEqual(['Duplicate', 'Delete'])
  })

  it('loopFocus={false} stops at both ends', async () => {
    render(<Actions loopFocus={false} />)
    await open()
    expect(await walk(['{ArrowUp}', '{End}', '{ArrowDown}'])).toEqual(['Profile', 'Delete', 'Delete'])
  })

  it('gives the highlighted row the one tab stop and marks it, and no other row', async () => {
    render(<Actions />)
    const popup = await open()
    await userEvent.keyboard('{ArrowDown}')
    const rows = [...popup.querySelectorAll('[role="menuitem"]')]
    expect(rows.map((row) => row.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1', '-1'])
    expect(rows.map((row) => row.hasAttribute('data-highlighted'))).toEqual([false, true, false, false, false])
  })

  it('Enter runs the row, once, closes the menu and hands the focus back to the trigger', async () => {
    const onPick = vi.fn()
    render(<Actions onPick={onPick} />)
    await open()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await closed()
    expect(onPick.mock.calls).toEqual([['Settings']])
    await waitFor(() => { expect(document.activeElement).toBe(trigger()) })
  })

  it('Space runs the row too', async () => {
    const onPick = vi.fn()
    render(<Actions onPick={onPick} />)
    await open()
    await userEvent.keyboard(' ')
    await closed()
    expect(onPick.mock.calls).toEqual([['Profile']])
  })

  it('Escape closes the menu, runs nothing and hands the focus back to the trigger', async () => {
    const onPick = vi.fn()
    render(<Actions onPick={onPick} />)
    await open()
    await userEvent.keyboard('{Escape}')
    await closed()
    expect(onPick).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger())
  })

  it('Tab closes the menu', async () => {
    render(<Actions />)
    await open()
    await userEvent.tab()
    await closed()
  })
})
