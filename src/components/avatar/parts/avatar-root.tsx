import { cn } from '#shared/cn.js'
import { AVATAR_ROOT, AVATAR_SIZE } from '../classes.js'
import { AVATAR_DEFAULTS } from '../constants.js'
import type { AvatarRootProps } from '../types.js'

/** The circle, as tall and as wide as a control of the same size. No role: the image's
 * alt or the fallback's text names it. */
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
