'use client'

import { useId, useRef } from 'react'

import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'

/** What one item needs: an id for its trigger, which names the region inside the panel, and the
 * ref and tabIndex of that region. It is a tab stop only while what it holds is wider than the
 * accordion and scrolls sideways, so the keyboard reaches a wide table with no control in it. */
export function useAccordionItem() {
  const ref = useRef(null as HTMLDivElement | null)
  return { triggerId: useId(), ref, tabIndex: useScrollTabStop(ref) }
}
