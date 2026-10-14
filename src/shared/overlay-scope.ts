'use client'

import { createContext, useContext, useId } from 'react'

import { type CloseDetails, guardEscape, toScopeSelector } from './overlay.js'

/** The scope of the nearest overlay root, which its popup writes on itself as data-overlay. */
export const OverlayScopeContext = createContext('')

/** One scope per root, and its Escape guard, which looks inside this root's own popup and no other:
 * an overlay nested in a dialog then still closes on Escape once focus is back on its trigger. */
export function useOverlayRoot<Details extends CloseDetails>(
  onOpenChange: ((open: boolean, details: Details) => void) | undefined,
) {
  const scope = useId()
  return { scope, onOpenChange: guardEscape(onOpenChange, toScopeSelector(scope)) }
}

/** The scope of the root a popup belongs to, for its data-overlay. */
export function useOverlayScope(): string {
  return useContext(OverlayScopeContext)
}
