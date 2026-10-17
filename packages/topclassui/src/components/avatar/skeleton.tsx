import { cn } from '#shared/cn.js'
import { AVATAR_SIZE, AVATAR_SKELETON } from './classes.js'
import { AVATAR_DEFAULTS } from './constants.js'
import type { AvatarSkeletonProps } from './types.js'

/** Holds an avatar's place while it loads: the root's own box and type step around one
 * line of nothing, so it sits on the same baseline as the avatar that replaces it. */
export function AvatarSkeleton({
  size = AVATAR_DEFAULTS.size,
  className,
  ...rest
}: AvatarSkeletonProps) {
  return (
    <span className={cn(AVATAR_SKELETON, AVATAR_SIZE[size], className)} {...rest} aria-hidden>
      &nbsp;
    </span>
  )
}
