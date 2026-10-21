'use client'

import { useEffect, useState } from 'react'

function idOfHash(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return ''
  }
}

function isInView(element: Element): boolean {
  const box = element.getBoundingClientRect()
  return box.bottom > 0 && box.top < window.innerHeight
}

/** The id of the last heading scrolled up to the navbar, where a link to it lands: the first one before any is.
 * At the foot of a scrolled page, where the last headings can no longer reach it, the one linked to if it is in view, else the last. */
export function useTocSpy(entries: readonly { id: string }[]): string | undefined {
  const [active, setActive] = useState(entries[0]?.id)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const root = document.documentElement
      // The page's scroll padding is the navbar's height; 32 px under it absorbs rounding and a heading's own margin.
      const line = (Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + 32
      let reached = entries[0]?.id
      for (const { id } of entries) {
        const heading = document.getElementById(id)
        if (heading !== null && heading.getBoundingClientRect().top <= line) reached = id
      }
      if (root.scrollTop > 0 && window.innerHeight + root.scrollTop >= root.scrollHeight - 2) {
        const linked = document.getElementById(idOfHash(window.location.hash))
        const pinned = linked !== null && isInView(linked) ? entries.find((entry) => entry.id === linked.id) : undefined
        reached = pinned?.id ?? entries.at(-1)?.id
      }
      setActive(reached)
    }
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    window.addEventListener('hashchange', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', schedule)
    }
  }, [entries])

  return active
}
