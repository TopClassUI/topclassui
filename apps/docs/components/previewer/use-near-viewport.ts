'use client'

import { type RefObject, useEffect, useState } from 'react'

/** True once the element comes within one viewport of the screen (S8's lazy island), and true for good after that. */
export function useNearViewport(ref: RefObject<Element | null>): boolean {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (element === null || near) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setNear(true)
    }, { rootMargin: '100% 0px' })
    observer.observe(element)
    return () => { observer.disconnect() }
  }, [ref, near])
  return near
}
