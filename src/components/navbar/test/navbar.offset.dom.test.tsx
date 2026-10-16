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
/** The top of an element on the screen, by its id: 0 for any other, as in happy-dom. */
const tops = new Map<string, number>()
/** The height of the screen with the address bar shown, as the root element reports it. */
let screenHeight = 768

const variable = () => document.documentElement.style.getPropertyValue('--tc-sticky-top')
function resize(to: number): void {
  act(() => {
    height = to
    for (const observer of Observer.made) if (!observer.disconnected) observer.fire()
  })
}

beforeEach(() => {
  height = 60
  screenHeight = 768
  Observer.made = []
  vi.stubGlobal('ResizeObserver', Observer)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function measure(this: HTMLElement) {
    return { x: 0, y: 0, left: 0, top: tops.get(this.id) ?? 0, width: 320, right: 320, height: this.tagName === 'HEADER' ? height : 0, bottom: 0, toJSON: () => ({}) }
  })
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockImplementation(() => screenHeight)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('style')
  tops.clear()
  history.replaceState(null, '', location.pathname)
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

// The browser scrolls to an #anchor before the script has written the height: the hook brings it clear once.
describe('a page opened at an #anchor', () => {
  /** A heading with that id, put where the stubbed layout says, after the bar in the page. */
  function openAt(hash: string, id: string, top: number) {
    history.replaceState(null, '', `${location.pathname}${hash}`)
    tops.set(id, top)
    const scrolled = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => undefined)
    const { container } = render(<>{bar()}<h2 id={id}>Theming</h2></>)
    return { scrolled, heading: container.querySelector('h2') }
  }

  it('brings the target clear of the bar once, when it still lies where the browser put it', () => {
    const { scrolled, heading } = openAt('#theming', 'theming', 0)
    expect(variable()).toBe('60px')
    expect(scrolled).toHaveBeenCalledTimes(1)
    expect(scrolled.mock.contexts[0]).toBe(heading)
    resize(85)
    act(() => { window.dispatchEvent(new Event('resize')) })
    expect(scrolled).toHaveBeenCalledTimes(1)
  })

  it('leaves a target the reader has scrolled away from, or that the page could not bring to the top', () => {
    const { scrolled } = openAt('#theming', 'theming', 340)
    expect(scrolled).not.toHaveBeenCalled()
  })

  it('finds an id written with escapes, as the browser does', () => {
    const { scrolled, heading } = openAt('#caf%C3%A9', 'café', 0)
    expect(scrolled.mock.contexts).toEqual([heading])
  })

  it('does nothing for a fragment that names nothing', () => {
    expect(openAt('#nowhere', 'theming', 0).scrolled).not.toHaveBeenCalled()
  })

  it('does not throw on a stray %, and writes the height all the same', () => {
    const { scrolled } = openAt('#100%', 'theming', 0)
    expect(scrolled).not.toHaveBeenCalled()
    expect(variable()).toBe('60px')
  })

  it('does nothing on a page opened without a fragment', () => {
    const { scrolled } = openAt('', 'theming', 0)
    expect(scrolled).not.toHaveBeenCalled()
  })
})
