import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverRootProps } from '../types.js'

/** The drawing: a title, a line of text and one action, with a second popover beside it. */
function Share(props: PopoverRootProps) {
  return (
    <>
      <PopoverRoot {...props}>
        <PopoverTrigger render={<Button variant="outline">Share</Button>} />
        <PopoverPopup>
          <PopoverTitle>Share this page</PopoverTitle>
          <PopoverDescription>Anyone with the link can read it.</PopoverDescription>
          <PopoverClose render={<Button>Done</Button>} />
        </PopoverPopup>
      </PopoverRoot>
      <Button>After</Button>
    </>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Share' })
const dialog = () => screen.queryByRole('dialog')

/** Clicks the trigger and returns the popup once Base UI has moved focus into it. */
async function open() {
  await userEvent.click(trigger())
  const popup = await screen.findByRole('dialog')
  await waitFor(() => { expect(popup.contains(document.activeElement)).toBe(true) })
  return popup
}

const closed = () => waitFor(() => { expect(dialog()).toBeNull() })

// Where the popup lands, what scrolls and what Tab does are measured in e2e/popover.spec.ts.
describe('the trigger', () => {
  it('says what it opens and that it is closed, and names no popup yet', () => {
    render(<Share />)
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().hasAttribute('aria-controls')).toBe(false)
    expect(dialog()).toBeNull()
  })

  it('opens the popup on a press, says so, and names it by its id', async () => {
    render(<Share />)
    const popup = await open()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().hasAttribute('data-popup-open')).toBe(true)
    expect(popup.id).not.toBe('')
    expect(trigger().getAttribute('aria-controls')).toBe(popup.id)
  })

  it('closes it on a second press', async () => {
    render(<Share />)
    await open()
    await userEvent.click(trigger())
    await closed()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('stays shut when it is disabled, and is disabled natively', async () => {
    render(
      <PopoverRoot>
        <PopoverTrigger disabled render={<Button>Share</Button>} />
        <PopoverPopup><PopoverTitle>Share this page</PopoverTitle></PopoverPopup>
      </PopoverRoot>,
    )
    expect((trigger() as HTMLButtonElement).disabled).toBe(true)
    await userEvent.click(trigger())
    expect(dialog()).toBeNull()
  })
})

describe('the popup', () => {
  it('is a dialog named by its title and described by its description', async () => {
    render(<Share />)
    const popup = await open()
    expect(popup.getAttribute('role')).toBe('dialog')
    expect(screen.getByRole('dialog', { name: 'Share this page' })).toBe(popup)
    const describedBy = popup.getAttribute('aria-describedby') ?? ''
    expect(document.getElementById(describedBy)?.textContent).toBe('Anyone with the link can read it.')
  })

  it('renders the title as an h2 and the description as a paragraph', async () => {
    render(<Share />)
    const popup = await open()
    expect(popup.querySelector('h2')?.textContent).toBe('Share this page')
    expect(popup.querySelector('p')?.textContent).toBe('Anyone with the link can read it.')
  })

  it('is portaled out of the tree that renders it, into the body', async () => {
    const { container } = render(<Share />)
    const popup = await open()
    expect(container.contains(popup)).toBe(false)
    expect(document.body.contains(popup)).toBe(true)
    expect(popup.closest('[data-base-ui-portal]')).not.toBeNull()
  })

  it('moves the first focus to its first control', async () => {
    render(<Share />)
    await open()
    expect(document.activeElement?.textContent).toBe('Done')
  })

  it('closes on Escape and hands the focus back to the trigger', async () => {
    render(<Share />)
    await open()
    await userEvent.keyboard('{Escape}')
    await closed()
    expect(document.activeElement).toBe(trigger())
  })

  it('closes on its PopoverClose', async () => {
    render(<Share />)
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await closed()
  })

  it('closes on a press outside it, and that press reaches what it landed on: no layer covers the page', async () => {
    const onClick = vi.fn()
    render(<><Share /><button type="button" onClick={onClick}>Outside</button></>)
    await open()
    expect(document.querySelector('[data-base-ui-portal] > [data-base-ui-inert]')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
    await closed()
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('the root passes its props to Base UI', () => {
  it('defaultOpen opens it with no press', async () => {
    render(<Share defaultOpen />)
    expect((await screen.findByRole('dialog')).hasAttribute('data-open')).toBe(true)
  })

  it('tells onOpenChange each change and why', async () => {
    const onOpenChange = vi.fn()
    render(<Share onOpenChange={onOpenChange} />)
    await open()
    await userEvent.keyboard('{Escape}')
    await closed()
    const calls = onOpenChange.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason])
    expect(calls).toEqual([[true, 'trigger-press'], [false, 'escape-key']])
  })

  it('a controlled popover stays as open says, and only asks to change', async () => {
    const onOpenChange = vi.fn()
    render(<Share open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    expect(onOpenChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([true])
    expect(dialog()).toBeNull()
  })

  it('is not modal unless asked: nothing of the page is hidden from a screen reader', async () => {
    render(<Share />)
    await open()
    expect(screen.getByRole('button', { name: 'After' }).closest('[aria-hidden="true"]')).toBeNull()
    expect(document.querySelector('[data-base-ui-portal] > [data-base-ui-inert]')).toBeNull()
  })

  it('modal reaches Base UI: its own layer covers the page, and with a PopoverClose inside the rest is hidden', async () => {
    render(<Share modal />)
    await open()
    expect(document.querySelectorAll('[data-base-ui-portal] > [data-base-ui-inert]')).toHaveLength(1)
    await waitFor(() => {
      expect(screen.getByText('After', { selector: 'span' }).closest('[aria-hidden="true"]')).not.toBeNull()
    })
  })

  it('trap-focus reaches Base UI too: the rest is hidden, and no layer covers the page', async () => {
    render(<Share modal="trap-focus" />)
    await open()
    expect(document.querySelector('[data-base-ui-portal] > [data-base-ui-inert]')).toBeNull()
    await waitFor(() => {
      expect(screen.getByText('After', { selector: 'span' }).closest('[aria-hidden="true"]')).not.toBeNull()
    })
  })
})
