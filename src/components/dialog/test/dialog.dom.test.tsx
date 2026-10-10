import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

describe('opening', () => {
  it('renders no popup until the trigger is pressed', () => {
    render(<Publish />)
    expect(dialog()).toBeNull()
    expect(document.querySelector('[data-base-ui-portal]')).toBeNull()
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens on a press of the trigger, in a portal outside the tree that rendered it', async () => {
    const { container } = render(<Publish />)
    const popup = await open()
    expect(container.contains(popup)).toBe(false)
    expect(popup.closest('[data-base-ui-portal]')?.parentElement).toBe(document.body)
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().getAttribute('aria-controls')).toBe(popup.id)
  })

  it('opens from the start when asked to with defaultOpen', async () => {
    render(<Publish defaultOpen />)
    expect((await screen.findByRole('dialog')).textContent).toContain('Publish changes')
  })
})

describe('what assistive technology gets', () => {
  it('is a dialog named by its title and described by its description', async () => {
    render(<Publish />)
    const popup = await open()
    const title = screen.getByRole('heading', { level: 2, name: 'Publish changes' })
    expect(popup.getAttribute('aria-labelledby')).toBe(title.id)
    expect(title.id).not.toBe('')
    const description = screen.getByText('Your changes go live right away.')
    expect(description.tagName).toBe('P')
    expect(popup.getAttribute('aria-describedby')).toBe(description.id)
  })

  it('hides the page behind it while it is open, and gives it back on close', async () => {
    const { container } = render(<Publish />)
    expect(container.getAttribute('aria-hidden')).toBeNull()
    await open()
    expect(container.getAttribute('aria-hidden')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await closed()
    expect(container.getAttribute('aria-hidden')).toBeNull()
  })

  it('locks the scroll of the page while it is open, and only then', async () => {
    render(<Publish />)
    expect(document.body.style.overflowY).toBe('')
    await open()
    await waitFor(() => { expect(document.body.style.overflowY).toBe('hidden') })
    await userEvent.keyboard('{Escape}')
    await closed()
    await waitFor(() => { expect(document.body.style.overflowY).toBe('') })
  })
})

describe('state attributes', () => {
  it('are presence attributes on every element, never data-state (R-5.7-6)', async () => {
    render(<Publish />)
    const popup = await open()
    expect(trigger().getAttribute('data-popup-open')).toBe('')
    expect(popup.getAttribute('data-open')).toBe('')
    expect(popup.parentElement?.getAttribute('data-open')).toBe('')
    expect(popup.parentElement?.previousElementSibling?.getAttribute('data-open')).toBe('')
    expect(document.body.innerHTML).not.toContain('data-state')
  })
})

describe('controlled and uncontrolled both work', () => {
  it('shows the popup while open is true and reports each request to close with its reason', async () => {
    const onOpenChange = vi.fn()
    render(<Publish open onOpenChange={onOpenChange} />)
    const popup = await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false)
    expect((onOpenChange.mock.calls[0]?.[1] as { reason: string }).reason).toBe('escape-key')
    expect(popup.hasAttribute('data-open')).toBe(true)
  })

  it('stays closed while open is false, whatever is pressed', async () => {
    const onOpenChange = vi.fn()
    render(<Publish open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true)
    expect(dialog()).toBeNull()
  })

  it('reports an uncontrolled open and close through onOpenChange too', async () => {
    const onOpenChange = vi.fn()
    render(<Publish onOpenChange={onOpenChange} />)
    await open()
    await userEvent.click(x())
    await closed()
    expect(onOpenChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([true, false])
  })
})
