import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { COMMAND_BOUNDARIES } from './boundaries.js'
import { COMMAND_SKELETON_BAR, COMMAND_SKELETON_LIST, COMMAND_SKELETON_ROW } from './classes.js'
import { COMMAND_DEFAULTS } from './constants.js'
import type { CommandSkeletonProps } from './types.js'

/** Holds the rows of the palette's list while its commands load: pass it as loadingFallback.
 * Each row is a command row's box around an icon and a label of nothing. */
export function CommandSkeleton({
  rows = COMMAND_DEFAULTS.visibleRows,
  className,
  ...rest
}: CommandSkeletonProps) {
  // R-5.7-7; trunc too, or rows={2.5} asks for half a row.
  const count = Math.trunc(clamp(rows, COMMAND_BOUNDARIES.visibleRowsMin, COMMAND_BOUNDARIES.visibleRowsMax))
  return (
    <div className={cn(COMMAND_SKELETON_LIST, className)} {...rest} aria-hidden>
      {Array.from({ length: count }, (_, row) => (
        <span key={row} className={COMMAND_SKELETON_ROW}>
          <span className={COMMAND_SKELETON_BAR.icon} />
          <span className={COMMAND_SKELETON_BAR.label} />
        </span>
      ))}
    </div>
  )
}
