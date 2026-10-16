'use client'

import { useEffect, useRef } from 'react'

import { NAVBAR_OFFSET_VARIABLE, NAVBAR_STICKY_SHARE } from './constants.js'
import { findHashTarget } from './lib.js'

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
      // Against the screen with the address bar shown, which does not change as it hides on a scroll.
      const unstuck = height > root.clientHeight * NAVBAR_STICKY_SHARE
      bar.toggleAttribute('data-unstuck', unstuck)
      root.style.setProperty(NAVBAR_OFFSET_VARIABLE, `${String(unstuck ? 0 : height)}px`)
    }

    // Where the browser put an #anchor target while the height was unknown, read before it is written.
    const target = findHashTarget(bar.ownerDocument)
    const landed = target?.getBoundingClientRect().top
    const padding = Number.parseFloat(view.getComputedStyle(root).scrollPaddingTop) || 0

    // The border box: a safe area that grows changes the padding, and the bar with it.
    const sizes = new ResizeObserver(publish)
    sizes.observe(bar, { box: 'border-box' })
    // A phone turned on its side changes the height of the screen, and not always the bar's.
    view.addEventListener('resize', publish)
    publish()

    // Still exactly where the old padding left it, so the reader has not scrolled: brought clear of the bar, once.
    if (target && landed !== undefined && Math.abs(landed - padding) < 1) target.scrollIntoView()

    return () => {
      sizes.disconnect()
      view.removeEventListener('resize', publish)
      bar.removeAttribute('data-unstuck')
      root.style.removeProperty(NAVBAR_OFFSET_VARIABLE)
    }
  }, [])

  return { ref }
}
