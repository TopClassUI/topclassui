'use client'

import { Toast } from '@base-ui/react/toast'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { useDirection, useLabels, useToastSettings } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { TOAST_OFFSET_VARIABLE, TOAST_STICKY_SHARE } from './constants.js'
import { claimViewport, drawingViewport, subscribeViewports, toSwipeDirections } from './lib.js'

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
export function useToastViewport() {
  const [key] = useState(() => Symbol('toast viewport'))
  useEffect(() => claimViewport(key), [key])
  const draws = useSyncExternalStore(subscribeViewports, drawingViewport, () => undefined) === key
  const { toasts } = Toast.useToastManager()
  const { placement } = useToastSettings()
  const [viewport, ref] = useState(null as HTMLDivElement | null)
  useStickyBottom(viewport, placement.startsWith('bottom') && toasts.length > 0)
  return {
    ...usePortalLocale(),
    draws,
    ref,
    toasts,
    labels: useLabels().toast,
    placement,
    swipeDirection: toSwipeDirections(placement, useDirection()),
  }
}
