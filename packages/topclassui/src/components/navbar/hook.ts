'use client'

import { useEffect, useRef } from 'react'

import { NAVBAR_OFFSET_VARIABLE, NAVBAR_STICKY_SHARE } from './constants.js'
import { findHashTarget } from './lib.js'

/** What NavbarOffset reads: the ref of its span. The bar around that span is watched, and its height is written
 * in whole px to --tc-sticky-top on the root element from the first size report on, then removed when the bar
 * unmounts. The bar is marked data-scrolled while the page is scrolled under it. */
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

    const scrolled = () => bar.toggleAttribute('data-scrolled', view.scrollY > 0)
    view.addEventListener('scroll', scrolled, { passive: true })

    const land = () => {
      // Where the browser put an #anchor target while the height was unknown, read before it is written.
      const target = findHashTarget(bar.ownerDocument)
      const landed = target?.getBoundingClientRect().top
      const padding = target ? Number.parseFloat(view.getComputedStyle(root).scrollPaddingTop) || 0 : 0
      scrolled()
      publish()
      // Still exactly where the old padding left it, so the reader has not scrolled: brought clear of the bar, once.
      if (target && landed !== undefined && Math.abs(landed - padding) < 1) target.scrollIntoView()
    }

    // The first report comes after the browser's own layout, so nothing is read in the commit, where a read forces one.
    let first = true
    const sizes = new ResizeObserver(() => {
      if (first) land()
      else publish()
      first = false
    })
    // The border box: a safe area that grows changes the padding, and the bar with it.
    sizes.observe(bar, { box: 'border-box' })
    // A phone turned on its side changes the height of the screen, and not always the bar's.
    view.addEventListener('resize', publish)

    return () => {
      sizes.disconnect()
      view.removeEventListener('resize', publish)
      view.removeEventListener('scroll', scrolled)
      bar.removeAttribute('data-unstuck')
      bar.removeAttribute('data-scrolled')
      root.style.removeProperty(NAVBAR_OFFSET_VARIABLE)
    }
  }, [])

  return { ref }
}
