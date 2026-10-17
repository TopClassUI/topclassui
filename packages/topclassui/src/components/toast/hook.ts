'use client'

import { Toast } from '@base-ui/react/toast'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { useDirection, useLabels, useToastSettings } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { claimViewport, drawingViewport, subscribeViewports, toSwipeDirections } from './lib.js'
import type { ToastViewportFocus } from './types.js'

/** Everything the one viewport reads: Base UI's list, the provider's labels and placement, the dir and the
 * lang its portal cannot inherit, the swipes that close a toast in the direction of that provider, and
 * whether it draws: of two React roots that each mount a provider, the first viewport mounted does. */
export function useToastViewport() {
  const [key] = useState(() => Symbol('toast viewport'))
  useEffect(() => claimViewport(key), [key])
  const draws = useSyncExternalStore(subscribeViewports, drawingViewport, () => undefined) === key
  const { toasts } = Toast.useToastManager()
  const { placement } = useToastSettings()
  return {
    ...usePortalLocale(),
    ...useFocusReturn(toasts),
    draws,
    toasts,
    labels: useLabels().toast,
    placement,
    swipeDirection: toSwipeDirections(placement, useDirection()),
  }
}

/** R-5.6-1: Base UI gives the focus back after the last focused toast closes only when F6 brought it in. A Tab
 * brought it in too, so where the keyboard came from is kept here and focused once the toast is gone. */
function useFocusReturn(toasts: readonly unknown[]) {
  const from = useRef(null as HTMLElement | null)
  const holds = useRef(false)
  useEffect(() => {
    const back = from.current
    if (!holds.current || !back?.isConnected || (document.activeElement !== null && document.activeElement !== document.body)) return
    holds.current = false
    back.focus({ focusVisible: true })
  }, [toasts])
  return {
    onFocus: (event: ToastViewportFocus) => {
      const came = event.relatedTarget
      if (came instanceof HTMLElement && !event.currentTarget.contains(came)) from.current = came
      else if (came === null) from.current = null
      holds.current = event.target.matches(':focus-visible')
    },
    onBlur: (event: ToastViewportFocus) => {
      const went = event.relatedTarget
      if (went instanceof Node && event.currentTarget.contains(went)) return
      const left = event.target
      // Read after the commit: a toast that closed under the focus is gone from the page; a click elsewhere left it there.
      queueMicrotask(() => { if (went !== null || left.isConnected) holds.current = false })
    },
  }
}
