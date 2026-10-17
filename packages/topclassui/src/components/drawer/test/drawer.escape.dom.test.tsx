import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'
import { DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle } from '../index.js'
import type { DrawerRootProps } from '../types.js'

/** A sheet open from the start, holding a tooltip that opens at once. */
function Share(props: DrawerRootProps) {
  return (
    <DrawerRoot defaultOpen {...props}>
      <DrawerPopup>
        <DrawerHeader><DrawerTitle>Share</DrawerTitle></DrawerHeader>
        <DrawerBody>
          <TooltipRoot>
            <TooltipTrigger delay={0} render={<Button aria-label="Copy link">C</Button>} />
            <TooltipPopup>Copy link</TooltipPopup>
          </TooltipRoot>
        </DrawerBody>
        <DrawerFooter><DrawerClose render={<Button>Done</Button>} /></DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}

const sheet = () => screen.queryByRole('dialog')
// The sheet carries data-placement and data-open as well: the tooltip is the one that is no sheet.
const tooltip = () => document.querySelector('[data-placement][data-open]:not([role="dialog"])')
const tip = () => screen.getByRole('button', { name: 'Copy link' })

/** A real hover: Base UI times its delay from the pointer resting, which needs a move. Focus stays where it was. */
async function hover(element: HTMLElement) {
  await act(() => {
    fireEvent.mouseEnter(element)
    fireEvent.mouseMove(element)
    return Promise.resolve()
  })
  await waitFor(() => { expect(tooltip()?.textContent).toBe('Copy link') })
}

async function ready() {
  const popup = await screen.findByRole('dialog')
  await waitFor(() => { expect(popup.contains(document.activeElement)).toBe(true) })
  return popup
}

// Base UI's tooltip is not in its tree of popups, so without the guard one key closed both.
describe('one Escape closes one thing', () => {
  it('with a tooltip open by hover and focus elsewhere in the sheet, the first Escape closes the tooltip only', async () => {
    render(<Share />)
    await ready()
    await hover(tip())
    expect(document.activeElement).not.toBe(tip())

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })
    expect(sheet()?.hasAttribute('data-open')).toBe(true)
  })

  it('and the second Escape closes the dialog', async () => {
    render(<Share />)
    await ready()
    await hover(tip())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(sheet()).toBeNull() })
  })

  it('never tells the caller about the close it cancelled: onOpenChange hears one false, from the second key', async () => {
    const onOpenChange = vi.fn()
    render(<Share onOpenChange={onOpenChange} />)
    await ready()
    await hover(tip())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })
    expect(onOpenChange).not.toHaveBeenCalled()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(sheet()).toBeNull() })
    expect(onOpenChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([false])
  })

  it('with no tooltip open, the first Escape closes the sheet as before', async () => {
    render(<Share />)
    await ready()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(sheet()).toBeNull() })
  })

  it('a controlled sheet is not asked to close while the tooltip takes the key', async () => {
    const onOpenChange = vi.fn()
    render(<Share open onOpenChange={onOpenChange} />)
    await ready()
    await hover(tip())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
