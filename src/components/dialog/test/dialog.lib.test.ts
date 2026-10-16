import { describe, expect, it, vi } from 'vitest'

import { guardEscape, hasContent } from '../lib.js'
import type { DialogRootProps } from '../types.js'

type Details = Parameters<NonNullable<DialogRootProps['onOpenChange']>>[1]

/** What Base UI hands onOpenChange, with spies where the guard is expected to answer. No DOM in this project. */
function details(reason: string, target: unknown = null) {
  const made = { reason, event: { target }, cancel: vi.fn(), allowPropagation: vi.fn() }
  return { made, sent: made as unknown as Details }
}

describe('hasContent: whether children draw anything', () => {
  it('is false for what React draws nothing for', () => {
    expect([null, undefined, false, true, ''].map(hasContent)).toEqual([false, false, false, false, false])
  })

  it('is true for text, a number, zero and an element', () => {
    expect(['Cancel', 3, 0, { type: 'span' }].map(hasContent)).toEqual([true, true, true, true])
  })

  it('reads a list by its items: empty or all blank is no content, one item that draws is', () => {
    expect([[], [false, null, ''], [false, 'Cancel'], [[null], [0]]].map(hasContent)).toEqual([false, false, true, true])
  })
})

describe('guardEscape: the handler the root gives Base UI', () => {
  it('passes an open, and a close for any other reason, straight to the caller', () => {
    const caller = vi.fn()
    const guarded = guardEscape(caller)
    const [opening, outside] = [details('trigger-press'), details('outside-press')]
    guarded(true, opening.sent)
    guarded(false, outside.sent)
    expect(caller.mock.calls).toEqual([[true, opening.sent], [false, outside.sent]])
    expect(outside.made.cancel).not.toHaveBeenCalled()
  })

  it('passes an Escape on, when the key did not come from an element at all', () => {
    const caller = vi.fn()
    const escape = details('escape-key', null)
    guardEscape(caller)(false, escape.sent)
    expect(caller).toHaveBeenCalledTimes(1)
    expect(escape.made.cancel).not.toHaveBeenCalled()
    expect(escape.made.allowPropagation).not.toHaveBeenCalled()
  })

  it('works with no caller, as an uncontrolled dialog has none', () => {
    expect(() => { guardEscape(undefined)(false, details('escape-key').sent) }).not.toThrow()
  })

  /** A key target inside a dialog whose querySelector answers as told: an open trigger, or none. */
  const pressedIn = (openTrigger: object | null) => ({ closest: () => ({ querySelector: () => openTrigger }) })

  it('cancels an Escape pressed in a dialog that holds an open popup, lets the key travel on, and tells no one', () => {
    const caller = vi.fn()
    const escape = details('escape-key', pressedIn({}))
    guardEscape(caller)(false, escape.sent)
    expect(escape.made.cancel).toHaveBeenCalledTimes(1)
    expect(escape.made.allowPropagation).toHaveBeenCalledTimes(1)
    expect(caller).not.toHaveBeenCalled()
  })

  it('lets the same key close a dialog that holds no open popup', () => {
    const caller = vi.fn()
    const escape = details('escape-key', pressedIn(null))
    guardEscape(caller)(false, escape.sent)
    expect(escape.made.cancel).not.toHaveBeenCalled()
    expect(caller).toHaveBeenCalledTimes(1)
  })

  it('cancels nothing for a press outside, even with a popup open inside', () => {
    const caller = vi.fn()
    const outside = details('outside-press', pressedIn({}))
    guardEscape(caller)(false, outside.sent)
    expect(outside.made.cancel).not.toHaveBeenCalled()
    expect(caller).toHaveBeenCalledTimes(1)
  })

  it('asks the target for its dialog by role, dialog or alertdialog, and the dialog for a trigger that shows its popup open', () => {
    const asked: string[] = []
    const target = { closest: (selector: string) => { asked.push(selector); return { querySelector: (inner: string) => { asked.push(inner); return null } } } }
    guardEscape(undefined)(false, details('escape-key', target).sent)
    expect(asked).toEqual(['[role="dialog"], [role="alertdialog"]', '[data-popup-open]'])
  })
})
