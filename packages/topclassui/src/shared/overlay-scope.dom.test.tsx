import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { guardEscape, toScopeSelector } from './overlay.js'
import { OverlayScopeContext, useOverlayRoot, useOverlayScope } from './overlay-scope.js'

/** The details of an Escape pressed on an element, with spies where the guard answers. */
const escapeOn = (target: Element) => ({ reason: 'escape-key', event: { target }, cancel: vi.fn(), allowPropagation: vi.fn() })

/** An outer dialog holding the open trigger of an inner overlay, whose own popup is portaled elsewhere. */
function Nested() {
  return (
    <>
      <div role="dialog" aria-label="Outer" data-overlay="outer">
        <button type="button" data-popup-open="">Inner trigger</button>
      </div>
      <div role="dialog" aria-label="Inner" data-overlay="inner" />
    </>
  )
}

describe('focus back on the trigger of an overlay nested in a dialog', () => {
  it('scoped to its own popup, the inner overlay lets Escape close it', () => {
    render(<Nested />)
    const caller = vi.fn()
    const escape = escapeOn(screen.getByText('Inner trigger'))
    guardEscape(caller, toScopeSelector('inner'))(false, escape)
    expect([escape.cancel.mock.calls.length, caller.mock.calls.length]).toEqual([0, 1])
  })

  it('scoped to its own popup, the outer dialog still waits for the overlay open inside it', () => {
    render(<Nested />)
    const caller = vi.fn()
    const escape = escapeOn(screen.getByText('Inner trigger'))
    guardEscape(caller, toScopeSelector('outer'))(false, escape)
    expect([escape.cancel.mock.calls.length, caller.mock.calls.length]).toEqual([1, 0])
  })

  it('with the roles of every dialog, the inner overlay found its own trigger open and swallowed the key', () => {
    render(<Nested />)
    const caller = vi.fn()
    const escape = escapeOn(screen.getByText('Inner trigger'))
    guardEscape(caller)(false, escape)
    expect([escape.cancel.mock.calls.length, caller.mock.calls.length]).toEqual([1, 0])
  })
})

/** A root that hands its scope to a popup holding an open trigger, and exposes its guard. */
function Root({ name, onGuard, children }: { name: string, onGuard: (guard: ReturnType<typeof useOverlayRoot>) => void, children?: ReactNode }) {
  const root = useOverlayRoot(undefined)
  onGuard(root)
  return <OverlayScopeContext value={root.scope}><Popup name={name}>{children}</Popup></OverlayScopeContext>
}

function Popup({ name, children }: { name: string, children?: ReactNode }) {
  return (
    <div role="dialog" aria-label={name} data-overlay={useOverlayScope()}>
      <button type="button" data-popup-open="">{`${name} trigger`}</button>
      {children}
    </div>
  )
}

describe('useOverlayRoot gives each root its own scope and a guard that reads only that one', () => {
  it('writes a scope on the popup that is not empty and not its neighbour\'s', () => {
    render(<><Root name="One" onGuard={() => undefined} /><Root name="Two" onGuard={() => undefined} /></>)
    const one = screen.getByRole('dialog', { name: 'One' }).getAttribute('data-overlay') ?? ''
    const two = screen.getByRole('dialog', { name: 'Two' }).getAttribute('data-overlay') ?? ''
    expect(one).not.toBe('')
    expect(two).not.toBe('')
    expect(one).not.toBe(two)
  })

  it('cancels a key pressed in its own popup while a trigger there is open, and not one pressed in another popup', () => {
    let guard: ReturnType<typeof useOverlayRoot> | undefined
    render(<><Root name="Own" onGuard={(g) => { guard = g }} /><Popup name="Other" /></>)
    const inOwn = escapeOn(screen.getByText('Own trigger'))
    const inOther = escapeOn(screen.getByText('Other trigger'))
    guard?.onOpenChange(false, inOwn)
    guard?.onOpenChange(false, inOther)
    expect([inOwn.cancel.mock.calls.length, inOther.cancel.mock.calls.length]).toEqual([1, 0])
  })
})
