import { cn } from '#shared/cn.js'
import { AVATAR_ROOT, AVATAR_SIZE } from '../classes.js'
import { AVATAR_DEFAULTS } from '../constants.js'
import type { AvatarRootProps } from '../types.js'

/** The circle, as tall and as wide as a control of the same size. The image's alt names
 * it; with no image and no name written beside it, pass aria-label and it takes role="img". */
export function AvatarRoot({
  size = AVATAR_DEFAULTS.size,
  role,
  className,
  children,
  ...rest
}: AvatarRootProps) {
  // ARIA prohibits a name on a span with no role: axe fails it and a screen reader skips it.
  const named = Boolean(rest['aria-label']) || Boolean(rest['aria-labelledby'])

  return (
    <span
      data-size={size}
      className={cn(AVATAR_ROOT, AVATAR_SIZE[size], className)}
      role={role ?? (named ? 'img' : undefined)}
      {...rest}
    >
      {children}
    </span>
  )
}
