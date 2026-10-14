import { render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NavbarBrand, NavbarRoot } from '../index.js'

interface Watch { target: Element, box: string | undefined }

/** happy-dom lays nothing out, so the observer is a stub the test fires by hand. */
class Observer {
  static made: Observer[] = []
  watched: Watch[] = []
  disconnected = false
  constructor(readonly fire: () => void) { Observer.made.push(this) }
  observe(target: Element, options?: { box?: string }) { this.watched.push({ target, box: options?.box }) }
  unobserve() { return undefined }
  disconnect() { this.disconnected = true }
}

/** The height the stubbed layout gives every header; anything else measures 0, as in happy-dom. */
let height = 60

const variable = () => document.documentElement.style.getPropertyValue('--tc-sticky-top')
function resize(to: number): void {
  act(() => {
    height = to
    for (const observer of Observer.made) if (!observer.disconnected) observer.fire()
  })
}

beforeEach(() => {
  height = 60
  Observer.made = []
  vi.stubGlobal('ResizeObserver', Observer)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function measure(this: HTMLElement) {
    return { x: 0, y: 0, left: 0, top: 0, width: 320, right: 320, height: this.tagName === 'HEADER' ? height : 0, bottom: 0, toJSON: () => ({}) }
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('style')
})

const bar = (sticky?: boolean) => (
  <NavbarRoot sticky={sticky}>
    <NavbarBrand href="/">TopClass UI</NavbarBrand>
  </NavbarRoot>
)

// R-10.5-3: the bar tells the page how tall it is, and the page keeps that much clear.
describe('a sticky bar publishes its height', () => {
  it('writes the height of the header to --tc-sticky-top on the root element, in px', () => {
    render(bar())
    expect(variable()).toBe('60px')
  })

  it('writes it on mount, before any resize is reported', () => {
    render(bar())
    expect(Observer.made).toHaveLength(1)
    expect(variable()).toBe('60px')
  })

  it('follows the bar when it grows by a row, and when it shrinks back', () => {
    render(bar())
    resize(85)
    expect(variable()).toBe('85px')
    resize(60)
    expect(variable()).toBe('60px')
  })

  it('rounds a fraction up, so the bar never covers part of a pixel of what lands under it', () => {
    render(bar())
    resize(60.25)
    expect(variable()).toBe('61px')
  })

  it('watches the header itself, by its border box: a safe area that grows changes the padding', () => {
    const { container } = render(bar())
    const [observer] = Observer.made
    expect(observer?.watched).toHaveLength(1)
    expect(observer?.watched[0]?.target).toBe(container.querySelector('header'))
    expect(observer?.watched[0]?.box).toBe('border-box')
  })

  it('measures the header, not the hidden span that carries the effect', () => {
    const { container } = render(bar())
    const span = container.querySelector('header > span[hidden]')
    expect(span).not.toBeNull()
    expect(span?.parentElement?.tagName).toBe('HEADER')
    expect(variable()).toBe('60px')
  })
})

describe('the variable goes when the bar goes', () => {
  it('is removed when the bar unmounts, as on a client navigation to a page without it', () => {
    const { unmount } = render(bar())
    expect(variable()).toBe('60px')
    unmount()
    expect(variable()).toBe('')
    expect(document.documentElement.getAttribute('style') ?? '').not.toContain('--tc-sticky-top')
  })

  it('stops watching: the observer is disconnected, so no later resize can write it back', () => {
    const { unmount } = render(bar())
    const [observer] = Observer.made
    expect(observer?.disconnected).toBe(false)
    unmount()
    expect(observer?.disconnected).toBe(true)
  })

  it('is removed when the bar stops being sticky', () => {
    const { rerender } = render(bar())
    expect(variable()).toBe('60px')
    rerender(bar(false))
    expect(variable()).toBe('')
  })

  it('leaves the other custom properties of the root element alone', () => {
    document.documentElement.style.setProperty('--tc-density', '0.8')
    const { unmount } = render(bar())
    unmount()
    expect(document.documentElement.style.getPropertyValue('--tc-density')).toBe('0.8')
  })
})

describe('a bar that is not sticky', () => {
  it('writes nothing and watches nothing: it has no client part', () => {
    const { container } = render(bar(false))
    expect(variable()).toBe('')
    expect(Observer.made).toEqual([])
    expect(container.querySelector('span[hidden]')).toBeNull()
  })

  it('beside a sticky one, leaves that one\'s height in place', () => {
    render(<>{bar()}{bar(false)}</>)
    expect(Observer.made).toHaveLength(1)
    expect(variable()).toBe('60px')
  })
})
