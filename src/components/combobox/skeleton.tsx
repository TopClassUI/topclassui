import { FIELD_SIZE, FIELD_TEXT } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { COMBOBOX_ROOT, COMBOBOX_SKELETON_INPUT, COMBOBOX_WIDTH } from './classes.js'
import { COMBOBOX_DEFAULTS } from './constants.js'
import type { ComboboxSkeletonProps } from './types.js'

/** The box of the closed Combobox it stands in for: the box that owns the width, and the input in it, which takes
 * className and the rest as the Combobox's does. A server file, so a Server Component can render it as a fallback. */
export function ComboboxSkeleton({
  size = COMBOBOX_DEFAULTS.size,
  fullWidth = COMBOBOX_DEFAULTS.fullWidth,
  className,
  ...rest
}: ComboboxSkeletonProps) {
  return (
    <span className={cn(COMBOBOX_ROOT, FIELD_TEXT[size], fullWidth ? COMBOBOX_WIDTH.full : COMBOBOX_WIDTH.own)} aria-hidden>
      <span className={cn(COMBOBOX_SKELETON_INPUT, FIELD_SIZE[size], className)} {...rest}>&nbsp;</span>
    </span>
  )
}
