'use client'

import { useSyncExternalStore } from 'react'

import { useLabels } from '#shared/provider/context.js'
import { readDismissed, subscribeDismissed, writeDismissed } from './lib.js'

/** The server cannot see the visitor's storage, so it always renders the banner. */
const onServer = () => false

/** Whether this banner was dismissed in this browser, the x's name in the provider's language,
 * and what the x does. Hydration renders the server's answer first, then the stored one. */
export function useBannerDismiss(id: string, onDismiss: (() => void) | undefined) {
  const dismissed = useSyncExternalStore(subscribeDismissed, () => readDismissed(id), onServer)
  return {
    dismissed,
    label: useLabels().banner.dismiss,
    dismiss: () => {
      writeDismissed(id)
      onDismiss?.()
    },
  }
}
