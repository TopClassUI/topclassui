'use client'

import { type MouseEvent, useId, useRef } from 'react'

import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'
import { ACCORDION_HOLD_MS } from './constants.js'

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

/** What one item needs: an id for its trigger, which names the region inside the panel; the ref and tabIndex
 * of that region, a tab stop only while what it holds scrolls sideways; and the onClick that holds the trigger. */
export function useAccordionItem() {
  const ref = useRef(null as HTMLDivElement | null)
  return { triggerId: useId(), ref, tabIndex: useScrollTabStop(ref), onClick: holdTrigger }
}
