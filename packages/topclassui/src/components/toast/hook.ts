'use client'

import { Toast } from '@base-ui/react/toast'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { useDirection, useLabels, useToastSettings } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { claimViewport, drawingViewport, subscribeViewports } from '#shared/toast/viewports.js'
import { TOAST_OFFSET_VARIABLE, TOAST_STICKY_SHARE } from './constants.js'
import { toSwipeDirections } from './lib.js'
import type { ToastViewportFocus, ToastViewportProps } from './types.js'

/** R-10.5-3: while a stack shows at the bottom, its height in whole px is --tc-sticky-bottom on the root element. */
function useStickyBottom(viewport: HTMLDivElement | null, publishes: boolean) {
  useEffect(() => {
    const view = viewport?.ownerDocument.defaultView
    if (!viewport || !view || !publishes) return
    const root = viewport.ownerDocument.documentElement
    const publish = () => {
      const height = Math.ceil(viewport.getBoundingClientRect().height)
      root.style.setProperty(TOAST_OFFSET_VARIABLE, `${String(height > root.clientHeight * TOAST_STICKY_SHARE ? 0 : height)}px`)
    }
    const sizes = new ResizeObserver(publish)
    sizes.observe(viewport, { box: 'border-box' })
    view.addEventListener('resize', publish)
    publish()
    return () => {
      sizes.disconnect()
      view.removeEventListener('resize', publish)
      root.style.removeProperty(TOAST_OFFSET_VARIABLE)
    }
  }, [viewport, publishes])
}

/** Everything the one viewport reads: Base UI's list, the provider's labels and placement, the dir and the
 * lang its portal cannot inherit, the swipes that close a toast in the direction of that provider, and
 * whether it draws: of two React roots that each mount a provider, the first viewport mounted does. */
export function useToastViewport(callerRef?: ToastViewportProps['ref']) {
  const [key] = useState(() => Symbol('toast viewport'))
  useEffect(() => claimViewport(key), [key])
  const draws = useSyncExternalStore(subscribeViewports, drawingViewport, () => undefined) === key
  const { toasts } = Toast.useToastManager()
  const { placement } = useToastSettings()
  const [viewport, setViewport] = useState(null as HTMLDivElement | null)
  // R-5.7-3: the caller's ref and the one the sticky-bottom measurement reads both get the node.
  const ref = useCallback((node: HTMLDivElement | null) => {
    setViewport(node)
    const cleanup = typeof callerRef === 'function' ? callerRef(node) : undefined
    if (callerRef && typeof callerRef === 'object') callerRef.current = node
    return () => {
      setViewport(null)
      if (typeof cleanup === 'function') cleanup()
      else if (typeof callerRef === 'function') callerRef(null)
      else if (callerRef) callerRef.current = null
    }
  }, [callerRef])
  useStickyBottom(viewport, placement.startsWith('bottom') && toasts.length > 0)
  return {
    ...usePortalLocale(),
    ...useFocusReturn(toasts),
    draws,
    ref,
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
