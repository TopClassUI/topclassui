'use client'

import { createContext, useContext, useId, useImperativeHandle, useRef } from 'react'

import { useLabels } from '#shared/provider/context.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'
import { toPopupSelector } from './lib.js'
import type { PopoverPopupProps } from './types.js'

/** The scope of the nearest PopoverRoot, which its popup writes on itself as data-popover. */
export const PopoverScopeContext = createContext('')

/** One id per root, and the selector that finds this root's popup and no other popover's. */
export function usePopoverRoot() {
  const scope = useId()
  return { scope, popups: toPopupSelector(scope) }
}

/** What the positioner reads from the provider: the dir and the lang a portal cannot inherit.
 * Floating UI aligns by the first, and the popup inherits both. With no provider the page's apply. */
export function usePopoverPositioner() {
  return usePortalLocale()
}

/** The popup's own ref, which the caller's ref follows, the scope of its root, and its tabIndex:
 * 0 while its content overflows it, and otherwise the -1 Base UI gives a popup it focuses by script. */
export function usePopoverPopup(forwarded: PopoverPopupProps['ref']) {
  const ref = useRef(null as HTMLDivElement | null)
  useImperativeHandle(forwarded, () => ref.current as HTMLDivElement, [])
  return { ref, tabIndex: useScrollTabStop(ref) ?? -1, scope: useContext(PopoverScopeContext) }
}

/** The name of the x, in the language of the provider: English when none is mounted. */
export function usePopoverClose() {
  return { label: useLabels().common.close }
}
