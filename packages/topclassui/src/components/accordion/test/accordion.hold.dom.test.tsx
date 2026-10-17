import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'

/** happy-dom lays nothing out and its ResizeObserver never calls back, so the tops and the observer are given. */
const tops = new Map<string, number>()

class Sizes {
  static made: Sizes[] = []
  readonly watched = new Set<Element>()
  constructor(readonly notify: () => void) { Sizes.made.push(this) }
  observe(target: Element) { this.watched.add(target) }
  unobserve(target: Element) { this.watched.delete(target) }
  disconnect() { this.watched.clear() }
}

const trigger = (name: string) => screen.getByRole('button', { name })
/** The box: the trigger sits in a heading, in an item, in it. */
const root = () => trigger('One').parentElement?.parentElement?.parentElement

/** What the browser does when the box changes size: the observers that watch it call back. */
const resize = () => { act(() => { for (const sizes of Sizes.made) if ([...sizes.watched].some((one) => one === root())) sizes.notify() }) }

let scrolls: { box: Element, by: number }[] = []

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout'] })
  tops.clear()
  Sizes.made = []
  scrolls = []
  vi.stubGlobal('ResizeObserver', Sizes)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return { top: tops.get(this.textContent) ?? 0 } as DOMRect
  })
  vi.spyOn(Element.prototype, 'scrollBy').mockImplementation(function (this: Element, _x: unknown, by: unknown) {
    scrolls.push({ box: this, by: Number(by) })
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const faq = (
  <AccordionRoot defaultValue={['one']}>
    <AccordionItem value="one" title="One">A long answer</AccordionItem>
    <AccordionItem value="two" title="Two">A short one</AccordionItem>
  </AccordionRoot>
)

// The browser half is e2e/accordion.spec.ts; this proves the press reaches the hold and what the hold does.
describe('a press holds its trigger where it was while the panel above gives its room back', () => {
  it('scrolls the page by as much as the trigger moved, and the trigger is back where it was pressed', () => {
    render(faq)
    tops.set('Two', 700)
    fireEvent.click(trigger('Two'))
    tops.set('Two', 60)
    resize()
    expect(scrolls).toEqual([{ box: document.scrollingElement, by: -640 }])
  })

  it('scrolls nothing for a move under a pixel, nor for a resize that left the trigger where it was', () => {
    render(faq)
    tops.set('Two', 700)
    fireEvent.click(trigger('Two'))
    tops.set('Two', 699.5)
    resize()
    resize()
    expect(scrolls).toEqual([])
  })

  it('holds the trigger where the reader scrolled it, and does not undo their scroll', () => {
    render(faq)
    tops.set('Two', 700)
    fireEvent.click(trigger('Two'))
    tops.set('Two', 500)
    fireEvent.scroll(document)
    tops.set('Two', 400)
    resize()
    expect(scrolls).toEqual([{ box: document.scrollingElement, by: -100 }])
  })

  it('scrolls the nearest box that scrolls up and down, and not the page', () => {
    render(<div data-testid="box" style={{ overflowY: 'auto' }}>{faq}</div>)
    const box = screen.getByTestId('box')
    vi.spyOn(box, 'scrollHeight', 'get').mockReturnValue(1200)
    vi.spyOn(box, 'clientHeight', 'get').mockReturnValue(600)
    tops.set('Two', 700)
    fireEvent.click(trigger('Two'))
    tops.set('Two', 60)
    resize()
    expect(scrolls).toEqual([{ box, by: -640 }])
  })

  it('lets go after a second: a later resize scrolls nothing', () => {
    render(faq)
    tops.set('Two', 700)
    fireEvent.click(trigger('Two'))
    act(() => { vi.advanceTimersByTime(1000) })
    tops.set('Two', 60)
    resize()
    expect(scrolls).toEqual([])
  })
})
