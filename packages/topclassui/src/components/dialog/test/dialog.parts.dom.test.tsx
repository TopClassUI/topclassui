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
const x = () => screen.getByRole('button', { name: 'Close this dialog' })

/** Clicks the trigger and returns the popup once Base UI has moved focus into it. */
async function open() {
  await userEvent.click(trigger())
  const popup = await screen.findByRole('dialog')
  await waitFor(() => { expect(popup.contains(document.activeElement)).toBe(true) })
  return popup
}

describe('the parts', () => {
  it('DialogRoot renders no element of its own', () => {
    const { container } = render(<DialogRoot><span>Inside</span></DialogRoot>)
    expect(container.innerHTML).toBe('<span>Inside</span>')
  })

  it('the popup holds the header, the body and the footer, in that order, and nothing else', async () => {
    render(<Publish />)
    const popup = await open()
    expect([...popup.children].map((child) => child.tagName)).toEqual(['DIV', 'DIV', 'DIV'])
    expect(popup.children[0]?.textContent).toBe('Publish changesYour changes go live right away.')
    expect(popup.children[1]?.textContent).toBe('11 files changed since the last publish.')
    expect(popup.children[2]?.textContent).toBe('CancelPublish now')
  })

  it('the header puts its children in one column and the x after it, so the x is last in the row', async () => {
    render(<Publish />)
    const header = (await open()).children[0]
    expect([...(header?.children ?? [])].map((child) => child.tagName)).toEqual(['DIV', 'BUTTON'])
    expect(header?.children[0]?.children[0]?.tagName).toBe('H2')
    expect(header?.children[0]?.children[1]?.tagName).toBe('P')
    expect(header?.children[1]).toBe(x())
  })

  it('the portal holds the scrim, then the viewport around the popup', async () => {
    render(<Publish />)
    const popup = await open()
    const viewport = popup.parentElement
    expect(viewport?.getAttribute('role')).toBe('presentation')
    expect(viewport?.previousElementSibling?.getAttribute('role')).toBe('presentation')
    expect(viewport?.parentElement?.hasAttribute('data-base-ui-portal')).toBe(true)
  })
})

describe('size', () => {
  it('is md unless asked, and reports itself on the popup', async () => {
    render(<Publish />)
    expect((await open()).getAttribute('data-size')).toBe('md')
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`reports ${size} as data-size`, async () => {
      render(<DialogRoot defaultOpen><DialogPopup size={size}><DialogBody>Body</DialogBody></DialogPopup></DialogRoot>)
      expect((await screen.findByRole('dialog')).getAttribute('data-size')).toBe(size)
    })
  }
})

describe('render on the popup passes to Base UI', () => {
  it('renders the element it is given, with the popup role, size and classes on it', async () => {
    render(
      <DialogRoot defaultOpen>
        <DialogPopup render={<form data-testid="form" />}><DialogBody>Body</DialogBody></DialogPopup>
      </DialogRoot>,
    )
    const form = await screen.findByTestId('form')
    expect(form.tagName).toBe('FORM')
    expect(form.getAttribute('role')).toBe('dialog')
    expect(form.getAttribute('data-size')).toBe('md')
    expect(form.getAttribute('class')).toContain('max-w-95')
  })
})

describe('ref', () => {
  it('reaches the element passed to render on the trigger, through Button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <DialogRoot>
        <DialogTrigger ref={ref} render={<Button>Publish</Button>} />
        <DialogPopup><DialogBody>Body</DialogBody></DialogPopup>
      </DialogRoot>,
    )
    expect(ref.current).toBe(trigger())
  })

  it('reaches the popup, the header, the title, the description, the body, the footer and the close', async () => {
    const refs = {
      popup: { current: null as HTMLDivElement | null }, header: { current: null as HTMLDivElement | null },
      title: { current: null as HTMLHeadingElement | null }, description: { current: null as HTMLParagraphElement | null },
      body: { current: null as HTMLDivElement | null }, footer: { current: null as HTMLDivElement | null },
      close: { current: null as HTMLButtonElement | null },
    }
    render(
      <DialogRoot defaultOpen>
        <DialogPopup ref={refs.popup}>
          <DialogHeader ref={refs.header} closeButton={false}>
            <DialogTitle ref={refs.title}>Title</DialogTitle>
            <DialogDescription ref={refs.description}>Description</DialogDescription>
          </DialogHeader>
          <DialogBody ref={refs.body}>Body</DialogBody>
          <DialogFooter ref={refs.footer}><DialogClose ref={refs.close}>Close</DialogClose></DialogFooter>
        </DialogPopup>
      </DialogRoot>,
    )
    const popup = await screen.findByRole('dialog')
    expect(refs.popup.current).toBe(popup)
    expect(refs.header.current).toBe(popup.children[0])
    expect(refs.title.current?.tagName).toBe('H2')
    expect(refs.description.current?.tagName).toBe('P')
    expect(refs.body.current).toBe(popup.children[1])
    expect(refs.footer.current).toBe(popup.children[2])
    expect(refs.close.current?.textContent).toBe('Close')
  })
})

describe('the trigger is the control it is given', () => {
  it('keeps the handler of the Button it renders, so the dialog never takes the press away', async () => {
    const onClick = vi.fn()
    render(
      <DialogRoot>
        <DialogTrigger render={<Button onClick={onClick}>Publish</Button>} />
        <DialogPopup><DialogBody>Body</DialogBody></DialogPopup>
      </DialogRoot>,
    )
    await userEvent.click(trigger())
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('dialog')).toBeTruthy()
  })

  it('is a plain button with no class at all when nothing is passed to render', () => {
    render(
      <DialogRoot>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPopup><DialogBody>Body</DialogBody></DialogPopup>
      </DialogRoot>,
    )
    const button = screen.getByRole('button', { name: 'Open' })
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('class')).toBeNull()
  })
})
