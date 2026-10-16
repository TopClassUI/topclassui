import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DialogBody, DialogPopup, DialogRoot } from '../index.js'
import type { DialogBodyProps } from '../types.js'

/** happy-dom lays nothing out and its ResizeObserver never calls back, so the box and the observer are given. */
const box = { scrollHeight: 100, clientHeight: 100 }

class Sizes {
  static made: Sizes[] = []
  constructor(readonly notify: () => void) { Sizes.made.push(this) }
  observe() { return undefined }
  unobserve() { return undefined }
  disconnect() { return undefined }
}

/** What the browser does when a watched box changes size. */
const resize = () => { act(() => { for (const sizes of Sizes.made) sizes.notify() }) }

beforeEach(() => {
  Object.assign(box, { scrollHeight: 100, clientHeight: 100 })
  Sizes.made = []
  vi.stubGlobal('ResizeObserver', Sizes)
  // Only the body is given a size: every other box stays at happy-dom's zero.
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
    return this.hasAttribute('data-body') ? box.scrollHeight : 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return this.hasAttribute('data-body') ? box.clientHeight : 0
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function body(props: DialogBodyProps = {}) {
  const view = render(
    <DialogRoot defaultOpen>
      <DialogPopup aria-label="Terms"><DialogBody data-body="" {...props}>Forty clauses.</DialogBody></DialogPopup>
    </DialogRoot>,
  )
  const popup = await screen.findByRole('dialog')
  return { ...view, element: popup.firstElementChild as HTMLDivElement }
}

// How far a real body scrolls, and what Tab does then, is measured in e2e/dialog.spec.ts.
describe('the body is a tab stop only while its content overflows it', () => {
  it('takes no tabindex while everything fits', async () => {
    expect((await body()).element.hasAttribute('tabindex')).toBe(false)
  })

  it('takes tabindex 0 when its content is taller than its box', async () => {
    box.scrollHeight = 300
    expect((await body()).element.getAttribute('tabindex')).toBe('0')
  })

  it('becomes one when its box shrinks under its content, and stops being one when the box grows back', async () => {
    const { element } = await body()
    box.clientHeight = 60
    resize()
    expect(element.getAttribute('tabindex')).toBe('0')
    box.clientHeight = 100
    resize()
    expect(element.hasAttribute('tabindex')).toBe(false)
  })

  it('leaves a tabIndex of the caller alone: -1 keeps a scrolling body out of the tab order', async () => {
    box.scrollHeight = 300
    expect((await body({ tabIndex: -1 })).element.getAttribute('tabindex')).toBe('-1')
  })

  it('and 0 from the caller makes a stop of a body that does not scroll', async () => {
    expect((await body({ tabIndex: 0 })).element.getAttribute('tabindex')).toBe('0')
  })
})

describe('the ref of the caller follows the body the hook measures', () => {
  it('an object ref holds the div of the body', async () => {
    const ref = { current: null as HTMLDivElement | null }
    const { element } = await body({ ref })
    expect(ref.current).toBe(element)
    expect(ref.current?.textContent).toBe('Forty clauses.')
  })

  it('a callback ref is given the div, and null when the body leaves', async () => {
    const seen: (string | null)[] = []
    const { unmount } = await body({ ref: (node) => { seen.push(node ? node.tagName : null) } })
    expect(seen).toEqual(['DIV'])
    unmount()
    expect(seen).toEqual(['DIV', null])
  })

  it('the div the caller holds is the one that becomes the tab stop', async () => {
    box.scrollHeight = 300
    const ref = { current: null as HTMLDivElement | null }
    await body({ ref })
    expect(ref.current?.getAttribute('tabindex')).toBe('0')
  })

  it('with no ref at all the body still measures itself', async () => {
    box.scrollHeight = 300
    expect((await body()).element.getAttribute('tabindex')).toBe('0')
  })
})
