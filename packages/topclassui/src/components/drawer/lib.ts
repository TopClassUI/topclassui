import type { Direction } from '#shared/provider/context.js'
import type { DrawerPlacement, DrawerSwipeDirection } from './types.js'

/** R-5.3-4: the physical swipe that closes a sheet at a logical placement. Base UI's swipe is
 * physical: the sheet leaves by the edge it came from, and the two inline edges swap with the direction. */
export function toSwipeDirection(placement: DrawerPlacement, direction: Direction): DrawerSwipeDirection {
  if (placement === 'top') return 'up'
  if (placement === 'bottom') return 'down'
  const inlineEnd = direction === 'rtl' ? 'left' : 'right'
  const inlineStart = direction === 'rtl' ? 'right' : 'left'
  return placement === 'end' ? inlineEnd : inlineStart
}

/** Whether the sheet stands on an inline edge, which is where `size` sets its width. */
export function isSideSheet(placement: DrawerPlacement): boolean {
  return placement === 'start' || placement === 'end'
}

/** The sheet's first focus (APG Dialog): the sheet itself after a touch, so no virtual keyboard rises, or while
 * the sheet itself scrolls, so its top stays in view; otherwise true, Base UI's first control, as a Dialog does. */
export function firstFocusOf(sheet: HTMLElement | null, type: string): HTMLElement | null | true {
  // One pixel of slack: rounding at a fractional zoom reports overflow on a box that does not scroll.
  if (type === 'touch' || (sheet !== null && sheet.scrollHeight - sheet.clientHeight > 1)) return sheet
  return true
}
