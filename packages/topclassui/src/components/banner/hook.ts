'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { restoreFocus } from '#shared/focus-neighbour.js'
import { useLabels } from '#shared/provider/context.js'
import { keyOf, neighbourOf } from './lib.js'
import type { BannerDismissEvent } from './types.js'

// The store behind useBannerDismiss: localStorage, and memory for a browser that refuses it.
const memory = new Set([] as string[])
const listeners = new Set([] as (() => void)[])

/** Dismissed on this page, or on an earlier one when storage is readable. */
function readDismissed(id: string): boolean {
  if (memory.has(id)) return true
  try {
    return localStorage.getItem(keyOf(id)) !== null
  } catch {
    return false
  }
}

/** Remembers it for this page whatever happens, and for the next one when storage takes it. */
function writeDismissed(id: string): void {
  memory.add(id)
  try {
    localStorage.setItem(keyOf(id), '1')
  } catch {
    // Blocked or full storage: memory keeps the banner hidden until the page is left.
  }
  for (const listener of listeners) listener()
}

/** Calls back on a dismissal here, and on one in another tab, which fires `storage`. */
function subscribeDismissed(listener: () => void): () => void {
  listeners.add(listener)
  addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    removeEventListener('storage', listener)
  }
}

/** The server cannot see the visitor's storage, so it always renders the banner. */
const onServer = () => false

/** Whether this banner was dismissed in this browser, the x's name in the provider's language, and what the x does.
 * An x that held the focus hands it to the next tab stop once the banner is gone (R-5.6-1), unless the caller moved it. */
export function useBannerDismiss(id: string, onDismiss: (() => void) | undefined) {
  const dismissed = useSyncExternalStore(subscribeDismissed, () => readDismissed(id), onServer)
  const next = useRef({ to: null as HTMLElement | null, visible: false })
  useEffect(() => {
    if (!dismissed) return
    restoreFocus(next.current.to, next.current.visible)
    next.current = { to: null, visible: false }
  }, [dismissed])
  return {
    dismissed,
    label: useLabels().banner.dismiss,
    dismiss: (event: BannerDismissEvent) => {
      const x = event.currentTarget
      if (x === x.ownerDocument.activeElement) next.current = { to: neighbourOf(x), visible: x.matches(':focus-visible') }
      writeDismissed(id)
      onDismiss?.()
    },
  }
}
