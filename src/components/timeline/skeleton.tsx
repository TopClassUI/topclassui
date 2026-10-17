import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { TIMELINE_BOUNDARIES } from './boundaries.js'
import {
  TIMELINE_CONNECTOR, TIMELINE_MARKER, TIMELINE_SKELETON_DOT, TIMELINE_SKELETON_TIME, TIMELINE_SKELETON_TITLE,
  TIMELINE_TIME, TIMELINE_TITLE,
} from './classes.js'
import { TIMELINE_SKELETON_DEFAULTS } from './constants.js'
import type { TimelineSkeletonProps } from './types.js'

/** Holds a timeline's place while its events load: each row is an item's marker, connector,
 * title line and time line around lines of nothing, so the rail arrives without moving the page. */
export function TimelineSkeleton({
  rows = TIMELINE_SKELETON_DEFAULTS.rows,
  className,
  ...rest
}: TimelineSkeletonProps) {
  // R-5.7-7; trunc too, or rows={2.5} asks for half an event.
  const count = Math.trunc(clamp(rows, TIMELINE_BOUNDARIES.skeletonRowsMin, TIMELINE_BOUNDARIES.skeletonRowsMax))
  const last = count - 1
  return (
    <div className={cn('flex flex-col', className)} {...rest} aria-hidden>
      {Array.from({ length: count }, (_, row) => (
        <div key={row} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={TIMELINE_MARKER}><span className={TIMELINE_SKELETON_DOT} /></span>
            {row === last ? null : <span className={TIMELINE_CONNECTOR} />}
          </div>
          <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5', row === last ? null : 'pb-4')}>
            <div className={TIMELINE_TITLE}><span className={TIMELINE_SKELETON_TITLE} /></div>
            <div className={TIMELINE_TIME}><span className={TIMELINE_SKELETON_TIME} /></div>
          </div>
        </div>
      ))}
    </div>
  )
}
