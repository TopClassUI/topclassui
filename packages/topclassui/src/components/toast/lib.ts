import type { Direction } from '#shared/provider/context.js'
import { TOAST_ICONS } from './constants.js'
import type { ToastIconType, ToastPlacement, ToastSwipeDirection } from './types.js'

/** The icon a Base UI type draws, or null for one that draws none: neutral, primary, or a type of the caller's. */
export function iconTypeOf(type: string | undefined): ToastIconType | null {
  return type !== undefined && Object.hasOwn(TOAST_ICONS, type) ? type as ToastIconType : null
}

/** R-5.3-4: the swipes that close a toast, physical as Base UI's are. Toward its block edge, and toward the
 * inline edge it sits at, which swaps with the direction; a centered toast has no sideways swipe. */
export function toSwipeDirections(placement: ToastPlacement, direction: Direction): ToastSwipeDirection[] {
  const [block, inline] = placement.split('-')
  const vertical: ToastSwipeDirection = block === 'top' ? 'up' : 'down'
  if (inline === undefined) return [vertical]
  const atRight = (inline === 'end') === (direction === 'ltr')
  return [vertical, atRight ? 'right' : 'left']
}
