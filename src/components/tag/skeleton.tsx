import { cn } from '#shared/cn.js'
import { BORDER_WIDTH } from '#shared/classes.js'
import { SKELETON_WIDTH, TAG_SIZE } from './classes.js'
import { TAG_DEFAULTS } from './constants.js'
import type { TagSkeletonProps } from './types.js'

/** The plain Tag box itself - border, padding and type step - around one line of nothing, so its
 * height is the tag's own. It holds a tag without the remove button, which grows an xs tag to 24 px. */
export function TagSkeleton({
  size = TAG_DEFAULTS.size,
  className,
  ...rest
}: TagSkeletonProps) {
  return (
    <span
      className={cn(
        'inline-flex animate-pulse rounded-chip border-transparent bg-neutral-soft motion-reduce:animate-none',
        BORDER_WIDTH,
        TAG_SIZE[size],
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
