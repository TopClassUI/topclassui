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
