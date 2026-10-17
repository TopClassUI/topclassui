import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { DialogBody, DialogHeader, DialogPopup, DialogRoot, DialogTitle } from '#components/dialog/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'
import { PopoverClose, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverRootProps } from '../types.js'

/** A popover open from the start, holding a tooltip that opens at once. Done comes first and takes the first
 * focus: a tooltip also opens when its trigger is focused, and here it must be the pointer that opens it. */
function Share(props: PopoverRootProps) {
  return (
    <PopoverRoot defaultOpen {...props}>
      <PopoverTrigger render={<Button>Share</Button>} />
      <PopoverPopup>
        <PopoverTitle>Share this page</PopoverTitle>
        <PopoverClose render={<Button>Done</Button>} />
        <TooltipRoot>
          <TooltipTrigger delay={0} render={<Button aria-label="Copy link">C</Button>} />
          <TooltipPopup>Copy link</TooltipPopup>
        </TooltipRoot>
      </PopoverPopup>
    </PopoverRoot>
  )
}

/** The titles of every popover and dialog that is open, outermost first. */
const open = () => [...document.querySelectorAll('[role="dialog"][data-open] h2')].map((title) => title.textContent)
const tooltip = () => document.querySelector('[data-placement][data-open]:not([role])')
const button = (name: string) => screen.getByRole('button', { name, hidden: true })

/** A real hover: Base UI times its delay from the pointer resting, which needs a move. Focus stays where it was. */
async function hover(element: HTMLElement) {
  await act(() => {
    fireEvent.mouseEnter(element)
    fireEvent.mouseMove(element)
    return Promise.resolve()
  })
}

/** Waits until Base UI has moved the focus into the innermost open popup. */
async function ready() {
  await waitFor(() => {
    const popups = document.querySelectorAll('[role="dialog"][data-open]')
    expect(popups[popups.length - 1]?.contains(document.activeElement)).toBe(true)
  })
}

// Base UI's tooltip is not in its tree of popups, so without the guard one key closed both.
describe('a tooltip inside the popover: one Escape closes one thing', () => {
  it('with the tooltip open by hover and focus elsewhere in the popover, the first Escape closes the tooltip only', async () => {
    render(<Share />)
    await ready()
    await hover(button('Copy link'))
    await waitFor(() => { expect(tooltip()?.textContent).toBe('Copy link') })
    expect(document.activeElement?.textContent).toBe('Done')

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })
    expect(open()).toEqual(['Share this page'])
  })

  it('and the second Escape closes the popover, which tells onOpenChange once', async () => {
    const onOpenChange = vi.fn()
    render(<Share onOpenChange={onOpenChange} />)
    await ready()
    await hover(button('Copy link'))
    await waitFor(() => { expect(tooltip()?.textContent).toBe('Copy link') })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })
    // The close it cancelled is never reported.
    expect(onOpenChange).not.toHaveBeenCalled()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual([]) })
    expect(onOpenChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([false])
  })

  it('with no tooltip open, the first Escape closes the popover as before', async () => {
    render(<Share />)
    await ready()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual([]) })
  })
})

/** A dialog open from the start that holds the trigger of a popover. */
const inDialog = (
  <DialogRoot defaultOpen>
    <DialogPopup>
      <DialogHeader><DialogTitle>Project settings</DialogTitle></DialogHeader>
      <DialogBody>
        <PopoverRoot>
          <PopoverTrigger render={<Button>Members</Button>} />
          <PopoverPopup>
            <PopoverTitle>Members</PopoverTitle>
            <Button>Invite</Button>
          </PopoverPopup>
        </PopoverRoot>
      </DialogBody>
    </DialogPopup>
  </DialogRoot>
)

// The popover's own trigger sits in the dialog, marked open: a guard that looked at any dialog cancelled the popover's own close.
describe('a popover inside a dialog: the guard looks at its own popup and at no other', () => {
  it('with the focus inside the popover, Escape closes the popover and leaves the dialog', async () => {
    render(inDialog)
    await ready()
    await userEvent.click(button('Members'))
    await waitFor(() => { expect(open()).toEqual(['Project settings', 'Members']) })
    await ready()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual(['Project settings']) })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual([]) })
  })

  it('with the focus back on its trigger, in the dialog, Escape still closes the popover: it is not swallowed', async () => {
    render(inDialog)
    await ready()
    await userEvent.click(button('Members'))
    await waitFor(() => { expect(open()).toEqual(['Project settings', 'Members']) })
    await ready()
    act(() => { button('Members').focus() })
    expect(document.activeElement).toBe(button('Members'))

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual(['Project settings']) })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual([]) })
  })
})

describe('a popover inside a popover', () => {
  const nested = (
    <PopoverRoot defaultOpen>
      <PopoverTrigger render={<Button>Outer</Button>} />
      <PopoverPopup>
        <PopoverTitle>Outer popover</PopoverTitle>
        <PopoverRoot>
          <PopoverTrigger render={<Button>Inner</Button>} />
          <PopoverPopup><PopoverTitle>Inner popover</PopoverTitle><Button>Apply</Button></PopoverPopup>
        </PopoverRoot>
      </PopoverPopup>
    </PopoverRoot>
  )

  it('each root makes a scope of its own, and each popup writes its own on itself', async () => {
    render(nested)
    await ready()
    await userEvent.click(button('Inner'))
    await waitFor(() => { expect(open()).toEqual(['Outer popover', 'Inner popover']) })
    const scopes = [...document.querySelectorAll('[role="dialog"]')].map((popup) => popup.getAttribute('data-popover') ?? '')
    expect(scopes).toHaveLength(2)
    expect(scopes[0]).not.toBe('')
    expect(scopes[1]).not.toBe('')
    expect(scopes[0]).not.toBe(scopes[1])
  })

  it('with the focus back on the inner trigger, Escape closes the inner one first, then the outer', async () => {
    render(nested)
    await ready()
    await userEvent.click(button('Inner'))
    await waitFor(() => { expect(open()).toEqual(['Outer popover', 'Inner popover']) })
    await ready()
    act(() => { button('Inner').focus() })

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual(['Outer popover']) })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(open()).toEqual([]) })
  })

  it('a scope of the caller cannot replace the one the root made: the attribute is written after the rest props', async () => {
    render(
      <PopoverRoot defaultOpen>
        <PopoverPopup {...{ 'data-popover': 'mine' }}><PopoverTitle>Scoped</PopoverTitle></PopoverPopup>
      </PopoverRoot>,
    )
    const popup = await screen.findByRole('dialog')
    expect(popup.getAttribute('data-popover')).not.toBe('mine')
    expect(popup.getAttribute('data-popover')).not.toBe('')
  })
})
