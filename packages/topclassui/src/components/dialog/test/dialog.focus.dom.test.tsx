import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'
import type { DialogRootProps } from '../types.js'

/** The docs sample: a header with the x, a body, and a footer with two ways out. */
function Publish(props: DialogRootProps) {
  return (
    <DialogRoot {...props}>
      <DialogTrigger render={<Button>Publish</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Publish changes</DialogTitle>
          <DialogDescription>Your changes go live right away.</DialogDescription>
        </DialogHeader>
        <DialogBody>11 files changed since the last publish.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button>Publish now</Button>
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}

/** The trigger by its text: once the dialog is open it is hidden from roles, as the page behind is. */
const trigger = () => {
  const button = screen.getByText('Publish', { selector: 'span' }).closest('button')
  if (!button) throw new Error('the trigger is not a button')
  return button
}
const dialog = () => screen.queryByRole('dialog')
const x = () => screen.getByRole('button', { name: 'Close this dialog' })

/** Clicks the trigger and returns the popup once Base UI has moved focus into it. */
async function open() {
  await userEvent.click(trigger())
  const popup = await screen.findByRole('dialog')
  await waitFor(() => { expect(popup.contains(document.activeElement)).toBe(true) })
  return popup
}

const closed = () => waitFor(() => { expect(dialog()).toBeNull() })

describe('focus', () => {
  it('moves to the x, the first control in the popup', async () => {
    render(<Publish />)
    await open()
    expect(document.activeElement).toBe(x())
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
      <DialogRoot defaultOpen>
        <DialogPopup initialFocus={() => document.getElementById('second')}>
          <DialogHeader><DialogTitle>Two actions</DialogTitle></DialogHeader>
          <DialogFooter>
            <DialogClose>First</DialogClose>
            <DialogClose id="second">Second</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>,
    )
    await waitFor(() => { expect(document.activeElement?.textContent).toBe('Second') })
  })
})

// The commonest confirm deletes the row that held its trigger. Nothing here can guess who should take focus then.
describe('focus when the trigger is gone by the time the dialog closes', () => {
  /** A row whose trigger leaves the page while its dialog is open, as the row of a deleted project would. */
  function Row({ deleted = false, finalFocus }: { deleted?: boolean, finalFocus?: () => HTMLElement | null }) {
    return (
      <>
        <h2 id="list" tabIndex={-1}>Projects</h2>
        <DialogRoot>
          {deleted ? null : <DialogTrigger render={<Button>Publish</Button>} />}
          <DialogPopup finalFocus={finalFocus}>
            <DialogHeader><DialogTitle>Delete it?</DialogTitle></DialogHeader>
          </DialogPopup>
        </DialogRoot>
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

  it('closes from a DialogClose in the footer', async () => {
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
