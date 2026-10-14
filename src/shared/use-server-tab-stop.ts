'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => undefined
const stop = { tabIndex: 0 } as const
const none = {}

/** A tab stop for the server HTML alone. Base UI finds the roving tab stop of a list in an effect,
 * so it serves every item with tabindex -1 and the list cannot be reached before the page hydrates.
 * Spread it before the caller's props; once hydrated it is empty and Base UI owns the tab stop. */
export function useServerTabStop(isStop: boolean): { readonly tabIndex?: 0 } {
  // The server snapshot answers the server render and the render that hydrates; a store never changes.
  const served = useSyncExternalStore(subscribe, () => false, () => true)
  return served && isStop ? stop : none
}
