import { cn } from '#shared/cn.js'
import { FIELD_OWN_WIDTH } from '#shared/classes.js'
import { TEXTAREA_SIZE, TEXTAREA_SKELETON } from './classes.js'
import { TEXTAREA_DEFAULTS, TEXTAREA_SKELETON_LINE } from './constants.js'
import { clampRows } from './lib.js'
import type { TextareaSkeletonProps } from './types.js'

/** The box of the textarea it stands in for: its padding, its type step, its width and one line per
 * row, so nothing shifts when the field arrives. */
export function TextareaSkeleton({
  size = TEXTAREA_DEFAULTS.size,
  fullWidth = TEXTAREA_DEFAULTS.fullWidth,
  rows = TEXTAREA_DEFAULTS.rows,
  className,
  ...rest
}: TextareaSkeletonProps) {
  return (
    <span
      className={cn(TEXTAREA_SKELETON, TEXTAREA_SIZE[size], fullWidth ? 'w-full' : FIELD_OWN_WIDTH, className)}
      {...rest}
      aria-hidden
    >
      {Array.from({ length: clampRows(rows) }, () => TEXTAREA_SKELETON_LINE).join('\n')}
    </span>
  )
}
