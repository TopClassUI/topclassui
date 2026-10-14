'use client'

import { useEffect, useRef } from 'react'

import { NAVBAR_OFFSET_VARIABLE } from './constants.js'

/** What NavbarOffset reads: the ref of its span. The bar around that span is watched, and its height
 * is written in whole px to --tc-sticky-top on the root element, then removed when the bar unmounts. */
export function useNavbarOffset() {
  const ref = useRef(null as HTMLSpanElement | null)

  useEffect(() => {
    const bar = ref.current?.parentElement
    if (!bar) return
    const root = bar.ownerDocument.documentElement

    // Rounded up: a bar of 60.5 px would otherwise cover half a pixel of what lands under it.
    const publish = () => {
      root.style.setProperty(NAVBAR_OFFSET_VARIABLE, `${String(Math.ceil(bar.getBoundingClientRect().height))}px`)
    }

    // The border box: a safe area that grows changes the padding, and the bar with it.
    const sizes = new ResizeObserver(publish)
    sizes.observe(bar, { box: 'border-box' })
    publish()

    return () => {
      sizes.disconnect()
      root.style.removeProperty(NAVBAR_OFFSET_VARIABLE)
    }
  }, [])

  return { ref }
}
