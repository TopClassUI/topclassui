import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { guardEscape } from './overlay.js'

/** The details of an Escape pressed on an element, with spies where the guard answers. */
const escapeOn = (target: Element) => ({ reason: 'escape-key', event: { target }, cancel: vi.fn(), allowPropagation: vi.fn() })

/** A popup of one role holding a field and a trigger, whose own popup is open or not. */
function Popup({ role, open }: { role: string, open: boolean }) {
  return (
    <div role={role} aria-label="Popup">
      <input aria-label="Field" />
      <button type="button" data-popup-open={open ? '' : undefined}>More</button>
    </div>
  )
}

// The node tests answer closest() and querySelector() by hand; here the real selectors meet real elements.
describe('guardEscape reads the document it is pressed in', () => {
  it('cancels a key pressed in a field of a dialog whose other control shows its popup open', () => {
    render(<Popup role="dialog" open />)
    const escape = escapeOn(screen.getByLabelText('Field'))
    guardEscape(undefined)(false, escape)
    expect([escape.cancel.mock.calls.length, escape.allowPropagation.mock.calls.length]).toEqual([1, 1])
  })

  it('cancels it in an alertdialog as well', () => {
    render(<Popup role="alertdialog" open />)
    const escape = escapeOn(screen.getByLabelText('Field'))
    guardEscape(undefined)(false, escape)
    expect(escape.cancel).toHaveBeenCalledTimes(1)
  })

  it('lets the key close a dialog in which no popup is open', () => {
    render(<Popup role="dialog" open={false} />)
    const caller = vi.fn()
    const escape = escapeOn(screen.getByLabelText('Field'))
    guardEscape(caller)(false, escape)
    expect(escape.cancel).not.toHaveBeenCalled()
    expect(caller).toHaveBeenCalledTimes(1)
  })

  it('does not look inside a menu unless it is told to: the default is the dialog roles', () => {
    render(<Popup role="menu" open />)
    const escape = escapeOn(screen.getByLabelText('Field'))
    guardEscape(undefined)(false, escape)
    expect(escape.cancel).not.toHaveBeenCalled()
  })

  it('told to, it guards a menu the same way', () => {
    render(<Popup role="menu" open />)
    const escape = escapeOn(screen.getByLabelText('Field'))
    guardEscape(undefined, '[role="menu"]')(false, escape)
    expect([escape.cancel.mock.calls.length, escape.allowPropagation.mock.calls.length]).toEqual([1, 1])
  })

  it('a popup open elsewhere on the page, outside the one the key was pressed in, is none of its business', () => {
    render(<><Popup role="dialog" open={false} /><button type="button" data-popup-open="">Elsewhere</button></>)
    const escape = escapeOn(screen.getByLabelText('Field'))
    guardEscape(undefined)(false, escape)
    expect(escape.cancel).not.toHaveBeenCalled()
  })
})
