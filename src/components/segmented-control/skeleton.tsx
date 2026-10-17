import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { SEGMENTED_CONTROL_BOUNDARIES } from './boundaries.js'
import {
  SEGMENTED_FULL, SEGMENTED_HOLDER, SEGMENTED_HOLDER_FULL, SEGMENTED_ITEM_SIZE, SEGMENTED_ROOT_SIZE, SEGMENTED_SKELETON,
  SEGMENTED_SKELETON_ITEM, SEGMENTED_SKELETON_LABEL,
} from './classes.js'
import { SEGMENTED_CONTROL_DEFAULTS, SEGMENTED_CONTROL_SKELETON_DEFAULTS } from './constants.js'
import type { SegmentedControlSkeletonProps } from './types.js'

/** The holder and the track it stands in for, the caller's props on the track as on the real one: its height, padding
 * and one segment per item, each four em of its type step wide, since a label's width is unknown; with fullWidth, exact. */
export function SegmentedControlSkeleton({
  size = SEGMENTED_CONTROL_DEFAULTS.size,
  fullWidth = SEGMENTED_CONTROL_DEFAULTS.fullWidth,
  items = SEGMENTED_CONTROL_SKELETON_DEFAULTS.items,
  className,
  ...rest
}: SegmentedControlSkeletonProps) {
  // R-5.7-7; trunc too, or items={2.5} asks for half a segment.
  const count = Math.trunc(clamp(items, SEGMENTED_CONTROL_BOUNDARIES.skeletonItemsMin, SEGMENTED_CONTROL_BOUNDARIES.skeletonItemsMax))
  const segment = cn(SEGMENTED_SKELETON_ITEM, SEGMENTED_ITEM_SIZE[size])
  return (
    <span className={cn(SEGMENTED_HOLDER, fullWidth && SEGMENTED_HOLDER_FULL)} aria-hidden>
      <span className={cn(SEGMENTED_SKELETON, SEGMENTED_ROOT_SIZE[size], fullWidth && SEGMENTED_FULL, className)} {...rest} aria-hidden>
        {Array.from({ length: count }, (_, at) => (
          <span key={at} className={segment}><span className={SEGMENTED_SKELETON_LABEL} /></span>
        ))}
      </span>
    </span>
  )
}
