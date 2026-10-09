import { cn } from '#shared/cn.js'
import { AVATAR_ROOT, AVATAR_SIZE } from '../classes.js'
import { AVATAR_DEFAULTS } from '../constants.js'
import type { AvatarRootProps } from '../types.js'

/** The circle, as tall and as wide as a control of the same size. The image's alt names
 * it; with no image and no name written beside it, pass role="img" and aria-label here. */
export function AvatarRoot({
  size = AVATAR_DEFAULTS.size,
  className,
  children,
  ...rest
}: AvatarRootProps) {
  return (
    <span data-size={size} className={cn(AVATAR_ROOT, AVATAR_SIZE[size], className)} {...rest}>
      {children}
    </span>
  )
}
