import { cn } from '#shared/cn.js'
import { SWITCH_SKELETON, SWITCH_SKELETON_TRACK, SWITCH_TRACK_SIZE } from './classes.js'
import { SWITCH_DEFAULTS } from './constants.js'
import type { SwitchSkeletonProps } from './types.js'

/** The box of the switch it stands in for: the target and the track of its size, so nothing shifts when it
 * arrives. A server file with no hook, so a Server Component can render it as a Suspense fallback. */
export function SwitchSkeleton({ size = SWITCH_DEFAULTS.size, className, ...rest }: SwitchSkeletonProps) {
  return (
    <span className={cn(SWITCH_SKELETON, className)} {...rest} aria-hidden>
      <span className={cn(SWITCH_SKELETON_TRACK, SWITCH_TRACK_SIZE[size])} />
    </span>
  )
}
