import { FIELD_HOLDER_FULL, FIELD_SIZE, FIELD_TEXT } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { SELECT_ROOT, SELECT_SKELETON_TRIGGER } from './classes.js'
import { SELECT_DEFAULTS } from './constants.js'
import type { SelectSkeletonProps } from './types.js'

/** The box of the closed Select it stands in for: the box that owns the width, and the trigger in it, which takes
 * className and the rest as the Select's does. A server file, so a Server Component can render it as a fallback. */
export function SelectSkeleton({
  size = SELECT_DEFAULTS.size,
  fullWidth = SELECT_DEFAULTS.fullWidth,
  className,
  ...rest
}: SelectSkeletonProps) {
  return (
    <span className={cn(SELECT_ROOT, FIELD_TEXT[size], fullWidth && FIELD_HOLDER_FULL)} aria-hidden>
      <span className={cn(SELECT_SKELETON_TRIGGER, FIELD_SIZE[size], className)} {...rest}>&nbsp;</span>
    </span>
  )
}
