import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
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

describe('the x', () => {
  it('is a button named by the labels, holding one hidden icon and no text', async () => {
    render(<Publish />)
    await open()
    expect(x().tagName).toBe('BUTTON')
    expect(x().getAttribute('type')).toBe('button')
    expect(x().textContent).toBe('')
    expect(x().querySelectorAll('svg')).toHaveLength(1)
    expect(x().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(x().querySelector('path')?.getAttribute('d')?.slice(0, 10)).toBe('M205.66,19')
  })

  it('is left out with closeButton={false}, and the header keeps its one column', async () => {
    render(
      <DialogRoot defaultOpen>
        <DialogPopup>
          <DialogHeader closeButton={false}><DialogTitle>No x here</DialogTitle></DialogHeader>
          <DialogFooter><DialogClose>Done</DialogClose></DialogFooter>
        </DialogPopup>
      </DialogRoot>,
    )
    const popup = await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Close this dialog' })).toBeNull()
    expect(popup.children[0]?.children).toHaveLength(1)
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Done'])
  })

  it('is what a bare DialogClose renders anywhere, and it closes the dialog', async () => {
    render(
      <DialogRoot defaultOpen>
        <DialogPopup>
          <DialogHeader closeButton={false}><DialogTitle>The x in the footer</DialogTitle></DialogHeader>
          <DialogFooter><DialogClose /></DialogFooter>
        </DialogPopup>
      </DialogRoot>,
    )
    await screen.findByRole('dialog')
    await userEvent.click(x())
    await closed()
  })

  it('takes a name of the caller in place of the label', async () => {
    render(
      <DialogRoot defaultOpen>
        <DialogPopup><DialogFooter><DialogClose aria-label="Discard the draft" /></DialogFooter></DialogPopup>
      </DialogRoot>,
    )
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Discard the draft' }).querySelectorAll('svg')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Close this dialog' })).toBeNull()
  })
})

describe('DialogClose with content is that control, not the x', () => {
  const close = (element: ReactElement) => render(
    <DialogRoot defaultOpen><DialogPopup><DialogFooter>{element}</DialogFooter></DialogPopup></DialogRoot>,
  )

  it('with children it is a plain button with that text, no icon, no label and no class', async () => {
    close(<DialogClose>Cancel</DialogClose>)
    await screen.findByRole('dialog')
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button.getAttribute('class')).toBeNull()
    expect(button.getAttribute('aria-label')).toBeNull()
    expect(button.querySelector('svg')).toBeNull()
  })

  it('with render it is the Button it was given, with that Button label and classes', async () => {
    close(<DialogClose render={<Button variant="outline">Cancel</Button>} />)
    await screen.findByRole('dialog')
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button.getAttribute('data-variant')).toBe('outline')
    expect(button.getAttribute('aria-label')).toBeNull()
    expect(button.querySelector('svg')).toBeNull()
    await userEvent.click(button)
    await closed()
  })

  it('with children that render nothing it falls back to the x, never an empty button with no name', async () => {
    close(<DialogClose>{null}</DialogClose>)
    await screen.findByRole('dialog')
    expect(x().querySelectorAll('svg')).toHaveLength(1)
  })
})
