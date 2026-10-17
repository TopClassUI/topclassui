import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { RADIO_GROUP_BOUNDARIES } from './boundaries.js'
import {
  RADIO_GROUP, RADIO_GROUP_SKELETON_CIRCLE, RADIO_GROUP_SKELETON_LINE, RADIO_GROUP_SKELETON_TARGET, RADIO_ITEM, RADIO_ITEM_TEXT,
  RADIO_SIZE,
} from './classes.js'
import { RADIO_GROUP_DEFAULTS, RADIO_GROUP_SKELETON_DEFAULTS } from './constants.js'
import type { RadioGroupSkeletonProps } from './types.js'

/** The box of the group it stands in for: its layout, and per radio the target, the circle and one line of label
 * text at 6em, since a caller's label cannot be measured. A server file with no hook, for a Suspense fallback. */
export function RadioGroupSkeleton({
  size = RADIO_GROUP_DEFAULTS.size,
  orientation = RADIO_GROUP_DEFAULTS.orientation,
  items = RADIO_GROUP_SKELETON_DEFAULTS.items,
  className,
  ...rest
}: RadioGroupSkeletonProps) {
  // R-5.7-7; trunc too, or items={2.5} asks for half a radio.
  const count = Math.trunc(clamp(items, RADIO_GROUP_BOUNDARIES.skeletonItemsMin, RADIO_GROUP_BOUNDARIES.skeletonItemsMax))
  return (
    <span className={cn(RADIO_GROUP[orientation], className)} {...rest} aria-hidden>
      {Array.from({ length: count }, (_, item) => (
        <span key={item} className={cn(RADIO_ITEM, RADIO_ITEM_TEXT[size])}>
          <span className={RADIO_GROUP_SKELETON_TARGET}>
            <span className={cn(RADIO_GROUP_SKELETON_CIRCLE, RADIO_SIZE[size])} />
          </span>
          <span className={RADIO_GROUP_SKELETON_LINE} />
        </span>
      ))}
    </span>
  )
}
