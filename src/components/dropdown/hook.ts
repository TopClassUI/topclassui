'use client'

import { createContext, useContext, useId, useImperativeHandle, useRef, useTransition } from 'react'

import type { MenuItem } from '#shared/contracts/menu.js'
import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'
import { toPopupSelector } from './lib.js'
import type { DropdownPopupProps } from './types.js'

/** The scope of the nearest DropdownRoot, which its popup writes on itself as data-dropdown. */
export const DropdownScopeContext = createContext('')

/** One id per root, and the selector that finds this root's popup and no other menu's. */
export function useDropdownRoot() {
  const scope = useId()
  return { scope, popups: toPopupSelector(scope) }
}

/** What the positioner reads from the provider: the dir and the lang a portal cannot inherit.
 * Floating UI aligns by the first, and the menu inherits both. With no provider the page's apply. */
export function useDropdownPositioner() {
  return usePortalLocale()
}

/** The menu's own ref, which the caller's ref follows, the scope of its root, and its tabIndex:
 * 0 while its rows overflow it, and otherwise the -1 Base UI gives a menu it focuses by script. */
export function useDropdownPopup(forwarded: DropdownPopupProps['ref']) {
  const ref = useRef(null as HTMLDivElement | null)
  useImperativeHandle(forwarded, () => ref.current as HTMLDivElement, [])
  return { ref, tabIndex: useScrollTabStop(ref) ?? -1, scope: useContext(DropdownScopeContext) }
}

/** What a press on a row of the data-driven menu does. A Server Action runs inside a transition,
 * so what it throws reaches the nearest error boundary; an href row is a link and runs nothing. */
export function useDropdownMenu() {
  const [, startTransition] = useTransition()
  return {
    run(item: MenuItem) {
      const { action, onSelect } = item
      if (onSelect !== undefined) onSelect()
      else if (action !== undefined) startTransition(() => action(new FormData()))
    },
  }
}
