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

describe('the parts', () => {
  it('DrawerRoot renders no element of its own', () => {
    const { container } = render(<DrawerRoot><span>Inside</span></DrawerRoot>)
    expect(container.innerHTML).toBe('<span>Inside</span>')
  })

  it('the popup holds the header, the body and the footer, in that order, and then the x', async () => {
    render(<Filters />)
    const popup = await open()
    expect([...popup.children].map((child) => child.tagName)).toEqual(['DIV', 'DIV', 'DIV', 'BUTTON'])
    expect(popup.children[0]?.textContent).toBe('Filter the listNarrow the list of projects.')
    expect(popup.children[1]?.textContent).toBe('Status, owner and date.')
    expect(popup.children[2]?.textContent).toBe('ResetApply')
    expect(popup.children[3]).toBe(x())
  })

  it('the header holds the title and the description themselves: the x is not in it', async () => {
    render(<Filters />)
    const header = (await open()).children[0]
    expect([...(header?.children ?? [])].map((child) => child.tagName)).toEqual(['H2', 'P'])
    expect(header?.querySelector('button')).toBeNull()
  })

  it('the body is Base UI content, the region a mouse selects text in instead of swiping', async () => {
    render(<Filters />)
    const popup = await open()
    expect(popup.children[1]?.hasAttribute('data-drawer-content')).toBe(true)
    expect(popup.querySelectorAll('[data-drawer-content]')).toHaveLength(1)
  })

  it('the portal holds the scrim, then the viewport around the popup', async () => {
    render(<Filters />)
    const popup = await open()
    const viewport = popup.parentElement
    expect(viewport?.getAttribute('role')).toBe('presentation')
    expect(viewport?.previousElementSibling?.getAttribute('role')).toBe('presentation')
    expect(viewport?.parentElement?.hasAttribute('data-base-ui-portal')).toBe(true)
  })
})

describe('the x is always there (WCAG 2.5.7)', () => {
  it('ends a sheet that holds nothing else', async () => {
    render(<DrawerRoot defaultOpen><DrawerPopup aria-label="Empty" /></DrawerRoot>)
    const popup = await screen.findByRole('dialog')
    expect([...popup.children].map((child) => child.tagName)).toEqual(['BUTTON'])
    expect(popup.firstElementChild).toBe(x())
  })

  it('ends a sheet with no header, after the body', async () => {
    render(<DrawerRoot defaultOpen><DrawerPopup aria-label="Links"><DrawerBody>Links</DrawerBody></DrawerPopup></DrawerRoot>)
    const popup = await screen.findByRole('dialog')
    expect([...popup.children].map((child) => child.tagName)).toEqual(['DIV', 'BUTTON'])
    expect(popup.lastElementChild).toBe(x())
  })

  for (const placement of ['start', 'end', 'top', 'bottom'] as const) {
    it(`ends a ${placement} sheet, and closes it`, async () => {
      render(
        <DrawerRoot defaultOpen placement={placement}>
          <DrawerPopup><DrawerHeader><DrawerTitle>Sheet</DrawerTitle></DrawerHeader></DrawerPopup>
        </DrawerRoot>,
      )
      const popup = await screen.findByRole('dialog')
      expect(popup.lastElementChild).toBe(x())
      await userEvent.click(x())
      await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    })
  }
})

describe('the grabber', () => {
  it('starts a bottom sheet: a div hidden from assistive technology, before the header', async () => {
    render(<Filters defaultOpen placement="bottom" />)
    const popup = await screen.findByRole('dialog')
    expect([...popup.children].map((child) => child.tagName)).toEqual(['DIV', 'DIV', 'DIV', 'DIV', 'BUTTON'])
    const grabber = popup.firstElementChild
    expect(grabber?.getAttribute('aria-hidden')).toBe('true')
    expect(grabber?.textContent).toBe('')
    expect(grabber?.children).toHaveLength(0)
    expect(popup.children[1]?.textContent).toBe('Filter the listNarrow the list of projects.')
  })

  for (const placement of ['start', 'end', 'top'] as const) {
    it(`is not drawn on a ${placement} sheet`, async () => {
      render(<Filters defaultOpen placement={placement} />)
      const popup = await screen.findByRole('dialog')
      expect(popup.querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(0)
      expect(popup.firstElementChild?.querySelector('h2')?.textContent).toBe('Filter the list')
    })
  }
})
