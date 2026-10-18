import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipRootProps } from '../types.js'

afterEach(() => { vi.useRealTimers() })

/** The drawn sample: an icon-only trigger whose name repeats the tooltip text. */
function Copy(props: TooltipRootProps) {
  return (
    <TooltipRoot {...props}>
      <TooltipTrigger render={<Button variant="ghost" aria-label="Copy link" />}>C</TooltipTrigger>
      <TooltipPopup>Copy link</TooltipPopup>
    </TooltipRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Copy link' })
/** The popup is found by its text; its role and its link are tooltip.aria.dom.test's. */
const popup = () => screen.queryByText('Copy link', { selector: '[data-placement]' })
const isOpen = () => trigger().hasAttribute('data-popup-open')

/** A real hover: Base UI times its delay from the pointer resting, which needs a move. */
function hover(element: HTMLElement) {
  fireEvent.mouseEnter(element)
  fireEvent.mouseMove(element)
}

describe('opening', () => {
  it('opens on hover once Base UI default 600 ms have passed, and not before', async () => {
    vi.useFakeTimers()
    render(<Copy />)
    hover(trigger())
    await act(() => { vi.advanceTimersByTime(599); return Promise.resolve() })
    expect(popup()).toBeNull()
    await act(() => { vi.advanceTimersByTime(2); return Promise.resolve() })
    expect(popup()?.textContent).toBe('Copy link')
    expect(isOpen()).toBe(true)
  })

  it('opens on keyboard focus at once, so a keyboard user gets the same text', async () => {
    render(<Copy />)
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger())
    expect(popup()?.textContent).toBe('Copy link')
  })

  it('opens from the start when asked to with defaultOpen', () => {
    render(<Copy defaultOpen />)
    expect(popup()?.textContent).toBe('Copy link')
  })
})

describe('closing', () => {
  it('closes on Escape', async () => {
    render(<Copy />)
    await userEvent.tab()
    expect(isOpen()).toBe(true)
    await userEvent.keyboard('{Escape}')
    expect(isOpen()).toBe(false)
  })

  it('closes when the pointer leaves, with no delay unless one is asked for', async () => {
    vi.useFakeTimers()
    render(<Copy />)
    hover(trigger())
    await act(() => { vi.advanceTimersByTime(601); return Promise.resolve() })
    expect(isOpen()).toBe(true)
    fireEvent.mouseLeave(trigger())
    await act(() => { vi.advanceTimersByTime(1); return Promise.resolve() })
    expect(isOpen()).toBe(false)
    expect(popup()?.hasAttribute('data-closed') ?? true).toBe(true)
  })

  it('never opens while the root is disabled, which Base UI takes untouched', async () => {
    render(<Copy disabled />)
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger())
    expect(popup()).toBeNull()
  })
})

describe('state attributes', () => {
  it('are presence attributes on every element, never data-state (R-5.7-6)', async () => {
    render(<Copy />)
    await userEvent.tab()
    const open = popup()
    expect(trigger().getAttribute('data-popup-open')).toBe('')
    expect(open?.getAttribute('data-open')).toBe('')
    expect(open?.parentElement?.getAttribute('data-open')).toBe('')
    expect(open?.lastElementChild?.getAttribute('data-open')).toBe('')
    expect(document.body.innerHTML).not.toContain('data-state')
  })
})

describe('controlled and uncontrolled both work', () => {
  it('shows the popup while open is true and reports a request to close', async () => {
    const onOpenChange = vi.fn()
    render(<Copy open onOpenChange={onOpenChange} />)
    expect(popup()?.textContent).toBe('Copy link')
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false)
    expect(popup()?.textContent).toBe('Copy link')
  })

  it('stays closed while open is false, whatever the pointer does', async () => {
    vi.useFakeTimers()
    render(<Copy open={false} />)
    hover(trigger())
    await act(() => { vi.advanceTimersByTime(1000); return Promise.resolve() })
    expect(popup()).toBeNull()
  })
})

describe('what assistive technology gets', () => {
  it('names the trigger with the tooltip text, because the popup itself is visual only', async () => {
    render(<Copy />)
    await userEvent.tab()
    expect(trigger().getAttribute('aria-label')).toBe('Copy link')
    expect(popup()?.textContent).toBe('Copy link')
  })

  it('hides the arrow, which carries no meaning', () => {
    render(<Copy defaultOpen />)
    const arrow = popup()?.lastElementChild
    expect(arrow?.getAttribute('aria-hidden')).toBe('true')
    expect(arrow?.textContent).toBe('')
  })
})

describe('ref', () => {
  it('reaches the element passed to render, through Button', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <TooltipRoot>
        <TooltipTrigger ref={ref} render={<Button aria-label="Copy link" />}>C</TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    expect(ref.current).toBe(trigger())
  })

  it('reaches the popup element, not the positioner around it', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <TooltipRoot defaultOpen>
        <TooltipTrigger render={<Button aria-label="Copy link" />}>C</TooltipTrigger>
        <TooltipPopup ref={ref}>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    expect(ref.current?.textContent).toBe('Copy link')
    expect(ref.current?.getAttribute('data-placement')).toBe('top')
  })
})

describe('the trigger is the control it is given', () => {
  it('stays a working button, so the tooltip never takes the action away', async () => {
    const onClick = vi.fn()
    render(
      <TooltipRoot>
        <TooltipTrigger render={<Button aria-label="Copy link" onClick={onClick} />}>C</TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    await userEvent.click(trigger())
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is a plain button with no class at all when nothing is passed to render', () => {
    render(
      <TooltipRoot>
        <TooltipTrigger aria-label="Copy link">C</TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    expect(trigger().tagName).toBe('BUTTON')
    expect(trigger().getAttribute('type')).toBe('button')
    expect(trigger().getAttribute('class')).toBeNull()
  })
})
