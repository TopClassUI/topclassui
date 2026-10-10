import { act, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode, useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useScrollTabStop } from './use-scroll-tab-stop.js'

/** happy-dom lays nothing out and its ResizeObserver never calls back, so the box and the observer are given. */
const box = { scrollHeight: 100, clientHeight: 100, scrollWidth: 200, clientWidth: 200 }

class Sizes {
  static made: Sizes[] = []
  readonly watched = new Set<Element>()
  disconnected = false
  constructor(readonly notify: () => void) { Sizes.made.push(this) }
  observe(target: Element) { this.watched.add(target) }
  unobserve(target: Element) { this.watched.delete(target) }
  disconnect() { this.disconnected = true }
}

/** What the browser does when a watched box changes size. */
const resize = () => { act(() => { for (const sizes of Sizes.made) sizes.notify() }) }

beforeEach(() => {
  Object.assign(box, { scrollHeight: 100, clientHeight: 100, scrollWidth: 200, clientWidth: 200 })
  Sizes.made = []
  vi.stubGlobal('ResizeObserver', Sizes)
  // happy-dom keeps the scroll sizes on Element and the client sizes on HTMLElement.
  for (const side of ['scrollHeight', 'scrollWidth'] as const) {
    vi.spyOn(Element.prototype, side, 'get').mockImplementation(function (this: Element) {
      return this.hasAttribute('data-region') ? box[side] : 0
    })
  }
  for (const side of ['clientHeight', 'clientWidth'] as const) {
    vi.spyOn(HTMLElement.prototype, side, 'get').mockImplementation(function (this: Element) {
      return this.hasAttribute('data-region') ? box[side] : 0
    })
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function Region({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  return <div ref={ref} data-region="" data-testid="region" tabIndex={useScrollTabStop(ref)}>{children}</div>
}

const region = () => screen.getByTestId('region')
const tabStop = () => region().getAttribute('tabindex')

describe('a region is a tab stop only while its content overflows its box', () => {
  it('has no tabindex while the content fits', () => {
    render(<Region><p>One</p></Region>)
    expect(region().hasAttribute('tabindex')).toBe(false)
  })

  it('is a tab stop when the content is taller than the box', () => {
    box.scrollHeight = 300
    render(<Region><p>One</p></Region>)
    expect(tabStop()).toBe('0')
  })

  it('is a tab stop when the content is only wider than the box', () => {
    box.scrollWidth = 500
    render(<Region><p>One</p></Region>)
    expect(tabStop()).toBe('0')
  })

  it('is not one for a single pixel, which rounding at a fractional zoom reports on a box that does not scroll', () => {
    box.scrollHeight = 101
    box.scrollWidth = 201
    render(<Region><p>One</p></Region>)
    expect(region().hasAttribute('tabindex')).toBe(false)
  })

  it('is one from two pixels on', () => {
    box.scrollHeight = 102
    render(<Region><p>One</p></Region>)
    expect(tabStop()).toBe('0')
  })
})

describe('it follows the box and the content', () => {
  it('becomes a tab stop when the box shrinks under the content', () => {
    render(<Region><p>One</p></Region>)
    box.clientHeight = 40
    resize()
    expect(tabStop()).toBe('0')
  })

  it('stops being one when the content shrinks back inside the box', () => {
    box.scrollHeight = 300
    render(<Region><p>One</p></Region>)
    box.scrollHeight = 100
    resize()
    expect(region().hasAttribute('tabindex')).toBe(false)
  })

  it('watches the region and each child, since a child that grows leaves the box of the region as it was', () => {
    render(<Region><p>One</p><p>Two</p></Region>)
    expect(Sizes.made).toHaveLength(1)
    expect([...(Sizes.made[0]?.watched ?? [])]).toEqual([region(), screen.getByText('One'), screen.getByText('Two')])
  })

  it('watches a child that arrives later, and measures as it arrives', async () => {
    const { rerender } = render(<Region><p>One</p></Region>)
    box.scrollHeight = 300
    rerender(<Region><p>One</p><p>Two</p></Region>)
    await waitFor(() => { expect(tabStop()).toBe('0') })
    expect(Sizes.made[0]?.watched.has(screen.getByText('Two'))).toBe(true)
  })

  it('lets go of a child that leaves, and measures as it goes', async () => {
    box.scrollHeight = 300
    const { rerender } = render(<Region><p>One</p><p>Two</p></Region>)
    const gone = screen.getByText('Two')
    box.scrollHeight = 100
    rerender(<Region><p>One</p></Region>)
    await waitFor(() => { expect(region().hasAttribute('tabindex')).toBe(false) })
    expect(Sizes.made[0]?.watched.has(gone)).toBe(false)
    expect(Sizes.made[0]?.watched.has(screen.getByText('One'))).toBe(true)
  })

  it('hears text written straight on the region, which resizes no child at all', async () => {
    const { rerender } = render(<Region>Saved {1} file</Region>)
    box.scrollHeight = 300
    rerender(<Region>Saved {4000} file</Region>)
    await waitFor(() => { expect(tabStop()).toBe('0') })
  })

  it('hears text that changes deep inside a child too', async () => {
    const { rerender } = render(<Region><p><span>Saved {1} file</span></p></Region>)
    box.scrollHeight = 300
    rerender(<Region><p><span>Saved {4000} file</span></p></Region>)
    await waitFor(() => { expect(tabStop()).toBe('0') })
  })
})

describe('the region that has focus keeps its tab stop', () => {
  it('until the focus leaves it, so the focus never falls to the body', () => {
    box.scrollHeight = 300
    render(<Region><p>One</p></Region>)
    act(() => { region().focus() })
    expect(document.activeElement).toBe(region())

    box.scrollHeight = 100
    resize()
    expect(tabStop()).toBe('0')
    expect(document.activeElement).toBe(region())

    act(() => { region().blur() })
    expect(region().hasAttribute('tabindex')).toBe(false)
  })

  it('and keeps it after the blur while the content still overflows', () => {
    box.scrollHeight = 300
    render(<Region><p>One</p></Region>)
    act(() => { region().focus() })
    act(() => { region().blur() })
    expect(tabStop()).toBe('0')
  })
})

describe('what it leaves behind', () => {
  it('stops both observers and the blur listener when the region unmounts', () => {
    const stopped = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const { unmount } = render(<Region><p>One</p></Region>)
    const element = region()
    const removed = vi.spyOn(element, 'removeEventListener')
    unmount()
    expect(Sizes.made[0]?.disconnected).toBe(true)
    expect(stopped).toHaveBeenCalledTimes(1)
    expect(removed.mock.calls.map(([type]) => type)).toEqual(['blur'])
  })

  it('does nothing for a ref that holds no element', () => {
    function Absent() {
      const ref = useRef<HTMLDivElement>(null)
      return <p data-testid="value">{String(useScrollTabStop(ref))}</p>
    }
    render(<Absent />)
    expect(screen.getByTestId('value').textContent).toBe('undefined')
    expect(Sizes.made).toEqual([])
  })
})
