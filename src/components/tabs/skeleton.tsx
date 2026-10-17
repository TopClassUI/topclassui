import { CONTROL_SIZE } from '#shared/classes.js'
import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { TABS_BOUNDARIES } from './boundaries.js'
import { TABS_ROOT, TABS_SKELETON_BAR, TABS_SKELETON_LIST, TABS_SKELETON_TAB } from './classes.js'
import { TABS_DEFAULTS, TABS_SKELETON_DEFAULTS } from './constants.js'
import type { TabsSkeletonProps } from './types.js'

/** Holds a tab list's place while it loads: the list and tab boxes of the look and the size,
 * around lines of nothing, so the tabs arrive without moving the page. */
export function TabsSkeleton({
  variant = TABS_DEFAULTS.variant,
  size = TABS_DEFAULTS.size,
  tabs = TABS_SKELETON_DEFAULTS.tabs,
  className,
  ...rest
}: TabsSkeletonProps) {
  // R-5.7-7; trunc too, or tabs={2.5} asks for half a tab.
  const count = Math.trunc(clamp(tabs, TABS_BOUNDARIES.skeletonTabsMin, TABS_BOUNDARIES.skeletonTabsMax))
  return (
    <div data-variant={variant} data-size={size} className={cn(TABS_ROOT, className)} {...rest} aria-hidden>
      <div className={TABS_SKELETON_LIST[variant]}>
        {Array.from({ length: count }, (_, tab) => (
          <span key={tab} className={cn(TABS_SKELETON_TAB[variant], CONTROL_SIZE[size])}>
            <span className={TABS_SKELETON_BAR} />
          </span>
        ))}
      </div>
    </div>
  )
}
