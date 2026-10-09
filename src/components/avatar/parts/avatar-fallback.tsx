import { cn } from '#shared/cn.js'
import { AVATAR_FALLBACK } from '../classes.js'
import type { AvatarFallbackProps } from '../types.js'

/** Initials or an icon. Always rendered: the image is laid over it, never swapped for it.
 * Decorative by default, so the image's alt is the one name; aria-hidden={false} undoes it. */
export function AvatarFallback({
  'aria-hidden': ariaHidden = true,
  className,
  children,
  ...rest
}: AvatarFallbackProps) {
  return (
    <span aria-hidden={ariaHidden} className={cn(AVATAR_FALLBACK, className)} {...rest}>
      {children}
    </span>
  )
}
