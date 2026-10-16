import { render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NavbarBrand, NavbarRoot } from '../index.js'

/** happy-dom lays nothing out, so the observer is a stub the test fires by hand. */
class Observer {
  static made: Observer[] = []
  disconnected = false
  constructor(readonly fire: () => void) { Observer.made.push(this) }
  observe() { return undefined }
  unobserve() { return undefined }
  disconnect() { this.disconnected = true }
}

/** The height the stubbed layout gives every header; anything else measures 0, as in happy-dom. */
let height = 60
/** The height of the screen with the address bar shown, as the root element reports it. */
let screenHeight = 768

const variable = () => document.documentElement.style.getPropertyValue('--tc-sticky-top')
const header = (container: HTMLElement) => container.querySelector('header')
const screen = (to: number) => { screenHeight = to }
const turn = (to: number) => { screen(to); act(() => { window.dispatchEvent(new Event('resize')) }) }
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
    return { x: 0, y: 0, left: 0, top: 0, width: 320, right: 320, height: this.tagName === 'HEADER' ? height : 0, bottom: 0, toJSON: () => ({}) }
  })
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockImplementation(() => screenHeight)
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

// At a 32 px root a phone's bar wraps to three rows: 321 px of a 480 px screen, measured. It stops sticking past a third.
describe('a bar too tall for the screen stops sticking', () => {
  it('a bar of 161 px on a 480 px screen is marked unstuck and writes 0px: nothing stays over the page', () => {
    screen(480)
    height = 161
    const { container } = render(bar())
    expect(header(container)?.hasAttribute('data-unstuck')).toBe(true)
    expect(variable()).toBe('0px')
  })

  it('a bar of a third of the screen, 160 px of 480, still sticks and writes its height', () => {
    screen(480)
    height = 160
    const { container } = render(bar())
    expect(header(container)?.hasAttribute('data-unstuck')).toBe(false)
    expect(variable()).toBe('160px')
  })

  it('follows the bar as it grows past its share and back', () => {
    screen(480)
    const { container } = render(bar())
    resize(321)
    expect([header(container)?.hasAttribute('data-unstuck'), variable()]).toEqual([true, '0px'])
    resize(85)
    expect([header(container)?.hasAttribute('data-unstuck'), variable()]).toEqual([false, '85px'])
  })

  it('follows the screen when it turns, though the bar keeps its height', () => {
    screen(844)
    height = 225
    const { container } = render(bar())
    expect([header(container)?.hasAttribute('data-unstuck'), variable()]).toEqual([false, '225px'])
    turn(390)
    expect([header(container)?.hasAttribute('data-unstuck'), variable()]).toEqual([true, '0px'])
    turn(844)
    expect([header(container)?.hasAttribute('data-unstuck'), variable()]).toEqual([false, '225px'])
  })

  it('measures the screen with the address bar shown, so the bar does not stick and let go as a phone scrolls', () => {
    screen(480)
    height = 170
    const window560 = vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(560)
    const { container } = render(bar())
    expect([header(container)?.hasAttribute('data-unstuck'), variable()]).toEqual([true, '0px'])
    window560.mockReturnValue(480)
    act(() => { window.dispatchEvent(new Event('resize')) })
    expect([header(container)?.hasAttribute('data-unstuck'), variable()]).toEqual([true, '0px'])
  })

  it('leaves no mark on a bar that stops being sticky, and no listener once it unmounts', () => {
    screen(480)
    height = 321
    const { container, rerender, unmount } = render(bar())
    expect(header(container)?.hasAttribute('data-unstuck')).toBe(true)
    rerender(bar(false))
    expect(header(container)?.hasAttribute('data-unstuck')).toBe(false)
    rerender(bar())
    unmount()
    turn(844)
    expect(variable()).toBe('')
  })
})
