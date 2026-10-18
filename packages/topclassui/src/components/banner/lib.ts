// The message test, the storage key and the focus neighbour; the store behind useBannerDismiss lives in hook.ts.
import { findNeighbour } from '#shared/focus-neighbour.js'
import { BANNER_STORAGE_PREFIX } from './constants.js'

/** These render nothing, so a message holding one gets no element and opens no gap. */
export function isEmpty(node: unknown): boolean {
  return node == null || typeof node === 'boolean' || node === '' || (Array.isArray(node) && node.every(isEmpty))
}

/** The localStorage key a banner's dismissal is kept under. */
export const keyOf = (id: string): string => `${BANNER_STORAGE_PREFIX}${id}`

/** Where the focus goes once a banner leaves under it: the next tab stop after its region, else the one before. */
export function neighbourOf(x: Element): HTMLElement | null {
  return findNeighbour(x.closest('[role="region"]') ?? x)
}
