'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { restoreFocus } from '#shared/focus-neighbour.js'
import { useLabels } from '#shared/provider/context.js'
import { neighbourOf, readDismissed, subscribeDismissed, writeDismissed } from './lib.js'
import type { BannerDismissEvent } from './types.js'

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
