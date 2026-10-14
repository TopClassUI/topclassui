'use client'

import { Toast } from '@base-ui/react/toast'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { useDirection, useLabels, useToastSettings } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { claimViewport, drawingViewport, subscribeViewports, toSwipeDirections } from './lib.js'

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
    draws,
    toasts,
    labels: useLabels().toast,
    placement,
    swipeDirection: toSwipeDirections(placement, useDirection()),
  }
}
