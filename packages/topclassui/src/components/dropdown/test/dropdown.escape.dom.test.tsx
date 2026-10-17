import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { DialogBody, DialogHeader, DialogPopup, DialogRoot, DialogTitle } from '#components/dialog/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'
import type { DropdownRootProps } from '../types.js'

/** A menu open from the start, whose second row explains itself with a tooltip that opens at once. */
function Project(props: DropdownRootProps) {
  return (
    <DropdownRoot defaultOpen {...props}>
      <DropdownTrigger render={<Button>Project</Button>} />
      <DropdownPopup>
        <DropdownItem>Rename</DropdownItem>
        <TooltipRoot>
          <TooltipTrigger delay={0} render={<DropdownItem>Transfer</DropdownItem>} />
          <TooltipPopup>Only the owner can transfer it</TooltipPopup>
        </TooltipRoot>
      </DropdownPopup>
    </DropdownRoot>
  )
}

const menus = () => [...document.querySelectorAll('[role="menu"][data-open]')]
const dialogs = () => [...document.querySelectorAll('[role="dialog"][data-open]')]
const tooltip = () => document.querySelector('[role="tooltip"][data-open]')
const row = (name: string) => screen.getByRole('menuitem', { name, hidden: true })

/** A real hover: Base UI times its delay from the pointer resting, which needs a move. */
async function hover(element: HTMLElement) {
  await act(() => {
    fireEvent.mouseEnter(element)
    fireEvent.mouseMove(element)
    return Promise.resolve()
  })
}

/** Waits until Base UI has moved the focus into the innermost open menu. */
async function ready() {
  await waitFor(() => {
    const open = menus()
    expect(open[open.length - 1]?.contains(document.activeElement)).toBe(true)
  })
}

// Base UI's tooltip is not in its tree of popups, so without the guard one key closed both.
describe('a tooltip on a row: one Escape closes one thing', () => {
  it('with the tooltip open, the first Escape closes the tooltip only, and tells onOpenChange nothing', async () => {
    const onOpenChange = vi.fn()
    render(<Project onOpenChange={onOpenChange} />)
    await ready()
    await hover(row('Transfer'))
    await waitFor(() => { expect(tooltip()?.textContent).toBe('Only the owner can transfer it') })

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })
    expect(menus()).toHaveLength(1)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('and the second Escape closes the menu, which tells onOpenChange once', async () => {
    const onOpenChange = vi.fn()
    render(<Project onOpenChange={onOpenChange} />)
    await ready()
    await hover(row('Transfer'))
    await waitFor(() => { expect(tooltip()).not.toBeNull() })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(menus()).toHaveLength(0) })
    expect(onOpenChange.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason])).toEqual([[false, 'escape-key']])
  })

  it('with no tooltip open, the first Escape closes the menu as before', async () => {
    render(<Project />)
    await ready()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(menus()).toHaveLength(0) })
  })
})

/** A dialog open from the start whose body holds the trigger of a menu, and, when asked, the menu itself. */
function InDialog({ inside = false }: { inside?: boolean }) {
  const [host, setHost] = useState(null as HTMLDivElement | null)
  return (
    <DialogRoot defaultOpen>
      <DialogPopup>
        <DialogHeader><DialogTitle>Project settings</DialogTitle></DialogHeader>
        <DialogBody>
          <DropdownRoot>
            <DropdownTrigger render={<Button>Role</Button>} />
            <DropdownPopup container={inside ? host : undefined}>
              <DropdownItem>Viewer</DropdownItem>
              <DropdownItem>Editor</DropdownItem>
            </DropdownPopup>
          </DropdownRoot>
          <div ref={setHost} />
        </DialogBody>
      </DialogPopup>
    </DialogRoot>
  )
}

/** Opens the menu of the dialog and waits until one of its rows, or the menu, holds the focus. */
async function openRole() {
  await waitFor(() => { expect(dialogs()).toHaveLength(1) })
  await userEvent.click(screen.getByRole('button', { name: 'Role', hidden: true }))
  await waitFor(() => { expect(menus()).toHaveLength(1) })
  await ready()
}

// The menu's own trigger sits in the dialog, marked open: a guard that looked at any dialog would cancel the menu's own close.
describe('a menu inside a dialog: the guard looks at its own popup and at no dialog around it', () => {
  it('Escape closes the menu and leaves the dialog, and the next one closes the dialog', async () => {
    render(<InDialog />)
    await openRole()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(menus()).toHaveLength(0) })
    expect(dialogs()).toHaveLength(1)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(dialogs()).toHaveLength(0) })
  })

  it('mounted inside the dialog itself through container, the menu still closes first: its key is not taken for the dialog', async () => {
    render(<InDialog inside />)
    await openRole()
    expect(menus()[0]?.closest('[role="dialog"]')).toBe(dialogs()[0])

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(menus()).toHaveLength(0) })
    expect(dialogs()).toHaveLength(1)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(dialogs()).toHaveLength(0) })
  })
})

describe('the scope of a root', () => {
  const two = (
    <>
      <DropdownRoot defaultOpen modal={false}>
        <DropdownTrigger render={<Button>One</Button>} />
        <DropdownPopup><DropdownItem>First</DropdownItem></DropdownPopup>
      </DropdownRoot>
      <DropdownRoot defaultOpen modal={false}>
        <DropdownTrigger render={<Button>Two</Button>} />
        <DropdownPopup {...{ 'data-dropdown': 'mine' }}><DropdownItem>Second</DropdownItem></DropdownPopup>
      </DropdownRoot>
    </>
  )

  it('each root makes its own, and each menu writes the scope of its root on itself', async () => {
    render(two)
    await waitFor(() => { expect(document.querySelectorAll('[role="menu"]')).toHaveLength(2) })
    const scopes = [...document.querySelectorAll('[role="menu"]')].map((menu) => menu.getAttribute('data-dropdown') ?? '')
    expect(scopes[0]).not.toBe('')
    expect(scopes[1]).not.toBe('')
    expect(scopes[0]).not.toBe(scopes[1])
  })

  it('a scope of the caller cannot replace the one the root made: the attribute is written after the rest props', async () => {
    render(two)
    await waitFor(() => { expect(document.querySelectorAll('[role="menu"]')).toHaveLength(2) })
    expect(document.querySelectorAll('[role="menu"]')[1]?.getAttribute('data-dropdown')).not.toBe('mine')
  })
})
