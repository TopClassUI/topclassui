'use client'

import { type RefObject, useEffect, useState } from 'react'

/** Rounding at a fractional zoom reports one pixel of overflow on a box that does not scroll. */
const SLACK = 1

/** The tabIndex a scroll container needs: 0 while its content overflows it on either axis, so the
 * keyboard can reach and scroll it, and undefined otherwise. Undefined on the server and on the
 * first client render, so hydration matches; a region that has focus keeps its tab stop. */
export function useScrollTabStop(ref: RefObject<HTMLElement | null>): 0 | undefined {
  const [scrolls, setScrolls] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      const overflows = element.scrollHeight - element.clientHeight > SLACK || element.scrollWidth - element.clientWidth > SLACK
      // Taking the tab stop from under the focus would drop it on the body, so it waits for the blur.
      setScrolls(overflows || element.ownerDocument.activeElement === element)
    }

    // The box of a scroll container stays put while its content grows, so each child is watched as well.
    const sizes = new ResizeObserver(measure)
    sizes.observe(element)
    for (const child of element.children) sizes.observe(child)

    const content = new MutationObserver((records) => {
      for (const record of records) {
        if (record.target !== element) continue
        for (const node of record.addedNodes) if (node.nodeType === 1) sizes.observe(node as Element)
        for (const node of record.removedNodes) if (node.nodeType === 1) sizes.unobserve(node as Element)
      }
      measure()
    })
    // Text set straight on the container resizes no child, so its own edits are heard here.
    content.observe(element, { childList: true, characterData: true, subtree: true })

    element.addEventListener('blur', measure)
    measure()
    return () => {
      sizes.disconnect()
      content.disconnect()
      element.removeEventListener('blur', measure)
    }
  }, [ref])

  return scrolls ? 0 : undefined
}
