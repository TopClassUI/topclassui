import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Dialog } from '@base-ui/react/dialog'
import type { Drawer } from '@base-ui/react/drawer'
import type { Menu } from '@base-ui/react/menu'
import type { Popover } from '@base-ui/react/popover'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { importedModules } from '../../scripts/lib/source-checks.js'
import { guardEscape } from './overlay.js'

/** What Base UI hands onOpenChange, with spies where the guard is expected to answer. No DOM in this project. */
function details(reason: string, target: unknown = null) {
  return { reason, event: { target: target as EventTarget | null }, cancel: vi.fn(), allowPropagation: vi.fn() }
}

/** A key target inside a popup whose querySelector answers as told: an open trigger, or none. */
const pressedIn = (openTrigger: object | null) => ({ closest: () => ({ querySelector: () => openTrigger }) })

/** A key target that records what it is asked for, and the popup it answers with, which records the same. */
function recording() {
  const asked: string[] = []
  const target = { closest: (selector: string) => { asked.push(selector); return { querySelector: (inner: string) => { asked.push(inner); return null } } } }
  return { asked, target }
}

describe('guardEscape: the handler a root gives Base UI', () => {
  it('passes an open, and a close for any other reason, straight to the caller', () => {
    const caller = vi.fn()
    const guarded = guardEscape(caller)
    const [opening, outside] = [details('trigger-press'), details('outside-press')]
    guarded(true, opening)
    guarded(false, outside)
    expect(caller.mock.calls).toEqual([[true, opening], [false, outside]])
    expect(outside.cancel).not.toHaveBeenCalled()
  })

  it('passes an Escape on, when the key did not come from an element at all', () => {
    const caller = vi.fn()
    const escape = details('escape-key', null)
    guardEscape(caller)(false, escape)
    expect(caller).toHaveBeenCalledTimes(1)
    expect(escape.cancel).not.toHaveBeenCalled()
    expect(escape.allowPropagation).not.toHaveBeenCalled()
  })

  it('works with no caller, as an uncontrolled overlay has none', () => {
    expect(() => { guardEscape(undefined)(false, details('escape-key')) }).not.toThrow()
  })

  it('cancels an Escape pressed in a popup that holds an open popup, lets the key travel on, and tells no one', () => {
    const caller = vi.fn()
    const escape = details('escape-key', pressedIn({}))
    guardEscape(caller)(false, escape)
    expect(escape.cancel).toHaveBeenCalledTimes(1)
    expect(escape.allowPropagation).toHaveBeenCalledTimes(1)
    expect(caller).not.toHaveBeenCalled()
  })

  it('lets the same key close a popup that holds no open popup', () => {
    const caller = vi.fn()
    const escape = details('escape-key', pressedIn(null))
    guardEscape(caller)(false, escape)
    expect(escape.cancel).not.toHaveBeenCalled()
    expect(caller).toHaveBeenCalledTimes(1)
  })

  it('cancels nothing for a press outside, even with a popup open inside', () => {
    const caller = vi.fn()
    const outside = details('outside-press', pressedIn({}))
    guardEscape(caller)(false, outside)
    expect(outside.cancel).not.toHaveBeenCalled()
    expect(caller).toHaveBeenCalledTimes(1)
  })

  it('never cancels an Escape that opens, which no overlay sends but a caller might', () => {
    const escape = details('escape-key', pressedIn({}))
    guardEscape(undefined)(true, escape)
    expect(escape.cancel).not.toHaveBeenCalled()
  })
})

describe('guardEscape: the popup it looks inside', () => {
  it('with no selector it asks the target for its dialog by role, dialog or alertdialog, and the dialog for an open trigger', () => {
    const { asked, target } = recording()
    guardEscape(undefined)(false, details('escape-key', target))
    expect(asked).toEqual(['[role="dialog"], [role="alertdialog"]', '[data-popup-open]'])
  })

  it('with a selector of its own, as a menu passes, it asks for that popup and no dialog', () => {
    const { asked, target } = recording()
    guardEscape(undefined, '[role="menu"]')(false, details('escape-key', target))
    expect(asked).toEqual(['[role="menu"]', '[data-popup-open]'])
  })

  it('a key pressed outside every such popup closes as before: the target has none to look inside', () => {
    const caller = vi.fn()
    const escape = details('escape-key', { closest: () => null })
    guardEscape(caller, '[role="menu"]')(false, escape)
    expect(escape.cancel).not.toHaveBeenCalled()
    expect(caller).toHaveBeenCalledTimes(1)
  })
})

// The details differ from root to root by their reasons only: the guard takes any, and hands back that root's own handler.
describe('guardEscape: the handler it returns is the one each root asks for', () => {
  type Handler<Props extends { onOpenChange?: unknown }> = NonNullable<Props['onOpenChange']>

  it('a dialog, a drawer, a popover and a menu', () => {
    expectTypeOf(guardEscape(undefined as Dialog.Root.Props['onOpenChange'])).toEqualTypeOf<Handler<Dialog.Root.Props>>()
    expectTypeOf(guardEscape(undefined as Drawer.Root.Props['onOpenChange'])).toEqualTypeOf<Handler<Drawer.Root.Props>>()
    expectTypeOf(guardEscape(undefined as Popover.Root.Props['onOpenChange'])).toEqualTypeOf<Handler<Popover.Root.Props>>()
    expectTypeOf(guardEscape(undefined as Menu.Root.Props['onOpenChange'], '[role="menu"]')).toEqualTypeOf<Handler<Menu.Root.Props>>()
  })

  it('refuses a handler whose details cannot be cancelled', () => {
    // @ts-expect-error a plain (open: boolean, event: Event) handler is not an onOpenChange of Base UI.
    guardEscape((open: boolean, event: Event) => [open, event.type])
  })
})

describe('overlay.ts is pure', () => {
  it('imports nothing at all: no React, no DOM type at runtime, so a lib.ts or a server file may import it', () => {
    expect(importedModules(readFileSync(join(import.meta.dirname, 'overlay.ts'), 'utf8'))).toEqual([])
  })
})
