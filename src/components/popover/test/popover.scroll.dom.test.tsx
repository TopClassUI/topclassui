import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverPopupProps } from '../types.js'

/** happy-dom lays nothing out and its ResizeObserver never calls back, so the box and the observer are given. */
const box = { scrollHeight: 100, clientHeight: 100, scrollWidth: 280, clientWidth: 280 }

class Sizes {
  static made: Sizes[] = []
  constructor(readonly notify: (entries: unknown[]) => void) { Sizes.made.push(this) }
  observe() { return undefined }
  unobserve() { return undefined }
  disconnect() { return undefined }
}

/** What the browser does when a watched box changes size. No entries: Floating UI watches too, and reads the first one. */
const resize = () => { act(() => { for (const sizes of Sizes.made) sizes.notify([]) }) }

const isPopup = (element: Element) => element.getAttribute('role') === 'dialog'

beforeEach(() => {
  Object.assign(box, { scrollHeight: 100, clientHeight: 100, scrollWidth: 280, clientWidth: 280 })
  Sizes.made = []
  vi.stubGlobal('ResizeObserver', Sizes)
  // Only the popup is given a size: every other box stays at happy-dom's zero.
  for (const key of ['scrollHeight', 'scrollWidth'] as const) {
    vi.spyOn(Element.prototype, key, 'get').mockImplementation(function (this: Element) { return isPopup(this) ? box[key] : 0 })
  }
  for (const key of ['clientHeight', 'clientWidth'] as const) {
    vi.spyOn(HTMLElement.prototype, key, 'get').mockImplementation(function (this: Element) { return isPopup(this) ? box[key] : 0 })
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

/** One control inside, so the first focus goes to it: a popup that holds the focus itself keeps its stop until it leaves. */
const tree = (props: PopoverPopupProps = {}, open = true) => (
  <PopoverRoot defaultOpen={open}>
    <PopoverTrigger render={<Button>Change log</Button>} />
    <PopoverPopup {...props}><PopoverTitle>Change log</PopoverTitle><Button>Done</Button></PopoverPopup>
  </PopoverRoot>
)

async function popup(props: PopoverPopupProps = {}) {
  const view = render(tree(props))
  return { ...view, element: await screen.findByRole<HTMLDivElement>('dialog') }
}

// How far a real popup scrolls, and what Tab does then, is measured in e2e/popover.spec.ts.
describe('the popup is a tab stop only while its content overflows it', () => {
  it('keeps the -1 of Base UI while everything fits: focusable by script, and no stop of its own', async () => {
    expect((await popup()).element.getAttribute('tabindex')).toBe('-1')
  })

  it('takes tabindex 0 when its content is taller than its box', async () => {
    box.scrollHeight = 300
    expect((await popup()).element.getAttribute('tabindex')).toBe('0')
  })

  it('and when its content is wider: a line that cannot wrap is reached the same way', async () => {
    box.scrollWidth = 580
    expect((await popup()).element.getAttribute('tabindex')).toBe('0')
  })

  it('becomes one when its box shrinks under its content, and stops being one when the box grows back', async () => {
    const { element } = await popup()
    box.clientHeight = 60
    resize()
    expect(element.getAttribute('tabindex')).toBe('0')
    box.clientHeight = 100
    resize()
    expect(element.getAttribute('tabindex')).toBe('-1')
  })

  it('leaves a tabIndex of the caller alone: -1 keeps a scrolling popup out of the tab order', async () => {
    box.scrollHeight = 300
    expect((await popup({ tabIndex: -1 })).element.getAttribute('tabindex')).toBe('-1')
  })

  it('and 0 from the caller makes a stop of a popup that does not scroll', async () => {
    expect((await popup({ tabIndex: 0 })).element.getAttribute('tabindex')).toBe('0')
  })
})

// The hook runs in a part mounted with the portal. Called from PopoverPopup, it ran once on a closed popover and never again.
describe('a popover that opens later is still measured', () => {
  it('closed at first, then opened by its trigger: its tall popup takes tabindex 0', async () => {
    box.scrollHeight = 300
    render(tree({}, false))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Change log' }))
    expect((await screen.findByRole('dialog')).getAttribute('tabindex')).toBe('0')
  })

  it('kept mounted while closed, then grown: it is measured when its box changes', () => {
    render(tree({ keepMounted: true }, false))
    const element = document.querySelector('[role="dialog"]')
    expect(element?.getAttribute('tabindex')).toBe('-1')
    box.scrollHeight = 300
    resize()
    expect(element?.getAttribute('tabindex')).toBe('0')
  })
})

describe('the ref of the caller follows the popup the hook measures', () => {
  it('an object ref holds the dialog itself', async () => {
    const ref = { current: null as HTMLDivElement | null }
    const { element } = await popup({ ref })
    expect(ref.current).toBe(element)
    expect(ref.current?.getAttribute('role')).toBe('dialog')
  })

  it('a callback ref is given the div, and null when the popup leaves', async () => {
    const seen: (string | null)[] = []
    const { unmount } = await popup({ ref: (node) => { seen.push(node ? node.tagName : null) } })
    expect(seen).toEqual(['DIV'])
    unmount()
    expect(seen).toEqual(['DIV', null])
  })

  it('the div the caller holds is the one that becomes the tab stop', async () => {
    box.scrollHeight = 300
    const ref = { current: null as HTMLDivElement | null }
    await popup({ ref })
    expect(ref.current?.getAttribute('tabindex')).toBe('0')
  })
})
