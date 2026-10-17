import { CONTROL_HEIGHT, FIELD_HOLDER_FULL, FIELD_TEXT } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { NUMBER_FIELD_ROOT, NUMBER_FIELD_SKELETON_BOX } from './classes.js'
import { NUMBER_FIELD_DEFAULTS } from './constants.js'
import type { NumberFieldSkeletonProps } from './types.js'

/** The box of the number field it stands in for: the root's width at the type step of its size, and the field's
 * height with the steppers inside it, so nothing shifts when it arrives. A server file, so it can be a Suspense fallback. */
export function NumberFieldSkeleton({
  size = NUMBER_FIELD_DEFAULTS.size,
  fullWidth = NUMBER_FIELD_DEFAULTS.fullWidth,
  className,
  ...rest
}: NumberFieldSkeletonProps) {
  return (
    <span className={cn(NUMBER_FIELD_ROOT, FIELD_TEXT[size], fullWidth && FIELD_HOLDER_FULL, className)} {...rest} aria-hidden>
      <span className={cn(NUMBER_FIELD_SKELETON_BOX, CONTROL_HEIGHT[size])} />
    </span>
  )
}
