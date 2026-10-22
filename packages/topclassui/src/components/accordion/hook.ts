'use client'

import { createContext, type MouseEvent, useContext, useId, useRef } from 'react'

import type { Size } from '#shared/contracts/size.js'
import { useProviderPresence } from '#shared/provider/context.js'
import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'
import { ACCORDION_DEFAULTS, ACCORDION_HOLD_MS } from './constants.js'

/** The size of the nearest AccordionRoot. Base UI tells its items nothing of ours, and a selector on
 * an ancestor would also match the items of an accordion nested inside a panel. */
const AccordionSizeContext = createContext<Size>(ACCORDION_DEFAULTS.size)

/** What AccordionRoot provides its items: the context its size travels in. */
export function useAccordionRoot() {
  return { Context: AccordionSizeContext }
}

/** The box the trigger scrolls in: the nearest ancestor that scrolls up and down, or the page. */
function scrollerOf(element: Element): Element {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
  }
  return element.ownerDocument.scrollingElement ?? element.ownerDocument.documentElement
}

/** A press closes the open panel, which gives its room back when its fade ends; when that panel is above, its
 * scroller follows the pressed trigger, so it stays under the pointer. Scroll anchoring missed one still on screen. */
function holdTrigger(event: MouseEvent) {
  const trigger = event.currentTarget
  // The trigger sits in a heading, in an item, in the root: the box that grows and shrinks.
  const root = trigger.parentElement?.parentElement?.parentElement
  if (!root) return
  const scroller = scrollerOf(trigger)
  const document = trigger.ownerDocument
  let top = trigger.getBoundingClientRect().top
  // A scroll by the reader, by the browser's anchoring or by this hold moves the place the trigger is held at.
  const scrolled = () => { top = trigger.getBoundingClientRect().top }
  const sizes = new ResizeObserver(() => {
    const moved = trigger.getBoundingClientRect().top - top
    if (Math.abs(moved) >= 1) scroller.scrollBy(0, moved)
    scrolled()
  })
  sizes.observe(root)
  document.addEventListener('scroll', scrolled, { capture: true, passive: true })
  setTimeout(() => {
    sizes.disconnect()
    document.removeEventListener('scroll', scrolled, { capture: true })
  }, ACCORDION_HOLD_MS)
}

/** What one item needs: its root's size; an id for its trigger, which names the region inside the panel; the ref and
 * tabIndex of that region, a tab stop only while what it holds scrolls sideways; and the onClick that holds the trigger. */
export function useAccordionItem() {
  useProviderPresence()
  const ref = useRef(null as HTMLDivElement | null)
  return { size: useContext(AccordionSizeContext), triggerId: useId(), ref, tabIndex: useScrollTabStop(ref), onClick: holdTrigger }
}
