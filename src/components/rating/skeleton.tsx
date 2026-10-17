import { cn } from '#shared/cn.js'
import { RATING_ROOT, RATING_SKELETON_SIZE, RATING_SKELETON_STAR } from './classes.js'
import { RATING_DEFAULTS } from './constants.js'
import { stepsOf, toMax } from './lib.js'
import type { RatingSkeletonProps } from './types.js'

/** Holds a read-only rating's place while it loads: the same row and one star-sized circle per step.
 * An editable rating's steps are 24 px, and 44 px under a finger: this does not hold that box. */
export function RatingSkeleton({
  max = RATING_DEFAULTS.max,
  size = RATING_DEFAULTS.size,
  className,
  ...rest
}: RatingSkeletonProps) {
  return (
    <span data-size={size} className={cn(RATING_ROOT, className)} {...rest} aria-hidden>
      {stepsOf(toMax(max)).map((step) => <span key={step} className={cn(RATING_SKELETON_STAR, RATING_SKELETON_SIZE[size])} />)}
    </span>
  )
}
