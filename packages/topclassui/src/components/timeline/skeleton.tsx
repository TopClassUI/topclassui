import { cn } from '#shared/cn.js'
import {
  TIMELINE_SKELETON, TIMELINE_SKELETON_BAR, TIMELINE_SKELETON_DOT, TIMELINE_SKELETON_ROW, TIMELINE_SKELETON_WIDTHS,
} from './classes.js'
import type { TimelineSkeletonProps } from './types.js'

/** Holds a timeline's place while its events load: three rows of a dot and a title bar, as the states strip draws it. */
export function TimelineSkeleton({ className, ...rest }: TimelineSkeletonProps) {
  return (
    <div className={cn(TIMELINE_SKELETON, className)} {...rest} aria-hidden>
      {TIMELINE_SKELETON_WIDTHS.map((width) => (
        <div key={width} className={TIMELINE_SKELETON_ROW}>
          <span className={TIMELINE_SKELETON_DOT} />
          <span className={cn(TIMELINE_SKELETON_BAR, width)} />
        </div>
      ))}
    </div>
  )
}
