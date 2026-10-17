import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type { DrawerRootProps } from '../types.js'

/** A whole sheet: a header, a body, a footer with two actions, and the x every sheet ends with. */
function Filters(props: DrawerRootProps) {
  return (
    <DrawerRoot {...props}>
      <DrawerTrigger render={<Button>Filters</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Filter the list</DrawerTitle>
          <DrawerDescription>Narrow the list of projects.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>Status, owner and date.</DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Reset</Button>} />
          <Button>Apply</Button>
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}

/** The trigger by its text: once the sheet is open it is hidden from roles, as the page behind is. */
const trigger = () => {
  const button = screen.getByText('Filters', { selector: 'span' }).closest('button')
  if (!button) throw new Error('the trigger is not a button')
  return button
}
const x = () => screen.getByRole('button', { name: 'Close this panel' })

/** Clicks the trigger and returns the popup once Base UI has moved focus into it. */
async function open() {
  await userEvent.click(trigger())
  const popup = await screen.findByRole('dialog')
  await waitFor(() => { expect(popup.contains(document.activeElement)).toBe(true) })
  return popup
}

describe('placement and size are the root’s, and the popup reports them', () => {
  it('is end and md unless asked', async () => {
    render(<Filters />)
    const popup = await open()
    expect(popup.getAttribute('data-placement')).toBe('end')
    expect(popup.getAttribute('data-size')).toBe('md')
  })

  for (const placement of ['start', 'end', 'top', 'bottom'] as const) {
    it(`reports ${placement} as data-placement`, async () => {
      render(<Filters defaultOpen placement={placement} />)
      expect((await screen.findByRole('dialog')).getAttribute('data-placement')).toBe(placement)
    })
  }

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`reports ${size} as data-size`, async () => {
      render(<Filters defaultOpen size={size} />)
      expect((await screen.findByRole('dialog')).getAttribute('data-size')).toBe(size)
    })
  }

  it('reaches the popup through a server-built tree: nothing sits between the root and the popup but context', async () => {
    render(
      <DrawerRoot defaultOpen placement="start" size="lg">
        <section><div><DrawerPopup aria-label="Deep"><DrawerBody>Body</DrawerBody></DrawerPopup></div></section>
      </DrawerRoot>,
    )
    const popup = await screen.findByRole('dialog')
    expect([popup.getAttribute('data-placement'), popup.getAttribute('data-size')]).toEqual(['start', 'lg'])
  })
})

describe('render on the popup passes to Base UI', () => {
  it('renders the element it is given, with the popup role, placement, size and classes on it', async () => {
    render(
      <DrawerRoot defaultOpen>
        <DrawerPopup render={<section data-testid="section" />}><DrawerBody>Body</DrawerBody></DrawerPopup>
      </DrawerRoot>,
    )
    const section = await screen.findByTestId('section')
    expect(section.tagName).toBe('SECTION')
    expect(section.getAttribute('role')).toBe('dialog')
    expect(section.getAttribute('data-placement')).toBe('end')
    expect(section.getAttribute('data-size')).toBe('md')
    expect(section.getAttribute('class')).toContain('max-w-80')
    expect(section.lastElementChild).toBe(x())
  })
})

describe('ref', () => {
  it('reaches the element passed to render on the trigger, through Button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <DrawerRoot>
        <DrawerTrigger ref={ref} render={<Button>Filters</Button>} />
        <DrawerPopup><DrawerBody>Body</DrawerBody></DrawerPopup>
      </DrawerRoot>,
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
      <DrawerRoot defaultOpen>
        <DrawerPopup ref={refs.popup}>
          <DrawerHeader ref={refs.header}>
            <DrawerTitle ref={refs.title}>Title</DrawerTitle>
            <DrawerDescription ref={refs.description}>Description</DrawerDescription>
          </DrawerHeader>
          <DrawerBody ref={refs.body}>Body</DrawerBody>
          <DrawerFooter ref={refs.footer}><DrawerClose ref={refs.close}>Close</DrawerClose></DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>,
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
  it('keeps the handler of the Button it renders, so the sheet never takes the press away', async () => {
    const onClick = vi.fn()
    render(
      <DrawerRoot>
        <DrawerTrigger render={<Button onClick={onClick}>Filters</Button>} />
        <DrawerPopup><DrawerBody>Body</DrawerBody></DrawerPopup>
      </DrawerRoot>,
    )
    await userEvent.click(trigger())
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('dialog')).toBeTruthy()
  })

  it('is a plain button with no class at all when nothing is passed to render', () => {
    render(
      <DrawerRoot>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerPopup><DrawerBody>Body</DrawerBody></DrawerPopup>
      </DrawerRoot>,
    )
    const button = screen.getByRole('button', { name: 'Open' })
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('class')).toBeNull()
  })
})
