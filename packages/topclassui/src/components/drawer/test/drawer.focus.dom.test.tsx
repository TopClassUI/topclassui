import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type { DrawerRootProps } from '../types.js'

/** A whole sheet: a header, a body, a footer with two actions, and the x every sheet ends with. */
function Publish(props: DrawerRootProps) {
  return (
    <DrawerRoot {...props}>
      <DrawerTrigger render={<Button>Publish</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Publish changes</DrawerTitle>
          <DrawerDescription>Your changes go live right away.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>11 files changed since the last publish.</DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Cancel</Button>} />
          <Button>Publish now</Button>
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}

/** The trigger by its text: once the sheet is open it is hidden from roles, as the page behind is. */
const trigger = () => {
  const button = screen.getByText('Publish', { selector: 'span' }).closest('button')
  if (!button) throw new Error('the trigger is not a button')
  return button
}
const sheet = () => screen.queryByRole('dialog')
const x = () => screen.getByRole('button', { name: 'Close this panel' })

/** Clicks the trigger and returns the popup once Base UI has moved focus into it. */
async function open() {
  await userEvent.click(trigger())
  const popup = await screen.findByRole('dialog')
  await waitFor(() => { expect(popup.contains(document.activeElement)).toBe(true) })
  return popup
}

const closed = () => waitFor(() => { expect(sheet()).toBeNull() })

describe('focus', () => {
  // Base UI's Drawer starts on the popup, where its Dialog starts on the first control: no ring on a control nobody chose.
  it('moves to the sheet itself, not to a control in it and not to the x', async () => {
    render(<Publish />)
    const popup = await open()
    expect(document.activeElement).toBe(popup)
    expect(popup.getAttribute('tabindex')).toBe('-1')
  })

  it('finds the x last when the sheet is walked: it is the last element of the popup, after the footer', async () => {
    render(<Publish />)
    const popup = await open()
    expect(popup.lastElementChild).toBe(x())
    expect([...popup.querySelectorAll('button')].map((button) => button.getAttribute('aria-label') ?? button.textContent))
      .toEqual(['Cancel', 'Publish now', 'Close this panel'])
  })

  it('returns to the trigger on Escape', async () => {
    render(<Publish />)
    await open()
    await userEvent.keyboard('{Escape}')
    await closed()
    await waitFor(() => { expect(document.activeElement).toBe(trigger()) })
  })

  it('returns to the trigger when the x closes it', async () => {
    render(<Publish />)
    await open()
    await userEvent.click(x())
    await closed()
    await waitFor(() => { expect(document.activeElement).toBe(trigger()) })
  })

  it('goes where initialFocus says, which the popup passes to Base UI', async () => {
    render(
      <DrawerRoot defaultOpen>
        <DrawerPopup initialFocus={() => document.getElementById('second')}>
          <DrawerHeader><DrawerTitle>Two actions</DrawerTitle></DrawerHeader>
          <DrawerFooter>
            <DrawerClose>First</DrawerClose>
            <DrawerClose id="second">Second</DrawerClose>
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>,
    )
    await waitFor(() => { expect(document.activeElement?.textContent).toBe('Second') })
  })

  // A boolean crosses from a server page, where a function or a ref cannot.
  it('starts on the first control with initialFocus alone, as a Dialog does: the remedy the README gives', async () => {
    render(
      <DrawerRoot defaultOpen>
        <DrawerPopup initialFocus>
          <DrawerHeader><DrawerTitle>Two actions</DrawerTitle></DrawerHeader>
          <DrawerFooter>
            <DrawerClose>First</DrawerClose>
            <DrawerClose>Second</DrawerClose>
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>,
    )
    await waitFor(() => { expect(document.activeElement?.textContent).toBe('First') })
  })
})

// The commonest confirm deletes the row that held its trigger. Nothing here can guess who should take focus then.
describe('focus when the trigger is gone by the time the sheet closes', () => {
  /** A row whose trigger leaves the page while its sheet is open, as the row of a deleted project would. */
  function Row({ deleted = false, finalFocus }: { deleted?: boolean, finalFocus?: () => HTMLElement | null }) {
    return (
      <>
        <h2 id="list" tabIndex={-1}>Projects</h2>
        <DrawerRoot>
          {deleted ? null : <DrawerTrigger render={<Button>Publish</Button>} />}
          <DrawerPopup finalFocus={finalFocus}>
            <DrawerHeader><DrawerTitle>Delete it?</DrawerTitle></DrawerHeader>
          </DrawerPopup>
        </DrawerRoot>
      </>
    )
  }

  it('falls to the body with no finalFocus: Base UI has no other element to return it to', async () => {
    const { rerender } = render(<Row />)
    await open()
    rerender(<Row deleted />)
    expect(screen.queryByText('Publish')).toBeNull()
    await userEvent.keyboard('{Escape}')
    await closed()
    await new Promise((resolve) => { setTimeout(resolve, 30) })
    expect(document.activeElement).toBe(document.body)
  })

  it('goes to the element finalFocus names, which is the remedy the README gives', async () => {
    const toList = () => document.getElementById('list')
    const { rerender } = render(<Row finalFocus={toList} />)
    await open()
    rerender(<Row deleted finalFocus={toList} />)
    await userEvent.keyboard('{Escape}')
    await closed()
    await waitFor(() => { expect(document.activeElement?.id).toBe('list') })
  })
})

describe('closing', () => {
  it('closes on Escape', async () => {
    render(<Publish />)
    await open()
    await userEvent.keyboard('{Escape}')
    await closed()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('closes from a DrawerClose in the footer', async () => {
    render(<Publish />)
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await closed()
  })

  it('stays open after a press on a plain Button in the footer', async () => {
    render(<Publish />)
    const popup = await open()
    await userEvent.click(screen.getByRole('button', { name: 'Publish now' }))
    expect(popup.hasAttribute('data-open')).toBe(true)
  })

  it('closes on a press outside the popup, on the scrim', async () => {
    render(<Publish />)
    const popup = await open()
    const scrim = popup.parentElement?.previousElementSibling
    expect(scrim?.getAttribute('class')).toContain('bg-overlay')
    await userEvent.click(scrim as Element)
    await closed()
  })

  it('with disablePointerDismissal a press outside leaves it open, and Escape still closes it', async () => {
    render(<Publish disablePointerDismissal />)
    const popup = await open()
    await userEvent.click(popup.parentElement?.previousElementSibling as Element)
    await new Promise((resolve) => { setTimeout(resolve, 30) })
    expect(popup.hasAttribute('data-open')).toBe(true)
    await userEvent.keyboard('{Escape}')
    await closed()
  })
})
