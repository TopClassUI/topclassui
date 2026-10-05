import { cn } from '#shared/cn.js'
import { CONTROL_HEIGHT } from '#shared/classes.js'
import { BUTTON_DEFAULTS } from './constants.js'
import type { ButtonSkeletonProps } from './types.js'

/** Width only: the height comes from CONTROL_HEIGHT, so the two cannot drift apart. */
const SKELETON_WIDTH = {
  xs: 'w-16', sm: 'w-20', md: 'w-24', lg: 'w-28', xl: 'w-32', custom: '',
} as const

export function ButtonSkeleton({
  size = BUTTON_DEFAULTS.size,
  fullWidth = BUTTON_DEFAULTS.fullWidth,
  className,
  ...rest
}: ButtonSkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'block animate-pulse rounded-control bg-surface motion-reduce:animate-none',
        CONTROL_HEIGHT[size],
        SKELETON_WIDTH[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  )
}
