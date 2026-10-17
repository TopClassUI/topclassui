import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { SIDEBAR_BOUNDARIES } from './boundaries.js'
import {
  SIDEBAR_HEADER, SIDEBAR_ROOT, SIDEBAR_SKELETON_BAR, SIDEBAR_SKELETON_BODY, SIDEBAR_SKELETON_ICON,
  SIDEBAR_SKELETON_ROW, SIDEBAR_SKELETON_TEXT, SIDEBAR_SKELETON_TRIGGER,
} from './classes.js'
import { SIDEBAR_SKELETON_DEFAULTS } from './constants.js'
import type { SidebarSkeletonProps } from './types.js'

/** Holds a rail's place while it loads: the rail, its header and its rows at their own boxes,
 * 220 px expanded or 60 collapsed, so the links arrive without moving the page. */
export function SidebarSkeleton({
  expanded = SIDEBAR_SKELETON_DEFAULTS.expanded,
  links = SIDEBAR_SKELETON_DEFAULTS.links,
  className,
  ...rest
}: SidebarSkeletonProps) {
  // R-5.7-7; trunc too, or links={2.5} asks for half a row.
  const count = Math.trunc(clamp(links, SIDEBAR_BOUNDARIES.skeletonLinksMin, SIDEBAR_BOUNDARIES.skeletonLinksMax))
  return (
    <div
      data-open={expanded ? '' : undefined}
      data-closed={expanded ? undefined : ''}
      className={cn(SIDEBAR_ROOT, className)}
      {...rest}
      aria-hidden
    >
      <div className={SIDEBAR_HEADER}>
        <span className={SIDEBAR_SKELETON_TRIGGER} />
        {expanded ? <span className={cn(SIDEBAR_SKELETON_TEXT, 'font-semibold')}><span className={SIDEBAR_SKELETON_BAR} /></span> : null}
      </div>
      <div className={SIDEBAR_SKELETON_BODY}>
        {Array.from({ length: count }, (_, row) => (
          <span key={row} className={cn(SIDEBAR_SKELETON_ROW)}>
            <span className={SIDEBAR_SKELETON_ICON} />
            {expanded ? <span className={SIDEBAR_SKELETON_TEXT}><span className={SIDEBAR_SKELETON_BAR} /></span> : null}
          </span>
        ))}
      </div>
    </div>
  )
}
