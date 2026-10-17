import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { NAVBAR_BOUNDARIES } from './boundaries.js'
import {
  NAVBAR_ACTIONS, NAVBAR_LINKS, NAVBAR_ROOT, NAVBAR_SKELETON_ACTION, NAVBAR_SKELETON_BRAND, NAVBAR_SKELETON_BRAND_BAR,
  NAVBAR_SKELETON_LINK, NAVBAR_SKELETON_LINK_BAR, NAVBAR_SKELETON_LIST, NAVBAR_TOP,
} from './classes.js'
import { NAVBAR_DEFAULTS, NAVBAR_SKELETON_DEFAULTS } from './constants.js'
import type { NavbarSkeletonProps } from './types.js'

/** Holds a navbar's place while it loads: the bar's own box, sticky or not, around a brand, links
 * and an action of nothing. A div, not a header, and no client part: --tc-sticky-top waits for the bar. */
export function NavbarSkeleton({
  sticky = NAVBAR_DEFAULTS.sticky,
  links = NAVBAR_SKELETON_DEFAULTS.links,
  className,
  ...rest
}: NavbarSkeletonProps) {
  // R-5.7-7; trunc too, or links={2.5} asks for half a link.
  const count = Math.trunc(clamp(links, NAVBAR_BOUNDARIES.skeletonLinksMin, NAVBAR_BOUNDARIES.skeletonLinksMax))
  return (
    <div className={cn(NAVBAR_ROOT, NAVBAR_TOP[sticky ? 'sticky' : 'flow'], className)} {...rest} aria-hidden>
      <span className={NAVBAR_SKELETON_BRAND}>
        <span className={NAVBAR_SKELETON_BRAND_BAR} />
      </span>
      <div className={NAVBAR_LINKS}>
        <div className={NAVBAR_SKELETON_LIST}>
          {Array.from({ length: count }, (_, link) => (
            <span key={link} className={NAVBAR_SKELETON_LINK}>
              <span className={NAVBAR_SKELETON_LINK_BAR} />
            </span>
          ))}
        </div>
      </div>
      <div className={NAVBAR_ACTIONS}>
        <span className={NAVBAR_SKELETON_ACTION} />
      </div>
    </div>
  )
}
