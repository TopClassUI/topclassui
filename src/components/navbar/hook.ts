'use client'

import { useEffect, useRef } from 'react'

import { NAVBAR_OFFSET_VARIABLE, NAVBAR_STICKY_SHARE } from './constants.js'

/** What NavbarOffset reads: the ref of its span. The bar around that span is watched, and its height
 * is written in whole px to --tc-sticky-top on the root element, then removed when the bar unmounts. */
export function useNavbarOffset() {
  const ref = useRef(null as HTMLSpanElement | null)

  useEffect(() => {
    const bar = ref.current?.parentElement
    const view = bar?.ownerDocument.defaultView
    if (!bar || !view) return
    const root = bar.ownerDocument.documentElement

    // Rounded up: a bar of 60.5 px would otherwise cover half a pixel of what lands under it.
    const publish = () => {
      const height = Math.ceil(bar.getBoundingClientRect().height)
      // A bar taller than its share of the screen scrolls away, and then covers nothing.
      const unstuck = height > view.innerHeight * NAVBAR_STICKY_SHARE
      bar.toggleAttribute('data-unstuck', unstuck)
      root.style.setProperty(NAVBAR_OFFSET_VARIABLE, `${String(unstuck ? 0 : height)}px`)
    }

    // The border box: a safe area that grows changes the padding, and the bar with it.
    const sizes = new ResizeObserver(publish)
    sizes.observe(bar, { box: 'border-box' })
    // A phone turned on its side changes the height of the screen, and not always the bar's.
    view.addEventListener('resize', publish)
    publish()

    return () => {
      sizes.disconnect()
      view.removeEventListener('resize', publish)
      bar.removeAttribute('data-unstuck')
      root.style.removeProperty(NAVBAR_OFFSET_VARIABLE)
    }
  }, [])

  return { ref }
}
