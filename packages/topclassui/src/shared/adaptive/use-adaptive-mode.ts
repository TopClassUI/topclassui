'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

export type AdaptiveMode = 'desktop' | 'mobile'

export const DEFAULT_ADAPTIVE_QUERY = '(width < 48rem)'

/** TopClassProvider overrides this from its `adaptive.query` prop. */
export const AdaptiveQueryContext = createContext(DEFAULT_ADAPTIVE_QUERY)

const noop = () => undefined


/**
 * R-11.2: the server snapshot is always desktop, so the server HTML and the first
 * client HTML agree. An overlay is closed on first render, so nothing flashes.
 */
export function useAdaptiveMode(force: AdaptiveMode | 'auto' = 'auto', query?: string): AdaptiveMode {
  const contextQuery = useContext(AdaptiveQueryContext)
  const media = query ?? contextQuery

  // Forced means the query is never read, so nothing subscribes to it either.
  const forced = force !== 'auto'

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (forced || typeof window === 'undefined') return noop
      const mql = window.matchMedia(media)
      mql.addEventListener('change', onChange)
      return () => { mql.removeEventListener('change', onChange) }
    },
    [media, forced],
  )

  const getSnapshot = useCallback(() => {
    if (forced || typeof window === 'undefined') return false
    return window.matchMedia(media).matches
  }, [media, forced])

  const isMobile = useSyncExternalStore(subscribe, getSnapshot, () => false)

  if (forced) return force
  return isMobile ? 'mobile' : 'desktop'
}
