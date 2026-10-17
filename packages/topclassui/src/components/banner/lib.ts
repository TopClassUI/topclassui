// The store behind useBannerDismiss: localStorage, and memory for a browser that refuses it.
import { BANNER_STORAGE_PREFIX } from './constants.js'

const memory = new Set([] as string[])
const listeners = new Set([] as (() => void)[])

/** The localStorage key a banner's dismissal is kept under. */
export const keyOf = (id: string): string => `${BANNER_STORAGE_PREFIX}${id}`

/** Dismissed on this page, or on an earlier one when storage is readable. */
export function readDismissed(id: string): boolean {
  if (memory.has(id)) return true
  try {
    return localStorage.getItem(keyOf(id)) !== null
  } catch {
    return false
  }
}

/** Remembers it for this page whatever happens, and for the next one when storage takes it. */
export function writeDismissed(id: string): void {
  memory.add(id)
  try {
    localStorage.setItem(keyOf(id), '1')
  } catch {
    // Blocked or full storage: memory keeps the banner hidden until the page is left.
  }
  for (const listener of listeners) listener()
}

/** Calls back on a dismissal here, and on one in another tab, which fires `storage`. */
export function subscribeDismissed(listener: () => void): () => void {
  listeners.add(listener)
  addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    removeEventListener('storage', listener)
  }
}
