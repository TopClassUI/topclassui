'use client'

import { createContext, useContext, useImperativeHandle, useMemo, useRef } from 'react'

import { useDirection, useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'
import { DRAWER_DEFAULTS } from './constants.js'
import { toSwipeDirection } from './lib.js'
import type { DrawerBodyProps, DrawerSettings } from './types.js'

/** The placement, the size and how modal the nearest DrawerRoot is. The root provides them,
 * because it owns the gesture and Base UI tells the popup nothing of the three. */
export const DrawerContext = createContext(DRAWER_DEFAULTS as DrawerSettings)

/** What DrawerRoot hands on: its settings for the popup, and the physical swipe that closes the
 * sheet, worked out from the direction of the provider and never read from the DOM (R-13-1). */
export function useDrawerRoot(placement: DrawerSettings['placement'], size: DrawerSettings['size'], modal: DrawerSettings['modal']) {
  const direction = useDirection()
  const settings = useMemo(() => ({ placement, size, modal }), [placement, size, modal])
  return { settings, swipeDirection: toSwipeDirection(placement, direction) }
}

/** What DrawerPopup reads: the dir and the lang of the provider, which its portal in the body
 * cannot inherit and its viewport therefore carries, and the settings of its root. */
export function useDrawerPopup() {
  return { ...usePortalLocale(), ...useContext(DrawerContext) }
}

/** The body's own ref, which the caller's ref follows, and the tabIndex it needs: 0 only while
 * its content overflows it, so a long text can be scrolled from the keyboard. */
export function useDrawerBody(forwarded: DrawerBodyProps['ref']) {
  const ref = useRef(null as HTMLDivElement | null)
  useImperativeHandle(forwarded, () => ref.current as HTMLDivElement, [])
  return { ref, tabIndex: useScrollTabStop(ref) }
}

/** The name of the x, in the language of the provider: English when none is mounted. */
export function useDrawerClose() {
  return { label: useLabels().drawer.close }
}
