import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { ACCORDION_BOUNDARIES } from './boundaries.js'
import {
  ACCORDION_ITEM, ACCORDION_ROOT, ACCORDION_SKELETON_CARET, ACCORDION_SKELETON_ROW, ACCORDION_SKELETON_TITLE,
} from './classes.js'
import { ACCORDION_SKELETON_DEFAULTS } from './constants.js'
import type { AccordionSkeletonProps } from './types.js'

/** Holds an accordion's place while it loads: the box, the lines between items and closed
 * trigger rows around lines of nothing, so the items arrive without moving the page. */
export function AccordionSkeleton({
  items = ACCORDION_SKELETON_DEFAULTS.items,
  className,
  ...rest
}: AccordionSkeletonProps) {
  // R-5.7-7; trunc too, or items={2.5} asks for half an item.
  const count = Math.trunc(clamp(items, ACCORDION_BOUNDARIES.skeletonItemsMin, ACCORDION_BOUNDARIES.skeletonItemsMax))
  return (
    <div className={cn(ACCORDION_ROOT, className)} {...rest} aria-hidden>
      {Array.from({ length: count }, (_, item) => (
        <div key={item} className={ACCORDION_ITEM}>
          <div className={ACCORDION_SKELETON_ROW}>
            <span className={ACCORDION_SKELETON_TITLE} />
            <span className={ACCORDION_SKELETON_CARET} />
          </div>
        </div>
      ))}
    </div>
  )
}
