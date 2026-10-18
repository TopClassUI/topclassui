// The message test and the storage key; the store behind useBannerDismiss lives in hook.ts.
import { BANNER_STORAGE_PREFIX } from './constants.js'

/** These render nothing, so a message holding one gets no element and opens no gap. */
export function isEmpty(node: unknown): boolean {
  return node == null || typeof node === 'boolean' || node === '' || (Array.isArray(node) && node.every(isEmpty))
}

/** The localStorage key a banner's dismissal is kept under. */
export const keyOf = (id: string): string => `${BANNER_STORAGE_PREFIX}${id}`
