import { cn } from '#shared/cn.js'
import { BANNER_SKELETON, BANNER_SKELETON_BAR, BANNER_SKELETON_DISMISS } from './classes.js'
import { BANNER_DEFAULTS } from './constants.js'
import type { BannerSkeletonProps } from './types.js'

/** Holds a banner's place while it loads: the banner's own box and type step around one line
 * of nothing, and the box of the x when it is dismissible, so the page does not move. */
export function BannerSkeleton({
  dismissible = BANNER_DEFAULTS.dismissible,
  className,
  ...rest
}: BannerSkeletonProps) {
  return (
    <div className={cn(BANNER_SKELETON, className)} {...rest} aria-hidden>
      <span className={BANNER_SKELETON_BAR} />
      {dismissible ? <span className={BANNER_SKELETON_DISMISS} /> : null}
    </div>
  )
}
