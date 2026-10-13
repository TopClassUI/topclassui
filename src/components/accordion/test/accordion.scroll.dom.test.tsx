import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'

/** happy-dom lays nothing out and its ResizeObserver never calls back, so the box and the observer are given. */
const box = { scrollWidth: 386, clientWidth: 386 }

class Sizes {
  static made: Sizes[] = []
  readonly watched = new Set<Element>()
  constructor(readonly notify: () => void) { Sizes.made.push(this) }
  observe(target: Element) { this.watched.add(target) }
  unobserve(target: Element) { this.watched.delete(target) }
  disconnect() { this.watched.clear() }
}

/** What the browser does when a watched box changes size. */
const resize = () => { act(() => { for (const sizes of Sizes.made) sizes.notify() }) }

beforeEach(() => {
  Object.assign(box, { scrollWidth: 386, clientWidth: 386 })
  Sizes.made = []
  vi.stubGlobal('ResizeObserver', Sizes)
  // Only the region of the item named Wide has a size: happy-dom keeps scrollWidth on Element, clientWidth on HTMLElement.
  const wide = (element: Element) => element.getAttribute('role') === 'region' && element.textContent === 'A wide table'
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) { return wide(this) ? box.scrollWidth : 0 })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) { return wide(this) ? box.clientWidth : 0 })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const faq = (
  <AccordionRoot multiple defaultValue={['wide', 'plain']}>
    <AccordionItem value="wide" title="Wide">A wide table</AccordionItem>
    <AccordionItem value="plain" title="Plain">A few words</AccordionItem>
  </AccordionRoot>
)

const region = (name: string) => screen.getByRole('region', { name })

// The browser half is e2e/accordion.spec.ts; this proves the hook reaches the region of each item.
describe('the region of a panel is a tab stop only while what it holds is wider than it', () => {
  it('has no tabindex while its content fits', () => {
    render(faq)
    expect(region('Wide').hasAttribute('tabindex')).toBe(false)
    expect(region('Plain').hasAttribute('tabindex')).toBe(false)
  })

  it('takes tabindex 0 when its content is wider, and the region of the other item does not', () => {
    box.scrollWidth = 868
    render(faq)
    expect(region('Wide').getAttribute('tabindex')).toBe('0')
    expect(region('Plain').hasAttribute('tabindex')).toBe(false)
  })

  it('follows the box: a tab stop once the accordion is narrower than the table, and no longer one when it is wider again', () => {
    box.scrollWidth = 868
    box.clientWidth = 900
    render(faq)
    expect(region('Wide').hasAttribute('tabindex')).toBe(false)
    box.clientWidth = 254
    resize()
    expect(region('Wide').getAttribute('tabindex')).toBe('0')
    box.clientWidth = 900
    resize()
    expect(region('Wide').hasAttribute('tabindex')).toBe(false)
  })

  it('watches the region of every item, each with an observer of its own', () => {
    render(faq)
    expect(Sizes.made).toHaveLength(2)
    expect(Sizes.made.map((sizes) => [...sizes.watched])).toEqual([[region('Wide')], [region('Plain')]])
  })
})
