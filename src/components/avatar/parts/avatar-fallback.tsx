import { cn } from '#shared/cn.js'
import { AVATAR_FALLBACK } from '../classes.js'
import type { AvatarFallbackProps } from '../types.js'

/** Initials or an icon. Always rendered: the image is laid over it, never swapped for it. */
export function AvatarFallback({ className, children, ...rest }: AvatarFallbackProps) {
  return (
    <span className={cn(AVATAR_FALLBACK, className)} {...rest}>
      {children}
    </span>
  )
}
