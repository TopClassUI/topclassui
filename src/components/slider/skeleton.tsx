import { cn } from '#shared/cn.js'
import {
  SLIDER_CONTROL, SLIDER_CONTROL_SIZE, SLIDER_FULL, SLIDER_SKELETON, SLIDER_SKELETON_TRACK, SLIDER_TEXT, SLIDER_TRACK_SIZE,
} from './classes.js'
import { SLIDER_DEFAULTS } from './constants.js'
import type { SliderSkeletonProps } from './types.js'

/** The box of the slider it stands in for: an Input's width, the padded target and the track of its size, so nothing
 * shifts when it arrives. No knob: it sits where the value is, which is not known yet, and takes no room in the box. */
export function SliderSkeleton({
  size = SLIDER_DEFAULTS.size,
  fullWidth = SLIDER_DEFAULTS.fullWidth,
  className,
  ...rest
}: SliderSkeletonProps) {
  return (
    <span className={cn(SLIDER_SKELETON, SLIDER_TEXT[size], fullWidth && SLIDER_FULL, className)} {...rest} aria-hidden>
      <span className={cn(SLIDER_CONTROL, SLIDER_CONTROL_SIZE[size])}>
        <span className={cn(SLIDER_SKELETON_TRACK, SLIDER_TRACK_SIZE[size])} />
      </span>
    </span>
  )
}
