import { cn } from '#shared/cn.js'
import { BORDER_WIDTH } from '#shared/classes.js'
import { BADGE_SIZE, SKELETON_WIDTH } from './classes.js'
import { BADGE_DEFAULTS } from './constants.js'
import type { BadgeSkeletonProps } from './types.js'

/** The Badge box itself - border, padding and type step - around one line of nothing,
 * so its height is the badge's own. Without the border it would be 2 px short. */
export function BadgeSkeleton({
  size = BADGE_DEFAULTS.size,
  className,
  ...rest
}: BadgeSkeletonProps) {
  return (
    <span
      className={cn(
        'inline-flex animate-pulse rounded-chip border-transparent bg-neutral-soft motion-reduce:animate-none',
        BORDER_WIDTH,
        BADGE_SIZE[size],
        SKELETON_WIDTH[size],
        className,
      )}
      {...rest}
      aria-hidden
    >
      &nbsp;
    </span>
  )
}
